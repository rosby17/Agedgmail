// ============================================================
// binance-submit-tx
// Étape 2 du paiement Binance Pay : le client colle l'Order ID de SA
// transaction Binance (visible dans le détail de son paiement réussi côté
// app Binance). On l'attache à la commande, PUIS on tente immédiatement une
// vérification automatique via l'historique Binance Pay (findMatchingIncomingPayment) :
// si une transaction entrante correspond exactement (même orderId, montant
// attendu, reçue sur notre compte), le solde est crédité tout de suite, sans
// intervention humaine. Si l'API ne renvoie rien de concluant (endpoint
// indisponible, décalage de synchro, montant légèrement différent...), la
// commande reste 'pending' et passe par la confirmation manuelle admin
// (binance-confirm-manual) — jamais bloquant, jamais de faux positif.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { findMatchingIncomingPayment } from '../_shared/binance.ts'
import { notifyTelegram } from '../_shared/supplier-db.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { orderId, binanceOrderId } = await req.json()
    if (!orderId) return json({ error: 'orderId requis' }, 400)
    if (!binanceOrderId || !String(binanceOrderId).trim()) {
      return json({ error: 'Order ID Binance requis' }, 400)
    }
    const submittedId = String(binanceOrderId).trim()

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: order, error: orderErr } = await admin
      .from('orders').select('*').eq('id', orderId).maybeSingle()
    if (orderErr || !order) return json({ error: 'Commande introuvable' }, 404)
    if (order.status !== 'pending') return json({ error: `Commande déjà en statut "${order.status}"` }, 409)

    const { error: updErr } = await admin
      .from('orders')
      .update({ binance_tx_id: submittedId })
      .eq('id', orderId)
    if (updErr) throw updErr

    // Tentative de vérification automatique (best-effort : ne bloque jamais
    // la réponse au client, une erreur ici retombe simplement sur le fallback manuel).
    try {
      const match = await findMatchingIncomingPayment(submittedId, Number(order.expected_amount))
      if (match) {
        const credit = order.credit_amount ?? order.total_price
        await admin.rpc('credit_balance', { p_user_id: order.user_id, p_amount: credit })
           await admin.from('orders').update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
          }).eq('id', orderId)
          await notifyTelegram(
            `✅ <b>Recharge Binance Pay auto-confirmée</b>\n\n` +
            `• <b>Client :</b> ${order.buyer_email || '—'}\n` +
            `• <b>Montant crédité :</b> $${Number(credit).toFixed(2)}\n` +
            `• <b>Transaction Binance :</b> <code>${submittedId}</code>`
          )
          return json({ ok: true, autoConfirmed: true })
        }
      }
    } catch (verifyErr) {
      console.error('Vérification auto Binance Pay indisponible (fallback manuel):', (verifyErr as Error).message)
    }

    await notifyTelegram(
      `🔔 <b>Nouveau dépôt Binance Pay (À Valider)</b>\n\n` +
      `• <b>Client :</b> ${order.buyer_email || '—'}\n` +
      `• <b>Montant attendu :</b> $${Number(order.expected_amount).toFixed(2)}\n` +
      `• <b>Code de note :</b> <code>${order.note_code || '—'}</code>\n` +
      `• <b>Transaction Binance :</b> <code>${submittedId}</code>\n\n` +
      `👉 <i>Veuillez vérifier votre compte Binance et valider le dépôt depuis le panel admin.</i>`
    )
    return json({ ok: true, autoConfirmed: false })
  } catch (err) {
    console.error('Erreur binance-submit-tx:', (err as Error).message)
    return json({ error: (err as Error).message }, 500)
  }
})

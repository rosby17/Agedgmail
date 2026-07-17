// ============================================================
// nowpayments-webhook
// Remplace moneroo-webhook : reçoit le callback IPN NOWPayments, vérifie
// la signature HMAC-SHA512 (clés triées), met à jour `payments`/`orders`,
// et crédite le solde une fois le paiement confirmé/terminé.
//
// Idempotence : la commande n'est jamais recréditée deux fois (garde sur
// order.status). NOWPayments retente le callback jusqu'à recevoir 200 —
// on répond donc vite et on ne lève pas d'exception après vérification OK.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verifyIPNSignature } from '../_shared/nowpayments.ts'
import { alertAdmin, notifyTelegram } from '../_shared/supplier-db.ts'

const IPN_SECRET = Deno.env.get('NOWPAYMENTS_IPN_SECRET') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FINAL_SUCCESS = new Set(['finished', 'confirmed'])
const FINAL_FAILURE = new Set(['failed', 'expired', 'refunded'])

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  try {
    if (!IPN_SECRET) throw new Error('NOWPAYMENTS_IPN_SECRET non configurée')

    const rawBody = await req.text()
    const signature = req.headers.get('x-nowpayments-sig')
    let payload: Record<string, unknown>
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return new Response('Invalid JSON', { status: 400 })
    }

    const valid = await verifyIPNSignature(payload, signature, IPN_SECRET)
    if (!valid) {
      console.error('Signature NOWPayments invalide', { signature, orderId: payload?.order_id })
      await admin.from('supplier_logs').insert({
        supplier: 'nowpayments', action: 'webhook', level: 'error',
        message: `Signature IPN invalide pour order_id=${payload?.order_id ?? '?'}`,
        payload,
      }).then(() => {}, () => {})
      return new Response('Invalid signature', { status: 401 })
    }

    const paymentId = String(payload.payment_id ?? '')
    const orderId = payload.order_id ? String(payload.order_id) : null
    const status = String(payload.payment_status ?? '')
    if (!paymentId || !orderId) {
      return new Response(JSON.stringify({ status: 'ignored', reason: 'payment_id/order_id manquant' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Trace le dernier statut reçu (toujours, même si déjà traité — utile pour debug).
    await admin.from('payments').update({
      status, pay_amount: payload.pay_amount ?? null, ipn_raw: payload, updated_at: new Date().toISOString(),
    }).eq('payment_id', paymentId)

    const { data: order, error: orderErr } = await admin
      .from('orders').select('id, user_id, buyer_email, total_price, credit_amount, status').eq('id', orderId).single()
    if (orderErr || !order) throw new Error('Commande introuvable: ' + orderId)

    // Idempotence : commande déjà finalisée (créditée ou annulée) -> ne rien refaire.
    if (order.status === 'confirmed' || order.status === 'cancelled') {
      return new Response(JSON.stringify({ status: 'already_processed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (FINAL_SUCCESS.has(status)) {
      // credit_amount inclut le bonus de recharge éventuel ; à défaut (anciennes
      // commandes ou colonne vide) on retombe sur le montant réellement payé.
      const creditedAmount = order.credit_amount ?? order.total_price ?? 0
      const { error: updErr } = await admin.rpc('credit_balance', { p_user_id: order.user_id, p_amount: creditedAmount })
      if (updErr) throw new Error(updErr.message)

      await admin.from('orders').update({ status: 'confirmed' }).eq('id', orderId)
      console.log(`Recharge NOWPayments confirmée : +$${creditedAmount} pour user ${order.user_id} (commande ${orderId})`)
      await alertAdmin('💰 Recharge confirmée (NOWPayments)', {
        order_id: orderId, amount: `${creditedAmount} USD`,
      })
      await notifyTelegram(
        `✅ <b>Recharge NOWPayments confirmée</b>\n\n` +
        `• <b>Client :</b> ${order.buyer_email || '—'}\n` +
        `• <b>Commande :</b> <code>#${orderId}</code>\n` +
        `• <b>Montant crédité :</b> $${Number(creditedAmount).toFixed(2)}\n` +
        `• <b>Moyen :</b> ${String(payload.pay_currency || '').toUpperCase() || 'Crypto'}\n` +
        `• <b>Statut :</b> ${status}`
      )

      await admin.from('notifications').insert({
        user_id: order.user_id,
        type: 'success',
        title: 'Recharge confirmée',
        message: `Votre recharge de $${Number(creditedAmount).toFixed(2)} (NOWPayments) a été validée avec succès.`,
      })

    } else if (FINAL_FAILURE.has(status)) {
      await admin.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
    }
    // Sinon (waiting/confirming/sending/partially_paid) : on a déjà tracé le statut, rien de plus à faire.

    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Erreur nowpayments-webhook:', (err as Error).message)
    // On répond 200 uniquement après vérification de signature réussie plus haut ;
    // ici une erreur interne doit faire retenter NOWPayments -> 500.
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

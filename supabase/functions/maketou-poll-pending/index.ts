// ============================================================
// maketou-poll-pending
// Cron (service role, pas de JWT utilisateur) : vérifie toutes les commandes
// Mobile Money 'pending' auprès de Maketou et crédite automatiquement dès que
// le paiement est confirmé. Remplace la confirmation manuelle qui obligeait
// l'admin à traiter chaque dépôt Mobile Money à la main — voir maketou-verify
// (logique identique, mais réservée à l'appel authentifié du client) et
// maketou-create-checkout (créateur de la commande 'pending' + pay_id).
//
// Statuts Maketou : "waiting_payment", "completed", "abandoned", "payment_failed".
// Au-delà de TIMEOUT_MIN sans confirmation, la commande est annulée pour ne
// pas rester bloquée indéfiniment (le client peut relancer un dépôt).
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const BATCH = 25
const TIMEOUT_MIN = 45
// Une commande sans pay_id après ORPHAN_TIMEOUT_MIN n'a jamais reçu de panier
// Maketou valide (ou l'écriture du pay_id a échoué) — rien à vérifier auprès
// de Maketou, on l'annule pour ne pas la laisser bloquée pour toujours.
const ORPHAN_TIMEOUT_MIN = 15

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const summary = { checked: 0, credited: 0, cancelled: 0, still_waiting: 0, errors: 0, orphans_cancelled: 0 }

  try {
    const maketouApiKey = Deno.env.get('MAKETOU_API_KEY')
    if (!maketouApiKey) throw new Error('Maketou API credentials are not configured.')

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Nettoyage des commandes orphelines (jamais de pay_id) — pas de cart à
    // vérifier auprès de Maketou, juste annuler celles trop anciennes.
    const orphanCutoff = new Date(Date.now() - ORPHAN_TIMEOUT_MIN * 60_000).toISOString()
    const { data: orphans, error: orphanErr } = await admin
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('payment_method', 'mobile_money')
      .eq('status', 'pending')
      .is('pay_id', null)
      .lt('created_at', orphanCutoff)
      .select('id')
    if (orphanErr) console.error('maketou-poll-pending: orphan cleanup failed:', orphanErr.message)
    summary.orphans_cancelled = orphans?.length ?? 0

    const { data: orders, error } = await admin
      .from('orders')
      .select('id, user_id, credit_amount, pay_id, created_at')
      .eq('payment_method', 'mobile_money')
      .eq('status', 'pending')
      .not('pay_id', 'is', null)
      .order('created_at', { ascending: true })
      .limit(BATCH)
    if (error) throw error

    const timeoutCutoff = Date.now() - TIMEOUT_MIN * 60_000

    for (const order of orders ?? []) {
      summary.checked++
      try {
        const res = await fetch(`https://api.maketou.net/api/v1/stores/cart/${order.pay_id}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${maketouApiKey}` },
        })
        if (!res.ok) throw new Error(`Maketou API error ${res.status}`)
        const cart = await res.json()
        const cartStatus = cart.status

        if (cartStatus === 'completed') {
          // Crédit atomique via RPC (mêmes garanties que les webhooks crypto).
          const { error: creditErr } = await admin.rpc('credit_balance', {
            p_user_id: order.user_id,
            p_amount: order.credit_amount,
          })
          if (creditErr) throw creditErr

          await admin.from('orders').update({ status: 'confirmed' }).eq('id', order.id)
          await admin.from('notifications').insert({
            user_id: order.user_id,
            type: 'success',
            title: 'Dépôt confirmé',
            message: `Ton dépôt Mobile Money de $${Number(order.credit_amount).toFixed(2)} a été crédité automatiquement.`,
          }).then(() => {}, () => {})
          summary.credited++
        } else if (cartStatus === 'abandoned' || cartStatus === 'payment_failed') {
          await admin.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
          summary.cancelled++
        } else if (new Date(order.created_at).getTime() < timeoutCutoff) {
          await admin.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
          summary.cancelled++
        } else {
          summary.still_waiting++
        }
      } catch (e) {
        console.error(`maketou-poll-pending: order ${order.id} failed:`, (e as Error).message)
        summary.errors++
      }
    }

    return json({ ok: true, ...summary })
  } catch (err) {
    console.error('Erreur maketou-poll-pending:', (err as Error).message)
    return json({ error: (err as Error).message }, 500)
  }
})

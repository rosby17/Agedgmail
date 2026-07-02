// ============================================================
// cryptomus-webhook
// Reçoit le callback Cryptomus, vérifie la signature (md5 base64+clé API),
// met à jour `payments`/`orders`, et crédite le solde une fois payé.
//
// Idempotence : la commande n'est jamais recréditée deux fois (garde sur
// order.status). On répond vite en 200 une fois la signature validée.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verifyWebhookSignature } from '../_shared/cryptomus.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Statuts Cryptomus : https://doc.cryptomus.com — paid/paid_over = succès ;
// cancel/fail/wrong_amount/system_fail = échec définitif.
const FINAL_SUCCESS = new Set(['paid', 'paid_over'])
const FINAL_FAILURE = new Set(['cancel', 'fail', 'wrong_amount', 'system_fail', 'refund_fail'])

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  try {
    const rawBody = await req.text()
    let payload: Record<string, unknown>
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return new Response('Invalid JSON', { status: 400 })
    }

    if (!verifyWebhookSignature(payload)) {
      console.error('Signature Cryptomus invalide', { orderId: payload?.order_id })
      await admin.from('supplier_logs').insert({
        supplier: 'cryptomus', action: 'webhook', level: 'error',
        message: `Signature webhook invalide pour order_id=${payload?.order_id ?? '?'}`,
        payload,
      }).then(() => {}, () => {})
      return new Response('Invalid signature', { status: 401 })
    }

    const paymentId = String(payload.uuid ?? '')
    const orderId = payload.order_id ? String(payload.order_id) : null
    const status = String(payload.status ?? '')
    if (!paymentId || !orderId) {
      return new Response(JSON.stringify({ status: 'ignored', reason: 'uuid/order_id manquant' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await admin.from('payments').update({
      status, ipn_raw: payload, updated_at: new Date().toISOString(),
    }).eq('payment_id', paymentId).eq('provider', 'cryptomus')

    const { data: order, error: orderErr } = await admin
      .from('orders').select('id, user_id, total_price, credit_amount, status').eq('id', orderId).single()
    if (orderErr || !order) throw new Error('Commande introuvable: ' + orderId)

    if (order.status === 'confirmed' || order.status === 'cancelled') {
      return new Response(JSON.stringify({ status: 'already_processed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (FINAL_SUCCESS.has(status)) {
      const { data: profile, error: profileErr } = await admin
        .from('profiles').select('balance').eq('id', order.user_id).single()
      if (profileErr) throw new Error(profileErr.message)

      const creditedAmount = order.credit_amount ?? order.total_price ?? 0
      const newBalance = (profile.balance || 0) + creditedAmount
      const { error: updErr } = await admin.from('profiles').update({ balance: newBalance }).eq('id', order.user_id)
      if (updErr) throw new Error(updErr.message)

      await admin.from('orders').update({ status: 'confirmed' }).eq('id', orderId)
      console.log(`Recharge Cryptomus confirmée : +$${creditedAmount} pour user ${order.user_id} (commande ${orderId})`)

    } else if (FINAL_FAILURE.has(status)) {
      await admin.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
    }

    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Erreur cryptomus-webhook:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// ============================================================
// cryptomus-create
// Crée une commande de recharge "pending" puis une facture Cryptomus pour
// cette commande. Retourne l'URL de paiement hébergée (le client y est
// redirigé, comme pour Moneroo auparavant).
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createPayment } from '../_shared/cryptomus.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Bonus de recharge par palier — identique à nowpayments-create.
const BONUS_TIERS = [
  { min: 10000, pct: 4 },
  { min: 1000, pct: 3 },
  { min: 500, pct: 2 },
  { min: 100, pct: 1 },
]
function bonusPercentFor(amountUsd: number): number {
  return BONUS_TIERS.find((t) => amountUsd >= t.min)?.pct ?? 0
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { userId, email, amountUsd } = await req.json()

    if (!userId || !email) {
      return new Response(JSON.stringify({ error: 'userId et email requis' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!amountUsd || amountUsd <= 0) {
      return new Response(JSON.stringify({ error: 'Montant invalide' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── AUTH : le JWT doit correspondre au userId (la clé anon publique passe
    //    le gateway verify_jwt — ne jamais faire confiance au body seul). ──
    const authJwt = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    const { data: authData, error: authErr } = await authClient.auth.getUser(authJwt)
    if (authErr || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Authentification requise' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (userId !== authData.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: userId mismatch' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const bonusPct = bonusPercentFor(amountUsd)
    const creditAmount = Math.round(amountUsd * (1 + bonusPct / 100) * 100) / 100

    // 1. Créer la commande de recharge en attente
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        user_id: userId,
        buyer_email: email,
        product_id: 999,
        product_name: `Recharge Crypto (Cryptomus)${bonusPct ? ` — bonus +${bonusPct}%` : ''}`,
        quantity: 1,
        total_price: amountUsd,
        credit_amount: creditAmount,
        status: 'pending',
      })
      .select('id')
      .single()

    if (orderErr || !order) throw new Error(orderErr?.message || 'Création de commande échouée')

    // 2. Initialiser la facture chez Cryptomus
    let payment
    try {
      payment = await createPayment({
        amount: amountUsd.toFixed(2),
        currency: 'USD',
        order_id: String(order.id),
        url_callback: `${Deno.env.get('SUPABASE_URL')}/functions/v1/cryptomus-webhook`,
      })
    } catch (err) {
      await admin.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
      console.error('Cryptomus create error:', (err as Error).message)
      return new Response(JSON.stringify({ error: (err as Error).message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Enregistrer le paiement, lié à la commande
    const { error: payErr } = await admin.from('payments').insert({
      user_id: userId,
      order_id: order.id,
      provider: 'cryptomus',
      payment_id: String(payment.uuid),
      status: payment.status || 'check',
      price_amount: amountUsd,
      price_currency: 'USD',
      pay_amount: payment.payer_amount ? Number(payment.payer_amount) : null,
      pay_currency: payment.payer_currency ?? null,
      pay_address: payment.address ?? null,
      ipn_raw: payment,
    })
    if (payErr) console.error('Erreur insertion payments:', payErr.message)

    return new Response(JSON.stringify({
      orderId: order.id,
      paymentId: payment.uuid,
      payUrl: payment.url,
      status: payment.status,
      bonusPct,
      creditAmount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Erreur cryptomus-create:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

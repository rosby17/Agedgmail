// ============================================================
// nowpayments-create
// Remplace moneroo-initialize : crée une commande de recharge "pending"
// puis initialise un paiement crypto NOWPayments pour cette commande.
// Retourne au client l'adresse de dépôt + le montant exact à envoyer.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createPayment } from '../_shared/nowpayments.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { userId, email, amountUsd, payCurrency } = await req.json()

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
    if (!payCurrency) {
      return new Response(JSON.stringify({ error: 'Devise crypto (payCurrency) requise' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // 1. Créer la commande de recharge en attente (même convention que Moneroo)
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        user_id: userId,
        buyer_email: email,
        product_id: 999,
        product_name: 'Recharge Crypto (NOWPayments)',
        quantity: 1,
        total_price: amountUsd,
        status: 'pending',
      })
      .select('id')
      .single()

    if (orderErr || !order) throw new Error(orderErr?.message || 'Création de commande échouée')

    // 2. Initialiser le paiement chez NOWPayments
    let payment
    try {
      payment = await createPayment({
        price_amount: amountUsd,
        price_currency: 'usd',
        pay_currency: payCurrency,
        order_id: String(order.id),
        order_description: `Recharge solde AgedGmailYT #${order.id}`,
        ipn_callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/nowpayments-webhook`,
      })
    } catch (err) {
      await admin.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
      console.error('NOWPayments create error:', (err as Error).message)
      return new Response(JSON.stringify({ error: (err as Error).message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Enregistrer le paiement, lié à la commande
    const { error: payErr } = await admin.from('payments').insert({
      user_id: userId,
      order_id: order.id,
      payment_id: String(payment.payment_id),
      status: payment.payment_status || 'waiting',
      price_amount: payment.price_amount,
      price_currency: payment.price_currency,
      pay_amount: payment.pay_amount,
      pay_currency: payment.pay_currency,
      pay_address: payment.pay_address,
      ipn_raw: payment,
    })
    if (payErr) console.error('Erreur insertion payments:', payErr.message)

    return new Response(JSON.stringify({
      orderId: order.id,
      paymentId: payment.payment_id,
      payAddress: payment.pay_address,
      payAmount: payment.pay_amount,
      payCurrency: payment.pay_currency,
      priceAmount: payment.price_amount,
      priceCurrency: payment.price_currency,
      status: payment.payment_status,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Erreur nowpayments-create:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

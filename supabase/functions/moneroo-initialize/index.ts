import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Clé secrète Moneroo : à définir via `supabase secrets set MONEROO_SECRET_KEY=...`
// Ne jamais mettre cette clé dans le code ou dans une variable VITE_* (elle serait exposée au client).
const MONEROO_SECRET_KEY = Deno.env.get('MONEROO_SECRET_KEY') ?? ''
const RETURN_URL = 'https://agedgmail.tools-cl.com/#dashboard'
const USD_TO_XOF = 600

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!MONEROO_SECRET_KEY) throw new Error('MONEROO_SECRET_KEY non configurée')

    const { userId, email, name, phone, amountUsd, creditAmount } = await req.json()

    if (!userId || !email) {
      return new Response(JSON.stringify({ error: 'userId et email requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ── AUTH : le JWT doit correspondre au userId (ne jamais faire confiance
    //    au body seul — la clé anon publique passe le gateway verify_jwt). ──
    const authJwt = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    const { data: authData, error: authErr } = await authClient.auth.getUser(authJwt)
    if (authErr || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Authentification requise' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    if (userId !== authData.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: userId mismatch' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    if (!amountUsd || amountUsd <= 0) {
      return new Response(JSON.stringify({ error: 'Montant invalide' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const amountXof = Math.round(amountUsd * USD_TO_XOF)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Créer la commande de recharge en attente
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        buyer_email: email,
        product_id: 999,
        product_name: 'Recharge Mobile Money',
        quantity: 1,
        total_price: amountUsd,
        expected_amount: amountUsd,
        credit_amount: creditAmount || amountUsd,
        payment_method: 'mobile_money',
        status: 'pending',
      })
      .select('id')
      .single()

    if (orderErr) throw new Error(orderErr.message)

    // 2. Initialiser le paiement chez Moneroo
    const [firstName, ...rest] = String(name || 'Client').trim().split(' ')
    const moneroopayload = {
      amount: amountXof,
      currency: 'XOF',
      description: `Recharge solde AgedGmail #${order.id}`,
      return_url: RETURN_URL,
      customer: {
        email,
        first_name: firstName || 'Client',
        last_name: rest.join(' ') || '-',
        phone: phone || undefined,
      },
      metadata: {
        order_id: String(order.id),
        user_id: userId,
        amount_usd: String(amountUsd),
      },
    }

    const monerooRes = await fetch('https://api.moneroo.io/v1/payments/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MONEROO_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(moneroopayload),
    })

    const monerooData = await monerooRes.json()

    if (!monerooRes.ok || !monerooData?.data?.checkout_url) {
      console.error('Moneroo init error:', JSON.stringify(monerooData))
      await supabaseAdmin.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
      return new Response(JSON.stringify({ error: 'Impossible d\'initialiser le paiement Moneroo', details: monerooData }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Lier l'ID de paiement Moneroo à la commande
    await supabaseAdmin
      .from('orders')
      .update({ moneroo_payment_id: monerooData.data.id })
      .eq('id', order.id)

    return new Response(JSON.stringify({
      url: monerooData.data.checkout_url,
      orderId: order.id,
      amountXof,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Erreur moneroo-initialize:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

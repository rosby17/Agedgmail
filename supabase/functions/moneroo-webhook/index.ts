import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Secret de signature webhook (différent de la clé API) : visible dans
// Dashboard Moneroo > Developers > Webhooks. À définir via
// `supabase secrets set MONEROO_WEBHOOK_SECRET=...`
const MONEROO_WEBHOOK_SECRET = Deno.env.get('MONEROO_WEBHOOK_SECRET') ?? ''
const MONEROO_SECRET_KEY = Deno.env.get('MONEROO_SECRET_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function verifySignature(rawBody: string, signature: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(MONEROO_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('')
  return expected === signature
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!MONEROO_WEBHOOK_SECRET) throw new Error('MONEROO_WEBHOOK_SECRET non configurée')

    const rawBody = await req.text()
    const signature = req.headers.get('X-Moneroo-Signature') ?? ''

    if (!signature || !(await verifySignature(rawBody, signature))) {
      console.error('Signature Moneroo invalide')
      return new Response('Invalid signature', { status: 403 })
    }

    const payload = JSON.parse(rawBody)
    const { event, data } = payload

    const orderId = data?.metadata?.order_id
    const amountUsd = parseFloat(data?.metadata?.amount_usd)
    const userId = data?.metadata?.user_id

    if (!orderId || !userId) {
      // Pas une notification liée à une recharge connue : on acquitte sans traiter
      return new Response(JSON.stringify({ status: 'ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: order, error: orderFetchErr } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single()

    if (orderFetchErr || !order) throw new Error('Commande introuvable: ' + orderId)

    // Idempotence : ne jamais créditer deux fois la même commande
    if (order.status === 'confirmed' || order.status === 'cancelled') {
      return new Response(JSON.stringify({ status: 'already_processed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (event === 'payment.success') {
      // Double vérification côté serveur auprès de Moneroo avant de créditer
      const verifyRes = await fetch(`https://api.moneroo.io/v1/payments/${data.id}`, {
        headers: {
          'Authorization': `Bearer ${MONEROO_SECRET_KEY}`,
          'Accept': 'application/json',
        },
      })
      const verifyData = await verifyRes.json()
      if (verifyData?.data?.status !== 'success') {
        console.error('Statut Moneroo non confirmé à la vérification:', JSON.stringify(verifyData))
        return new Response('Payment not verified', { status: 400 })
      }

      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single()

      if (profileErr) throw new Error(profileErr.message)

      const newBalance = (profile.balance || 0) + amountUsd

      const { error: updateErr } = await supabaseAdmin
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId)

      if (updateErr) throw new Error(updateErr.message)

      await supabaseAdmin.from('orders').update({ status: 'confirmed' }).eq('id', orderId)

      console.log(`Recharge confirmée : +$${amountUsd} pour user ${userId} (commande ${orderId})`)

    } else if (event === 'payment.failed' || event === 'payment.cancelled') {
      await supabaseAdmin.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
    }

    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Erreur moneroo-webhook:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

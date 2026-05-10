import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PAYMENT_KEY = "5MNXHmPLyVLl3Ha7Fic3S4h7DuIYajarnFYVbvucNubQmYahYx6iznSUazndkr7xQi7MqtYzygYYPjTWeMC8NXMQVB5Hm9I7NK4mC42YLJKz0KNbuopEf6GqI7Fq0wrT"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function md5(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('MD5', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { sign } = body
    
    if (!sign) return new Response('No sign', { status: 400 })

    // 1. Vérification de la signature Cryptomus
    const data = { ...body }
    delete data.sign
    const jsonStr = JSON.stringify(data)
    const base64Body = btoa(jsonStr)
    const expectedSign = await md5(base64Body + PAYMENT_KEY)

    if (sign !== expectedSign) {
      console.error("Invalid signature")
      return new Response('Invalid signature', { status: 400 })
    }

    // 2. Vérifier le statut du paiement
    if (body.status === 'paid' || body.status === 'completed') {
      const amount = parseFloat(body.amount)
      const orderId = body.order_id // Format: AGEDGMAIL-userId-timestamp
      const userId = orderId.split('-')[1]

      // 3. Initialiser Supabase Admin
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // 4. Mettre à jour le solde
      const { data: profile, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single()

      if (fetchError) throw fetchError

      const newBalance = (profile.balance || 0) + amount

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId)

      if (updateError) throw updateError

      console.log(`Successfully credited $${amount} to user ${userId}`)
    }

    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error("Webhook error:", err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MERCHANT_ID = "9b48c8c6-a3cc-4fa4-b3d8-b07bc4a86736"
const PAYMENT_KEY = "5MNXHmPLyVLl3Ha7Fic3S4h7DuIYajarnFYVbvucNubQmYahYx6iznSUazndkr7xQi7MqtYzygYYPjTWeMC8NXMQVB5Hm9I7NK4mC42YLJKz0KNbuopEf6GqI7Fq0wrT"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fonction MD5 native Deno
async function md5(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('MD5', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  // Gestion CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, userId } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Montant invalide' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const orderId = `AGEDGMAIL-${userId?.slice(0,8) || 'guest'}-${Date.now()}`

    const body = {
      amount: String(Number(amount).toFixed(2)),
      currency: "USD",
      order_id: orderId,
      url_callback: "https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/webhook",
      url_return: "https://agedgmail.tools-cl.com",
      is_payment_multiple: false,
      lifetime: 3600,
    }

    const jsonStr = JSON.stringify(body)

    // Signature Cryptomus : md5(base64(json_body) + PAYMENT_KEY)
    const base64Body = btoa(jsonStr)
    const sign = await md5(base64Body + PAYMENT_KEY)

    const response = await fetch("https://api.cryptomus.com/v1/payment", {
      method: "POST",
      headers: {
        "merchant": MERCHANT_ID,
        "sign": sign,
        "Content-Type": "application/json"
      },
      body: jsonStr
    })

    const result = await response.json()
    console.log("Cryptomus response:", JSON.stringify(result))

    if (!result?.result?.url) {
      return new Response(JSON.stringify({ error: 'Pas de lien de paiement', details: result }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      url: result.result.url,
      orderId: result.result.order_id,
      uuid: result.result.uuid
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error("Erreur:", err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

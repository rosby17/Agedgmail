import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { notifyTelegram } from '../_shared/supplier-db.ts'
import { getCorsHeaders, handleCors } from '../_shared/rate-limit.ts'

serve(async (req) => {
  const corsOpts = handleCors(req)
  if (corsOpts) return corsOpts
  const corsHeaders = getCorsHeaders(req)

  try {
    const { body, user_email, display_name } = await req.json()
    
    if (!body) {
      return new Response(JSON.stringify({ error: 'Missing body' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
    }

    const nameStr = display_name ? `${display_name} (${user_email || 'Client'})` : (user_email || 'Un Client')
    
    const tgMessage = `💬 <b>Nouveau Message Support !</b>\nDe: ${nameStr}\n\n<i>"${body}"</i>\n\n👉 Connectez-vous à l'admin pour répondre.`
    
    await notifyTelegram(tgMessage)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

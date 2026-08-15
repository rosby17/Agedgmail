// ============================================================
// proxy-interest-results
// Résultats agrégés du sondage d'intérêt Proxy — admin only.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCors } from '../_shared/rate-limit.ts'
import { getAdmin } from '../_shared/supplier-db.ts'

const ADMIN_EMAIL = 'rooseveltmkr@gmail.com'

serve(async (req) => {
  const corsOpts = handleCors(req)
  if (corsOpts) return corsOpts
  const corsHeaders = getCorsHeaders(req)
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const jwt = authHeader.replace('Bearer ', '')
    if (!jwt) return json({ error: 'Authentification requise' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anon = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '')
    const { data: userData, error: userErr } = await anon.auth.getUser(jwt)
    if (userErr || !userData?.user || userData.user.email !== ADMIN_EMAIL) {
      return json({ error: 'Réservé à l’administrateur' }, 403)
    }

    const admin = getAdmin()
    const { data: rows } = await admin
      .from('proxy_interest_votes')
      .select('choice, comment, created_at')
      .order('created_at', { ascending: false })

    const counts = { yes: 0, maybe: 0, no: 0 }
    for (const r of rows || []) {
      if (r.choice in counts) counts[r.choice as keyof typeof counts]++
    }
    const comments = (rows || [])
      .filter((r) => r.comment && r.comment.trim())
      .map((r) => ({ choice: r.choice, comment: r.comment, created_at: r.created_at }))

    return json({ counts, total: (rows || []).length, comments })
  } catch (error) {
    return json({ error: (error as Error).message }, 500)
  }
})

// ============================================================
// sms-provider-health
// Vue admin (réservée) de l'état des 4 fournisseurs SMS — vrai nom, solde
// (en direct pour 5sim/onlinesim, en base pour pvapins/smscodes qui n'ont
// pas d'endpoint de solde connu), statut épuisé/désactivé. Alimente le
// dashboard "Supply SMS" (SmsSupplyAdmin.jsx) en un seul appel.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCors } from '../_shared/rate-limit.ts'
import { getAdmin } from '../_shared/supplier-db.ts'
import { get5simBalance } from '../_shared/provider-5sim.ts'
import { getOnlinesimBalance } from '../_shared/provider-onlinesim.ts'
import { getSmscodesBalance } from '../_shared/provider-smscodes.ts'
import { getPvapinsBalance } from '../_shared/provider-pvapins.ts'
import { markProviderExhausted } from '../_shared/sms-provider-selector.ts'

const ADMIN_EMAIL = 'rooseveltmkr@gmail.com'
const PROVIDERS = ['pvapins', 'smscodes', 'fivesim', 'onlinesim'] as const

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
      .from('sms_provider_status')
      .select('provider, enabled, exhausted, cached_balance, last_error, last_checked_at')
      .in('provider', PROVIDERS)

    const byProvider = new Map((rows || []).map((r) => [r.provider, r]))

    // Solde en direct pour les 4 fournisseurs (best-effort, ne bloque jamais
    // la réponse globale si l'un d'eux ne répond pas ou n'a pas encore de clé
    // configurée pour ce endpoint — auquel cas on retombe sur cached_balance).
    const [fivesimBalance, onlinesimBalance, smscodesBalance, pvapinsBalance] = await Promise.all([
      get5simBalance().catch(() => null),
      getOnlinesimBalance().catch(() => null),
      getSmscodesBalance().catch(() => null),
      getPvapinsBalance().catch(() => null),
    ])
    const liveBalance: Record<string, number | null> = {
      fivesim: fivesimBalance,
      onlinesim: onlinesimBalance,
      smscodes: smscodesBalance,
      pvapins: pvapinsBalance,
    }
    for (const [provider, balance] of Object.entries(liveBalance)) {
      if (balance !== null) markProviderExhausted(provider, { cachedBalance: balance }).catch(() => {})
    }

    const result = PROVIDERS.map((provider) => {
      const row = byProvider.get(provider)
      const live = liveBalance[provider]
      return {
        provider,
        enabled: row?.enabled ?? (provider === 'onlinesim' ? false : true),
        exhausted: row?.exhausted ?? false,
        balance: live ?? row?.cached_balance ?? null,
        hasLiveBalance: live !== null,
        last_error: row?.last_error ?? null,
        last_checked_at: row?.last_checked_at ?? null,
      }
    })

    return json({ providers: result })
  } catch (error) {
    return json({ error: error.message }, 500)
  }
})

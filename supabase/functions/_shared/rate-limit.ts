// ============================================================
// _shared/rate-limit.ts
// Helper de rate limiting pour les Edge Functions Supabase.
// Utilise la RPC check_rate_limit (table rate_limit_log) qui
// est atomique : COUNT + INSERT dans la même transaction.
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Vérifie si un user/action est dans les limites de taux.
 * @param userId  - UUID utilisateur ou hash de clé API
 * @param action  - identifiant de l'action limitée (ex: 'sms_get_number')
 * @param maxPerWindow  - nombre max d'appels autorisés par fenêtre
 * @param windowSeconds - durée de la fenêtre en secondes (défaut: 3600 = 1h)
 * @returns true si autorisé, false si quota dépassé
 */
export async function checkRateLimit(
  userId: string,
  action: string,
  maxPerWindow: number,
  windowSeconds = 3600,
): Promise<boolean> {
  // On utilise le client service_role (la table est inaccessible au rôle anon/authenticated)
  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { data, error } = await admin.rpc('check_rate_limit', {
    p_user_id: userId,
    p_action: action,
    p_max_per_window: maxPerWindow,
    p_window_seconds: windowSeconds,
  })

  if (error) {
    // En cas d'erreur DB, on laisse passer plutôt que de bloquer à tort.
    // Log mais ne pas bloquer le flux normal.
    console.error('[rate-limit] Erreur check_rate_limit:', error.message)
    return true
  }

  return data === true
}

// ── CORS helpers ──────────────────────────────────────────────────────────────

/**
 * Origines autorisées pour les Edge Functions appelées par le front.
 * Les webhooks de paiement (appelés par des serveurs externes) n'utilisent
 * pas ce helper — ils gardent '*' car CORS ne s'applique pas aux appels S2S.
 */
const ALLOWED_ORIGINS = new Set([
  'https://agedgmail.tools-cl.com',
  'https://www.agedgmail.tools-cl.com',
  'https://app.agedgmail.tools-cl.com',
  'https://agedgmail.com',
  'https://www.agedgmail.com',
  // Ajouter ici les previews Vercel si nécessaire
])

/**
 * Retourne les headers CORS restreints à l'origine de prod.
 * En dev (localhost), laisse passer pour ne pas bloquer le développement.
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? ''
  const isDev = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')
  const allowed = ALLOWED_ORIGINS.has(origin) || isDev ? origin : ''

  return {
    'Access-Control-Allow-Origin': allowed || 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }
}

/**
 * Response standard pour les pre-flight OPTIONS.
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }
  return null
}

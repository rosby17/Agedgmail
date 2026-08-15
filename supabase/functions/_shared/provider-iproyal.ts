// ============================================================
// _shared/provider-iproyal.ts
// Appels HTTP bruts vers l'API résidentielle IPRoyal (https://resi-api.
// iproyal.com/v1). Ce module ne fait QUE parler à l'API distante — marge et
// signature du devis restent centralisées dans proxy-purchase (voir
// proxy-pricing.ts), même séparation que provider-5sim.ts.
//
// Modèle confirmé (doc officielle) : un "sous-utilisateur" (sub-user) reçoit
// une allocation de GB prélevée sur le pool déjà crédité sur le compte
// principal (rechargé manuellement via leur dashboard, pas via l'API — pas
// d'endpoint "acheter des GB" côté API). On crée le sous-compte une seule
// fois par client puis on le recharge (`give-traffic`) à chaque achat,
// réutilisant les mêmes identifiants de passerelle.
// ============================================================

const BASE = 'https://resi-api.iproyal.com/v1'
const GATEWAY_HOST = 'geo.iproyal.com'
const GATEWAY_PORT_HTTP = 12321

function authHeaders(): Record<string, string> {
  const apiKey = Deno.env.get('IPROYAL_API_KEY')
  if (!apiKey) throw new Error('IPROYAL_API_KEY is not configured')
  return { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
}

function normalizeError(raw: string): Error {
  const lower = raw.toLowerCase()
  if (lower.includes('insufficient') || lower.includes('not enough') || lower.includes('balance')) {
    return new Error(`not enough balance (iproyal): ${raw}`)
  }
  return new Error(`iproyal error: ${raw}`)
}

/** Génère un couple username/password stable et suffisamment unique pour un nouveau sous-compte. */
function generateSubuserCredentials(userId: string): { username: string; password: string } {
  const suffix = userId.replace(/-/g, '').slice(0, 12)
  const password = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  return { username: `agy_${suffix}`, password }
}

interface SubuserResult {
  subuserId: string
  host: string
  port: number
  username: string
  password: string
}

/**
 * Crée le sous-compte s'il n'existe pas encore (premier achat de ce client),
 * sinon recharge le sous-compte existant. `existingHash` vient de
 * proxy_accounts.iproyal_subuser_id (null au tout premier achat).
 */
export async function createOrTopupSubuser(
  userId: string,
  gb: number,
  existingHash?: string | null,
  existingCreds?: { username: string; password: string } | null,
): Promise<SubuserResult> {
  if (existingHash) {
    const res = await fetch(`${BASE}/residential-subusers/${existingHash}/give-traffic`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ amount: gb }),
    })
    const data = await res.json().catch(async () => ({ raw: await res.text() }))
    if (!res.ok) throw normalizeError(data?.message || JSON.stringify(data))
    return {
      subuserId: existingHash,
      host: GATEWAY_HOST,
      port: GATEWAY_PORT_HTTP,
      username: existingCreds?.username || '',
      password: existingCreds?.password || '',
    }
  }

  const { username, password } = generateSubuserCredentials(userId)
  const res = await fetch(`${BASE}/residential-subusers`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ username, password, traffic: gb }),
  })
  const data = await res.json().catch(async () => ({ raw: await res.text() }))
  if (!res.ok || !data?.hash) throw normalizeError(data?.message || JSON.stringify(data))
  return {
    subuserId: String(data.hash),
    host: GATEWAY_HOST,
    port: GATEWAY_PORT_HTTP,
    username,
    password,
  }
}

// Pas d'endpoint de solde compte confirmé dans leur doc publique (seulement
// un rapport d'usage par sous-utilisateur) — contrairement à 5sim/onlinesim,
// le tableau de bord admin ne pourra afficher qu'un statut réactif tant que
// ce point n'est pas éclairci avec le compte réel du user.
export async function getIproyalBalance(): Promise<number | null> {
  return null
}

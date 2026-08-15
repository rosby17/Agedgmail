// ============================================================
// _shared/provider-onlinesim.ts
// Appels HTTP bruts vers onlinesim.io (API v1 historique, confirmée via
// openapi_docs/Onlinesim-API-UN : base https://onlinesim.io/api, auth par
// paramètre `apikey`). Comme provider-5sim.ts, ce module ne fait QUE parler
// à l'API distante et normaliser les erreurs — marge/alias/signature restent
// centralisés dans sms-get-number.ts (voir sms-pricing.ts).
//
// ⚠️ INCERTITUDE : la doc publique décrit les endpoints et leurs paramètres,
// mais PAS la forme exacte des réponses JSON (getNum/getState). Le parsing
// ci-dessous est défensif (plusieurs noms de champ possibles + extraction par
// regex en repli), sur la base du format v1 historiquement connu. À VALIDER
// avec un appel réel (getBalance d'abord, sans risque) dès que la clé
// ONLINESIM_API_KEY est configurée, avant tout achat réel.
// ============================================================

const BASE = 'https://onlinesim.io/api'

// Service "Google/YouTube" — onlinesim historiquement expose "google" comme
// service unique couvrant Google/YouTube/Gmail (à confirmer via getTariffs).
const SERVICE = 'google'

function apiKey(): string {
  const key = Deno.env.get('ONLINESIM_API_KEY')
  if (!key) throw new Error('ONLINESIM_API_KEY is not configured')
  return key
}

function normalizeError(raw: string): Error {
  const lower = raw.toLowerCase()
  if (lower.includes('wrong_key') || lower.includes('no_key')) {
    return new Error(`onlinesim auth error: ${raw}`)
  }
  if (lower.includes('low_balance') || lower.includes('no_balance')) {
    return new Error(`not enough balance (onlinesim): ${raw}`)
  }
  if (lower.includes('no_service') || lower.includes('no_number') || lower.includes('no_numbers')) {
    return new Error(`no free channels (onlinesim): ${raw}`)
  }
  return new Error(`onlinesim error: ${raw}`)
}

export async function buyOnlinesimNumber(
  iso: string,
): Promise<{ cost: number; externalId: string; number: string } | null> {
  // Pas de mapping ISO -> code pays onlinesim fiable en mémoire (le format v1
  // utilise des IDs numériques par pays, non documentés publiquement) — on
  // laisse volontairement `country` absent (comportement par défaut du compte)
  // tant que la table de correspondance n'a pas été validée avec un compte
  // réel. Cette fonction couvre donc, pour l'instant, uniquement le pays par
  // défaut du compte onlinesim — ne PAS activer en rotation multi-pays avant
  // d'avoir confirmé les IDs pays via un appel réel à getTariffs.php.
  const url = `${BASE}/getNum.php?apikey=${apiKey()}&service=${SERVICE}`
  const res = await fetch(url)
  const data = await res.json().catch(async () => ({ raw: await res.text() }))
  if (data.response === 'ERROR_NO_NUMBERS' || data.response === 'ERROR_NO_SERVICE') {
    throw normalizeError(String(data.response))
  }
  if (typeof data.response !== 'undefined' && String(data.response).startsWith('ERROR')) {
    throw normalizeError(String(data.response))
  }
  const externalId = String(data.tzid ?? data.id ?? '')
  const number = String(data.number ?? data.phone ?? '')
  if (!externalId || !number) return null
  const cost = Number(data.price ?? data.cost) || 0
  return { cost, externalId, number }
}

export async function pollOnlinesimCode(externalId: string): Promise<{ code: string | null }> {
  const url = `${BASE}/getState.php?apikey=${apiKey()}&tzid=${externalId}`
  const res = await fetch(url)
  const data = await res.json().catch(async () => ({ raw: await res.text() }))
  const entry = Array.isArray(data) ? data.find((x: any) => String(x.tzid) === externalId) : data
  if (!entry) return { code: null }
  const status = String(entry.response || '')
  if (status.toUpperCase().includes('ERROR')) throw normalizeError(status)
  // Champ code direct si présent, sinon extraction par regex depuis le texte
  // du SMS (le format v1 historique renvoie souvent le message complet plutôt
  // qu'un champ "code" isolé).
  const direct = entry.code || entry.sms
  if (direct) return { code: String(direct) }
  const text = String(entry.msg || entry.text || '')
  const match = text.match(/\b\d{3,8}\b/)
  return { code: match ? match[0] : null }
}

export async function cancelOnlinesimNumber(externalId: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/setOperationRevise.php?apikey=${apiKey()}&id=${externalId}`)
    return res.ok
  } catch {
    return false
  }
}

export async function getOnlinesimBalance(): Promise<number | null> {
  try {
    const res = await fetch(`${BASE}/getBalance.php?apikey=${apiKey()}`)
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    const balance = Number(data?.balance)
    return Number.isFinite(balance) ? balance : null
  } catch {
    return null
  }
}

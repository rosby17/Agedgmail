// ============================================================
// _shared/provider-5sim.ts
// Appels HTTP bruts vers 5sim.net (https://5sim.net/v1). Ce module ne fait
// QUE parler à l'API distante et normaliser les erreurs — la marge, l'alias
// et la signature du securityId restent centralisés dans sms-get-number.ts
// (cf. sms-pricing.ts), pour ne jamais dupliquer la logique de sécurité.
// ============================================================

const BASE = 'https://5sim.net/v1'

// Produit "Google/YouTube" chez 5sim : les deux services sont vendus sous un
// seul et même produit ("google"), il n'existe pas de slug "youtube" séparé.
const PRODUCT = 'google'

// Slugs pays 5sim confirmés dans leur doc (liste "Countries list"). ISO-2 →
// slug. Uniquement les pays déjà gérés ailleurs dans le projet (PVA_ISO_TO_NAME) ;
// à étendre au besoin. La Russie/Ukraine n'apparaissent pas dans la liste
// publique 5sim → non supportées ici.
export const FIVESIM_ISO_TO_COUNTRY: Record<string, string> = {
  US: 'usa', GB: 'england', FR: 'france', DE: 'germany', ES: 'spain', IT: 'italy',
  CA: 'canada', NL: 'netherlands', PL: 'poland', RO: 'romania', PT: 'portugal',
  SE: 'sweden', IE: 'ireland', FI: 'finland', AT: 'austria',
  KE: 'kenya', NG: 'nigeria', ZA: 'southafrica', GH: 'ghana', EG: 'egypt',
  IN: 'india', ID: 'indonesia', PH: 'philippines', PK: 'pakistan', BD: 'bangladesh',
  VN: 'vietnam', TH: 'thailand', MY: 'malaysia', BR: 'brazil', MX: 'mexico',
  AR: 'argentina', CO: 'colombia',
}

function authHeaders(): Record<string, string> {
  const apiKey = Deno.env.get('FIVESIM_API_KEY')
  if (!apiKey) throw new Error('FIVESIM_API_KEY is not configured')
  return { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' }
}

// Normalise les messages d'erreur 5sim vers les mots-clés déjà reconnus par
// sms-get-number.ts (alerte crédit) et SmsView.jsx (bascule fournisseur côté
// client) — voir la liste de mots-clés dans ces deux fichiers.
function normalizeError(raw: string): Error {
  const lower = raw.toLowerCase()
  if (lower.includes('not enough user balance') || lower.includes('not enough balance')) {
    return new Error(`not enough balance (5sim): ${raw}`)
  }
  if (lower.includes('no free phones')) {
    return new Error(`no free channels (5sim): ${raw}`)
  }
  return new Error(`5sim error: ${raw}`)
}

export async function buy5simNumber(
  iso: string,
): Promise<{ cost: number; externalId: string; number: string } | null> {
  const country = FIVESIM_ISO_TO_COUNTRY[iso]
  if (!country) return null
  const res = await fetch(`${BASE}/user/buy/activation/${country}/any/${PRODUCT}`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok || typeof data?.id === 'undefined') {
    throw normalizeError(data?.message || data?.error || JSON.stringify(data))
  }
  return { cost: Number(data.price) || 0, externalId: String(data.id), number: String(data.phone) }
}

export async function poll5simCode(externalId: string): Promise<{ code: string | null }> {
  const res = await fetch(`${BASE}/user/check/${externalId}`, { headers: authHeaders() })
  const data = await res.json()
  if (!res.ok) throw normalizeError(data?.message || JSON.stringify(data))
  const sms = Array.isArray(data.sms) && data.sms.length > 0 ? data.sms[0] : null
  return { code: sms?.code || null }
}

export async function cancel5simNumber(externalId: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/user/cancel/${externalId}`, { headers: authHeaders() })
    return res.ok
  } catch {
    return false
  }
}

export async function get5simBalance(): Promise<number | null> {
  try {
    const res = await fetch(`${BASE}/user/profile`, { headers: authHeaders() })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.balance === 'number' ? data.balance : null
  } catch {
    return null
  }
}

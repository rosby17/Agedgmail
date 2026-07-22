// ============================================================
// _shared/sms-pricing.ts
// Tarification SMS côté serveur + signature du securityId.
//
// Sécurité : le montant débité NE DOIT PAS venir du client. On recalcule le
// prix serveur (coût réel fournisseur + marge) au moment de la réservation,
// puis on le SIGNE (HMAC) dans le securityId. sms-check-code vérifie la
// signature et ne débite QUE le prix signé — le client ne peut donc pas payer
// un numéro moins cher que son vrai prix.
// ============================================================

// Marge dynamique (identique à sms-get-prices / api-v2).
const MARGIN_PCT = 0.20
const MARKUP_MIN = 0.75
const MARKUP_MAX = 1.00

/** marge = borne(20 % du coût, entre $0.75 et $1.00) ; prix = coût + marge. */
export function applyMargin(cost: number): number {
  const markup = Math.min(MARKUP_MAX, Math.max(cost * MARGIN_PCT, MARKUP_MIN))
  return Math.ceil((cost + markup) * 100) / 100
}

// Nom de pays PVAPins par ISO (get_rates.php prend un nom, pas un ISO).
export const PVA_ISO_TO_NAME: Record<string, string> = {
  US: 'USA', GB: 'UK', FR: 'France', DE: 'Germany', ES: 'Spain', IT: 'Italy',
  CA: 'Canada', NL: 'Netherlands', PL: 'Poland', RO: 'Romania', PT: 'Portugal',
  SE: 'Sweden', IE: 'Ireland', FI: 'Finland', AT: 'Austria',
  KE: 'Kenya', NG: 'Nigeria', ZA: 'South Africa', GH: 'Ghana', EG: 'Egypt',
  IN: 'India', ID: 'Indonesia', PH: 'Philippines', PK: 'Pakistan', BD: 'Bangladesh',
  VN: 'Vietnam', TH: 'Thailand', MY: 'Malaysia', BR: 'Brazil', MX: 'Mexico',
  AR: 'Argentina', CO: 'Colombia', RU: 'Russia', UA: 'Ukraine',
}

/** Variante YouTube la MOINS chère (coût + nom d'app) pour un pays PVAPins. */
export async function getPvaCheapestYt(
  iso: string,
  countryName?: string,
): Promise<{ cost: number; app: string } | null> {
  const apiKey = Deno.env.get('PVAPINS_API_KEY')
  if (!apiKey) return null
  const name = countryName || PVA_ISO_TO_NAME[iso] || iso
  try {
    const r = await fetch(`https://api.pvapins.com/user/api/get_rates.php?customer=${apiKey}&country=${encodeURIComponent(name)}`)
    const arr = await r.json()
    if (!Array.isArray(arr)) return null
    let best: { cost: number; app: string } | null = null
    for (const x of arr) {
      if (!x || !String(x.app).toLowerCase().includes('youtube')) continue
      const rate = parseFloat(x.rate)
      if (!Number.isFinite(rate) || rate <= 0) continue
      if (!best || rate < best.cost) best = { cost: rate, app: String(x.app) }
    }
    return best
  } catch {
    return null
  }
}

// ── Masquage de l'identité fournisseur côté client ─────────────────────────
// Le nom réel du fournisseur (pvapins/smscodes) ne doit JAMAIS transiter en
// clair vers le navigateur : ni dans les payloads JSON (Providers[].Name),
// ni dans le securityId, ni dans les champs stockés que le client peut lire
// (delivery_data, credentials téléchargeables). Un visiteur qui inspecte le
// réseau ou le stockage local ne doit pas pouvoir déterminer qui sont nos
// fournisseurs. Alias opaques utilisés partout côté client ; converties vers
// le vrai nom uniquement côté serveur au moment d'appeler l'API fournisseur.
export const PROVIDER_ALIAS: Record<string, string> = { pvapins: 'p1', smscodes: 'p2' }
export const ALIAS_TO_PROVIDER: Record<string, string> = { p1: 'pvapins', p2: 'smscodes' }
export const aliasForProvider = (provider: string): string => PROVIDER_ALIAS[provider] || provider
export const providerForAlias = (alias: string): string => ALIAS_TO_PROVIDER[alias] || alias

// ── Signature HMAC du securityId ───────────────────────────────────────────
// Clé = SUPABASE_SERVICE_ROLE_KEY (secrète, disponible côté serveur uniquement,
// jamais exposée au client). Séparateur '|' pour ne pas heurter les ':' du base.
async function hmacHex(msg: string): Promise<string> {
  const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Emballe le securityId de base avec le prix serveur + signature : base|prix|sig */
export async function signSecurityId(base: string, price: number): Promise<string> {
  const payload = `${base}|${price.toFixed(2)}`
  return `${payload}|${await hmacHex(payload)}`
}

/** Vérifie la signature et renvoie { base, price }. null si falsifié ou legacy. */
export async function verifySignedSecurityId(
  signed: string,
): Promise<{ base: string; price: number } | null> {
  const i2 = signed.lastIndexOf('|')
  if (i2 < 0) return null
  const sig = signed.slice(i2 + 1)
  const rest = signed.slice(0, i2)
  const i1 = rest.lastIndexOf('|')
  if (i1 < 0) return null
  const priceStr = rest.slice(i1 + 1)
  const base = rest.slice(0, i1)
  const expected = await hmacHex(`${base}|${priceStr}`)
  if (!timingSafeEqual(expected, sig)) return null
  const price = parseFloat(priceStr)
  if (!Number.isFinite(price) || price <= 0) return null
  return { base, price }
}

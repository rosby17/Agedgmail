// ============================================================
// _shared/proxy-pricing.ts
// Tarification proxy résidentiel côté serveur + signature du
// devis. Domaine différent de sms-pricing.ts : un GB est un produit continu
// (pas un numéro discret), donc pas de bornes/jitter — marge en pourcentage
// plat. Même principe de sécurité que les numéros SMS : le prix ne doit
// jamais venir du client, on le recalcule et on le signe (HMAC) au moment du
// devis, puis on vérifie la signature au moment de l'achat.
// ============================================================
import { hmacHex, timingSafeEqual } from './hmac.ts'

const DEFAULT_MARGIN_PCT = 0.30
const DEFAULT_IPFOXY_COST_PER_GB = 1.30
const DEFAULT_IPROYAL_COST_PER_GB = 5.31

export function proxyCostPerGb(): number {
  const provider = (Deno.env.get('PROXY_PROVIDER') || 'ipfoxy').toLowerCase()
  const fallback = provider === 'iproyal' ? DEFAULT_IPROYAL_COST_PER_GB : DEFAULT_IPFOXY_COST_PER_GB
  const configured = Number(Deno.env.get(`${provider.toUpperCase()}_COST_PER_GB`))
  return Number.isFinite(configured) && configured > 0 ? configured : fallback
}

export function applyProxyMargin(costPerGb: number = proxyCostPerGb()): number {
  const configuredMargin = Number(Deno.env.get('PROXY_MARGIN_PCT'))
  const margin = Number.isFinite(configuredMargin) && configuredMargin >= 0
    ? configuredMargin / 100
    : DEFAULT_MARGIN_PCT
  return Math.ceil(costPerGb * (1 + margin) * 100) / 100
}

// Le ciblage géographique se fait dans le nom d'utilisateur de connexion,
// pas au moment de l'achat du trafic.
export interface ProxyPlan { id: string; gb: number; label: string }
export const PROXY_PLANS: ProxyPlan[] = [
  { id: 'starter', gb: 2, label: '2 GB' },
  { id: 'standard', gb: 10, label: '10 GB' },
  { id: 'advanced', gb: 50, label: '50 GB' },
]

/** Emballe le devis (planId + gb) avec le prix serveur + signature : planId:gb|prix|sig */
export async function signProxyQuote(planId: string, gb: number, price: number): Promise<string> {
  const payload = `${planId}:${gb}|${price.toFixed(2)}`
  return `${payload}|${await hmacHex(payload)}`
}

/** Vérifie la signature et renvoie { planId, gb, price }. null si falsifié/expiré. */
export async function verifyProxyQuote(
  signed: string,
): Promise<{ planId: string; gb: number; price: number } | null> {
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
  const [planId, gbStr] = base.split(':')
  const gb = parseFloat(gbStr)
  if (!planId || !Number.isFinite(gb) || gb <= 0) return null
  return { planId, gb, price }
}

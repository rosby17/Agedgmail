// ============================================================
// _shared/proxy-pricing.ts
// Tarification proxy résidentiel (IPRoyal) côté serveur + signature du
// devis. Domaine différent de sms-pricing.ts : un GB est un produit continu
// (pas un numéro discret), donc pas de bornes/jitter — marge en pourcentage
// plat. Même principe de sécurité que les numéros SMS : le prix ne doit
// jamais venir du client, on le recalcule et on le signe (HMAC) au moment du
// devis, puis on vérifie la signature au moment de l'achat.
// ============================================================
import { hmacHex, timingSafeEqual } from './hmac.ts'

const MARGIN_PCT = 0.30

// Coût de référence ($/GB) : celui du palier "Starter" (2GB) chez IPRoyal —
// c'est le palier par lequel on démarre réellement (test + premier crédit),
// donc la marge doit être calculée sur ce vrai coût de départ, pas sur un
// palier de gros qu'on n'a pas encore atteint. À remonter à $4.69 (Standard)
// ou $4.37 (Advanced) le jour où le compte est rechargé à ce volume-là.
const COST_PER_GB = 5.31

export function applyProxyMargin(costPerGb: number = COST_PER_GB): number {
  return Math.ceil(costPerGb * (1 + MARGIN_PCT) * 100) / 100
}

// Paliers revendus au client, calqués sur les paliers IPRoyal eux-mêmes
// (Starter/Standard/Advanced) pour rester simple à réconcilier avec le coût
// réel — pas de tarification par pays, le ciblage géographique se fait côté
// connexion (username_country-xx), pas à l'achat (confirmé dans leur doc).
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

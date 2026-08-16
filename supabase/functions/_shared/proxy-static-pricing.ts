import { hmacHex, timingSafeEqual } from './hmac.ts'

export interface StaticQuote {
  areaId: string
  days: number
  quantity: number
  supplierCost: number
  salePrice: number
  expiresAt: number
}

export function staticSalePrice(cost: number): number {
  const configured = Number(Deno.env.get('IPFOXY_STATIC_MARGIN_PCT'))
  const margin = Number.isFinite(configured) && configured >= 0 ? configured / 100 : 1.2
  return Math.ceil(cost * (1 + margin) * 100) / 100
}

export async function signStaticQuote(input: Omit<StaticQuote, 'expiresAt'>): Promise<string> {
  const payload: StaticQuote = { ...input, expiresAt: Date.now() + 10 * 60_000 }
  const encoded = btoa(JSON.stringify(payload))
  return `${encoded}.${await hmacHex(encoded)}`
}

export async function verifyStaticQuote(value: string): Promise<StaticQuote | null> {
  const separator = value.lastIndexOf('.')
  if (separator < 1) return null
  const encoded = value.slice(0, separator)
  const signature = value.slice(separator + 1)
  if (!timingSafeEqual(await hmacHex(encoded), signature)) return null
  try {
    const quote = JSON.parse(atob(encoded)) as StaticQuote
    if (!quote.areaId || ![30, 90, 180, 360].includes(quote.days) || quote.quantity < 1 || quote.quantity > 50 || quote.expiresAt < Date.now()) return null
    if (![quote.supplierCost, quote.salePrice].every((n) => Number.isFinite(n) && n > 0)) return null
    return quote
  } catch {
    return null
  }
}

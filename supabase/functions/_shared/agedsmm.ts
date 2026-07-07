// ============================================================
// Adaptateur AgedSMM — API v2 (https://agedsmm.com/api/v2)
//
// Même contrat que SMMSHIBA / YTSeller (format "Perfect Panel") :
//   action=balance               -> { "balance":0, "currency":"USD" }
//   action=products              -> [ { product, name, category, rate,
//                                       min, max, type, status, inventory,
//                                       require }, ... ]
//   action=add_product_order     -> { "order": 99999 }
//   action=product_order_status  -> { "charge":7.5, "status":"Completed",
//                                      "remains":0, "result":"..." }
//   action=result_product        -> { "result": ["compte1", "compte2", ...] }
//
// Toutes les requêtes se font CÔTÉ SERVEUR uniquement. La clé vient du
// secret `AGEDSMM_API_KEY`, jamais exposée au client, jamais committée.
// ============================================================

const AGEDSMM_URL = Deno.env.get('AGEDSMM_API_URL') ?? 'https://agedsmm.com/api/v2'
const AGEDSMM_API_KEY = Deno.env.get('AGEDSMM_API_KEY') ?? ''

export interface AgedSmmProduct {
  product: number
  name: string
  category: string
  rate: number
  min: number
  max: number
  type: string
  status: string
  inventory: number
  require?: unknown
}

export interface AgedSmmOrderStatus {
  charge: number
  status: string
  remains: number
  currency: string
}

/** Appel bas niveau AgedSMM, form-urlencoded, avec retries réseau. */
export async function agedSmmCall(
  action: string,
  params: Record<string, string | number> = {},
  { retries = 2 }: { retries?: number } = {},
): Promise<any> {
  if (!AGEDSMM_API_KEY) throw new Error('AGEDSMM_API_KEY non configurée')

  const body = new URLSearchParams()
  body.set('key', AGEDSMM_API_KEY)
  body.set('action', action)
  for (const [k, v] of Object.entries(params)) body.set(k, String(v))

  let lastErr: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(AGEDSMM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })

      const text = await res.text()
      if (res.status >= 500) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`)

      let json: any
      try {
        json = JSON.parse(text)
      } catch {
        throw new Error(`Réponse AgedSMM non-JSON (${action}): ${text.slice(0, 300)}`)
      }

      if (json && typeof json === 'object' && 'error' in json && json.error) {
        const err: any = new Error(`AgedSMM error (${action}): ${json.error}`)
        err.supplierError = json.error
        throw err
      }

      return json
    } catch (err) {
      lastErr = err
      if ((err as any)?.supplierError) throw err
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)))
        continue
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
}

export async function getBalance(): Promise<{ balance: number; currency: string }> {
  const j = await agedSmmCall('balance')
  return { balance: parseFloat(j?.balance ?? 0) || 0, currency: j?.currency ?? 'USD' }
}

export async function getProducts(): Promise<AgedSmmProduct[]> {
  const j = await agedSmmCall('products')
  return Array.isArray(j) ? j : []
}

export async function addProductOrder(
  productId: string | number,
  quantity: number,
  require?: string,
): Promise<string> {
  const params: Record<string, string | number> = { product: productId, quantity }
  if (require) params.require = require
  const j = await agedSmmCall('add_product_order', params, { retries: 1 })
  const orderId = j?.order
  if (orderId === undefined || orderId === null) {
    throw new Error(`add_product_order : pas d'ID de commande dans la réponse (${JSON.stringify(j).slice(0, 200)})`)
  }
  return String(orderId)
}

export async function getOrderStatus(orderId: string): Promise<AgedSmmOrderStatus> {
  const j = await agedSmmCall('product_order_status', { order: orderId })
  return {
    charge: parseFloat(j?.charge ?? 0) || 0,
    status: String(j?.status ?? 'Pending'),
    remains: parseInt(j?.remains ?? 0, 10) || 0,
    currency: j?.currency ?? 'USD',
  }
}

export async function getResult(orderId: string): Promise<string[]> {
  const j = await agedSmmCall('result_product', { order: orderId })
  const result = j?.result
  if (Array.isArray(result)) return result.map((r: unknown) => String(r))
  if (typeof result === 'string' && result.length) return result.split('\n')
  return []
}

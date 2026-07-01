// ============================================================
// Adaptateur YTSeller — API v2 (https://ytseller.com/api/v2)
//
// Toutes les requêtes se font CÔTÉ SERVEUR uniquement (Edge Function
// Deno). La clé API vient du secret `YTSELLER_API_KEY`, jamais exposée
// au client, jamais committée.
//
// Contrat vérifié (application/x-www-form-urlencoded, réponse JSON) :
//   action=balance               -> { "balance":"68.6868", "currency":"USD" }
//   action=products              -> [ { product, name, category, rate,
//                                       min, max, type, status, inventory,
//                                       require, description }, ... ]
//   action=add_product_order     -> { "order": 99999 }
//   action=product_order_status  -> { "charge":"33.00", "status":"Completed",
//                                      "remains":0, "currency":"USD" }
//   action=result_product        -> { "result": ["compte1", "compte2", ...] }
//
// ⚠️ Si le fournisseur change un nom de champ, tout est centralisé ici.
// ============================================================

const YTSELLER_URL = Deno.env.get('YTSELLER_API_URL') ?? 'https://ytseller.com/api/v2'
const YTSELLER_API_KEY = Deno.env.get('YTSELLER_API_KEY') ?? ''

// Statuts renvoyés par product_order_status
export type SupplierStatus =
  | 'Pending' | 'Processing' | 'In progress'
  | 'Completed' | 'Partial' | 'Canceled'

export interface YtProduct {
  product: number
  name: string
  category: string
  rate: number
  min: number
  max: number
  type: string
  status: string          // "In stock" / "Out of stock"
  inventory: number
  require: unknown
  description: string
}

export interface YtOrderStatus {
  charge: number
  status: string
  remains: number
  currency: string
}

/**
 * Appel bas niveau à l'API YTSeller, form-urlencoded, avec retries réseau
 * (backoff progressif) sur les erreurs transitoires (réseau / 5xx).
 */
export async function ytsellerCall(
  action: string,
  params: Record<string, string | number> = {},
  { retries = 2 }: { retries?: number } = {},
): Promise<any> {
  if (!YTSELLER_API_KEY) throw new Error('YTSELLER_API_KEY non configurée')

  const body = new URLSearchParams()
  body.set('key', YTSELLER_API_KEY)
  body.set('action', action)
  for (const [k, v] of Object.entries(params)) body.set(k, String(v))

  let lastErr: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(YTSELLER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })

      const text = await res.text()

      // 5xx -> transitoire : on retente
      if (res.status >= 500) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`)

      let json: any
      try {
        json = JSON.parse(text)
      } catch {
        throw new Error(`Réponse YTSeller non-JSON (${action}): ${text.slice(0, 300)}`)
      }

      // L'API panel renvoie {"error":"..."} en cas de problème métier
      if (json && typeof json === 'object' && 'error' in json && json.error) {
        // Erreur métier : inutile de retenter, on remonte directement
        const err: any = new Error(`YTSeller error (${action}): ${json.error}`)
        err.supplierError = json.error
        throw err
      }

      return json
    } catch (err) {
      lastErr = err
      // Erreur métier remontée par l'API : pas de retry
      if ((err as any)?.supplierError) throw err
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)))
        continue
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
}

/** Solde fournisseur (parse défensif : l'API peut renvoyer une string). */
export async function getBalance(): Promise<{ balance: number; currency: string }> {
  const j = await ytsellerCall('balance')
  return { balance: parseFloat(j?.balance ?? 0) || 0, currency: j?.currency ?? 'USD' }
}

/** Catalogue fournisseur complet. */
export async function getProducts(): Promise<YtProduct[]> {
  const j = await ytsellerCall('products')
  return Array.isArray(j) ? j : []
}

/** Passe une commande fournisseur. Retourne l'ID de commande YTSeller. */
export async function addProductOrder(
  productId: string | number,
  quantity: number,
  require?: string,
): Promise<string> {
  const params: Record<string, string | number> = { product: productId, quantity }
  if (require) params.require = require
  const j = await ytsellerCall('add_product_order', params, { retries: 1 })
  const orderId = j?.order
  if (orderId === undefined || orderId === null) {
    throw new Error(`add_product_order : pas d'ID de commande dans la réponse (${JSON.stringify(j).slice(0, 200)})`)
  }
  return String(orderId)
}

/** Statut d'une commande fournisseur. */
export async function getOrderStatus(orderId: string): Promise<YtOrderStatus> {
  const j = await ytsellerCall('product_order_status', { order: orderId })
  return {
    charge: parseFloat(j?.charge ?? 0) || 0,
    status: String(j?.status ?? 'Pending'),
    remains: parseInt(j?.remains ?? 0, 10) || 0,
    currency: j?.currency ?? 'USD',
  }
}

/**
 * Récupère le contenu livré (tableau de lignes de comptes).
 * Renvoie toujours un tableau de strings.
 */
export async function getResult(orderId: string): Promise<string[]> {
  const j = await ytsellerCall('result_product', { order: orderId })
  const result = j?.result
  if (Array.isArray(result)) return result.map((r: unknown) => String(r))
  if (typeof result === 'string' && result.length) return result.split('\n')
  return []
}

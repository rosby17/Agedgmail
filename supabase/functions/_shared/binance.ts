// ============================================================
// Helpers d'appel à l'API Binance (lecture seule) — signature HMAC-SHA256
// requise sur les endpoints privés (timestamp + query string signés avec
// la clé secrète, envoyés en query param `signature`).
// ============================================================
const API_BASE = 'https://api.binance.com'

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Appel signé générique à un endpoint privé Binance (GET). */
export async function binanceSignedGet(path: string, params: Record<string, string | number> = {}) {
  const apiKey = Deno.env.get('BINANCE_API_KEY') ?? ''
  const apiSecret = Deno.env.get('BINANCE_API_SECRET') ?? ''
  if (!apiKey || !apiSecret) throw new Error('BINANCE_API_KEY / BINANCE_API_SECRET non configurés')

  const allParams: Record<string, string> = { timestamp: String(Date.now()), recvWindow: '10000' }
  for (const [k, v] of Object.entries(params)) allParams[k] = String(v)
  const query = new URLSearchParams(allParams)
  const signature = await hmacSha256Hex(apiSecret, query.toString())
  query.set('signature', signature)

  const res = await fetch(`${API_BASE}${path}?${query.toString()}`, {
    headers: { 'X-MBX-APIKEY': apiKey },
  })
  const text = await res.text()
  let json: unknown
  try { json = JSON.parse(text) } catch { json = text }
  if (!res.ok) {
    const msg = (json as { msg?: string })?.msg || text
    throw new Error(`Binance API ${res.status}: ${msg}`)
  }
  return json
}

/** Historique des transactions Binance Pay (envoyées/reçues) — endpoint
 * accessible avec une clé "Enable Reading" standard (pas besoin de compte
 * marchand), documenté sous "Get Pay Trade History (USER_DATA)". */
export async function getPayTradeHistory(startTime?: number, endTime?: number, limit = 100) {
  const params: Record<string, string | number> = { limit }
  if (startTime) params.startTime = startTime
  if (endTime) params.endTime = endTime
  const data = await binanceSignedGet('/sapi/v1/pay/transactions', params) as { data?: unknown[] }
  return data?.data ?? []
}

export type PayTx = {
  orderId: string
  orderType: string
  amount: string
  currency: string
  transactionTime: number
  receiverInfo?: { binanceId?: number }
  payerInfo?: { binanceId?: number; name?: string }
}

/**
 * Cherche, dans l'historique Binance Pay des ~48 dernières heures, une
 * transaction ENTRANTE (montant positif, reçue sur notre propre compte —
 * receiverInfo.binanceId === notre uid) dont l'orderId correspond exactement
 * à celui soumis par le client, et dont le montant correspond au montant
 * attendu de la commande (tolérance de 1 centime pour l'arrondi).
 * L'orderId est le seul champ fiable à 100% (toujours présent) ; la note
 * Binance Pay, elle, est souvent vide selon comment le client envoie.
 */
export async function findMatchingIncomingPayment(submittedOrderId: string, expectedAmount: number) {
  const ourUid = Number(Deno.env.get('BINANCE_UID') ?? '0')
  const since = Date.now() - 48 * 60 * 60 * 1000
  // 100 = maximum autorisé par l'endpoint Binance ; au-delà, l'API renvoie
  // une erreur 400 trompeuse ("Mandatory parameter 'limit' ... malformed")
  // qui ne mentionne jamais qu'il s'agit d'un dépassement de plafond.
  const txs = await getPayTradeHistory(since, Date.now(), 100) as PayTx[]

  return txs.find((tx) => {
    if (String(tx.orderId) !== String(submittedOrderId)) return false
    const amount = Number(tx.amount)
    if (!(amount > 0)) return false // entrant seulement (positif de notre point de vue)
    if (ourUid && tx.receiverInfo?.binanceId && tx.receiverInfo.binanceId !== ourUid) return false
    return Math.abs(amount - expectedAmount) < 0.01
  }) ?? null
}

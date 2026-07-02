// ============================================================
// Helpers NOWPayments — création de paiement, statut, vérification IPN.
// Clé API et secret IPN lus depuis les secrets Supabase (jamais exposés
// au client, jamais commités).
// ============================================================
const API_URL = Deno.env.get('NOWPAYMENTS_API_URL') || 'https://api.nowpayments.io/v1'
const API_KEY = Deno.env.get('NOWPAYMENTS_API_KEY') ?? ''

export interface NowPayment {
  payment_id: string
  payment_status: string
  pay_address: string
  price_amount: number
  price_currency: string
  pay_amount: number
  pay_currency: string
  order_id: string
  [key: string]: unknown
}

/** Crée un paiement NOWPayments. Lève une erreur si l'API refuse. */
export async function createPayment(params: {
  price_amount: number
  price_currency: string
  pay_currency: string
  order_id: string
  order_description?: string
  ipn_callback_url: string
}): Promise<NowPayment> {
  if (!API_KEY) throw new Error('NOWPAYMENTS_API_KEY non configurée')
  const res = await fetch(`${API_URL}/payment`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || `NOWPayments a refusé la création (HTTP ${res.status})`)
  return data as NowPayment
}

/** Récupère le statut courant d'un paiement. */
export async function getPaymentStatus(paymentId: string): Promise<NowPayment> {
  if (!API_KEY) throw new Error('NOWPAYMENTS_API_KEY non configurée')
  const res = await fetch(`${API_URL}/payment/${paymentId}`, {
    headers: { 'x-api-key': API_KEY },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || `Échec de lecture du statut (HTTP ${res.status})`)
  return data as NowPayment
}

/** Trie récursivement les clés d'un objet — requis par l'algorithme de signature IPN NOWPayments. */
function sortObject(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortObject)
  if (obj && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
      sorted[key] = sortObject((obj as Record<string, unknown>)[key])
    }
    return sorted
  }
  return obj
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Comparaison en temps constant pour éviter les attaques par timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/**
 * Vérifie la signature HMAC-SHA512 d'un callback IPN NOWPayments.
 * L'algorithme exact : trier les clés du JSON par ordre alphabétique
 * (récursivement), sérialiser sans espaces, puis HMAC-SHA512 hex avec le
 * secret IPN, et comparer au header x-nowpayments-sig.
 */
export async function verifyIPNSignature(
  payload: unknown,
  signatureHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader || !secret) return false
  const sortedPayload = JSON.stringify(sortObject(payload))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(sortedPayload))
  const expected = toHex(mac)
  return timingSafeEqual(expected, signatureHeader)
}

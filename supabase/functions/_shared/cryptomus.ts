// ============================================================
// Helpers Cryptomus — création de paiement (invoice) et vérification de
// signature webhook. Merchant ID et clé API lus depuis les secrets Supabase
// (jamais exposés au client, jamais commités).
//
// Signature Cryptomus : md5( base64(JSON du payload) + clé API ), en hex.
// Deno n'a pas MD5 en natif (Web Crypto ne le supporte pas) -> implémentation
// pure JS autonome ci-dessous (algorithme MD5 standard, domaine public).
// ============================================================
const MERCHANT_ID = Deno.env.get('CRYPTOMUS_MERCHANT_ID') ?? ''
const API_KEY = Deno.env.get('CRYPTOMUS_API_KEY') ?? ''
const API_URL = 'https://api.cryptomus.com/v1'

// ---------- MD5 (implémentation pure JS, domaine public) ----------
function md5(input: string): string {
  function rotl(x: number, c: number) { return (x << c) | (x >>> (32 - c)) }
  function toHexLE(n: number) {
    let s = ''
    for (let i = 0; i < 4; i++) s += ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, '0')
    return s
  }
  const K = new Array(64)
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32)
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ]

  const bytes = new TextEncoder().encode(input)
  const origLenBits = bytes.length * 8
  let paddedLen = bytes.length + 1
  while (paddedLen % 64 !== 56) paddedLen++
  const buf = new Uint8Array(paddedLen + 8)
  buf.set(bytes)
  buf[bytes.length] = 0x80
  const view = new DataView(buf.buffer)
  view.setUint32(paddedLen, origLenBits >>> 0, true)
  view.setUint32(paddedLen + 4, Math.floor(origLenBits / 2 ** 32), true)

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476

  for (let chunk = 0; chunk < buf.length; chunk += 64) {
    const M = new Array(16)
    for (let i = 0; i < 16; i++) M[i] = view.getUint32(chunk + i * 4, true)
    let [A, B, C, D] = [a0, b0, c0, d0]
    for (let i = 0; i < 64; i++) {
      let F, g
      if (i < 16) { F = (B & C) | (~B & D); g = i }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16 }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16 }
      else { F = C ^ (B | ~D); g = (7 * i) % 16 }
      F = (F + A + K[i] + M[g]) >>> 0
      A = D; D = C; C = B
      B = (B + rotl(F, S[i])) >>> 0
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0
  }
  return toHexLE(a0) + toHexLE(b0) + toHexLE(c0) + toHexLE(d0)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function base64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

function sign(payload: unknown): string {
  return md5(base64(JSON.stringify(payload)) + API_KEY)
}

export interface CryptomusPayment {
  uuid: string
  order_id: string
  amount: string
  currency: string
  url: string
  address?: string
  payer_amount?: string
  payer_currency?: string
  status: string
  [key: string]: unknown
}

/** Crée une facture (invoice) Cryptomus. Retourne l'URL de paiement hébergée. */
export async function createPayment(params: {
  amount: string
  currency: string
  order_id: string
  url_callback: string
}): Promise<CryptomusPayment> {
  if (!MERCHANT_ID || !API_KEY) throw new Error('CRYPTOMUS_MERCHANT_ID / CRYPTOMUS_API_KEY non configurées')
  const body = { ...params }
  const res = await fetch(`${API_URL}/payment`, {
    method: 'POST',
    headers: {
      merchant: MERCHANT_ID,
      sign: sign(body),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok || data?.state !== 0) throw new Error(data?.message || JSON.stringify(data?.errors) || `Cryptomus a refusé la création (HTTP ${res.status})`)
  return data.result as CryptomusPayment
}

/**
 * Vérifie la signature d'un callback webhook Cryptomus.
 * Le payload reçu contient un champ "sign" ; on le retire, on resérialise le
 * reste, et on recalcule md5(base64(json) + clé API) pour comparer.
 */
export function verifyWebhookSignature(payload: Record<string, unknown>): boolean {
  if (!API_KEY) return false
  const receivedSign = String(payload.sign ?? '')
  if (!receivedSign) return false
  const { sign: _omit, ...rest } = payload
  const expected = sign(rest)
  return timingSafeEqual(expected, receivedSign)
}

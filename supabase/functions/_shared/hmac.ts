// ============================================================
// _shared/hmac.ts — HMAC-SHA256 générique, utilisé pour signer les prix
// serveur (SMS et Proxy) afin que le client ne puisse jamais payer un
// montant différent de celui calculé côté serveur. Clé = SUPABASE_SERVICE_
// ROLE_KEY (secrète, jamais exposée au client).
// ============================================================

export async function hmacHex(msg: string): Promise<string> {
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

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

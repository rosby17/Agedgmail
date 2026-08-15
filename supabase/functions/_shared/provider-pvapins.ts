// ============================================================
// _shared/provider-pvapins.ts
// Solde PVAPins via leur nouvelle API REST v1 (GET /api/v1/account), qui
// utilise un format de clé différent (sk_live_...) de l'ancienne clé legacy
// `customer=` (PVAPINS_API_KEY) déjà utilisée pour acheter/interroger les
// numéros ailleurs dans le code — d'où une variable d'env séparée. Le reste
// de la logique PVAPins (achat, poll, annulation) continue d'utiliser
// l'ancienne API, non migrée dans cette passe.
// ============================================================

export async function getPvapinsBalance(): Promise<number | null> {
  const apiKey = Deno.env.get('PVAPINS_REST_API_KEY')
  if (!apiKey) return null
  try {
    const res = await fetch('https://api.pvapins.com/api/v1/account', {
      headers: { 'X-API-Key': apiKey },
    })
    if (!res.ok) return null
    const data = await res.json()
    const balance = Number(data?.balance ?? data?.Balance)
    return Number.isFinite(balance) ? balance : null
  } catch {
    return null
  }
}

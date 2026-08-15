// ============================================================
// _shared/provider-pvapins.ts
// Solde PVAPins via l'API legacy get_balance.php, confirmée dans leur doc et
// disponible avec la même clé `customer=` (PVAPINS_API_KEY) déjà utilisée
// partout ailleurs pour acheter/interroger les numéros — pas besoin de la
// clé REST v1 (sk_live_...) juste pour le solde.
// ============================================================

export async function getPvapinsBalance(): Promise<number | null> {
  const apiKey = Deno.env.get('PVAPINS_API_KEY')
  if (!apiKey) return null
  try {
    const res = await fetch(`https://api.pvapins.com/user/api/get_balance.php?customer=${apiKey}`)
    if (!res.ok) return null
    const text = await res.text()
    let raw: any = text
    try { raw = JSON.parse(text) } catch { /* réponse texte brut, gérée ci-dessous */ }
    const balance = Number(
      typeof raw === 'object' ? (raw?.balance ?? raw?.Balance ?? raw?.credit) : text.trim()
    )
    return Number.isFinite(balance) ? balance : null
  } catch {
    return null
  }
}

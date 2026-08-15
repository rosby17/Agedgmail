// ============================================================
// _shared/provider-smscodes.ts
// Pour l'instant, seule le solde est extrait dans un module dédié — le reste
// de la logique SMSCodes (achat, poll) vit encore directement dans
// sms-get-number/sms-check-code/sms-get-prices (pas de refactor plus large
// dans cette passe). Confirmé via leur doc officielle : GET /GetBalance.
// ============================================================

export async function getSmscodesBalance(): Promise<number | null> {
  const apiKey = Deno.env.get('SMSCODES_API_KEY')
  if (!apiKey) return null
  try {
    const res = await fetch(`https://code.smscodes.io/api/sms/GetBalance?key=${apiKey}`)
    if (!res.ok) return null
    const data = await res.json()
    const balance = Number(data?.Balance)
    return Number.isFinite(balance) ? balance : null
  } catch {
    return null
  }
}

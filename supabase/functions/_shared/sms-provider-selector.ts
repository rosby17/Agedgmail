// ============================================================
// _shared/sms-provider-selector.ts
// Suivi d'épuisement des fournisseurs SMS historiques (pvapins/smscodes),
// pour que sms-get-prices puisse les reléguer derrière les nouveaux
// fournisseurs (5sim/onlinesim) une fois leur crédit consommé — sans les
// retirer du code, ils reprennent la priorité automatiquement si on les
// recrédite (statut "épuisé" réévalué après STALE_AFTER_MS).
// ============================================================
import { getAdmin } from './supplier-db.ts'

const STALE_AFTER_MS = 30 * 60 * 1000 // 30 min

/** true seulement si le statut "épuisé" est encore frais ; sinon on retente en live. */
export async function isProviderExhausted(provider: string): Promise<boolean> {
  try {
    const admin = getAdmin()
    const { data } = await admin
      .from('sms_provider_status')
      .select('exhausted, last_checked_at')
      .eq('provider', provider)
      .maybeSingle()
    if (!data?.exhausted) return false
    const age = Date.now() - new Date(data.last_checked_at).getTime()
    return age < STALE_AFTER_MS
  } catch {
    return false // en cas de doute, on ne bloque pas le fournisseur
  }
}

export async function markProviderExhausted(
  provider: string,
  opts: { exhausted: boolean; cachedBalance?: number | null; lastError?: string },
): Promise<void> {
  try {
    const admin = getAdmin()
    await admin.from('sms_provider_status').upsert({
      provider,
      exhausted: opts.exhausted,
      cached_balance: opts.cachedBalance ?? null,
      last_error: opts.lastError ?? null,
      last_checked_at: new Date().toISOString(),
    })
  } catch {
    // Best-effort : une écriture ratée ne doit jamais faire échouer une requête client.
  }
}

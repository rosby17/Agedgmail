// ============================================================
// Helpers partagés côté serveur : client Supabase admin + journal
// fournisseur + alerte email admin.
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ADMIN_ALERT_EMAIL = 'rooseveltmkr@gmail.com'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/** Client Supabase avec SERVICE_ROLE_KEY (contourne la RLS). */
export function getAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )
}

/** Écrit une entrée dans supplier_logs (ne jette jamais). */
export async function logSupplier(
  admin: ReturnType<typeof getAdmin>,
  entry: {
    order_id?: string | null
    action: string
    level?: 'info' | 'error'
    message: string
    payload?: unknown
    supplier?: string
  },
) {
  try {
    await admin.from('supplier_logs').insert({
      order_id: entry.order_id ?? null,
      supplier: entry.supplier ?? 'ytseller',
      action: entry.action,
      level: entry.level ?? 'info',
      message: entry.message,
      payload: entry.payload ?? null,
    })
  } catch (e) {
    console.error('logSupplier a échoué:', (e as Error).message)
  }
}

/**
 * Recalcule, pour un produit donné, quel mapping fournisseur (ytseller,
 * smmshiba, ...) a le coût le plus bas parmi ceux actifs/en stock, applique
 * sa marge, met à jour products.price/supplier_stock en conséquence, et
 * marque ce mapping comme actif (les autres passent inactifs). Permet à un
 * même produit d'être approvisionné par plusieurs fournisseurs sans qu'ils
 * ne s'écrasent mutuellement — on garde toujours le moins cher en vitrine.
 */
export async function resolveCheapestSupplier(
  admin: ReturnType<typeof getAdmin>,
  productId: number,
  defaultMargin = 50,
) {
  const { data: mappings } = await admin
    .from('product_supplier_mapping')
    .select('*')
    .eq('product_id', productId)

  if (!mappings || mappings.length === 0) return

  // Solde actuel de chaque fournisseur concerné par ce produit : un
  // fournisseur à 0 USD ne peut honorer AUCUNE commande (dropship-place-order
  // la mettrait en attente de réapprovisionnement), donc on l'exclut du choix
  // du "moins cher" comme s'il était en rupture de stock. Ça se rétablit
  // tout seul dès que le solde repasse au-dessus de 0 (relu à chaque appel,
  // donc à chaque synchro catalogue) — aucune bascule manuelle nécessaire.
  const suppliers = [...new Set(mappings.map((m) => m.supplier))]
  const { data: settings } = await admin
    .from('supplier_settings')
    .select('supplier, balance')
    .in('supplier', suppliers)
  const balanceBySupplier = new Map((settings ?? []).map((s) => [s.supplier, Number(s.balance) || 0]))
  const hasFunds = (m: { supplier: string }) => (balanceBySupplier.get(m.supplier) ?? 0) > 0

  // Ne considère que les mappings avec du stock dispo ET un fournisseur
  // solvable ; à défaut (aucun candidat solvable), retombe sur tous pour ne
  // jamais planter — mais un fournisseur à 0 USD ne sera alors plus jamais
  // choisi comme "actif" (cf. filtre ci-dessous avant la sélection finale).
  const inStock = mappings.filter((m) => Number(m.supplier_available) > 0 && hasFunds(m))
  const pool = inStock.length > 0 ? inStock : mappings.filter(hasFunds).length > 0 ? mappings.filter(hasFunds) : mappings

  const cheapest = pool.reduce((best, m) =>
    Number(m.supplier_rate) < Number(best.supplier_rate) ? m : best
  , pool[0])

  const margin = cheapest.margin_percent != null ? Number(cheapest.margin_percent) : defaultMargin
  const price = Math.round(Number(cheapest.supplier_rate) * (1 + margin / 100) * 100) / 100
  // Stock affiché à 0 si même le "moins cher" retenu n'a en fait aucun
  // fournisseur solvable (tous à 0 USD) — le produit devient non achetable
  // plutôt que d'accepter un paiement qu'on ne pourra pas honorer.
  const effectiveStock = hasFunds(cheapest) ? (Number(cheapest.supplier_available) || 0) : 0

  await admin.from('products').update({
    price, is_dropship: true, supplier_stock: effectiveStock,
  }).eq('id', productId)

  for (const m of mappings) {
    await admin.from('product_supplier_mapping').update({ active: m.id === cheapest.id }).eq('id', m.id)
  }
}

/** Alerte email admin (réutilise formsubmit.co, déjà utilisé par le front). */
export async function alertAdmin(subject: string, fields: Record<string, string>) {
  try {
    await fetch(`https://formsubmit.co/ajax/${ADMIN_ALERT_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, ...fields }),
    })
  } catch (e) {
    console.error('alertAdmin a échoué:', (e as Error).message)
  }
}

/**
 * Rembourse le client (recrédite son solde) et annule la commande.
 * IDEMPOTENT : ne recrédite jamais deux fois (garde sur status='cancelled').
 */
export async function refundOrder(
  admin: ReturnType<typeof getAdmin>,
  orderId: string,
  reason: string,
) {
  // Relecture fraîche pour éviter tout double remboursement (course avec le poll).
  const { data: order, error } = await admin
    .from('orders')
    .select('id, user_id, total_price, status')
    .eq('id', orderId)
    .single()
  if (error || !order) return
  if (order.status === 'cancelled') return // déjà remboursé/annulé

  const { data: profile } = await admin
    .from('profiles')
    .select('balance')
    .eq('id', order.user_id)
    .single()

  if (profile) {
    await admin
      .from('profiles')
      .update({ balance: (profile.balance || 0) + (order.total_price || 0) })
      .eq('id', order.user_id)
  }

  await admin.from('orders').update({
    status: 'cancelled',
    supplier_status: reason,
  }).eq('id', orderId)

  await logSupplier(admin, {
    order_id: String(orderId),
    action: 'refund',
    level: 'error',
    message: `Commande ${orderId} remboursée (${(order.total_price || 0)} USD recrédités). Raison : ${reason}`,
  })

  await alertAdmin('⚠️ Commande YTSeller remboursée', {
    order_id: String(orderId),
    amount: `${order.total_price || 0} USD`,
    reason,
  })
}

/** Envoie un message de notification Telegram si TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID sont configurés */
export async function notifyTelegram(message: string) {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID')
  if (!token || !chatId) {
    console.log('Notification Telegram non configurée (TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID manquant)')
    return
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })
    if (!res.ok) {
      console.error(`Erreur Telegram (HTTP ${res.status}):`, await res.text())
    }
  } catch (err) {
    console.error('notifyTelegram error:', (err as Error).message)
  }
}

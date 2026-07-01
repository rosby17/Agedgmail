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
  },
) {
  try {
    await admin.from('supplier_logs').insert({
      order_id: entry.order_id ?? null,
      supplier: 'ytseller',
      action: entry.action,
      level: entry.level ?? 'info',
      message: entry.message,
      payload: entry.payload ?? null,
    })
  } catch (e) {
    console.error('logSupplier a échoué:', (e as Error).message)
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

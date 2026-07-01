// ============================================================
// ytseller-poll-orders
// Cron (~60 s). Pour chaque commande en 'processing' transmise au
// fournisseur :
//   - action=product_order_status
//   - Completed        -> action=result_product -> livre les comptes,
//                         passe la commande en 'confirmed'
//   - Partial          -> livre le partiel + rembourse le manquant
//   - Canceled         -> rembourse intégralement
//   - Pending/Proc/...  -> patiente ; au-delà du timeout -> rembourse + alerte
//
// La livraison = écrire credentials/data sur la commande : la page
// "Mes commandes" les affiche automatiquement (aucun changement d'UI).
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getOrderStatus, getResult } from '../_shared/ytseller.ts'
import { getAdmin, logSupplier, alertAdmin, refundOrder, corsHeaders } from '../_shared/supplier-db.ts'

const BATCH = 25
const TIMEOUT_MIN = 15

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = getAdmin()
  const summary = { checked: 0, completed: 0, partial: 0, canceled: 0, timed_out: 0, waiting: 0, errors: 0 }

  try {
    const { data: orders, error } = await admin
      .from('orders')
      .select('id, user_id, quantity, total_price, created_at, supplier_order_id, supplier_attempts')
      .eq('status', 'processing')
      .eq('supplier', 'ytseller')
      .not('supplier_order_id', 'is', null)
      .order('created_at', { ascending: true })
      .limit(BATCH)
    if (error) throw new Error(error.message)

    for (const order of orders ?? []) {
      summary.checked++
      const orderId = String(order.id)
      try {
        const st = await getOrderStatus(order.supplier_order_id)
        const status = st.status.toLowerCase()

        await admin.from('orders').update({
          supplier_status: st.status,
          supplier_last_checked_at: new Date().toISOString(),
          supplier_attempts: (order.supplier_attempts || 0) + 1,
        }).eq('id', orderId)

        // ---- Completed : livraison intégrale ----
        if (status === 'completed') {
          const result = await getResult(order.supplier_order_id)
          if (result.length === 0) throw new Error('result_product vide malgré status Completed')
          const creds = result.join('\n')
          await admin.from('orders').update({
            status: 'confirmed',
            credentials: creds,
            data: creds,
          }).eq('id', orderId)
          summary.completed++
          await logSupplier(admin, {
            order_id: orderId, action: 'deliver', level: 'info',
            message: `Livraison OK : ${result.length} compte(s) livré(s) (YTSeller #${order.supplier_order_id}).`,
          })
          continue
        }

        // ---- Partial : livrer le disponible + rembourser le manquant ----
        if (status === 'partial') {
          const result = await getResult(order.supplier_order_id)
          const creds = result.join('\n')
          const qty = Number(order.quantity) || 1
          const delivered = result.length
          const remains = Math.max(0, qty - delivered)
          const refund = Math.round((Number(order.total_price) || 0) * (remains / qty) * 100) / 100

          if (refund > 0) {
            const { data: profile } = await admin.from('profiles').select('balance').eq('id', order.user_id).single()
            if (profile) {
              await admin.from('profiles').update({ balance: (profile.balance || 0) + refund }).eq('id', order.user_id)
            }
          }
          await admin.from('orders').update({
            status: 'confirmed',
            credentials: creds,
            data: creds,
            supplier_status: 'Partial',
            admin_note: `Livraison partielle : ${delivered}/${qty} compte(s). ${refund > 0 ? `${refund} USD remboursés.` : ''}`.trim(),
          }).eq('id', orderId)

          summary.partial++
          await logSupplier(admin, {
            order_id: orderId, action: 'deliver-partial', level: 'error',
            message: `Partiel : ${delivered}/${qty} livré(s), ${refund} USD remboursés (YTSeller #${order.supplier_order_id}).`,
          })
          await alertAdmin('⚠️ Livraison YTSeller partielle', {
            order_id: orderId, delivered: `${delivered}/${qty}`, refunded: `${refund} USD`,
          })
          continue
        }

        // ---- Canceled : remboursement intégral ----
        if (status === 'canceled') {
          await refundOrder(admin, orderId, 'Commande annulée par le fournisseur')
          summary.canceled++
          continue
        }

        // ---- En attente (Pending / Processing / In progress) ----
        const ageMin = (Date.now() - new Date(order.created_at).getTime()) / 60000
        if (ageMin > TIMEOUT_MIN) {
          await logSupplier(admin, {
            order_id: orderId, action: 'timeout', level: 'error',
            message: `Timeout (${Math.round(ageMin)} min, statut "${st.status}"). Remboursement (YTSeller #${order.supplier_order_id}).`,
          })
          await refundOrder(admin, orderId, `Timeout fournisseur (${st.status})`)
          summary.timed_out++
        } else {
          summary.waiting++
        }
      } catch (err) {
        summary.errors++
        await logSupplier(admin, {
          order_id: orderId, action: 'poll', level: 'error',
          message: (err as Error).message,
        })
      }
    }

    return new Response(JSON.stringify({ ok: true, ...summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erreur ytseller-poll-orders:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

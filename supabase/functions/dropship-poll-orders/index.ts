// ============================================================
// dropship-poll-orders
// Remplace ytseller-poll-orders : traite les commandes 'processing' de TOUS
// les fournisseurs dropship (ytseller, smmshiba...), en dispatchant vers le
// bon adaptateur selon orders.supplier (posé par dropship-place-order).
//
// Cron (~60 s). Pour chaque commande en 'processing' transmise au fournisseur :
//   - action=product_order_status
//   - Completed  -> action=result_product -> livre les comptes, 'confirmed'
//   - Partial    -> livre le partiel + rembourse le manquant
//   - Canceled   -> rembourse intégralement
//   - Pending/... -> patiente ; au-delà du timeout -> rembourse + alerte
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import * as ytseller from '../_shared/ytseller.ts'
import * as smmshiba from '../_shared/smmshiba.ts'
import * as agedsmm from '../_shared/agedsmm.ts'
import { getAdmin, logSupplier, alertAdmin, refundOrder, notifyTelegram, corsHeaders } from '../_shared/supplier-db.ts'
import { parseAccountDelivery } from '../_shared/parseAccountDelivery.ts'

const ADAPTERS: Record<string, { getOrderStatus: typeof ytseller.getOrderStatus; getResult: typeof ytseller.getResult }> = {
  ytseller, smmshiba, agedsmm,
}

const BATCH = 25
const TIMEOUT_MIN = 15

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = getAdmin()
  const summary = { checked: 0, completed: 0, partial: 0, canceled: 0, timed_out: 0, waiting: 0, errors: 0 }

  try {
    const { data: orders, error } = await admin
      .from('orders')
      .select('id, user_id, buyer_email, product_name, quantity, total_price, created_at, supplier, supplier_order_id, supplier_attempts')
      .eq('status', 'processing')
      .in('supplier', Object.keys(ADAPTERS))
      .order('created_at', { ascending: true })
      .limit(BATCH)
    if (error) throw new Error(error.message)

    for (const order of orders ?? []) {
      summary.checked++
      const orderId = String(order.id)
      const supplier = String(order.supplier)
      const adapter = ADAPTERS[supplier]
      try {
        if (!adapter) throw new Error(`Fournisseur inconnu sur la commande : ${supplier}`)

        if (!order.supplier_order_id) {
          // Commande non encore passée au fournisseur (ex. solde insuffisant).
          // Tente une nouvelle transmission automatique.
          try {
            const { data: placeRes, error: placeErr } = await admin.functions.invoke('dropship-place-order', {
              body: { orderId }
            })
            if (placeErr) throw placeErr
            if (placeRes?.ok || placeRes?.supplier_order_id) {
              summary.waiting++
              continue
            }
          } catch (placeErr) {
            console.error(`Tentative de transmission automatique échouée pour la commande ${orderId}:`, (placeErr as Error).message)
          }

          // Timeout après 48h (2880 minutes) pour les commandes en attente de solde fournisseur
          const ageMin = (Date.now() - new Date(order.created_at).getTime()) / 60000
          if (ageMin > 2880) {
            await logSupplier(admin, {
              order_id: orderId, action: 'timeout-restock', level: 'error', supplier,
              message: `Timeout attente réapprovisionnement (48h). Commande remboursée.`,
            })
            await refundOrder(admin, orderId, `Timeout attente solde fournisseur`)
            summary.timed_out++
          } else {
            summary.waiting++
          }
          continue
        }

        const st = await adapter.getOrderStatus(order.supplier_order_id)
        const status = st.status.toLowerCase()

        await admin.from('orders').update({
          supplier_status: st.status,
          supplier_last_checked_at: new Date().toISOString(),
          supplier_attempts: (order.supplier_attempts || 0) + 1,
        }).eq('id', orderId)

        // ---- Completed : livraison intégrale ----
        if (status === 'completed') {
          const result = await adapter.getResult(order.supplier_order_id)
          if (result.length === 0) throw new Error('result_product vide malgré status Completed')
          const creds = result.join('\n')

          // Valide le format de chaque compte livré AVANT de considérer la
          // livraison "propre" — ne bloque jamais le crédit du client (il a
          // payé), mais alerte immédiatement l'admin si un format inattendu
          // passe, pour rattraper manuellement plutôt que de laisser un
          // affichage cassé. Jamais de credential en clair dans les logs.
          const malformed: string[] = []
          for (const line of result) {
            try {
              parseAccountDelivery(line)
            } catch (parseErr) {
              const [email] = line.split(':')
              malformed.push(`${email || '(email illisible)'} — ${(parseErr as Error).message}`)
            }
          }

          await admin.from('orders').update({
            status: 'confirmed', credentials: creds, data: creds,
            ...(malformed.length > 0 ? { admin_note: `Format de livraison inattendu sur ${malformed.length}/${result.length} compte(s) — vérification manuelle recommandée.` } : {}),
          }).eq('id', orderId)
          summary.completed++

          // Envoyer les credentials par email si le client a opté pour cette option
          admin.functions.invoke('send-delivery-email', { body: { orderId } })
            .catch(e => console.error('[poll] send-delivery-email failed:', (e as Error).message))

          await logSupplier(admin, {
            order_id: orderId, action: 'deliver', level: malformed.length > 0 ? 'error' : 'info', supplier,
            message: `Livraison ${malformed.length > 0 ? 'avec anomalie de format' : 'OK'} : ${result.length} compte(s) livré(s) (${supplier} #${order.supplier_order_id}).`,
            payload: malformed.length > 0 ? { malformed } : undefined,
          })
          if (malformed.length > 0) {
            await notifyTelegram(
              `⚠️ <b>Format de livraison inattendu</b>\n\n` +
              `• <b>Commande :</b> <code>#${orderId}</code>\n` +
              `• <b>Client :</b> ${order.buyer_email || '—'}\n` +
              `• <b>Comptes concernés :</b> ${malformed.length}/${result.length}\n` +
              `• <b>Détail :</b> ${malformed.join(' ; ')}\n\n` +
              `👉 <i>Le client a été livré, mais vérifiez manuellement le format — l'affichage in-app bascule sur un message de secours si le parsing échoue côté client.</i>`
            )
          }
          await alertAdmin('💰 Vente confirmée', {
            order_id: orderId, supplier, amount: `${order.total_price || 0} USD`, quantity: String(result.length),
          })
          await notifyTelegram(
            `💰 <b>Vente confirmée & Livrée !</b>\n\n` +
            `• <b>Client :</b> ${order.buyer_email || '—'}\n` +
            `• <b>Produit :</b> ${order.product_name || '—'}\n` +
            `• <b>Commande :</b> <code>#${orderId}</code>\n` +
            `• <b>Quantité :</b> ${result.length}\n` +
            `• <b>Montant :</b> $${Number(order.total_price).toFixed(2)}\n` +
            `• <b>Fournisseur :</b> ${supplier.toUpperCase()}\n` +
            `• <b>ID Fournisseur :</b> #${order.supplier_order_id}`
          )
          continue
        }

        // ---- Partial : livrer le disponible + rembourser le manquant ----
        if (status === 'partial') {
          const result = await adapter.getResult(order.supplier_order_id)
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
            status: 'confirmed', credentials: creds, data: creds, supplier_status: 'Partial',
            admin_note: `Livraison partielle : ${delivered}/${qty} compte(s). ${refund > 0 ? `${refund} USD remboursés.` : ''}`.trim(),
          }).eq('id', orderId)

          summary.partial++
          await logSupplier(admin, {
            order_id: orderId, action: 'deliver-partial', level: 'error', supplier,
            message: `Partiel : ${delivered}/${qty} livré(s), ${refund} USD remboursés (${supplier} #${order.supplier_order_id}).`,
          })
          await alertAdmin('⚠️ Livraison partielle', {
            order_id: orderId, supplier, delivered: `${delivered}/${qty}`, refunded: `${refund} USD`,
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
            order_id: orderId, action: 'timeout', level: 'error', supplier,
            message: `Timeout (${Math.round(ageMin)} min, statut "${st.status}"). Remboursement (${supplier} #${order.supplier_order_id}).`,
          })
          await refundOrder(admin, orderId, `Timeout fournisseur (${st.status})`)
          summary.timed_out++
        } else {
          summary.waiting++
        }
      } catch (err) {
        summary.errors++
        await logSupplier(admin, {
          order_id: orderId, action: 'poll', level: 'error', supplier,
          message: (err as Error).message,
        })
      }
    }

    return new Response(JSON.stringify({ ok: true, ...summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erreur dropship-poll-orders:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

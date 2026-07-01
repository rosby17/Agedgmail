// ============================================================
// ytseller-place-order
// Appelée juste après un paiement client confirmé (depuis le front, via
// supabase.functions.invoke) avec { orderId }.
//
//  1. Garde-fou solde fournisseur (action=balance) — évite d'accepter une
//     commande qu'on ne pourra pas honorer.
//  2. action=add_product_order -> stocke supplier_order_id, statut 'processing'.
//  3. En cas d'échec : rembourse le client + alerte admin.
//
// Le polling/livraison est ensuite pris en charge par ytseller-poll-orders.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getBalance, addProductOrder } from '../_shared/ytseller.ts'
import { getAdmin, logSupplier, refundOrder, corsHeaders } from '../_shared/supplier-db.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = getAdmin()
  let orderId: string | undefined

  try {
    const body = await req.json()
    orderId = body?.orderId ? String(body.orderId) : undefined
    if (!orderId) throw new Error('orderId requis')

    // 1. Charger la commande
    const { data: order, error: oErr } = await admin
      .from('orders')
      .select('id, product_id, quantity, status, supplier_order_id')
      .eq('id', orderId)
      .single()
    if (oErr || !order) throw new Error('Commande introuvable: ' + orderId)

    // Idempotence : commande déjà transmise au fournisseur
    if (order.supplier_order_id) {
      return new Response(JSON.stringify({ ok: true, already: true, supplier_order_id: order.supplier_order_id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (order.status !== 'processing' && order.status !== 'pending') {
      throw new Error(`Statut commande inattendu: ${order.status}`)
    }

    // 2. Mapping fournisseur (actif)
    const { data: map, error: mErr } = await admin
      .from('product_supplier_mapping')
      .select('*')
      .eq('product_id', order.product_id)
      .eq('supplier', 'ytseller')
      .eq('active', true)
      .maybeSingle()
    if (mErr) throw new Error(mErr.message)
    if (!map) throw new Error(`Aucun mapping YTSeller actif pour le produit ${order.product_id}`)

    const quantity = Number(order.quantity) || 1
    const cost = (Number(map.ytseller_rate) || 0) * quantity

    // 3. Garde-fou solde fournisseur
    const { balance, currency } = await getBalance()
    await admin.from('supplier_settings').update({
      balance, currency, last_balance_check: new Date().toISOString(),
    }).eq('supplier', 'ytseller')

    if (balance < cost) {
      await logSupplier(admin, {
        order_id: orderId,
        action: 'place-order',
        level: 'error',
        message: `Solde YTSeller insuffisant : ${balance} ${currency} < coût ${cost} ${currency}. Commande remboursée.`,
        payload: { balance, cost, quantity },
      })
      await refundOrder(admin, orderId, 'Solde fournisseur insuffisant')
      return new Response(JSON.stringify({ ok: false, refunded: true, reason: 'insufficient_supplier_balance' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Passer la commande fournisseur
    const supplierOrderId = await addProductOrder(map.ytseller_product_id, quantity)

    await admin.from('orders').update({
      supplier: 'ytseller',
      supplier_order_id: supplierOrderId,
      supplier_status: 'Pending',
      supplier_attempts: 0,
      supplier_last_checked_at: new Date().toISOString(),
      status: 'processing',
    }).eq('id', orderId)

    await logSupplier(admin, {
      order_id: orderId,
      action: 'place-order',
      level: 'info',
      message: `Commande fournisseur créée (YTSeller #${supplierOrderId}) pour ${quantity}x produit ${map.ytseller_product_id}.`,
      payload: { supplierOrderId, quantity },
    })

    return new Response(JSON.stringify({ ok: true, supplier_order_id: supplierOrderId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    await logSupplier(admin, {
      order_id: orderId ?? null,
      action: 'place-order',
      level: 'error',
      message: (err as Error).message,
    })
    // Échec de passation : on rembourse pour ne pas laisser le client débité sans rien.
    if (orderId) await refundOrder(admin, orderId, 'Échec passation commande fournisseur')
    console.error('Erreur ytseller-place-order:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message, refunded: !!orderId }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

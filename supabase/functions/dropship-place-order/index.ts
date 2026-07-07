// ============================================================
// dropship-place-order
// Remplace ytseller-place-order : dispatche vers le BON fournisseur (celui
// dont le mapping est actuellement "active" pour ce produit — potentiellement
// ytseller OU smmshiba selon qui est le moins cher au moment de la synchro).
//
// Appelée juste après un paiement client confirmé (depuis le front, via
// supabase.functions.invoke) avec { orderId }.
//  1. Garde-fou solde fournisseur (action=balance).
//  2. action=add_product_order -> stocke supplier_order_id, statut 'processing'.
//  3. En cas d'échec : rembourse le client + alerte admin.
//
// Le polling/livraison est ensuite pris en charge par dropship-poll-orders.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import * as ytseller from '../_shared/ytseller.ts'
import * as smmshiba from '../_shared/smmshiba.ts'
import * as agedsmm from '../_shared/agedsmm.ts'
import { getAdmin, logSupplier, alertAdmin, refundOrder, notifyTelegram, corsHeaders } from '../_shared/supplier-db.ts'

const ADAPTERS: Record<string, { getBalance: typeof ytseller.getBalance; addProductOrder: typeof ytseller.addProductOrder }> = {
  ytseller, smmshiba, agedsmm,
}

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

    // 2. Mapping actif pour ce produit, peu importe le fournisseur — c'est
    // resolveCheapestSupplier (exécuté à chaque synchro catalogue) qui décide
    // lequel est actif (le moins cher, en stock).
    const { data: map, error: mErr } = await admin
      .from('product_supplier_mapping')
      .select('*')
      .eq('product_id', order.product_id)
      .eq('active', true)
      .maybeSingle()
    if (mErr) throw new Error(mErr.message)
    if (!map) throw new Error(`Aucun mapping fournisseur actif pour le produit ${order.product_id}`)

    const supplier = String(map.supplier)
    const adapter = ADAPTERS[supplier]
    if (!adapter) throw new Error(`Fournisseur inconnu : ${supplier}`)

    const quantity = Number(order.quantity) || 1
    const cost = (Number(map.supplier_rate) || 0) * quantity

    // 3. Garde-fou solde fournisseur
    const { balance, currency } = await adapter.getBalance()
    await admin.from('supplier_settings').update({
      balance, currency, last_balance_check: new Date().toISOString(),
    }).eq('supplier', supplier)

    if (balance < cost) {
      await logSupplier(admin, {
        order_id: orderId, action: 'place-order', level: 'error', supplier,
        message: `Solde ${supplier} insuffisant : ${balance} ${currency} < coût ${cost} ${currency}. Commande mise en attente de réapprovisionnement.`,
        payload: { balance, cost, quantity },
      })
      
      await admin.from('orders').update({
        supplier,
        supplier_status: 'Solde insuffisant (Attente réapprovisionnement)',
        supplier_last_checked_at: new Date().toISOString(),
      }).eq('id', orderId)

      await alertAdmin('⚠️ Solde fournisseur insuffisant', {
        order_id: String(orderId),
        supplier,
        balance: `${balance} ${currency}`,
        cost: `${cost} ${currency}`,
      })

      await notifyTelegram(
        `⚠️ <b>Solde fournisseur insuffisant !</b>\n\n` +
        `• <b>Fournisseur :</b> ${supplier.toUpperCase()}\n` +
        `• <b>Commande :</b> <code>#${orderId}</code>\n` +
        `• <b>Solde actuel :</b> ${balance} ${currency}\n` +
        `• <b>Coût commande :</b> ${cost} ${currency}\n\n` +
        `👉 <i>Veuillez recharger votre compte ${supplier.toUpperCase()} puis relancer la commande depuis le panel admin.</i>`
      )

      return new Response(JSON.stringify({ ok: false, refunded: false, reason: 'insufficient_supplier_balance' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Passer la commande chez le bon fournisseur
    const supplierOrderId = await adapter.addProductOrder(map.supplier_product_id, quantity)

    await admin.from('orders').update({
      supplier,
      supplier_order_id: supplierOrderId,
      supplier_status: 'Pending',
      supplier_attempts: 0,
      supplier_last_checked_at: new Date().toISOString(),
      status: 'processing',
    }).eq('id', orderId)

    await logSupplier(admin, {
      order_id: orderId, action: 'place-order', level: 'info', supplier,
      message: `Commande fournisseur créée (${supplier} #${supplierOrderId}) pour ${quantity}x produit ${map.supplier_product_id}.`,
      payload: { supplierOrderId, quantity },
    })

    return new Response(JSON.stringify({ ok: true, supplier, supplier_order_id: supplierOrderId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    await logSupplier(admin, {
      order_id: orderId ?? null, action: 'place-order', level: 'error',
      message: (err as Error).message,
    })
    if (orderId) await refundOrder(admin, orderId, 'Échec passation commande fournisseur')
    console.error('Erreur dropship-place-order:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message, refunded: !!orderId }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

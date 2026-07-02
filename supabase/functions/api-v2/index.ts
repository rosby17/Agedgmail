// ============================================================
// api-v2  — API REVENDEUR publique de la boutique
// Permet à des revendeurs d'acheter notre catalogue par programme.
// Auth : clé API (table api_keys) -> compte utilisateur (profiles.balance).
//
// POST application/x-www-form-urlencoded OU application/json
//   key      : clé API du revendeur
//   action   : balance | products | add_order | order_status | result
//   product  : (add_order) id produit
//   quantity : (add_order) quantité
//   order    : (order_status | result) id de commande
//
// Réponses JSON. Déployer avec --no-verify-jwt (auth par clé API interne).
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const admin = () => createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

// Statut interne -> statut style panel
function mapStatus(s: string | null): string {
  switch (s) {
    case 'confirmed': return 'Completed'
    case 'cancelled': return 'Canceled'
    case 'processing': return 'Processing'
    default: return 'Pending'
  }
}

async function parseParams(req: Request): Promise<Record<string, string>> {
  const ct = req.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    try { return (await req.json()) as Record<string, string> } catch { return {} }
  }
  const text = await req.text()
  const p = new URLSearchParams(text)
  return Object.fromEntries(p.entries())
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'POST requis' }, 405)

  const db = admin()
  try {
    const params = await parseParams(req)
    const key = params.key
    const action = params.action
    if (!key) return json({ error: 'Clé API manquante' }, 401)
    if (!action) return json({ error: 'action manquante' }, 400)

    // Authentification par clé API
    const { data: keyRow } = await db
      .from('api_keys').select('user_id, active').eq('api_key', key).maybeSingle()
    if (!keyRow || !keyRow.active) return json({ error: 'Clé API invalide' }, 401)
    const userId = keyRow.user_id
    db.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('api_key', key).then(() => {})

    // -------- balance --------
    if (action === 'balance') {
      const { data: profile } = await db.from('profiles').select('balance').eq('id', userId).maybeSingle()
      return json({ balance: Number(profile?.balance || 0), currency: 'USD' })
    }

    // -------- products --------
    if (action === 'products') {
      const { data: products } = await db
        .from('products')
        .select('id, name, category, price, supplier_stock, description')
        .eq('is_dropship', true)
        .order('category', { ascending: true })
      const list = (products ?? []).map((p) => ({
        product: p.id,
        name: p.name,
        category: p.category,
        rate: Number(p.price),          // prix de vente (revendeur)
        available: Number(p.supplier_stock || 0),
        status: Number(p.supplier_stock || 0) > 0 ? 'In stock' : 'Out of stock',
        description: p.description || '',
      }))
      return json(list)
    }

    // -------- add_order --------
    if (action === 'add_order' || action === 'add_product_order') {
      const productId = Number(params.product)
      const quantity = Math.max(1, Number(params.quantity) || 0)
      if (!productId || quantity < 1) return json({ error: 'product et quantity requis' }, 400)

      const { data: product } = await db
        .from('products').select('id, name, price, supplier_stock, is_dropship').eq('id', productId).maybeSingle()
      if (!product || !product.is_dropship) return json({ error: 'Produit introuvable' }, 404)
      if (Number(product.supplier_stock || 0) < quantity) return json({ error: 'Stock insuffisant' }, 409)

      const total = Number(product.price) * quantity

      // Solde revendeur
      const { data: profile } = await db.from('profiles').select('balance, email').eq('id', userId).maybeSingle()
      const balance = Number(profile?.balance || 0)
      if (balance < total) return json({ error: 'Solde insuffisant', balance, required: total }, 402)

      // Créer la commande (dropship) puis débiter
      const { data: order, error: oErr } = await db.from('orders').insert({
        user_id: userId,
        buyer_email: profile?.email || null,
        product_id: productId,
        product_name: product.name,
        quantity,
        total_price: total,
        status: 'processing',
        created_at: new Date().toISOString(),
      }).select('id').single()
      if (oErr || !order) return json({ error: 'Création commande échouée' }, 500)

      await db.from('profiles').update({ balance: balance - total }).eq('id', userId)

      // Fulfilment fournisseur (rembourse automatiquement en cas d'échec)
      const res = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ytseller-place-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: String(order.id) }),
      })
      const placed = await res.json().catch(() => ({}))
      if (placed?.refunded || placed?.ok === false) {
        return json({ error: 'Commande non honorée (remboursée)', reason: placed?.reason || 'supplier_error' }, 502)
      }
      return json({ order: order.id })
    }

    // -------- order_status --------
    if (action === 'order_status' || action === 'product_order_status') {
      const orderId = params.order
      if (!orderId) return json({ error: 'order requis' }, 400)
      const { data: order } = await db
        .from('orders').select('id, status, total_price, user_id').eq('id', orderId).maybeSingle()
      if (!order || order.user_id !== userId) return json({ error: 'Commande introuvable' }, 404)
      return json({ status: mapStatus(order.status), charge: String(order.total_price ?? ''), currency: 'USD' })
    }

    // -------- result --------
    if (action === 'result' || action === 'result_product') {
      const orderId = params.order
      if (!orderId) return json({ error: 'order requis' }, 400)
      const { data: order } = await db
        .from('orders').select('id, status, credentials, data, user_id').eq('id', orderId).maybeSingle()
      if (!order || order.user_id !== userId) return json({ error: 'Commande introuvable' }, 404)
      if (order.status !== 'confirmed') return json({ result: [], status: mapStatus(order.status) })
      const raw = order.credentials || order.data || ''
      const result = String(raw).split('\n').map((l) => l.trim()).filter(Boolean)
      return json({ result })
    }

    return json({ error: `action inconnue: ${action}` }, 400)
  } catch (err) {
    console.error('api-v2 error:', (err as Error).message)
    return json({ error: (err as Error).message }, 500)
  }
})

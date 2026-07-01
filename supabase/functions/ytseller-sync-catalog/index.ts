// ============================================================
// ytseller-sync-catalog
// Synchronise le catalogue fournisseur avec mon catalogue :
//  - récupère les produits YTSeller (rate + inventory + statut)
//  - met à jour product_supplier_mapping (coût, dispo)
//  - recalcule products.price = rate * (1 + margin%) et products.supplier_stock
//  - rafraîchit le solde fournisseur (cache supplier_settings)
//
// Déclenchée par cron (pg_cron / scheduler) ET manuellement depuis l'admin.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getBalance, getProducts } from '../_shared/ytseller.ts'
import { getAdmin, logSupplier, corsHeaders } from '../_shared/supplier-db.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = getAdmin()
  try {
    // 1. Solde fournisseur (cache pour l'admin)
    const { balance, currency } = await getBalance()
    await admin.from('supplier_settings').update({
      balance,
      currency,
      last_balance_check: new Date().toISOString(),
      last_catalog_sync: new Date().toISOString(),
    }).eq('supplier', 'ytseller')

    // 2. Catalogue fournisseur, indexé par product id
    const products = await getProducts()
    const byId = new Map(products.map((p) => [String(p.product), p]))

    // 3. Mappings actifs à synchroniser
    const { data: mappings, error: mErr } = await admin
      .from('product_supplier_mapping')
      .select('*')
      .eq('supplier', 'ytseller')
    if (mErr) throw new Error(mErr.message)

    let updated = 0
    let missing = 0

    for (const map of mappings ?? []) {
      const yt = byId.get(String(map.ytseller_product_id))

      if (!yt) {
        // Produit fournisseur introuvable : on marque indisponible (sans désactiver
        // le mapping — l'admin décide), et stock public à 0.
        missing++
        await admin.from('product_supplier_mapping').update({
          supplier_available: 0,
          supplier_status: 'Not found',
          last_synced_at: new Date().toISOString(),
        }).eq('id', map.id)

        await admin.from('products').update({ supplier_stock: 0 }).eq('id', map.product_id)
        continue
      }

      const rate = Number(yt.rate) || 0
      const marginPct = Number(map.margin_percent) || 0
      const inventory = Number(yt.inventory) || 0

      // Mapping : coût + dispo fournisseur
      await admin.from('product_supplier_mapping').update({
        ytseller_rate: rate,
        supplier_available: inventory,
        supplier_status: yt.status ?? null,
        supplier_currency: currency,
        last_synced_at: new Date().toISOString(),
      }).eq('id', map.id)

      // Produit public : prix de vente + stock affiché + flag dropship.
      // Le stock public n'est mis à jour que si le mapping est actif.
      const sellPrice = Math.round(rate * (1 + marginPct / 100) * 100) / 100
      const productUpdate: Record<string, unknown> = { is_dropship: true }
      if (map.active) {
        productUpdate.price = sellPrice
        productUpdate.supplier_stock = inventory
      } else {
        productUpdate.supplier_stock = 0
      }
      await admin.from('products').update(productUpdate).eq('id', map.product_id)
      updated++
    }

    await logSupplier(admin, {
      action: 'sync-catalog',
      level: 'info',
      message: `Sync OK : ${updated} produit(s) mis à jour, ${missing} introuvable(s). Solde ${balance} ${currency}.`,
      payload: { updated, missing, balance },
    })

    return new Response(JSON.stringify({ ok: true, updated, missing, balance, currency }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    await logSupplier(admin, {
      action: 'sync-catalog',
      level: 'error',
      message: (err as Error).message,
    })
    console.error('Erreur ytseller-sync-catalog:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

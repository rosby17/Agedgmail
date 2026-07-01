// ============================================================
// ytseller-sync-catalog  (MIROIR INTÉGRAL)
// Reflète TOUT le catalogue YTSeller dans `products` :
//  - crée/met à jour un produit par produit YTSeller
//  - prix de vente = rate * (1 + marge%)  (marge globale, surchargeable)
//  - stock affiché = inventory fournisseur, is_dropship = true
//  - NETTOIE noms/descriptions de toute trace "ytseller" (anti-fuite)
//
// Body:
//   {}            -> synchro incrémentale (prix, stock, dispo)
//   { full: true} -> import complet + RESET (supprime produits legacy à
//                    stock local + vide account_stock). Ne wipe jamais si
//                    le fournisseur ne renvoie aucun produit (sécurité).
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getBalance, getProducts } from '../_shared/ytseller.ts'
import { getAdmin, logSupplier, corsHeaders } from '../_shared/supplier-db.ts'

// Retire toute trace du fournisseur (liens + marque) des textes affichés.
function sanitize(input: string | null | undefined): string {
  if (!input) return ''
  let s = String(input)
  s = s.replace(/<a\b[^>]*>(.*?)<\/a>/gis, '$1')                       // liens -> texte
  s = s.replace(/https?:\/\/[^\s"'<>]*ytseller[^\s"'<>]*/gi, '')       // URLs ytseller
  s = s.replace(/yt\s*[-_ ]?seller\.com/gi, 'AgedGmail')
  s = s.replace(/yt\s*[-_ ]?seller/gi, 'AgedGmail')                    // marque
  return s.trim()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = getAdmin()
  try {
    const body = await req.json().catch(() => ({}))
    const full = !!body?.full

    // 1. Solde + catalogue fournisseur
    const { balance, currency } = await getBalance()
    const products = await getProducts()

    // Sécurité : ne jamais wiper la boutique si l'API ne renvoie rien
    if (products.length === 0) {
      throw new Error('Le fournisseur a renvoyé 0 produit — synchro/import annulé(e) par sécurité.')
    }

    // 2. Marge globale
    // Marge globale par défaut (utilisée quand un mapping n'a pas de marge propre).
    // Portée par la colonne existante product_supplier_mapping.margin_percent :
    // aucune nouvelle migration requise.
    const DEFAULT_MARGIN = 50

    // 3. Mappings existants indexés par id YTSeller
    const { data: existing } = await admin
      .from('product_supplier_mapping').select('*').eq('supplier', 'ytseller')
    const byYt = new Map((existing ?? []).map((m) => [String(m.ytseller_product_id), m]))
    const seen = new Set<string>()

    let created = 0, updated = 0

    for (const yt of products) {
      const ytId = String(yt.product)
      seen.add(ytId)

      const rate = Number(yt.rate) || 0
      const inventory = Number(yt.inventory) || 0
      const name = sanitize(yt.name) || `Compte ${ytId}`
      const category = sanitize(yt.category) || 'Autres'
      const description = sanitize(yt.description)

      const map = byYt.get(ytId)
      const margin = map?.margin_percent != null ? Number(map.margin_percent) : DEFAULT_MARGIN
      const price = Math.round(rate * (1 + margin / 100) * 100) / 100

      if (map) {
        // Produit déjà lié : mise à jour vitrine + mapping
        await admin.from('products').update({
          name, category, description, price,
          is_dropship: true, supplier_stock: inventory,
        }).eq('id', map.product_id)

        await admin.from('product_supplier_mapping').update({
          ytseller_rate: rate, supplier_available: inventory,
          supplier_status: yt.status ?? null, supplier_currency: currency,
          last_synced_at: new Date().toISOString(),
        }).eq('id', map.id)
        updated++
      } else {
        // Nouveau produit importé
        const { data: prod, error: insErr } = await admin.from('products').insert({
          name, category, description, price,
          is_dropship: true, supplier_stock: inventory,
          created_at: new Date().toISOString(),
        }).select('id').single()
        if (insErr || !prod) {
          await logSupplier(admin, { action: 'import', level: 'error', message: `Insert produit ${ytId} échoué: ${insErr?.message}` })
          continue
        }
        await admin.from('product_supplier_mapping').insert({
          product_id: prod.id, supplier: 'ytseller', ytseller_product_id: ytId,
          margin_percent: DEFAULT_MARGIN, ytseller_rate: rate, supplier_available: inventory,
          supplier_status: yt.status ?? null, supplier_currency: currency,
          active: true, last_synced_at: new Date().toISOString(),
        })
        created++
      }
    }

    // 4. Produits YTSeller disparus : mettre à 0 (on garde la fiche)
    let vanished = 0
    for (const m of existing ?? []) {
      if (!seen.has(String(m.ytseller_product_id))) {
        await admin.from('product_supplier_mapping').update({
          supplier_available: 0, supplier_status: 'Not found', last_synced_at: new Date().toISOString(),
        }).eq('id', m.id)
        await admin.from('products').update({ supplier_stock: 0 }).eq('id', m.product_id)
        vanished++
      }
    }

    // 5. RESET (import complet) : supprimer le legacy à stock local
    let wiped = 0
    if (full && (created + updated) > 0) {
      await admin.from('account_stock').delete().not('id', 'is', null)
      // Supprime tout produit non-dropship (legacy à stock local), NULL inclus.
      const { count } = await admin.from('products').delete({ count: 'exact' }).not('is_dropship', 'is', true)
      wiped = count || 0
    }

    // 6. Cache solde / dates
    await admin.from('supplier_settings').update({
      balance, currency,
      last_balance_check: new Date().toISOString(),
      last_catalog_sync: new Date().toISOString(),
    }).eq('supplier', 'ytseller')

    await logSupplier(admin, {
      action: full ? 'full-import' : 'sync-catalog', level: 'info',
      message: `${full ? 'Import complet' : 'Sync'} : ${created} créé(s), ${updated} maj, ${vanished} disparu(s)${full ? `, ${wiped} legacy supprimé(s)` : ''}. Solde ${balance} ${currency}.`,
      payload: { created, updated, vanished, wiped, balance },
    })

    return new Response(JSON.stringify({ ok: true, created, updated, vanished, wiped, total: products.length, balance, currency }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    await logSupplier(admin, { action: 'sync-catalog', level: 'error', message: (err as Error).message })
    console.error('Erreur ytseller-sync-catalog:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

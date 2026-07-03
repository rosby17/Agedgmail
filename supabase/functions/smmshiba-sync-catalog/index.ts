// ============================================================
// smmshiba-sync-catalog  (FUSION avec le catalogue existant)
// Contrairement à ytseller-sync-catalog (miroir intégral depuis zéro),
// cette synchro est ADDITIVE : elle vient enrichir un catalogue déjà
// peuplé (par YTSeller) sans jamais rien supprimer.
//
// Pour chaque produit SMMSHIBA :
//  - Si un produit existant porte EXACTEMENT le même nom (déjà catalogué
//    via un autre fournisseur) -> on ajoute juste un second mapping
//    'smmshiba' sur ce même produit, puis resolveCheapestSupplier décide
//    lequel des deux fournisseurs reste en vitrine (le moins cher, en stock).
//  - Sinon -> nouveau produit (élargit le catalogue avec les exclusivités
//    SMMSHIBA : Reddit, Hotmail/Outlook, Mail Ru, GMX, etc.)
//
// Body : {} uniquement (pas de mode "full reset" ici, jamais destructif).
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getBalance, getProducts } from '../_shared/smmshiba.ts'
import { getAdmin, logSupplier, corsHeaders, resolveCheapestSupplier } from '../_shared/supplier-db.ts'

const SUPPLIER = 'smmshiba'
const DEFAULT_MARGIN = 50

// Neutralise la marque du fournisseur et les constructions HTML dangereuses
// (même politique que ytseller-sync-catalog : contenu tiers, jamais de confiance
// aveugle — cf. anti-fuite + défense XSS en profondeur).
function sanitize(input: string | null | undefined): string {
  if (!input) return ''
  let s = String(input)
  s = s.replace(/<a\b[^>]*>(.*?)<\/a>/gis, '$1')
  s = s.replace(/https?:\/\/[^\s"'<>]*smmshiba[^\s"'<>]*/gi, '')
  s = s.replace(/smm\s*[-_ ]?shiba/gi, 'AgedGmail')
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  s = s.replace(/<(iframe|object|embed|form|link|meta)\b[^>]*>/gi, '')
  s = s.replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
  s = s.replace(/\son\w+\s*=\s*'[^']*'/gi, '')
  s = s.replace(/\shref\s*=\s*["']javascript:[^"']*["']/gi, '')
  return s.trim()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = getAdmin()
  try {
    const { balance, currency } = await getBalance()
    const shProducts = await getProducts()

    if (shProducts.length === 0) {
      throw new Error('SMMSHIBA a renvoyé 0 produit — synchro annulée par sécurité.')
    }

    // Mappings SMMSHIBA déjà existants, indexés par id fournisseur
    const { data: existingMappings } = await admin
      .from('product_supplier_mapping').select('*').eq('supplier', SUPPLIER)
    const bySupplierId = new Map((existingMappings ?? []).map((m) => [String(m.supplier_product_id), m]))

    // Tous les produits actuels de la boutique, pour détecter les doublons par nom
    const { data: allProducts } = await admin.from('products').select('id, name')
    const productIdByName = new Map((allProducts ?? []).map((p) => [p.name.trim().toLowerCase(), p.id]))

    const seen = new Set<string>()
    let created = 0, merged = 0, updated = 0

    for (const sh of shProducts) {
      const shId = String(sh.product)
      seen.add(shId)

      const rate = Number(sh.rate) || 0
      const inventory = Number(sh.inventory) || 0
      const name = sanitize(sh.name) || `Compte ${shId}`
      const category = sanitize(sh.category) || 'Autres'

      const existingMap = bySupplierId.get(shId)

      if (existingMap) {
        // Mapping SMMSHIBA déjà en place : simple mise à jour tarif/stock.
        await admin.from('product_supplier_mapping').update({
          supplier_rate: rate, supplier_available: inventory,
          supplier_status: sh.status ?? null, supplier_currency: currency,
          last_synced_at: new Date().toISOString(),
        }).eq('id', existingMap.id)
        await resolveCheapestSupplier(admin, existingMap.product_id, DEFAULT_MARGIN)
        updated++
        continue
      }

      // Pas encore de mapping SMMSHIBA pour ce produit fournisseur : est-ce
      // un produit déjà catalogué sous un autre fournisseur (même nom) ?
      const matchedProductId = productIdByName.get(name.trim().toLowerCase())

      if (matchedProductId) {
        // Fusion : on ajoute SMMSHIBA comme fournisseur alternatif du même produit.
        await admin.from('product_supplier_mapping').insert({
          product_id: matchedProductId, supplier: SUPPLIER, supplier_product_id: shId,
          margin_percent: DEFAULT_MARGIN, supplier_rate: rate, supplier_available: inventory,
          supplier_status: sh.status ?? null, supplier_currency: currency,
          active: false, last_synced_at: new Date().toISOString(),
        })
        await resolveCheapestSupplier(admin, matchedProductId, DEFAULT_MARGIN)
        merged++
      } else {
        // Vraie exclusivité SMMSHIBA : nouveau produit dans la boutique.
        const price = Math.round(rate * (1 + DEFAULT_MARGIN / 100) * 100) / 100
        const { data: prod, error: insErr } = await admin.from('products').insert({
          name, category, description: '', price,
          is_dropship: true, supplier_stock: inventory,
          created_at: new Date().toISOString(),
        }).select('id').single()
        if (insErr || !prod) {
          await logSupplier(admin, { supplier: SUPPLIER, action: 'import', level: 'error', message: `Insert produit ${shId} échoué: ${insErr?.message}` })
          continue
        }
        await admin.from('product_supplier_mapping').insert({
          product_id: prod.id, supplier: SUPPLIER, supplier_product_id: shId,
          margin_percent: DEFAULT_MARGIN, supplier_rate: rate, supplier_available: inventory,
          supplier_status: sh.status ?? null, supplier_currency: currency,
          active: true, last_synced_at: new Date().toISOString(),
        })
        productIdByName.set(name.trim().toLowerCase(), prod.id)
        created++
      }
    }

    // Produits SMMSHIBA disparus du catalogue fournisseur : dispo à 0 (on garde la fiche)
    let vanished = 0
    for (const m of existingMappings ?? []) {
      if (!seen.has(String(m.supplier_product_id))) {
        await admin.from('product_supplier_mapping').update({
          supplier_available: 0, supplier_status: 'Not found', last_synced_at: new Date().toISOString(),
        }).eq('id', m.id)
        await resolveCheapestSupplier(admin, m.product_id, DEFAULT_MARGIN)
        vanished++
      }
    }

    await admin.from('supplier_settings').upsert({
      supplier: SUPPLIER, balance, currency,
      last_balance_check: new Date().toISOString(),
      last_catalog_sync: new Date().toISOString(),
    }, { onConflict: 'supplier' })

    await logSupplier(admin, {
      supplier: SUPPLIER, action: 'sync-catalog', level: 'info',
      message: `Sync SMMSHIBA : ${created} nouveau(x) produit(s), ${merged} fusionné(s) avec l'existant, ${updated} maj, ${vanished} disparu(s). Solde ${balance} ${currency}.`,
      payload: { created, merged, updated, vanished, balance },
    })

    return new Response(JSON.stringify({ ok: true, created, merged, updated, vanished, total: shProducts.length, balance, currency }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    await logSupplier(admin, { supplier: SUPPLIER, action: 'sync-catalog', level: 'error', message: (err as Error).message })
    console.error('Erreur smmshiba-sync-catalog:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

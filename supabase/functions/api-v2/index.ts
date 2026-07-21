// ============================================================
// api-v2  — API REVENDEUR publique de la boutique
// Permet à des revendeurs d'acheter notre catalogue par programme.
// Auth : clé API (table api_keys) -> compte utilisateur (profiles.balance).
//
// POST application/x-www-form-urlencoded OU application/json
//   key      : clé API du revendeur
//   action   : balance | products | add_order | order_status | result | sms_prices | sms_get_number | sms_get_code | sms_cancel
//   product  : (add_order) id produit
//   quantity : (add_order) quantité
//   order    : (order_status | result | sms_get_code | sms_cancel) id de commande
//   iso      : (sms_get_number) code pays ISO (ex: US, FR)
//   service  : (sms_get_number) identifiant de service (youtube, google, etc)
//   provider : (sms_get_number) fournisseur SMS choisi (pvapins, 5sim, smscodes)
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

// Marge revendeur : +40 % avec plancher +$0.20, arrondi au centime supérieur
// (aligné sur la boutique). Modifier ces 2 constantes suffit.
const MARGIN_PCT = 0.40
const MARGIN_FLOOR = 0.20
const applyMargin = (cost: number): number =>
  Math.ceil(Math.max(cost * (1 + MARGIN_PCT), cost + MARGIN_FLOOR) * 100) / 100

// PVAPins : nom de pays par ISO (get_rates.php prend un nom de pays, pas un ISO).
const PVA_ISO_TO_NAME: Record<string, string> = {
  US: 'USA', GB: 'UK', FR: 'France', DE: 'Germany', ES: 'Spain', IT: 'Italy',
  CA: 'Canada', NL: 'Netherlands', PL: 'Poland', RO: 'Romania', PT: 'Portugal',
  KE: 'Kenya', NG: 'Nigeria', ZA: 'South Africa', GH: 'Ghana', EG: 'Egypt',
  IN: 'India', ID: 'Indonesia', PH: 'Philippines', PK: 'Pakistan', BD: 'Bangladesh',
  VN: 'Vietnam', TH: 'Thailand', MY: 'Malaysia', BR: 'Brazil', MX: 'Mexico',
  AR: 'Argentina', CO: 'Colombia', RU: 'Russia', UA: 'Ukraine',
}

// Variante YouTube la MOINS chère d'un pays PVAPins (ex: "Youtube1") + son coût.
// get_rates.php est par pays et les variantes diffèrent fortement en prix.
async function getPvaCheapestYt(iso: string): Promise<{ cost: number, app: string } | null> {
  const apiKey = Deno.env.get('PVAPINS_API_KEY')
  if (!apiKey) return null
  const name = PVA_ISO_TO_NAME[iso] || iso
  try {
    const r = await fetch(`https://api.pvapins.com/user/api/get_rates.php?customer=${apiKey}&country=${encodeURIComponent(name)}`)
    const arr = await r.json()
    if (!Array.isArray(arr)) return null
    let best: { cost: number, app: string } | null = null
    for (const x of arr) {
      if (!x || !String(x.app).toLowerCase().includes('youtube')) continue
      const rate = parseFloat(x.rate)
      if (!Number.isFinite(rate) || rate <= 0) continue
      if (!best || rate < best.cost) best = { cost: rate, app: String(x.app) }
    }
    return best
  } catch { return null }
}

async function getSmsPrice(iso: string, provider: string): Promise<{ price: number, cost: number, app?: string }> {
  if (provider === 'pvapins') {
    const best = await getPvaCheapestYt(iso)
    if (best) return { price: applyMargin(best.cost), cost: best.cost, app: best.app }
    const cost = 1.60 // repli si l'API ne répond pas
    return { price: applyMargin(cost), cost, app: 'YouTube' }
  }
  // smscodes / 5sim : coûts indicatifs. Marge identique appliquée.
  const cost = provider === '5sim' ? 0.40 : 0.50
  return { price: applyMargin(cost), cost }
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
      // Rate limit anti-abus de coûts (appelle un fournisseur payant)
      const { data: rlOk } = await db.rpc('check_rate_limit', {
        p_user_id: userId, p_action: 'api_add_order', p_max_per_window: 30, p_window_seconds: 60,
      })
      if (rlOk === false) return json({ error: 'Trop de requêtes, réessayez dans une minute' }, 429)

      const productId = Number(params.product)
      const quantity = Math.max(1, Number(params.quantity) || 0)
      if (!productId || quantity < 1) return json({ error: 'product et quantity requis' }, 400)

      const { data: product } = await db
        .from('products').select('id, name, price, supplier_stock, is_dropship').eq('id', productId).maybeSingle()
      if (!product || !product.is_dropship) return json({ error: 'Produit introuvable' }, 404)
      if (Number(product.supplier_stock || 0) < quantity) return json({ error: 'Stock insuffisant' }, 409)

      const total = Number(product.price) * quantity

      // Solde revendeur (récupération email seulement — la déduction est atomique)
      const { data: profile } = await db.from('profiles').select('email').eq('id', userId).maybeSingle()

      // Créer la commande (dropship) avant la déduction atomique
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

      // Déduction atomique (FOR UPDATE — élimine la race condition TOCTOU)
      const { error: deductErr } = await db.rpc('deduct_balance', { p_user_id: userId, p_amount: total })
      if (deductErr) {
        // Annuler la commande créée si le paiement échoue
        await db.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
        if (deductErr.message?.includes('insufficient_balance')) {
          return json({ error: 'Solde insuffisant', required: total }, 402)
        }
        return json({ error: 'Erreur de déduction du solde' }, 500)
      }

      // Fulfilment fournisseur (rembourse automatiquement en cas d'échec)
      const res = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/dropship-place-order`, {
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

    // ==========================================
    // ACTIONS SMS REVENDEUR
    // ==========================================

    // -------- sms_prices --------
    if (action === 'sms_prices') {
      const targetService = params.service || 'youtube'
      
      const bestPrices = new Map<string, any>()
      
      // 1. Fetch SMSCodes
      const smsCodesKey = Deno.env.get('SMSCODES_API_KEY')
      if (smsCodesKey) {
        try {
          const serviceId = targetService === 'youtube' ? '8a97735e-9a14-427e-8a88-e9d999bf3429' : 'google'
          const url = `https://code.smscodes.io/api/sms/GetServicePrices?key=${smsCodesKey}&serviceId=${serviceId}`
          const res = await fetch(url)
          const data = await res.json()
          if (data.Status === "200" || data.Status === "Success") {
            data.Prices.forEach((c: any) => {
              if (!c.Iso || !c.Price) return
              const price = parseFloat(c.Price)
              bestPrices.set(c.Iso, {
                country: c.Country,
                iso: c.Iso,
                price,
                provider: 'smscodes'
              })
            })
          }
        } catch (e) {
          console.error("Error smscodes api-v2:", e)
        }
      }

      // 2. PVAPins : variante YouTube la MOINS chère par pays (panel populaire),
      //    comparée à SMSCodes — le moins cher gagne. (5sim retiré.)
      const pvaPinsKey = Deno.env.get('PVAPINS_API_KEY')
      if (pvaPinsKey && targetService === 'youtube') {
        const results = await Promise.allSettled(
          Object.keys(PVA_ISO_TO_NAME).map(async (iso) => {
            const best = await getPvaCheapestYt(iso)
            return best ? { iso, cost: best.cost } : null
          })
        )
        for (const r of results) {
          if (r.status !== 'fulfilled' || !r.value) continue
          const { iso, cost } = r.value
          const existing = bestPrices.get(iso)
          if (!existing || cost < existing.price) {
            bestPrices.set(iso, {
              country: existing ? existing.country : (PVA_ISO_TO_NAME[iso] || iso),
              iso,
              price: cost,
              provider: 'pvapins',
            })
          }
        }
      }

      // Appliquer la marge revendeur (+40 %, plancher +$0.20)
      const list = Array.from(bestPrices.values()).map((c) => ({
        country: c.country,
        iso: c.iso,
        rate: applyMargin(c.price),
        provider: c.provider,
      }))
      return json(list)
    }

    // -------- sms_get_number --------
    if (action === 'sms_get_number') {
      // Rate limit anti-abus de coûts : chaque réservation engage un numéro
      // RÉEL et payant chez le fournisseur amont. Le solde est vérifié mais
      // débité seulement à réception du code — sans plafond de débit, un
      // revendeur pourrait réserver en masse et faire exploser la facture.
      const { data: rlOk } = await db.rpc('check_rate_limit', {
        p_user_id: userId, p_action: 'api_sms_get_number', p_max_per_window: 15, p_window_seconds: 60,
      })
      if (rlOk === false) return json({ error: 'Trop de requêtes, réessayez dans une minute' }, 429)

      const iso = params.iso || 'US'
      const service = params.service || 'youtube'
      const provider = params.provider || 'pvapins'

      const { price: sellingPrice, cost: supplierCost, app: pvaApp } = await getSmsPrice(iso, provider)

      // Solde revendeur
      const { data: profile } = await db.from('profiles').select('balance, email').eq('id', userId).maybeSingle()
      const balance = Number(profile?.balance || 0)
      if (balance < sellingPrice) return json({ error: 'Solde insuffisant', balance, required: sellingPrice }, 402)

      let targetIso = iso
      let providerData = { Status: "Error", Error: "Provider fail", SecurityId: "", Number: "" }

      if (provider === 'smscodes') {
        const apiKey = Deno.env.get('SMSCODES_API_KEY')
        if (!apiKey) return json({ error: 'Fournisseur non disponible (API key manquante)' }, 503)
        const targetServ = service === 'youtube' ? '8a97735e-9a14-427e-8a88-e9d999bf3429' : 'google'
        const url = `https://code.smscodes.io/api/sms/GetServiceNumber?key=${apiKey}&iso=${targetIso}&serv=${targetServ}`
        const res = await fetch(url)
        const data = await res.json()
        if (data.Status === "200" || data.Status === "Success") {
          providerData = { Status: "200", Number: data.Number, SecurityId: `smscodes:${data.SecurityId}`, Error: "" }
        } else {
          return json({ error: data.Error || 'Fournisseur indisponible' }, 502)
        }
      } else if (provider === '5sim') {
        const apiKey = Deno.env.get('FIVESIM_API_KEY')
        if (!apiKey) return json({ error: 'Fournisseur non disponible (API key manquante)' }, 503)
        const fivesimCountryMap: Record<string, string> = {
          'US': 'usa', 'GB': 'england', 'FR': 'france', 'DE': 'germany', 'RU': 'russia',
          'CA': 'canada', 'ES': 'spain', 'IT': 'italy', 'UA': 'ukraine', 'PL': 'poland',
          'IN': 'india', 'ID': 'indonesia', 'BR': 'brazil', 'MX': 'mexico', 'VN': 'vietnam',
          'RO': 'romania', 'EG': 'egypt'
        }
        const countryName = fivesimCountryMap[targetIso] || targetIso.toLowerCase()
        const appName = service === 'youtube' ? 'youtube' : 'google'
        const url = `https://5sim.net/v1/user/buy/activation/${countryName}/any/${appName}`
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' } })
        if (!res.ok) return json({ error: `Erreur 5sim: ${res.statusText}` }, 502)
        const data = await res.json()
        if (data.id && data.phone) {
          providerData = { Status: "200", Number: data.phone, SecurityId: `5sim:${data.id}:${countryName}`, Error: "" }
        } else {
          return json({ error: 'Fournisseur indisponible' }, 502)
        }
      } else if (provider === 'pvapins') {
        const apiKey = Deno.env.get('PVAPINS_API_KEY')
        if (!apiKey) return json({ error: 'Fournisseur non disponible (API key manquante)' }, 503)
        const pvaCountryMap: Record<string, string> = {
          'US': 'USA', 'GB': 'UK', 'FR': 'France', 'DE': 'Germany', 'RU': 'Russia', 'CA': 'Canada'
        }
        const countryName = pvaCountryMap[targetIso] || targetIso
        // Variante YouTube la moins chère déterminée par getSmsPrice (ex: "Youtube1").
        const appName = pvaApp || (service === 'youtube' ? 'YouTube' : 'google')
        const url = `https://api.pvapins.com/user/api/get_number.php?customer=${apiKey}&app=${encodeURIComponent(appName)}&country=${encodeURIComponent(countryName)}`
        const res = await fetch(url)
        const text = await res.text()
        if (text.toLowerCase().includes('not found') || text.toLowerCase().includes('error')) {
          return json({ error: text.trim() }, 502)
        }
        let parsedNum = text.trim()
        if (parsedNum.includes(':')) {
          parsedNum = parsedNum.split(':').pop()!.trim()
        }
        providerData = { Status: "200", Number: parsedNum, SecurityId: `pvapins:${parsedNum}:${countryName}:${appName}`, Error: "" }
      } else {
        return json({ error: 'Fournisseur inconnu' }, 400)
      }

      // Enregistrer la commande temporaire dans la base de données
      const { data: order, error: oErr } = await db.from('orders').insert({
        user_id: userId,
        buyer_email: profile?.email || null,
        product_name: `SMS Verification (${service}, ${iso})`,
        total_price: sellingPrice,
        supplier_cost: supplierCost,
        quantity: 1,
        status: 'processing',
        delivery_data: {
          number: providerData.Number,
          securityId: providerData.SecurityId,
          provider: provider,
        },
        created_at: new Date().toISOString(),
      }).select('id').single()

      if (oErr || !order) return json({ error: 'Impossible de logger la réservation' }, 500)

      return json({
        order: order.id,
        number: providerData.Number,
        status: "processing"
      })
    }

    // -------- sms_get_code --------
    if (action === 'sms_get_code') {
      const orderId = params.order
      if (!orderId) return json({ error: 'order requis' }, 400)

      const { data: order } = await db.from('orders').select('*').eq('id', orderId).maybeSingle()
      if (!order || order.user_id !== userId) return json({ error: 'Commande introuvable' }, 404)

      if (order.status === 'confirmed') {
        const credentialsText = order.credentials || order.data || ''
        let code = ''
        if (credentialsText.includes('SMS Code:')) {
          code = credentialsText.split('SMS Code:')[1].split('\n')[0].trim()
        }
        return json({ status: 'Completed', sms: code })
      }
      if (order.status === 'cancelled') {
        return json({ status: 'Canceled' })
      }

      // Si c'est en cours, appeler le fournisseur
      const delivery = order.delivery_data || {}
      const securityId = delivery.securityId || ''
      const number = delivery.number || ''
      const provider = delivery.provider || ''

      let providerName = provider
      let externalSecurityId = securityId

      if (securityId.includes(':')) {
        const parts = securityId.split(':')
        providerName = parts[0]
        externalSecurityId = parts[1]
      }

      let gotCode = null
      if (providerName === 'smscodes') {
        const apiKey = Deno.env.get('SMSCODES_API_KEY')
        if (apiKey) {
          const url = `https://code.smscodes.io/api/sms/GetSMSCode?key=${apiKey}&sid=${externalSecurityId}&number=${number}`
          const res = await fetch(url)
          const dataObj = await res.json()
          if ((dataObj.Status === "200" || dataObj.Status === "Success") && dataObj.SMS) {
            if (!dataObj.SMS.toLowerCase().includes('not received') && !dataObj.SMS.toLowerCase().includes('waiting')) {
              gotCode = dataObj.SMS
            }
          }
        }
      } else if (providerName === '5sim') {
        const apiKey = Deno.env.get('FIVESIM_API_KEY')
        if (apiKey) {
          const url = `https://5sim.net/v1/user/check/${externalSecurityId}`
          const res = await fetch(url, { headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' } })
          if (res.ok) {
            const dataObj = await res.json()
            if (dataObj.sms && Array.isArray(dataObj.sms) && dataObj.sms.length > 0) {
              gotCode = dataObj.sms[0].code || dataObj.sms[0].text
            } else if (dataObj.status === 'CANCELED' || dataObj.status === 'TIMEOUT') {
              await db.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
              return json({ status: 'Canceled', error: 'expired' })
            }
          }
        }
      } else if (providerName === 'pvapins') {
        const apiKey = Deno.env.get('PVAPINS_API_KEY')
        if (apiKey) {
          const country = securityId.split(':')[2] || 'usa'
          // Variante d'app encodée à l'achat (4e segment), ex: "Youtube1".
          const appName = securityId.split(':')[3] || 'YouTube'
          const url = `https://api.pvapins.com/user/api/get_sms.php?customer=${apiKey}&number=${number}&country=${encodeURIComponent(country)}&app=${encodeURIComponent(appName)}`
          const res = await fetch(url)
          const text = await res.text()
          if (!text.toLowerCase().includes('not received') && !text.toLowerCase().includes('waiting') && !text.toLowerCase().includes('error') && !text.toLowerCase().includes('expired')) {
            let parsed = text.trim()
            if (parsed.includes(':')) {
              parsed = parsed.split(':').pop()!.trim()
            }
            gotCode = parsed
          } else if (text.toLowerCase().includes('expired') || text.toLowerCase().includes('error')) {
            await db.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
            return json({ status: 'Canceled', error: 'expired' })
          }
        }
      }

      if (gotCode) {
        // Déduction atomique SMS (FOR UPDATE — élimine la race condition)
        const price = Number(order.total_price || 0)
        const { error: deductErr } = await db.rpc('deduct_balance', { p_user_id: userId, p_amount: price })
        if (deductErr) {
          if (deductErr.message?.includes('insufficient_balance')) {
            return json({ error: 'Solde insuffisant lors du prélèvement', required: price }, 402)
          }
          return json({ error: 'Erreur de déduction du solde' }, 500)
        }

        await db.from('orders').update({
          status: 'confirmed',
          credentials: `Phone: ${number}\nSMS Code: ${gotCode}\nProvider: ${providerName}`,
          delivery_data: { ...delivery, code: gotCode }
        }).eq('id', orderId)

        return json({ status: 'Completed', sms: gotCode })
      }

      return json({ status: 'Processing' })
    }

    // -------- sms_cancel --------
    if (action === 'sms_cancel') {
      const orderId = params.order
      if (!orderId) return json({ error: 'order requis' }, 400)

      const { data: order } = await db.from('orders').select('*').eq('id', orderId).maybeSingle()
      if (!order || order.user_id !== userId) return json({ error: 'Commande introuvable' }, 404)

      if (order.status === 'confirmed') return json({ error: 'Impossible d\'annuler une commande déjà complétée' }, 400)
      if (order.status === 'cancelled') return json({ status: 'Canceled' })

      // Annuler sur le fournisseur si 5sim
      const delivery = order.delivery_data || {}
      const securityId = delivery.securityId || ''
      if (securityId.startsWith('5sim:')) {
        const apiKey = Deno.env.get('FIVESIM_API_KEY')
        const externalId = securityId.split(':')[1]
        if (apiKey && externalId) {
          await fetch(`https://5sim.net/v1/user/ban/${externalId}`, {
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' }
          }).catch(() => {})
        }
      }

      await db.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
      return json({ status: 'Canceled' })
    }

    return json({ error: `action inconnue: ${action}` }, 400)
  } catch (err) {
    console.error('api-v2 error:', (err as Error).message)
    return json({ error: (err as Error).message }, 500)
  }
})

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { getCorsHeaders, handleCors } from '../_shared/rate-limit.ts'
import { buyStaticProxies, getStaticBalance, getStaticOrder, getStaticOrderPrice, getStaticProxies, listStaticAreas } from '../_shared/provider-ipfoxy-static.ts'
import { verifyStaticQuote } from '../_shared/proxy-static-pricing.ts'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

serve(async (req) => {
  const preflight = handleCors(req)
  if (preflight) return preflight
  const headers = { ...getCorsHeaders(req), 'Content-Type': 'application/json' }
  let requestId = ''
  let admin: any = null
  let user: any = null
  let debited = false
  let supplierSubmitted = false
  try {
    if (Deno.env.get('IPFOXY_STATIC_SALES_ENABLED') !== 'true') throw new Error('Les ventes de proxies statiques sont temporairement désactivées.')
    const auth = req.headers.get('Authorization')
    if (!auth) throw new Error('Unauthorized')
    const url = Deno.env.get('SUPABASE_URL')!
    const client = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } })
    const authResult = await client.auth.getUser(auth.replace('Bearer ', ''))
    user = authResult.data.user
    if (!user) throw new Error('Unauthorized')
    const body = await req.json()
    requestId = String(body.requestId || '')
    if (!/^[0-9a-f-]{36}$/i.test(requestId)) throw new Error('Identifiant de requête invalide')
    const quote = await verifyStaticQuote(String(body.quote || ''))
    if (!quote) throw new Error('Devis invalide ou expiré. Actualisez le prix.')

    admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: previous } = await admin.from('static_proxy_purchase_requests').select('*').eq('request_id', requestId).maybeSingle()
    if (previous?.user_id && previous.user_id !== user.id) throw new Error('Invalid request owner')
    if (previous?.status === 'completed' && previous.response) return new Response(JSON.stringify(previous.response), { headers })
    if (previous?.status === 'provider_submitted' || previous?.status === 'needs_review') {
      throw new Error('Commande fournisseur déjà envoyée. Vérification manuelle en cours pour éviter un double achat.')
    }

    const area = (await listStaticAreas()).find((item) => item.id === quote.areaId && (item.status === true || item.status === 'true'))
    if (!area) throw new Error('Cette région est maintenant indisponible')
    const liveCost = await getStaticOrderPrice(quote.areaId, quote.days, quote.quantity)
    if (Math.abs(liveCost - quote.supplierCost) > 0.009) throw new Error('Le tarif fournisseur a changé. Actualisez votre devis.')
    if (await getStaticBalance() < liveCost) throw new Error('Stock fournisseur temporairement indisponible. Réessayez plus tard.')

    if (!previous) {
      const { error } = await admin.from('static_proxy_purchase_requests').insert({
        request_id: requestId, user_id: user.id, area_id: quote.areaId, days: quote.days,
        quantity: quote.quantity, supplier_cost: liveCost, sale_price: quote.salePrice,
      })
      if (error) throw error
    }
    const { error: debitError } = await admin.rpc('deduct_balance', { p_user_id: user.id, p_amount: quote.salePrice })
    if (debitError) throw new Error('Solde insuffisant')
    debited = true

    // IPFoxy ne documente pas de clé d'idempotence pour cet endpoint. Une fois
    // l'appel envoyé, toute erreur ambiguë est mise en revue au lieu de réessayer.
    let supplierOrderId: string
    try {
      supplierOrderId = await buyStaticProxies(quote.areaId, quote.days, quote.quantity)
      supplierSubmitted = true
    } catch (purchaseError) {
      // Un timeout/échec réseau après envoi est ambigu : IPFoxy peut avoir créé
      // la commande. Les erreurs métier explicites, elles, sont remboursables.
      const message = String(purchaseError?.message || '')
      supplierSubmitted = purchaseError?.name === 'AbortError' || /network|fetch|timeout|aborted/i.test(message)
      throw purchaseError
    }
    await admin.from('static_proxy_purchase_requests').update({
      status: 'provider_submitted', supplier_order_id: supplierOrderId, updated_at: new Date().toISOString(),
    }).eq('request_id', requestId)

    let proxyIds: string[] = []
    for (const delay of [0, 1000, 2000, 4000, 7000]) {
      if (delay) await wait(delay)
      const info = await getStaticOrder(supplierOrderId)
      proxyIds = Array.isArray(info?.proxy_ids) ? info.proxy_ids.map(String) : []
      if (proxyIds.length >= quote.quantity) break
    }
    if (!proxyIds.length) throw new Error('Commande acceptée par IPFoxy, attribution des IP en cours')
    const proxies = await getStaticProxies(proxyIds)
    if (proxies.length !== proxyIds.length) throw new Error('Commande acceptée par IPFoxy, identifiants en cours de génération')

    const credentials = proxies.map((proxy, index) => [
      `Proxy ${index + 1}`, `Protocol: ${proxy.type}`, `Host: ${proxy.host}`, `Port: ${proxy.port}`,
      `Username: ${proxy.user}`, `Password: ${proxy.password}`,
      `Expires: ${new Date(Number(proxy.expire_time) * 1000).toISOString()}`,
    ].join('\n')).join('\n\n')
    const { data: order, error: orderError } = await admin.from('orders').insert({
      user_id: user.id, product_name: `Proxy statique ${area.country} ${area.ip_version} - ${quote.days} jours`,
      total_price: quote.salePrice, supplier: 'ipfoxy', supplier_cost: liveCost,
      supplier_order_id: supplierOrderId, supplier_status: 'Completed', quantity: quote.quantity,
      buyer_email: user.email, status: 'delivered', delivered_at: new Date().toISOString(),
      delivery_data: { type: 'static_proxy', country: area.country, days: quote.days, proxies }, credentials,
    }).select('id').single()
    if (orderError) throw orderError
    const response = { Status: '200', orderId: order.id, credentials, proxies }
    await admin.from('static_proxy_purchase_requests').update({ status: 'completed', response, updated_at: new Date().toISOString() }).eq('request_id', requestId)
    return new Response(JSON.stringify(response), { headers })
  } catch (error) {
    if (admin && user && requestId) {
      if (debited && !supplierSubmitted) await admin.rpc('credit_balance', { p_user_id: user.id, p_amount: (await admin.from('static_proxy_purchase_requests').select('sale_price').eq('request_id', requestId).maybeSingle()).data?.sale_price || 0 })
      await admin.from('static_proxy_purchase_requests').update({
        status: supplierSubmitted ? 'needs_review' : 'failed', error_message: error.message, updated_at: new Date().toISOString(),
      }).eq('request_id', requestId)
    }
    return new Response(JSON.stringify({ error: error.message }), { headers })
  }
})

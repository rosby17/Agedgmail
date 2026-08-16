import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { getCorsHeaders, handleCors } from '../_shared/rate-limit.ts'
import { getStaticOrderPrice, listStaticAreas } from '../_shared/provider-ipfoxy-static.ts'
import { signStaticQuote, staticSalePrice } from '../_shared/proxy-static-pricing.ts'

serve(async (req) => {
  const preflight = handleCors(req)
  if (preflight) return preflight
  const headers = { ...getCorsHeaders(req), 'Content-Type': 'application/json' }
  try {
    const { areaId, days, quantity } = await req.json()
    const duration = Number(days)
    const count = Number(quantity)
    if (!areaId || ![30, 90, 180, 360].includes(duration) || !Number.isInteger(count) || count < 1 || count > 50) throw new Error('Configuration invalide')
    const area = (await listStaticAreas()).find((item) => item.id === String(areaId) && (item.status === true || item.status === 'true'))
    if (!area) throw new Error('Cette région est indisponible')
    const supplierCost = await getStaticOrderPrice(area.id, duration, count)
    const salePrice = staticSalePrice(supplierCost)
    const Quote = await signStaticQuote({ areaId: area.id, days: duration, quantity: count, supplierCost, salePrice })
    return new Response(JSON.stringify({ Status: '200', SupplierCost: supplierCost, TotalPrice: salePrice.toFixed(2), UnitPrice: (salePrice / count).toFixed(2), Quote }), { headers })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers })
  }
})

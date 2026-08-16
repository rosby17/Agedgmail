import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { getCorsHeaders, handleCors } from '../_shared/rate-limit.ts'
import { getStaticBalance, listStaticAreas } from '../_shared/provider-ipfoxy-static.ts'
import { staticSalePrice } from '../_shared/proxy-static-pricing.ts'

serve(async (req) => {
  const preflight = handleCors(req)
  if (preflight) return preflight
  const headers = { ...getCorsHeaders(req), 'Content-Type': 'application/json' }
  try {
    const [areas, balance] = await Promise.all([listStaticAreas(), getStaticBalance()])
    const available = areas.filter((area) => area.status === true || area.status === 'true').map((area) => ({
      id: area.id,
      ip_type: area.ip_type,
      ip_version: area.ip_version,
      country: area.country,
      country_code: area.country_code,
      region: area.region,
      display_price: staticSalePrice(Number(area.retail_price)).toFixed(2),
    }))
    return new Response(JSON.stringify({ Status: '200', Enabled: Deno.env.get('IPFOXY_STATIC_SALES_ENABLED') === 'true', Areas: available, SupplierFunded: balance > 0 }), { headers })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers })
  }
})

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.headers.get('x-diag-secret') !== Deno.env.get('DIAG_SECRET7')) return json({ error: 'no' }, 403)
  const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
  const { data: confirmed } = await admin.from('orders')
    .select('id, product_id, product_name, quantity, total_price, supplier, status')
    .eq('status', 'confirmed').neq('product_id', 999)
  const { data: mappings } = await admin.from('product_supplier_mapping').select('product_id, supplier, supplier_rate, active')
  let totalSold = 0, totalCostMapped = 0, mappedCount = 0, unmappedCount = 0, fallbackCost = 0
  const details = []
  for (const o of confirmed ?? []) {
    totalSold += o.total_price || 0
    const map = (mappings ?? []).find(m => m.product_id === o.product_id && (o.supplier ? m.supplier === o.supplier : m.active))
    if (map) {
      const c = (Number(map.supplier_rate) || 0) * (o.quantity || 1)
      totalCostMapped += c; mappedCount++
      details.push({ id: o.id, name: o.product_name, sold: o.total_price, cost: c, supplier: o.supplier, mapped: true })
    } else {
      const c = o.supplier ? (o.total_price * 0.7) : 0
      fallbackCost += c; unmappedCount++
      details.push({ id: o.id, name: o.product_name, sold: o.total_price, cost: c, supplier: o.supplier, mapped: false })
    }
  }
  return json({
    totalConfirmedPurchases: confirmed?.length ?? 0,
    totalSold: totalSold.toFixed(4),
    totalCostMapped: totalCostMapped.toFixed(4),
    fallbackCost: fallbackCost.toFixed(4),
    mappedCount, unmappedCount,
    netProfit_cardStyle: (totalSold - totalCostMapped - fallbackCost).toFixed(4),
    details,
  })
})

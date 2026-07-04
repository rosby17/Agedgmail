// ============================================================
// binance-submit-tx
// Étape 2 du paiement Binance Pay : le client colle l'Order ID de SA
// transaction Binance (visible dans le détail de son paiement réussi côté
// app Binance) — on l'attache à la commande pour que l'admin puisse la
// retrouver facilement dans son propre historique avant de confirmer.
// Ne crédite rien : ça reste une pièce à l'appui, pas une preuve en soi
// (un ID collé ne prouve pas le paiement — seule la vérification manuelle
// de l'admin, via binance-confirm-manual, crédite le solde).
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { orderId, binanceOrderId } = await req.json()
    if (!orderId) return json({ error: 'orderId requis' }, 400)
    if (!binanceOrderId || !String(binanceOrderId).trim()) {
      return json({ error: 'Order ID Binance requis' }, 400)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: order, error: orderErr } = await admin
      .from('orders').select('id, status').eq('id', orderId).maybeSingle()
    if (orderErr || !order) return json({ error: 'Commande introuvable' }, 404)
    if (order.status !== 'pending') return json({ error: `Commande déjà en statut "${order.status}"` }, 409)

    const { error: updErr } = await admin
      .from('orders')
      .update({ binance_tx_id: String(binanceOrderId).trim() })
      .eq('id', orderId)
    if (updErr) throw updErr

    return json({ ok: true })
  } catch (err) {
    console.error('Erreur binance-submit-tx:', (err as Error).message)
    return json({ error: (err as Error).message }, 500)
  }
})

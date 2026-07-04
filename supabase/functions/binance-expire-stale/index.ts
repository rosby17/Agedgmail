// ============================================================
// binance-expire-stale
// Annule les recharges Binance Pay restées 'pending' au-delà de leur
// expires_at (client qui a fermé la fenêtre sans payer, ou jamais payé).
// Appelée à chaque ouverture de "Mes commandes" / de la recharge — en
// attendant un vrai cron pg_cron pour un nettoyage indépendant du trafic.
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
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data, error } = await admin
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('product_id', 999)
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString())
      .not('expires_at', 'is', null)
      .select('id')

    if (error) throw error

    return json({ ok: true, expired: data?.length ?? 0 })
  } catch (err) {
    console.error('Erreur binance-expire-stale:', (err as Error).message)
    return json({ error: (err as Error).message }, 500)
  }
})

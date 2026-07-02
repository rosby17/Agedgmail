// ============================================================
// cancel-stale-orders
// Cron (~toutes les 10-15 min). Annule automatiquement les commandes de
// recharge (product_id 999) restées en 'pending' trop longtemps — cas d'un
// client qui lance un paiement crypto et ne le finalise jamais.
//
// Les commandes d'achat dropship ('processing') ont déjà leur propre
// timeout + remboursement dans ytseller-poll-orders ; on ne les touche pas ici.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STALE_MIN = 45

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  try {
    const cutoff = new Date(Date.now() - STALE_MIN * 60000).toISOString()

    const { data: staleOrders, error } = await admin
      .from('orders')
      .select('id, created_at')
      .eq('status', 'pending')
      .eq('product_id', 999)
      .lt('created_at', cutoff)

    if (error) throw new Error(error.message)

    for (const order of staleOrders ?? []) {
      await admin.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
      await admin.from('payments').update({ status: 'expired' }).eq('order_id', order.id).eq('status', 'waiting')
    }

    return new Response(JSON.stringify({ ok: true, cancelled: staleOrders?.length ?? 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erreur cancel-stale-orders:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

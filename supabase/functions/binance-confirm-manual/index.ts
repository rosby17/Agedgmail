// ============================================================
// binance-confirm-manual
// Confirmation manuelle d'une recharge Binance Pay (fallback tant que
// l'historique Binance Pay n'est pas interrogeable automatiquement, ou pour
// rattraper un cas où le matching auto aurait raté). Réservé à l'admin :
// vérifié côté serveur via le JWT de l'appelant (pas seulement côté UI).
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { notifyTelegram } from '../_shared/supplier-db.ts'

const ADMIN_EMAIL = 'rooseveltmkr@gmail.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const jwt = authHeader.replace('Bearer ', '')
    if (!jwt) return json({ error: 'Authentification requise' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anon = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '')
    const { data: userData, error: userErr } = await anon.auth.getUser(jwt)
    if (userErr || !userData?.user || userData.user.email !== ADMIN_EMAIL) {
      return json({ error: 'Réservé à l’administrateur' }, 403)
    }

    const { orderId, txRef } = await req.json()
    if (!orderId) return json({ error: 'orderId requis' }, 400)

    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    const { data: order, error: orderErr } = await admin
      .from('orders').select('*').eq('id', orderId).maybeSingle()
    if (orderErr || !order) return json({ error: 'Commande introuvable' }, 404)
    if (order.status !== 'pending') {
      return json({ error: `Commande déjà en statut "${order.status}"` }, 409)
    }

    const { data: profile, error: profileErr } = await admin
      .from('profiles').select('balance').eq('id', order.user_id).maybeSingle()
    if (profileErr || !profile) return json({ error: 'Profil introuvable' }, 404)

    const credit = order.credit_amount ?? order.total_price

    await admin.from('profiles').update({ balance: (profile.balance || 0) + credit }).eq('id', order.user_id)
    await admin.from('orders').update({
      status: 'confirmed',
      binance_tx_id: txRef ? String(txRef) : 'manual-confirm',
      confirmed_at: new Date().toISOString(),
    }).eq('id', orderId)

    await notifyTelegram(
      `✅ <b>Recharge Binance Pay validée manuellement (Admin)</b>\n\n` +
      `• <b>Client :</b> ${order.buyer_email || '—'}\n` +
      `• <b>Montant crédité :</b> $${Number(credit).toFixed(2)}\n` +
      `• <b>Réf :</b> <code>${txRef || 'manual-confirm'}</code>`
    )

    return json({ ok: true, credited: credit })
  } catch (err) {
    console.error('Erreur binance-confirm-manual:', (err as Error).message)
    return json({ error: (err as Error).message }, 500)
  }
})

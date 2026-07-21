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

// Bonus de recharge par palier — DOIT rester identique à nowpayments-create /
// cryptomus-create. Le crédit est recalculé ici côté serveur pour ne jamais
// faire confiance au `credit_amount` inséré par le client (falsifiable).
const BONUS_TIERS = [
  { min: 10000, pct: 4 },
  { min: 1000, pct: 3 },
  { min: 500, pct: 2 },
  { min: 100, pct: 1 },
]
const bonusPercentFor = (amountUsd: number): number =>
  BONUS_TIERS.find((t) => amountUsd >= t.min)?.pct ?? 0

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

    const { orderId, txRef, verifiedAmount } = await req.json()
    if (!orderId) return json({ error: 'orderId requis' }, 400)

    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    const { data: order, error: orderErr } = await admin
      .from('orders').select('*').eq('id', orderId).maybeSingle()
    if (orderErr || !order) return json({ error: 'Commande introuvable' }, 404)
    if (order.status !== 'pending') {
      return json({ error: `Commande déjà en statut "${order.status}"` }, 409)
    }

    // SÉCURITÉ (anti-fraude recharge manuelle) : le montant crédité est calculé
    // ICI, côté serveur, à partir du montant réellement vérifié par l'admin
    // (verifiedAmount) — JAMAIS à partir de order.credit_amount / order.total_price
    // qui sont insérés par le client au moment du dépôt et donc falsifiables.
    // Le bonus par palier est ré-appliqué serveur pour rester cohérent.
    const base = Number(verifiedAmount) > 0
      ? Number(verifiedAmount)
      : Number(order.expected_amount ?? 0)
    if (!base || base <= 0) {
      return json({ error: 'Montant vérifié requis (montant réellement reçu).' }, 400)
    }
    const credit = Math.round(base * (1 + bonusPercentFor(base) / 100) * 100) / 100

    await admin.rpc('credit_balance', { p_user_id: order.user_id, p_amount: credit })
    await admin.from('orders').update({
      status: 'confirmed',
      binance_tx_id: txRef ? String(txRef) : 'manual-confirm',
      confirmed_at: new Date().toISOString(),
    }).eq('id', orderId)

    await admin.from('notifications').insert({
      user_id: order.user_id,
      type: 'success',
      title: 'Recharge confirmée',
      message: `Votre recharge de $${Number(credit).toFixed(2)} a été validée avec succès.`,
    })

    const methodLabel = order.payment_method === 'usdt_trc20' ? 'USDT (TRC20)' : order.payment_method === 'mobile_money' ? 'Mobile Money' : 'Binance Pay';

    await notifyTelegram(
      `✅ <b>Recharge ${methodLabel} validée manuellement</b>\n\n` +
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

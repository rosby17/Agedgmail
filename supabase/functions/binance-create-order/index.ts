// ============================================================
// binance-create-order
// Crée une commande de recharge "pending" payée via Binance (Pay ID pour
// l'instant ; USDT-TRC20/LTC viendront ensuite avec le matching auto).
//
// LOGIQUE CRITIQUE — identification du client :
// Le montant reste EXACT et rond (ex. 50.00 $, jamais 50.0037 $) : ajouter
// des centimes aléatoires pour distinguer les paiements donnait une image peu
// professionnelle. À la place, chaque UTILISATEUR (pas chaque commande) a un
// code de paiement PERMANENT (profiles.payment_code, généré une seule fois,
// cf. migration profile_payment_code.sql) que le client colle dans la note
// de son paiement Binance Pay. C'est ce code — pas le montant — qui permet
// d'identifier qui a payé ; l'admin croise ensuite avec le montant exact et
// la commande 'pending' correspondante pour créditer la bonne personne.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const BONUS_TIERS = [
  { min: 10000, pct: 4 },
  { min: 1000, pct: 3 },
  { min: 500, pct: 2 },
  { min: 100, pct: 1 },
]
function bonusPercentFor(amountUsd: number): number {
  return BONUS_TIERS.find((t) => amountUsd >= t.min)?.pct ?? 0
}

const EXPIRY_MINUTES = 20

const METHOD_LABELS: Record<string, string> = {
  binance_pay: 'Binance Pay',
  usdt_trc20: 'USDT (TRC20)',
  ltc: 'LTC',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { userId, email, amountUsd, paymentMethod } = await req.json()

    if (!userId || !email) return json({ error: 'userId et email requis' }, 400)
    if (!amountUsd || amountUsd <= 0) return json({ error: 'Montant invalide' }, 400)
    if (!paymentMethod || !METHOD_LABELS[paymentMethod]) {
      return json({ error: 'Méthode de paiement invalide' }, 400)
    }
    // Seul Binance Pay est branché pour l'instant (confirmation manuelle en
    // attendant l'accès à l'historique de dépôts USDT-TRC20/LTC).
    if (paymentMethod !== 'binance_pay') {
      return json({ error: 'Cette méthode arrive bientôt, utilise Binance Pay pour le moment.' }, 400)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    const payId = Deno.env.get('BINANCE_PAY_ID') ?? ''
    if (!payId) throw new Error('BINANCE_PAY_ID non configuré côté serveur')

    // Récupère (ou génère paresseusement, pour les comptes créés avant la
    // migration ou sans trigger de génération) le code de paiement permanent.
    const { data: profile, error: profileErr } = await admin
      .from('profiles').select('payment_code').eq('id', userId).maybeSingle()
    if (profileErr) throw profileErr

    let paymentCode = profile?.payment_code || null
    if (!paymentCode) {
      paymentCode = `AG-${userId.replace(/-/g, '').slice(0, 8).toUpperCase()}`
      const { error: updErr } = await admin.from('profiles').update({ payment_code: paymentCode }).eq('id', userId)
      if (updErr) throw updErr
    }

    const bonusPct = bonusPercentFor(amountUsd)
    const creditAmount = Math.round(amountUsd * (1 + bonusPct / 100) * 100) / 100
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60_000).toISOString()

    // Montant exact demandé, sans decimales cosmétiques ajoutées.
    const expectedAmount = Math.round(amountUsd * 100) / 100

    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        user_id: userId,
        buyer_email: email,
        product_id: 999,
        product_name: `Recharge ${METHOD_LABELS[paymentMethod]}${bonusPct ? ` — bonus +${bonusPct}%` : ''}`,
        quantity: 1,
        total_price: amountUsd,
        credit_amount: creditAmount,
        status: 'pending',
        payment_method: paymentMethod,
        expected_amount: expectedAmount,
        expires_at: expiresAt,
      })
      .select('id')
      .single()

    if (orderErr || !order) throw new Error(orderErr?.message || 'Création de commande échouée')

    return json({
      orderId: order.id,
      paymentMethod,
      payId,
      expectedAmount,
      creditAmount,
      bonusPct,
      expiresInMinutes: EXPIRY_MINUTES,
      paymentCode,
    })
  } catch (err) {
    console.error('Erreur binance-create-order:', (err as Error).message)
    return json({ error: (err as Error).message }, 500)
  }
})

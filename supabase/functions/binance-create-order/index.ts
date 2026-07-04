// ============================================================
// binance-create-order
// Crée une commande de recharge "pending" payée via Binance (Pay ID pour
// l'instant ; USDT-TRC20/LTC viendront ensuite avec le matching auto).
//
// LOGIQUE CRITIQUE — montant unique :
// Plusieurs clients paient vers le même Pay ID / la même adresse. Pour
// distinguer "qui a payé quoi" sans référence de commande dans le virement,
// chaque commande reçoit un montant légèrement décalé (delta aléatoire entre
// 0.0001 et 0.0099) par rapport au montant demandé. Deux commandes 'pending'
// ne peuvent jamais partager le même expected_amount (contrainte unique
// partielle en base, cf. migration binance_payments.sql) : si une collision
// survient (très rare), on retire un nouveau delta jusqu'à obtenir un montant
// libre, avec un nombre de tentatives borné pour ne jamais boucler à l'infini.
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
const MAX_DELTA_ATTEMPTS = 15

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

    const bonusPct = bonusPercentFor(amountUsd)
    const creditAmount = Math.round(amountUsd * (1 + bonusPct / 100) * 100) / 100

    // Génère un montant unique parmi les commandes 'pending' : on retire le
    // delta jusqu'à trouver un montant libre (la contrainte unique en base
    // est le garde-fou final contre une éventuelle course entre requêtes).
    let expectedAmount = amountUsd
    let order: { id: string } | null = null
    let lastError: string | null = null

    for (let attempt = 0; attempt < MAX_DELTA_ATTEMPTS; attempt++) {
      const delta = Math.round((0.0001 + Math.random() * (0.0099 - 0.0001)) * 10000) / 10000
      expectedAmount = Math.round((amountUsd + delta) * 10000) / 10000

      const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60_000).toISOString()
      const { data, error } = await admin
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

      if (!error && data) { order = data; break }
      // 23505 = violation de contrainte unique (montant déjà pris) -> on retente
      lastError = error?.message ?? null
      if (error?.code !== '23505') break
    }

    if (!order) throw new Error(lastError || 'Impossible de générer un montant unique, réessaie.')

    // Code de référence à coller dans la note de paiement Binance Pay —
    // dérivé de l'id de commande (déjà unique), donc jamais de collision
    // possible même si deux commandes partagent un instant de création.
    const noteCode = `AG${String(order.id).replace(/-/g, '').slice(0, 6).toUpperCase()}`
    await admin.from('orders').update({ note_code: noteCode }).eq('id', order.id)

    return json({
      orderId: order.id,
      paymentMethod,
      payId,
      expectedAmount,
      creditAmount,
      bonusPct,
      expiresInMinutes: EXPIRY_MINUTES,
      noteCode,
    })
  } catch (err) {
    console.error('Erreur binance-create-order:', (err as Error).message)
    return json({ error: (err as Error).message }, 500)
  }
})

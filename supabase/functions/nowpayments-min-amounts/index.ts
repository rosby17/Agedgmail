// ============================================================
// nowpayments-min-amounts
// Retourne le montant minimum de dépôt (en USD) pour chaque crypto
// supportée, pour affichage explicite côté client avant tout paiement.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getMinAmount } from '../_shared/nowpayments.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CURRENCIES = ['btc', 'eth', 'usdttrc20', 'ltc']

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const results = await Promise.all(
      CURRENCIES.map(async (cur) => {
        try {
          const { minAmountUsd } = await getMinAmount(cur)
          return [cur, minAmountUsd] as const
        } catch (err) {
          console.error(`min-amount ${cur} error:`, (err as Error).message)
          return [cur, null] as const
        }
      }),
    )
    const payload = Object.fromEntries(results)
    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erreur nowpayments-min-amounts:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

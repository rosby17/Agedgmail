// ============================================================
// proxy-get-prices
// Liste les paliers GB disponibles avec prix marge appliquée + devis signé.
// Public (pas d'auth requise), pas de stock à interroger par pays contrairement
// à sms-get-prices — le ciblage pays est un paramètre de connexion IPRoyal,
// pas un différenciateur de prix à l'achat.
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders, handleCors } from '../_shared/rate-limit.ts';
import { PROXY_PLANS, applyProxyMargin, signProxyQuote } from '../_shared/proxy-pricing.ts';

serve(async (req) => {
  const corsOpts = handleCors(req);
  if (corsOpts) return corsOpts;
  const corsHeaders = getCorsHeaders(req);

  try {
    const plans = await Promise.all(PROXY_PLANS.map(async (plan) => {
      const price = applyProxyMargin();
      const total = Math.ceil(price * plan.gb * 100) / 100;
      return {
        Id: plan.id,
        Gb: plan.gb,
        Label: plan.label,
        PricePerGb: price.toFixed(2),
        TotalPrice: total.toFixed(2),
        Quote: await signProxyQuote(plan.id, plan.gb, total),
      };
    }));

    return new Response(JSON.stringify({ Status: "200", Plans: plans }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});

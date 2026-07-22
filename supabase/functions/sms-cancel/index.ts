// ============================================================
// sms-cancel
// Libère immédiatement un numéro SMS réservé côté fournisseur quand le client
// annule ou que le délai expire (au lieu d'attendre l'auto-libération).
//
// - PVAPins : endpoint legacy get_reject_number.php (même clé `customer`).
//             À défaut d'annulation, PVAPins libère le numéro seul après 20 min.
// - SMSCodes : pay-on-receipt, pas d'endpoint d'annulation — le numéro se
//              libère seul et n'est jamais facturé sans code reçu. No-op.
//
// Aucune écriture en base : le flux storefront ne crée la commande QUE lorsque
// le code arrive, donc aucun solde n'a été réservé — rien à rembourser ici.
// ============================================================
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { providerForAlias } from '../_shared/sms-pricing.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !user) throw new Error(`Unauthorized: ${userError?.message || 'No user found'}`);

    const { securityId, number, provider } = await req.json();
    if (!securityId && !number) throw new Error('Missing parameters');

    // Déterminer le fournisseur depuis le préfixe du securityId (alias opaque,
    // ex: "p1:441234:UK"), avec repli sur le champ `provider`. Conversion en
    // vrai nom fournisseur côté serveur uniquement — jamais renvoyé au client.
    let providerAlias = provider || 'p2';
    if (typeof securityId === 'string' && securityId.includes(':')) {
      providerAlias = securityId.split(':')[0];
    }
    const providerName = providerForAlias(providerAlias);

    let released = false;
    let detail = '';

    if (providerName === 'pvapins') {
      const apiKey = Deno.env.get('PVAPINS_API_KEY');
      if (apiKey && number) {
        // get_reject_number.php : ne se base que sur le NUMÉRO (country/app sont
        // ignorés). Réponse en texte brut ("Number Rejected." = succès).
        // Contrainte PVAPins : annulable uniquement APRÈS 2 min et AVANT l'arrivée
        // d'un code — sinon "Not able to reject." (sans gravité : auto-libération
        // à 20 min, et jamais facturé sans code reçu).
        const url = `https://api.pvapins.com/user/api/get_reject_number.php?customer=${apiKey}&number=${encodeURIComponent(number)}`;
        try {
          const res = await fetch(url);
          detail = (await res.text()).trim();
          released = detail.toLowerCase().includes('rejected');
        } catch (_e) {
          // Non bloquant : l'auto-libération prendra le relais.
          detail = 'request_failed';
        }
      }
    }
    // smscodes : rien à faire (pas d'endpoint, auto-libération, jamais facturé).

    // Ne jamais renvoyer le vrai nom fournisseur au client : on renvoie l'alias.
    return new Response(JSON.stringify({ status: 'ok', released, provider: providerAlias, detail }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});

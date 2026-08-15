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
// Aucun solde client n'a été réservé (jamais facturé sans code reçu) — rien à
// rembourser ici. On journalise quand même une commande status='cancelled'
// (montant $0) pour que la tentative reste visible en admin/historique client
// au lieu de disparaître sans trace (numéro réservé + éventuel coût fournisseur
// perdu, mais invisible jusqu'ici).
// ============================================================
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { providerForAlias } from '../_shared/sms-pricing.ts';
import { getCorsHeaders, handleCors } from '../_shared/rate-limit.ts';
import { cancel5simNumber } from '../_shared/provider-5sim.ts';

serve(async (req) => {
  const corsOpts = handleCors(req);
  if (corsOpts) return corsOpts;
  const corsHeaders = getCorsHeaders(req);

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

    const { securityId, number, provider, reason } = await req.json();
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
    } else if (providerName === 'fivesim') {
      const externalId = typeof securityId === 'string' ? securityId.split(':')[1] : '';
      if (externalId) {
        released = await cancel5simNumber(externalId);
        detail = released ? 'canceled' : 'request_failed';
      }
    }
    // smscodes : rien à faire (pas d'endpoint, auto-libération, jamais facturé).

    // Journalise la tentative annulée/expirée, même sans code reçu et sans
    // débit — sinon elle disparaît sans laisser de trace ni pour l'admin
    // (OrdersAdmin) ni pour le client (MyOrdersView). Best-effort : un échec
    // d'écriture ne doit jamais faire échouer la libération du numéro.
    try {
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      await supabaseAdmin.from('orders').insert({
        user_id: user.id,
        product_name: 'SMS Verification (annulé)',
        total_price: 0,
        supplier_cost: 0,
        quantity: 1,
        buyer_email: user.email,
        status: 'cancelled',
        delivery_data: { number: number || null, provider: providerAlias, reason: reason || 'cancelled' },
        credentials: number ? `Phone: ${number}\nStatut: ${reason === 'timeout' ? 'Expiré (aucun code reçu)' : 'Annulé par le client'}` : null,
      });
    } catch (logErr) {
      console.error('sms-cancel: failed to log cancelled order', logErr);
    }

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

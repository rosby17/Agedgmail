// ============================================================
// proxy-purchase
// Achat de GB proxy résidentiel (IPRoyal). Contrairement au flux SMS
// (débit APRÈS confirmation du code reçu), la livraison ici est synchrone :
// on appelle IPRoyal D'ABORD, on ne débite le solde client QUE si le
// fournisseur confirme — évite tout besoin de remboursement en cas d'échec
// fournisseur (pas de réservation à libérer comme pour un numéro SMS).
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getCorsHeaders, handleCors } from '../_shared/rate-limit.ts';
import { verifyProxyQuote } from '../_shared/proxy-pricing.ts';
import { createOrTopupSubuser } from '../_shared/provider-iproyal.ts';

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

    const { quote } = await req.json();
    if (!quote) throw new Error('Missing quote');

    // SÉCURITÉ : prix et GB viennent du devis SIGNÉ (HMAC serveur), jamais du
    // client — voir proxy-pricing.ts, même principe que le securityId SMS.
    const verified = await verifyProxyQuote(quote);
    if (!verified) throw new Error('Devis invalide ou expiré. Rechargez la page et réessayez.');
    const { gb, price } = verified;

    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('balance').eq('id', user.id).single();
    if (!profile || profile.balance < price) {
      throw new Error('Insufficient balance');
    }

    const { data: existing } = await supabaseAdmin
      .from('proxy_accounts').select('*').eq('user_id', user.id).maybeSingle();

    // Appel fournisseur AVANT tout débit — voir commentaire d'en-tête.
    const result = await createOrTopupSubuser(
      user.id,
      gb,
      existing?.iproyal_subuser_id || null,
      existing ? { username: existing.gateway_username, password: existing.gateway_password } : null,
    );

    const { error: deductErr } = await supabaseAdmin.rpc('deduct_balance', {
      p_user_id: user.id,
      p_amount: price,
    });
    if (deductErr) throw new Error('Insufficient balance at time of charge or user not found');

    await supabaseAdmin.from('proxy_accounts').upsert({
      user_id: user.id,
      iproyal_subuser_id: result.subuserId,
      gateway_host: result.host,
      gateway_port: result.port,
      gateway_username: result.username,
      gateway_password: result.password,
      total_gb_purchased: (Number(existing?.total_gb_purchased) || 0) + gb,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    const credentials = `Host: ${result.host}\nPort: ${result.port}\nUsername: ${result.username}\nPassword: ${result.password}\n\nCiblage pays (optionnel) : ajoutez _country-XX au mot de passe, ex: ${result.password}_country-fr`;

    await supabaseAdmin.from('orders').insert({
      user_id: user.id,
      product_name: `Proxy résidentiel - ${gb} GB`,
      total_price: price,
      supplier_cost: 0,
      quantity: 1,
      buyer_email: user.email,
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      delivery_data: { host: result.host, port: result.port, username: result.username, password: result.password, gb },
      credentials,
    });

    return new Response(JSON.stringify({ Status: "200", ...result, credentials }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    let errorMessage = error.message;
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});

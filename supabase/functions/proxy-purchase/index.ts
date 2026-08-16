// ============================================================
// proxy-purchase
// Achat de GB proxy résidentiel. Contrairement au flux SMS
// (débit APRÈS confirmation du code reçu), la livraison ici est synchrone :
// on appelle IPRoyal D'ABORD, on ne débite le solde client QUE si le
// fournisseur confirme — évite tout besoin de remboursement en cas d'échec
// fournisseur (pas de réservation à libérer comme pour un numéro SMS).
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getCorsHeaders, handleCors } from '../_shared/rate-limit.ts';
import { proxyCostPerGb, verifyProxyQuote } from '../_shared/proxy-pricing.ts';
import { configuredProxyProvider, provisionProxyTraffic } from '../_shared/proxy-provider.ts';

async function compactIdempotencyKey(requestId: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(requestId))
  return Array.from(new Uint8Array(digest)).slice(0, 10)
    .map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  const corsOpts = handleCors(req);
  if (corsOpts) return corsOpts;
  const corsHeaders = getCorsHeaders(req);

  try {
    if (Deno.env.get('PROXY_SALES_ENABLED') !== 'true') {
      throw new Error('Les ventes proxy sont temporairement désactivées.');
    }

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

    const { quote, requestId } = await req.json();
    if (!quote) throw new Error('Missing quote');
    if (!requestId || !/^[0-9a-f-]{36}$/i.test(requestId)) throw new Error('Missing or invalid requestId');

    // SÉCURITÉ : prix et GB viennent du devis SIGNÉ (HMAC serveur), jamais du
    // client — voir proxy-pricing.ts, même principe que le securityId SMS.
    const verified = await verifyProxyQuote(quote);
    if (!verified) throw new Error('Devis invalide ou expiré. Rechargez la page et réessayez.');
    const { gb, price } = verified;

    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const provider = configuredProxyProvider();

    // Durable request identity: retries reuse IPFoxy's same idempotency key.
    const { data: previous } = await supabaseAdmin
      .from('proxy_purchase_requests').select('*').eq('request_id', requestId).maybeSingle();
    if (previous?.user_id && previous.user_id !== user.id) throw new Error('Invalid request owner');
    if (previous?.status === 'completed' && previous.response) {
      return new Response(JSON.stringify(previous.response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }

    if (!previous) {
      const { error: requestErr } = await supabaseAdmin.from('proxy_purchase_requests').insert({
        request_id: requestId, user_id: user.id, provider, gb, price, status: 'pending',
      });
      if (requestErr && requestErr.code !== '23505') throw requestErr;
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('balance').eq('id', user.id).single();
    if (!profile || profile.balance < price) {
      throw new Error('Insufficient balance');
    }

    const { data: existing } = await supabaseAdmin
      .from('proxy_accounts').select('*').eq('user_id', user.id).maybeSingle();

    // Réservation atomique du solde avant l'appel fournisseur : deux achats
    // simultanés ne peuvent pas provisionner plus que le solde disponible.
    const { error: deductErr } = await supabaseAdmin.rpc('deduct_balance', {
      p_user_id: user.id,
      p_amount: price,
    });
    if (deductErr) throw new Error('Insufficient balance at time of charge or user not found');

    let result;
    try {
      // IPFoxy déduplique les retries avec cette clé stable de 20 caractères
      // (contrainte documentée: 10-25).
      result = await provisionProxyTraffic(
        user.id,
        gb,
        await compactIdempotencyKey(requestId),
        existing,
      );
    } catch (providerError) {
      // Le fournisseur n'a pas confirmé : restitution immédiate du solde.
      await supabaseAdmin.rpc('credit_balance', { p_user_id: user.id, p_amount: price });
      await supabaseAdmin.from('proxy_purchase_requests').update({
        status: 'failed', error_message: providerError.message,
        updated_at: new Date().toISOString(),
      }).eq('request_id', requestId);
      throw providerError;
    }

    await supabaseAdmin.from('proxy_accounts').upsert({
      user_id: user.id,
      provider: result.provider,
      provider_account_id: result.accountId,
      iproyal_subuser_id: result.provider === 'iproyal' ? result.accountId : existing?.iproyal_subuser_id || null,
      gateway_host: result.host,
      gateway_port: result.port,
      gateway_username: result.username,
      gateway_password: result.password,
      total_gb_purchased: (Number(existing?.total_gb_purchased) || 0) + gb,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    const targeting = result.provider === 'ipfoxy'
      ? `Ciblage pays : ajoutez -cc-XX au nom d'utilisateur, ex: ${result.username}-cc-FR\nSession stable : ajoutez -sessid-VOTREID-ttl-60 au nom d'utilisateur.`
      : `Ciblage pays : ajoutez _country-XX au mot de passe, ex: ${result.password}_country-fr`;
    const credentials = `Host: ${result.host}\nPort: ${result.port}\nUsername: ${result.username}\nPassword: ${result.password}\n\n${targeting}`;

    await supabaseAdmin.from('orders').insert({
      user_id: user.id,
      product_name: `Proxy résidentiel - ${gb} GB`,
      total_price: price,
      supplier: result.provider,
      supplier_cost: Math.ceil(proxyCostPerGb() * gb * 100) / 100,
      quantity: 1,
      buyer_email: user.email,
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      delivery_data: { provider: result.provider, host: result.host, port: result.port, username: result.username, password: result.password, gb },
      credentials,
    });

    const responsePayload = { Status: "200", ...result, credentials };
    await supabaseAdmin.from('proxy_purchase_requests').update({
      status: 'completed', response: responsePayload, updated_at: new Date().toISOString(),
    }).eq('request_id', requestId);

    return new Response(JSON.stringify(responsePayload), {
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

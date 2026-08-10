import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { checkRateLimit, getCorsHeaders, handleCors } from '../_shared/rate-limit.ts';
import { notifyTelegram } from '../_shared/supplier-db.ts';

serve(async (req) => {
  // Préflight CORS — restreint à l'origine de prod
  const corsOpts = handleCors(req);
  if (corsOpts) return corsOpts;
  const corsHeaders = getCorsHeaders(req);

  try {
    // ── 1. VÉRIFICATION JWT ────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authErr } = await supabaseClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Client admin (service role) pour les écritures qui DOIVENT réussir
    // (insert + pose du pay_id) — le client utilisateur est soumis aux
    // policies RLS, qui peuvent bloquer silencieusement un update sans
    // renvoyer d'erreur exploitable (c'est ce qui a laissé des commandes
    // avec pay_id NULL, jamais reprises par le poller de vérification).
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // ── 2. RATE LIMITING : 10 initiations de paiement par heure ──────────
    const allowed = await checkRateLimit(user.id, 'maketou_checkout', 10, 3600);
    if (!allowed) {
      return new Response(JSON.stringify({
        error: 'Trop de tentatives de paiement. Limite : 10 par heure.'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    const { userId, email, amountUsd, bonusPct = 0 } = await req.json();

    // ── 3. CONTRÔLE D'OWNERSHIP : le userId du body doit correspondre au JWT
    if (!userId || userId !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden: userId mismatch" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    if (!amountUsd || amountUsd <= 0) {
      throw new Error("Invalid request data");
    }

    // Récupérer le taux de conversion en direct sur Binance P2P
    let EXCHANGE_RATE = parseInt(Deno.env.get("USD_TO_FCFA_RATE") || "600", 10);
    try {
      const binanceRes = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset: "USDT", tradeType: "BUY", fiat: "XAF", transAmount: "", order: "", page: 1, rows: 1, filterType: "all" })
      });
      if (binanceRes.ok) {
        const data = await binanceRes.json();
        if (data && data.data && data.data.length > 0) {
          EXCHANGE_RATE = parseFloat(data.data[0].adv.price);
        }
      }
    } catch (e) {
      console.warn("Could not fetch Binance rate, falling back to default.", e);
    }

    // On applique 10% de frais pour le Mobile Money (couvre Maketou + retrait)
    const totalUsd = amountUsd * 1.10;
    const amountFcfa = Math.round(totalUsd * EXCHANGE_RATE);

    const maketouApiKey = Deno.env.get("MAKETOU_API_KEY");
    const maketouProductId = Deno.env.get("MAKETOU_PRODUCT_ID");
    if (!maketouApiKey || !maketouProductId) {
      throw new Error("Maketou API credentials are not configured.");
    }

    // Récupérer le nom de l'utilisateur (Maketou exige un nom/prénom)
    let firstName = "Client";
    let lastName = "AgedGmail";
    const { data: profile } = await supabaseClient
      .from('profiles').select('display_name').eq('id', userId).single();
    if (profile?.display_name) {
      const parts = profile.display_name.split(' ');
      firstName = parts[0] || firstName;
      lastName = parts.slice(1).join(' ') || lastName;
    }

    // 1. Enregistrer la commande comme "pending"
    const { data: order, error: dbError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        buyer_email: email,
        product_id: 999,
        product_name: 'Dépôt Mobile Money',
        quantity: 1,
        total_price: totalUsd,
        expected_amount: totalUsd,
        credit_amount: amountUsd * (1 + bonusPct / 100),
        payment_method: 'mobile_money',
        status: "pending",
      })
      .select("id")
      .single();

    if (dbError || !order) {
      throw new Error("Failed to create local pending order.");
    }

    // 2. Créer le panier sur Maketou
    const payload = {
      productDocumentId: maketouProductId,
      email: email || "contact@agedgmail.com",
      firstName,
      lastName,
      customerPrice: amountFcfa,
      redirectURL: `https://app.agedgmail.tools-cl.com/dashboard`,
      meta: { userId, orderId: order.id, source: "agedgmail_recharge" }
    };

    const maketouResponse = await fetch("https://api.maketou.net/api/v1/stores/cart/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${maketouApiKey}` },
      body: JSON.stringify(payload)
    });

    if (!maketouResponse.ok) {
      const errorText = await maketouResponse.text();
      console.error("Maketou error:", errorText);
      throw new Error("Failed to initialize Maketou checkout.");
    }

    const maketouData = await maketouResponse.json();
    if (!maketouData.redirectUrl || !maketouData.cart?.id) {
      throw new Error("Invalid response from Maketou API.");
    }

    const { error: payIdErr } = await supabaseAdmin
      .from("orders").update({ pay_id: maketouData.cart.id }).eq("id", order.id);
    if (payIdErr) {
      // Le panier Maketou existe déjà et le client va être redirigé pour payer —
      // on ne peut plus annuler proprement, mais on doit savoir que ce dépôt ne
      // sera JAMAIS repris par le poller automatique (il filtre sur pay_id non
      // nul). Alerte Telegram pour suivi manuel plutôt qu'échec silencieux.
      console.error(`CRITICAL: failed to save pay_id ${maketouData.cart.id} on order ${order.id}:`, payIdErr.message);
      notifyTelegram(`⚠️ Dépôt Mobile Money : impossible d'enregistrer le pay_id sur la commande ${order.id} (cart Maketou ${maketouData.cart.id}). Vérifier manuellement — ce dépôt ne sera pas repris automatiquement.`).catch(() => {});
    }

    return new Response(JSON.stringify({
      redirectUrl: maketouData.redirectUrl,
      orderId: order.id,
      cartId: maketouData.cart.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in maketou-create-checkout:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

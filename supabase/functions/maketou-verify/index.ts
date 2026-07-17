import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── 1. VÉRIFICATION DU JWT APPELANT ──────────────────────────
    // On crée d'abord un client "utilisateur" pour valider son identité.
    // getUser() vérifie le JWT côté serveur Supabase (pas juste localStorage).
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authErr } = await supabaseUser.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // ── 2. CLIENT ADMIN pour les opérations critiques (bypass RLS) ──
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { cartId, orderId } = await req.json();

    if (!cartId && !orderId) {
      throw new Error("Missing cartId or orderId");
    }

    // Récupérer la clé API Maketou
    const maketouApiKey = Deno.env.get("MAKETOU_API_KEY");
    if (!maketouApiKey) {
      throw new Error("Maketou API credentials are not configured.");
    }

    // ── 3. TROUVER L'ORDRE ────────────────────────────────────────
    const query = supabaseAdmin.from("orders").select("*");
    if (cartId) {
      query.eq("pay_id", cartId);
    } else {
      query.eq("id", orderId);
    }
    
    const { data: order, error: orderError } = await query.single();
    
    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // ── 4. CONTRÔLE D'OWNERSHIP ──────────────────────────────────
    // Un utilisateur ne peut vérifier QUE ses propres commandes.
    if (order.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    if (order.status === "completed" || order.status === "confirmed") {
      return new Response(JSON.stringify({ status: "already_completed", message: "Order is already completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const cartIdToVerify = cartId || order.pay_id;
    if (!cartIdToVerify) {
      throw new Error("No cartId associated with this order");
    }

    // ── 5. VÉRIFICATION CÔTÉ MAKETOU ─────────────────────────────
    const maketouResponse = await fetch(`https://api.maketou.net/api/v1/stores/cart/${cartIdToVerify}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${maketouApiKey}`
      }
    });

    if (!maketouResponse.ok) {
      throw new Error("Failed to verify cart on Maketou");
    }

    const maketouData = await maketouResponse.json();
    
    // Status de maketou : "waiting_payment", "completed", "abandoned", "payment_failed"
    const cartStatus = maketouData.status;

    if (cartStatus === "completed") {
      // Le paiement est reçu, on crédite l'utilisateur !
      // Créditer l'utilisateur de manière atomique (TOCTOU fix)
      await supabaseAdmin.rpc('credit_balance', { 
        p_user_id: order.user_id, 
        p_amount: order.credit_amount 
      });

      // Mettre à jour le statut de l'ordre
      await supabaseAdmin
        .from("orders")
        .update({ status: "confirmed", updated_at: new Date().toISOString() })
        .eq("id", order.id);
        
      return new Response(JSON.stringify({ 
        status: "success", 
        message: "Payment verified and account credited"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ 
      status: "pending", 
      message: `Payment is still ${cartStatus}`,
      maketouStatus: cartStatus
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in maketou-verify:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});


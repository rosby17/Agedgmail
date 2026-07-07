import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Gérer la requête preflight (CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { userId, email, amountUsd, bonusPct = 0 } = await req.json();

    if (!userId || !amountUsd || amountUsd <= 0) {
      throw new Error("Invalid request data");
    }

    // Taux de conversion : ex. 1 USD = 650 FCFA (à adapter plus tard dynamiquement ou via variable d'environnement)
    const EXCHANGE_RATE = parseInt(Deno.env.get("USD_TO_FCFA_RATE") || "650", 10);
    // On applique 8% de frais pour le Mobile Money
    const totalUsd = amountUsd * 1.08;
    const amountFcfa = Math.round(totalUsd * EXCHANGE_RATE);

    // Clé API et ID produit Maketou depuis les variables d'environnement
    const maketouApiKey = Deno.env.get("MAKETOU_API_KEY");
    const maketouProductId = Deno.env.get("MAKETOU_PRODUCT_ID");
    
    if (!maketouApiKey || !maketouProductId) {
      throw new Error("Maketou API credentials are not configured.");
    }

    // Récupérer le nom et prénom de l'utilisateur s'ils existent (Maketou exige un nom/prénom)
    let firstName = "Client";
    let lastName = "AgedGmail";
    
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single();
      
    if (profile?.display_name) {
      const parts = profile.display_name.split(' ');
      firstName = parts[0] || firstName;
      lastName = parts.slice(1).join(' ') || lastName;
    }

    // 1. Enregistrer la commande dans la base de données comme "pending"
    // L'ID du cart Maketou sera enregistré ultérieurement ou on passe l'ID de commande locale en "meta".
    const { data: order, error: dbError } = await supabaseClient
      .from("orders")
      .insert({
        user_id: userId,
        buyer_email: email,
        product_id: 999,
        product_name: 'Dépôt Mobile Money (Maketou)',
        quantity: 1,
        total_price: totalUsd,
        expected_amount: totalUsd,
        credit_amount: amountUsd * (1 + bonusPct / 100), // Ce que le client reçoit en solde ! (sans les 8% de frais)
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
      firstName: firstName,
      lastName: lastName,
      customerPrice: amountFcfa, // Prix libre
      redirectURL: `https://app.agedgmail.tools-cl.com/dashboard`, // A remplacer par le vrai lien de ton site en prod
      meta: {
        userId: userId,
        orderId: order.id,
        source: "agedgmail_recharge"
      }
    };

    const maketouResponse = await fetch("https://api.maketou.net/api/v1/stores/cart/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${maketouApiKey}`
      },
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
    
    // Mettre à jour l'ordre avec le cartId Maketou pour faciliter la vérification
    await supabaseClient
      .from("orders")
      .update({ pay_id: maketouData.cart.id })
      .eq("id", order.id);

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

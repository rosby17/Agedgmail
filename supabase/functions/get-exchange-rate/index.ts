import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const binanceRes = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: "USDT",
        tradeType: "BUY",
        fiat: "XAF",
        transAmount: "",
        order: "",
        page: 1,
        rows: 1,
        filterType: "all"
      })
    });

    if (!binanceRes.ok) {
      throw new Error("Failed to fetch from Binance");
    }

    const data = await binanceRes.json();
    let rate = 600; // default fallback

    if (data && data.data && data.data.length > 0) {
      const priceStr = data.data[0].adv.price;
      rate = parseFloat(priceStr);
    }

    return new Response(JSON.stringify({ rate }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in get-exchange-rate:", error);
    // Fallback to 600
    return new Response(JSON.stringify({ rate: 600, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // We still return 200 with the fallback rate so the frontend doesn't break
    });
  }
});

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCode } from "https://esm.sh/country-list@2.3.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types
interface FormattedPrice {
  Country: string;
  Iso: string;
  Price: number;
  Provider: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const targetService = body.serviceId || '8a97735e-9a14-427e-8a88-e9d999bf3429';

    // Map of Iso to lowest price info
    const bestPrices = new Map<string, FormattedPrice>();

    // 1. Fetch from smscodes.io
    const smsCodesKey = Deno.env.get('SMSCODES_API_KEY');
    if (smsCodesKey) {
      try {
        const url = `https://code.smscodes.io/api/sms/GetServicePrices?key=${smsCodesKey}&serviceId=${targetService}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.Status === "200" || data.Status === "Success") {
          data.Prices.forEach((c: any) => {
            if (!c.Iso || !c.Price) return;
            const price = parseFloat(c.Price);
            bestPrices.set(c.Iso, {
              Country: c.Country,
              Iso: c.Iso,
              Price: price,
              Provider: 'smscodes'
            });
          });
        }
      } catch (e) {
        console.error("Error fetching smscodes prices", e);
      }
    }



    // Apply Margins and Format Response
    const finalPrices = Array.from(bestPrices.values()).map(c => {
      let margin = 0.50;
      if (c.Price < 0.10) margin = 0.85;
      else if (c.Price < 0.50) margin = 0.65;
      else if (c.Price < 1.00) margin = 0.55;
      else margin = 0.50;

      return {
        Country: c.Country,
        Iso: c.Iso,
        Price: (c.Price + margin).toFixed(2),
        RawPrice: c.Price,
        Provider: c.Provider
      };
    });

    return new Response(JSON.stringify({ Status: "200", Prices: finalPrices }), {
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

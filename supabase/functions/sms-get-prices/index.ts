import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error(`Unauthorized: ${userError?.message || 'No user found'}`);

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

    // 2. Fetch from 5sim.net (Guest API for prices)
    try {
      const fivesimCountryToIso: Record<string, string> = {
        'usa': 'US',
        'england': 'GB',
        'france': 'FR',
        'germany': 'DE',
        'russia': 'RU',
        'canada': 'CA',
        'spain': 'ES',
        'italy': 'IT',
        'ukraine': 'UA',
        'poland': 'PL',
        'india': 'IN',
        'indonesia': 'ID',
        'brazil': 'BR',
        'mexico': 'MX',
        'vietnam': 'VN',
        'romania': 'RO',
        'egypt': 'EG',
      };

      // 5sim guest prices API returns ALL prices. The product we want is "google"
      const res = await fetch('https://5sim.net/v1/guest/prices');
      const data = await res.json();
      
      if (data) {
        for (const [countryName, products] of Object.entries(data as any)) {
          if (products && (products as any).google) {
            const operators = (products as any).google;
            let lowest = Infinity;
            // find lowest cost among operators that have stock
            for (const [opName, opData] of Object.entries(operators as any)) {
              if (opData.cost && opData.cost < lowest && opData.count > 0) {
                lowest = opData.cost;
              }
            }
            if (lowest < Infinity) {
              // 5sim returns prices in RUB. 1 RUB = ~0.011 USD. Let's convert roughly.
              const costUsd = lowest * 0.011; 
              
              let targetIso = fivesimCountryToIso[countryName.toLowerCase()];
              if (!targetIso) {
                // Try matching by exact name
                for (const [iso, existing] of bestPrices.entries()) {
                  if (existing.Country.toLowerCase() === countryName.toLowerCase()) {
                    targetIso = iso;
                    break;
                  }
                }
              }

              if (targetIso) {
                const existing = bestPrices.get(targetIso);
                if (!existing || costUsd < existing.Price) {
                  const displayName = existing ? existing.Country : (countryName.charAt(0).toUpperCase() + countryName.slice(1));
                  bestPrices.set(targetIso, {
                    Country: displayName,
                    Iso: targetIso,
                    Price: costUsd,
                    Provider: '5sim'
                  });
                }
              }
            }
          }
        }
      }
    } catch(e) {
      console.error("Error fetching 5sim prices", e);
    }

    // 3. (Mock) Fetch from PVAPins for US/UK
    const pvaPinsKey = Deno.env.get('PVAPINS_API_KEY');
    if (pvaPinsKey) {
      // Mocked forced prices
      const usExisting = bestPrices.get('US');
      if (usExisting) {
        bestPrices.set('US', { ...usExisting, Price: 0.25, Provider: 'pvapins' });
      }
      const gbExisting = bestPrices.get('GB');
      if (gbExisting) {
        bestPrices.set('GB', { ...gbExisting, Price: 0.35, Provider: 'pvapins' });
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

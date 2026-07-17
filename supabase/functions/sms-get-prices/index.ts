import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCode } from "https://esm.sh/country-list@2.3.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types
interface ProviderInfo {
  Name: string;
  RawPrice: number;
  Price?: string;
}

interface FormattedCountry {
  Country: string;
  Iso: string;
  Providers: ProviderInfo[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const targetService = body.serviceId || '8a97735e-9a14-427e-8a88-e9d999bf3429';

    // Map of Iso to country data
    const countriesMap = new Map<string, FormattedCountry>();

    const getCountry = (iso: string, name: string) => {
      if (!countriesMap.has(iso)) {
        countriesMap.set(iso, { Country: name, Iso: iso, Providers: [] });
      }
      return countriesMap.get(iso)!;
    };

    // Parallel fetch
    const promises = [];

    // 1. Fetch from 5sim.net
    const fivesimKey = Deno.env.get('FIVESIM_API_KEY');
    if (fivesimKey) {
      promises.push((async () => {
        try {
          const fivesimCountryToIso: Record<string, string> = {
            'usa': 'US', 'england': 'GB', 'france': 'FR', 'germany': 'DE', 'russia': 'RU',
            'canada': 'CA', 'spain': 'ES', 'italy': 'IT', 'ukraine': 'UA', 'poland': 'PL',
            'india': 'IN', 'indonesia': 'ID', 'brazil': 'BR', 'mexico': 'MX', 'vietnam': 'VN',
            'romania': 'RO', 'egypt': 'EG', 'kenya': 'KE', 'southafrica': 'ZA', 'nigeria': 'NG'
          };
          const res = await fetch('https://5sim.net/v1/guest/prices');
          const data = await res.json();
          if (data) {
            for (const [countryName, products] of Object.entries(data as any)) {
              if (products && (products as any).google) {
                const operators = (products as any).google;
                let lowest = Infinity;
                for (const [opName, opData] of Object.entries(operators as any)) {
                  if (opData.cost && opData.cost < lowest && opData.count > 0) {
                    lowest = opData.cost;
                  }
                }
                if (lowest < Infinity) {
                  const costUsd = lowest * 0.011; // Approx RUB to USD
                  let targetIso = fivesimCountryToIso[countryName.toLowerCase()];
                  if (!targetIso) { targetIso = `XX_${countryName.substring(0,3).toUpperCase()}`; }
                  const countryObj = getCountry(targetIso, countryName.charAt(0).toUpperCase() + countryName.slice(1));
                  countryObj.Providers.push({ Name: '5sim', RawPrice: costUsd });
                }
              }
            }
          }
        } catch (e) {
          console.error("Error fetching 5sim prices", e);
        }
      })());
    }

    // 2. Fetch from smscodes.io
    const smsCodesKey = Deno.env.get('SMSCODES_API_KEY');
    if (smsCodesKey) {
      promises.push((async () => {
        try {
          const url = `https://code.smscodes.io/api/sms/GetServicePrices?key=${smsCodesKey}&serviceId=${targetService}`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.Status === "200" || data.Status === "Success") {
            data.Prices.forEach((c: any) => {
              if (!c.Iso || !c.Price) return;
              const price = parseFloat(c.Price);
              const countryObj = getCountry(c.Iso, c.Country);
              countryObj.Providers.push({ Name: 'smscodes', RawPrice: price });
            });
          }
        } catch (e) {
          console.error("Error fetching smscodes prices", e);
        }
      })());
    }

    // 3. Fetch from pvapins.com
    const pvaPinsKey = Deno.env.get('PVAPINS_API_KEY');
    if (pvaPinsKey) {
      promises.push((async () => {
        try {
          // PVAPins prices are not easily aggregatable by single endpoint, they require specific country query.
          // Since it's heavy to fetch all, we might skip global PVA prices or use a static map.
          // For now, if we have a static list or if PVA gives all countries...
          // PVAPins provides /load_countries.php but it doesn't give prices. We skip PVA global prices for now, 
          // or we can add it later if needed. SMSCodes and 5SIM provide global endpoints.
        } catch (e) {}
      })());
    }

    await Promise.allSettled(promises);

    // Apply Margins, Sort, and Format Response
    const finalPrices = Array.from(countriesMap.values()).map(c => {
      // Sort providers by priority: 5sim first, then smscodes, then others
      c.Providers.sort((a, b) => {
        if (a.Name === '5sim') return -1;
        if (b.Name === '5sim') return 1;
        if (a.Name === 'smscodes') return -1;
        if (b.Name === 'smscodes') return 1;
        return a.RawPrice - b.RawPrice;
      });

      // Apply margin to each provider
      c.Providers = c.Providers.map(p => {
        let margin = 0.50;
        if (p.RawPrice < 0.10) margin = 0.85;
        else if (p.RawPrice < 0.50) margin = 0.65;
        else if (p.RawPrice < 1.00) margin = 0.55;
        else margin = 0.50;
        
        return {
          ...p,
          Price: (p.RawPrice + margin).toFixed(2)
        };
      });

      return c;
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

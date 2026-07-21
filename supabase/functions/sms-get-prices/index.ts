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

    // 1. SMSCodes — endpoint de prix global par pays (source principale).
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

    await Promise.allSettled(promises);

    // 2. PVAPins — pas d'endpoint de prix global. On l'expose comme fournisseur
    //    alternatif uniquement pour les pays dont on connaît le COÛT RÉEL
    //    (grille statique ci-dessous, à étendre au fur et à mesure). Le failover
    //    du frontend passe automatiquement à l'autre fournisseur si PVAPins n'a
    //    pas de numéro. RawPrice = coût fournisseur ; la marge est ajoutée après.
    //    ⚠️ N'ajouter un pays ici QUE si son coût PVAPins réel est connu, sinon
    //    on risque de vendre à perte.
    const pvaPinsKey = Deno.env.get('PVAPINS_API_KEY');
    if (pvaPinsKey) {
      const PVA_STATIC_COST: Record<string, number> = {
        US: 0.25,
        GB: 0.35,
      };
      const PVA_ISO_TO_NAME: Record<string, string> = {
        US: 'United States', GB: 'United Kingdom',
      };
      for (const [iso, cost] of Object.entries(PVA_STATIC_COST)) {
        const countryObj = getCountry(iso, PVA_ISO_TO_NAME[iso] || iso);
        countryObj.Providers.push({ Name: 'pvapins', RawPrice: cost });
      }
    }

    // Apply Margins, Sort, and Format Response
    const finalPrices = Array.from(countriesMap.values()).map(c => {
      // Trier par PRIX croissant : le fournisseur le moins cher est choisi en
      // premier (c'est Providers[0] que le frontend sélectionne). Le failover
      // essaiera ensuite le suivant le moins cher si le 1er n'a pas de numéro.
      c.Providers.sort((a, b) => a.RawPrice - b.RawPrice);

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

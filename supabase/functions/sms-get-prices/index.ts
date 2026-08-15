import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCode } from "https://esm.sh/country-list@2.3.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { aliasForProvider, applyMargin, LEGACY_PROVIDERS } from '../_shared/sms-pricing.ts';
import { getCorsHeaders, handleCors } from '../_shared/rate-limit.ts';
import { FIVESIM_ISO_TO_COUNTRY } from '../_shared/provider-5sim.ts';
import { getAdmin } from '../_shared/supplier-db.ts';

// Types
interface ProviderInfo {
  Name: string;
  RawPrice: number;
  Price?: string;
  App?: string; // (PVAPins) nom exact de la variante YouTube la moins chère à acheter
  _RealName?: string; // usage interne au tri, jamais renvoyé au client
}

interface FormattedCountry {
  Country: string;
  Iso: string;
  Providers: ProviderInfo[];
}

// ── Marge appliquée sur le coût fournisseur ────────────────────────────────
// +40 % avec un plancher de +$0.20, arrondi au centime SUPÉRIEUR (jamais de
// sous-facturation). Les fournisseurs ne facturent que sur code reçu, donc
// cette marge est quasi du profit net. Modifier ces 2 constantes suffit à
// ajuster tous les prix de la boutique.
// Marge DYNAMIQUE :
//   marge = borne( 20 % du coût, entre un plancher $0.75 et un plafond $1.00 )
//   prix  = coût + marge, arrondi au centime supérieur, jamais sous $1.
// → petits numéros : grosse marge relative (plancher $0.75, ex: $0.13 → $0.88 → $1.00)
// → numéros moyens : au moins +20 %
// → gros numéros  : marge plafonnée à $1 (ex: coût $7 → $8), jamais exclus.
// Logique définie une seule fois dans _shared/sms-pricing.ts (importée ci-dessus).

// ── PVAPins : pays comparés (ISO -> nom PVAPins) ───────────────────────────
// get_rates.php est PAR pays et la variante YouTube la moins chère (Youtube1,
// Youtube22, …) varie selon le pays. On interroge ce panel en parallèle et on
// garde, par pays, la variante la MOINS chère + son nom d'app (requis pour
// acheter le bon numéro ensuite via sms-get-number).
const PVA_POPULAR: Record<string, string> = {
  US: 'USA', GB: 'UK', FR: 'France', DE: 'Germany', ES: 'Spain', IT: 'Italy',
  CA: 'Canada', NL: 'Netherlands', PL: 'Poland', RO: 'Romania', PT: 'Portugal',
  SE: 'Sweden', IE: 'Ireland', FI: 'Finland', AT: 'Austria',
  KE: 'Kenya', NG: 'Nigeria', ZA: 'South Africa', GH: 'Ghana', EG: 'Egypt',
  IN: 'India', ID: 'Indonesia', PH: 'Philippines', PK: 'Pakistan', BD: 'Bangladesh',
  VN: 'Vietnam', TH: 'Thailand', MY: 'Malaysia', BR: 'Brazil', MX: 'Mexico',
  AR: 'Argentina', CO: 'Colombia', RU: 'Russia', UA: 'Ukraine', UY: 'Uruguay',
  CL: 'Chile', PE: 'Peru', EC: 'Ecuador', BO: 'Bolivia', PY: 'Paraguay',
  MA: 'Morocco', DZ: 'Algeria', TN: 'Tunisia', SN: 'Senegal', CI: 'Ivory Coast',
  CM: 'Cameroon', MG: 'Madagascar', CD: 'Congo', AO: 'Angola', MZ: 'Mozambique',
  AE: 'United Arab Emirates', SA: 'Saudi Arabia', TR: 'Turkey', KZ: 'Kazakhstan'
};

interface PvaRate { iso: string; name: string; rate: number; app: string; }
// Cache mémoire (par isolate warm) pour éviter de rappeler PVAPins à chaque
// visite. TTL 10 min : largement suffisant, les tarifs bougent lentement.
let pvaCache: { at: number; rates: PvaRate[] } | null = null;
const PVA_CACHE_TTL_MS = 10 * 60 * 1000;

async function getPvaRates(apiKey: string): Promise<PvaRate[]> {
  if (pvaCache && Date.now() - pvaCache.at < PVA_CACHE_TTL_MS) return pvaCache.rates;

  const fetchCheapest = async (iso: string, name: string): Promise<PvaRate | null> => {
    try {
      const r = await fetch(`https://api.pvapins.com/user/api/get_rates.php?customer=${apiKey}&country=${encodeURIComponent(name)}`);
      const arr = await r.json();
      if (!Array.isArray(arr)) return null;
      let best: PvaRate | null = null;
      for (const x of arr) {
        if (!x || !x.app) continue;
        const appName = String(x.app).toLowerCase();
        if (!appName.includes('youtube') && !appName.includes('google')) continue;
        const rate = parseFloat(x.rate);
        if (!Number.isFinite(rate) || rate <= 0) continue;
        if (!best || rate < best.rate) best = { iso, name, rate, app: String(x.app) };
      }
      return best;
    } catch { return null; }
  };

  const results = await Promise.allSettled(
    Object.entries(PVA_POPULAR).map(([iso, name]) => fetchCheapest(iso, name))
  );
  const rates: PvaRate[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) rates.push(r.value);
  }
  // On ne met en cache que si on a obtenu quelque chose (sinon on réessaiera).
  if (rates.length > 0) pvaCache = { at: Date.now(), rates };
  return rates;
}

serve(async (req) => {
  const corsOpts = handleCors(req);
  if (corsOpts) return corsOpts;
  const corsHeaders = getCorsHeaders(req);

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
              countryObj.Providers.push({ Name: aliasForProvider('smscodes'), RawPrice: price, _RealName: 'smscodes' });
            });
          }
        } catch (e) {
          console.error("Error fetching smscodes prices", e);
        }
      })());
    }

    await Promise.allSettled(promises);

    // 2. PVAPins — variante YouTube la MOINS chère par pays (getPvaRates : panel
    //    populaire interrogé en parallèle, cache 10 min). Ajouté comme alternative
    //    comparée à SMSCodes : « moins cher gagne » par pays, avec failover si le
    //    1er fournisseur n'a pas de numéro. RawPrice = coût ; marge ajoutée après.
    const pvaPinsKey = Deno.env.get('PVAPINS_API_KEY');
    if (pvaPinsKey) {
      const pvaRates = await getPvaRates(pvaPinsKey);
      for (const pr of pvaRates) {
        // Crée le pays s'il n'était pas listé par SMSCodes (couverture élargie),
        // sinon ajoute PVAPins comme alternative comparée au même pays.
        const countryObj = getCountry(pr.iso, pr.name);
        countryObj.Providers.push({ Name: aliasForProvider('pvapins'), RawPrice: pr.rate, App: pr.app, _RealName: 'pvapins' });
      }
    }

    // 3. 5sim — produit "google" (Google/YouTube), endpoint public (pas de clé
    //    requise). Fournisseur de repli une fois les historiques épuisés.
    try {
      const res = await fetch('https://5sim.net/v1/guest/prices?product=google');
      const data = await res.json();
      const byCountry = data?.google || {};
      const isoByCountry: Record<string, string> = {};
      for (const [iso, slug] of Object.entries(FIVESIM_ISO_TO_COUNTRY)) isoByCountry[slug] = iso;
      for (const [countrySlug, operators] of Object.entries(byCountry as Record<string, any>)) {
        const iso = isoByCountry[countrySlug];
        if (!iso) continue;
        let cheapest: number | null = null;
        for (const op of Object.values(operators as Record<string, any>)) {
          const cost = Number(op?.cost);
          const count = Number(op?.count) || 0;
          if (!Number.isFinite(cost) || cost <= 0 || count <= 0) continue;
          if (cheapest === null || cost < cheapest) cheapest = cost;
        }
        if (cheapest === null) continue;
        const countryObj = getCountry(iso, iso);
        countryObj.Providers.push({ Name: aliasForProvider('fivesim'), RawPrice: cheapest, _RealName: 'fivesim' });
      }
    } catch (e) {
      console.error("Error fetching 5sim prices", e);
    }

    // Fournisseurs historiques épuisés : relégués derrière 5sim/onlinesim
    // (sans être retirés du code — ils reprennent la priorité automatiquement
    // si on les recrédite, cf. sms-provider-selector.ts).
    const exhaustedLegacy = new Set<string>();
    try {
      const admin = getAdmin();
      const { data: statuses } = await admin
        .from('sms_provider_status')
        .select('provider, exhausted, last_checked_at')
        .in('provider', Array.from(LEGACY_PROVIDERS));
      const STALE_AFTER_MS = 30 * 60 * 1000;
      for (const s of statuses || []) {
        if (!s.exhausted) continue;
        const age = Date.now() - new Date(s.last_checked_at).getTime();
        if (age < STALE_AFTER_MS) exhaustedLegacy.add(s.provider);
      }
    } catch (e) {
      console.error("Error fetching sms_provider_status", e);
    }

    // Tri : historiques non épuisés d'abord (moins cher des deux), puis les
    // nouveaux fournisseurs par prix, puis les historiques épuisés en dernier.
    const priority = (p: ProviderInfo): number => {
      if (!p._RealName || !LEGACY_PROVIDERS.has(p._RealName)) return 1;
      return exhaustedLegacy.has(p._RealName) ? 2 : 0;
    };

    const finalPrices = Array.from(countriesMap.values())
      .map(c => {
        c.Providers.sort((a, b) => {
          const pa = priority(a), pb = priority(b);
          if (pa !== pb) return pa - pb;
          return a.RawPrice - b.RawPrice;
        });

        // Appliquer la marge dynamique, puis retirer le champ interne _RealName.
        c.Providers = c.Providers.map(p => {
          const { _RealName, ...rest } = p;
          return { ...rest, Price: applyMargin(p.RawPrice).toFixed(2) };
        });

        return c;
      })
      .filter(c => c.Providers.length > 0);

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

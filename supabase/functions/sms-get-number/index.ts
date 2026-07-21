import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCode } from "https://esm.sh/country-list@2.3.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, getCorsHeaders, handleCors } from '../_shared/rate-limit.ts';

serve(async (req) => {
  const corsOpts = handleCors(req);
  if (corsOpts) return corsOpts;
  const corsHeaders = getCorsHeaders(req);

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

    // ── RATE LIMITING : 15 numéros par heure par utilisateur ────────────
    // Protège les crédits fournisseurs SMS (SMSCodes, 5sim, PVAPins) contre
    // les appels massifs accidentels ou malveillants.
    const allowed = await checkRateLimit(user.id, 'sms_get_number', 15, 3600);
    if (!allowed) {
      return new Response(JSON.stringify({
        error: 'Trop de requêtes. Limite : 15 numéros par heure. Réessayez plus tard.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      });
    }

    const { iso, serviceId, price, provider, app } = await req.json();
    const smsPrice = price || 1.00;
    const currentProvider = provider || 'smscodes';

    // Check balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (!profile || profile.balance < smsPrice) {
      throw new Error('Insufficient balance');
    }

    const targetIso = iso || 'US';
    const targetServ = serviceId || '1'; // Placeholder

    let providerData = { Status: "Error", Error: "Provider not implemented", SecurityId: "", Number: "" };

    const getSmsCodesNumber = async () => {
      const apiKey = Deno.env.get('SMSCODES_API_KEY');
      if (!apiKey) throw new Error('SMSCODES_API_KEY is not configured');

      const url = `https://code.smscodes.io/api/sms/GetServiceNumber?key=${apiKey}&iso=${targetIso}&serv=${targetServ}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.Status !== "200" && data.Status !== "Success") {
        throw new Error(`SMS Provider Error: ${data.Error || 'Unknown error'}`);
      }

      return {
        Status: "200",
        Number: data.Number,
        SecurityId: `smscodes:${data.SecurityId}` // Prefix with provider
      };
    };

    if (currentProvider === 'smscodes') {
      providerData = await getSmsCodesNumber();
    } else if (currentProvider === '5sim') {
      const apiKey = Deno.env.get('FIVESIM_API_KEY');
      if (!apiKey) throw new Error('FIVESIM_API_KEY is not configured');

      const fivesimCountryMap: Record<string, string> = {
        'US': 'usa',
        'GB': 'england',
        'FR': 'france',
        'DE': 'germany',
        'RU': 'russia',
        'CA': 'canada',
        'ES': 'spain',
        'IT': 'italy',
        'UA': 'ukraine',
        'PL': 'poland',
        'IN': 'india',
        'ID': 'indonesia',
        'BR': 'brazil',
        'MX': 'mexico',
        'VN': 'vietnam',
        'RO': 'romania',
        'EG': 'egypt',
      };
      
      const countryName = fivesimCountryMap[targetIso] || targetIso.toLowerCase();
      const appName = "google";
      
      const url = `https://5sim.net/v1/user/buy/activation/${countryName}/any/${appName}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });
      
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`5sim API Error: ${errText || res.statusText}`);
      }
      
      const data = await res.json();
      if (!data.id || !data.phone) {
        throw new Error(`5sim API Error: ${JSON.stringify(data)}`);
      }
      
      providerData = {
        Status: "200",
        Number: data.phone,
        SecurityId: `5sim:${data.id}:${countryName}`
      };
    } else if (currentProvider === 'pvapins') {
      try {
        const apiKey = Deno.env.get('PVAPINS_API_KEY');
        if (!apiKey) throw new Error('PVAPINS_API_KEY is not configured');
        
        let countryName = targetIso;
        try {
          const res = await fetch('https://api.pvapins.com/user/api/load_countries.php');
          const countries = await res.json();
          for (const c of countries) {
            let iso = getCode(c.full_name);
            if (!iso) {
              if (c.full_name === 'UK') iso = 'GB';
              else if (c.full_name === 'USA') iso = 'US';
              else if (c.full_name === 'Russia') iso = 'RU';
              else if (c.full_name === 'Vietnam') iso = 'VN';
              else if (c.full_name === 'South Korea') iso = 'KR';
              else if (c.full_name === 'Iran') iso = 'IR';
              else if (c.full_name === 'Syria') iso = 'SY';
              else if (c.full_name === 'Taiwan') iso = 'TW';
              else if (c.full_name === 'Venezuela') iso = 'VE';
              else if (c.full_name === 'Bolivia') iso = 'BO';
              else if (c.full_name === 'Tanzania') iso = 'TZ';
            }
            if (iso === targetIso) {
              countryName = c.full_name;
              break;
            }
          }
        } catch(e) {
          // Fallback to hardcoded map if fetch fails
          const pvaCountryMap: Record<string, string> = {
            'US': 'USA', 'GB': 'UK', 'FR': 'France', 'DE': 'Germany', 'RU': 'Russia', 'CA': 'Canada'
          };
          countryName = pvaCountryMap[targetIso] || targetIso;
        }
        
        // Variante YouTube la moins chère pour ce pays (ex: "Youtube1",
        // "Youtube22"), déterminée par sms-get-prices et transmise ici. Repli
        // sur "YouTube" si absente (ancien comportement).
        const appName = app || "YouTube";

        const url = `https://api.pvapins.com/user/api/get_number.php?customer=${apiKey}&app=${encodeURIComponent(appName)}&country=${encodeURIComponent(countryName)}`;
        const res = await fetch(url);
        const text = await res.text();
        
        const lowerText = text.toLowerCase();
        if (lowerText.includes('not found') || lowerText.includes('error') || lowerText.includes('progress') || lowerText.includes('no free channels')) {
          throw new Error(`${text.trim()}`);
        }
        
        let parsedNum = text.trim();
        try {
          const jsonObj = JSON.parse(text);
          if (jsonObj.number) parsedNum = String(jsonObj.number);
          else if (jsonObj.Number) parsedNum = String(jsonObj.Number);
        } catch (e) {
          if (parsedNum.includes(':')) {
             parsedNum = parsedNum.split(':').pop()!.trim();
          }
        }
        
        providerData = {
          Status: "200",
          Number: parsedNum,
          // On encode la variante d'app en 4e segment pour que sms-check-code
          // interroge get_sms.php avec la bonne app.
          SecurityId: `pvapins:${parsedNum}:${countryName}:${appName}`
        };
      } catch (pvpError) {
        throw new Error(`PVAPins failed: ${pvpError.message}`);
      }
    } else {
      throw new Error(`Unknown provider: ${currentProvider}`);
    }

    return new Response(JSON.stringify(providerData), {
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

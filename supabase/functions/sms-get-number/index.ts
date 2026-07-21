import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCode } from "https://esm.sh/country-list@2.3.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, getCorsHeaders, handleCors } from '../_shared/rate-limit.ts';
import { notifyTelegram } from '../_shared/supplier-db.ts';
import { applyMargin, getPvaCheapestYt, signSecurityId } from '../_shared/sms-pricing.ts';

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

    // ── RATE LIMITING : Désactivé à la demande du client ────────────
    // (Anciennement 15 numéros par heure par utilisateur)
    // const allowed = await checkRateLimit(user.id, 'sms_get_number', 15, 3600);
    // if (!allowed) {
    //   return new Response(JSON.stringify({
    //     error: 'Trop de requêtes. Limite : 15 numéros par heure. Réessayez plus tard.'
    //   }), {
    //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    //     status: 200,
    //   });
    // }

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

    let providerData = { Status: "Error", Error: "Provider not implemented", SecurityId: "", Number: "", Price: 0 };

    const getSmsCodesNumber = async () => {
      const apiKey = Deno.env.get('SMSCODES_API_KEY');
      if (!apiKey) throw new Error('SMSCODES_API_KEY is not configured');

      const url = `https://code.smscodes.io/api/sms/GetServiceNumber?key=${apiKey}&iso=${targetIso}&serv=${targetServ}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.Status !== "200" && data.Status !== "Success") {
        throw new Error(`SMS Provider Error: ${data.Error || 'Unknown error'}`);
      }

      // Prix calculé SERVEUR à partir du coût réel renvoyé par SMSCodes (Rate),
      // puis signé dans le securityId. Le client ne fixe jamais le montant.
      const cost = parseFloat(data.Rate) || 0.50;
      const sellingPrice = applyMargin(cost);
      const base = `smscodes:${data.SecurityId}`;
      return {
        Status: "200",
        Number: data.Number,
        SecurityId: await signSecurityId(base, sellingPrice),
        Price: sellingPrice,
      };
    };

    if (currentProvider === 'smscodes') {
      providerData = await getSmsCodesNumber();
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
        
        // Variante YouTube la moins chère + coût réel : RECALCULÉS serveur
        // (on ne fait PAS confiance au `app`/`price` du client). Le prix de
        // vente est ensuite signé dans le securityId.
        const best = await getPvaCheapestYt(targetIso, countryName);
        const appName = best?.app || app || "YouTube";
        const cost = best?.cost ?? 1.60;
        const sellingPrice = applyMargin(cost);

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

        // base = pvapins:num:pays:variante  (la variante sert à sms-check-code) ;
        // le prix de vente signé y est ajouté par signSecurityId.
        const base = `pvapins:${parsedNum}:${countryName}:${appName}`;
        providerData = {
          Status: "200",
          Number: parsedNum,
          SecurityId: await signSecurityId(base, sellingPrice),
          Price: sellingPrice,
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
    let errorMessage = error.message;
    const lower = errorMessage.toLowerCase();
    
    if (lower.includes('nocreditsinaccount') || lower.includes('insufficient funds') || lower.includes('not enough balance') || lower.includes('balance too low')) {
       // Alert admin in background
       notifyTelegram(`⚠️ *Alerte Fournisseur SMS* ⚠️\n\nLe compte de l'API SMS n'a plus de crédits !\nErreur exacte : ${errorMessage}`).catch(console.error);
       
       // Hide error from user
       errorMessage = 'Une erreur technique est survenue chez Agedgmail. Veuillez réessayer plus tard ou choisir un autre pays.';
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});

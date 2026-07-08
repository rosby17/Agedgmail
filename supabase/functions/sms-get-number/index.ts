import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { iso, serviceId, price, provider } = await req.json();
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

    if (currentProvider === 'smscodes') {
      const apiKey = Deno.env.get('SMSCODES_API_KEY');
      if (!apiKey) throw new Error('SMSCODES_API_KEY is not configured');

      const url = `https://code.smscodes.io/api/sms/GetServiceNumber?key=${apiKey}&iso=${targetIso}&serv=${targetServ}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.Status !== "200" && data.Status !== "Success") {
        throw new Error(`SMS Provider Error: ${data.Error || 'Unknown error'}`);
      }

      providerData = {
        Status: "200",
        Number: data.Number,
        SecurityId: `smscodes:${data.SecurityId}` // Prefix with provider
      };
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
      const apiKey = Deno.env.get('PVAPINS_API_KEY');
      if (!apiKey) throw new Error('PVAPINS_API_KEY is not configured');
      
      const pvaCountryMap: Record<string, string> = {
        'US': 'USA',
        'GB': 'UK',
        'FR': 'France',
        'DE': 'Germany',
        'RU': 'Russia',
        'CA': 'Canada'
      };
      const countryName = pvaCountryMap[targetIso] || targetIso;
      const appName = "google"; 
      
      const url = `https://api.pvapins.com/user/api/get_number.php?customer=${apiKey}&app=${appName}&country=${encodeURIComponent(countryName)}`;
      const res = await fetch(url);
      const text = await res.text();
      
      if (text.toLowerCase().includes('not found') || text.toLowerCase().includes('error') || text.toLowerCase().includes('progress')) {
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
        SecurityId: `pvapins:${parsedNum}:${countryName}`
      };
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

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error(`Unauthorized: ${userError?.message || 'No user found'}`);

    const apiKey = Deno.env.get('SMSCODES_API_KEY');
    if (!apiKey) throw new Error('SMSCODES_API_KEY is not configured');

    const body = await req.json().catch(() => ({}));
    // Default to YouTube Service ID if not provided
    const targetService = body.serviceId || '8a97735e-9a14-427e-8a88-e9d999bf3429';

    // Call smscodes.io
    const url = `https://code.smscodes.io/api/sms/GetServicePrices?key=${apiKey}&serviceId=${targetService}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.Status !== "200" && data.Status !== "Success") {
      throw new Error(`SMS Provider Error: ${data.Error || 'Unknown error'}`);
    }

    // Apply dynamic margins
    if (data.Prices && Array.isArray(data.Prices)) {
      data.Prices = data.Prices.map((country: any) => {
        if (!country.Price) return country;
        const cost = parseFloat(country.Price);
        let margin = 0.50;
        
        if (cost < 0.10) margin = 0.75;
        else if (cost < 0.50) margin = 0.65;
        else if (cost < 1.00) margin = 0.55;
        else margin = 0.50;

        return {
          ...country,
          Price: (cost + margin).toFixed(2)
        };
      });
    }

    return new Response(JSON.stringify(data), {
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

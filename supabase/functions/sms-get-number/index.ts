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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const { iso, serviceId, price } = await req.json();
    const smsPrice = price || 1.00;

    // Check balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (!profile || profile.balance < smsPrice) {
      throw new Error('Insufficient balance');
    }

    const apiKey = Deno.env.get('SMSCODES_API_KEY');
    if (!apiKey) throw new Error('SMSCODES_API_KEY is not configured');

    const targetIso = iso || 'US';
    // For youtube, serviceId might be something specific on smscodes.io
    const targetServ = serviceId || '1'; // Placeholder

    // Call smscodes.io
    const url = `https://code.smscodes.io/api/sms/GetServiceNumber?key=${apiKey}&iso=${targetIso}&serv=${targetServ}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.Status !== "200" && data.Status !== "Success") {
      throw new Error(`SMS Provider Error: ${data.Error || 'Unknown error'}`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

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
    // Use service role to bypass RLS for balance update
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Client for auth verification
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const { securityId, number, price, description } = await req.json();
    if (!securityId || !number) throw new Error('Missing parameters');
    
    const smsPrice = price || 1.00;

    const apiKey = Deno.env.get('SMSCODES_API_KEY');
    if (!apiKey) throw new Error('SMSCODES_API_KEY is not configured');

    // Call smscodes.io
    const url = `https://code.smscodes.io/api/sms/GetSMSCode?key=${apiKey}&sid=${securityId}&number=${number}`;
    const res = await fetch(url);
    const data = await res.json();

    // If we have an SMS, deduct balance
    if (data.Status === "200" && data.SMS) {
      // Use service role to update balance
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (!profile || profile.balance < smsPrice) {
        throw new Error('Insufficient balance at time of charge');
      }

      const newBalance = profile.balance - smsPrice;
      
      // Update balance
      await supabaseAdmin
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      // Log order
      await supabaseAdmin
        .from('orders')
        .insert({
          user_id: user.id,
          product_name: description || 'SMS Verification (YouTube)',
          price_usd: smsPrice,
          buyer_email: user.email,
          status: 'confirmed',
          delivery_data: { number: data.Number, code: data.SMS }
        });
        
      return new Response(JSON.stringify({
        status: 'success',
        sms: data.SMS,
        number: data.Number
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Waiting for SMS or error
    return new Response(JSON.stringify({
      status: 'waiting',
      apiData: data
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

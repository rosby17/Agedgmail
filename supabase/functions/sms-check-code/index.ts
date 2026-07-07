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
    // Use service role to bypass RLS for balance update
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Client for auth verification
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !user) throw new Error(`Unauthorized: ${userError?.message || 'No user found'}`);

    const { securityId, number, price, description, provider } = await req.json();
    if (!securityId || !number) throw new Error('Missing parameters');
    
    const smsPrice = price || 1.00;
    const currentProvider = provider || 'smscodes';

    // Parse securityId
    // It should look like "smscodes:12345" or "pvapins:12345:usa"
    let providerName = currentProvider;
    let externalSecurityId = securityId;

    if (securityId.includes(':')) {
      const parts = securityId.split(':');
      providerName = parts[0];
      externalSecurityId = parts[1];
    } else {
      // Legacy support for ongoing smscodes orders before this update
      providerName = 'smscodes';
    }

    let status = "waiting";
    let smsCode = null;
    let dataObj = null;

    if (providerName === 'smscodes') {
      const apiKey = Deno.env.get('SMSCODES_API_KEY');
      if (!apiKey) throw new Error('SMSCODES_API_KEY is not configured');

      const url = `https://code.smscodes.io/api/sms/GetSMSCode?key=${apiKey}&sid=${externalSecurityId}&number=${number}`;
      const res = await fetch(url);
      dataObj = await res.json();

      if ((dataObj.Status === "200" || dataObj.Status === "Success") && dataObj.SMS) {
        if (dataObj.SMS.toLowerCase().includes('not received') || dataObj.SMS.toLowerCase().includes('waiting')) {
          status = "waiting";
        } else {
          status = "success";
          smsCode = dataObj.SMS;
        }
      }
    } else if (providerName === '5sim') {
      const apiKey = Deno.env.get('FIVESIM_API_KEY');
      if (!apiKey) throw new Error('FIVESIM_API_KEY is not configured');
      
      const url = `https://5sim.net/v1/user/check/${externalSecurityId}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });
      
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`5sim Check API Error: ${errText || res.statusText}`);
      }
      
      dataObj = await res.json();
      
      if (dataObj.sms && Array.isArray(dataObj.sms) && dataObj.sms.length > 0) {
        status = "success";
        smsCode = dataObj.sms[0].code || dataObj.sms[0].text;
      } else if (dataObj.status === 'PENDING') {
        status = "waiting";
      } else if (dataObj.status === 'FINISHED' || dataObj.status === 'RECEIVED') {
        if (dataObj.sms && dataObj.sms.length > 0) {
          status = "success";
          smsCode = dataObj.sms[0].code || dataObj.sms[0].text;
        } else {
          status = "waiting";
        }
      } else if (dataObj.status === 'CANCELED' || dataObj.status === 'TIMEOUT') {
        throw new Error(`Activation was canceled or timed out: ${dataObj.status}`);
      }
    } else if (providerName === 'pvapins') {
      const apiKey = Deno.env.get('PVAPINS_API_KEY');
      if (!apiKey) throw new Error('PVAPINS_API_KEY is not configured');
      
      const parts = securityId.split(':');
      const pvaCountry = parts[2] || 'usa';
      const appName = "google";
      
      const url = `https://api.pvapins.com/user/api/get_sms.php?customer=${apiKey}&number=${number}&country=${pvaCountry}&app=${appName}`;
      const res = await fetch(url);
      const text = await res.text();
      
      if (text.toLowerCase().includes('not received') || text.toLowerCase().includes('waiting')) {
         dataObj = { message: text.trim() };
      } else if (text.toLowerCase().includes('not found') || text.toLowerCase().includes('expired') || text.toLowerCase().includes('error')) {
         dataObj = { error: text.trim() };
      } else {
         let parsedCode = text.trim();
         try {
           const jsonObj = JSON.parse(text);
           if (jsonObj.sms) parsedCode = String(jsonObj.sms);
           else if (jsonObj.code) parsedCode = String(jsonObj.code);
         } catch(e) {
           if (parsedCode.includes(':')) {
              parsedCode = parsedCode.split(':').pop()!.trim();
           }
         }
         
         if (parsedCode && parsedCode.length > 0) {
            status = "success";
            smsCode = parsedCode;
         } else {
            dataObj = { message: "Empty code received" };
         }
      }
    }

    // If we have an SMS, deduct balance
    if (status === "success" && smsCode) {
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
          product_name: description || `SMS Verification (${providerName})`,
          total_price: smsPrice,
          quantity: 1,
          buyer_email: user.email,
          status: 'confirmed',
          delivery_data: { number: number, code: smsCode, provider: providerName },
          credentials: `Phone: ${number}\nSMS Code: ${smsCode}\nProvider: ${providerName}`
        });

      // Notification
      await supabaseAdmin.from('notifications').insert({
        user_id: user.id,
        type: 'info',
        title: 'SMS Reçu',
        message: `Votre code SMS pour le numéro terminant par ${String(number || '').slice(-4)} est arrivé !`,
      });
        
      return new Response(JSON.stringify({
        status: 'success',
        sms: smsCode,
        number: number
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Waiting for SMS or error
    return new Response(JSON.stringify({
      status: 'waiting',
      apiData: dataObj
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});

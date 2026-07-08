import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Chariow } from 'npm:chariow-sdk';

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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!; // Service role to update balance
    const supabaseUserClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });
    
    // Validate user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser(token);
    if (userError || !user) throw new Error(`Unauthorized: ${userError?.message || 'No user found'}`);

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error('Session ID manquant');

    const chariowKey = Deno.env.get('CHARIOW_API_KEY');
    if (!chariowKey) throw new Error('La clé API Chariow n\'est pas configurée');

    const client = new Chariow(chariowKey);
    const payment = await client.pay.get(sessionId);

    if (!payment) throw new Error('Paiement introuvable sur Chariow');
    
    // Admin supabase client to bypass RLS for orders/profiles update
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // 1. Get the order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('pay_id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (orderErr || !order) {
      throw new Error('Commande introuvable pour cette session de paiement');
    }

    if (order.status === 'confirmed') {
      return new Response(JSON.stringify({ success: true, message: 'Commande déjà confirmée', alreadyConfirmed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (payment.status !== 'succeeded') {
      return new Response(JSON.stringify({ success: false, error: `Le paiement n'est pas encore validé (statut: ${payment.status})` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 2. Mark order as confirmed
    const { error: updateErr } = await supabaseAdmin
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', order.id);

    if (updateErr) throw new Error('Erreur lors de la mise à jour de la commande');

    // 3. Credit the user's balance
    const creditAmount = order.credit_amount;
    
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('balance')
      .eq('id', order.user_id)
      .single();

    if (profileErr || !profile) throw new Error('Profil utilisateur introuvable');

    const newBalance = profile.balance + creditAmount;
    const { error: balanceErr } = await supabaseAdmin
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', order.user_id);

    if (balanceErr) throw new Error('Erreur lors de la mise à jour du solde');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Paiement vérifié et solde crédité',
      creditAmount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, 
    });
  }
});

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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error(`Unauthorized: ${userError?.message || 'No user found'}`);

    const { userId, email, amountUsd, bonusPct } = await req.json();

    if (userId !== user.id) throw new Error('User ID mismatch');

    const chariowKey = Deno.env.get('CHARIOW_API_KEY');
    if (!chariowKey) throw new Error('La clé API Chariow n\'est pas configurée (CHARIOW_API_KEY)');

    const productId = Deno.env.get('CHARIOW_PRODUCT_ID');
    if (!productId) throw new Error('L\'ID du produit Chariow n\'est pas configuré (CHARIOW_PRODUCT_ID). Créez un produit à 1$ et ajoutez son ID.');

    const client = new Chariow(chariowKey);

    // Create a checkout session using the 1$ product and multiplying quantity by the top-up amount
    const payment = await client.pay.checkout({
      items: [{ product_id: productId, quantity: Math.round(amountUsd) }],
      customer_email: email,
      currency: 'USD',
      payment_method: { type: 'card' },
      success_url: `https://agedgmail.tools-cl.com/dashboard/topup?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://agedgmail.tools-cl.com/dashboard/topup?status=cancelled`
    });

    // Save the order to track the payment
    const { data: orderData, error: orderErr } = await supabase.from('orders').insert({
      user_id: user.id,
      buyer_email: user.email,
      product_id: 999,
      product_name: 'Dépôt Carte Bancaire (Chariow)',
      quantity: 1,
      total_price: amountUsd,
      expected_amount: amountUsd,
      credit_amount: amountUsd * (1 + (bonusPct || 0) / 100),
      payment_method: 'credit_card',
      status: 'pending',
      pay_id: payment.id, // Store chariow payment ID
    }).select().single();

    if (orderErr) throw orderErr;

    return new Response(JSON.stringify({ 
      orderId: orderData.id, 
      payId: payment.id, 
      checkoutUrl: payment.checkout_url 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Important to return 200 with error property for client parsing
    });
  }
});

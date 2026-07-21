// ============================================================
// admin-deliver-order
// Livraison MANUELLE d'une commande de comptes par l'admin : l'admin colle les
// identifiants achetés à la main (email:motdepasse:recovery, une ligne par
// compte), la commande passe en 'confirmed' et le client est notifié.
// Réservé à l'admin (vérifié côté serveur via le JWT), service role pour écrire
// la commande + la notification (l'INSERT notifications est révoqué au client).
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ADMIN_EMAIL = 'rooseveltmkr@gmail.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const jwt = authHeader.replace('Bearer ', '')
    if (!jwt) return json({ error: 'Authentification requise' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anon = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '')
    const { data: userData, error: userErr } = await anon.auth.getUser(jwt)
    if (userErr || !userData?.user || userData.user.email !== ADMIN_EMAIL) {
      return json({ error: 'Réservé à l’administrateur' }, 403)
    }

    const { orderId, credentials } = await req.json()
    if (!orderId) return json({ error: 'orderId requis' }, 400)
    const creds = String(credentials ?? '').trim()
    if (!creds) return json({ error: 'Identifiants vides' }, 400)

    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    const { data: order, error: orderErr } = await admin
      .from('orders').select('id, user_id, buyer_email, product_name, status').eq('id', orderId).maybeSingle()
    if (orderErr || !order) return json({ error: 'Commande introuvable' }, 404)
    if (order.status === 'cancelled') return json({ error: 'Commande annulée — impossible de livrer' }, 409)

    const { error: updErr } = await admin.from('orders').update({
      credentials: creds,
      data: creds,
      status: 'confirmed',
    }).eq('id', orderId)
    if (updErr) return json({ error: updErr.message }, 500)

    await admin.from('notifications').insert({
      user_id: order.user_id,
      type: 'success',
      title: 'Commande livrée',
      message: `Votre commande « ${order.product_name || 'Compte'} » est prête. Consultez vos accès dans « Mes commandes ».`,
    }).then(() => {}, () => {})

    // Email de livraison si le client l'a activé (la fonction gère l'opt-in).
    admin.functions.invoke('send-delivery-email', { body: { orderId } }).catch(() => {})

    return json({ ok: true })
  } catch (err) {
    return json({ error: (err as Error).message }, 500)
  }
})

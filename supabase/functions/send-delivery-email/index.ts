// ============================================================
// send-delivery-email
// Envoie les credentials d'une commande confirmée par email au client,
// sauf si profiles.send_email_on_delivery === false (opt-out).
// Envoi via le relais Vercel/nodemailer (voir _shared/email.ts) — pas
// l'API REST Brevo, qui nécessite un produit "Transactional" séparé non
// activé sur ce compte, ni le SMTP direct depuis Deno, qui plante sur le
// STARTTLS dans le sandbox Supabase Edge Functions.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getAdmin, corsHeaders } from '../_shared/supplier-db.ts'
import { sendEmail } from '../_shared/email.ts'
import { emailShell, infoBox, ctaButton, escapeHtml } from '../_shared/email-template.ts'

const SITE_NAME = 'AgedGmailYT'
const SITE_URL = 'https://agedgmail.tools-cl.com'

function buildEmailHtml(opts: {
  productName: string
  shortId: string
  credentials: string
  totalPrice: number
  quantity: number
}): string {
  const { productName, shortId, credentials, totalPrice, quantity } = opts
  const lines = credentials.split('\n').filter(Boolean)

  const credsHtml = lines.map(line => `
    <tr><td style="padding:12px 16px;border-bottom:1px solid #E7EFEC;font-family:'SFMono-Regular',Consolas,monospace;font-size:12px;color:#0D7A52;word-break:break-all;background:#F7FAF9;">${escapeHtml(line)}</td></tr>
  `).join('')

  const body = `
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Merci pour ton achat ! Ta commande est confirmée et tes identifiants sont prêts ci-dessous. Conserve cet email précieusement.
    </p>

    ${infoBox([
      { label: 'Produit', value: escapeHtml(productName) },
      { label: 'Quantité', value: String(quantity) },
      { label: 'Total payé', value: `$${totalPrice.toFixed(2)}`, big: true, accent: true },
      { label: 'N° commande', value: `#${escapeHtml(shortId)}` },
    ])}

    <p style="color:#111827;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;margin:0 0 12px;">Tes identifiants</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E7EFEC;border-radius:12px;overflow:hidden;margin:0 0 28px;">
      <tbody>${credsHtml}</tbody>
    </table>

    <div style="text-align:center;">
      ${ctaButton(`${SITE_URL}/app/myorders`, 'Voir mes commandes')}
    </div>
  `

  return emailShell({
    preheader: `Ta commande #${shortId} est livrée — identifiants inclus.`,
    heroTitle: 'Commande livrée ✅',
    heroSubtitle: `#${shortId} — ${productName}`,
    bodyHtml: body,
  })
}

/** Génère le même shortId que le front (6 chiffres déterministe depuis UUID). */
function shortOrderId(uuid: string): string {
  const hex = uuid.replace(/-/g, '').slice(0, 8)
  const num = parseInt(hex, 16) || 0
  return String(num % 1_000_000).padStart(6, '0')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = getAdmin()

  try {
    const { orderId } = await req.json()
    if (!orderId) throw new Error('orderId requis')

    // 1. Charger la commande
    const { data: order, error: oErr } = await admin
      .from('orders')
      .select('id, user_id, buyer_email, product_name, quantity, total_price, credentials, data, status')
      .eq('id', orderId)
      .single()
    if (oErr || !order) throw new Error('Commande introuvable: ' + orderId)

    // 2. Vérifier que le profil a opté pour la réception par email
    const { data: profile } = await admin
      .from('profiles')
      .select('send_email_on_delivery, email')
      .eq('id', order.user_id)
      .single()

    // Opt-out (envoyé par défaut) : seul un choix explicite à "false" par le
    // client dans ses paramètres empêche l'envoi.
    const wantsEmail = profile?.send_email_on_delivery !== false
    if (!wantsEmail) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'opt_out' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const toEmail = order.buyer_email || profile?.email
    if (!toEmail) throw new Error('Email client introuvable')

    const credentials = order.credentials || order.data || ''
    if (!credentials.trim()) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'no_credentials' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const shortId = shortOrderId(String(order.id))
    const html = buildEmailHtml({
      productName: order.product_name || 'Ta commande',
      shortId,
      credentials,
      totalPrice: Number(order.total_price) || 0,
      quantity: Number(order.quantity) || 1,
    })

    // 3. Envoyer via le relais
    const result = await sendEmail({
      to: toEmail,
      subject: `[${SITE_NAME}] Commande #${shortId} livrée`,
      html,
      fromName: SITE_NAME,
    })

    console.log(`[send-delivery-email] ${result.skipped ? 'Ignoré' : 'Envoyé'} à ${toEmail} pour commande ${orderId}`)

    return new Response(JSON.stringify({ ...result, email: toEmail }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[send-delivery-email] Erreur:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// ============================================================
// send-delivery-email
// Envoie les credentials d'une commande confirmée par email au client,
// si profiles.send_email_on_delivery = true.
// Utilise Resend (https://resend.com) — API key à configurer dans
// Supabase > Project Settings > Edge Functions > Secrets : RESEND_API_KEY
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getAdmin, corsHeaders } from '../_shared/supplier-db.ts'

const SITE_NAME = 'AgedGmail'
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') ?? 'noreply@agedgmail.com'

/** Construit le HTML de l'email de livraison (style proche YTSeller). */
function buildEmailHtml(opts: {
  productName: string
  orderId: string
  shortId: string
  credentials: string
  totalPrice: number
  quantity: number
}): string {
  const { productName, shortId, credentials, totalPrice, quantity } = opts
  const lines = credentials.split('\n').filter(Boolean)

  const credsHtml = lines.map(line =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-family:monospace;font-size:12px;color:#333;word-break:break-all;">${escapeHtml(line)}</td></tr>`
  ).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your order is complete</title></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:#111827;padding:32px 40px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Your order is complete</h1>
        </td></tr>

        <!-- Intro -->
        <tr><td style="padding:32px 40px 16px;">
          <p style="color:#555;font-size:15px;line-height:1.6;margin:0;">
            Thank you for your purchase! Your order has been completed and your purchased items are included below. Please keep this email safe for your records.
          </p>
        </td></tr>

        <!-- Order table -->
        <tr><td style="padding:0 40px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e8;border-radius:8px;overflow:hidden;">
            <thead>
              <tr style="background:#f8f8f8;">
                <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e8e8e8;">Item</th>
                <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e8e8e8;">Quantity</th>
                <th style="padding:12px 16px;text-align:right;font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e8e8e8;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:16px;font-size:14px;font-weight:700;color:#111;border-bottom:1px solid #f0f0f0;">${escapeHtml(productName)}</td>
                <td style="padding:16px;font-size:14px;color:#555;text-align:center;border-bottom:1px solid #f0f0f0;">${quantity}</td>
                <td style="padding:16px;font-size:14px;font-weight:700;color:#111;text-align:right;border-bottom:1px solid #f0f0f0;">$${totalPrice.toFixed(2)}</td>
              </tr>
              <!-- Credentials box -->
              ${credsHtml}
            </tbody>
          </table>
        </td></tr>

        <!-- Total row -->
        <tr><td style="padding:0 40px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:15px;font-weight:700;color:#111;">Total</td>
              <td style="font-size:15px;font-weight:900;color:#111;text-align:right;">$${totalPrice.toFixed(2)}</td>
            </tr>
          </table>
        </td></tr>

        <!-- IDs -->
        <tr><td style="padding:0 40px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;border-radius:8px;padding:16px;">
            <tr>
              <td style="font-size:13px;color:#888;">ID</td>
              <td style="font-size:13px;color:#888;text-align:right;">Payment Method</td>
            </tr>
            <tr>
              <td style="font-size:16px;font-weight:900;color:#111;">${escapeHtml(shortId)}</td>
              <td style="font-size:14px;color:#555;text-align:right;">balance</td>
            </tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:0 40px 32px;text-align:center;">
          <a href="https://agedgmail.com/#dashboard" style="display:inline-block;background:#111827;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">View my orders</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #ececec;">
          <p style="color:#aaa;font-size:12px;margin:0;line-height:1.6;">
            If you have any trouble with your order, contact our support at
            <a href="mailto:rooseveltmkr@gmail.com" style="color:#555;font-weight:700;">${SITE_NAME}</a> — we're here to help.<br><br>
            You are receiving this important transactional email because you paid for the order.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
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
  const resendKey = Deno.env.get('RESEND_API_KEY')

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

    const wantsEmail = profile?.send_email_on_delivery === true
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
      productName: order.product_name || 'Your order',
      orderId: String(order.id),
      shortId,
      credentials,
      totalPrice: Number(order.total_price) || 0,
      quantity: Number(order.quantity) || 1,
    })

    if (!resendKey) {
      // Pas de clé Resend configurée — log et retour OK (ne bloque pas la livraison)
      console.warn(`[send-delivery-email] RESEND_API_KEY non configuré. Email non envoyé pour commande ${orderId}. Destinataire : ${toEmail}`)
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'no_resend_key' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Envoyer via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${SITE_NAME} <${FROM_EMAIL}>`,
        to: [toEmail],
        subject: `[${SITE_NAME}] Order #${shortId} — your products`,
        html,
      }),
    })

    const resBody = await res.json()
    if (!res.ok) throw new Error(`Resend error: ${JSON.stringify(resBody)}`)

    console.log(`[send-delivery-email] Email envoyé à ${toEmail} pour commande ${orderId} (Resend id: ${resBody.id})`)

    return new Response(JSON.stringify({ ok: true, email: toEmail, resend_id: resBody.id }), {
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

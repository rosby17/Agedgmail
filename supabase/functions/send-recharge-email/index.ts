// ============================================================
// send-recharge-email
// Envoie une confirmation par email quand une recharge de solde est
// créditée. Même fournisseur/clé que send-delivery-email : Brevo
// (BREVO_API_KEY, à configurer dans Supabase > Edge Functions > Secrets).
// Contrairement à la livraison, la confirmation de recharge n'est PAS
// soumise à l'opt-out send_email_on_delivery (ce n'est pas un envoi de
// credentials, juste un reçu de paiement).
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getAdmin, corsHeaders } from '../_shared/supplier-db.ts'

const SITE_NAME = 'AgedGmail'
const FROM_EMAIL = Deno.env.get('BREVO_FROM_EMAIL') ?? 'noreply@agedgmail.com'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildEmailHtml(opts: { amountUsd: number; newBalance: number; orderId: string }): string {
  const { amountUsd, newBalance } = opts
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Recharge confirmée</title></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:#111827;padding:32px 40px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Recharge confirmée</h1>
        </td></tr>
        <tr><td style="padding:32px 40px 16px;">
          <p style="color:#555;font-size:15px;line-height:1.6;margin:0;">
            Ton paiement a bien été reçu et ton solde ${SITE_NAME} a été crédité.
          </p>
        </td></tr>
        <tr><td style="padding:0 40px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;border-radius:8px;padding:20px;">
            <tr>
              <td style="font-size:13px;color:#888;">Montant crédité</td>
              <td style="font-size:20px;font-weight:900;color:#111;text-align:right;">+$${amountUsd.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#888;padding-top:8px;">Nouveau solde</td>
              <td style="font-size:15px;font-weight:700;color:#111;text-align:right;padding-top:8px;">$${newBalance.toFixed(2)}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 40px 32px;text-align:center;">
          <a href="https://agedgmail.com/#dashboard" style="display:inline-block;background:#111827;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">Voir mon compte</a>
        </td></tr>
        <tr><td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #ececec;">
          <p style="color:#aaa;font-size:12px;margin:0;line-height:1.6;">
            En cas de problème, contacte <a href="mailto:rooseveltmkr@gmail.com" style="color:#555;font-weight:700;">${escapeHtml(SITE_NAME)}</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = getAdmin()
  const brevoKey = Deno.env.get('BREVO_API_KEY')

  try {
    const { userId, orderId, amountUsd } = await req.json()
    if (!userId || !amountUsd) throw new Error('userId et amountUsd requis')

    const { data: profile, error: pErr } = await admin
      .from('profiles').select('email, balance').eq('id', userId).single()
    if (pErr || !profile?.email) throw new Error('Profil/email introuvable pour ' + userId)

    if (!brevoKey) {
      console.warn(`[send-recharge-email] BREVO_API_KEY non configuré. Email non envoyé pour user ${userId}.`)
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'no_brevo_key' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const html = buildEmailHtml({
      amountUsd: Number(amountUsd),
      newBalance: Number(profile.balance) || 0,
      orderId: String(orderId ?? ''),
    })

    const res = await fetch('https://api.brevo.com/v3/smtp/emails', {
      method: 'POST',
      headers: { 'api-key': brevoKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        sender: { name: SITE_NAME, email: FROM_EMAIL },
        to: [{ email: profile.email }],
        subject: `[${SITE_NAME}] Recharge de $${Number(amountUsd).toFixed(2)} confirmée`,
        htmlContent: html,
      }),
    })
    const resBody = await res.json()
    if (!res.ok) throw new Error(`Brevo error: ${JSON.stringify(resBody)}`)

    return new Response(JSON.stringify({ ok: true, email: profile.email, message_id: resBody.messageId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[send-recharge-email] Erreur:', (err as Error).message)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

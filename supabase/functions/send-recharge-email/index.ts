// ============================================================
// send-recharge-email
// Envoie une confirmation par email quand une recharge de solde est
// créditée (Maketou ou Binance Pay). Contrairement à la livraison, ce
// n'est pas soumis à l'opt-out send_email_on_delivery (pas un envoi de
// credentials, juste un reçu de paiement).
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getAdmin, corsHeaders } from '../_shared/supplier-db.ts'
import { sendEmail } from '../_shared/email.ts'
import { emailShell, infoBox, ctaButton } from '../_shared/email-template.ts'

const SITE_NAME = 'AgedGmailYT'
const SITE_URL = 'https://agedgmail.tools-cl.com'

function buildEmailHtml(opts: { amountUsd: number; newBalance: number }): string {
  const { amountUsd, newBalance } = opts

  const body = `
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Ton paiement a bien été reçu et ton solde ${SITE_NAME} a été crédité automatiquement.
    </p>

    ${infoBox([
      { label: 'Montant crédité', value: `+$${amountUsd.toFixed(2)}`, big: true, accent: true },
      { label: 'Nouveau solde', value: `$${newBalance.toFixed(2)}` },
    ])}

    <div style="text-align:center;">
      ${ctaButton(`${SITE_URL}/app/myorders`, 'Voir mon compte')}
    </div>
  `

  return emailShell({
    preheader: `+$${amountUsd.toFixed(2)} crédités sur ton compte AgedGmailYT.`,
    heroTitle: 'Recharge confirmée ✅',
    bodyHtml: body,
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = getAdmin()

  try {
    const { userId, amountUsd } = await req.json()
    if (!userId || !amountUsd) throw new Error('userId et amountUsd requis')

    const { data: profile, error: pErr } = await admin
      .from('profiles').select('email, balance').eq('id', userId).single()
    if (pErr || !profile?.email) throw new Error('Profil/email introuvable pour ' + userId)

    const html = buildEmailHtml({
      amountUsd: Number(amountUsd),
      newBalance: Number(profile.balance) || 0,
    })

    const result = await sendEmail({
      to: profile.email,
      subject: `[${SITE_NAME}] Recharge de $${Number(amountUsd).toFixed(2)} confirmée`,
      html,
      fromName: SITE_NAME,
    })

    return new Response(JSON.stringify({ ...result, email: profile.email }), {
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

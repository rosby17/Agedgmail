// Relais d'envoi email — exécuté en runtime Node.js classique (pas Edge),
// donc le TLS/STARTTLS de nodemailer fonctionne normalement, contrairement
// aux Supabase Edge Functions (Deno sandboxé) qui plantent dessus.
// Appelé uniquement par les Supabase Edge Functions, jamais côté client —
// protégé par un secret partagé (EMAIL_RELAY_SECRET).
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = req.headers['x-relay-secret'];
  if (!process.env.EMAIL_RELAY_SECRET || secret !== process.env.EMAIL_RELAY_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { to, subject, html, fromName } = req.body || {};
  if (!to || !subject || !html) {
    res.status(400).json({ error: 'to, subject, html requis' });
    return;
  }

  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_KEY) {
    res.status(200).json({ ok: true, skipped: true, reason: 'no_smtp_credentials' });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY,
      },
    });

    const from = process.env.BREVO_FROM_EMAIL || 'agedgmail@tools-cl.com';
    const info = await transporter.sendMail({
      from: `"${fromName || 'AgedGmail'}" <${from}>`,
      to,
      subject,
      html,
    });

    res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error('[send-email] Erreur:', err.message);
    res.status(500).json({ error: err.message });
  }
}

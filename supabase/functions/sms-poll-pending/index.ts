import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { verifySignedSecurityId, providerForAlias } from '../_shared/sms-pricing.ts'
import { poll5simCode } from '../_shared/provider-5sim.ts'

async function fetchCode(securityId: string, number: string): Promise<string | null> {
  const verified = await verifySignedSecurityId(securityId)
  if (!verified) throw new Error('invalid signed SMS session')
  const parts = verified.base.split(':')
  const provider = providerForAlias(parts[0])
  if (provider === 'smscodes') {
    const key = Deno.env.get('SMSCODES_API_KEY')
    const response = await fetch(`https://code.smscodes.io/api/sms/GetSMSCode?key=${key}&sid=${parts[1]}&number=${number}`)
    const data = await response.json()
    const value = String(data?.SMS || '')
    return value && !/not received|waiting/i.test(value) ? value : null
  }
  if (provider === 'pvapins') {
    const key = Deno.env.get('PVAPINS_API_KEY')
    const country = parts[2] || 'usa'
    const app = parts[3] || 'YouTube'
    const response = await fetch(`https://api.pvapins.com/user/api/get_sms.php?customer=${key}&number=${number}&country=${encodeURIComponent(country)}&app=${encodeURIComponent(app)}`)
    const text = (await response.text()).trim()
    if (!text || /not received|waiting|not found|expired|error/i.test(text)) return null
    try {
      const data = JSON.parse(text)
      return String(data.sms || data.code || '') || null
    } catch {
      return text.includes(':') ? text.split(':').pop()!.trim() : text
    }
  }
  if (provider === 'fivesim') return (await poll5simCode(parts[1])).code || null
  return null
}

serve(async () => {
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const now = new Date().toISOString()
  await admin.from('sms_pending_sessions').update({ status: 'expired', updated_at: now })
    .eq('status', 'waiting').lte('expires_at', now)
  const { data: sessions, error } = await admin.from('sms_pending_sessions').select('*')
    .eq('status', 'waiting').gt('expires_at', now).order('created_at').limit(50)
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  let completed = 0
  for (const session of sessions || []) {
    const { data: claimed } = await admin.from('sms_pending_sessions').update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', session.id).eq('status', 'waiting').select('id').maybeSingle()
    if (!claimed) continue
    try {
      const code = await fetchCode(session.security_id, session.number)
      if (!code) {
        await admin.from('sms_pending_sessions').update({ status: 'waiting', updated_at: new Date().toISOString() }).eq('id', session.id)
        continue
      }
      const { data: existing } = await admin.from('orders').select('id').eq('user_id', session.user_id)
        .in('status', ['confirmed', 'delivered']).filter('delivery_data->>number', 'eq', session.number).maybeSingle()
      if (existing) {
        await admin.from('sms_pending_sessions').update({ status: 'completed', order_id: existing.id, updated_at: new Date().toISOString() }).eq('id', session.id)
        continue
      }
      const verified = await verifySignedSecurityId(session.security_id)
      if (!verified) throw new Error('invalid signed price')
      const { error: debitError } = await admin.rpc('deduct_balance', { p_user_id: session.user_id, p_amount: verified.price })
      if (debitError) throw new Error('Solde client insuffisant lors de la réception tardive')
      const alias = verified.base.split(':')[0]
      const { data: order, error: orderError } = await admin.from('orders').insert({
        user_id: session.user_id, product_name: session.description, total_price: verified.price,
        supplier_cost: session.supplier_cost || 0, quantity: 1, buyer_email: session.buyer_email,
        status: 'delivered', delivery_data: { number: session.number, code, provider: alias, country: session.country || null, service: session.service_label || null },
        credentials: `Phone: ${session.number}\nSMS Code: ${code}`,
      }).select('id').single()
      if (orderError) {
        await admin.rpc('credit_balance', { p_user_id: session.user_id, p_amount: verified.price })
        throw orderError
      }
      await admin.from('sms_pending_sessions').update({ status: 'completed', order_id: order.id, updated_at: new Date().toISOString() }).eq('id', session.id)
      await admin.from('notifications').insert({ user_id: session.user_id, type: 'info', title: 'SMS reçu', message: `Votre code SMS tardif pour le numéro terminant par ${session.number.slice(-4)} est disponible dans Mes SMS.` })
      completed++
    } catch (pollError) {
      await admin.from('sms_pending_sessions').update({ status: 'failed', error_message: pollError.message, updated_at: new Date().toISOString() }).eq('id', session.id)
    }
  }
  return new Response(JSON.stringify({ ok: true, checked: sessions?.length || 0, completed }), { headers: { 'Content-Type': 'application/json' } })
})

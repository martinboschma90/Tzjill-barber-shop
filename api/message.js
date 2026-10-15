import { randomUUID } from 'node:crypto'
import { json, isAllowedRequest, rateLimit, setCors } from './http-security.mjs'
import { sendBookingEmail } from './booking-request-lib.mjs'

export function validateMessage(body) {
  if (!body || typeof body !== 'object' || !['contact', 'newsletter'].includes(body.kind)) return 'Onbekend formulier.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email || '').trim()) || String(body.email).length > 200) return 'Vul een geldig e-mailadres in.'
  if (body.kind === 'newsletter' && body.consent !== true) return 'Bevestig dat je de nieuwsbrief wilt ontvangen.'
  if (body.kind === 'contact' && (String(body.name || '').trim().length < 2 || String(body.name).length > 80 || String(body.message || '').trim().length < 2 || String(body.message).length > 5000 || String(body.phone || '').length > 40)) return 'Vul je naam en bericht in (maximaal 5000 tekens).'
  return null
}
async function inboxAddress() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (url && key) {
    const response = await fetch(`${url}/rest/v1/cms_content?key=eq.tzjill-cms-content-v1&select=data&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(5000) })
    if (!response.ok) throw new Error('inbox unavailable')
    const [row] = await response.json()
    const email = row?.data?.site?.contact?.[0]?.email?.trim()
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return email
  }
  return process.env.CONTACT_TO_EMAIL || 'info@tzjill.nl'
}
export default async function handler(req, res) {
  setCors(res, req.headers.origin)
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })
  if (!isAllowedRequest(req)) return json(res, 403, { error: 'Forbidden' })
  if (!await rateLimit(req, { bucket: 'message', limit: 6 })) return json(res, 429, { error: 'Te veel pogingen. Probeer het later opnieuw.' })
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    if (body?.website) return json(res, 200, { ok: true }) // honeypot
    const error = validateMessage(body)
    if (error) return json(res, 400, { error })
    if (!process.env.RESEND_API_KEY) return json(res, 503, { error: 'Verzenden is nog niet beschikbaar. Mail de salon rechtstreeks.' })
    const email = body.email.trim()
    const newsletter = body.kind === 'newsletter'
    const subject = newsletter ? 'Nieuwsbrief Tzjill — aanmelding' : `Contact Tzjill — ${body.name.trim()}`
    const text = newsletter ? `Aanmelding nieuwsbrief\nE-mail: ${email}\nToestemming: ja` : `Naam: ${body.name.trim()}\nE-mail: ${email}\nTelefoon: ${String(body.phone || '').trim()}\n\n${body.message.trim()}`
    const requestId = /^[a-f0-9-]{36}$/i.test(body.requestId || '') ? body.requestId : randomUUID()
    const result = await sendBookingEmail({ subject, text, replyTo: email, to: await inboxAddress(), idempotencyKey: `message-${requestId}` })
    if (!result.ok) return json(res, 502, { error: 'Verzenden lukt nu niet. Probeer opnieuw of mail de salon.' })
    return json(res, 200, { ok: true })
  } catch { return json(res, 500, { error: 'Verzenden mislukt. Je bericht staat nog in het formulier.' }) }
}

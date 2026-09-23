import { sendBookingEmail } from './booking-request-lib.mjs'
import { recordFormSubmission } from './form-submissions-lib.mjs'

export function isValidPromoEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export function isNlMobile(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (/^06\d{8}$/.test(digits)) return true
  if (/^316\d{8}$/.test(digits)) return true
  return false
}

export function normalizeNlMobile(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('316') && digits.length === 11) {
    return `0${digits.slice(2)}`
  }
  return digits
}

export function isValidPromoPayload(payload) {
  if (!payload || typeof payload !== 'object') return false
  const name = String(payload.name || '').trim()
  const email = String(payload.email || '').trim()
  const phone = String(payload.phone || '').trim()
  if (name.length < 2 || name.length > 80) return false
  if (!isValidPromoEmail(email) || email.length > 200) return false
  if (!isNlMobile(phone)) return false
  return true
}

export function formatPromoEmail({ name, email, phone }) {
  const mobile = normalizeNlMobile(phone)
  return {
    subject: `10 jaar Tzjill — aanmelding: ${name}`,
    text: [
      'NIEUWE AANMELDING — 10 jaar Tzjill (2016–2026)',
      '',
      `Naam: ${name}`,
      `E-mail: ${email}`,
      `06: ${mobile}`,
      '',
      'Bron: site popup “Meld je aan voor te gekke prijzen”.',
    ].join('\n'),
    replyTo: email,
  }
}

export async function sendPromoSignupEmail(payload) {
  const name = String(payload.name || '').trim()
  const email = String(payload.email || '').trim()
  const phone = String(payload.phone || '').trim()
  const { subject, text, replyTo } = formatPromoEmail({ name, email, phone })
  const to =
    process.env.PROMO_TO_EMAIL ||
    process.env.BOOKING_TO_EMAIL ||
    'info@tzjill.nl'
  return sendBookingEmail({ subject, text, replyTo, to })
}

/** Save the lead first, then mail. A mail failure does not drop a stored row. */
export async function acceptPromoSignup(payload) {
  const stored = await recordFormSubmission(payload).catch(() => ({ ok: false }))
  const sent = await sendPromoSignupEmail(payload)
  return {
    stored: Boolean(stored?.ok),
    emailed: Boolean(sent?.ok),
    emailError: sent?.ok ? null : sent?.error || 'Aanmelding kon niet worden verstuurd.',
  }
}

export function promoSignupResponse(result) {
  if (result?.stored || result?.emailed) {
    return {
      status: 200,
      body: {
        ok: true,
        stored: Boolean(result.stored),
        emailed: Boolean(result.emailed),
      },
    }
  }
  return {
    status: 502,
    body: {
      error: result?.emailError || 'Aanmelding kon niet worden opgeslagen.',
    },
  }
}

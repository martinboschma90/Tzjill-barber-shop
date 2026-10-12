/**
 * Fallback WhatsApp number when the CMS has not set one.
 * Tzjill's shop line is 058 844 7025; no separate WhatsApp number is stored.
 */
export const DEFAULT_WHATSAPP_NUMBER = '+31 36 236 53232'

export function normalizeWhatsAppDigits(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = normalizeWhatsAppDigits(phone)
  if (!digits) return '#'
  const text = encodeURIComponent(message)
  return `https://wa.me/${digits}?text=${text}`
}

export function artistBookingWhatsAppMessage(artistName: string): string {
  return `Hi Tzjill, I would like to discuss booking ${artistName}.`
}

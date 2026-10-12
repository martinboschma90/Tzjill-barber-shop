import { PHONE_TEL } from '@/data/site'

/** Salon line from the Tzjill site content. No separate WhatsApp mobile is published. */
export const DEFAULT_WHATSAPP_NUMBER = PHONE_TEL

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
  return `Hi Tzjill, ik wil graag een afspraak bij ${artistName}.`
}

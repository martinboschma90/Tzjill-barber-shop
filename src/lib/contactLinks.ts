import { PHONE_TEL } from '@/data/site'
export function phoneHref(display: string): string {
  const compact = display.replace(/[^\d+]/g, '')
  const number = compact.startsWith('00') ? `+${compact.slice(2)}` : compact.startsWith('0') ? `+31${compact.slice(1)}` : compact
  return `tel:${number || PHONE_TEL}`
}
export function safeLink(value: string): string | null {
  const clean = value.trim()
  if (/^\/(?!\/)/.test(clean) || /^#[a-z][\w-]*$/i.test(clean)) return clean
  try { const url = new URL(clean); return ['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol) ? clean : null } catch { return null }
}

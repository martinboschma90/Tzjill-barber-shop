import { storageGet, storageSet } from '@/lib/safeStorage'

export const PROMO_STORAGE_KEY = 'tzjill-promo-10y-v1'

export function isValidPromoEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/** Dutch mobile: 06 + 8 digits, or +31 6…. */
export function isNlMobile(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (/^06\d{8}$/.test(digits)) return true
  if (/^316\d{8}$/.test(digits)) return true
  return false
}

export function normalizeNlMobile(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('316') && digits.length === 11) {
    return `0${digits.slice(2)}`
  }
  return digits
}

export function promoAlreadySeen(): boolean {
  const raw = storageGet(PROMO_STORAGE_KEY)
  return raw === 'dismissed' || raw === 'submitted'
}

export function markPromoSeen(state: 'dismissed' | 'submitted'): void {
  storageSet(PROMO_STORAGE_KEY, state)
}

export async function submitPromoSignup(payload: {
  name: string
  email: string
  phone: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/promo-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
      ...payload,
      path: typeof window !== 'undefined' ? window.location.pathname : '',
    }),
    })
    const data = (await res.json().catch(() => null)) as {
      error?: string
    } | null
    if (!res.ok) {
      return { ok: false, error: data?.error || `Versturen mislukt (${res.status})` }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Geen verbinding. Probeer het opnieuw.' }
  }
}

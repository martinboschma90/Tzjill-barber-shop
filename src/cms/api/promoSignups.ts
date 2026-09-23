import { supabase } from '@/lib/supabase'

export type PromoSignupRow = {
  id: string
  name: string
  email: string
  phone: string
  source: string
  path: string | null
  created_at: string
}

async function authHeader(): Promise<Record<string, string>> {
  if (!supabase) return {}
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function listPromoSignups(): Promise<{
  signups: PromoSignupRow[]
  total: number
  truncated: boolean
  error: string | null
}> {
  const response = await fetch('/api/promo-signups', { headers: await authHeader() })
  const payload = (await response.json().catch(() => null)) as {
    signups?: PromoSignupRow[]
    total?: number
    truncated?: boolean
    error?: string
  } | null
  if (!response.ok) {
    return {
      signups: [],
      total: 0,
      truncated: false,
      error: payload?.error || 'Aanmeldingen laden mislukt.',
    }
  }
  const signups = Array.isArray(payload?.signups) ? payload.signups : []
  return {
    signups,
    total: typeof payload?.total === 'number' ? payload.total : signups.length,
    truncated: Boolean(payload?.truncated),
    error: null,
  }
}

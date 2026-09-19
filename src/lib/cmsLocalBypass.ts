import { isSupabaseConfigured } from '@/lib/supabaseEnv'

function hostnameOf(value: string): string | null {
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
    return new URL(withProtocol).hostname.toLowerCase()
  } catch {
    return null
  }
}

function isLoopbackHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1'
}

function envPointsAtDeployedHost(): boolean {
  const candidates = [
    import.meta.env.VITE_PUBLIC_SITE_URL,
    import.meta.env.VITE_SUPABASE_URL,
  ]
  return candidates.some((raw) => {
    const host = hostnameOf((raw ?? '').trim())
    if (!host) return false
    if (isLoopbackHost(host)) return false
    return (
      host.endsWith('.vercel.app') ||
      host.endsWith('.now.sh') ||
      host === 'tzjill.nl' ||
      host === 'www.tzjill.nl' ||
      host.endsWith('.supabase.co')
    )
  })
}

/**
 * Unlock CMS without login ONLY on a true local Vite dev server.
 * Never on vercel.app, never in production builds, never when env points
 * at the deployed shop or a hosted Supabase project.
 */
export function isCmsLocalBypassAllowed(): boolean {
  if (!import.meta.env.DEV) return false
  if (isSupabaseConfigured) return false
  if (envPointsAtDeployedHost()) return false
  if (typeof window === 'undefined') return false
  const host = window.location.hostname.toLowerCase()
  if (host.endsWith('.vercel.app') || host.endsWith('.now.sh')) return false
  return isLoopbackHost(host)
}

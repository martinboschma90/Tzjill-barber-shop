/** Preview origin until a real shop domain is pointed at this app. */
export const FALLBACK_PUBLIC_SITE_URL = 'https://tzjill-barber-shop.vercel.app'

const NOTYPE_HOSTS = new Set(['notype-mgmt.com', 'www.notype-mgmt.com'])

function cleanOrigin(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

function hostnameOf(value: string): string | null {
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
    return new URL(withProtocol).hostname.toLowerCase()
  } catch {
    return null
  }
}

/** Leftover agency host — never advertise this as Tzjill. */
export function isNotypeHost(value: string): boolean {
  const host = hostnameOf(value)
  return Boolean(host && NOTYPE_HOSTS.has(host))
}

/**
 * Old WordPress shop. Do not use as an automatic fallback — that site is
 * not this app. An explicit env/CMS value is allowed after DNS cutover.
 */
export function isLegacyWordpressHost(value: string): boolean {
  const host = hostnameOf(value)
  return host === 'tzjill.nl' || host === 'www.tzjill.nl'
}

export function envPublicSiteUrl(): string {
  return cleanOrigin(import.meta.env.VITE_PUBLIC_SITE_URL ?? '')
}

export function isPreviewHost(value: string): boolean {
  const host = hostnameOf(value)
  return Boolean(host && (host.endsWith('.vercel.app') || host === 'localhost'))
}

/**
 * One public origin for canonical / robots / sitemap / OG.
 * Env wins. CMS is next unless it still points at Notype.
 * Never invent www.tzjill.nl — that is still the WordPress site.
 */
export function resolvePublicSiteUrl(cmsUrl?: string): string {
  const fromEnv = envPublicSiteUrl()
  if (fromEnv && !isNotypeHost(fromEnv)) return fromEnv

  const fromCms = cleanOrigin(cmsUrl ?? '')
  if (fromCms && !isNotypeHost(fromCms)) return fromCms

  if (typeof window !== 'undefined' && window.location?.origin) {
    const live = cleanOrigin(window.location.origin)
    if (live && !isNotypeHost(live)) return live
  }

  return FALLBACK_PUBLIC_SITE_URL
}

/** Preview hosts stay noindex until a real domain is configured. */
export function shouldNoIndexPublicSite(
  origin: string,
  searchIndexing?: boolean,
): boolean {
  if (searchIndexing === false) return true
  if (isPreviewHost(origin)) return true
  if (isNotypeHost(origin)) return true
  if (!envPublicSiteUrl() && isLegacyWordpressHost(origin)) return true
  return false
}

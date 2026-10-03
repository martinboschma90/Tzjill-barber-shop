/** Canonical shop origin. Apex tzjill.nl is not used in canonicals. */
export const CANONICAL_SITE_ORIGIN = 'https://www.tzjill.nl'

/** Public origin for canonical / robots / sitemap / OG. */
export const FALLBACK_PUBLIC_SITE_URL = CANONICAL_SITE_ORIGIN

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

/** Shop domain, with or without www. Canonical links always use www. */
export function isShopHost(value: string): boolean {
  const host = hostnameOf(value)
  return host === 'tzjill.nl' || host === 'www.tzjill.nl'
}

export function envPublicSiteUrl(): string {
  return cleanOrigin(import.meta.env.VITE_PUBLIC_SITE_URL ?? '')
}

export function isPreviewHost(value: string): boolean {
  const host = hostnameOf(value)
  return Boolean(
    host && (host.endsWith('.vercel.app') || host === 'localhost' || host === '127.0.0.1'),
  )
}

function toPublicOrigin(value: string): string | null {
  const cleaned = cleanOrigin(value)
  if (!cleaned || isNotypeHost(cleaned) || isPreviewHost(cleaned)) return null
  if (isShopHost(cleaned)) return CANONICAL_SITE_ORIGIN
  try {
    return new URL(cleaned).origin
  } catch {
    return null
  }
}

/**
 * One public origin for canonical / robots / sitemap / OG.
 * Env wins, then an explicit CMS URL. Preview hosts and vercel.app
 * never become the canonical. The shop domain always resolves to www.
 */
export function resolvePublicSiteUrl(cmsUrl?: string): string {
  return toPublicOrigin(envPublicSiteUrl()) ?? toPublicOrigin(cmsUrl ?? '') ?? CANONICAL_SITE_ORIGIN
}

/**
 * Preview hosts stay noindex. www.tzjill.nl is indexable.
 * `searchIndexing: false` still noindexes when the CMS URL is already the
 * shop domain. A leftover false flag with a vercel.app URL does not,
 * because that was the pre-launch default.
 */
export function shouldNoIndexPublicSite(
  origin: string,
  searchIndexing?: boolean,
  configuredUrl?: string,
): boolean {
  if (typeof window !== 'undefined' && isPreviewHost(window.location.origin)) return true
  if (isPreviewHost(origin) || isNotypeHost(origin)) return true
  if (searchIndexing !== false) return false
  return isShopHost(configuredUrl ?? '') && isShopHost(origin)
}

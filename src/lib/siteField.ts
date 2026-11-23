import type { SiteContent } from '@/cms/content'

/** Use seed value only when the field is missing (`undefined`), not when it is `""`. */
export function siteField<K extends keyof SiteContent>(
  site: SiteContent,
  key: K,
  seed: SiteContent[K],
): SiteContent[K] {
  return site[key] !== undefined ? site[key] : seed
}
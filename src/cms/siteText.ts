import defaults from '@/cms/textDefaults.json'
import type { SiteContent } from '@/cms/content'
import { hideBookingVendor } from '@/lib/hideBookingVendor'

export type TextDefaultKey = keyof typeof defaults

/** Resolved CMS copy: empty string is intentional; fallback only when the key is unset. */
export function siteText(site: SiteContent, textKey: TextDefaultKey): string {
  const fallback = defaults[textKey].text
  const value = site.texts?.[textKey]
  return hideBookingVendor(value !== undefined ? value : fallback)
}
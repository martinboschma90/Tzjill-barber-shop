import { productsEnabled } from '@/data/site'
import {
  defaultNavLinks,
  visibleNavLinks,
  desktopNavLeft,
  desktopNavRight,
  footerNavMain,
  footerNavStudio,
} from '@/lib/siteNav'
import type { SiteContent } from '@/cms/content'

/** @deprecated Prefer `visibleNavLinks(site)` — kept for scripts that lack CMS context. */
export const publicNav = productsEnabled
  ? defaultNavLinks().filter((link) => link.visible)
  : defaultNavLinks().filter((link) => link.visible && link.to !== '/products')

export const publicMenuLinks = publicNav
export const desktopNavLeftLegacy = defaultNavLinks().filter((l) => l.desktop === 'left')
export const desktopNavRightLegacy = defaultNavLinks().filter((l) => l.desktop === 'right')

export {
  visibleNavLinks,
  desktopNavLeft,
  desktopNavRight,
  footerNavMain,
  footerNavStudio,
  defaultNavLinks,
}

export function pickNavForSite(site: SiteContent) {
  return visibleNavLinks(site)
}
import type { SiteContent, SiteNavLink } from '@/cms/content'
import { productsEnabled } from '@/data/site'

/** Default public navigation — matches legacy `data/nav.ts` behaviour. */
export function defaultNavLinks(): SiteNavLink[] {
  return [
    { label: 'Home', to: '/', visible: true, desktop: 'left', footerSection: 'main' },
    { label: 'Prijzen', to: '/prijzen', visible: true, desktop: 'left', footerSection: 'main' },
    { label: 'Lookbook', to: '/lookbook', visible: true, desktop: 'left', footerSection: 'main' },
    {
      label: 'Producten',
      to: '/products',
      visible: productsEnabled,
      desktop: 'none',
      footerSection: 'main',
    },
    { label: 'Team', to: '/team', visible: true, desktop: 'right', footerSection: 'studio' },
    { label: 'Over ons', to: '/over-ons', visible: true, desktop: 'right', footerSection: 'studio' },
    { label: 'Contact', to: '/contact', visible: true, desktop: 'right', footerSection: 'studio' },
  ]
}

export function resolvedNavLinks(site: SiteContent): SiteNavLink[] {
  return site.navLinks ?? defaultNavLinks()
}

function navLinkAllowed(link: SiteNavLink, site: SiteContent): boolean {
  if (!link.visible) return false
  if (link.to === '/team' && site.teamVisible === false) return false
  if (link.to === '/products' && !site.productsEnabled) return false
  return true
}

export function visibleNavLinks(site: SiteContent): SiteNavLink[] {
  return resolvedNavLinks(site).filter((link) => navLinkAllowed(link, site))
}

export function desktopNavLeft(site: SiteContent): SiteNavLink[] {
  return visibleNavLinks(site).filter((link) => link.desktop === 'left')
}

export function desktopNavRight(site: SiteContent): SiteNavLink[] {
  return visibleNavLinks(site).filter((link) => link.desktop === 'right')
}

export function footerNavMain(site: SiteContent): SiteNavLink[] {
  return visibleNavLinks(site).filter((link) => link.footerSection === 'main')
}

export function footerNavStudio(site: SiteContent): SiteNavLink[] {
  return visibleNavLinks(site).filter((link) => link.footerSection === 'studio')
}
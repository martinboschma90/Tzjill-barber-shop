import { productsEnabled } from '@/data/site'

const publicNavAll = [
  { label: 'Home', to: '/' },
  { label: 'Prijzen', to: '/prijzen' },
  { label: 'Lookbook', to: '/lookbook' },
  { label: 'Producten', to: '/products' },
  { label: 'Collabs', to: '/collabs' },
  { label: 'Team', to: '/team' },
  { label: 'Over ons', to: '/over-ons' },
  { label: 'Contact', to: '/contact' },
] as const

export const publicNav = productsEnabled
  ? publicNavAll
  : publicNavAll.filter((link) => link.to !== '/products')

export const publicMenuLinks = publicNav

const desktopLeftTo = ['/', '/prijzen', '/lookbook'] as const
const desktopRightTo = ['/team', '/over-ons', '/contact'] as const

function pickNav(targets: readonly string[]) {
  return targets.flatMap((to) => publicNav.filter((link) => link.to === to))
}

/** Three links each side of the logo. Remaining pages stay in the menu and footer. */
export const desktopNavLeft = pickNav(desktopLeftTo)
export const desktopNavRight = pickNav(desktopRightTo)

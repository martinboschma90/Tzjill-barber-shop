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

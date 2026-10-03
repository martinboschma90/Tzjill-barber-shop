import { productsEnabled } from '@/data/site'

const publicNavAll = [
  { label: 'Home', to: '/' },
  { label: 'Prijzen', to: '/prijzen' },
  { label: 'Baard', to: '/baard-scheren' },
  { label: 'Lookbook', to: '/lookbook' },
  { label: 'Producten', to: '/products' },
  { label: 'Collabs', to: '/collabs' },
  { label: 'Team', to: '/team' },
  { label: 'Over ons', to: '/over-ons' },
  { label: 'Leeuwarden', to: '/barbershop-leeuwarden' },
  { label: 'Contact', to: '/contact' },
] as const

export const publicNav = productsEnabled
  ? publicNavAll
  : publicNavAll.filter((link) => link.to !== '/products')

export const publicMenuLinks = publicNav

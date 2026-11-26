import { Link, useLocation } from 'react-router-dom'
import { productsEnabled } from '@/data/site'

const PAGE_TAB_DEFS = [
  { to: '/cms/home', label: 'Homepage' },
  { to: '/cms/prijzen', label: 'Prijzen' },
  { to: '/cms/lookbook', label: 'Lookbook' },
  { to: '/cms/products', label: 'Producten' },
  { to: '/cms/collabs', label: 'Collabs' },
  { to: '/cms/team', label: 'Team' },
  { to: '/cms/over-ons', label: 'Over ons' },
  { to: '/cms/booking', label: 'Afspraakvenster' },
  { to: '/cms/popup', label: 'Mailingpop-up' },
  { to: '/cms/forms/contact', label: 'Contactformulier' },
  { to: '/cms/forms/newsletter', label: 'Nieuwsbrief' },
  { to: '/cms/contact', label: 'Contact' },
  { to: '/cms/footer', label: 'Footer' },
  { to: '/cms/legal', label: 'Privacy en cookies' },
] as const

export const PAGE_TABS = productsEnabled
  ? PAGE_TAB_DEFS
  : PAGE_TAB_DEFS.filter((tab) => tab.to !== '/cms/products')

export function isFormsWorkspacePath(pathname: string) {
  return ['/cms/forms', '/cms/popup', '/cms/booking'].some(
    (path) => pathname === path || pathname.startsWith(path + '/'),
  )
}

export function isPagesWorkspacePath(pathname: string) {
  if (
    pathname.startsWith('/cms/about') ||
    pathname.startsWith('/cms/roster') ||
    pathname.startsWith('/cms/booking')
  ) {
    return true
  }
  if (isFormsWorkspacePath(pathname)) return true
  return PAGE_TABS.some((t) => pathname === t.to || pathname.startsWith(`${t.to}/`))
}

export function isPageTabActive(pathname: string, to: string) {
  return (
    pathname === to ||
    pathname.startsWith(`${to}/`) ||
    (to === '/cms/over-ons' && pathname.startsWith('/cms/about')) ||
    (to === '/cms/team' && pathname.startsWith('/cms/roster'))
  )
}

export function pageTabsFor(kind: 'pages' | 'forms') {
  const forms = kind === 'forms'
  return PAGE_TABS.filter((tab) => isFormsWorkspacePath(tab.to) === forms)
}

const sublinkCls = (active: boolean) =>
  `flex min-h-8 items-center rounded-lg px-2.5 pl-9 text-[13px] font-medium ${
    active
      ? 'bg-[#f5f5f5] text-[#111214] shadow-[inset_0_0_0_1px_#e5e5e5]'
      : 'text-[#3a3a37] hover:bg-[#fafafa]'
  }`

/** Nested page links in the Co-public sidebar — keeps every Tzjill page reachable. */
export function SidebarPageLinks({ kind }: { kind: 'pages' | 'forms' }) {
  const { pathname } = useLocation()
  return (
    <ul className="mb-1 mt-0.5 space-y-px">
      {pageTabsFor(kind).map((tab) => {
        const active = isPageTabActive(pathname, tab.to)
        return (
          <li key={tab.to}>
            <Link to={tab.to} aria-current={active ? 'page' : undefined} className={sublinkCls(active)}>
              {tab.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

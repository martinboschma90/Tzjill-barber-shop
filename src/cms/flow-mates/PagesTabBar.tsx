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
  { to: '/cms/contact', label: 'Contact' },
  { to: '/cms/footer', label: 'Footer' },
] as const

export const PAGE_TABS = productsEnabled
  ? PAGE_TAB_DEFS
  : PAGE_TAB_DEFS.filter((tab) => tab.to !== '/cms/products')

export function isPagesWorkspacePath(pathname: string) {
  if (
    pathname.startsWith('/cms/about') ||
    pathname.startsWith('/cms/roster') ||
    pathname.startsWith('/cms/booking')
  ) {
    return true
  }
  return PAGE_TABS.some((t) => pathname === t.to || pathname.startsWith(`${t.to}/`))
}

/** Frame-style sticky page tabs at the top of the editor. */
export function PagesTabBar() {
  const { pathname } = useLocation()

  return (
    <div className="cms-page-tabs sticky top-12 z-10 mb-6 -mx-4 border-b border-neutral-200/70 bg-[#fafaf8]/95 px-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:top-0 lg:z-30 lg:-mx-8 lg:px-8">
      <div className="flex items-center gap-1 overflow-x-auto py-2">
        <span className="mr-3 shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          Pagina's
        </span>
        {PAGE_TABS.map((tab) => {
          const active =
            pathname === tab.to ||
            pathname.startsWith(`${tab.to}/`) ||
            (tab.to === '/cms/over-ons' && pathname.startsWith('/cms/about')) ||
            (tab.to === '/cms/team' && pathname.startsWith('/cms/roster'))
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

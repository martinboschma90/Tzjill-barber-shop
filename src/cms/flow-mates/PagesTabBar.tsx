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
  return ['/cms/forms', '/cms/popup', '/cms/booking'].some(path => pathname === path || pathname.startsWith(path + '/'))
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

/** Frame-style sticky page tabs at the top of the editor. */
export function PagesTabBar() {
  const { pathname } = useLocation()
  const formsWorkspace = isFormsWorkspacePath(pathname)
  const visibleTabs = PAGE_TABS.filter(tab => isFormsWorkspacePath(tab.to) === formsWorkspace)

  return (
    <div className="cms-page-tabs sticky top-12 z-10 mb-6 -mx-4 border-b border-neutral-200/70 bg-[#fafaf8]/95 px-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:fixed lg:inset-y-0 lg:left-16 lg:z-20 lg:m-0 lg:w-44 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-3 lg:py-7">
      <div className="flex items-center gap-1 overflow-x-auto py-2 lg:flex-col lg:items-stretch lg:overflow-visible">
        <span className="mr-3 shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
          {formsWorkspace ? 'Formulieren & pop-ups' : 'Website'}
        </span>
        {visibleTabs.map((tab) => {
          const active =
            pathname === tab.to ||
            pathname.startsWith(`${tab.to}/`) ||
            (tab.to === '/cms/over-ons' && pathname.startsWith('/cms/about')) ||
            (tab.to === '/cms/team' && pathname.startsWith('/cms/roster'))
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? 'page' : undefined}
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

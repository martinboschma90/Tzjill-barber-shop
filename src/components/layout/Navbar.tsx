import { SiteText } from '@/cms/SiteText'
import { useCms } from '@/cms/CmsContext'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookButton } from '@/components/booking/BookButton'
import { Logo } from '@/components/ui/Logo'
import { desktopNavLeft, desktopNavRight } from '@/lib/siteNav'
import type { SiteNavLink } from '@/cms/content'
import { siteText } from '@/cms/siteText'

type NavbarProps = {
  menuOpen: boolean
  onMenuToggle: () => void
  onMenuIntent?: () => void
  variant?: 'hero' | 'mark' | 'wordmark'
}

function navActive(pathname: string, to: string) {
  if (to === '/over-ons') return pathname === '/over-ons' || pathname === '/about'
  if (to === '/prijzen') return pathname === '/prijzen' || pathname === '/menu'
  return pathname === to
}

function NavItem({
  link,
  pathname,
}: {
  link: SiteNavLink
  pathname: string
}) {
  return (
    <Link
      to={link.to}
      aria-current={navActive(pathname, link.to) ? 'page' : undefined}
      className={`wf-link type-ui inline-flex min-h-11 items-center ${
        navActive(pathname, link.to) ? 'opacity-100' : 'opacity-55 hover:opacity-100'
      }`}
    >
      {link.label}
    </Link>
  )
}

export function Navbar({
  menuOpen,
  onMenuToggle,
  onMenuIntent,
  variant = 'wordmark',
}: NavbarProps) {
  const { pathname } = useLocation()
  const { content } = useCms()
  const [scrolled, setScrolled] = useState(false)
  const onHomeHero = variant === 'hero' && pathname === '/'

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [pathname])

  const solid = !onHomeHero || scrolled || menuOpen
  const ink = 'text-white'
  const left = desktopNavLeft(content.site)
  const right = desktopNavRight(content.site)

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 isolate">
      <div
        className={`w-full transition-colors duration-300 ${
          solid ? 'bg-[var(--body-bg)]' : 'bg-transparent'
        }`}
      >
        <div
          className={`relative mx-auto flex h-[5.25rem] max-w-[1600px] items-center justify-between gap-4 px-5 sm:h-[5.5rem] sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:justify-normal ${ink} pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:pt-[max(1rem,env(safe-area-inset-top,0px))]`}
        >
          <nav
            className="pointer-events-auto hidden items-center justify-end gap-5 pe-1 lg:flex xl:gap-8"
            aria-label="Hoofdnavigatie"
          >
            {left.map((link) => (
              <NavItem key={link.to} link={link} pathname={pathname} />
            ))}
          </nav>

          <Link
            to="/"
            aria-label="Tzjill Barber & Lounge — home"
            className="pointer-events-auto shrink-0 lg:justify-self-center lg:px-8"
          >
            <Logo tone="white" height={56} fetchPriority="low" decoding="async" />
          </Link>

          <div className="pointer-events-auto hidden items-center justify-between gap-5 ps-1 lg:flex xl:gap-8">
            <nav className="flex items-center gap-5 xl:gap-8" aria-label="Hoofdnavigatie, rechts">
              {right.map((link) => (
                <NavItem key={link.to} link={link} pathname={pathname} />
              ))}
            </nav>
            <BookButton surface="dark" className="shrink-0 px-5 py-2.5">
              <SiteText textKey="Navbar.1" />
            </BookButton>
          </div>

          <button
            type="button"
            className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center lg:hidden"
            onPointerEnter={onMenuIntent}
            onTouchStart={onMenuIntent}
            onClick={onMenuToggle}
            aria-label={
              menuOpen
                ? siteText(content.site, 'Navbar.menuClose')
                : siteText(content.site, 'Navbar.menuOpen')
            }
            aria-expanded={menuOpen}
          >
            <span className="relative flex h-[12px] w-4 flex-col items-stretch justify-between">
              <span
                className={`block h-[1.5px] w-full origin-center bg-current transition-transform duration-200 ${
                  menuOpen ? 'translate-y-[5.25px] rotate-45' : ''
                }`}
              />
              <span
                className={`block h-[1.5px] w-full origin-center bg-current transition-transform duration-200 ${
                  menuOpen ? '-translate-y-[5.25px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
import { useCms } from '@/cms/CmsContext'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookButton } from '@/components/booking/BookButton'
import { Logo } from '@/components/ui/Logo'
import { desktopNavLeft, desktopNavRight } from '@/data/nav'

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
  to,
  label,
  pathname,
}: {
  to: string
  label: string
  pathname: string
}) {
  const { content } = useCms()
  if (to === '/team' && content.site.teamVisible === false) return null
  return (
    <Link
      to={to}
      className={`wf-link type-ui inline-flex min-h-11 items-center ${
        navActive(pathname, to) ? 'opacity-100' : 'opacity-55 hover:opacity-100'
      }`}
    >
      {label}
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

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 pt-[max(0.75rem,env(safe-area-inset-top,0px))] transition-colors duration-300 sm:pt-[max(1rem,env(safe-area-inset-top,0px))] ${
        solid ? 'bg-[var(--body-bg)]' : 'bg-transparent'
      }`}
    >
      <div
        className={`relative mx-auto grid h-[5.25rem] max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-5 sm:h-[5.5rem] sm:px-8 ${ink}`}
      >
        <nav
          className="pointer-events-auto hidden items-center justify-end gap-5 pe-1 lg:flex xl:gap-8"
          aria-label="Primary left"
        >
          {desktopNavLeft.map((link) => (
            <NavItem key={link.to} to={link.to} label={link.label} pathname={pathname} />
          ))}
        </nav>

        <Link
          to="/"
          aria-label="Tzjill Barber & Lounge — home"
          className="pointer-events-auto shrink-0 justify-self-center px-5 xl:px-8"
        >
          <Logo tone="white" height={56} fetchPriority="high" />
        </Link>

        <div className="pointer-events-auto hidden items-center justify-between gap-5 ps-1 lg:flex xl:gap-8">
          <nav className="flex items-center gap-5 xl:gap-8" aria-label="Primary right">
            {desktopNavRight.map((link) => (
              <NavItem key={link.to} to={link.to} label={link.label} pathname={pathname} />
            ))}
          </nav>
          <BookButton surface="dark" className="shrink-0 px-5 py-2.5">
            Afspraak
          </BookButton>
        </div>

        <button
          type="button"
          className="pointer-events-auto absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center lg:hidden sm:right-8"
          onPointerEnter={onMenuIntent}
          onTouchStart={onMenuIntent}
          onClick={onMenuToggle}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
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
    </header>
  )
}

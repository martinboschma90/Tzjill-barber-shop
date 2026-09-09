import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { publicNav } from '@/data/nav'

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
  return (
    <Link
      to={to}
      className={`wf-link type-ui ${
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
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 pt-3 transition-colors duration-300 sm:pt-4 ${
        solid ? 'bg-[var(--body-bg)]' : 'bg-transparent'
      }`}
    >
      <div
        className={`relative mx-auto flex h-[4.75rem] max-w-[1600px] items-center justify-center px-5 sm:h-[5rem] sm:px-8 ${ink}`}
      >
        <div className="pointer-events-auto flex items-center gap-8 lg:gap-12 xl:gap-16">
          <nav className="hidden items-center gap-7 lg:flex xl:gap-10" aria-label="Primary left">
            {publicNav.slice(0, 4).map((link) => (
              <NavItem key={link.to} to={link.to} label={link.label} pathname={pathname} />
            ))}
          </nav>

          <Link to="/" aria-label="Tzjill Barber & Lounge — home">
            <Logo invert height={54} fetchPriority="high" />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex xl:gap-10" aria-label="Primary right">
            {publicNav.slice(4).map((link) => (
              <NavItem key={link.to} to={link.to} label={link.label} pathname={pathname} />
            ))}
          </nav>
        </div>

        <button
          type="button"
          className="pointer-events-auto absolute right-5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center lg:hidden sm:right-8"
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

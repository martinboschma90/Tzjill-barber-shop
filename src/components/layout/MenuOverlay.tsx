import { Link, useLocation } from 'react-router-dom'
import { BookButton } from '@/components/booking/BookButton'
import { OpenStatus } from '@/components/layout/OpenStatus'
import { prefetchRoute } from '@/lib/prefetchRoute'
import { publicMenuLinks } from '@/data/nav'
import { openingHours, PHONE_DISPLAY, PHONE_TEL } from '@/data/site'

type MenuOverlayProps = {
  open: boolean
  onClose: () => void
}

export function MenuOverlay({ open, onClose }: MenuOverlayProps) {
  const { pathname } = useLocation()
  if (!open) return null

  publicMenuLinks.forEach((link) => prefetchRoute(link.to))

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col backdrop-blur-md"
      style={{ backgroundColor: 'var(--menu-bg)' }}
    >
      <nav
        className="flex flex-1 flex-col items-center justify-start gap-1 overflow-y-auto px-6 pb-4 pt-28"
        aria-label="Primary"
      >
        {publicMenuLinks.map((link) => {
          const active = pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={`type-headline inline-flex min-h-11 items-center text-[clamp(2rem,7vw,3.25rem)] ${
                active ? 'text-ink' : 'text-ink/35 hover:text-ink'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div
        className="shrink-0 border-t border-white/10 px-6 py-5"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      >
        <OpenStatus className="text-white/70" />
        <a href={`tel:${PHONE_TEL}`} className="type-ui nums mt-3 flex min-h-11 items-center text-white">
          {PHONE_DISPLAY}
        </a>
        <ul className="mt-2 space-y-1">
          {openingHours.map((row) => (
            <li key={row.day} className="type-ui nums flex justify-between gap-4 text-white/55">
              <span>{row.day}</span>
              <span>{row.time}</span>
            </li>
          ))}
        </ul>
        <BookButton surface="dark" className="mt-4 w-full" onClick={onClose}>
          Afspraak
        </BookButton>
      </div>
    </div>
  )
}

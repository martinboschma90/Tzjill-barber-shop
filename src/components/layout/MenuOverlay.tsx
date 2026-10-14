import { Link, useLocation } from 'react-router-dom'
import { BookButton } from '@/components/booking/BookButton'
import { OpenStatus } from '@/components/layout/OpenStatus'
import { prefetchRoute } from '@/lib/prefetchRoute'
import { publicMenuLinks } from '@/data/nav'
import { PHONE_DISPLAY } from '@/data/site'
import { useCms } from '@/cms/CmsContext'
import { phoneHref } from '@/lib/contactLinks'
import { useModalFocus } from '@/lib/useModalFocus'

type MenuOverlayProps = {
  open: boolean
  onClose: () => void
}

export function MenuOverlay({ open, onClose }: MenuOverlayProps) {
  const { pathname } = useLocation()
  const { content } = useCms()
  const modal = useModalFocus(open, onClose)
  const phone = content.site.phoneNumber || PHONE_DISPLAY
  if (!open) return null

  publicMenuLinks.forEach((link) => prefetchRoute(link.to))

  return (
    <div
      ref={modal}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      tabIndex={-1}
      className="fixed inset-0 z-40 flex flex-col backdrop-blur-md"
      style={{ backgroundColor: 'var(--menu-bg)' }}
    >
      <button type="button" onClick={onClose} aria-label="Menu sluiten" className="absolute right-5 top-28 min-h-11 min-w-11 text-xl text-white">×</button>
      <nav
        className="flex flex-1 flex-col items-center justify-start gap-1 overflow-y-auto px-6 pb-4 pt-28"
        aria-label="Primary"
      >
        {publicMenuLinks.filter((link) => link.to !== '/team' || content.site.teamVisible !== false).map((link) => {
          const active = pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={`type-headline inline-flex min-h-11 items-center text-[clamp(2rem,7vw,3.25rem)] ${
                active ? 'text-ink' : 'text-ink/65 hover:text-ink'
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
        <a href={phoneHref(phone)} className="type-ui nums mt-3 flex min-h-11 items-center text-white">
          {phone}
        </a>
        <ul className="mt-2 space-y-1">
          {content.site.openingHours.map((row) => (
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

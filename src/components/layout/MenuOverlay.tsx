import { SiteText } from '@/cms/SiteText'
import { Link, useLocation } from 'react-router-dom'
import { BookButton } from '@/components/booking/BookButton'
import { OpenStatus } from '@/components/layout/OpenStatus'
import { prefetchRoute } from '@/lib/prefetchRoute'
import { useCms } from '@/cms/CmsContext'
import { phoneHref } from '@/lib/contactLinks'
import { useModalFocus } from '@/lib/useModalFocus'
import { useEffect } from 'react'
import { visibleNavLinks } from '@/lib/siteNav'
import { siteText } from '@/cms/siteText'

type MenuOverlayProps = {
  open: boolean
  onClose: () => void
}

export function MenuOverlay({ open, onClose }: MenuOverlayProps) {
  const { pathname } = useLocation()
  const { content } = useCms()
  const modal = useModalFocus(open, onClose)
  const phone = content.site.phoneNumber?.trim() ?? ''
  const menuLinks = visibleNavLinks(content.site)
  const menuKey = menuLinks.map((link) => link.to).join('|')
  useEffect(() => {
    if (!open) return
    for (const to of menuKey.split('|')) {
      if (to) prefetchRoute(to)
    }
  }, [open, menuKey])
  if (!open) return null

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
      <button
        type="button"
        onClick={onClose}
        aria-label={siteText(content.site, 'Navbar.menuClose')}
        className="absolute right-5 top-28 min-h-11 min-w-11 text-xl text-white"
      >
        ×
      </button>
      <nav
        className="flex flex-1 flex-col items-center justify-start gap-1 overflow-y-auto px-6 pb-4 pt-28"
        aria-label="Hoofdnavigatie"
      >
        {menuLinks.map((link) => {
          const active = pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              aria-current={active ? 'page' : undefined}
              className={`type-headline inline-flex min-h-11 items-center text-white text-[clamp(2rem,7vw,3.25rem)] ${
                active ? 'opacity-100' : 'opacity-65 hover:opacity-100'
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
        {phone ? (
          <a href={phoneHref(phone)} className="type-ui nums mt-3 flex min-h-11 items-center text-white">
            {phone}
          </a>
        ) : null}
        <ul className="mt-2 space-y-1">
          {content.site.openingHours.map((row) => (
            <li key={row.day} className="type-ui nums flex justify-between gap-4 text-white/55">
              <span>{row.day}</span>
              <span>{row.time}</span>
            </li>
          ))}
        </ul>
        <BookButton surface="dark" className="mt-4 w-full" onClick={onClose}>
          <SiteText textKey="MenuOverlay.1" />
        </BookButton>
      </div>
    </div>
  )
}
import { Link, useLocation } from 'react-router-dom'
import { prefetchRoute } from '@/lib/prefetchRoute'
import { publicMenuLinks } from '@/data/nav'

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
      className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md"
      style={{ backgroundColor: 'var(--menu-bg)' }}
    >
      <nav className="flex flex-col items-center gap-5" aria-label="Primary">
        {publicMenuLinks.map((link) => {
          const active = pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={`type-headline text-[clamp(2rem,7vw,3.25rem)] ${
                active ? 'text-ink' : 'text-ink/35 hover:text-ink'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { StickyContactBar } from '@/components/layout/StickyContactBar'
import { SalonhubWidget } from '@/components/booking/SalonhubWidget'
import { prefetchRoute } from '@/lib/prefetchRoute'
import { useIsCmsPreview } from '@/cms/previews/PreviewMode'

const Footer = lazy(() =>
  import('@/components/layout/Footer').then((m) => ({ default: m.Footer })),
)
const MenuOverlay = lazy(() =>
  import('@/components/layout/MenuOverlay').then((m) => ({ default: m.MenuOverlay })),
)

type AppShellProps = {
  children: ReactNode
  navVariant?: 'hero' | 'mark' | 'wordmark'
  showFooter?: boolean
  /** Full-screen Tzjill booking chrome; hide site nav and footer. */
  cover?: boolean
}

export function AppShell({
  children,
  navVariant = 'wordmark',
  showFooter = true,
  cover = false,
}: AppShellProps) {
  const preview = useIsCmsPreview()
  const [salonhubOpen, setSalonhubOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuReady, setMenuReady] = useState(false)
  const [footerReady, setFooterReady] = useState(false)
  const footerBoundaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (preview) return
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen, preview])

  useEffect(() => {
    if (!showFooter || preview) return
    const boundary = footerBoundaryRef.current
    if (!boundary || !window.IntersectionObserver) {
      setFooterReady(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setFooterReady(true)
        observer.disconnect()
      },
      { rootMargin: '500px 0px', threshold: 0 },
    )
    observer.observe(boundary)
    return () => observer.disconnect()
  }, [showFooter, preview])

  return (
    <>
      <div className="relative z-[1] min-h-svh max-w-full overflow-x-clip overscroll-x-none bg-[var(--body-bg)]">
        <a
          href="#inhoud"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-pill-on-dark-bg focus:px-4 focus:py-2 focus:text-pill-on-dark-fg"
        >
          Ga naar inhoud
        </a>
        {salonhubOpen || cover ? null : (
          <Navbar
            menuOpen={menuOpen}
            onMenuToggle={() => {
              setMenuReady(true)
              prefetchRoute('/prijzen')
              prefetchRoute('/lookbook')
              prefetchRoute('/collabs')
              prefetchRoute('/team')
              prefetchRoute('/over-ons')
              prefetchRoute('/contact')
              setMenuOpen((v) => !v)
            }}
            onMenuIntent={() => {
              setMenuReady(true)
              prefetchRoute('/prijzen')
              prefetchRoute('/lookbook')
              prefetchRoute('/collabs')
              prefetchRoute('/team')
              prefetchRoute('/over-ons')
            }}
            variant={navVariant}
          />
        )}
        {menuReady ? (
          <Suspense fallback={null}>
            <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
          </Suspense>
        ) : null}
        <div
          className={`flex flex-col ${
            cover || navVariant === 'hero'
              ? ''
              : 'pt-[calc(5.25rem+max(0.75rem,env(safe-area-inset-top,0px)))] sm:pt-[calc(5.5rem+max(1rem,env(safe-area-inset-top,0px)))]'
          }`}
        >
          <main id="inhoud" className="flex flex-col">
            {children}
          </main>
          {showFooter && !preview && !salonhubOpen && !cover ? (
            <>
              <div
                ref={footerBoundaryRef}
                data-footer-boundary
                className="h-px"
                aria-hidden
              />
              {footerReady ? (
                <Suspense fallback={null}>
                  <Footer />
                </Suspense>
              ) : null}
            </>
          ) : null}
        </div>
        {preview ? null : (
          <>
            <StickyContactBar hidden={salonhubOpen || menuOpen || cover} />
            <SalonhubWidget open={salonhubOpen} onOpenChange={setSalonhubOpen} />
          </>
        )}
      </div>
    </>
  )
}

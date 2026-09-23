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
}

export function AppShell({
  children,
  navVariant = 'wordmark',
  showFooter = true,
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
      <div className="relative z-[1] min-h-svh overflow-x-clip bg-[var(--body-bg)]">
        {salonhubOpen ? null : (
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
            navVariant === 'hero' ? '' : 'pt-[6.25rem] sm:pt-[6.75rem]'
          }`}
        >
          <main
            className={`flex flex-col ${
              navVariant === 'hero' ? '' : 'px-3 sm:px-4'
            }`}
          >
            {children}
          </main>
          {showFooter && !preview && !salonhubOpen ? (
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
            <StickyContactBar hidden={salonhubOpen || menuOpen} />
            <SalonhubWidget open={salonhubOpen} onOpenChange={setSalonhubOpen} />
          </>
        )}
      </div>
    </>
  )
}

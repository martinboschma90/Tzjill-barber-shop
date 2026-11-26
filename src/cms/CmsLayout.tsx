import { lazy, Suspense, useCallback, useEffect, useState, type ComponentType } from 'react'
import { Link, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  FileText,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Search,
  Settings,
  UserPlus,
  X,
} from 'lucide-react'
import { useAuth } from '@/cms/auth/AuthProvider'
import { useCms } from '@/cms/CmsProvider'
import { useMedia } from '@/cms/media/MediaProvider'
import {
  ARTIST_EDITOR_TABS,
  artistEditorPath,
  isArtistEditorTabActive,
} from '@/cms/artistEditorTabs'
import { artistSlugFromPath, isArtistsIndexPath } from '@/cms/artistSlug'
import {
  FlowMatesCommandPalette,
  useFlowMatesSearchHotkey,
} from '@/cms/flow-mates/CommandPalette'
import { EditorPreviewLayout } from '@/cms/flow-mates/EditorPreviewLayout'
import { SiteDocumentBar } from '@/cms/flow-mates/SiteDocumentBar'
import { DashboardHome } from '@/cms/flow-mates/Dashboard'
import { EditorAccordionScope } from '@/cms/flow-mates/EditorAccordionScope'
import {
  isPagesWorkspacePath,
  isFormsWorkspacePath,
  SidebarPageLinks,
} from '@/cms/flow-mates/PagesTabBar'
import type { CmsPanelProps } from '@/cms/panels/types'
import { UsersAdmin } from '@/cms/editors/UsersAdmin'
import { RouteFallback } from '@/components/ui/RouteFallback'
import { productsEnabled } from '@/data/site'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const CmsHomePanel = lazy(() => import('@/cms/panels/home'))
const CmsPrijzenPanel = lazy(() => import('@/cms/panels/prijzen'))
const CmsLookbookPanel = lazy(() => import('@/cms/panels/lookbook'))
const CmsProductsPanel = lazy(() => import('@/cms/panels/products'))
const CmsCollabsPanel = lazy(() => import('@/cms/panels/collabs'))
const CmsTeamPanel = lazy(() => import('@/cms/panels/team'))
const CmsAboutPanel = lazy(() => import('@/cms/panels/about'))
const CmsContactPanel = lazy(() => import('@/cms/panels/contact'))
const CmsFaqPanel = lazy(() => import('@/cms/panels/faq'))
const CmsFooterPanel = lazy(() => import('@/cms/panels/footer'))
const CmsArtistsIndexPanel = lazy(() => import('@/cms/panels/artistsIndex'))
const CmsArtistDetailPanel = lazy(() => import('@/cms/panels/artistDetail'))
const CmsMediaPanel = lazy(() => import('@/cms/panels/media'))
const CmsBookingPanel = lazy(() => import('@/cms/panels/booking'))
const CmsLegalPanel = lazy(() => import('@/cms/panels/legal'))
const CmsPopupPanel = lazy(() => import('@/cms/panels/popup'))
const CmsFormsPanel = lazy(() => import('@/cms/panels/forms'))
const CmsSettingsPanel = lazy(() => import('@/cms/panels/settings'))

const NAV = [
  { to: '/cms/dashboard', label: 'Dashboard', icon: LayoutDashboard, match: 'dashboard' as const },
  { to: '/cms/home', label: "Pagina's", icon: FileText, match: 'pages' as const },
  { to: '/cms/forms', label: 'Formulieren', icon: FileText, match: 'forms' as const },
  { to: '/cms/faq', label: 'FAQ', icon: HelpCircle, match: 'faq' as const },
  { to: '/cms/media', label: 'Media', icon: FolderOpen, match: 'media' as const },
  { to: '/cms/settings', label: 'Instellingen', icon: Settings, match: 'settings' as const },
]

function useCmsPanels(): {
  mode: 'dashboard' | 'pages' | 'artists' | 'media' | 'settings'
  title: string
  subtitle: string
  Page: ComponentType<CmsPanelProps> | null
} {
  const { pathname } = useLocation()
  const { getArtistBySlug, content } = useCms()
  const artistSlug = artistSlugFromPath(pathname)

  if (pathname.startsWith('/cms/dashboard') || pathname === '/cms' || pathname === '/cms/') {
    return {
      mode: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Tzjill websitebeheer',
      Page: null,
    }
  }
  if (
    pathname.startsWith('/cms/settings/users') ||
    pathname.startsWith('/cms/instellingen/gebruikers')
  ) {
    return {
      mode: 'settings',
      title: 'Gebruikers',
      subtitle: 'Rollen en uitnodigingen',
      Page: null,
    }
  }
  if (pathname.startsWith('/cms/settings')) {
    return {
      mode: 'settings',
      title: 'Instellingen',
      subtitle: 'Account, website en team',
      Page: CmsSettingsPanel,
    }
  }
  if (pathname.startsWith('/cms/media')) {
    return {
      mode: 'media',
      title: 'Media',
      subtitle: 'Upload wordt WebP / WebM',
      Page: CmsMediaPanel,
    }
  }
  if (isArtistsIndexPath(pathname)) {
    return {
      mode: 'artists',
      title: 'Artiesten',
      subtitle: `${content.artists.length} artist pages`,
      Page: CmsArtistsIndexPanel,
    }
  }
  if (artistSlug) {
    const artist = getArtistBySlug(artistSlug)
    return {
      mode: 'artists',
      title: artist?.name ?? 'Artist',
      subtitle: artist ? `/artists/${artist.slug}` : 'Artist detail page',
      Page: CmsArtistDetailPanel,
    }
  }
  if (pathname.startsWith('/cms/over-ons') || pathname.startsWith('/cms/about')) {
    return { mode: 'pages', title: 'Over ons', subtitle: '/over-ons', Page: CmsAboutPanel }
  }
  if (pathname.startsWith('/cms/prijzen')) {
    return { mode: 'pages', title: 'Prijzen', subtitle: '/prijzen', Page: CmsPrijzenPanel }
  }
  if (pathname.startsWith('/cms/lookbook')) {
    return { mode: 'pages', title: 'Lookbook', subtitle: '/lookbook', Page: CmsLookbookPanel }
  }
  if (pathname.startsWith('/cms/products')) {
    return { mode: 'pages', title: 'Producten', subtitle: '/products', Page: CmsProductsPanel }
  }
  if (pathname.startsWith('/cms/collabs')) {
    return { mode: 'pages', title: 'Collabs', subtitle: '/collabs', Page: CmsCollabsPanel }
  }
  if (pathname.startsWith('/cms/team') || pathname.startsWith('/cms/roster')) {
    return { mode: 'pages', title: 'Team', subtitle: '/team', Page: CmsTeamPanel }
  }
  if (pathname.startsWith('/cms/booking')) return { mode: 'pages', title: 'Afspraak', subtitle: 'Afspraakvenster', Page: CmsBookingPanel }
  if (pathname.startsWith('/cms/legal')) return { mode: 'pages', title: 'Privacy en cookies', subtitle: 'Teksten op de juridische pagina’s', Page: CmsLegalPanel }
  if (pathname.startsWith('/cms/popup')) return { mode: 'pages', title: 'Mailingpop-up', subtitle: 'Teksten, afbeelding en zichtbaarheid', Page: CmsPopupPanel }
  if (pathname.startsWith('/cms/forms')) return { mode: 'pages', title: pathname.endsWith('/newsletter') ? 'Nieuwsbrief' : pathname.endsWith('/contact') ? 'Contactformulier' : 'Formulieren', subtitle: 'Zichtbaarheid en instellingen', Page: CmsFormsPanel }
  if (pathname.startsWith('/cms/contact')) {
    return { mode: 'pages', title: 'Contact', subtitle: '/contact', Page: CmsContactPanel }
  }
  if (pathname.startsWith('/cms/faq')) {
    return { mode: 'pages', title: 'FAQ', subtitle: 'Vragen op de homepage', Page: CmsFaqPanel }
  }
  if (pathname.startsWith('/cms/footer')) {
    return { mode: 'pages', title: 'Footer', subtitle: 'Globale footer', Page: CmsFooterPanel }
  }
  return {
    mode: 'pages',
    title: 'Homepage',
    subtitle: 'Homepage',
    Page: CmsHomePanel,
  }
}

const shellFont = { fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" } as const

function CmsWorkAlert() {
  const { artistSyncError, siteSyncError } = useCms()
  const { uploading } = useMedia()
  const mediaError =
    uploading?.stage === 'error' ? uploading.message || 'Mediaverwerking mislukt.' : null
  const syncParts = [artistSyncError, siteSyncError].filter(Boolean)
  if (!syncParts.length && !mediaError) return null

  return (
    <div
      role="alert"
      className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
    >
      <p className="font-semibold">Er is iets misgegaan</p>
      {syncParts.length ? (
        <p className="mt-1 leading-relaxed">
          Opslaan naar de server: {syncParts.join(' · ')}
        </p>
      ) : null}
      {mediaError ? <p className="mt-1 leading-relaxed">{mediaError}</p> : null}
      <p className="mt-2 text-xs text-red-800/80">
        Laat dit tabblad open en probeer het opnieuw. Wijzigingen in het CMS
        zijn lokaal bewaard tot de sync slaagt.
      </p>
    </div>
  )
}

/** Flow Mates CMS layout. */
export function CmsLayout() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const { user, authRequired, signOut, role, displayName, canEdit, canManageUsers } =
    useAuth()
  const panels = useCmsPanels()
  const artistSlug = artistSlugFromPath(pathname)
  const pagesWorkspace = isPagesWorkspacePath(pathname)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const openSearch = useCallback(() => setSearchOpen(true), [])
  useFlowMatesSearchHotkey(openSearch)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const usersPath =
    pathname.includes('/cms/settings/users') ||
    pathname.includes('/cms/instellingen/gebruikers')

  if (!productsEnabled && pathname.startsWith('/cms/products')) {
    return <Navigate to="/cms/home" replace />
  }
  if (pathname.startsWith('/cms/texts')) return <Navigate to="/cms/home" replace />
  if (pathname === '/cms' || pathname === '/cms/') {
    return <Navigate to="/cms/dashboard" replace />
  }

  async function handleLogout() {
    await signOut()
    navigate('/cms/login', { replace: true })
  }

  const navItems = [
    ...NAV,
    ...(canManageUsers
      ? [
          {
            to: '/cms/settings/users',
            label: 'Gebruikers',
            icon: UserPlus,
            match: 'users' as const,
          },
        ]
      : []),
  ]

  const initials = (displayName || user?.email || 'TZ')
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'TZ'
  const roleLabel =
    role === 'admin' ? 'Beheerder' : role === 'editor' ? 'Redacteur' : 'Kijker'

  const navLinks = () => (
    <nav className="cms-nav flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-1 pb-2">
      <p className="mb-1 px-2.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a8a86]">
        Tzjill
      </p>
      <ul className="space-y-px">
        {navItems.map((n) => {
          const active =
            n.match === 'forms'
              ? isFormsWorkspacePath(pathname)
              : n.match === 'pages'
              ? pagesWorkspace && !isFormsWorkspacePath(pathname)
              : n.match === 'faq'
                ? pathname.startsWith('/cms/faq')
                : n.match === 'dashboard'
                  ? panels.mode === 'dashboard'
                  : n.match === 'users'
                    ? usersPath
                    : n.match === 'settings'
                      ? pathname.startsWith('/cms/settings') && !usersPath
                      : pathname.startsWith(n.to)
          const Icon = n.icon
          const showPages = n.match === 'pages' && active
          const showForms = n.match === 'forms' && active
          return (
            <li key={n.to}>
              <NavLink
                to={n.to}
                title={n.label}
                aria-label={n.label}
                className={`flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[14px] font-medium ${
                  active
                    ? 'bg-[#f5f5f5] text-[#111214] shadow-[inset_0_0_0_1px_#e5e5e5]'
                    : 'text-[#3a3a37] hover:bg-[#fafafa]'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-[#111214]' : 'text-[#7a7a76]'}`} />
                <span className="whitespace-nowrap">{n.label}</span>
              </NavLink>
              {showPages ? <SidebarPageLinks kind="pages" /> : null}
              {showForms ? <SidebarPageLinks kind="forms" /> : null}
            </li>
          )
        })}
      </ul>
    </nav>
  )

  const brand = (onClose?: () => void) => (
    <div className="flex shrink-0 items-center justify-between px-2.5 pb-3 pt-1">
      <Link to="/cms/dashboard" className="flex items-center gap-2 px-1 text-[15px] font-semibold tracking-[-0.02em] text-[#111214]">
        <span className="inline-block h-2 w-2 rounded-full bg-[#16c060]" />
        Tzjill
      </Link>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-[#6b6b66] hover:bg-[#f5f5f5]"
          aria-label="Menu sluiten"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )

  const searchBtn = () => (
    <div className="px-1 pb-2">
      <button
        type="button"
        onClick={() => {
          setMobileOpen(false)
          setSearchOpen(true)
        }}
        className="flex min-h-9 w-full items-center gap-2.5 rounded-lg border border-[#e5e5e5] bg-white px-2.5 text-left text-[14px] text-[#6b6b66] hover:bg-[#fafafa]"
      >
        <Search className="h-4 w-4 shrink-0 text-[#8a8a86]" />
        <span className="flex-1 truncate">Zoek pagina's, media…</span>
      </button>
    </div>
  )

  const footer = () => (
    <div className="mt-auto px-1 pb-1">
      <p className="mb-2 flex items-center gap-2 px-2 text-[11px] font-medium text-[#8a8a86]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#16c060]" />
        Flow Mates
      </p>
      <button
        type="button"
        onClick={() => (authRequired ? void handleLogout() : undefined)}
        className="flex min-h-[52px] w-full items-center gap-2 rounded-lg px-2 text-left hover:bg-[#fafafa]"
        data-signout={authRequired ? true : undefined}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#e5e5e5] bg-white text-[11px] font-semibold text-[#111214]">
          {initials}
        </span>
        <span className="min-w-0">
          <strong className="block truncate text-[13px] font-semibold text-[#111214]">
            {displayName || user?.email || 'CMS'}
          </strong>
          <small className="block text-[11px] font-medium text-[#6b6b66]">{roleLabel}</small>
        </span>
        {authRequired ? <LogOut className="ml-auto h-3.5 w-3.5 shrink-0 text-[#8a8a86]" /> : null}
      </button>
    </div>
  )

  return (
    <div
      className="cms-layout min-h-svh bg-white text-[#111214]"
      style={shellFont}
      data-cms-readonly={canEdit ? undefined : 'true'}
    >
      <FlowMatesCommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-[#e5e5e5] bg-white px-3 py-4 lg:flex">
        {brand()}
        {searchBtn()}
        {navLinks()}
        {footer()}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#111214]/20"
            aria-label="Sluiten"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[248px] max-w-[85%] flex-col bg-white px-3 py-4 shadow-2xl">
            {brand(() => setMobileOpen(false))}
            {searchBtn()}
            {navLinks()}
            {footer()}
          </aside>
        </div>
      ) : null}

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e5e5e5] bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-[#3a3a37] hover:bg-[#f5f5f5]"
          aria-label="Menu openen"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center leading-tight">
          <span className="text-[13px] font-semibold text-[#111214]">Tzjill</span>
          <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#8a8a86]">
            CMS
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="rounded-lg p-2 text-[#3a3a37] hover:bg-[#f5f5f5]"
          aria-label="Zoeken"
        >
          <Search className="h-5 w-5" />
        </button>
      </header>

      <main className="flex min-h-svh flex-col bg-white lg:pl-[248px] [--cms-editor-sticky-top:0.75rem]">
        <div className="min-h-0 flex-1 overflow-auto px-4 py-5 sm:px-6 lg:px-8">
          <CmsWorkAlert />

          {panels.mode === 'dashboard' || panels.mode === 'media' || panels.mode === 'settings' || usersPath || !panels.Page ? (
          <div className="mb-5">
            <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-[#111214]">
              {panels.title}
            </h1>
            {panels.mode !== 'dashboard' ? (
              <p className="mt-1 text-[13px] text-[#6b6b66]">{panels.subtitle}</p>
            ) : null}
          </div>
          ) : null}

          {usersPath ? (
            <UsersAdmin />
          ) : panels.mode === 'dashboard' ? (
            <DashboardHome />
          ) : panels.Page ? (
            panels.mode === 'media' || panels.mode === 'settings' ? (
              <div className="cms-editor-pane min-w-0">
                <EditorAccordionScope key={`${pathname}${search}`}>
                  <Suspense fallback={<RouteFallback compact />}>
                    <panels.Page slot="editor" />
                  </Suspense>
                </EditorAccordionScope>
              </div>
            ) : (
              <EditorPreviewLayout>
              <div className="cms-editor-pane sticky top-[var(--cms-editor-sticky-top,0px)] flex h-[calc(100dvh-var(--cms-editor-sticky-top,0px)-1.5rem)] min-h-0 min-w-0 flex-col self-start pr-1">
                <div className="cms-crumb mb-3 flex min-h-10 shrink-0 items-center gap-2">
                  <b className="text-[15px] font-semibold text-[#111214]">{panels.title}</b>
                  <span className="text-[12px] text-[#6b6b66]">{panels.subtitle}</span>
                </div>
                {panels.mode === 'artists' && artistSlug ? (
                  <div className="cms-artist-tabs mb-3 shrink-0">
                    <div className="mb-2">
                      <Link
                        to="/cms/artists"
                        className="text-[12px] font-medium text-[#6b6b66] hover:text-[#111214]"
                      >
                        ← Alle artiesten
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ARTIST_EDITOR_TABS.map((tab) => {
                        const isActive = isArtistEditorTabActive(
                          tab.id,
                          new URLSearchParams(search).get('tab'),
                        )
                        return (
                          <Link
                            key={tab.id}
                            to={artistEditorPath(artistSlug, tab.id)}
                            className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold ${
                              isActive
                                ? 'bg-[#f5f5f5] text-[#111214] shadow-[inset_0_0_0_1px_#e5e5e5]'
                                : 'text-[#3a3a37] hover:bg-[#fafafa]'
                            }`}
                          >
                            {tab.label}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <EditorAccordionScope key={`${pathname}${search}`}>
                  <ErrorBoundary compact label="cms-editor" resetKey={`${pathname}${search}`}>
                  <Suspense fallback={<RouteFallback compact />}>
                    <panels.Page slot="editor" />
                  </Suspense>
                  </ErrorBoundary>
                </EditorAccordionScope>
                </div>
              </div>
              <div className="min-h-0 min-w-0 flex-1">
                <ErrorBoundary compact label="cms-preview" resetKey={`${pathname}${search}`}>
                <Suspense fallback={<RouteFallback compact />}>
                  <panels.Page slot="preview" />
                </Suspense>
                </ErrorBoundary>
              </div>
              </EditorPreviewLayout>
            )
          ) : null}
        </div>
        <SiteDocumentBar />
      </main>
    </div>
  )
}

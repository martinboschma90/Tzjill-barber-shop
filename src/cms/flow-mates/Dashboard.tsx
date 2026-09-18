import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Banknote,
  FolderOpen,
  Home,
  Phone,
  Settings,
  Users,
} from 'lucide-react'
import { useCms } from '@/cms/CmsProvider'
import { useMedia } from '@/cms/media/MediaProvider'
import { PAGE_TABS } from '@/cms/flow-mates/PagesTabBar'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { TrafficDashboard } from '@/cms/flow-mates/TrafficDashboard'
import { SiteHealthMeter } from '@/cms/flow-mates/SiteHealthMeter'
import { useLiveSite } from '@/cms/flow-mates/useLiveSite'
import { useAutoOptimize } from '@/cms/flow-mates/useAutoOptimize'

function relativeTime(ts: number | null): string {
  if (!ts) return '—'
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'zojuist'
  const h = Math.floor(m / 60)
  if (m < 60) return `${m} min geleden`
  if (h < 24) return `${h} uur geleden`
  const d = Math.floor(h / 24)
  return `${d} dag${d === 1 ? '' : 'en'} geleden`
}

function StatusCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-baseline gap-1.5">
      <span className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
        {label}
      </span>
      <span className="truncate text-[12px] font-medium text-neutral-800">{value}</span>
    </div>
  )
}

function ActionTile({
  to,
  label,
  description,
  icon: Icon,
  accent,
}: {
  to: string
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <Link
      to={to}
      className="cms-action-card group relative flex flex-col rounded-2xl border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-[0_0_28px_rgba(34,197,94,0.16)]"
    >
      <div
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-3 text-sm font-semibold tracking-tight text-neutral-900">{label}</h3>
      <p className="mt-1 text-xs leading-relaxed text-neutral-500">{description}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 transition group-hover:gap-2">
        Openen <ArrowUpRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  )
}

/** First screen — same Frame CMS dashboard, Notype counts. */
export function DashboardHome() {
  const { content, savedAt } = useCms()
  const { assets } = useMedia()
  const pagesCount = PAGE_TABS.length
  const artistsCount = content.artists.length
  const mediaCount = assets.length
  const live = useLiveSite(content.site.publicSiteUrl || 'https://tzjill-barber-shop.vercel.app')
  const optimize = useAutoOptimize(live.data)
  const statusLabel = live.loading
    ? 'Checken…'
    : live.data?.uptime.ok
      ? 'Live'
      : live.data
        ? 'Down'
        : 'Onbekend'

  return (
    <>
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white px-4 py-3">
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900">Welkom terug.</h2>
            <p className="mt-0.5 text-[11px] text-neutral-500">
              Bewerk content en houd de shop up-to-date.
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live site
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-neutral-100 pt-2.5 sm:grid-cols-4">
          <StatusCard label="Site" value={statusLabel} />
          <StatusCard label="Laatst" value={relativeTime(savedAt)} />
          <StatusCard label="Artiesten" value={String(artistsCount)} />
          <StatusCard label="Media" value={`${mediaCount} · ${pagesCount} pagina’s`} />
        </div>
      </div>

      <section className="mb-8">
        <div className="mb-3 border-l-2 border-emerald-500 pl-3">
          <h3 className="text-base font-semibold tracking-tight text-neutral-900">
            Bewerken
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            Wat je het vaakst aanpast — pagina’s, media, contact.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ActionTile
            to="/cms/artists"
            label="Artiesten"
            description="Roster, profielen en video’s."
            icon={Users}
            accent="bg-emerald-500/10 text-emerald-500"
          />
          <ActionTile
            to="/cms/media"
            label="Media"
            description="Live-map: foto’s en clips."
            icon={FolderOpen}
            accent="bg-emerald-500/10 text-emerald-500"
          />
          <ActionTile
            to="/cms/contact"
            label="Contact"
            description="Telefoon, mail en WhatsApp."
            icon={Phone}
            accent="bg-emerald-500/10 text-emerald-500"
          />
          <ActionTile
            to="/cms/prijzen"
            label="Prijzen"
            description="Tarieven op de prijzenpagina."
            icon={Banknote}
            accent="bg-emerald-500/10 text-emerald-500"
          />
          <ActionTile
            to="/cms/home"
            label="Homepage"
            description="Hero, tagline en merkinhoud."
            icon={Home}
            accent="bg-emerald-500/10 text-emerald-500"
          />
          <ActionTile
            to="/cms/settings"
            label="Instellingen"
            description="Domein, zoeken en account."
            icon={Settings}
            accent="bg-emerald-500/10 text-emerald-500"
          />
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 border-l-2 border-neutral-300 pl-3">
          <h3 className="text-base font-semibold tracking-tight text-neutral-900">
            Website
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            Health, snelheid en fouten — alleen kijken als er iets mis is.
          </p>
        </div>
        <SiteHealthMeter
          live={live.data}
          optimize={optimize}
          speedRunning={live.speedRunning}
          speedError={live.speedError}
          onRunSpeedTest={live.runSpeedTest}
        />
      </section>

      <section>
        <div className="mb-3 border-l-2 border-neutral-300 pl-3">
          <h3 className="text-base font-semibold tracking-tight text-neutral-900">
            Bezoekers
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            Traffic en boekingen van de live site.
          </p>
        </div>
        <ErrorBoundary label="traffic" compact>
          <TrafficDashboard live={live.data} />
        </ErrorBoundary>
      </section>
    </>
  )
}

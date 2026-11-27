import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import {
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

function ActionRow({
  to,
  label,
  description,
  icon: Icon,
}: {
  to: string
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <Link
      to={to}
      className="flex min-h-12 items-center justify-between gap-3 border-b border-[#e5e5e5] py-3 hover:bg-[#fafafa]"
    >
      <span className="flex items-center gap-2.5 text-[15px] font-semibold text-[#111214]">
        <Icon className="h-4 w-4 text-[#7a7a76]" />
        {label}
      </span>
      <span className="text-[13px] text-[#6b6b66]">{description}</span>
    </Link>
  )
}

export function DashboardHome() {
  const { content, savedAt } = useCms()
  const { assets } = useMedia()
  const pagesCount = PAGE_TABS.length
  const teamCount = content.team.length
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
      <p className="mb-6 text-[13px] text-[#6b6b66]">
        {statusLabel} · {relativeTime(savedAt)} · {teamCount} team · {mediaCount} media · {pagesCount} pagina’s
      </p>

      <section className="mb-8">
        <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b6b66]">
          Bewerken
        </h2>
        <div>
          <ActionRow to="/cms/team" label="Team" description="Kappers en lounge" icon={Users} />
          <ActionRow to="/cms/media" label="Media" description="Foto’s en clips" icon={FolderOpen} />
          <ActionRow to="/cms/contact" label="Contact" description="Telefoon, mail, WhatsApp" icon={Phone} />
          <ActionRow to="/cms/prijzen" label="Prijzen" description="Tarieven" icon={Banknote} />
          <ActionRow to="/cms/home" label="Homepage" description="Hero en merkinhoud" icon={Home} />
          <ActionRow to="/cms/settings" label="Instellingen" description="Domein en account" icon={Settings} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b6b66]">
          Website
        </h2>
        <SiteHealthMeter
          live={live.data}
          optimize={optimize}
          speedRunning={live.speedRunning}
          speedError={live.speedError}
          onRunSpeedTest={live.runSpeedTest}
        />
      </section>

      <section>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b6b66]">
          Bezoekers
        </h2>
        <ErrorBoundary label="traffic" compact>
          <TrafficDashboard live={live.data} />
        </ErrorBoundary>
      </section>
    </>
  )
}

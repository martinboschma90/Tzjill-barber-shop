import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useCms } from '@/cms/CmsProvider'
import { assessSiteHealth, STALE_CONTENT_DAYS } from '@/cms/flow-mates/siteHealth'
import type { LiveSiteSnapshot } from '@/cms/flow-mates/liveSite'
import type { AutoOptimizeState } from '@/cms/flow-mates/useAutoOptimize'

function tone(score: number) {
  if (score >= 90) return 'text-emerald-700'
  if (score >= 75) return 'text-emerald-600'
  if (score >= 55) return 'text-amber-600'
  return 'text-red-600'
}

function bar(score: number) {
  if (score >= 75) return 'bg-emerald-400'
  if (score >= 55) return 'bg-amber-400'
  return 'bg-red-400'
}

function relativeTime(ts: number | null): string {
  if (!ts) return 'onbekend'
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'zojuist'
  const h = Math.floor(m / 60)
  if (m < 60) return `${m} min geleden`
  if (h < 24) return `${h} uur geleden`
  const d = Math.floor(h / 24)
  return `${d} dag${d === 1 ? '' : 'en'} geleden`
}

function formatMs(value: number | null) {
  if (value == null) return '—'
  return `${Math.round(value)} ms`
}

export function SiteHealthMeter({
  live,
  optimize,
  speedRunning,
  speedError,
  onRunSpeedTest,
  compact = false,
}: {
  live?: LiveSiteSnapshot | null
  optimize?: AutoOptimizeState
  speedRunning?: boolean
  speedError?: string | null
  onRunSpeedTest?: () => void
  compact?: boolean
}) {
  const {
    content,
    savedAt,
    contentSyncStatus,
    artistSyncError,
    siteSyncError,
    dirtyArtistIds,
  } = useCms()
  const health = useMemo(
    () =>
      assessSiteHealth(content, {
        savedAt,
        contentSyncStatus,
        artistSyncError,
        siteSyncError,
        dirtyCount: dirtyArtistIds.size,
        live,
      }),
    [
      content,
      savedAt,
      contentSyncStatus,
      artistSyncError,
      siteSyncError,
      dirtyArtistIds,
      live,
    ],
  )
  const topIssues = health.issues
    .filter((issue) => !health.errors.some((item) => item.id === issue.id))
    .slice(0, 3)
  const liveErrors = [
    ...(live?.errors.recent ?? []).map((item) => ({
      id: `js-${item.at}-${item.message}`,
      text: `${item.path || '/'} — ${item.message}`,
    })),
    ...(live?.errors.notFound ?? []).map((item) => ({
      id: `404-${item.at}-${item.path}`,
      text: `404 ${item.path}`,
    })),
  ].slice(0, 4)

  if (compact) {
    const issue = health.errors[0] ?? topIssues[0]
    return (
      <section className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
          Website
        </p>
        <p className={`mt-2 text-2xl font-semibold tracking-tight ${
          health.score >= 75 ? 'text-emerald-600' : health.score >= 55 ? 'text-amber-600' : 'text-red-600'
        }`}>
          {health.score}
          <span className="ml-1.5 text-sm font-medium text-neutral-400">{health.label}</span>
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          {live?.uptime.ok ? 'Live' : live ? 'Down' : 'Status onbekend'}
          {live?.uptime.ttfbMs != null ? ` · ${Math.round(live.uptime.ttfbMs)} ms` : ''}
        </p>
        <p className="mt-2 line-clamp-2 text-xs text-neutral-500">
          {issue ? `${issue.label}${issue.hint ? ` — ${issue.hint}` : ''}` : 'Geen openstaande punten.'}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-4">
          {onRunSpeedTest ? (
            <button
              type="button"
              disabled={speedRunning}
              onClick={onRunSpeedTest}
              className="rounded-lg border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:border-neutral-400 disabled:opacity-50"
            >
              {speedRunning ? 'Bezig…' : 'Speedtest'}
            </button>
          ) : null}
          {issue?.to ? (
            <Link to={issue.to} className="text-[11px] font-medium text-emerald-600">
              Fix
            </Link>
          ) : null}
        </div>
        {speedError ? <p className="mt-2 text-[10px] text-red-500">{speedError}</p> : null}
        {optimize?.message ? (
          <p className="mt-2 line-clamp-2 text-[10px] text-neutral-400">{optimize.message}</p>
        ) : null}
      </section>
    )
  }

  return (
    <section className="mb-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
            Website health
          </p>
          <p className={`mt-0.5 text-2xl font-semibold tracking-tight ${tone(health.score)}`}>
            {health.score}
            <span className="ml-1.5 text-sm font-medium text-neutral-500">{health.label}</span>
          </p>
        </div>
        <div className="max-w-xs text-right text-[10px] leading-snug text-neutral-400">
          <p>
            CMS + live site
            {live?.uptime.ok ? ' · online' : live ? ' · offline' : ''}
            {live?.uptime.ttfbMs != null ? ` · TTFB ${Math.round(live.uptime.ttfbMs)} ms` : ''}
          </p>
          <p className="mt-0.5">
            Check {relativeTime(health.checkedAt)} · site {relativeTime(health.savedAt)}
          </p>
        </div>
      </div>

      <div
        className={`mt-3 flex items-start justify-between gap-3 rounded-lg px-2.5 py-2 ${
          health.updateNeeded
            ? 'bg-amber-400/10 ring-1 ring-amber-400/25'
            : 'bg-neutral-50'
        }`}
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
            {health.updateNeeded ? 'Bijwerken' : 'Actueel'}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-neutral-600">{health.updateHint}</p>
        </div>
        {health.updateNeeded ? (
          <Link
            to="/cms/home"
            className="shrink-0 text-[11px] font-medium text-amber-700 hover:text-amber-800"
          >
            Open CMS
          </Link>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <ScoreRow label="SEO" score={health.seoScore} />
        <ScoreRow label="Pagina’s" score={health.pagesScore} />
        <ScoreRow label="Artiesten" score={health.artistsScore} />
        <ScoreRow label="Performance" score={health.performanceScore} />
        <ScoreRow label="Stabiliteit" score={health.stabilityScore} />
        <ScoreRow label="Fouten" score={health.errorsScore} />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-neutral-50 px-2.5 py-2">
          <p className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
            Bezoekers nu
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <VitalChip label="LCP" value={formatMs(live?.vitals.lcp ?? null)} />
            <VitalChip label="INP" value={formatMs(live?.vitals.inp ?? null)} />
            <VitalChip
              label="CLS"
              value={live?.vitals.cls != null ? live.vitals.cls.toFixed(3) : '—'}
            />
          </div>
        </div>
        <div className="rounded-lg bg-neutral-50 px-2.5 py-2">
          <p className="flex items-center justify-between gap-2 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
            <span>Speedtest · 14 dagen</span>
            <span className="flex items-center gap-2 font-medium normal-case tracking-normal text-neutral-400">
              {speedRunning
                ? 'meten…'
                : live?.speed?.latest?.fetchedAt
                  ? relativeTime(live.speed.latest.fetchedAt)
                  : 'nog geen test'}
              {onRunSpeedTest ? (
                <button
                  type="button"
                  disabled={speedRunning}
                  onClick={onRunSpeedTest}
                  className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {speedRunning ? 'Bezig…' : 'Test nu'}
                </button>
              ) : null}
            </span>
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <VitalChip
              label="PageSpeed"
              value={
                live?.speed?.latest?.score != null
                  ? String(live.speed.latest.score)
                  : '—'
              }
            />
            <VitalChip label="LCP" value={formatMs(live?.speed?.latest?.lcp ?? null)} />
            <VitalChip label="INP" value={formatMs(live?.speed?.latest?.inp ?? null)} />
            <VitalChip
              label="CLS"
              value={
                live?.speed?.latest?.cls != null
                  ? Number(live.speed.latest.cls).toFixed(3)
                  : '—'
              }
            />
          </div>
          {speedError ? (
            <p className="mt-1.5 text-[10px] text-red-600">{speedError}</p>
          ) : live?.speed?.previous?.score != null ? (
            <p className="mt-1.5 text-[10px] text-neutral-400">
              Vorige test: {live.speed.previous.score}
              {live.speed.latest?.score != null ? ` → ${live.speed.latest.score}` : ''}
            </p>
          ) : (
            <p className="mt-1.5 text-[10px] text-neutral-400">
              Klik Test nu, of wacht op de automatische meting elke 14 dagen. Onder{' '}
              {live?.speed?.threshold ?? 70} start optimalisatie.
            </p>
          )}
        </div>
      </div>

      {optimize?.message ? (
        <p
          className={`mt-2 rounded-lg px-2.5 py-2 text-[11px] ${
            live?.speed?.belowThreshold
              ? 'bg-amber-400/10 text-amber-800'
              : 'bg-neutral-50 text-neutral-500'
          }`}
        >
          {optimize.running ? 'Bezig: ' : ''}
          {optimize.message}
        </p>
      ) : null}

      <div className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-5">
        {health.pages.map((page) => (
          <Link
            key={page.id}
            to={page.to}
            className="flex items-center justify-between gap-2 rounded-lg bg-neutral-50 px-2.5 py-1.5 hover:bg-neutral-100"
          >
            <span className="truncate text-[11px] text-neutral-600">{page.label}</span>
            <span className={`text-[11px] font-semibold tabular-nums ${tone(page.score)}`}>
              {page.score}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-3 border-t border-neutral-200 pt-2.5">
        <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
          Error detector
        </p>
        {health.errors.length || liveErrors.length ? (
          <ul className="space-y-1">
            {health.errors.map((issue) => (
              <li key={issue.id} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="min-w-0 truncate text-red-600">
                  {issue.label}
                  {issue.hint ? ` — ${issue.hint}` : ''}
                </span>
                {issue.to ? (
                  <Link to={issue.to} className="shrink-0 text-emerald-600 hover:text-emerald-700">
                    Fix
                  </Link>
                ) : null}
              </li>
            ))}
            {liveErrors.map((item) => (
              <li key={item.id} className="truncate text-[11px] text-red-600">
                {item.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11px] text-neutral-400">
            Geen sync-, media-, JS- of 404-fouten gedetecteerd.
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-2.5">
        <p className="text-[11px] text-neutral-500">
          Zoeken: robots {live?.search.robots.ok ? 'ok' : '—'} · sitemap{' '}
          {live?.search.sitemap.ok ? 'ok' : '—'} · rankings via Search Console
        </p>
        {live?.search.searchConsoleUrl ? (
          <a
            href={live.search.searchConsoleUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-emerald-600 hover:text-emerald-700"
          >
            Open GSC
          </a>
        ) : null}
      </div>

      {topIssues.length ? (
        <ul className="mt-3 space-y-1 border-t border-neutral-200 pt-2.5">
          {topIssues.map((issue) => (
            <li key={issue.id} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="min-w-0 truncate text-neutral-500">
                {issue.label}
                {issue.hint ? ` — ${issue.hint}` : ''}
              </span>
              {issue.to ? (
                <Link to={issue.to} className="shrink-0 text-emerald-600 hover:text-emerald-700">
                  Fix
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 border-t border-neutral-200 pt-2.5 text-[11px] text-neutral-400">
          Geen openstaande CMS-punten.
        </p>
      )}

      <p className="mt-2 text-[10px] text-neutral-400">
        Links: echte bezoekers. Rechts: PageSpeed elke 14 dagen. Onder de drempel maakt
        het CMS zelf posters en korte fragments. Bijwerken na {STALE_CONTENT_DAYS} dagen
        zonder save.
      </p>
    </section>
  )
}

function VitalChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-neutral-50 px-2.5 py-1.5">
      <p className="text-[10px] text-neutral-400">{label}</p>
      <p className="text-[12px] font-semibold tabular-nums text-neutral-800">{value}</p>
    </div>
  )
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] text-neutral-500">
        <span>{label}</span>
        <span className={`tabular-nums ${tone(score)}`}>{score}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-neutral-100">
        <div className={`h-full rounded-full ${bar(score)}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

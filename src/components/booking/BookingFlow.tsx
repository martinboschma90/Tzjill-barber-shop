import { useEffect, useMemo, useState } from 'react'
import { useCms } from '@/cms/CmsContext'
import { BookingWell } from '@/components/booking/BookingWell'
import { FALLBACK_TREATMENTS, presentTreatments } from '@/data/salonhubCatalog'
import { LOCATION_ADDRESS, PHONE_DISPLAY, PHONE_TEL } from '@/data/site'
import { loadTreatments, type LiveTreatment } from '@/lib/salonhubApi'

type BookingFlowProps = {
  compact?: boolean
  onBack?: () => void
}

type Audience = {
  id: string
  label: string
  sections: { label: string; items: LiveTreatment[] }[]
}

function groupTreatments(items: LiveTreatment[]): Audience[] {
  const order: string[] = []
  const map = new Map<string, Audience & { sectionOrder: string[] }>()
  for (const item of items) {
    let audience = map.get(item.groupId)
    if (!audience) {
      audience = { id: item.groupId, label: item.group, sections: [], sectionOrder: [] }
      map.set(item.groupId, audience)
      order.push(item.groupId)
    }
    const sectionLabel = item.section || 'Behandeling'
    let section = audience.sections.find((entry) => entry.label === sectionLabel)
    if (!section) {
      section = { label: sectionLabel, items: [] }
      audience.sections.push(section)
    }
    section.items.push(item)
  }
  return order.map((id) => {
    const audience = map.get(id)!
    return { id: audience.id, label: audience.label, sections: audience.sections }
  })
}

export function BookingFlow({ compact = false, onBack }: BookingFlowProps) {
  const { content } = useCms()
  const [agendaOpen, setAgendaOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)
  const [treatments, setTreatments] = useState<LiveTreatment[]>([])
  const [audienceId, setAudienceId] = useState('male')
  const [selectedId, setSelectedId] = useState('')

  const visibleTreatments = useMemo(
    () => presentTreatments(treatments, content.site.bookingTreatments),
    [treatments, content.site.bookingTreatments],
  )
  const audiences = useMemo(() => groupTreatments(visibleTreatments), [visibleTreatments])
  const audience = audiences.find((item) => item.id === audienceId) || audiences[0]
  const selected = visibleTreatments.find((item) => item.id === selectedId) || null

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadTreatments(crypto.randomUUID())
      .then((result) => {
        if (cancelled) return
        setTreatments(result.treatments)
        setUsingFallback(false)
      })
      .catch(() => {
        if (cancelled) return
        setTreatments(FALLBACK_TREATMENTS)
        setUsingFallback(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (agendaOpen) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#1c1b19] text-[#f6f3ee]">
        <div className="shrink-0 border-b border-white/[0.08] px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setAgendaOpen(false)}
              className="type-ui text-[#f6f3ee]/55 transition-colors hover:text-[#f6f3ee]"
            >
              ← Terug
            </button>
            <p className="type-label text-[#f6f3ee]/40">Stap 2 — Agenda</p>
          </div>
          <p className="mt-2 truncate text-[13px] text-[#f6f3ee]/60">
            {selected
              ? `${selected.name} · ${selected.priceLabel}`
              : 'Alle behandelingen staan in de agenda.'}
          </p>
        </div>
        <div className={compact ? 'flex min-h-0 w-full flex-1' : 'w-full px-3 pb-8 sm:px-6'}>
          <BookingWell
            treatmentId={selected?.id}
            className={
              compact
                ? 'min-h-0 w-full min-w-0 flex-1'
                : 'h-[min(78svh,860px)] min-h-[32rem] w-full rounded-[1.75rem]'
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-0 min-w-0 flex-1 bg-[#1c1b19] text-[#f6f3ee] ${
        compact ? 'flex flex-col overflow-hidden' : 'overflow-x-hidden overflow-y-auto'
      }`}
    >
      <div
        className={`mx-auto w-full max-w-[680px] ${
          compact ? 'min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-2' : 'px-4 pb-6 pt-4 sm:px-8 sm:pb-8 sm:pt-10'
        }`}
      >
        <header>
          <p className="type-label text-[#f6f3ee]/40">Stap 1 — Behandeling</p>
          <h1
            className={`type-headline mt-4 uppercase ${
              compact ? 'text-[clamp(1.85rem,8vw,2.6rem)]' : ''
            }`}
          >
            Afspraak maken
          </h1>
          <p className="type-lead mt-4 max-w-md text-[#f6f3ee]/55">
            Kies een behandeling. Daarna opent de agenda. {LOCATION_ADDRESS}. Tel{' '}
            <a href={`tel:${PHONE_TEL}`} className="text-[#f6f3ee]/80 hover:text-[#f6f3ee]">
              {PHONE_DISPLAY}
            </a>
            .
          </p>
        </header>

        {usingFallback ? (
          <p className="mt-5 text-[13px] text-[#f6f3ee]/45">Prijzen van de laatst bekende lijst.</p>
        ) : null}

        {audiences.length > 1 ? (
          <div className="mt-6 inline-flex rounded-full bg-white/[0.06] p-1" role="tablist">
            {audiences.map((item) => {
              const active = item.id === (audience?.id || '')
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setAudienceId(item.id)}
                  className={`type-ui rounded-full px-4 py-2 transition-colors ${
                    active
                      ? 'bg-[#f6f3ee] text-[#1c1b19]'
                      : 'text-[#f6f3ee]/65 hover:text-[#f6f3ee]'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        ) : null}

        <div className="mt-7 space-y-7">
          {loading ? <p className="type-label text-[#f6f3ee]/40">Laden…</p> : null}
          {audience?.sections.map((section) => (
            <section key={section.label}>
              <h2 className="type-label text-[#f6f3ee]/40">{section.label}</h2>
              <ul className="mt-3 grid gap-2">
                {section.items.map((item) => {
                  const active = selected?.id === item.id
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSelectedId(item.id)}
                        className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-[color,background-color,border-color] duration-300 ${
                          active
                            ? 'border-[#f6f3ee] bg-[#f6f3ee] text-[#1c1b19]'
                            : 'border-white/[0.1] bg-white/[0.04] text-[#f6f3ee] hover:border-white/25 hover:bg-white/[0.07]'
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-semibold tracking-[-0.015em]">
                            {item.name}
                          </span>
                          {item.minutes ? (
                            <span
                              className={`type-label mt-1.5 block ${
                                active ? 'text-[#1c1b19]/50' : 'text-[#f6f3ee]/40'
                              }`}
                            >
                              {item.minutes} min
                            </span>
                          ) : null}
                        </span>
                        <span className="type-ui shrink-0">
                          {item.priceLabel || '—'}
                          <span aria-hidden className="ml-2">
                            →
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-6 text-[12.5px] leading-relaxed text-[#f6f3ee]/40">
          <span className="font-medium uppercase tracking-[0.12em] text-[#f6f3ee]/70">
            No-show €20.
          </span>{' '}
          Binnen 2 uur afzeggen of niet komen.
        </p>
      </div>

      <div
        className={`mx-auto w-full max-w-[680px] ${
          compact
            ? 'shrink-0 border-t border-white/[0.08] px-5 py-4'
            : 'px-4 pb-12 sm:px-8 sm:pb-16'
        }`}
      >
        <button
          type="button"
          onClick={() => setAgendaOpen(true)}
          className="type-ui group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#f6f3ee] px-6 py-4 text-[#3a2f28] transition-[color,background-color,transform] duration-300 hover:-translate-y-px hover:bg-white sm:w-auto"
        >
          Naar de agenda
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </button>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="type-ui mt-4 block text-[#f6f3ee]/40 hover:text-[#f6f3ee]"
          >
            Sluiten
          </button>
        ) : null}
      </div>
    </div>
  )
}

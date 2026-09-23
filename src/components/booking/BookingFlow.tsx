import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCms } from '@/cms/CmsContext'
import { BookButton } from '@/components/booking/BookButton'
import { BookingWell } from '@/components/booking/BookingWell'
import { DateAgenda } from '@/components/booking/DateAgenda'
import { ResolvedImg } from '@/components/ui/ResolvedMedia'
import { treatmentStill, type TreatmentStill } from '@/data/treatmentStills'
import {
  FALLBACK_TREATMENTS,
  pickDefaultEmployee,
  presentTreatments,
  type BookableTreatment,
} from '@/data/salonhubCatalog'
import { PHONE_DISPLAY, PHONE_TEL } from '@/data/site'
import {
  bookAppointment,
  loadDates,
  loadEmployees,
  loadTimes,
  loadTreatments,
  verifyAppointment,
  type LiveEmployee,
  type LiveTreatment,
} from '@/lib/salonhubApi'

type BookingFlowProps = {
  compact?: boolean
}

type Step = 'treatment' | 'employee' | 'date' | 'details' | 'verify' | 'success'

const STEPS: { id: Step; label: string }[] = [
  { id: 'treatment', label: 'Behandeling' },
  { id: 'employee', label: 'Kapper' },
  { id: 'date', label: 'Datum & tijd' },
  { id: 'details', label: 'Bevestigen' },
]

type Audience = {
  id: string
  label: string
  sections: { label: string; items: BookableTreatment[] }[]
}

function groupTreatments(items: BookableTreatment[]): Audience[] {
  const order: string[] = []
  const map = new Map<string, Audience>()
  for (const item of items) {
    let audience = map.get(item.groupId)
    if (!audience) {
      audience = { id: item.groupId, label: item.group, sections: [] }
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
  return order.map((id) => map.get(id)!)
}

function formatDay(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, (month || 1) - 1, day || 1)
  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function formatTime(value: string) {
  return value.slice(0, 5)
}

function ChoiceRow({
  active = false,
  title,
  meta,
  aside,
  leading,
  onClick,
}: {
  active?: boolean
  title: string
  meta?: string
  aside?: string
  leading?: ReactNode
  onClick: () => void
}) {
  const titleColor = active ? 'text-[#2c241c]' : 'text-[#f6f3ee] group-hover:text-[#2c241c]'
  const metaColor = active ? 'text-[#2c241c]/55' : 'text-white/40 group-hover:text-[#2c241c]/55'
  const asideColor = active ? 'text-[#2c241c]/75' : 'text-white/45 group-hover:text-[#2c241c]/75'
  const rule = active ? 'border-[#2c241c]/25' : 'border-white/20 group-hover:border-[#2c241c]/25'
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left sm:gap-4 sm:px-4 sm:py-3.5 ${
        active
          ? 'bg-[#efeae3] text-[#2c241c]'
          : 'text-[#f6f3ee] hover:bg-[#efeae3] hover:text-[#2c241c]'
      }`}
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className={`type-lead block line-clamp-2 ${titleColor}`}>{title}</span>
        {meta || aside ? (
          <span className={`mt-1 flex items-baseline gap-2 sm:mt-1.5 ${metaColor}`}>
            {meta ? <span className="type-label">{meta}</span> : null}
            {aside ? <span className={`type-ui sm:hidden ${asideColor}`}>{aside}</span> : null}
          </span>
        ) : null}
      </span>
      <span aria-hidden className={`hidden min-w-6 flex-1 border-b border-dotted sm:block ${rule}`} />
      {aside ? <span className={`type-ui hidden shrink-0 sm:inline ${asideColor}`}>{aside}</span> : null}
      <span
        aria-hidden
        className={`type-ui shrink-0 ${
          active ? 'text-[#2c241c]' : 'text-white/50 group-hover:text-[#2c241c]'
        }`}
      >
        →
      </span>
    </button>
  )
}

function Bone({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse bg-white/10 motion-reduce:animate-none ${className}`}
    />
  )
}

function ListSkeleton({
  count,
  shape = 'rounded-xl',
  label,
}: {
  count: number
  shape?: string
  label: string
}) {
  return (
    <div role="status" aria-busy="true">
      <BookingWell list>
        <ul className="flex flex-col gap-2">
          {Array.from({ length: count }, (_, index) => (
            <li key={index} className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4">
              <Bone className={`h-12 w-12 shrink-0 ${shape}`} />
              <span className="min-w-0 flex-1 space-y-2">
                <Bone className="h-3.5 w-[68%] rounded-full" />
                <Bone className="h-2.5 w-[32%] rounded-full" />
              </span>
              <Bone className="h-3 w-12 shrink-0 rounded-full" />
            </li>
          ))}
        </ul>
      </BookingWell>
      <span className="sr-only">{label}</span>
    </div>
  )
}

function AgendaSkeleton() {
  return (
    <div role="status" aria-busy="true" className="mt-7">
      <div className="overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] px-3 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center justify-between gap-3">
          <Bone className="h-10 w-10 rounded-full" />
          <Bone className="h-4 w-32 rounded-full" />
          <Bone className="h-10 w-10 rounded-full" />
        </div>
        <div className="mt-5 grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }, (_, index) => (
            <Bone key={index} className="h-11 rounded-xl bg-white/[0.06]" />
          ))}
        </div>
      </div>
      <span className="sr-only">Dagen laden</span>
    </div>
  )
}

function TimeSkeleton() {
  return (
    <div role="status" aria-busy="true" className="mt-3 flex flex-wrap gap-2">
      {Array.from({ length: 8 }, (_, index) => (
        <Bone key={index} className="h-11 w-[4.5rem] rounded-full" />
      ))}
      <span className="sr-only">Tijden laden</span>
    </div>
  )
}

const STALE_BOOKING_TITLE = 'Booking Request'
const STALE_BOOKING_INTRO = "Send us your booking request and we'll get back to you."

function phoneTel(display: string) {
  const compact = display.replace(/[^\d+]/g, '')
  if (compact.startsWith('+')) return compact
  if (compact.startsWith('00')) return `+${compact.slice(2)}`
  if (compact.startsWith('0')) return `+31${compact.slice(1)}`
  return compact ? `+${compact}` : PHONE_TEL
}

function cmsBarber(name: string, team: { name: string; imageUrl: string }[]) {
  const key = name.trim().toLowerCase()
  if (!key) return null
  return team.find((member) => member.name.trim().toLowerCase() === key) ?? null
}

export function BookingFlow({ compact = false }: BookingFlowProps) {
  const { content } = useCms()
  const reduceMotion = useReducedMotion()
  const sessionRef = useRef(crypto.randomUUID())
  const timesRequest = useRef(0)
  const flowRequest = useRef(0)
  const employeePrefetch = useRef<{ id: string; promise: Promise<LiveEmployee[]> } | null>(null)
  const formId = useId()
  const [step, setStep] = useState<Step>('treatment')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [usingFallback, setUsingFallback] = useState(false)
  const [treatments, setTreatments] = useState<LiveTreatment[]>([])
  const [employees, setEmployees] = useState<LiveEmployee[]>([])
  const [dates, setDates] = useState<string[]>([])
  const [times, setTimes] = useState<string[]>([])
  const [audienceId, setAudienceId] = useState('male')
  const [selectedId, setSelectedId] = useState('')
  const [employee, setEmployee] = useState<LiveEmployee | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [appointmentId, setAppointmentId] = useState('')
  const [code, setCode] = useState('')
  const [customer, setCustomer] = useState({
    firstname: '',
    lastname: '',
    email: '',
    telephone: '',
  })

  const visibleTreatments = useMemo(
    () =>
      presentTreatments(treatments, content.site.bookingTreatments, {
        menu: content.site.shopMenu,
        treatments: content.site.treatments,
      }),
    [treatments, content.site.bookingTreatments, content.site.shopMenu, content.site.treatments],
  )
  const audiences = useMemo(() => groupTreatments(visibleTreatments), [visibleTreatments])
  const audience = audiences.find((item) => item.id === audienceId) || audiences[0]
  const selected = visibleTreatments.find((item) => item.id === selectedId) || null

  const stepIndex = Math.max(
    0,
    STEPS.findIndex((item) => item.id === (step === 'verify' || step === 'success' ? 'details' : step)),
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadTreatments(sessionRef.current)
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

  function requestEmployees(treatmentId: string) {
    const current = employeePrefetch.current
    if (current?.id === treatmentId) return current.promise
    const promise = loadEmployees(sessionRef.current, treatmentId).then((result) => result.employees)
    employeePrefetch.current = { id: treatmentId, promise }
    promise.catch(() => {
      if (employeePrefetch.current?.promise === promise) employeePrefetch.current = null
    })
    return promise
  }

  async function continueFromTreatment() {
    if (!selected) return
    const request = ++flowRequest.current
    setEmployee(null)
    setDate('')
    setTime('')
    setDates([])
    setTimes([])
    setEmployees([])
    setError('')
    setBusy(true)
    setStep('employee')
    try {
      const nextEmployees = await requestEmployees(selected.id)
      if (flowRequest.current !== request) return
      setEmployees(nextEmployees)
      const choice = pickDefaultEmployee(nextEmployees)
      if (!choice.employee) return
      setEmployee(choice.employee)
      if (!choice.skipStep) return
      setStep('date')
      const result = await loadDates(sessionRef.current, selected.id, choice.employee.id)
      if (flowRequest.current !== request) return
      setDates(result.dates)
    } catch (err) {
      if (flowRequest.current !== request) return
      setEmployees([])
      setError(err instanceof Error ? err.message : 'Kappers laden lukt nu niet.')
    } finally {
      if (flowRequest.current === request) setBusy(false)
    }
  }

  function pickEmployee(next: LiveEmployee) {
    setError('')
    if (employee?.id === next.id) return
    setEmployee(next)
    setDate('')
    setTime('')
    setDates([])
    setTimes([])
  }

  async function continueFromEmployee() {
    if (!selected || !employee) return
    setError('')
    setBusy(true)
    setStep('date')
    try {
      const result = await loadDates(sessionRef.current, selected.id, employee.id)
      setDates(result.dates)
      if (!result.dates.includes(date)) {
        setDate('')
        setTime('')
        setTimes([])
      }
    } catch (err) {
      setDates([])
      setError(err instanceof Error ? err.message : 'Dagen laden lukt nu niet.')
    } finally {
      setBusy(false)
    }
  }

  async function pickDate(iso: string) {
    if (!selected || !employee || iso === date) return
    setDate(iso)
    setTime('')
    setTimes([])
    setError('')
    const request = ++timesRequest.current
    setBusy(true)
    try {
      const result = await loadTimes(sessionRef.current, selected.id, employee.id, iso)
      if (timesRequest.current !== request) return
      setTimes(result.times)
    } catch (err) {
      if (timesRequest.current !== request) return
      setTimes([])
      setError(err instanceof Error ? err.message : 'Tijden laden lukt nu niet.')
    } finally {
      if (timesRequest.current === request) setBusy(false)
    }
  }

  function pickTime(next: string) {
    setTime(next)
    setError('')
  }

  function continueFromSchedule() {
    if (!date || !time) return
    setError('')
    setStep('details')
  }

  async function confirm() {
    if (!selected || !employee || !date || !time) return
    setBusy(true)
    setError('')
    try {
      const result = await bookAppointment(sessionRef.current, {
        treatmentId: selected.id,
        treatmentName: selected.name,
        minutes: selected.minutes,
        employeeId: employee.id,
        employeeName: employee.name,
        date,
        time,
        customer,
      })
      setAppointmentId(result.appointmentId)
      setStep(result.status === 'verify' ? 'verify' : 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Afspraak bevestigen lukt nu niet.')
    } finally {
      setBusy(false)
    }
  }

  async function submitCode() {
    setBusy(true)
    setError('')
    try {
      await verifyAppointment(sessionRef.current, appointmentId, code)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code controleren lukt nu niet.')
    } finally {
      setBusy(false)
    }
  }

  function back() {
    setError('')
    if (step === 'employee') setStep('treatment')
    else if (step === 'date') setStep(employees.length <= 1 ? 'treatment' : 'employee')
    else if (step === 'details') setStep('date')
    else if (step === 'verify') setStep('details')
  }

  const customTitle = content.site.bookingTitle.trim()
  const title =
    step === 'employee'
      ? 'Kies een kapper'
      : step === 'date'
        ? 'Kies dag en tijd'
        : step === 'details'
            ? 'Bevestig je afspraak'
            : step === 'verify'
              ? 'Code uit je mail'
              : step === 'success'
                ? 'Afspraak staat'
                : customTitle && customTitle !== STALE_BOOKING_TITLE
                  ? customTitle
                  : 'Afspraak maken'

  const phone = content.site.phoneNumber.trim() || PHONE_DISPLAY
  const address = content.site.legal.addressLines.map((line) => line.trim()).filter(Boolean).join(', ')
  const customIntro = content.site.bookingIntro.trim()
  const barberName = (person: LiveEmployee | null) => {
    if (!person) return ''
    if (person.any) return person.name
    return cmsBarber(person.name, content.team)?.name || person.name
  }

  const summary = [
    selected?.name,
    barberName(employee),
    date ? formatDay(date) : '',
    time ? formatTime(time) : '',
  ]
    .filter(Boolean)
    .join(' · ')

  const showBack = step !== 'treatment' && step !== 'success'
  const showConfirm = step === 'details' && Boolean(selected && employee)

  return (
    <div
      className={`min-h-0 min-w-0 flex-1 bg-[#1c1b19] text-[#f6f3ee] ${
        compact ? 'flex flex-col overflow-hidden' : 'flex flex-col'
      }`}
    >
      <div
        className={`mx-auto flex w-full max-w-[680px] flex-col ${
          compact ? 'min-h-0 flex-1' : ''
        }`}
      >
        <div
          className={
            compact
              ? 'shrink-0 px-5 pb-2 pt-1'
              : 'sticky top-[6.25rem] z-20 bg-[#1c1b19] px-4 pb-3 pt-4 sm:top-[6.75rem] sm:px-8 sm:pt-8'
          }
        >
          <div className="flex items-center justify-between gap-4">
            {showBack ? (
              <button
                type="button"
                onClick={back}
                className="type-ui shrink-0 text-[#f6f3ee]/75 hover:text-[#f6f3ee]"
              >
                ← Terug
              </button>
            ) : null}
            {step === 'success' || step === 'verify' ? (
              <p className="type-label text-[#f6f3ee]/40">Tzjill · Leeuwarden</p>
            ) : (
              <ol
                aria-label="Stappen"
                className="ml-auto flex min-w-0 flex-nowrap items-center justify-end gap-x-2 sm:gap-x-3"
              >
                {STEPS.map((item, index) => {
                  const state =
                    index === stepIndex ? 'current' : index < stepIndex ? 'done' : 'upcoming'
                  return (
                    <li
                      key={item.id}
                      aria-current={state === 'current' ? 'step' : undefined}
                      className={`type-label whitespace-nowrap ${
                        state === 'current'
                          ? 'text-[#f6f3ee]'
                          : state === 'done'
                            ? 'text-[#f6f3ee]/55'
                            : 'text-[#f6f3ee]/28'
                      }`}
                    >
                      <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                      <span className="max-sm:sr-only sm:ml-1.5">{item.label}</span>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </div>

        <div
          className={
            compact
              ? `min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 ${
                  step === 'date'
                    ? 'pb-[max(2.25rem,calc(1.75rem+env(safe-area-inset-bottom,0px)))]'
                    : 'pb-6'
                }`
              : `px-4 sm:px-8 ${
                  showConfirm
                    ? 'pb-[max(7rem,calc(6rem+env(safe-area-inset-bottom,0px)))]'
                    : 'pb-[max(4.5rem,calc(3rem+env(safe-area-inset-bottom,0px)))]'
                }`
          }
        >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
        <header className="mt-2">
          <h1
            className={`type-headline uppercase ${
              compact ? 'text-[clamp(1.85rem,8vw,2.6rem)]' : ''
            }`}
          >
            {title}
          </h1>
          {step === 'treatment' ? (
            <p className="type-lead mt-4 max-w-md text-white/55">
              {customIntro && customIntro !== STALE_BOOKING_INTRO ? (
                customIntro
              ) : (
                <>
                  Kies een behandeling, daarna kapper, dag en tijd. Je blijft op deze pagina.
                  {address ? ` ${address}.` : null} Tel{' '}
                  <a href={`tel:${phoneTel(phone)}`} className="text-white/80 hover:text-white">
                    {phone}
                  </a>
                  .
                </>
              )}
            </p>
          ) : summary ? (
            <p className="mt-3 text-[13px] text-white/55">{summary}</p>
          ) : null}
        </header>

        {error ? (
          <p role="alert" className="mt-5 max-w-lg text-[13px] leading-relaxed text-[#f6f3ee]/70">
            {error}
          </p>
        ) : null}
        {usingFallback && step === 'treatment' ? (
          <p className="mt-5 text-[13px] text-[#f6f3ee]/45">Prijzen van de laatst bekende lijst.</p>
        ) : null}

        {step === 'treatment' ? (
          <>
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
                      className={`type-ui rounded-full border px-4 py-2 transition-colors ${
                        active
                          ? 'border-[#efeae3] bg-[#efeae3] text-[#2c241c]'
                          : 'border-white/20 text-white/65 hover:border-white hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            ) : null}
            <div className="mt-7 space-y-8">
              {loading ? <ListSkeleton count={5} label="Behandelingen laden" /> : null}
              {!loading && audience?.sections.map((section) => (
                <section key={section.label}>
                  <h2 className="type-label text-white/40">{section.label}</h2>
                  <BookingWell list className="mt-3">
                    <ul className="flex flex-col gap-2">
                      {section.items.map((item) => (
                        <li key={item.id}>
                          <ChoiceRow
                            active={selected?.id === item.id}
                            title={item.name}
                            meta={item.displayMinutes ? `${item.displayMinutes} min` : undefined}
                            aside={item.priceLabel || '—'}
                            leading={
                              <TreatmentThumb
                                image={item.image}
                                still={treatmentStill(item)}
                                active={selected?.id === item.id}
                              />
                            }
                            onClick={() => {
                              setSelectedId(item.id)
                              requestEmployees(item.id)
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </BookingWell>
                </section>
              ))}
            </div>
            <p className="mt-6 text-[12.5px] leading-relaxed text-[#f6f3ee]/40">
              <span className="font-medium uppercase tracking-[0.12em] text-[#f6f3ee]/70">
                No-show €20.
              </span>{' '}
              Binnen 2 uur afzeggen of niet komen.
            </p>
            {compact ? null : (
              <BookButton
                openWidget={false}
                surface="dark"
                disabled={!selected || busy}
                onClick={() => void continueFromTreatment()}
                className="mt-6 w-full sm:w-auto"
              >
                {busy ? 'Bezig…' : 'Kies een kapper'}
              </BookButton>
            )}
          </>
        ) : null}

        {step === 'employee' ? (
          <>
            {busy && !employees.length ? (
              <div className="mt-7">
                <ListSkeleton count={4} shape="rounded-full" label="Kappers laden" />
              </div>
            ) : (
            <BookingWell list className="mt-7">
              <ul className="flex flex-col gap-2">
                {employees.map((item) => {
                  const member = item.any ? null : cmsBarber(item.name, content.team)
                  return (
                  <li key={item.id}>
                    <ChoiceRow
                      active={employee?.id === item.id}
                      title={member?.name || item.name}
                      meta={item.any ? 'Wie er vrij is' : undefined}
                      leading={
                        <BarberAvatar
                          name={member?.name || item.name}
                          photo={member?.imageUrl || item.photo}
                          any={item.any}
                          active={employee?.id === item.id}
                        />
                      }
                      onClick={() => pickEmployee(item)}
                    />
                  </li>
                  )
                })}
              </ul>
            </BookingWell>
            )}
            {compact || !employees.length ? null : (
              <BookButton
                openWidget={false}
                surface="dark"
                disabled={!employee || busy}
                onClick={() => void continueFromEmployee()}
                className="mt-6 w-full sm:w-auto"
              >
                {busy ? 'Bezig…' : 'Kies dag en tijd'}
              </BookButton>
            )}
          </>
        ) : null}

        {step === 'date' ? (
          <>
            {busy && !dates.length ? <AgendaSkeleton /> : null}
            {!busy && !dates.length ? (
              <p className="mt-7 text-[13px] text-white/55">Geen vrije dagen in de komende weken.</p>
            ) : null}
            {dates.length ? (
              <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_13.5rem]">
                <DateAgenda dates={dates} value={date} onSelect={(iso) => void pickDate(iso)} />
                <div className="min-w-0">
                  <p className="type-label text-white/40">Tijd</p>
                  {!date ? (
                    <p className="mt-3 text-[13px] leading-relaxed text-white/55">
                      Kies eerst een dag in de agenda.
                    </p>
                  ) : null}
                  {date && busy && !times.length ? <TimeSkeleton /> : null}
                  {date && !busy && !times.length ? (
                    <p className="mt-3 text-[13px] text-white/55">Geen tijden op deze dag.</p>
                  ) : null}
                  {times.length ? (
                    <div className="mt-3 flex flex-wrap gap-2 pb-1">
                      {times.map((slot) => {
                        const selectedSlot = time === slot
                        return (
                          <button
                            key={slot}
                            type="button"
                            aria-pressed={selectedSlot}
                            onClick={() => pickTime(slot)}
                            className={`type-ui min-w-[4.5rem] rounded-full border px-4 py-3 ${
                              selectedSlot
                                ? 'border-[#efeae3] bg-[#efeae3] text-[#2c241c]'
                                : 'border-white/75 bg-white/5 text-white hover:border-[#efeae3] hover:bg-[#efeae3] hover:text-[#2c241c]'
                            }`}
                          >
                            {formatTime(slot)}
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
            {compact || !dates.length ? null : (
              <BookButton
                openWidget={false}
                surface="dark"
                disabled={!date || !time || busy}
                onClick={continueFromSchedule}
                className="mt-6 w-full sm:w-auto"
              >
                {busy ? 'Bezig…' : 'Verder'}
              </BookButton>
            )}
          </>
        ) : null}

        {step === 'details' && selected && employee ? (
          <form
            id={formId}
            className="mt-7 max-w-lg"
            onSubmit={(event) => {
              event.preventDefault()
              void confirm()
            }}
          >
            <BookingWell>
              <p className="type-lead py-3 text-white">{selected.name}</p>
              <p className="pb-4 text-[13px] leading-relaxed text-white/55">
                {selected.displayMinutes ? `${selected.displayMinutes} min · ` : ''}
                {selected.priceLabel}
                <br />
                {barberName(employee)} · {formatDay(date)} · {formatTime(time)}
              </p>
              <p className="pb-3 text-[12.5px] leading-relaxed text-white/40">
                No-show €20 als je niet komt of binnen 2 uur afzegt.
              </p>
            </BookingWell>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Field
                label="Voornaam"
                value={customer.firstname}
                autoComplete="given-name"
                onChange={(firstname) => setCustomer((current) => ({ ...current, firstname }))}
              />
              <Field
                label="Achternaam"
                value={customer.lastname}
                autoComplete="family-name"
                onChange={(lastname) => setCustomer((current) => ({ ...current, lastname }))}
              />
              <Field
                label="E-mail"
                type="email"
                value={customer.email}
                autoComplete="email"
                className="sm:col-span-2"
                onChange={(email) => setCustomer((current) => ({ ...current, email }))}
              />
              <Field
                label="Telefoon"
                type="tel"
                value={customer.telephone}
                autoComplete="tel"
                className="sm:col-span-2"
                onChange={(telephone) => setCustomer((current) => ({ ...current, telephone }))}
              />
            </div>
          </form>
        ) : null}

        {step === 'verify' ? (
          <form
            className="mt-7 max-w-sm"
            onSubmit={(event) => {
              event.preventDefault()
              void submitCode()
            }}
          >
            <p className="type-lead text-[#f6f3ee]/60">
              We hebben een code van 4 cijfers gemaild. Vul die hier in om de afspraak vast te zetten.
            </p>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 4))}
              className="type-headline mt-6 w-full rounded-2xl border border-white/15 bg-transparent px-4 py-4 text-center tracking-[0.4em] text-[#f6f3ee] outline-none focus:border-[#f6f3ee]"
              aria-label="Bevestigingscode"
            />
            <BookButton
              type="submit"
              openWidget={false}
              surface="dark"
              arrow={false}
              disabled={busy || code.length !== 4}
              className="mt-6 w-full sm:w-auto"
            >
              {busy ? 'Bezig…' : 'Code bevestigen'}
            </BookButton>
          </form>
        ) : null}

        {step === 'success' && selected ? (
          <div className="mt-7 max-w-lg">
            <p className="type-lead text-[#f6f3ee]/70">
              {selected.name} bij {barberName(employee)}, {formatDay(date)} om {formatTime(time)}. Je krijgt
              een mail ter bevestiging.
            </p>
            <p className="mt-4 text-[13px] text-[#f6f3ee]/45">
              Wijzigen of afzeggen kan via die mail, of bel{' '}
              <a href={`tel:${phoneTel(phone)}`} className="text-[#f6f3ee]/75">
                {phone}
              </a>
              .
            </p>
          </div>
        ) : null}
          </motion.div>
        </AnimatePresence>
        </div>

        {step === 'treatment' && compact ? (
          <div className="shrink-0 px-5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
            <BookButton
              openWidget={false}
              surface="dark"
              disabled={!selected || busy}
              onClick={() => void continueFromTreatment()}
              className="w-full sm:w-auto"
            >
              {busy ? 'Bezig…' : 'Kies een kapper'}
            </BookButton>
          </div>
        ) : null}

        {step === 'employee' && compact && employees.length ? (
          <div className="shrink-0 px-5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
            <BookButton
              openWidget={false}
              surface="dark"
              disabled={!employee || busy}
              onClick={() => void continueFromEmployee()}
              className="w-full sm:w-auto"
            >
              {busy ? 'Bezig…' : 'Kies dag en tijd'}
            </BookButton>
          </div>
        ) : null}

        {step === 'date' && compact && dates.length ? (
          <div className="shrink-0 px-5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
            <BookButton
              openWidget={false}
              surface="dark"
              disabled={!date || !time || busy}
              onClick={continueFromSchedule}
              className="w-full sm:w-auto"
            >
              {busy ? 'Bezig…' : 'Verder'}
            </BookButton>
          </div>
        ) : null}

        {showConfirm ? (
          <div
            className={
              compact
                ? 'shrink-0 px-5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]'
                : 'pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:px-8'
            }
          >
            <div
              className={
                compact
                  ? ''
                  : 'pointer-events-auto mx-auto w-full max-w-[680px] bg-[#1c1b19]/95 pt-3 backdrop-blur-md'
              }
            >
              <BookButton
                type="submit"
                form={formId}
                openWidget={false}
                surface="dark"
                disabled={busy}
                className="w-full sm:w-auto"
              >
                {busy ? 'Bezig…' : 'Afspraak bevestigen'}
              </BookButton>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function TreatmentThumb({
  image,
  still,
  active,
}: {
  image?: string
  still: TreatmentStill
  active: boolean
}) {
  const ring = active ? 'ring-[#2c241c]/20' : 'ring-white/15'
  if (image) {
    if (/^https:\/\//i.test(image) || image.startsWith('/')) {
      return (
        <img
          src={image}
          alt=""
          width={48}
          height={48}
          className={`h-12 w-12 shrink-0 rounded-xl object-cover object-[center_28%] ring-1 ${ring}`}
        />
      )
    }
    return (
      <span className={`h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-1 ${ring}`}>
        <ResolvedImg src={image} alt="" className="h-full w-full object-cover" size="thumb" />
      </span>
    )
  }
  if (still.kind === 'kids') {
    return (
      <span
        className={`type-ui flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[10px] tracking-[0.14em] ${
          active
            ? 'bg-[#2c241c] text-[#efeae3]'
            : 'bg-[#efeae3] text-[#2c241c] group-hover:bg-[#2c241c] group-hover:text-[#efeae3]'
        }`}
      >
        Kids
      </span>
    )
  }
  return (
    <img
      src={still.src}
      alt=""
      width={48}
      height={48}
      className={`h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ${
        still.focus === 'beard' ? 'object-bottom' : 'object-[center_28%]'
      } ${active ? 'ring-[#2c241c]/20' : 'ring-white/15'}`}
    />
  )
}

function BarberAvatar({
  name,
  photo,
  any,
  active,
}: {
  name: string
  photo: string
  any: boolean
  active: boolean
}) {
  const [failed, setFailed] = useState(false)
  const ring = active ? 'ring-[#2c241c]/15' : 'ring-white/15'
  if (any) {
    return (
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${
          active
            ? 'border-[#2c241c]/20 bg-[#2c241c] text-[#efeae3]'
            : 'border-white/15 bg-white/[0.06] text-[#f6f3ee] group-hover:border-[#2c241c]/20 group-hover:bg-[#2c241c] group-hover:text-[#efeae3]'
        }`}
      >
        <AnyBarberIcon />
      </span>
    )
  }
  if (photo && !failed && /^https:\/\//i.test(photo)) {
    return (
      <img
        src={photo}
        alt=""
        width={48}
        height={48}
        onError={() => setFailed(true)}
        className={`h-12 w-12 shrink-0 rounded-full object-cover ring-1 ${ring}`}
      />
    )
  }
  if (photo && !failed) {
    return (
      <span className={`h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ${ring}`}>
        <ResolvedImg src={photo} alt="" className="h-full w-full object-cover" size="thumb" />
      </span>
    )
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
  return (
    <span
      className={`type-ui flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
        active ? 'bg-[#2c241c] text-[#efeae3]' : 'bg-[#efeae3] text-[#2c241c] group-hover:bg-[#2c241c] group-hover:text-[#efeae3]'
      }`}
      aria-hidden
    >
      {initials || '·'}
    </span>
  )
}

function AnyBarberIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="9" cy="8.2" r="2.1" />
      <circle cx="15.4" cy="9.1" r="1.7" />
      <path d="M4.6 17.6c.7-2.5 2.5-3.7 4.4-3.7s3.7 1.2 4.4 3.7" strokeLinecap="round" />
      <path d="M13.8 14.4c1.4-.5 2.8-.2 3.8 1 .7 1 .9 2.1.8 3" strokeLinecap="round" />
    </svg>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  className = '',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="type-label text-white/40">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        required={label !== 'Achternaam'}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-full border border-white/20 bg-transparent px-4 py-3 text-[15px] text-white outline-none focus:border-[#efeae3]"
      />
    </label>
  )
}

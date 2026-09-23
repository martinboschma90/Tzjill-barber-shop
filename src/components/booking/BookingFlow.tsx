import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCms } from '@/cms/CmsContext'
import { BookButton } from '@/components/booking/BookButton'
import { BookingWell } from '@/components/booking/BookingWell'
import { DateAgenda } from '@/components/booking/DateAgenda'
import { ResolvedImg } from '@/components/ui/ResolvedMedia'
import { FALLBACK_TREATMENTS, presentTreatments } from '@/data/salonhubCatalog'
import { LOCATION_ADDRESS, PHONE_DISPLAY, PHONE_TEL } from '@/data/site'
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
  sections: { label: string; items: LiveTreatment[] }[]
}

function groupTreatments(items: LiveTreatment[]): Audience[] {
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
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`group flex w-full gap-4 rounded-xl px-3.5 py-3 text-left sm:px-4 sm:py-3.5 ${
        leading ? 'items-center' : 'items-baseline'
      } ${
        active
          ? 'bg-[#efeae3] text-[#2c241c]'
          : 'text-[#f6f3ee] hover:bg-[#efeae3] hover:text-[#2c241c]'
      }`}
    >
      {leading}
      <span className="min-w-0">
        <span
          className={`type-lead block ${
            active ? 'text-[#2c241c]' : 'text-[#f6f3ee] group-hover:text-[#2c241c]'
          }`}
        >
          {title}
        </span>
        {meta ? (
          <span
            className={`type-label mt-1.5 block ${
              active ? 'text-[#2c241c]/55' : 'text-white/40 group-hover:text-[#2c241c]/55'
            }`}
          >
            {meta}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden
        className={`min-w-6 flex-1 border-b border-dotted ${
          active ? 'border-[#2c241c]/25' : 'border-white/20 group-hover:border-[#2c241c]/25'
        }`}
      />
      {aside ? (
        <span
          className={`type-ui shrink-0 ${
            active ? 'text-[#2c241c]/75' : 'text-white/45 group-hover:text-[#2c241c]/75'
          }`}
        >
          {aside}
        </span>
      ) : null}
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

export function BookingFlow({ compact = false }: BookingFlowProps) {
  const { content } = useCms()
  const reduceMotion = useReducedMotion()
  const sessionRef = useRef(crypto.randomUUID())
  const timesRequest = useRef(0)
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
    () => presentTreatments(treatments, content.site.bookingTreatments),
    [treatments, content.site.bookingTreatments],
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

  async function continueFromTreatment() {
    if (!selected) return
    setEmployee(null)
    setDate('')
    setTime('')
    setError('')
    setBusy(true)
    setStep('employee')
    try {
      const result = await loadEmployees(sessionRef.current, selected.id)
      setEmployees(result.employees)
    } catch (err) {
      setEmployees([])
      setError(err instanceof Error ? err.message : 'Kappers laden lukt nu niet.')
    } finally {
      setBusy(false)
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
    else if (step === 'date') setStep('employee')
    else if (step === 'details') setStep('date')
    else if (step === 'verify') setStep('details')
  }

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
                : 'Afspraak maken'

  const summary = [
    selected?.name,
    employee?.name,
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
              <ol className="flex min-w-0 flex-wrap justify-end gap-x-3 gap-y-1">
                {STEPS.map((item, index) => (
                  <li
                    key={item.id}
                    className={`type-label ${
                      index === stepIndex
                        ? 'text-[#f6f3ee]'
                        : index < stepIndex
                          ? 'text-[#f6f3ee]/55'
                          : 'text-[#f6f3ee]/28'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')} {item.label}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div
          className={
            compact
              ? 'min-h-0 flex-1 overflow-y-auto px-5 pb-6'
              : `px-4 sm:px-8 ${showConfirm ? 'pb-28' : 'pb-12'}`
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
              Kies een behandeling, daarna kapper, dag en tijd. Je blijft op deze pagina.{' '}
              {LOCATION_ADDRESS}. Tel{' '}
              <a href={`tel:${PHONE_TEL}`} className="text-white/80 hover:text-white">
                {PHONE_DISPLAY}
              </a>
              .
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
              {loading ? <p className="type-label text-white/40">Laden…</p> : null}
              {audience?.sections.map((section) => (
                <section key={section.label}>
                  <h2 className="type-label text-white/40">{section.label}</h2>
                  <BookingWell list className="mt-3">
                    <ul className="flex flex-col gap-2">
                      {section.items.map((item) => (
                        <li key={item.id}>
                          <ChoiceRow
                            active={selected?.id === item.id}
                            title={item.name}
                            meta={item.minutes ? `${item.minutes} min` : undefined}
                            aside={item.priceLabel || '—'}
                            onClick={() => setSelectedId(item.id)}
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
            <BookingWell list className="mt-7">
              <ul className="flex flex-col gap-2">
                {busy && !employees.length ? (
                  <li className="type-label py-4 text-white/40">Laden…</li>
                ) : null}
                {employees.map((item) => (
                  <li key={item.id}>
                    <ChoiceRow
                      active={employee?.id === item.id}
                      title={item.name}
                      meta={item.any ? 'Wie er vrij is' : undefined}
                      leading={
                        <BarberAvatar
                          name={item.name}
                          photo={item.photo || teamPhoto(item.name, content.team)}
                          any={item.any}
                          active={employee?.id === item.id}
                        />
                      }
                      onClick={() => pickEmployee(item)}
                    />
                  </li>
                ))}
              </ul>
            </BookingWell>
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
            {busy && !dates.length ? <p className="type-label mt-7 text-white/40">Laden…</p> : null}
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
                  {date && busy && !times.length ? (
                    <p className="type-label mt-3 text-white/40">Laden…</p>
                  ) : null}
                  {date && !busy && !times.length ? (
                    <p className="mt-3 text-[13px] text-white/55">Geen tijden op deze dag.</p>
                  ) : null}
                  {times.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
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
                {selected.minutes ? `${selected.minutes} min · ` : ''}
                {selected.priceLabel}
                <br />
                {employee.name} · {formatDay(date)} · {formatTime(time)}
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
              {selected.name} bij {employee?.name}, {formatDay(date)} om {formatTime(time)}. Je krijgt
              een mail ter bevestiging.
            </p>
            <p className="mt-4 text-[13px] text-[#f6f3ee]/45">
              Wijzigen of afzeggen kan via die mail, of bel{' '}
              <a href={`tel:${PHONE_TEL}`} className="text-[#f6f3ee]/75">
                {PHONE_DISPLAY}
              </a>
              .
            </p>
          </div>
        ) : null}
          </motion.div>
        </AnimatePresence>
        </div>

        {step === 'treatment' && compact ? (
          <div className="shrink-0 border-t border-white/[0.08] bg-[#1c1b19] px-5 py-3">
            <BookButton
              openWidget={false}
              surface="dark"
              disabled={!selected || busy}
              onClick={() => void continueFromTreatment()}
              className="w-full"
            >
              {busy ? 'Bezig…' : 'Kies een kapper'}
            </BookButton>
          </div>
        ) : null}

        {step === 'employee' && compact && employees.length ? (
          <div className="shrink-0 border-t border-white/[0.08] bg-[#1c1b19] px-5 py-3">
            <BookButton
              openWidget={false}
              surface="dark"
              disabled={!employee || busy}
              onClick={() => void continueFromEmployee()}
              className="w-full"
            >
              {busy ? 'Bezig…' : 'Kies dag en tijd'}
            </BookButton>
          </div>
        ) : null}

        {step === 'date' && compact && dates.length ? (
          <div className="shrink-0 border-t border-white/[0.08] bg-[#1c1b19] px-5 py-3">
            <BookButton
              openWidget={false}
              surface="dark"
              disabled={!date || !time || busy}
              onClick={continueFromSchedule}
              className="w-full"
            >
              {busy ? 'Bezig…' : 'Verder'}
            </BookButton>
          </div>
        ) : null}

        {showConfirm ? (
          <div
            className={
              compact
                ? 'shrink-0 border-t border-white/[0.08] bg-[#1c1b19] px-5 py-3'
                : 'fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#1c1b19]/95 px-4 py-3 backdrop-blur-md sm:px-8'
            }
          >
            <div className={compact ? '' : 'mx-auto w-full max-w-[680px]'}>
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

function teamPhoto(name: string, team: { name: string; imageUrl: string }[]) {
  const key = name.trim().toLowerCase()
  if (!key) return ''
  const match = team.find((member) => member.name.trim().toLowerCase() === key)
  const image = match?.imageUrl?.trim() || ''
  return image
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

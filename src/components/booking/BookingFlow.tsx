import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useCms } from '@/cms/CmsContext'
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
  onBack?: () => void
}

type Step = 'treatment' | 'employee' | 'date' | 'time' | 'details' | 'verify' | 'success'

const STEPS: { id: Step; label: string }[] = [
  { id: 'treatment', label: 'Behandeling' },
  { id: 'employee', label: 'Kapper' },
  { id: 'date', label: 'Datum' },
  { id: 'time', label: 'Tijd' },
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

function rowClass(active: boolean) {
  return `flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-[color,background-color,border-color] duration-300 ${
    active
      ? 'border-[#f6f3ee] bg-[#f6f3ee] text-[#1c1b19]'
      : 'border-white/[0.1] bg-white/[0.04] text-[#f6f3ee] hover:border-white/25 hover:bg-white/[0.07]'
  }`
}

export function BookingFlow({ compact = false, onBack }: BookingFlowProps) {
  const { content } = useCms()
  const sessionRef = useRef(crypto.randomUUID())
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

  async function goDates(next: LiveEmployee) {
    if (!selected) return
    setEmployee(next)
    setDate('')
    setTime('')
    setError('')
    setBusy(true)
    setStep('date')
    try {
      const result = await loadDates(sessionRef.current, selected.id, next.id)
      setDates(result.dates)
    } catch (err) {
      setDates([])
      setError(err instanceof Error ? err.message : 'Dagen laden lukt nu niet.')
    } finally {
      setBusy(false)
    }
  }

  async function goTimes(nextDate: string) {
    if (!selected || !employee) return
    setDate(nextDate)
    setTime('')
    setError('')
    setBusy(true)
    setStep('time')
    try {
      const result = await loadTimes(sessionRef.current, selected.id, employee.id, nextDate)
      setTimes(result.times)
    } catch (err) {
      setTimes([])
      setError(err instanceof Error ? err.message : 'Tijden laden lukt nu niet.')
    } finally {
      setBusy(false)
    }
  }

  function pickTime(next: string) {
    setTime(next)
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
    else if (step === 'time') setStep('date')
    else if (step === 'details') setStep('time')
    else if (step === 'verify') setStep('details')
  }

  const title =
    step === 'employee'
      ? 'Kies een kapper'
      : step === 'date'
        ? 'Kies een dag'
        : step === 'time'
          ? 'Kies een tijd'
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
        {step === 'success' || step === 'verify' ? (
          <p className="type-label text-[#f6f3ee]/40">Tzjill · Leeuwarden</p>
        ) : (
          <ol className="flex flex-wrap gap-x-3 gap-y-1">
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

        <header className="mt-4">
          <h1
            className={`type-headline uppercase ${
              compact ? 'text-[clamp(1.85rem,8vw,2.6rem)]' : ''
            }`}
          >
            {title}
          </h1>
          {step === 'treatment' ? (
            <p className="type-lead mt-4 max-w-md text-[#f6f3ee]/55">
              Kies een behandeling, daarna kapper, dag en tijd. Je blijft op deze pagina.{' '}
              {LOCATION_ADDRESS}. Tel{' '}
              <a href={`tel:${PHONE_TEL}`} className="text-[#f6f3ee]/80 hover:text-[#f6f3ee]">
                {PHONE_DISPLAY}
              </a>
              .
            </p>
          ) : summary ? (
            <p className="mt-3 text-[13px] text-[#f6f3ee]/55">{summary}</p>
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
                      className={`type-ui rounded-full px-4 py-2 transition-colors ${
                        active ? 'bg-[#f6f3ee] text-[#1c1b19]' : 'text-[#f6f3ee]/65 hover:text-[#f6f3ee]'
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
                            className={rowClass(active)}
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
          </>
        ) : null}

        {step === 'employee' ? (
          <ul className="mt-7 grid gap-2">
            {busy && !employees.length ? (
              <li className="type-label text-[#f6f3ee]/40">Laden…</li>
            ) : null}
            {employees.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => void goDates(item)} className={rowClass(false)}>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold tracking-[-0.015em]">
                      {item.name}
                    </span>
                    {item.any ? (
                      <span className="type-label mt-1.5 block text-[#f6f3ee]/40">Wie er vrij is</span>
                    ) : null}
                  </span>
                  <span aria-hidden className="type-ui text-[#f6f3ee]/50">
                    →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {step === 'date' ? (
          <div className="mt-7 flex flex-wrap gap-2">
            {busy && !dates.length ? <p className="type-label text-[#f6f3ee]/40">Laden…</p> : null}
            {!busy && !dates.length ? (
              <p className="text-[13px] text-[#f6f3ee]/55">Geen vrije dagen in de komende weken.</p>
            ) : null}
            {dates.map((iso) => (
              <button
                key={iso}
                type="button"
                onClick={() => void goTimes(iso)}
                className="type-ui rounded-full border border-white/15 px-4 py-3 text-[#f6f3ee] transition-colors hover:border-[#f6f3ee] hover:bg-[#f6f3ee] hover:text-[#1c1b19]"
              >
                {formatDay(iso)}
              </button>
            ))}
          </div>
        ) : null}

        {step === 'time' ? (
          <div className="mt-7 flex flex-wrap gap-2">
            {busy && !times.length ? <p className="type-label text-[#f6f3ee]/40">Laden…</p> : null}
            {!busy && !times.length ? (
              <p className="text-[13px] text-[#f6f3ee]/55">Geen tijden op deze dag.</p>
            ) : null}
            {times.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => pickTime(slot)}
                className="type-ui min-w-[4.5rem] rounded-full border border-white/15 px-4 py-3 text-[#f6f3ee] transition-colors hover:border-[#f6f3ee] hover:bg-[#f6f3ee] hover:text-[#1c1b19]"
              >
                {formatTime(slot)}
              </button>
            ))}
          </div>
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
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5">
              <p className="text-[15px] font-semibold tracking-[-0.015em]">{selected.name}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[#f6f3ee]/55">
                {selected.minutes ? `${selected.minutes} min · ` : ''}
                {selected.priceLabel}
                <br />
                {employee.name} · {formatDay(date)} · {formatTime(time)}
              </p>
              <p className="mt-4 text-[12.5px] leading-relaxed text-[#f6f3ee]/40">
                No-show €20 als je niet komt of binnen 2 uur afzegt.
              </p>
            </div>
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
            <button
              type="submit"
              disabled={busy}
              className="type-ui mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#f6f3ee] px-6 py-4 text-[#3a2f28] transition-[transform,background-color] duration-300 hover:-translate-y-px hover:bg-white disabled:opacity-50 sm:w-auto"
            >
              {busy ? 'Bezig…' : 'Afspraak bevestigen'}
            </button>
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
            <button
              type="submit"
              disabled={busy || code.length !== 4}
              className="type-ui mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#f6f3ee] px-6 py-4 text-[#3a2f28] disabled:opacity-50"
            >
              {busy ? 'Bezig…' : 'Code bevestigen'}
            </button>
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

        {step !== 'treatment' && step !== 'success' ? (
          <button
            type="button"
            onClick={back}
            className="type-ui mt-8 text-[#f6f3ee]/45 hover:text-[#f6f3ee]"
          >
            ← Terug
          </button>
        ) : null}
      </div>

      {step === 'treatment' ? (
        <div
          className={`mx-auto w-full max-w-[680px] ${
            compact ? 'shrink-0 border-t border-white/[0.08] px-5 py-4' : 'px-4 pb-12 sm:px-8 sm:pb-16'
          }`}
        >
          <button
            type="button"
            disabled={!selected || busy}
            onClick={() => void continueFromTreatment()}
            className="type-ui group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#f6f3ee] px-6 py-4 text-[#3a2f28] transition-[color,background-color,transform] duration-300 hover:-translate-y-px hover:bg-white disabled:opacity-40 sm:w-auto"
          >
            {busy ? 'Bezig…' : 'Kies een kapper'}
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
      ) : null}
    </div>
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
      <span className="type-label text-[#f6f3ee]/40">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        required={label !== 'Achternaam'}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-full border border-white/15 bg-transparent px-4 py-3 text-[15px] text-[#f6f3ee] outline-none focus:border-[#f6f3ee]"
      />
    </label>
  )
}

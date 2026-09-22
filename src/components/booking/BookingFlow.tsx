import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useCms } from '@/cms/CmsContext'
import { FALLBACK_TREATMENTS, presentTreatments } from '@/data/salonhubCatalog'
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

function newSession() {
  return crypto.randomUUID()
}

export function BookingFlow({ compact = false, onBack }: BookingFlowProps) {
  const { content } = useCms()
  const sessionRef = useRef(newSession())
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
  const [treatment, setTreatment] = useState<LiveTreatment | null>(null)
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

  const settings = content.site.bookingTreatments
  const visibleTreatments = useMemo(
    () => presentTreatments(treatments, settings),
    [treatments, settings],
  )
  const groups = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, LiveTreatment[]>()
    for (const item of visibleTreatments) {
      if (!map.has(item.group)) {
        map.set(item.group, [])
        order.push(item.group)
      }
      map.get(item.group)?.push(item)
    }
    return order.map((label) => ({ label, items: map.get(label) || [] }))
  }, [visibleTreatments])

  const stepIndex = Math.max(
    0,
    STEPS.findIndex((item) => item.id === (step === 'verify' || step === 'success' ? 'details' : step)),
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
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
        setError('Live prijzen laden niet. Je ziet de laatst bekende lijst.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function goEmployees(next: LiveTreatment) {
    setTreatment(next)
    setEmployee(null)
    setDate('')
    setTime('')
    setError('')
    setBusy(true)
    setStep('employee')
    try {
      const result = await loadEmployees(sessionRef.current, next.id)
      setEmployees(result.employees)
    } catch (err) {
      setEmployees([])
      setError(err instanceof Error ? err.message : 'Kappers laden lukt nu niet.')
    } finally {
      setBusy(false)
    }
  }

  async function goDates(next: LiveEmployee) {
    if (!treatment) return
    setEmployee(next)
    setDate('')
    setTime('')
    setError('')
    setBusy(true)
    setStep('date')
    try {
      const result = await loadDates(sessionRef.current, treatment.id, next.id)
      setDates(result.dates)
    } catch (err) {
      setDates([])
      setError(err instanceof Error ? err.message : 'Dagen laden lukt nu niet.')
    } finally {
      setBusy(false)
    }
  }

  async function goTimes(nextDate: string) {
    if (!treatment || !employee) return
    setDate(nextDate)
    setTime('')
    setError('')
    setBusy(true)
    setStep('time')
    try {
      const result = await loadTimes(sessionRef.current, treatment.id, employee.id, nextDate)
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
    if (!treatment || !employee || !date || !time) return
    setBusy(true)
    setError('')
    try {
      const result = await bookAppointment(sessionRef.current, {
        treatmentId: treatment.id,
        treatmentName: treatment.name,
        minutes: treatment.minutes,
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
                : compact
                  ? 'Kies je behandeling'
                  : 'Afspraak maken'

  return (
    <div
      className={`min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#1c1b19] text-[#f6f3ee] ${
        compact ? 'px-5 pb-10 pt-2' : 'px-4 pb-12 pt-4 sm:px-12 sm:pb-16 sm:pt-10'
      }`}
    >
      <div className="mx-auto max-w-[760px]">
        {step !== 'success' && step !== 'verify' ? (
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
        ) : (
          <p className="type-label text-[#f6f3ee]/40">Tzjill · Leeuwarden</p>
        )}

        <header className="mt-4 max-w-xl">
          <h1
            className={`type-headline uppercase ${
              compact ? 'text-[clamp(1.85rem,8vw,2.6rem)]' : ''
            }`}
          >
            {title}
          </h1>
          {step === 'treatment' ? (
            <p className="type-lead mt-4 max-w-md text-[#f6f3ee]/55">
              Kies behandeling, kapper, dag en tijd. Je blijft op deze pagina.
              {compact ? null : (
                <>
                  {' '}
                  Tel{' '}
                  <a href={`tel:${PHONE_TEL}`} className="text-[#f6f3ee]/80 hover:text-[#f6f3ee]">
                    {PHONE_DISPLAY}
                  </a>
                  .
                </>
              )}
            </p>
          ) : treatment ? (
            <p className="mt-3 text-[13px] text-[#f6f3ee]/50">
              {treatment.name}
              {employee ? ` · ${employee.name}` : ''}
              {date ? ` · ${formatDay(date)}` : ''}
              {time ? ` · ${formatTime(time)}` : ''}
            </p>
          ) : null}
        </header>

        {error ? (
          <p role="alert" className="mt-5 max-w-lg text-[13px] leading-relaxed text-[#f6f3ee]/70">
            {error}
          </p>
        ) : null}
        {usingFallback && step === 'treatment' && !error ? (
          <p className="mt-5 text-[13px] text-[#f6f3ee]/45">Prijzen van de laatst bekende lijst.</p>
        ) : null}

        {step === 'treatment' ? (
          <div className="mt-8 space-y-8">
            {loading ? <p className="type-label text-[#f6f3ee]/40">Laden…</p> : null}
            {groups.map((group) => (
              <section key={group.label}>
                <h2 className="type-label text-[#f6f3ee]/40">{group.label}</h2>
                <ul className="mt-3 grid gap-2">
                  {group.items.map((item) => {
                    const active = treatment?.id === item.id
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => {
                            void goEmployees(item)
                          }}
                          className={`flex w-full items-center justify-between gap-4 rounded-[1.25rem] border px-4 py-4 text-left transition-[color,background-color,border-color] duration-300 ${
                            active
                              ? 'border-[#f6f3ee] bg-[#f6f3ee] text-[#1c1b19]'
                              : 'border-white/[0.1] bg-white/[0.03] text-[#f6f3ee] hover:border-white/25 hover:bg-white/[0.06]'
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="type-lead block">{item.name}</span>
                            <span
                              className={`type-label mt-2 block ${
                                active ? 'text-[#1c1b19]/50' : 'text-[#f6f3ee]/40'
                              }`}
                            >
                              {item.minutes ? `${item.minutes} min` : 'Duur in de stoel'}
                            </span>
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
        ) : null}

        {step === 'employee' ? (
          <ul className="mt-8 grid gap-2">
            {busy && !employees.length ? (
              <li className="type-label text-[#f6f3ee]/40">Laden…</li>
            ) : null}
            {employees.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    void goDates(item)
                  }}
                  className="flex w-full items-center justify-between gap-4 rounded-[1.25rem] border border-white/[0.1] bg-white/[0.03] px-4 py-4 text-left text-[#f6f3ee] transition-[border-color,background-color] duration-300 hover:border-white/25 hover:bg-white/[0.06]"
                >
                  <span>
                    <span className="type-lead block">{item.name}</span>
                    {item.any ? (
                      <span className="type-label mt-2 block text-[#f6f3ee]/40">
                        Wie er vrij is
                      </span>
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
          <div className="mt-8 flex flex-wrap gap-2">
            {busy && !dates.length ? (
              <p className="type-label text-[#f6f3ee]/40">Laden…</p>
            ) : null}
            {!busy && !dates.length ? (
              <p className="text-[13px] text-[#f6f3ee]/55">Geen vrije dagen in de komende weken.</p>
            ) : null}
            {dates.map((iso) => (
              <button
                key={iso}
                type="button"
                onClick={() => {
                  void goTimes(iso)
                }}
                className="type-ui rounded-full border border-white/15 px-4 py-3 text-[#f6f3ee] transition-colors hover:border-[#f6f3ee] hover:bg-[#f6f3ee] hover:text-[#1c1b19]"
              >
                {formatDay(iso)}
              </button>
            ))}
          </div>
        ) : null}

        {step === 'time' ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {busy && !times.length ? (
              <p className="type-label text-[#f6f3ee]/40">Laden…</p>
            ) : null}
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

        {step === 'details' && treatment && employee ? (
          <form
            id={formId}
            className="mt-8 max-w-lg"
            onSubmit={(event) => {
              event.preventDefault()
              void confirm()
            }}
          >
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-5 py-5">
              <p className="type-lead">{treatment.name}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[#f6f3ee]/55">
                {treatment.minutes ? `${treatment.minutes} min · ` : ''}
                {treatment.priceLabel}
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
            className="mt-8 max-w-sm"
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

        {step === 'success' && treatment ? (
          <div className="mt-8 max-w-lg">
            <p className="type-lead text-[#f6f3ee]/70">
              {treatment.name} bij {employee?.name}, {formatDay(date)} om {formatTime(time)}. Je
              krijgt een mail ter bevestiging.
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

        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="type-ui mt-6 block text-[#f6f3ee]/40 hover:text-[#f6f3ee]"
          >
            Sluiten
          </button>
        ) : null}
      </div>
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
        className="mt-2 w-full rounded-full border border-white/15 bg-transparent px-4 py-3 text-[15px] text-[#f6f3ee] outline-none placeholder:text-[#f6f3ee]/30 focus:border-[#f6f3ee]"
      />
    </label>
  )
}

import { useState } from 'react'
import { BookingWell } from '@/components/booking/BookingWell'
import {
  LOCATION_ADDRESS,
  PHONE_DISPLAY,
  PHONE_TEL,
} from '@/data/site'

const steps = [
  { n: '01', t: 'Behandeling', d: 'Haircut, baard, kids of combi.' },
  { n: '02', t: 'Kapper', d: 'Kies wie je knipt — of wie vrij is.' },
  { n: '03', t: 'Tijd', d: 'Bevestiging volgt per mail.' },
]

type BookingFlowProps = {
  compact?: boolean
  onBack?: () => void
}

export function BookingFlow({ compact = false, onBack }: BookingFlowProps) {
  const [agendaOpen, setAgendaOpen] = useState(false)
  const [policyOpen, setPolicyOpen] = useState(false)

  if (agendaOpen) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden bg-[#1c1b19] text-[#f6f3ee]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => setAgendaOpen(false)}
            className="type-ui text-[#f6f3ee]/55 transition-colors hover:text-[#f6f3ee]"
          >
            ← Terug
          </button>
          <p className="type-label text-[#f6f3ee]/40">Stap 2 — Agenda</p>
        </div>
        <BookingWell
          className={
            compact
              ? 'min-h-0 min-w-0 flex-1'
              : 'h-[min(78svh,860px)] min-h-[28rem] w-full sm:mx-4 sm:mb-4 sm:rounded-[2rem]'
          }
        />
      </div>
    )
  }

  return (
    <div
      className={`min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#1c1b19] text-[#f6f3ee] ${
        compact ? 'px-5 pb-10 pt-2' : 'px-4 pb-12 pt-4 sm:px-12 sm:pb-16 sm:pt-10'
      }`}
    >
      <div className="mx-auto max-w-[1240px]">
        <header className="max-w-xl">
          <p className="type-label text-[#f6f3ee]/40">Stap 1 — Behandeling</p>
          <h1
            className={`type-headline mt-4 uppercase ${
              compact ? 'text-[clamp(1.85rem,8vw,2.75rem)]' : ''
            }`}
          >
            Afspraak {compact ? 'maken' : <span className="sm:block">maken</span>}
          </h1>
          <p className="type-lead mt-4 max-w-sm text-[#f6f3ee]/55">
            Kies behandeling, kapper en tijd in de agenda. {LOCATION_ADDRESS}. Tel{' '}
            <a href={`tel:${PHONE_TEL}`} className="text-[#f6f3ee]/80 hover:text-[#f6f3ee]">
              {PHONE_DISPLAY}
            </a>
            .
          </p>
        </header>

        <ol
          className={`mt-8 grid gap-px overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-white/[0.08] ${
            compact ? '' : 'sm:grid-cols-3'
          }`}
        >
          {steps.map((step) => (
            <li key={step.n} className="bg-[#1c1b19] px-5 py-4 sm:px-6 sm:py-5">
              <p className="type-label text-[#f6f3ee]/35">{step.n}</p>
              <p className="type-lead mt-2 text-[#f6f3ee]">{step.t}</p>
              <p className="type-lead mt-1 text-[#f6f3ee]/45">{step.d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 border-t border-white/[0.08]">
          <button
            type="button"
            aria-expanded={policyOpen}
            onClick={() => setPolicyOpen((open) => !open)}
            className="flex w-full items-center gap-4 py-4 text-left"
          >
            <span className="flex-1 type-label text-[#f6f3ee]/45">
              Afzeggen & no-show beleid
            </span>
            <span
              aria-hidden
              className={`type-ui text-[#f6f3ee]/45 transition-transform ${
                policyOpen ? 'rotate-45' : ''
              }`}
            >
              +
            </span>
          </button>
          {policyOpen ? (
            <p className="max-w-lg pb-5 text-[13px] leading-relaxed text-[#f6f3ee]/55">
              Kom je niet opdagen of zeg je binnen 2 uur af, dan rekenen we €20.
              Die stoel stond voor jou vrij — met een berichtje vooraf geven we
              hem door.
            </p>
          ) : (
            <p className="pb-4 text-[12.5px] leading-relaxed text-[#f6f3ee]/40">
              <span className="font-medium uppercase tracking-[0.12em] text-[#f6f3ee]/70">
                No-show €20.
              </span>{' '}
              Open voor de rest.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setAgendaOpen(true)}
          className="type-ui group mt-2 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#f6f3ee] px-6 py-4 text-[#3a2f28] transition-[color,background-color,transform] duration-300 hover:-translate-y-px hover:bg-white sm:w-auto"
        >
          Naar de agenda
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          >
            →
          </span>
        </button>

        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="type-ui mt-6 text-[#f6f3ee]/40 hover:text-[#f6f3ee]"
          >
            Sluiten
          </button>
        ) : null}
      </div>
    </div>
  )
}

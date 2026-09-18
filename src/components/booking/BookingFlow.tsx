import { useState } from 'react'
import { BookingWell } from '@/components/booking/BookingWell'
import {
  LOCATION_ADDRESS,
  PHONE_DISPLAY,
  PHONE_TEL,
  openingHours,
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

  if (agendaOpen) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => setAgendaOpen(false)}
            className="type-ui text-white/55 transition-colors hover:text-white"
          >
            ← Terug
          </button>
          <p className="type-label text-white/40">Agenda</p>
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
      className={`min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto text-white ${
        compact ? 'px-5 pb-10 pt-2' : 'px-4 pb-12 pt-4 sm:px-12 sm:pb-16 sm:pt-10'
      }`}
    >
      <div className="mx-auto max-w-[1240px]">
        <header className="max-w-xl">
          <p className="type-label text-white/40">Boeken</p>
          <h1
            className={`type-headline mt-3 ${
              compact ? 'text-[clamp(1.85rem,8vw,2.75rem)]' : ''
            }`}
          >
            Afspraak {compact ? 'maken' : <span className="sm:block">maken</span>}
          </h1>
          <p className="type-lead mt-4 max-w-sm text-white/55">
            {LOCATION_ADDRESS}. Tel{' '}
            <a href={`tel:${PHONE_TEL}`} className="text-white/80 hover:text-white">
              {PHONE_DISPLAY}
            </a>
            .
          </p>
        </header>

        <ol
          className={`mt-8 grid gap-3 ${compact ? '' : 'sm:grid-cols-3 sm:gap-4'}`}
        >
          {steps.map((step) => (
            <li
              key={step.n}
              className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-5 py-4 sm:rounded-[1.5rem]"
            >
              <p className="type-label text-white/35">{step.n}</p>
              <p className="type-lead mt-2 text-white">{step.t}</p>
              <p className="type-lead mt-1 text-white/45">{step.d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-[#efeae3] px-5 py-6 text-[#2c241c] sm:max-w-lg sm:px-7 sm:py-7">
          <p className="type-label text-[#2c241c]/45">Voor je boekt</p>
          <p className="type-lead mt-3 max-w-md text-[#2c241c]/70">
            Kom je niet, laat het zo vroeg mogelijk weten. Anders kan €20 in
            rekening. De agenda zelf is Salonhub — die opent hierna in dit
            scherm.
          </p>
          <p className="type-label mt-4 text-[#2c241c]/45">
            {openingHours[0].time} ma–wo · {openingHours[3].time} do–za
          </p>
          <button
            type="button"
            onClick={() => setAgendaOpen(true)}
            className="type-ui group mt-6 inline-flex items-center justify-center gap-2.5 rounded-full border border-[#2c241c] bg-[#2c241c] px-6 py-3 text-[#efeae3] transition-[color,background-color,border-color,transform] duration-300 hover:-translate-y-px hover:border-black hover:bg-black"
          >
            Naar de agenda
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </button>
        </div>

        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="type-ui mt-6 text-white/40 hover:text-white"
          >
            Sluiten
          </button>
        ) : null}
      </div>
    </div>
  )
}

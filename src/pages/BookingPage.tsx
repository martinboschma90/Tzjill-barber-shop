import { AppShell } from '@/components/layout/AppShell'
import { BookingWell } from '@/components/booking/BookingWell'
import { LOCATION_ADDRESS, PHONE_DISPLAY, PHONE_TEL } from '@/data/site'

const steps = [
  { n: '01', t: 'Behandeling', d: 'Haircut, baard, kids of combi.' },
  { n: '02', t: 'Kapper', d: 'Kies wie je knipt — of wie vrij is.' },
  { n: '03', t: 'Tijd', d: 'Bevestiging volgt per mail.' },
]

export function BookingPage() {
  return (
    <AppShell navVariant="wordmark">
      <div className="overflow-x-hidden px-4 pb-5 pt-4 text-white sm:px-12 sm:pb-12 sm:pt-10">
        <div className="mx-auto max-w-[1240px]">
          <header className="max-w-2xl">
            <p className="type-label text-white/40">Boeken</p>
            <h1 className="type-headline mt-3 sm:mt-4">
              Afspraak <span className="sm:block">maken</span>
            </h1>
            <p className="type-lead mt-3 max-w-sm text-white/55 sm:mt-5">
              Zelfde lounge — de agenda is Salonhub, in ons frame.{' '}
              {LOCATION_ADDRESS}. Tel{' '}
              <a href={`tel:${PHONE_TEL}`} className="text-white/80 hover:text-white">
                {PHONE_DISPLAY}
              </a>
              . Kom je niet, zeg het even; anders kan €20 in rekening.
            </p>
          </header>

          <ol className="mt-5 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-4">
            {steps.map((step) => (
              <li
                key={step.n}
                className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-2.5 py-3 sm:rounded-[1.5rem] sm:px-5 sm:py-4"
              >
                <p className="type-label text-white/35">{step.n}</p>
                <p className="mt-1.5 text-sm text-white sm:mt-2 sm:text-[1.15rem]">{step.t}</p>
                <p className="mt-1 hidden text-[0.95rem] leading-snug text-white/45 sm:block">
                  {step.d}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="min-w-0 overflow-x-hidden px-0 sm:px-4">
        <BookingWell className="h-[min(62svh,860px)] min-h-[22rem] w-full sm:h-[min(78svh,860px)] sm:min-h-[28rem] sm:rounded-[2rem]" />
      </div>
    </AppShell>
  )
}

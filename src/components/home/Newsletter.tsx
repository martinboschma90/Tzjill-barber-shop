import { useState, type FormEvent } from 'react'
import { buttonClass } from '@/components/ui/buttonStyles'
import { Check, Spinner } from '@/components/ui/StatusIcon'
import { site } from '@/data/site'

const STUDIO_EMAIL = site.contact[0]?.email ?? 'info@tzjill.nl'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [phase, setPhase] = useState<'idle' | 'sending' | 'done'>('idle')

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (phase !== 'idle') return
    const address = email.trim()
    setPhase('sending')
    window.setTimeout(() => {
      const href = `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(
        'Nieuwsbrief Tzjill',
      )}&body=${encodeURIComponent(`Aanmelden nieuwsbrief\nE-mail: ${address}`)}`
      window.location.href = href
      setPhase('done')
    }, 420)
  }

  return (
    <section className="text-white">
      <div className="mx-auto max-w-[1240px] px-6 section-y lg:px-8">
        <div className="rounded-[1.75rem] bg-black px-8 py-14 text-center sm:rounded-[2rem] sm:px-12 sm:py-16">
          <p className="type-label inline-flex items-center justify-center gap-2 rounded-full bg-[#efeae3] px-3.5 py-1.5 text-[#2c241c]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2c241c]" aria-hidden />
            Nieuwsbrief
          </p>
          <h2 className="type-headline mt-6">Blijf op de hoogte</h2>
          <p className="type-lead mx-auto mt-5 max-w-md text-white/55">
            Looks, drops en nieuws uit de lounge. Geen spam.
          </p>

          <form
              onSubmit={onSubmit}
              className="mx-auto mt-8 flex w-full max-w-xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
            >
              <label className="sr-only" htmlFor="newsletter-email">
                E-mail
              </label>
              <input
                id="newsletter-email"
                required
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Je e-mail"
                className="type-ui min-h-[3rem] flex-1 rounded-full border border-white/75 bg-white/5 px-6 py-3 text-center text-white outline-none placeholder:text-white/40 backdrop-blur-[2px] transition-colors focus:border-white sm:text-left"
              />
              <button
                type="submit"
                disabled={phase !== 'idle'}
                className={buttonClass({ variant: 'solid', surface: 'dark', className: 'shrink-0 disabled:opacity-70' })}
              >
                {phase === 'sending' ? <Spinner /> : phase === 'done' ? <Check /> : null}
                {phase === 'sending' ? 'Versturen' : phase === 'done' ? 'Aangemeld' : 'Aanmelden'}
                {phase === 'idle' ? (
                  <span aria-hidden className="motion-arrow">
                    →
                  </span>
                ) : null}
              </button>
            </form>
            {phase === 'done' ? (
              <p className="type-lead mx-auto mt-4 max-w-md text-white/70" role="status">
                Je mailprogramma opent met je aanmelding. Verstuur het daar — we zetten je op de lijst.
              </p>
            ) : null}
        </div>
      </div>
    </section>
  )
}

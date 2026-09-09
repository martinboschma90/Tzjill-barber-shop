import { useState, type FormEvent } from 'react'
import { site } from '@/data/site'

const STUDIO_EMAIL = site.contact[0]?.email ?? 'info@tzjill.nl'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const address = email.trim()
    const href = `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(
      'Nieuwsbrief Tzjill',
    )}&body=${encodeURIComponent(`Aanmelden nieuwsbrief\nE-mail: ${address}`)}`
    window.location.href = href
    setSent(true)
  }

  return (
    <section className="text-white">
      <div className="mx-auto max-w-[1240px] px-8 section-y sm:px-12">
        <div className="rounded-[1.75rem] bg-black px-8 py-14 text-center sm:rounded-[2rem] sm:px-12 sm:py-16">
          <p className="type-label inline-flex items-center justify-center gap-2 rounded-full bg-[#efeae3] px-3.5 py-1.5 text-[#2c241c]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2c241c]" aria-hidden />
            Nieuwsbrief
          </p>
          <h2 className="type-headline mt-6">Blijf op de hoogte</h2>
          <p className="type-lead mx-auto mt-5 max-w-md text-white/55">
            Looks, drops en nieuws uit de lounge. Geen spam.
          </p>

          {sent ? (
            <p className="type-lead mx-auto mt-8 max-w-md text-white/70">
              Je mailprogramma opent met je aanmelding. Verstuur het daar — we
              zetten je op de lijst.
            </p>
          ) : (
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
                className="type-ui group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full border border-[#efeae3] bg-[#efeae3] px-6 py-3 text-[#2c241c] transition-[color,background-color,transform] duration-300 hover:-translate-y-px hover:border-white hover:bg-white"
              >
                Aanmelden
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

import { useCms } from '@/cms/CmsContext'
import { useRef, useState, type FormEvent } from 'react'
import { buttonClass } from '@/components/ui/buttonStyles'
import { Check, Spinner } from '@/components/ui/StatusIcon'
import { submitMessage } from '@/lib/messages'



export function Newsletter() {
  const { content } = useCms()
  const [email, setEmail] = useState('')
  const sendingRef = useRef(false)
  const requestId = useRef(crypto.randomUUID())
  const [error, setError] = useState('')
  const [consent, setConsent] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'sending' | 'done'>('idle')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (sendingRef.current || phase === 'done') return
    sendingRef.current = true
    setPhase('sending')
    setError('')
    try { await submitMessage({ kind: 'newsletter', email, consent, requestId: requestId.current }); setPhase('done') }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Aanmelden mislukt.'); setPhase('idle') }
    finally { sendingRef.current = false }
  }

  if (content.site.newsletterVisible === false) return null

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
              className="mx-auto mt-8 grid w-full max-w-xl grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto]"
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
                className="type-ui min-h-[3rem] flex-1 rounded-full border border-white/75 bg-white/5 px-6 py-3 text-center text-white outline-none placeholder:text-white/65 backdrop-blur-[2px] transition-colors focus:border-white sm:text-left"
              />
              <label className="type-body order-3 flex flex-wrap items-center gap-2 text-left text-white/75 sm:col-span-2"><input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} />Ik wil de nieuwsbrief ontvangen. <a href="/privacy" className="underline">Privacy</a></label>
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
            {error ? <p role="alert" className="type-body mt-4 text-[#e8c4a8]">{error}</p> : null}
            {phase === 'done' ? (
              <p className="type-lead mx-auto mt-4 max-w-md text-white/70" role="status">
                Je aanmelding is verstuurd.
              </p>
            ) : null}
        </div>
      </div>
    </section>
  )
}

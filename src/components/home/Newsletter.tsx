import { SiteText } from '@/cms/SiteText'
import { useCms } from '@/cms/CmsContext'
import { siteText } from '@/cms/siteText'
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
    <section data-cms-section="texts-Newsletter" className="text-white">
      <div className="content-wrap section-y">
        <div className="panel-cta">
          <p className="type-label inline-flex items-center justify-center gap-2 rounded-full bg-pill-on-dark-bg px-3.5 py-1.5 text-pill-on-dark-fg">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2c241c]" aria-hidden /><SiteText textKey="Newsletter.1" /></p>
          <h2 className="type-headline mt-6"><SiteText textKey="Newsletter.2" /></h2>
          <p className="type-lead mx-auto mt-5 max-w-md text-white/55"><SiteText textKey="Newsletter.3" /></p>

          <form
              onSubmit={onSubmit}
              className="mx-auto mt-8 grid w-full max-w-xl grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto]"
            >
              <label className="sr-only" htmlFor="newsletter-email"><SiteText textKey="Newsletter.4" /></label>
              <input
                id="newsletter-email"
                required
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={siteText(content.site, 'Newsletter.placeholder')}
                className="type-ui min-h-[3rem] flex-1 rounded-full border border-white/75 bg-white/5 px-6 py-3 text-center text-white outline-none placeholder:text-white/65 backdrop-blur-[2px] transition-colors focus:border-white sm:text-left"
              />
              <label className="type-body order-3 flex flex-wrap items-center gap-2 text-left text-white/75 sm:col-span-2"><input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} /><SiteText textKey="Newsletter.5" /><a href="/privacy" className="underline"><SiteText textKey="Newsletter.6" /></a></label>
              <button
                type="submit"
                disabled={phase !== 'idle'}
                className={buttonClass({ variant: 'solid', surface: 'dark', className: 'shrink-0 disabled:opacity-70' })}
              >
                {phase === 'sending' ? <Spinner /> : phase === 'done' ? <Check /> : null}
                {phase === 'sending'
                  ? siteText(content.site, 'Newsletter.submitSending')
                  : phase === 'done'
                    ? siteText(content.site, 'Newsletter.submitDone')
                    : siteText(content.site, 'Newsletter.submitIdle')}
                {phase === 'idle' ? (
                  <span aria-hidden className="motion-arrow">
                    →
                  </span>
                ) : null}
              </button>
            </form>
            {error ? <p role="alert" className="type-body mt-4 text-[#e8c4a8]">{error}</p> : null}
            {phase === 'done' ? (
              <p className="type-lead mx-auto mt-4 max-w-md text-white/70" role="status"><SiteText textKey="Newsletter.7" /></p>
            ) : null}
        </div>
      </div>
    </section>
  )
}

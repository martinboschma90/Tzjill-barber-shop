import { SiteText } from '@/cms/SiteText'
import { useCms } from '@/cms/CmsContext'
import { siteText } from '@/cms/siteText'
import { useRef, useState, type FormEvent } from 'react'
import { buttonClass } from '@/components/ui/buttonStyles'
import { darkUnderlineFieldClass } from '@/components/ui/formStyles'
import { Check, Spinner } from '@/components/ui/StatusIcon'
import { submitMessage } from '@/lib/messages'

export function ContactForm() {
  const [name, setName] = useState('')
  const { content } = useCms()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const sendingRef = useRef(false)
  const requestId = useRef(crypto.randomUUID())
  const [error, setError] = useState('')
  const [website, setWebsite] = useState('')
  const [phase, setPhase] = useState<'idle' | 'sending' | 'done'>('idle')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (sendingRef.current || phase === 'done') return
    sendingRef.current = true
    setError('')
    setPhase('sending')
    try {
      await submitMessage({
        kind: 'contact',
        name,
        email,
        phone,
        message,
        website,
        requestId: requestId.current,
      })
      setPhase('done')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Verzenden mislukt.')
      setPhase('idle')
    } finally {
      sendingRef.current = false
    }
  }

  if (content.site.contactFormVisible === false) return null

  const submitLabel =
    phase === 'sending'
      ? siteText(content.site, 'ContactForm.submitSending')
      : phase === 'done'
        ? siteText(content.site, 'ContactForm.submitDone')
        : siteText(content.site, 'ContactForm.submitIdle')

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
      <label className="hidden" aria-hidden="true">
        Website
        <input
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </label>
      <label className="block" htmlFor="contact-name">
        <span className="type-label text-white/65">
          <SiteText textKey="ContactForm.name" />
        </span>
        <input
          id="contact-name"
          required
          name="name"
          autoComplete="name"
          value={name}
          aria-invalid={Boolean(error)}
          onChange={(e) => setName(e.target.value)}
          className={`${darkUnderlineFieldClass} mt-2`}
        />
      </label>
      <label className="block" htmlFor="contact-email">
        <span className="type-label text-white/65">
          <SiteText textKey="ContactForm.email" />
        </span>
        <input
          id="contact-email"
          required
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          aria-invalid={Boolean(error)}
          onChange={(e) => setEmail(e.target.value)}
          className={`${darkUnderlineFieldClass} mt-2`}
        />
      </label>
      <label className="block" htmlFor="contact-phone">
        <span className="type-label text-white/65">
          <SiteText textKey="ContactForm.phone" />
        </span>
        <input
          id="contact-phone"
          type="tel"
          name="phone"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={`${darkUnderlineFieldClass} mt-2`}
        />
      </label>
      <label className="block" htmlFor="contact-message">
        <span className="type-label text-white/65">
          <SiteText textKey="ContactForm.message" />
        </span>
        <textarea
          id="contact-message"
          required
          name="message"
          rows={3}
          value={message}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'contact-error' : undefined}
          onChange={(e) => setMessage(e.target.value)}
          className={`${darkUnderlineFieldClass} mt-2 resize-none`}
        />
      </label>
      {error ? (
        <p id="contact-error" role="alert" className="type-body text-[#e8c4a8]">
          {error}{' '}
          {content.site.contact[0]?.email?.trim() ? (
            <a href={`mailto:${content.site.contact[0].email.trim()}`} className="underline">
              {content.site.contact[0].email.trim()}
            </a>
          ) : null}
        </p>
      ) : null}
      <p className="type-body text-white/70">
        <SiteText textKey="ContactForm.privacy" />{' '}
        <a href="/privacy" className="underline">
          <SiteText textKey="ContactForm.privacyLink" />
        </a>
      </p>
      <button
        type="submit"
        disabled={phase !== 'idle'}
        className={buttonClass({
          variant: 'solid',
          surface: 'dark',
          className: 'mt-1 w-fit disabled:opacity-70',
        })}
      >
        {phase === 'sending' ? <Spinner /> : phase === 'done' ? <Check /> : null}
        {submitLabel}
        {phase === 'idle' ? (
          <span aria-hidden className="motion-arrow">
            →
          </span>
        ) : null}
      </button>
      {phase === 'done' ? (
        <p className="type-lead max-w-sm text-white/70" role="status">
          <SiteText textKey="ContactForm.success" />
        </p>
      ) : null}
    </form>
  )
}
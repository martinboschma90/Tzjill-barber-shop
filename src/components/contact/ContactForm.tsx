import { useCms } from '@/cms/CmsContext'
import { useRef, useState, type FormEvent } from 'react'
import { buttonClass } from '@/components/ui/buttonStyles'
import { Check, Spinner } from '@/components/ui/StatusIcon'

import { submitMessage } from '@/lib/messages'

const fieldClass =
  'w-full border-b border-white/20 bg-transparent py-2 type-body text-white outline-none transition-colors placeholder:text-white/30 focus:border-white'

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
      await submitMessage({ kind: 'contact', name, email, phone, message, website, requestId: requestId.current })
      setPhase('done')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Verzenden mislukt.')
      setPhase('idle')
    } finally { sendingRef.current = false }
  }

  if (content.site.contactFormVisible === false) return null

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
      <label className="hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
      <label className="block">
        <span className="type-label text-white/65">Naam</span>
        <input
          required
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${fieldClass} mt-2`}
        />
      </label>
      <label className="block">
        <span className="type-label text-white/65">E-mail</span>
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${fieldClass} mt-2`}
        />
      </label>
      <label className="block">
        <span className="type-label text-white/65">Telefoon</span>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={`${fieldClass} mt-2`}
        />
      </label>
      <label className="block">
        <span className="type-label text-white/65">Bericht</span>
        <textarea
          required
          name="message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${fieldClass} mt-2 resize-none`}
        />
      </label>
      {error ? <p role="alert" className="type-body text-[#e8c4a8]">{error}</p> : null}
      <p className="type-body text-white/70">We gebruiken je gegevens om op je bericht te reageren. <a href="/privacy" className="underline">Privacy</a></p>
      <button
        type="submit"
        disabled={phase !== 'idle'}
        className={buttonClass({ variant: 'solid', surface: 'dark', className: 'mt-1 w-fit disabled:opacity-70' })}
      >
        {phase === 'sending' ? <Spinner /> : phase === 'done' ? <Check /> : null}
        {phase === 'sending' ? 'Versturen' : phase === 'done' ? 'Verstuurd' : 'Verstuur'}
        {phase === 'idle' ? (
          <span aria-hidden className="motion-arrow">
            →
          </span>
        ) : null}
      </button>
      {phase === 'done' ? (
        <p className="type-lead max-w-sm text-white/70" role="status">
          Je bericht is verstuurd. We reageren zo snel mogelijk.
        </p>
      ) : null}
    </form>
  )
}

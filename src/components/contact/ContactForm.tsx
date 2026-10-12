import { useState, type FormEvent } from 'react'
import { buttonClass } from '@/components/ui/buttonStyles'
import { Check, Spinner } from '@/components/ui/StatusIcon'

const EMAIL = 'info@tzjill.nl'

const fieldClass =
  'w-full border-b border-white/20 bg-transparent py-2 type-body text-white outline-none transition-colors placeholder:text-white/30 focus:border-white'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [phase, setPhase] = useState<'idle' | 'sending' | 'done'>('idle')

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (phase !== 'idle') return
    const body = [
      `Naam: ${name.trim()}`,
      `E-mail: ${email.trim()}`,
      `Telefoon: ${phone.trim() || '—'}`,
      '',
      message.trim(),
    ].join('\n')
    setPhase('sending')
    window.setTimeout(() => {
      const href = `mailto:${EMAIL}?subject=${encodeURIComponent(
        `Contact Tzjill — ${name.trim() || 'bericht'}`,
      )}&body=${encodeURIComponent(body)}`
      window.location.href = href
      setPhase('done')
    }, 420)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
      <label className="block">
        <span className="type-label text-white/40">Naam</span>
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
        <span className="type-label text-white/40">E-mail</span>
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
        <span className="type-label text-white/40">Telefoon</span>
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
        <span className="type-label text-white/40">Bericht</span>
        <textarea
          required
          name="message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${fieldClass} mt-2 resize-none`}
        />
      </label>
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
          Je mailprogramma opent met het bericht. Verstuur het daar — we reageren zo snel mogelijk.
        </p>
      ) : null}
    </form>
  )
}

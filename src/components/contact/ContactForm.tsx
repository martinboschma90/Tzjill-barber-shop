import { useState, type FormEvent } from 'react'

const EMAIL = 'info@tzjill.nl'

const fieldClass =
  'w-full border-b border-white/20 bg-transparent py-2 type-body text-white outline-none transition-colors placeholder:text-white/30 focus:border-white'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const body = [
      `Naam: ${name.trim()}`,
      `E-mail: ${email.trim()}`,
      `Telefoon: ${phone.trim() || '—'}`,
      '',
      message.trim(),
    ].join('\n')
    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      `Contact Tzjill — ${name.trim() || 'bericht'}`,
    )}&body=${encodeURIComponent(body)}`
    window.location.href = href
    setSent(true)
  }

  if (sent) {
    return (
      <p className="type-lead max-w-sm text-white/70">
        Je mailprogramma opent met het bericht. Verstuur het daar — we reageren
        zo snel mogelijk.
      </p>
    )
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
        className="type-ui group mt-1 inline-flex w-fit items-center justify-center gap-2.5 rounded-full border border-[#efeae3] bg-[#efeae3] px-6 py-3 text-[#2c241c] transition-[color,background-color,transform] duration-300 hover:-translate-y-px hover:border-white hover:bg-white"
      >
        Verstuur
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
          →
        </span>
      </button>
    </form>
  )
}

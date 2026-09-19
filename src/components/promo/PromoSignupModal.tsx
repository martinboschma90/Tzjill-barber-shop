import { useEffect, useId, useState, type FormEvent } from 'react'
import {
  isNlMobile,
  isValidPromoEmail,
  markPromoSeen,
  promoAlreadySeen,
  submitPromoSignup,
} from '@/lib/promoSignup'

const OPEN_DELAY_MS = 1400
const PROMO_IMAGE = '/promo/10-years-tzjill.jpg'

const fieldClass =
  'mt-2 w-full rounded-full border border-white/20 bg-white/5 px-5 py-3 type-body text-white outline-none placeholder:text-white/35 transition-colors focus:border-[#efeae3]'

export function PromoSignupModal() {
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const preload = new Image()
    preload.src = PROMO_IMAGE
  }, [])

  useEffect(() => {
    if (promoAlreadySeen()) return
    const id = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss('dismissed')
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  function dismiss(state: 'dismissed' | 'submitted') {
    markPromoSeen(state)
    setOpen(false)
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const nextName = name.trim()
    const nextEmail = email.trim()
    const nextPhone = phone.trim()
    if (nextName.length < 2) {
      setError('Vul je naam in.')
      return
    }
    if (!isValidPromoEmail(nextEmail)) {
      setError('Vul een geldig e-mailadres in.')
      return
    }
    if (!isNlMobile(nextPhone)) {
      setError('Vul een 06-nummer in.')
      return
    }
    setError('')
    setSending(true)
    const result = await submitPromoSignup({
      name: nextName,
      email: nextEmail,
      phone: nextPhone,
    })
    setSending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSent(true)
    markPromoSeen('submitted')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Sluiten"
        className="absolute inset-0 bg-[#1c1b19]/88 backdrop-blur-sm"
        onClick={() => dismiss('dismissed')}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] flex max-h-[min(92svh,880px)] w-full max-w-[26rem] flex-col overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#141210] text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:max-w-[44rem] sm:flex-row sm:rounded-[2rem]"
      >
        <div className="relative h-[min(26svh,13.5rem)] shrink-0 overflow-hidden bg-black sm:h-auto sm:w-[46%]">
          <img
            src={PROMO_IMAGE}
            alt="10 jaar Tzjill, 2016–2026"
            width={1080}
            height={1356}
            className="h-full w-full object-cover object-[center_42%]"
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-5 sm:px-8 sm:py-8">
          <button
            type="button"
            onClick={() => dismiss('dismissed')}
            className="type-ui absolute right-3 top-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white hover:bg-white hover:text-[#2c241c] sm:right-5 sm:top-5"
            aria-label="Popup sluiten"
          >
            ×
          </button>

          <p className="type-label mt-1 inline-flex items-center gap-2 pr-12 text-[#efeae3]/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c4a574]" aria-hidden />
            10 jaar Tzjill
          </p>
          <h2
            id={titleId}
            className="type-headline mt-2.5 text-[1.65rem] leading-[0.95] sm:text-[2rem]"
          >
            Meld je aan
            <br />
            voor te gekke
            <br />
            prijzen
          </h2>
          <p className="type-lead mt-3 text-[0.92rem] text-white/55">
            2016–2026. Winacties en cadeaus volgen dit jubileumjaar — laat je
            gegevens achter en je hoort het als eerste.
          </p>

          {sent ? (
            <p className="type-lead mt-8 text-white/75">
              Staat. We mailen je als er iets te pakken valt.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:mt-6 sm:gap-3.5">
              <label className="block">
                <span className="type-label text-white/40">Naam</span>
                <input
                  required
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldClass}
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
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="type-label text-white/40">06</span>
                <input
                  required
                  type="tel"
                  name="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  pattern="(\+31|0)\s*6[\s-]*(\d[\s-]*){8}"
                  title="Vul een 06-nummer in"
                  placeholder="06 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={fieldClass}
                />
              </label>
              {error ? (
                <p className="type-body text-[0.85rem] text-[#e8c4a8]" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={sending}
                className="type-ui mt-1 inline-flex min-h-[3rem] items-center justify-center rounded-full border border-[#efeae3] bg-[#efeae3] px-6 py-3 text-[#2c241c] transition-[color,background-color,transform] duration-300 hover:-translate-y-px hover:border-white hover:bg-white disabled:pointer-events-none disabled:opacity-60"
              >
                {sending ? 'Even geduld…' : 'Aanmelden'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

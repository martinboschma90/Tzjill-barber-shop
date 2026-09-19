import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { openSalonhub } from '@/lib/salonhub'

type StickyContactBarProps = {
  hidden?: boolean
}

export function StickyContactBar({ hidden = false }: StickyContactBarProps) {
  const { pathname } = useLocation()
  const [faqOpen, setFaqOpen] = useState(false)
  const [footerNear, setFooterNear] = useState(false)

  useEffect(() => {
    const sync = () =>
      setFaqOpen(Boolean(document.querySelector('[data-faq-open]')))
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-faq-open'],
    })
    return () => observer.disconnect()
  }, [pathname])

  useEffect(() => {
    const target =
      document.querySelector('footer') ??
      document.querySelector('[data-footer-boundary]')
    if (!target || !window.IntersectionObserver) {
      setFooterNear(false)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setFooterNear(entry.isIntersecting),
      { rootMargin: '80px 0px 0px 0px', threshold: 0 },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [pathname])

  if (
    hidden ||
    footerNear ||
    pathname === '/booking' ||
    pathname === '/faq' ||
    faqOpen
  ) {
    return null
  }

  return (
    <button
      type="button"
      onClick={() => openSalonhub()}
      data-sticky-afspraak
      className="type-ui group fixed bottom-5 right-4 z-[55] inline-flex items-center gap-2 rounded-full border border-[#f6f3ee] bg-[#f6f3ee] px-5 py-3 text-[#3a2f28] transition-[color,background-color,transform] duration-300 hover:-translate-y-px hover:bg-white sm:bottom-6 sm:right-6"
    >
      Afspraak
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
        →
      </span>
    </button>
  )
}

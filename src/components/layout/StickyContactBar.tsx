import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { openSalonhub } from '@/lib/salonhub'
import { PHONE_TEL } from '@/data/site'

type StickyContactBarProps = {
  hidden?: boolean
}

export function StickyContactBar({ hidden = false }: StickyContactBarProps) {
  const { pathname } = useLocation()
  const [faqOpen, setFaqOpen] = useState(false)
  const [footerNear, setFooterNear] = useState(false)
  const [pastHero, setPastHero] = useState(() => {
    if (typeof window === 'undefined' || pathname !== '/') return true
    return !window.matchMedia('(max-width: 1023px)').matches
  })

  useEffect(() => {
    const sync = () => setFaqOpen(Boolean(document.querySelector('[data-faq-open]')))
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
    const mobile = window.matchMedia('(max-width: 1023px)')
    const hero = document.querySelector('[data-home-hero]')

    const update = () => {
      if (!mobile.matches || !hero) {
        setPastHero(true)
        return
      }
      setPastHero(hero.getBoundingClientRect().bottom <= 8)
    }

    update()
    mobile.addEventListener('change', update)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      mobile.removeEventListener('change', update)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [pathname])

  useEffect(() => {
    if (!window.IntersectionObserver) {
      setFooterNear(false)
      return
    }
    let observer: IntersectionObserver | null = null
    const observe = () => {
      const target =
        document.querySelector('footer') ?? document.querySelector('[data-footer-boundary]')
      if (!target) {
        setFooterNear(false)
        return
      }
      observer?.disconnect()
      observer = new IntersectionObserver(
        ([entry]) => setFooterNear(entry.isIntersecting),
        { rootMargin: '0px 0px 72px 0px', threshold: 0 },
      )
      observer.observe(target)
    }
    observe()
    const footerReady = new MutationObserver(() => {
      if (!document.querySelector('footer')) return
      observe()
      footerReady.disconnect()
    })
    footerReady.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer?.disconnect()
      footerReady.disconnect()
    }
  }, [pathname])

  if (hidden || footerNear || !pastHero || pathname === '/booking' || pathname === '/faq' || faqOpen) {
    return null
  }

  return (
    <div
      data-sticky-afspraak
      className="fixed inset-x-0 bottom-0 z-[55] border-t border-white/10 bg-[#1c1b19] lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid h-16 grid-cols-2">
        <button
          type="button"
          onClick={() => openSalonhub()}
          className="type-ui min-h-11 border-r border-white/10 text-[#f6f3ee]"
        >
          Afspraak
        </button>
        <a href={`tel:${PHONE_TEL}`} className="type-ui flex min-h-11 items-center justify-center text-[#f6f3ee]">
          Bellen
        </a>
      </div>
    </div>
  )
}

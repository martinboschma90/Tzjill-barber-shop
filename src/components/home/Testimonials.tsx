import { SiteText } from '@/cms/SiteText'
import { useCallback, useState } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { useCms } from '@/cms/CmsContext'
import type { SiteContent } from '@/cms/content'

const cardClass =
  'flex h-full min-h-[16.5rem] flex-col justify-between radius-media bg-cream-soft px-7 py-7 text-left text-ink sm:min-h-[18rem] sm:px-8 sm:py-8'

function ReviewStars({ stars }: { stars: number }) {
  const count = Math.min(5, Math.max(1, stars || 5))
  return (
    <p className="type-label tracking-wide text-[#2c241c]/55" aria-label={`${count} van 5 sterren`}>
      <span aria-hidden>{'★'.repeat(count)}</span>
      <span className="text-[#2c241c]/25" aria-hidden>
        {'☆'.repeat(5 - count)}
      </span>
    </p>
  )
}

function ReviewCard({ item }: { item: SiteContent['reviews'][number] }) {
  return (
  <>
    <div className="space-y-4">
      <ReviewStars stars={item.stars} />
      <p className="type-lead text-[1.15rem] leading-snug">“{item.quote}”</p>
    </div>
    <div className="mt-8 flex items-center gap-3">
      {item.image ? <img
        src={item.image}
        alt=""
        className="h-12 w-12 shrink-0 rounded-full object-cover"
        draggable={false}
      /> : null}
      <div>
        <p className="type-ui">{item.name}</p>
        <p className="type-label mt-0.5 text-[#2c241c]/70">
          {[item.role, item.source].filter(Boolean).join(' · ')}
        </p>
      </div>
    </div>
  </>
  )
}

export function Testimonials() {
  const {content: {site}} = useCms()
  const reviews = site.reviews.filter(r => r.quote.trim())
  const count = reviews.length
  const [active, setActive] = useState(0)

  const go = useCallback((dir: -1 | 1) => {
    setActive((current) => count ? (current + dir + count) % count : 0)
  }, [count])

  if (!site.reviewsVisible || !count) return null
  const current = reviews[active % count]

  return (
    <section data-cms-section="reviews" className="section-y text-white">
      <div className="content-wrap">
        <div className="mx-auto max-w-3xl text-center">
            <p
              data-cms-section="reviews"
              className="type-label inline-flex items-center justify-center gap-2 text-white/65"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/55" aria-hidden /><SiteText textKey="Testimonials.1" /></p>
            <Reveal>
              <h2 className="type-headline mt-5">
                {site.reviewsTitle}
              </h2>
            </Reveal>
            <p className="type-lead mx-auto mt-5 max-w-lg text-white/55">
              {site.reviewsIntro}
            </p>
          </div>

        <div className="mt-14 sm:hidden">
          <article data-cms-section="reviews" className={cardClass} aria-live="polite">
            <ReviewCard item={current} />
          </article>
          <div className="mt-6 flex justify-center gap-2">
            <NavButton label="Vorige" dir="left" onClick={() => go(-1)} />
            <NavButton label="Volgende" dir="right" onClick={() => go(1)} />
          </div>
        </div>

        <ul className="mt-14 hidden gap-5 sm:grid sm:grid-cols-3">
          {reviews.map((item, index) => (
            <li key={index}>
              <Reveal delay={index * 0.08} className="h-full">
                <article data-cms-section="reviews" className={cardClass}>
                  <ReviewCard item={item} />
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function NavButton({
  label,
  onClick,
  dir,
}: {
  label: string
  onClick: () => void
  dir: 'left' | 'right'
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors duration-300 hover:border-white hover:bg-white hover:text-[#2c241c]"
    >
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden
      >
        {dir === 'left' ? (
          <path d="M12 5 7 10l5 5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="m8 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  )
}

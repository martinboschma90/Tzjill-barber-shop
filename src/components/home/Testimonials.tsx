import { useCallback, useState } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { reviews } from '@/data/reviews'

const COUNT = reviews.length

function wrap(index: number) {
  return ((index % COUNT) + COUNT) % COUNT
}

const cardClass =
  'flex h-full min-h-[16.5rem] flex-col justify-between rounded-[1.75rem] bg-[#efeae3] px-7 py-7 text-left text-[#2c241c] sm:min-h-[18rem] sm:rounded-[2rem] sm:px-8 sm:py-8'

function ReviewCard({ item }: { item: (typeof reviews)[number] }) {
  return (
    <>
      <p className="type-lead text-[1.15rem] leading-snug">“{item.quote}”</p>
      <div className="mt-8 flex items-center gap-3">
        <img
          src={item.image}
          alt=""
          className="h-12 w-12 shrink-0 rounded-full object-cover"
          draggable={false}
        />
        <div>
          <p className="type-ui">{item.name}</p>
          <p className="type-label mt-0.5 text-[#2c241c]/45">{item.role}</p>
        </div>
      </div>
    </>
  )
}

export function Testimonials() {
  const [active, setActive] = useState(0)

  const go = useCallback((dir: -1 | 1) => {
    setActive((current) => wrap(current + dir))
  }, [])

  const current = reviews[active]

  return (
    <section className="section-y text-white">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
            <p className="type-label inline-flex items-center justify-center gap-2 text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-white/55" aria-hidden />
              Reviews
            </p>
            <Reveal>
              <h2 className="type-headline mt-5">
                Wat klanten
                <br />
                zeggen
              </h2>
            </Reveal>
            <p className="type-lead mx-auto mt-5 max-w-lg text-white/55">
              Niet van ons — van mannen uit de stoel.
            </p>
          </div>

        <div className="mt-14 sm:hidden">
          <article className={cardClass} aria-live="polite">
            <ReviewCard item={current} />
          </article>
          <div className="mt-6 flex justify-center gap-2">
            <NavButton label="Vorige" dir="left" onClick={() => go(-1)} />
            <NavButton label="Volgende" dir="right" onClick={() => go(1)} />
          </div>
        </div>

        <ul className="mt-14 hidden gap-5 sm:grid sm:grid-cols-3">
          {reviews.map((item, index) => (
            <li key={item.name}>
              <Reveal delay={index * 0.08} className="h-full">
                <article className={cardClass}>
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

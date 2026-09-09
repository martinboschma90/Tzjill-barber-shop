import { useCallback, useRef, useState, type PointerEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { reviews } from '@/data/reviews'

const COUNT = reviews.length

function wrap(index: number) {
  return ((index % COUNT) + COUNT) % COUNT
}

function shortestOffset(index: number, active: number) {
  let delta = index - active
  if (delta > COUNT / 2) delta -= COUNT
  if (delta < -COUNT / 2) delta += COUNT
  return delta
}

function ReviewCard({ item }: { item: (typeof reviews)[number] }) {
  return (
    <>
      <p className="type-lead text-[1.15rem] leading-snug">“{item.quote}”</p>
      <div className="mt-8 flex items-center gap-3">
        <img
          src={item.image}
          alt=""
          className="h-12 w-12 rounded-full object-cover"
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
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const drag = useRef<{ x: number } | null>(null)

  const go = useCallback((dir: -1 | 1) => {
    setActive((current) => wrap(current + dir))
  }, [])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    drag.current = { x: event.clientX }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const dx = event.clientX - drag.current.x
    drag.current = null
    if (Math.abs(dx) < 40) return
    go(dx < 0 ? 1 : -1)
  }

  return (
    <section className="section-y overflow-hidden text-white">
      <div className="mx-auto max-w-[1240px] px-8 sm:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="type-label inline-flex items-center justify-center gap-2 text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-white/55" aria-hidden />
            Reviews
          </p>
          <h2 className="type-headline mt-5">
            Wat klanten
            <br />
            zeggen
          </h2>
          <p className="type-lead mx-auto mt-5 max-w-lg text-white/55">
            Niet van ons — van mannen uit de stoel.
          </p>
        </div>
      </div>

      <div
        className="relative mt-14 cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null
        }}
      >
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Reviews"
          className="wf-ig-mask relative mx-auto h-[22rem] w-full overflow-hidden sm:h-[24rem]"
        >
          {reviews.map((item, index) => {
            const offset = shortestOffset(index, active)
            const abs = Math.abs(offset)
            if (abs > 2) return null
            const isCenter = offset === 0
            const scale = isCenter ? 1.04 : Math.max(0.82, 0.94 - abs * 0.1)
            const x = offset * 22
            return (
              <button
                key={item.name}
                type="button"
                aria-current={isCenter ? 'true' : undefined}
                onClick={() => setActive(index)}
                className="absolute left-1/2 top-1/2 flex min-h-[16.5rem] w-[min(78vw,340px)] origin-center flex-col justify-between rounded-[1.75rem] bg-[#efeae3] px-7 py-7 text-left text-[#2c241c] sm:min-h-[18rem] sm:rounded-[2rem] sm:px-8 sm:py-8"
                style={{
                  transform: `translate(-50%, -50%) translateX(${x}rem) scale(${scale})`,
                  zIndex: 20 - abs,
                  opacity: isCenter ? 1 : 0.72,
                  transition: reduce
                    ? 'none'
                    : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease',
                }}
              >
                <ReviewCard item={item} />
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex justify-center gap-2">
          <NavButton label="Vorige" dir="left" onClick={() => go(-1)} />
          <NavButton label="Volgende" dir="right" onClick={() => go(1)} />
        </div>
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

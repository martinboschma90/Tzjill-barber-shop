import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { lookbookImages } from '@/data/lookbook'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/data/site'

const slides = lookbookImages
const COUNT = slides.length

function wrap(index: number) {
  return ((index % COUNT) + COUNT) % COUNT
}

function shortestOffset(index: number, active: number) {
  let delta = index - active
  if (delta > COUNT / 2) delta -= COUNT
  if (delta < -COUNT / 2) delta += COUNT
  return delta
}

export function InstagramFeed() {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const drag = useRef<{ x: number } | null>(null)

  const go = useCallback((dir: -1 | 1) => {
    setActive((current) => wrap(current + dir))
  }, [])

  useEffect(() => {
    if (reduce || paused) return
    const id = window.setInterval(() => go(1), 4200)
    return () => window.clearInterval(id)
  }, [go, paused, reduce])

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
            Instagram
          </p>
          <h2 className="type-headline mt-5">
            Looks van
            <br />
            de stoel
          </h2>
          <p className="type-lead mx-auto mt-5 max-w-lg text-white/55">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              {INSTAGRAM_HANDLE} →
            </a>
          </p>
        </div>
      </div>

      <div
        className="relative mt-8 cursor-grab active:cursor-grabbing sm:mt-10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null
        }}
      >
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Instagram"
          className="relative mx-auto h-[min(96vw,46rem)] w-full overflow-hidden"
        >
          {slides.map((image, index) => {
            const offset = shortestOffset(index, active)
            const abs = Math.abs(offset)
            if (abs > 2) return null
            const isCenter = offset === 0
            const scale = isCenter ? 1 : Math.max(0.72, 0.92 - abs * 0.1)
            const x = offset * 20.5
            return (
              <a
                key={image.src}
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                aria-current={isCenter ? 'true' : undefined}
                onClick={(event) => {
                  if (isCenter) return
                  event.preventDefault()
                  setActive(index)
                }}
                className="absolute left-1/2 top-1/2 block origin-center overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem]"
                style={{
                  width: 'min(78vw, 380px)',
                  aspectRatio: '3 / 4',
                  transform: `translate(-50%, -50%) translateX(${x}rem) scale(${scale})`,
                  zIndex: 20 - abs,
                  opacity: isCenter ? 1 : 0.92,
                  transition: reduce
                    ? 'none'
                    : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease',
                }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
                {isCenter ? (
                  <span className="absolute bottom-3 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                    <InstagramMark />
                  </span>
                ) : null}
              </a>
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

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.6" cy="7.4" r="0.9" fill="currentColor" />
    </svg>
  )
}

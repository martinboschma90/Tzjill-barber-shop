import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react'
import type { ShopCollab } from '@/cms/content'
import { collabVideoUrl } from '@/cms/content'
import { CollabMedia } from '@/components/collabs/CollabMedia'

export function CollabCaption({
  item,
  compact = false,
}: {
  item: ShopCollab
  compact?: boolean
}) {
  return (
    <>
      <p className="type-label text-white/40">{item.year}</p>
      <h2 className={`type-subhead ${compact ? 'mt-2' : 'mt-3'}`}>{item.name}</h2>
      <p
        className={`type-lead max-w-md text-white/55 ${compact ? 'mt-3' : 'mt-4'}`}
      >
        {item.text}
      </p>
    </>
  )
}

type CollabsCarouselProps = {
  items: ShopCollab[]
  fallbackVideo: string
}

export function CollabsCarousel({ items, fallbackVideo }: CollabsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    scrollLeft: number
  } | null>(null)
  const [active, setActive] = useState(0)

  const syncActive = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const cards = Array.from(track.children) as HTMLElement[]
    if (cards.length === 0) return
    const marker = track.scrollLeft + track.clientWidth * 0.38
    let best = 0
    let bestDist = Number.POSITIVE_INFINITY
    cards.forEach((card, index) => {
      const dist = Math.abs(card.offsetLeft - marker)
      if (dist < bestDist) {
        bestDist = dist
        best = index
      }
    })
    setActive(best)
  }, [])

  const scrollTo = useCallback((index: number) => {
    const track = trackRef.current
    const card = track?.children[index]
    if (!track || !(card instanceof HTMLElement)) return
    const pad = Number.parseFloat(getComputedStyle(track).paddingLeft) || 0
    track.scrollTo({ left: card.offsetLeft - pad, behavior: 'smooth' })
  }, [])

  const step = useCallback(
    (direction: -1 | 1) => {
      const next = Math.min(items.length - 1, Math.max(0, active + direction))
      scrollTo(next)
    },
    [active, items.length, scrollTo],
  )

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    syncActive()
    track.addEventListener('scroll', syncActive, { passive: true })
    return () => track.removeEventListener('scroll', syncActive)
  }, [syncActive, items.length])

  if (items.length === 0) return null

  return (
    <div className="mt-8 pb-24 lg:hidden sm:mt-12">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Collabs"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            step(1)
          }
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            step(-1)
          }
        }}
        className="-mx-8 outline-none sm:-mx-12"
      >
        <p className="sr-only">
          Veeg horizontaal of gebruik de pijltjestoetsen om tussen collabs te
          wisselen.
        </p>
        <div
          ref={trackRef}
          className="flex items-start snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-8 pb-1 pt-1 scroll-px-8 touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] sm:gap-5 sm:px-12 sm:scroll-px-12 [&::-webkit-scrollbar]:hidden"
          onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
            if (event.pointerType !== 'mouse' || event.button !== 0) return
            dragRef.current = {
              pointerId: event.pointerId,
              startX: event.clientX,
              scrollLeft: event.currentTarget.scrollLeft,
            }
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
            const drag = dragRef.current
            if (!drag || drag.pointerId !== event.pointerId) return
            event.currentTarget.scrollLeft =
              drag.scrollLeft - (event.clientX - drag.startX)
          }}
          onPointerUp={(event: PointerEvent<HTMLDivElement>) => {
            if (dragRef.current?.pointerId !== event.pointerId) return
            dragRef.current = null
            event.currentTarget.releasePointerCapture(event.pointerId)
            const track = event.currentTarget
            const cards = Array.from(track.children) as HTMLElement[]
            const marker = track.scrollLeft + track.clientWidth * 0.38
            let best = 0
            let bestDist = Number.POSITIVE_INFINITY
            cards.forEach((card, index) => {
              const dist = Math.abs(card.offsetLeft - marker)
              if (dist < bestDist) {
                bestDist = dist
                best = index
              }
            })
            const pad = Number.parseFloat(getComputedStyle(track).paddingLeft) || 0
            const card = cards[best]
            if (card) track.scrollTo({ left: card.offsetLeft - pad, behavior: 'smooth' })
          }}
          onPointerCancel={() => {
            dragRef.current = null
          }}
        >
          {items.map((item, index) => (
            <article
              key={`${item.name}-${index}`}
              aria-roledescription="slide"
              aria-label={`${item.name}, ${index + 1} van ${items.length}`}
              aria-current={index === active ? 'true' : undefined}
              className="w-[calc(100vw-5rem)] shrink-0 snap-start sm:w-[min(64vw,24rem)]"
            >
              {/* One swipe unit: this collab's video and its copy move together. */}
              <div className="overflow-hidden rounded-[1.75rem] bg-[#141210] ring-1 ring-white/10 sm:rounded-[2rem]">
                <CollabMedia
                  image={item.image}
                  video={collabVideoUrl(item, fallbackVideo)}
                  priority={index === 0}
                  frame="carousel"
                  embedded
                />
                <div className="px-5 pb-5 pt-4">
                  <CollabCaption item={item} compact />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {items.length > 1 ? (
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {items.map((item, index) => (
              <button
                key={`${item.name}-dot-${index}`}
                type="button"
                aria-label={`Ga naar ${item.name}`}
                onClick={() => scrollTo(index)}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                  index === active
                    ? 'w-7 bg-[#efeae3]'
                    : 'w-1.5 bg-white/25 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
          <div className="hidden gap-2 sm:flex">
            <CarouselButton
              label="Vorige collab"
              direction="left"
              disabled={active === 0}
              onClick={() => step(-1)}
            />
            <CarouselButton
              label="Volgende collab"
              direction="right"
              disabled={active === items.length - 1}
              onClick={() => step(1)}
            />
          </div>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {items[active]
          ? `${active + 1} van ${items.length}: ${items[active].name}`
          : null}
      </p>
    </div>
  )
}

function CarouselButton({
  label,
  onClick,
  direction,
  disabled,
}: {
  label: string
  onClick: () => void
  direction: 'left' | 'right'
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors duration-300 hover:border-white hover:bg-white hover:text-[#2c241c] disabled:pointer-events-none disabled:opacity-30"
    >
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden
      >
        {direction === 'left' ? (
          <path d="M12 5 7 10l5 5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="m8 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  )
}

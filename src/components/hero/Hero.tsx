import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Reveal } from '@/components/motion/Reveal'
import { useCms } from '@/cms/CmsContext'
import { useResolvedMediaUrl } from '@/cms/media/useResolvedMediaUrl'
import { feedFrameClass, HERO_POSTER, HERO_POSTER_AVIF, HERO_POSTER_WEBP } from '@/data/feed'

const FALLBACK_POSTER = HERO_POSTER
const FALLBACK_VIDEO = '/brand/hero.mp4'
/** Bundled film is 720×1280 at ~615 kb/s. Full-bleed cover on a desktop hero upscales it about 2.7×. */
const DESKTOP_MEDIA_QUERY = '(min-width: 768px)'

function isDirectVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url) || url.startsWith('blob:')
}

function isStockPoster(url: string) {
  return url === HERO_POSTER || url.endsWith('/feed/DSC00064.jpg')
}

function isBundledHeroFilm(url: string) {
  return url === FALLBACK_VIDEO || url.endsWith('/brand/hero.mp4')
}

export function Hero() {
  const { content } = useCms()
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const poster = useResolvedMediaUrl(
    content.site.homeHeroImageUrl,
    FALLBACK_POSTER,
  )
  const video = useResolvedMediaUrl(
    content.site.homeHeroVideoUrl,
    FALLBACK_VIDEO,
  )
  const posterSrc = poster || FALLBACK_POSTER
  const videoSrc = video || FALLBACK_VIDEO
  const playVideo = isDirectVideo(videoSrc)
  const stockPoster = isStockPoster(posterSrc)
  const [desktop, setDesktop] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_MEDIA_QUERY).matches,
  )

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MEDIA_QUERY)
    const sync = () => setDesktop(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  // The bundled portrait film cannot fill a desktop hero without upscaling.
  // Phones are close to its native size, so the film stays there.
  const showBundledFilm = playVideo && isBundledHeroFilm(videoSrc) && !desktop
  const showCustomFilm = playVideo && !isBundledHeroFilm(videoSrc)
  const showFilm = showBundledFilm || showCustomFilm

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '16%'])

  useEffect(() => {
    const el = videoRef.current
    if (!el || !showFilm) return
    el.muted = true
    void el.play().catch(() => {})
  }, [videoSrc, showFilm])

  return (
    <section
      ref={sectionRef}
      className="full-bleed-hero"
      data-home-hero
      aria-label="Hero"
    >
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-none"
        style={{ backgroundColor: '#1c1612', y: mediaY }}
      >
        <div className="absolute inset-0">
          {stockPoster ? (
            <picture className="absolute inset-0 block h-full w-full">
              <source media={DESKTOP_MEDIA_QUERY} srcSet={HERO_POSTER_AVIF} type="image/avif" />
              <source media={DESKTOP_MEDIA_QUERY} srcSet={HERO_POSTER_WEBP} type="image/webp" />
              <img
                src={posterSrc}
                alt=""
                className="h-full w-full object-cover object-[center_28%]"
              />
            </picture>
          ) : (
            <img
              src={posterSrc}
              alt=""
              className={`absolute inset-0 h-full w-full ${
                playVideo ? 'object-cover object-[center_28%]' : feedFrameClass
              }`}
            />
          )}
          {showFilm ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
              src={videoSrc}
              poster={posterSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              controls={false}
              disablePictureInPicture
            />
          ) : null}
        </div>
      </motion.div>

      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom_left,transparent,rgb(0_0_0/0.6))]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-[1600px] flex-col justify-end px-8 pb-10 pt-28 sm:px-12 sm:pb-14 lg:px-16">
        <div className="max-w-4xl">
          <Reveal variant="clip" trigger="load" delay={0.08}>
            <p className="type-label text-white/70">Tzjill Barber & Lounge · Leeuwarden</p>
          </Reveal>
          <Reveal variant="clip" trigger="load" delay={0.18} className="mt-5">
            <h1 className="type-display text-white">
              A man’s
              <br />
              world.
            </h1>
          </Reveal>
          <Reveal trigger="load" delay={0.38}>
            <p className="type-lead mt-6 max-w-[16rem] text-white/70">
              Trendy haircuts. Hot towel straight razor. Elke coupe op maat.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

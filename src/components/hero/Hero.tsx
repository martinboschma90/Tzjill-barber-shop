import { useEffect, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Reveal } from '@/components/motion/Reveal'
import { useCms } from '@/cms/CmsContext'
import { useResolvedMediaUrl } from '@/cms/media/useResolvedMediaUrl'

const FALLBACK_POSTER = '/brand/hero.jpg'
const FALLBACK_VIDEO = '/brand/hero.mp4'

function isDirectVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url) || url.startsWith('blob:')
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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '16%'])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.muted = true
    void el.play().catch(() => {})
  }, [videoSrc, playVideo])

  return (
    <section
      ref={sectionRef}
      className="full-bleed-hero"
      aria-label="Hero"
    >
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-none"
        style={{ backgroundColor: '#1c1612', y: mediaY }}
      >
        <div
          className={`absolute inset-0 ${reduce ? 'scale-105' : 'wf-hero-zoom'}`}
        >
          {playVideo ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full min-h-full min-w-full object-cover"
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
          ) : (
            <img
              src={posterSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
      </motion.div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-[#2c241c]/10 to-[#1a1612]/70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"
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

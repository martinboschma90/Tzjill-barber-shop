import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Reveal } from '@/components/motion/Reveal'
import { useCms } from '@/cms/CmsContext'
import { useResolvedMediaUrl } from '@/cms/media/useResolvedMediaUrl'
import { feedFrameClass, HERO_POSTER } from '@/data/feed'

const FALLBACK_POSTER = HERO_POSTER
const FALLBACK_VIDEO = '/brand/hero.mp4'

function isDirectVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url) || url.startsWith('blob:')
}

function videoMimeType(url: string) {
  if (/\.webm(\?|#|$)/i.test(url)) return 'video/webm'
  if (/\.(mov|m4v)(\?|#|$)/i.test(url)) return 'video/quicktime'
  return 'video/mp4'
}

export function Hero() {
  const { content } = useCms()
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)
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
  const videoType = videoMimeType(videoSrc)

  const setVideoRef = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element
    if (!element) {
      setVideoReady(false)
      return
    }

    // Safari evaluates autoplay as soon as a source is attached. Set both the
    // property and attributes before rendering the <source> child below.
    element.muted = true
    element.defaultMuted = true
    element.volume = 0
    element.setAttribute('muted', '')
    element.setAttribute('playsinline', '')
    element.setAttribute('webkit-playsinline', '')
    setVideoReady(true)
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '16%'])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const play = () => {
      el.muted = true
      el.defaultMuted = true
      el.volume = 0
      // Safari checks these attributes before it grants muted inline autoplay.
      el.setAttribute('muted', '')
      el.setAttribute('playsinline', '')
      el.setAttribute('webkit-playsinline', '')
      void el.play().catch(() => {
        // Safari can defer its autoplay decision until media metadata has loaded.
        // Retrying on media events keeps the hero silent and inline.
      })
    }

    const onVisibilityChange = () => {
      if (!document.hidden) play()
    }

    play()
    const retryId = window.setTimeout(play, 250)
    el.addEventListener('loadedmetadata', play)
    el.addEventListener('loadeddata', play)
    el.addEventListener('canplay', play)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.clearTimeout(retryId)
      el.removeEventListener('loadedmetadata', play)
      el.removeEventListener('loadeddata', play)
      el.removeEventListener('canplay', play)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
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
              ref={setVideoRef}
              className="absolute inset-0 h-full w-full min-h-full min-w-full object-cover"
              poster={posterSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
            >
              {videoReady && <source src={videoSrc} type={videoType} />}
            </video>
          ) : (
            <img
              src={posterSrc}
              alt=""
              className={`absolute inset-0 h-full w-full ${feedFrameClass}`}
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

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { BookButton } from '@/components/booking/BookButton'
import { OptimizedImg } from '@/components/ui/OptimizedImg'
import { Reveal } from '@/components/motion/Reveal'
import { SiteText } from '@/cms/SiteText'
import { useCms } from '@/cms/CmsContext'
import { useResolvedMediaUrl } from '@/cms/media/useResolvedMediaUrl'
import { feedFrameClass, HERO_POSTER, HERO_POSTER_AVIF, HERO_POSTER_WEBP } from '@/data/feed'

const DESKTOP_MEDIA_QUERY = '(min-width: 768px)'
function isDirectVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url) || url.startsWith('blob:')
}

function isStockPoster(url: string) {
  return url === HERO_POSTER || url.endsWith('/feed/DSC00064.jpg')
}

export function Hero() {
  const { content } = useCms()
  const reduce = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const posterField = content.site.homeHeroImageUrl?.trim() ?? ''
  const videoField = content.site.homeHeroVideoUrl?.trim() ?? ''
  const poster = useResolvedMediaUrl(posterField || null)
  const video = useResolvedMediaUrl(videoField || null)
  const posterSrc = poster
  const videoSrc = video
  const playVideo = isDirectVideo(videoSrc)
  const stockPoster = isStockPoster(posterSrc)
  const showFilm = playVideo && !reduce

  useEffect(() => {
    const el = videoRef.current
    if (!el || !showFilm) return
    el.muted = true
    void el.play().catch(() => {})
  }, [videoSrc, showFilm])

  return (
    <section data-cms-section="hero" className="full-bleed-hero" data-home-hero aria-label="Hero">
      <div className="absolute inset-0 overflow-hidden rounded-none" style={{ backgroundColor: '#1c1612' }}>
        <div className="absolute inset-0">
          {stockPoster ? (
            <picture className="absolute inset-0 block h-full w-full">
              <source media={DESKTOP_MEDIA_QUERY} srcSet={HERO_POSTER_AVIF} type="image/avif" />
              <source media={DESKTOP_MEDIA_QUERY} srcSet={HERO_POSTER_WEBP} type="image/webp" />
              <img
                src={posterSrc}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                alt=""
                className="h-full w-full object-cover object-[center_28%]"
              />
            </picture>
          ) : (
            <OptimizedImg
              priority
              size="full"
              srcSetSizes={['card', 'hero', 'full']}
              sizes="100vw"
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
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom_left,transparent,rgb(0_0_0/0.6))]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-[1600px] flex-col justify-end px-8 pb-10 pt-28 sm:px-12 sm:pb-14 lg:px-16">
        <div className="max-w-4xl">
          {content.site.fullName.trim() ? (
            <p className="type-label text-white/70">
              {content.site.fullName.trim()}
              <SiteText textKey="Hero.locationSuffix" />
            </p>
          ) : null}
          {content.site.homeHeroTitle.trim() ? (
            <Reveal trigger="load">
              <h1 className="type-display mt-5 whitespace-pre-line text-white">
                {content.site.homeHeroTitle}
              </h1>
            </Reveal>
          ) : null}
          {content.site.homeHeroSubtitle.trim() ? (
            <p className="type-lead mt-6 max-w-[16rem] text-white/70">
              {content.site.homeHeroSubtitle}
            </p>
          ) : null}
          <div className="pointer-events-auto mt-8">
            <BookButton surface="dark">
              <SiteText textKey="Hero.cta" />
            </BookButton>
          </div>
        </div>
      </div>
    </section>
  )
}

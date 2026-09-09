import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '@/components/motion/Reveal'
import { MediaReveal } from '@/components/motion/MediaReveal'
import { Parallax } from '@/components/motion/Parallax'
import { useCms } from '@/cms/CmsContext'
import { useResolvedMediaUrl } from '@/cms/media/useResolvedMediaUrl'

const FALLBACK_POSTER = '/brand/hero.jpg'
const FALLBACK_VIDEO = '/brand/hero.mp4'

function isDirectVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url) || url.startsWith('blob:')
}

export function Welcome() {
  const { content } = useCms()
  const videoRef = useRef<HTMLVideoElement>(null)
  const poster = useResolvedMediaUrl(content.site.homeHeroImageUrl, FALLBACK_POSTER)
  const video = useResolvedMediaUrl(content.site.homeHeroVideoUrl, FALLBACK_VIDEO)
  const posterSrc = poster || FALLBACK_POSTER
  const videoSrc = video || FALLBACK_VIDEO
  const playVideo = isDirectVideo(videoSrc)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.muted = true
    void el.play().catch(() => {})
  }, [videoSrc, playVideo])

  return (
    <section className="text-white">
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-8 section-y sm:px-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div>
          <Reveal variant="clip">
            <p className="type-label text-white/40">Studio</p>
          </Reveal>
          <Reveal variant="clip" delay={0.08} className="mt-4">
            <h2 className="type-headline max-w-2xl">
              Elke coupe
              <br />
              is maatwerk.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="type-lead mt-6 max-w-xs text-white/55">
              Knippen, scheren, baard. Voorstreek, Leeuwarden. A man’s world.
            </p>
            <Link
              to="/over-ons"
              className="type-ui group mt-8 inline-flex items-center justify-center gap-2.5 rounded-full border border-white/70 px-6 py-3 text-white transition-[color,background-color,border-color,transform] duration-300 hover:-translate-y-px hover:border-white hover:bg-white hover:text-[#2c241c]"
            >
              Over ons
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </Reveal>
        </div>

        <div className="relative mx-auto h-[22rem] w-full max-w-lg sm:h-[28rem] lg:h-[32rem]">
          <Parallax
            distance={28}
            className="absolute right-0 top-0 w-[62%] overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem]"
          >
            <MediaReveal>
              <div className="relative aspect-[3/4]">
                {playVideo ? (
                  <video
                    ref={videoRef}
                    className="absolute inset-0 h-full w-full object-cover"
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
            </MediaReveal>
          </Parallax>
          <Parallax
            distance={-36}
            className="absolute bottom-0 left-0 z-10 w-[56%] overflow-hidden rounded-[1.75rem] bg-black shadow-[0_24px_50px_rgb(0_0_0/0.45)] sm:rounded-[2rem]"
          >
            <MediaReveal delay={0.12}>
              <img
                src="/lookbook/05.png"
                alt=""
                className="aspect-[3/4] w-full object-cover"
                loading="lazy"
              />
            </MediaReveal>
          </Parallax>
        </div>
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'
import { buttonClass } from '@/components/ui/buttonStyles'
import { Reveal } from '@/components/motion/Reveal'
import { MediaReveal } from '@/components/motion/MediaReveal'
import { Parallax } from '@/components/motion/Parallax'
import { useCms } from '@/cms/CmsContext'
import { useResolvedMediaUrl } from '@/cms/media/useResolvedMediaUrl'
import { feed, feedFrameClass, HERO_POSTER } from '@/data/feed'

const FALLBACK_POSTER = HERO_POSTER

export function Welcome() {
  const { content } = useCms()
  const poster = useResolvedMediaUrl(content.site.homeHeroImageUrl, FALLBACK_POSTER)
  const posterSrc = poster || FALLBACK_POSTER

  return (
    <section className="text-white">
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-6 section-y lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:px-8">
        <div>
          <p className="type-label text-white/40">{content.site.welcomeKicker || 'Studio'}</p>
          <Reveal className="mt-4">
            <h2 className="type-headline max-w-2xl whitespace-pre-line">
              {content.site.welcomeTitle || 'Elke coupe\nis maatwerk.'}
            </h2>
          </Reveal>
          <p className="type-lead mt-6 max-w-xs text-white/55">
            {content.site.welcomeText ||
              'Knippen, scheren, baard. Voorstreek, Leeuwarden. A man’s world.'}
          </p>
          <Link
            to="/over-ons"
            className={buttonClass({ variant: 'ghost', surface: 'dark', className: 'mt-8' })}
          >
            Over ons
            <span aria-hidden className="motion-arrow">
              →
            </span>
          </Link>
        </div>

        <div className="relative mx-auto h-[22rem] w-full max-w-lg sm:h-[28rem] lg:h-[32rem]">
          <Parallax
            distance={16}
            className="group absolute right-0 top-0 w-[62%] overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem]"
          >
            <MediaReveal>
              <div className="relative aspect-[3/4]">
                <img
                  src={posterSrc}
                  alt=""
                  className={`wf-media-zoom absolute inset-0 h-full w-full ${feedFrameClass}`}
                  loading="lazy"
                />
              </div>
            </MediaReveal>
          </Parallax>
          <Parallax
            distance={-16}
            className="group absolute bottom-0 left-0 z-10 w-[56%] overflow-hidden rounded-[1.75rem] bg-black shadow-[0_24px_50px_rgb(0_0_0/0.45)] sm:rounded-[2rem]"
          >
            <MediaReveal delay={0.1}>
              <img
                src={content.site.welcomeImageUrl || feed.dsc00030}
                alt=""
                className={`wf-media-zoom aspect-[3/4] w-full ${feedFrameClass}`}
                loading="lazy"
              />
            </MediaReveal>
          </Parallax>
        </div>
      </div>
    </section>
  )
}

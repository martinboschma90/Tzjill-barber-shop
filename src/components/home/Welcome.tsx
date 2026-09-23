import { Link } from 'react-router-dom'
import { Reveal } from '@/components/motion/Reveal'
import { MediaReveal } from '@/components/motion/MediaReveal'
import { Parallax } from '@/components/motion/Parallax'
import { useCms } from '@/cms/CmsContext'
import { useResolvedMediaUrl } from '@/cms/media/useResolvedMediaUrl'

const FALLBACK_POSTER = '/brand/hero.jpg'

export function Welcome() {
  const { content } = useCms()
  const poster = useResolvedMediaUrl(content.site.homeHeroImageUrl, FALLBACK_POSTER)
  const posterSrc = poster || FALLBACK_POSTER

  return (
    <section className="text-white">
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-8 section-y sm:px-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div>
          <Reveal variant="clip">
            <p className="type-label text-white/40">{content.site.welcomeKicker || 'Studio'}</p>
          </Reveal>
          <Reveal variant="clip" delay={0.08} className="mt-4">
            <h2 className="type-headline max-w-2xl whitespace-pre-line">
              {content.site.welcomeTitle || 'Elke coupe\nis maatwerk.'}
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="type-lead mt-6 max-w-sm text-white/55">
              {content.site.welcomeText ||
                'Traditioneel barbierwerk, met de technieken van nu. Knippen, baard, scheren en kids t/m 11 — aan de Voorstreek 18.'}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/over-ons"
                className="type-ui group inline-flex items-center justify-center gap-2.5 rounded-full border border-white/70 px-6 py-3 text-white transition-[color,background-color,border-color,transform] duration-300 hover:-translate-y-px hover:border-white hover:bg-white hover:text-[#2c241c]"
              >
                Over ons
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
              <Link
                to="/barbershop-leeuwarden"
                className="type-ui text-white/55 underline decoration-white/30 underline-offset-4 hover:text-white"
              >
                Barbershop in Leeuwarden
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="relative mx-auto h-[22rem] w-full max-w-lg sm:h-[28rem] lg:h-[32rem]">
          <Parallax
            distance={28}
            className="absolute right-0 top-0 w-[62%] overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem]"
          >
            <MediaReveal>
              <div className="relative aspect-[3/4]">
                <img
                  src={posterSrc}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </MediaReveal>
          </Parallax>
          <Parallax
            distance={-36}
            className="absolute bottom-0 left-0 z-10 w-[56%] overflow-hidden rounded-[1.75rem] bg-black shadow-[0_24px_50px_rgb(0_0_0/0.45)] sm:rounded-[2rem]"
          >
            <MediaReveal delay={0.12}>
              <img
                src={content.site.welcomeImageUrl || '/lookbook/05.png'}
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

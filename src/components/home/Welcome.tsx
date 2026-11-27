import { SiteText } from '@/cms/SiteText'
import { ResolvedImg } from '@/components/ui/ResolvedMedia'
import { Link } from 'react-router-dom'
import { buttonClass } from '@/components/ui/buttonStyles'
import { Reveal } from '@/components/motion/Reveal'
import { MediaReveal } from '@/components/motion/MediaReveal'
import { Parallax } from '@/components/motion/Parallax'
import { useCms } from '@/cms/CmsContext'
import { useResolvedMediaUrl } from '@/cms/media/useResolvedMediaUrl'
import { feedFrameClass } from '@/data/feed'

export function Welcome() {
  const { content } = useCms()
  const posterField = content.site.homeHeroImageUrl?.trim() ?? ''
  const poster = useResolvedMediaUrl(posterField || null)
  const posterSrc = poster
  const welcomeImage = content.site.welcomeImageUrl?.trim() ?? ''

  return (
    <section data-cms-section="welcome" className="text-white">
      <div className="content-wrap section-y grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div>
          {content.site.welcomeKicker.trim() ? (
            <p className="type-label text-white/65">{content.site.welcomeKicker}</p>
          ) : null}
          {content.site.welcomeTitle.trim() ? (
            <Reveal className="mt-4">
              <h2 className="type-headline max-w-2xl whitespace-pre-line text-white">
                {content.site.welcomeTitle}
              </h2>
            </Reveal>
          ) : null}
          {content.site.welcomeText.trim() ? (
            <p className="type-lead mt-6 max-w-xs text-white/55">{content.site.welcomeText}</p>
          ) : null}
          <Link
            to="/over-ons"
            className={buttonClass({ variant: 'ghost', surface: 'dark', className: 'mt-8' })}
          ><SiteText textKey="Welcome.1" /><span aria-hidden className="motion-arrow">
              →
            </span>
          </Link>
        </div>

        {posterSrc || welcomeImage ? (
        <div className="relative mx-auto h-[22rem] w-full max-w-lg sm:h-[28rem] lg:h-[32rem]">
          {posterSrc ? (
          <Parallax
            distance={16}
            className="group absolute right-0 top-0 w-[62%] overflow-hidden radius-media bg-black"
          >
            <MediaReveal>
              <div className="relative aspect-[3/4]">
                <ResolvedImg
                  src={posterSrc}
                  alt=""
                  className={`wf-media-zoom absolute inset-0 h-full w-full ${feedFrameClass}`}
                  loading="lazy"
                />
              </div>
            </MediaReveal>
          </Parallax>
          ) : null}
          {welcomeImage ? (
            <Parallax
              distance={-16}
              className="group absolute bottom-0 left-0 z-10 w-[56%] overflow-hidden radius-media bg-black shadow-[0_24px_50px_rgb(0_0_0/0.45)]"
            >
              <MediaReveal delay={0.1}>
                <ResolvedImg
                  src={welcomeImage}
                  alt=""
                  className={`wf-media-zoom aspect-[3/4] w-full ${feedFrameClass}`}
                  loading="lazy"
                />
              </MediaReveal>
            </Parallax>
          ) : null}
        </div>
        ) : null}
      </div>
    </section>
  )
}

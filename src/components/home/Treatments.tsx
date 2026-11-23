import { ResolvedImg } from '@/components/ui/ResolvedMedia'
import { Link } from 'react-router-dom'
import { Reveal } from '@/components/motion/Reveal'
import { MediaReveal } from '@/components/motion/MediaReveal'
import { useCms } from '@/cms/CmsContext'
import { cloneTreatments } from '@/cms/content'
import { feedFrameClass } from '@/data/feed'
export function Treatments() {
  const { content } = useCms()
  const { site } = content
  const items = site.treatments ?? cloneTreatments()
  const hasHeader =
    site.treatmentsKicker.trim() ||
    site.treatmentsTitle.trim() ||
    site.treatmentsIntro.trim()
  const hasCards = items.some(
    (item) => item.title.trim() || item.text.trim() || item.image.trim(),
  )

  if (!hasHeader && !hasCards) return null

  return (
    <section data-cms-section="treatments" className="text-white">
      <div className="mx-auto max-w-[1240px] px-6 section-y lg:px-8">
        {hasHeader ? (
          <div className="mx-auto max-w-3xl text-center">
            {site.treatmentsKicker.trim() ? (
              <p className="type-label inline-flex items-center justify-center gap-2 text-white/65">
                <span className="h-1.5 w-1.5 rounded-full bg-white/55" aria-hidden />
                {site.treatmentsKicker}
              </p>
            ) : null}
            {site.treatmentsTitle.trim() ? (
              <Reveal>
                <h2 className="type-headline mt-5 whitespace-pre-line">
                  {site.treatmentsTitle}
                </h2>
              </Reveal>
            ) : null}
            {site.treatmentsIntro.trim() ? (
              <p className="type-lead mx-auto mt-5 max-w-lg text-white/55">
                {site.treatmentsIntro}
              </p>
            ) : null}
          </div>
        ) : null}
        {hasCards ? (
          <ul className={`grid gap-8 sm:grid-cols-3 sm:gap-5 ${hasHeader ? 'mt-14' : ''}`}>
            {items.map((item, index) => {
              if (!item.title.trim() && !item.text.trim() && !item.image.trim()) {
                return null
              }
              return (
                <li key={`${item.title}-${index}`}>
                  <Reveal delay={0.08 + index * 0.1}>
                    <Link to="/prijzen" className="group block">
                      {item.image.trim() ? (
                        <MediaReveal
                          delay={0.08 + index * 0.08}
                          className="relative overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem]"
                        >
                          <div className="relative aspect-[3/4]">
                            <ResolvedImg
                              src={item.image}
                              alt=""
                              className={`wf-media-zoom h-full w-full ${feedFrameClass}`}
                              loading="lazy"
                            />
                            <span className="type-ui absolute bottom-4 left-4 text-white/80">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                        </MediaReveal>
                      ) : null}
                      {item.title.trim() ? (
                        <h3 className="type-subhead mt-5 text-white">{item.title}</h3>
                      ) : null}
                      {item.text.trim() ? (
                        <p className="type-lead mt-2 text-white/50">{item.text}</p>
                      ) : null}
                    </Link>
                  </Reveal>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
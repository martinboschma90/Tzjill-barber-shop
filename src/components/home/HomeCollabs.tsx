import { Link } from 'react-router-dom'
import { CollabMedia } from '@/components/collabs/CollabMedia'
import { MediaReveal } from '@/components/motion/MediaReveal'
import { Parallax } from '@/components/motion/Parallax'
import { Reveal } from '@/components/motion/Reveal'
import { buttonClass } from '@/components/ui/buttonStyles'
import { useCms } from '@/cms/CmsContext'
import { cloneCollabs, collabVideoUrl } from '@/cms/content'

export function HomeCollabs() {
  const { content } = useCms()
  const collabs = (content.site.collabs ?? cloneCollabs()).filter((item) => item.name.trim())
  if (collabs.length === 0) return null

  return (
    <section className="text-white" aria-labelledby="home-collabs-title">
      <div className="mx-auto max-w-[1240px] px-6 section-y lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Reveal>
              <p className="type-label text-white/40">Collabs</p>
            </Reveal>
            <Reveal delay={0.08} className="mt-4">
              <h2 id="home-collabs-title" className="type-headline">
                Gasten
                <br />& merken
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="type-lead mt-5 max-w-md text-white/55">
                Gasten in de stoel en merken in de lounge. Drop-ins, pop-ups, altijd op afspraak.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.18}>
            <Link
              to="/collabs"
              className={buttonClass({ variant: 'ghost', surface: 'dark', className: 'shrink-0' })}
            >
              Alle collabs
              <span aria-hidden className="transition-transform duration-500 ease-out group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </Reveal>
        </div>

        <ul className="mt-12 grid gap-14 lg:mt-16 lg:grid-cols-2 lg:gap-8">
          {collabs.map((item, index) => (
            <li key={`${item.name}-${index}`}>
              <Reveal delay={index * 0.12} className="h-full">
                <article className="flex h-full flex-col">
                  <Parallax
                    distance={index % 2 === 0 ? 16 : -16}
                    className="group overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem]"
                  >
                    <MediaReveal delay={index * 0.1}>
                      <CollabMedia
                        image={item.image}
                        video={collabVideoUrl(item)}
                        priority={index === 0}
                        embedded
                      />
                    </MediaReveal>
                  </Parallax>
                  <Reveal delay={0.08 + index * 0.06}>
                    <p className="type-label mt-6 text-white/40">{item.year}</p>
                    <h3 className="type-subhead mt-2">{item.name}</h3>
                    <p className="type-lead mt-3 max-w-md text-white/55">{item.text}</p>
                  </Reveal>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

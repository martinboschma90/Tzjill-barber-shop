import { Link } from 'react-router-dom'
import { Reveal } from '@/components/motion/Reveal'
import { buttonClass } from '@/components/ui/buttonStyles'
import { useCms } from '@/cms/CmsContext'
import { cloneCollabs } from '@/cms/content'
import { useResolvedMediaUrl } from '@/cms/media/useResolvedMediaUrl'
import type { ShopCollab } from '@/cms/content'

function CollabCard({ item, index }: { item: ShopCollab; index: number }) {
  const src = useResolvedMediaUrl(item.image)
  const line = item.text.replace(/\s+/g, ' ').trim()

  return (
    <li>
      <Reveal delay={index * 0.08} className="h-full">
        <Link to="/collabs" className="group flex h-full flex-col">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black">
            {src ? (
              <img
                src={src}
                alt=""
                className="wf-media-zoom absolute inset-0 h-full w-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            ) : null}
          </div>
          <p className="type-ui mt-4 w-fit rounded-full border border-white/20 px-3 py-1 text-[12px] normal-case tracking-normal text-white/70">
            {item.year} · {item.name}
          </p>
          <h3 className="type-subhead mt-3">{item.name}</h3>
          <p className="type-lead mt-2 line-clamp-1 text-white/55">{line}</p>
          <span className="type-ui mt-4 inline-flex items-center gap-2 text-white">
            Bekijk collab
            <span aria-hidden className="motion-arrow">
              →
            </span>
          </span>
        </Link>
      </Reveal>
    </li>
  )
}

export function HomeCollabs() {
  const { content } = useCms()
  const collabs = (content.site.collabs ?? cloneCollabs()).filter((item) => item.name.trim())
  if (collabs.length < 2) return null

  return (
    <section className="text-white" aria-labelledby="home-collabs-title">
      <div className="mx-auto max-w-[1240px] px-6 py-[72px] lg:px-8 lg:py-[120px]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="type-label text-white/65">Collabs</p>
            <Reveal className="mt-4">
              <h2 id="home-collabs-title" className="type-headline">
                Gasten & merken
              </h2>
            </Reveal>
          </div>
          <Link
            to="/collabs"
            className={buttonClass({
              variant: 'ghost',
              surface: 'dark',
              className: 'w-full shrink-0 lg:w-auto',
            })}
          >
            Alle collabs
            <span aria-hidden className="motion-arrow">
              →
            </span>
          </Link>
        </div>

        <ul className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-2">
          {collabs.map((item, index) => (
            <CollabCard key={`${item.name}-${index}`} item={item} index={index} />
          ))}
        </ul>
      </div>
    </section>
  )
}

import { SiteText } from '@/cms/SiteText'
import { useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { PageIntro } from '@/components/layout/PageIntro'
import {
  lookbookFilters,
  type LookbookFilterId,
} from '@/data/lookbook'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/data/site'
import { PillButton } from '@/components/ui/PillButton'
import { buttonClass } from '@/components/ui/buttonStyles'
import { useCms } from '@/cms/CmsContext'
import { cloneLookbook } from '@/cms/content'
import { feedFrameClass } from '@/data/feed'
import { Reveal } from '@/components/motion/Reveal'

export function LookbookPage() {
  const { content } = useCms()
  const lookbookImages = content.site.lookbookImages ?? cloneLookbook()
  const [filter, setFilter] = useState<LookbookFilterId>('all')

  const images = useMemo(() => {
    if (filter === 'all') return lookbookImages
    return lookbookImages.filter((image) =>
      image.tags.some((tag) => tag === filter),
    )
  }, [filter, lookbookImages])

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <PageIntro
          kicker={<SiteText textKey="LookbookPage.kicker" />}
          title={
            <><SiteText textKey="LookbookPage.1" /><br /><SiteText textKey="LookbookPage.2" /></>
          }
          intro={<SiteText textKey="LookbookPage.intro" />}
        />
        <div className="mt-10 flex flex-wrap items-center gap-3">
          {lookbookFilters.map((item) => {
            const active = filter === item.id
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(item.id)}
                className={buttonClass({
                  variant: active ? 'solid' : 'ghost',
                  surface: 'dark',
                  className: 'px-5 py-2.5',
                })}
              >
                {item.label}
              </button>
            )
          })}
          <PillButton
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            variant="ghost"
            surface="dark"
            className="sm:ml-2"
          >
            {INSTAGRAM_HANDLE}
          </PillButton>
        </div>
        {images.length === 0 ? (
          <p className="type-lead mt-16 max-w-sm text-white/50"><SiteText textKey="LookbookPage.3" /></p>
        ) : (
          <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <li key={image.src}>
                <Reveal delay={(index % 3) * 0.08}>
                <figure className="group overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem]">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className={`wf-media-zoom aspect-[3/4] w-full ${feedFrameClass}`}
                    loading="lazy"
                  />
                </figure>
                <p className="type-lead mt-3 text-white/45">{image.alt}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </PageFrame>
    </AppShell>
  )
}

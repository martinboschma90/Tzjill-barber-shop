import { useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { PageIntro } from '@/components/layout/PageIntro'
import {
  lookbookFilters,
  lookbookImages,
  type LookbookFilterId,
} from '@/data/lookbook'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/data/site'
import { PillButton } from '@/components/ui/PillButton'

export function LookbookPage() {
  const [filter, setFilter] = useState<LookbookFilterId>('all')

  const images = useMemo(() => {
    if (filter === 'all') return lookbookImages
    return lookbookImages.filter((image) =>
      image.tags.some((tag) => tag === filter),
    )
  }, [filter])

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <PageIntro
          kicker="Looks"
          title={
            <>
              Behind
              <br />
              the chair
            </>
          }
          intro="Looks uit de zaak. #tzjill"
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
                className={`type-ui rounded-full border px-5 py-2.5 transition-[color,background-color,border-color,transform] duration-300 hover:-translate-y-px ${
                  active
                    ? 'border-[#efeae3] bg-[#efeae3] text-[#2c241c]'
                    : 'border-white/25 bg-transparent text-white/70 hover:border-white hover:text-white'
                }`}
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
          <p className="type-lead mt-16 max-w-sm text-white/50">
            Nog geen looks in deze categorie. Check Instagram of kies een andere
            filter.
          </p>
        ) : (
          <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <li key={image.src}>
                <figure className="group overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem]">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="wf-media-zoom aspect-[3/4] w-full object-cover"
                    loading="lazy"
                  />
                </figure>
                <p className="type-lead mt-3 text-white/45">{image.alt}</p>
              </li>
            ))}
          </ul>
        )}
      </PageFrame>
    </AppShell>
  )
}

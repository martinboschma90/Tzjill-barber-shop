import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { PageIntro } from '@/components/layout/PageIntro'
import { PillButton } from '@/components/ui/PillButton'
import { useCms } from '@/cms/CmsContext'
import { cloneCollabs } from '@/cms/content'

export function CollabsPage() {
  const { content } = useCms()
  const collabs = content.site.collabs ?? cloneCollabs()

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <PageIntro
          kicker="Studio"
          title={
            <>
              Gasten
              <br />
              & merken
            </>
          }
          intro="Gasten, merken, events. Mail als het past."
        />
        <div className="mt-10">
          <PillButton href="mailto:info@tzjill.nl" surface="dark">
            Collab aanvragen
          </PillButton>
        </div>

        <ul className="mt-16 space-y-16 lg:space-y-24">
          {collabs.map((item, index) => {
            const reverse = index % 2 === 1
            return (
              <li
                key={item.name}
                className="grid items-center gap-8 lg:grid-cols-12 lg:gap-16"
              >
                <div
                  className={`group overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem] lg:col-span-6 ${
                    reverse ? 'lg:col-start-7 lg:row-start-1' : ''
                  }`}
                >
                  <img
                    src={item.image}
                    alt=""
                    className="wf-media-zoom aspect-[4/5] h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div
                  className={`lg:col-span-5 ${
                    reverse ? 'lg:col-start-1 lg:row-start-1' : 'lg:col-start-8'
                  }`}
                >
                  <p className="type-label text-white/40">{item.year}</p>
                  <h2 className="type-subhead mt-3">{item.name}</h2>
                  <p className="type-lead mt-4 max-w-md text-white/55">{item.text}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </PageFrame>
    </AppShell>
  )
}

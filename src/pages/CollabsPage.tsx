import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { PageIntro } from '@/components/layout/PageIntro'
import { PillButton } from '@/components/ui/PillButton'
import { useCms } from '@/cms/CmsContext'
import {
  SHOP_FALLBACK_VIDEO,
  cloneCollabs,
  collabVideoUrl,
} from '@/cms/content'
import { CollabMedia } from '@/components/collabs/CollabMedia'
import {
  CollabCaption,
  CollabsCarousel,
} from '@/components/collabs/CollabsCarousel'

export function CollabsPage() {
  const { content } = useCms()
  const collabs = content.site.collabs ?? cloneCollabs()
  // Every CMS/seed entry becomes a slide — never slice or drop one.
  const fallbackVideo =
    content.site.homeHeroVideoUrl?.trim() || SHOP_FALLBACK_VIDEO

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
        <div className="mt-6 sm:mt-10">
          <PillButton href="mailto:info@tzjill.nl" surface="dark">
            Collab aanvragen
          </PillButton>
        </div>

        <CollabsCarousel items={collabs} fallbackVideo={fallbackVideo} />

        <ul className="mt-16 hidden space-y-24 lg:block">
          {collabs.map((item, index) => {
            const reverse = index % 2 === 1
            return (
              <li
                key={`${item.name}-${index}`}
                className="grid items-center gap-8 lg:grid-cols-12 lg:gap-16"
              >
                <div
                  className={`lg:col-span-6 ${
                    reverse ? 'lg:col-start-7 lg:row-start-1' : ''
                  }`}
                >
                  <CollabMedia
                    image={item.image}
                    video={collabVideoUrl(item, fallbackVideo)}
                    priority={index === 0}
                  />
                </div>
                <div
                  className={`lg:col-span-5 ${
                    reverse ? 'lg:col-start-1 lg:row-start-1' : 'lg:col-start-8'
                  }`}
                >
                  <CollabCaption item={item} />
                </div>
              </li>
            )
          })}
        </ul>
      </PageFrame>
    </AppShell>
  )
}

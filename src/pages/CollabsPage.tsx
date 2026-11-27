import { SiteText } from '@/cms/SiteText'
import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { PageIntro } from '@/components/layout/PageIntro'
import { PillButton } from '@/components/ui/PillButton'
import { useCms } from '@/cms/CmsContext'
import { cloneCollabs, collabVideoUrl } from '@/cms/content'
import { CollabMedia } from '@/components/collabs/CollabMedia'
import {
  CollabCaption,
  CollabsCarousel,
} from '@/components/collabs/CollabsCarousel'

export function CollabsPage() {
  const { content } = useCms()
  const collabs =
    content.site.collabs !== undefined
      ? content.site.collabs
      : cloneCollabs()
  const collabEmail = content.site.contact[0]?.email?.trim() ?? ''
  // Two distinct slides: each collab's own video + matching text, together.

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <PageIntro
          kicker={<SiteText textKey="CollabsPage.kicker" />}
          title={
            <><SiteText textKey="CollabsPage.1" /><br /><SiteText textKey="CollabsPage.2" /></>
          }
          intro={<SiteText textKey="CollabsPage.intro" />}
        />
        <div className="mt-6 sm:mt-10">
          {collabEmail ? (
            <PillButton href={`mailto:${collabEmail}`} surface="dark">
              <SiteText textKey="CollabsPage.3" />
            </PillButton>
          ) : null}
        </div>

        <CollabsCarousel items={collabs} />

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
                    video={collabVideoUrl(item)}
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

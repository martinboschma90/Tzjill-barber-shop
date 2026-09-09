import { AppShell } from '@/components/layout/AppShell'
import { PageIntro } from '@/components/layout/PageIntro'
import { SectionRow } from '@/components/ui/SectionRow'
import { useCms } from '@/cms/CmsProvider'
import { PreviewFrame } from '@/cms/previews/PreviewFrame'

export function AboutPreview() {
  const { content } = useCms()
  const { site } = content

  return (
    <PreviewFrame label="Over ons">
      <AppShell navVariant="wordmark">
        <div className="px-5 pb-24 pt-28 sm:px-8 sm:pt-32">
          <div className="mx-auto max-w-[1200px]">
            <PageIntro
              kicker="Tzjill Leeuwarden"
              title={site.aboutTitle || 'Over ons'}
              intro={site.about[0]}
            />
            <SectionRow label="Studio">
              <div className="type-body space-y-1 text-[0.95rem] text-ink/85">
                <p>{site.legal.company}</p>
                {site.legal.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </SectionRow>
          </div>
        </div>
      </AppShell>
    </PreviewFrame>
  )
}

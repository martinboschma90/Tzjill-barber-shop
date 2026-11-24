import { SiteText } from '@/cms/SiteText'
import { Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { PageIntro } from '@/components/layout/PageIntro'
import { FaqHub } from '@/components/faq/FaqHub'
import { useCms } from '@/cms/CmsContext'

export function FaqPage() {
  const { content } = useCms()
  const { site } = content

  if (site.faqVisible === false) {
    return <Navigate to="/" replace />
  }

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <PageIntro
          kicker={<SiteText textKey="FaqPage.kicker" />}
          title={site.faqTitle.trim()}
          intro={site.faqIntro.trim()}
        />
        <div className="panel-invert mt-12">
          <FaqHub
            title=""
            intro=""
            categories={site.faqCategories}
          />
        </div>
      </PageFrame>
    </AppShell>
  )
}

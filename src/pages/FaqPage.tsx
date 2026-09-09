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
          kicker="FAQ"
          title={site.faqTitle.trim() || 'Vragen'}
          intro={site.faqIntro}
        />
        <div className="mt-12 rounded-[2rem] bg-white px-8 py-10 text-[#2c241c] sm:px-12 sm:py-12">
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

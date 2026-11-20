import { SiteText } from '@/cms/SiteText'
import { Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { PageIntro } from '@/components/layout/PageIntro'
import { TeamSection } from '@/components/about/TeamSection'
import { useCms } from '@/cms/CmsContext'
import { BookButton } from '@/components/booking/BookButton'

export function TeamPage() {
  const { content } = useCms()
  const team = content.team.filter((member) => member.name.trim())

  if (content.site.teamVisible === false) return <Navigate to="/" replace />

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <PageIntro
          introPlacement="below"
          kicker={<SiteText textKey="TeamPage.kicker" />}
          title={
            <><SiteText textKey="TeamPage.1" /><br /><SiteText textKey="TeamPage.2" /></>
          }
          intro={<SiteText textKey="TeamPage.intro" />}
        />
        <div className="mt-16">
          {team.length ? (
            <TeamSection members={team} />
          ) : (
            <p className="type-lead max-w-lg text-white/55"><SiteText textKey="TeamPage.3" /></p>
          )}
        </div>
        <div className="mt-14">
          <BookButton surface="dark"><SiteText textKey="TeamPage.4" /></BookButton>
        </div>
      </PageFrame>
    </AppShell>
  )
}

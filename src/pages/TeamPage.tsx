import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { PageIntro } from '@/components/layout/PageIntro'
import { TeamSection } from '@/components/about/TeamSection'
import { useCms } from '@/cms/CmsContext'
import { team as fallbackTeam } from '@/data/site'
import { BookButton } from '@/components/booking/BookButton'

export function TeamPage() {
  const { content } = useCms()
  const fromCms = content.team.filter((member) => member.name.trim())
  const team = fromCms.length ? fromCms : fallbackTeam

  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <PageIntro
          kicker="Team"
          title={
            <>
              Meet
              <br />
              the team
            </>
          }
          intro="De kappers achter de coupe. Kies wie je knipt via Salonhub."
        />
        <div className="mt-16">
          <TeamSection members={team} />
        </div>
        <div className="mt-14">
          <BookButton surface="dark">Afspraak maken</BookButton>
        </div>
      </PageFrame>
    </AppShell>
  )
}

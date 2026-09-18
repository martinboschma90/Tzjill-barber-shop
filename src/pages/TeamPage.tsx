import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { PageIntro } from '@/components/layout/PageIntro'
import { TeamSection } from '@/components/about/TeamSection'
import { useCms } from '@/cms/CmsContext'
import { BookButton } from '@/components/booking/BookButton'

export function TeamPage() {
  const { content } = useCms()
  const team = content.team.filter((member) => member.name.trim())

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
          {team.length ? (
            <TeamSection members={team} />
          ) : (
            <p className="type-lead max-w-lg text-white/55">
              Kies je kapper bij het boeken in Salonhub. Namen volgen in de
              zaak — we zetten hier geen placeholder-team.
            </p>
          )}
        </div>
        <div className="mt-14">
          <BookButton surface="dark">Afspraak maken</BookButton>
        </div>
      </PageFrame>
    </AppShell>
  )
}

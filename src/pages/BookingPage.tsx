import { AppShell } from '@/components/layout/AppShell'
import { PageFrame } from '@/components/layout/PageFrame'
import { PageIntro } from '@/components/layout/PageIntro'
import { SALONHUB_BOOKING_URL } from '@/data/site'

export function BookingPage() {
  return (
    <AppShell navVariant="wordmark">
      <PageFrame>
        <PageIntro
          kicker="Boeken"
          title={
            <>
              Afspraak
              <br />
              maken
            </>
          }
          intro="Kies behandeling, kapper en tijd. Bevestiging volgt per mail."
        />
        <div className="mt-12 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#1c1b19] sm:rounded-[2rem]">
          <iframe
            title="Salonhub — online afspraak Tzjill"
            src={SALONHUB_BOOKING_URL}
            className="h-[min(80svh,820px)] w-full border-0 bg-[#1c1b19]"
          />
        </div>
      </PageFrame>
    </AppShell>
  )
}

import { useCms } from '@/cms/CmsProvider'
import { ArtistVisibilityToggle } from '@/cms/editors/ArtistVisibilityToggle'
import { EditorSection, TextArea, TextInput } from '@/cms/fields'
import { SALONHUB_BOOKING_URL } from '@/data/site'

export function BookingEditor() {
  const { content, setSite } = useCms()
  const { site } = content
  const visible = site.bookingVisible !== false

  return (
    <>
      <EditorSection
        title="Visibility"
        description="Show or hide the public Booking page. Content is kept when hidden."
        defaultOpen
        badge="Settings"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/8 bg-ink/[0.03] px-3.5 py-3">
          <div>
            <p className="type-label text-[0.65rem] tracking-[0.14em] text-ink/45 uppercase">
              Booking page
            </p>
            <p className="type-body mt-1 text-xs text-ink/45">
              {visible
                ? 'Visible at /booking'
                : 'Hidden — visitors are redirected home'}
            </p>
          </div>
          <ArtistVisibilityToggle
            visible={visible}
            onChange={(bookingVisible) =>
              setSite((s) => ({ ...s, bookingVisible }))
            }
          />
        </div>
      </EditorSection>

      <EditorSection
        title="Intro"
        description="Headline and supporting copy above the booking flow."
        defaultOpen
        badge="Content"
      >
        <TextInput
          label="Title"
          value={site.bookingTitle}
          onChange={(bookingTitle) => setSite((s) => ({ ...s, bookingTitle }))}
        />
        <TextArea
          label="Intro"
          value={site.bookingIntro}
          rows={3}
          onChange={(bookingIntro) => setSite((s) => ({ ...s, bookingIntro }))}
        />
      </EditorSection>

      <EditorSection
        title="Agenda"
        description="Bezoekers boeken via Salonhub. Geen eigen booking-backend."
      >
        <p className="type-body rounded-xl border border-ink/8 bg-ink/[0.03] px-3.5 py-3 text-xs text-ink/55">
          {SALONHUB_BOOKING_URL}
        </p>
        <p className="type-body text-xs leading-relaxed text-ink/40">
          De publieke /booking-pagina toont eerst Tzjill-chrome, daarna de
          Salonhub-agenda. Health checks en de publieke URL staan onder
          Instellingen (tzjill-barber-shop.vercel.app tot tzjill.nl hierop wijst).
        </p>
      </EditorSection>
    </>
  )
}

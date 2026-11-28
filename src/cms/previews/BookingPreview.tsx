import { BookingFlow } from '@/components/booking/BookingFlow'
import { BookingShell } from '@/components/booking/BookingShell'
import { AppShell } from '@/components/layout/AppShell'
import { useCms } from '@/cms/CmsProvider'
import { PreviewFrame } from '@/cms/previews/PreviewFrame'

export function BookingPreview() {
  const { content } = useCms()
  const { site } = content

  return (
    <PreviewFrame label="Booking">
      <AppShell cover showFooter={false}>
        {!site.bookingVisible ? (
          <p className="type-body mb-4 rounded-xl border border-ink/10 bg-ink/5 px-3 py-2 text-xs text-ink/50">
            Page hidden — /booking redirects home.
          </p>
        ) : null}
        <div className="flex min-h-full flex-col bg-[#1c1b19]">
          <BookingShell>
            <BookingFlow />
          </BookingShell>
        </div>
      </AppShell>
    </PreviewFrame>
  )
}

import { BookingFlow } from '@/components/booking/BookingFlow'
import { AppShell } from '@/components/layout/AppShell'
import { useCms } from '@/cms/CmsProvider'
import { PreviewFrame } from '@/cms/previews/PreviewFrame'

export function BookingPreview() {
  const { content } = useCms()
  const { site } = content

  return (
    <PreviewFrame label="Booking">
      <AppShell navVariant="wordmark">
        {!site.bookingVisible ? (
          <p className="type-body mb-4 rounded-xl border border-ink/10 bg-ink/5 px-3 py-2 text-xs text-ink/50">
            Page hidden — /booking redirects home.
          </p>
        ) : null}
        <BookingFlow />
      </AppShell>
    </PreviewFrame>
  )
}

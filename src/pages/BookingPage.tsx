import { AppShell } from '@/components/layout/AppShell'
import { BookingFlow } from '@/components/booking/BookingFlow'

export function BookingPage() {
  return (
    <AppShell navVariant="wordmark">
      <BookingFlow />
    </AppShell>
  )
}

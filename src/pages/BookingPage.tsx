import { Navigate } from 'react-router-dom'
import { useCms } from '@/cms/CmsContext'
import { AppShell } from '@/components/layout/AppShell'
import { BookingFlow } from '@/components/booking/BookingFlow'

export function BookingPage() {
  const { content } = useCms()
  if (content.site.bookingVisible === false) return <Navigate to="/" replace />
  return (
    <AppShell navVariant="wordmark">
      <BookingFlow />
    </AppShell>
  )
}

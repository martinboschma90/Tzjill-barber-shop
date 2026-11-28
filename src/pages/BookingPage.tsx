import { Navigate } from 'react-router-dom'
import { useCms } from '@/cms/CmsContext'
import { AppShell } from '@/components/layout/AppShell'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { BookingShell } from '@/components/booking/BookingShell'

export function BookingPage() {
  const { content } = useCms()
  if (content.site.bookingVisible === false) return <Navigate to="/" replace />
  return (
    <AppShell cover showFooter={false}>
      <div className="flex min-h-[100dvh] flex-col bg-[#1c1b19]">
        <BookingShell>
          <BookingFlow />
        </BookingShell>
      </div>
    </AppShell>
  )
}

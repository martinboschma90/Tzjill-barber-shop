import { useEffect, useState } from 'react'
import { useCms } from '@/cms/CmsContext'
import { openingStatus } from '@/lib/openingStatus'

export function OpenStatus({ className = '' }: { className?: string }) {
  const { content } = useCms()
  const hours = content.site.openingHours
  const [label, setLabel] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const status = openingStatus(new Date(), hours)
      setOpen(status.open)
      setLabel(status.label)
    }
    sync()
    const id = window.setInterval(sync, 60_000)
    return () => window.clearInterval(id)
  }, [hours])

  if (!label) return null

  return (
    <p className={`type-ui nums inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-[#c4a574]' : 'bg-white/35'}`}
      />
      {label}
    </p>
  )
}

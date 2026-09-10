import type { ReactNode } from 'react'
import { ChevronDown, Pencil, X } from 'lucide-react'
import { Card } from '@/cms/flow-mates/cms-ui'

export function AdminListCard({
  isOpen,
  onToggle,
  thumbnail,
  title,
  meta,
  actions,
  children,
}: {
  isOpen: boolean
  onToggle: () => void
  thumbnail?: ReactNode
  title: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <Card
      hover={!isOpen}
      className={`overflow-hidden ${isOpen ? 'ring-1 ring-neutral-900/5' : ''}`}
    >
      <div className="flex flex-wrap items-center gap-2.5 px-3 py-2 sm:px-4">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex min-w-60 flex-1 items-center gap-3 text-left"
        >
          <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-lg bg-neutral-100">
            {thumbnail}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[14px] font-semibold tracking-tight text-neutral-900">
              {title}
            </h3>
            {meta != null ? (
              <p className="mt-0.5 truncate text-[11.5px] leading-relaxed text-neutral-500">
                {meta}
              </p>
            ) : null}
          </div>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-1 border-t border-neutral-100 pt-2">
          <button
            type="button"
            onClick={onToggle}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              isOpen
                ? 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                : 'border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
          >
            {isOpen ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            {isOpen ? 'Sluiten' : 'Bewerken'}
          </button>
          {actions}
        </div>
      </div>
      {isOpen && children ? (
        <div className="border-t border-neutral-200/70 bg-gradient-to-b from-neutral-50/60 to-white/40">
          <div className="space-y-3.5 px-4 py-4 sm:px-5">{children}</div>
        </div>
      ) : null}
    </Card>
  )
}

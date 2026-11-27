import type { ReactNode } from 'react'

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
    <article className="border-b border-[#e5e5e5]">
      <div className="flex min-h-12 items-center gap-3 py-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          {thumbnail ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[#f5f5f5]">
              {thumbnail}
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold text-[#111214]">{title}</h3>
            {meta != null ? (
              <p className="truncate text-[13px] text-[#6b6b66]">{meta}</p>
            ) : null}
          </div>
        </button>
        {actions}
      </div>
      {isOpen && children ? <div className="space-y-3 pb-4">{children}</div> : null}
    </article>
  )
}

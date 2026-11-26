import {
  Children,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { Monitor, X } from 'lucide-react'

export function EditorPreviewLayout({ children }: { children: ReactNode }) {
  const parts = Children.toArray(children)
  const editor = parts[0] ?? null
  const preview = parts[1] ?? null
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)
  const [isXl, setIsXl] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const sync = () => {
      setIsXl(query.matches)
      if (query.matches) setMobilePreviewOpen(false)
    }
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1">
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col lg:w-[420px] lg:max-w-[42%] lg:flex-none"
      >
        {editor}
      </div>

      {isXl ? (
        <div className="relative hidden min-h-0 min-w-0 flex-1 flex-col border-l border-[#e5e5e5] bg-white lg:flex [&>*]:h-full [&>*]:min-h-0">
          {preview}
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setMobilePreviewOpen(true)}
            className="fixed bottom-20 right-4 z-30 inline-flex items-center gap-2 rounded-lg bg-[#111214] px-3 py-2.5 text-[13px] font-semibold text-white lg:hidden"
          >
            <Monitor className="h-4 w-4" />
            Voorbeeld
          </button>
          {mobilePreviewOpen ? (
            <div className="fixed inset-0 z-40 flex flex-col bg-white lg:hidden">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] px-4 py-3">
                <p className="text-[13px] font-semibold text-[#111214]">Live voorbeeld</p>
                <button
                  type="button"
                  onClick={() => setMobilePreviewOpen(false)}
                  className="rounded-md p-1.5 text-[#6b6b66] hover:bg-[#f5f5f5]"
                  aria-label="Sluiten"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 [&>*]:h-full">{preview}</div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

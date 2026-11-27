import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CmsPreviewModeProvider } from '@/cms/previews/PreviewMode'
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react'
import { useTheme } from '@/theme/ThemeProvider'

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile'

type PreviewFrameProps = {
  label: string
  children: ReactNode
  /** Scroll the preview iframe to this element id after mount. */
  scrollToId?: string
}

const devices: {
  id: PreviewDevice
  label: string
  width: number | null
}[] = [
  { id: 'desktop', label: 'Desktop · 1280px', width: 1280 },
  { id: 'tablet', label: 'Tablet · 820px', width: 820 },
  { id: 'mobile', label: 'Mobile · 390px', width: 390 },
]

/**
 * Frame CMS preview chrome. Inner island is Notype content only.
 */
export function PreviewFrame({ label, children, scrollToId }: PreviewFrameProps) {
  const { theme } = useTheme()
  const [device, setDevice] = useState<PreviewDevice>('desktop')
  const [nonce, setNonce] = useState(0)
  const [maximized, setMaximized] = useState(false)
  const [submissionBlocked, setSubmissionBlocked] = useState(false)
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null)
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const stageRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const active = devices.find((d) => d.id === device) ?? devices[0]
  const logicalWidth = active.width ?? 1280
  const scale = stageSize.width
    ? Math.min(1, stageSize.width / logicalWidth)
    : 1
  const logicalHeight = Math.max(720, stageSize.height / Math.max(scale, 0.01))

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const observer = new ResizeObserver(([entry]) => {
      setStageSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [maximized])

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    doc.documentElement.dataset.theme = theme
    const root = doc.getElementById('preview-root')
    if (root) root.dataset.theme = theme
  }, [theme, mountNode])

  useEffect(() => {
    if(!mountNode)return
    let highlighted: HTMLElement | null = null
    let lastKey = ''
    const focusSection=(event:Event)=>{
      const id=(event as CustomEvent<string>).detail
      const alias: Record<string, string> = {
        'texts-Testimonials': 'reviews',
        'texts-Welcome': 'welcome',
      }
      const key=alias[id]||id
      const target=Array.from(mountNode.querySelectorAll('[data-cms-section]')).find(node=>node.getAttribute('data-cms-section')===key)
      if(!target || key === lastKey)return
      lastKey = key
      if(highlighted){highlighted.style.outline = ''; highlighted.style.outlineOffset = ''}
      highlighted = target as HTMLElement
      highlighted.style.outline = '3px solid #22c55e'
      highlighted.style.outlineOffset = '-4px'
      const top=target.getBoundingClientRect().top-mountNode.getBoundingClientRect().top+mountNode.scrollTop
      mountNode.scrollTo({top:Math.max(0,top-16),behavior:'smooth'})
    }
    window.addEventListener('cms-preview-section',focusSection)
    return ()=>{window.removeEventListener('cms-preview-section',focusSection);if(highlighted){highlighted.style.outline='';highlighted.style.outlineOffset=''}}
  },[mountNode])

  useEffect(() => {
    if (!mountNode) return
    let attempts = 0
    let timer = 0

    const tick = () => {
      attempts += 1
      if (!scrollToId) {
        mountNode.scrollTo({ top: 0 })
        return
      }
      const target = mountNode.ownerDocument.getElementById(scrollToId)
      if (!target) {
        if (attempts < 15) timer = window.setTimeout(tick, 120)
        return
      }
      const top =
        target.getBoundingClientRect().top -
        mountNode.getBoundingClientRect().top +
        mountNode.scrollTop
      mountNode.scrollTo({ top: Math.max(0, top - 16), behavior: 'smooth' })
    }

    timer = window.setTimeout(tick, 80)
    return () => window.clearTimeout(timer)
  }, [mountNode, scrollToId])

  const initializeFrame = useCallback(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!doc) return

    doc.head.replaceChildren()
    for (const node of document.querySelectorAll('style, link[rel="stylesheet"]')) {
      doc.head.appendChild(node.cloneNode(true))
    }
    const base = doc.createElement('base')
    base.href = window.location.origin
    doc.head.prepend(base)

    const style = doc.createElement('style')
    style.textContent = `
      html, body { margin: 0; height: 100%; overflow: hidden !important; overscroll-behavior: none; }
      #preview-root { height: 100%; overflow: auto !important; overflow-x: clip; overscroll-behavior: contain; }
      .full-bleed-hero { width: 100% !important; max-width: 100% !important; margin-inline: 0 !important; min-height: 100%; }
    `
    doc.head.appendChild(style)
    doc.documentElement.dataset.theme = theme
    setMountNode(doc.getElementById('preview-root'))
  }, [theme])

  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden overscroll-none bg-white ${
        maximized ? 'fixed inset-0 z-50' : 'h-full'
      }`}
    >
      <div className="flex shrink-0 items-center gap-2.5 px-5 pb-3 pt-4">
        <b className="text-[13px] font-semibold text-[#111214]">Live voorbeeld</b>
        <div className="ml-auto flex gap-1">
          {devices.map(({ id, label: title }) => (
            <button
              key={id}
              type="button"
              title={title}
              onClick={() => {
                if (id === device) return
                setMountNode(null)
                setDevice(id)
              }}
              className={`h-8 rounded-md border border-[#e5e5e5] px-3 text-[13px] font-semibold ${
                id === device ? 'bg-[#111214] text-white border-[#111214]' : 'bg-transparent text-[#111214]'
              }`}
            >
              {id === 'desktop' ? 'Desktop' : id === 'tablet' ? 'Tablet' : 'Mobiel'}
            </button>
          ))}
          <button
            type="button"
            title="Preview vernieuwen"
            onClick={() => {
              setMountNode(null)
              setNonce((n) => n + 1)
            }}
            className="grid h-8 w-8 place-items-center rounded-md text-[#6b6b66] hover:bg-[#fafafa]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title={maximized ? 'Volledig scherm uit' : 'Volledig scherm'}
            onClick={() => setMaximized((m) => !m)}
            className="grid h-8 w-8 place-items-center rounded-md text-[#6b6b66] hover:bg-[#fafafa]"
          >
            {maximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      {submissionBlocked ? (
        <p role="status" className="mb-2 px-5 text-[12px] text-[#6b6b66]">
          Dit is een voorbeeld. Er is niets verstuurd of geboekt.
        </p>
      ) : null}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-white px-5 pb-5">
        <div ref={stageRef} className="flex h-full min-h-0 justify-center overflow-hidden">
          <div
            className={`relative overflow-hidden bg-white ${
              device === 'mobile'
                ? 'rounded-[28px] border-[8px] border-[#111214]'
                : 'rounded-lg border border-[#e5e5e5]'
            }`}
            style={{
              width: `${logicalWidth * scale}px`,
              height: `${stageSize.height || 720}px`,
            }}
          >
            <iframe
              key={`${device}-${nonce}`}
              ref={iframeRef}
              title={`${label} ${active.label} preview`}
              srcDoc='<!doctype html><html><head></head><body><div id="preview-root"></div></body></html>'
              onLoad={initializeFrame}
              className="absolute left-0 top-0 border-0 bg-white"
              style={{
                width: `${logicalWidth}px`,
                height: `${logicalHeight}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            />
            {mountNode &&
              createPortal(
                <CmsPreviewModeProvider ownerWindow={mountNode.ownerDocument.defaultView} onBlockedSubmit={() => setSubmissionBlocked(true)}>
                <div
                  data-cms-preview
                  data-theme={theme}
                  className="min-h-full text-ink"
                  onClickCapture={(event) => {
                    if ((event.target as Element).closest('a')) {
                      event.preventDefault()
                      event.stopPropagation()
                    }
                  }}
                >
                  {children}
                </div>
                </CmsPreviewModeProvider>,
                mountNode,
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

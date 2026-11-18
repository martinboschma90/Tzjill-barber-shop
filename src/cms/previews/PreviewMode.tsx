import { createContext, useContext, type ReactNode } from 'react'

type PreviewContext = { enabled: boolean; ownerWindow: Window | null }
const CmsPreviewMode = createContext<PreviewContext>({ enabled: false, ownerWindow: null })

export function CmsPreviewModeProvider({ children, ownerWindow = null, onBlockedSubmit }: {
  children: ReactNode
  ownerWindow?: Window | null
  onBlockedSubmit?: () => void
}) {
  return (
    <CmsPreviewMode.Provider value={{ enabled: true, ownerWindow }}>
      <div className="contents" onSubmitCapture={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onBlockedSubmit?.()
      }}>
        {children}
      </div>
    </CmsPreviewMode.Provider>
  )
}

export function useIsCmsPreview() {
  return useContext(CmsPreviewMode).enabled
}

export function useCmsPreviewWindow() {
  return useContext(CmsPreviewMode).ownerWindow
}

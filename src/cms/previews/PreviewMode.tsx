import { createContext, useContext, type ReactNode } from 'react'

const CmsPreviewMode = createContext(false)

export function CmsPreviewModeProvider({ children }: { children: ReactNode }) {
  return (
    <CmsPreviewMode.Provider value={true}>{children}</CmsPreviewMode.Provider>
  )
}

export function useIsCmsPreview() {
  return useContext(CmsPreviewMode)
}

import type { ReactNode } from 'react'

export function CmsThemeProvider({ children }: { children: ReactNode }) {
  return <div data-cms data-cms-theme="light" data-theme="light" className="cms-theme-root h-full min-h-0 overflow-hidden">{children}</div>
}

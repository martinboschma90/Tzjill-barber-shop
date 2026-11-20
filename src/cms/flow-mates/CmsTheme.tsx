import type { ReactNode } from 'react'

export function CmsThemeProvider({ children }: { children: ReactNode }) {
  return <div data-cms data-cms-theme="light" data-theme="light" className="cms-theme-root min-h-svh">{children}</div>
}

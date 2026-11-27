import type { ReactNode } from 'react'

type PageFrameProps = {
  children: ReactNode
  wide?: boolean
}

/** Inner pages on the black canvas, same width language as home. */
export function PageFrame({ children, wide = true }: PageFrameProps) {
  return (
    <div className="pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-8 text-white sm:pt-10 lg:pb-20">
      <div className={wide ? 'content-wrap' : 'content-wrap-narrow'}>{children}</div>
    </div>
  )
}

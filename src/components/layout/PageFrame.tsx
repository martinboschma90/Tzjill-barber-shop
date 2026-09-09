import type { ReactNode } from 'react'

type PageFrameProps = {
  children: ReactNode
  wide?: boolean
}

/** Inner pages on the black canvas, same width language as home. */
export function PageFrame({ children, wide = true }: PageFrameProps) {
  return (
    <div className="px-8 pb-16 pt-8 text-white sm:px-12 sm:pb-20 sm:pt-10">
      <div className={`mx-auto ${wide ? 'max-w-[1240px]' : 'max-w-[880px]'}`}>
        {children}
      </div>
    </div>
  )
}

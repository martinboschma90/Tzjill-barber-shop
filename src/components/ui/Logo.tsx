type LogoTone = 'white' | 'black'

type LogoProps = {
  className?: string
  height?: number
  title?: string
  /** White on dark surfaces; black on cream/light. */
  tone?: LogoTone
  fetchPriority?: 'high' | 'low' | 'auto'
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
}

const SRC = {
  white: '/brand/tzjill-logo-white.png',
  black: '/brand/tzjill-logo-black.png',
} as const

/** Official EPS lockup, 1200 × 1151. */
const INTRINSIC_W = 1200
const INTRINSIC_H = 1151
const RATIO = INTRINSIC_W / INTRINSIC_H

/** Official Tzjill Barber & Lounge mark (white or black). */
export function Logo({
  className = '',
  height = 40,
  title = 'Tzjill Barber & Lounge',
  tone = 'black',
  fetchPriority,
  loading,
  decoding = 'async',
}: LogoProps) {
  const width = Math.round(height * RATIO)
  const src = SRC[tone]

  return (
    <img
      src={src}
      srcSet={`${src} ${INTRINSIC_W}w`}
      sizes={`${width}px`}
      alt={title}
      width={width}
      height={height}
      className={`block max-w-full object-contain ${className}`}
      style={{ height, width, objectFit: 'contain' }}
      draggable={false}
      loading={fetchPriority === 'high' ? 'eager' : loading}
      decoding={fetchPriority === 'high' ? 'sync' : decoding}
      fetchPriority={fetchPriority}
    />
  )
}

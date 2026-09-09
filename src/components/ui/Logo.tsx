type LogoVariant = 'wordmark' | 'wordmark-ink' | 'seal' | 'stacked' | 'auto'

type LogoProps = {
  variant?: LogoVariant
  className?: string
  height?: number
  title?: string
  fetchPriority?: 'high' | 'low' | 'auto'
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
  /** Invert to white — use on dark video/hero. */
  invert?: boolean
}

const SRC = '/brand/tzjill-logo.png'
const RATIO = 1092 / 1044

/** Tzjill wordmark from tzjill.nl */
export function Logo({
  className = '',
  height = 40,
  title = 'Tzjill Barber & Lounge',
  fetchPriority,
  loading,
  decoding = 'async',
  invert = false,
}: LogoProps) {
  const width = Math.round(height * RATIO)

  return (
    <img
      src={SRC}
      alt={title}
      width={width}
      height={height}
      className={`block max-w-full object-contain ${invert ? 'brightness-0 invert' : ''} ${className}`}
      style={{ height, width, objectFit: 'contain' }}
      draggable={false}
      loading={fetchPriority === 'high' ? 'eager' : loading}
      decoding={fetchPriority === 'high' ? 'sync' : decoding}
      fetchPriority={fetchPriority}
    />
  )
}

import { BrandLoader } from '@/components/ui/BrandLoader'

type RouteFallbackProps = {
  /** Compact fill for CMS editor/preview columns. */
  compact?: boolean
}

/** Dark-UI loading state for lazy routes. The logo splash is cold load only. */
export function RouteFallback({
  compact = false,
  splash = true,
}: RouteFallbackProps & { splash?: boolean }) {
  if (!compact && splash) {
    return <BrandLoader label="Loading" />
  }

  if (!splash) {
    return (
      <div className="min-h-[30vh]" role="status" aria-live="polite" aria-label="Loading">
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  return (
    <div
      className="flex h-full min-h-[12rem] items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-ink/15 border-t-accent"
        aria-hidden
      />
      <span className="sr-only">Loading</span>
    </div>
  )
}

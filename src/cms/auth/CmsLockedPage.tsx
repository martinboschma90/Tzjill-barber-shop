import { Link } from 'react-router-dom'

/** Shown when /cms is requested without a configured auth backend. Fail closed. */
export function CmsLockedPage() {
  return (
    <div
      data-cms
      className="flex min-h-svh flex-col items-center justify-center bg-neutral-50 px-6 text-center"
      style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
        CMS
      </p>
      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        Beheer is vergrendeld
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-500">
        Geen lokale modus op deze host. Preview en productie vereisen login.
        Zet{' '}
        <span className="font-mono text-xs text-neutral-700">
          VITE_SUPABASE_URL
        </span>{' '}
        en{' '}
        <span className="font-mono text-xs text-neutral-700">
          VITE_SUPABASE_ANON_KEY
        </span>{' '}
        in Vercel en log in — zonder die keys blijft /cms gesloten.
      </p>
      <Link
        to="/"
        className="mt-8 text-sm font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
      >
        Terug naar de site
      </Link>
    </div>
  )
}

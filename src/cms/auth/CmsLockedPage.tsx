import { Link } from 'react-router-dom'

/** Shown when /cms is requested without a configured auth backend. Fail closed. */
export function CmsLockedPage() {
  return (
    <div
      data-cms
      className="flex min-h-svh flex-col items-center justify-center bg-[#f6f3ee] px-6 text-center text-[#1c1b19]"
      style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3a2f28]/45">
        CMS
      </p>
      <h1 className="mt-3 text-xl font-semibold text-[#1c1b19]">
        Beheer is vergrendeld
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#3a2f28]/70">
        Geen lokale modus op deze host. Preview en productie vereisen login.
        Zet{' '}
        <span className="font-mono text-xs text-[#1c1b19]">
          VITE_SUPABASE_URL
        </span>{' '}
        en{' '}
        <span className="font-mono text-xs text-[#1c1b19]">
          VITE_SUPABASE_ANON_KEY
        </span>{' '}
        in Vercel en log in — zonder die keys blijft /cms gesloten.
      </p>
      <Link
        to="/"
        className="mt-8 text-sm font-medium text-[#1c1b19] underline underline-offset-4 hover:text-[#3a2f28]"
      >
        Terug naar de site
      </Link>
    </div>
  )
}

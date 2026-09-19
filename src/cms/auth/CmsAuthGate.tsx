import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/cms/auth/AuthProvider'
import { CmsLockedPage } from '@/cms/auth/CmsLockedPage'
import { isCmsLocalBypassAllowed } from '@/lib/cmsLocalBypass'
import { isSupabaseConfigured } from '@/lib/supabaseEnv'
import type { ReactNode } from 'react'

/**
 * Protects CMS shell routes. Login page is outside this gate.
 * Fail closed on Vercel / production. Local Vite + localhost only
 * may skip login when no hosted backend is configured.
 */
export function CmsAuthGate({ children }: { children: ReactNode }) {
  const { ready, session } = useAuth()
  const location = useLocation()

  if (isCmsLocalBypassAllowed()) {
    return children
  }

  if (!isSupabaseConfigured) {
    return <CmsLockedPage />
  }

  if (!ready) {
    return (
      <div
        data-cms
        className="flex h-svh items-center justify-center bg-neutral-50"
        style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
      >
        <p className="text-sm text-neutral-500">CMS laden…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <Navigate
        to="/cms/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  return children
}

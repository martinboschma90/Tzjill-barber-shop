import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import {
  getSession,
  isSupabaseConfigured,
  onAuthStateChange,
  signInWithPassword,
  signOut as authSignOut,
} from '@/lib/auth'

export type CmsRole = 'admin' | 'editor' | 'viewer'

type AuthContextValue = {
  ready: boolean
  session: Session | null
  user: User | null
  authRequired: boolean
  role: CmsRole
  displayName: string
  canEdit: boolean
  canSettings: boolean
  canManageUsers: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function asRole(value: unknown): CmsRole {
  if (value === 'admin' || value === 'editor' || value === 'viewer') return value
  return 'viewer'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!isSupabaseConfigured)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<CmsRole>('viewer')
  const [displayName, setDisplayName] = useState('')

  const loadRole = useCallback(async (user: User | null) => {
    if (!isSupabaseConfigured || !supabase || !user) {
      setRole('viewer')
      setDisplayName('')
      return
    }
    const owner =
      (user.email ?? '').trim().toLowerCase() === 'martin@viraal.media'
    if (owner) setRole('admin')
    setDisplayName(
      String(user.user_metadata?.display_name || user.email || ''),
    )
    try {
      const { data } = await supabase.rpc('cms_ensure_role')
      const nextRole = owner ? 'admin' : asRole(data)
      setRole(nextRole)
      const { data: row } = await supabase
        .from('user_roles')
        .select('display_name,email,role')
        .eq('user_id', user.id)
        .maybeSingle()
      setDisplayName(
        String(row?.display_name || user.user_metadata?.display_name || user.email || ''),
      )
      if (owner) setRole('admin')
      else if (row?.role) setRole(asRole(row.role))
    } catch (error) {
      console.warn('[cms auth] loadRole:', error)
      if (owner) setRole('admin')
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true)
      setSession(null)
      setRole('viewer')
      setDisplayName('')
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      if (!cancelled) setReady(true)
    }, 2500)

    void getSession()
      .then(async (next) => {
        if (cancelled) return
        setSession(next)
        setReady(true)
        window.clearTimeout(timer)
        await loadRole(next?.user ?? null)
      })
      .catch(() => {
        if (!cancelled) setReady(true)
      })
      .finally(() => {
        window.clearTimeout(timer)
      })

    const { data } = onAuthStateChange((_event, next) => {
      setSession(next)
      void loadRole(next?.user ?? null)
      setReady(true)
    })

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      data.subscription.unsubscribe()
    }
  }, [loadRole])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await signInWithPassword(email.trim(), password)
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await authSignOut()
    if (error) {
      return { error: error.message }
    }
    setSession(null)
    setRole('viewer')
    setDisplayName('')
    return { error: null }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      authRequired: true,
      role,
      displayName: displayName || session?.user?.email || '',
      canEdit: Boolean(session) && (role === 'admin' || role === 'editor'),
      canSettings: Boolean(session) && role === 'admin',
      canManageUsers: Boolean(session) && role === 'admin',
      signIn,
      signOut,
    }),
    [displayName, ready, role, session, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

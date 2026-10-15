import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { CmsContext } from '@/cms/CmsContext'
import {
  createDefaultSiteContent,
  type CmsContent,
  type SiteContent,
} from '@/cms/content'
import { fetchPublicContent } from '@/cms/api/publicRead'
import {
  CMS_STORAGE_KEY,
  PUBLIC_SITE_STORAGE_KEY,
  PUBLIC_TEAM_STORAGE_KEY,
} from '@/cms/storageKeys'
import { normalizeSiteContent } from '@/cms/mappers/site'
import { isSupabaseConfigured } from '@/lib/supabaseEnv'
import { storageGet, storageSet } from '@/lib/safeStorage'
import { createBlankArtist } from '@/cms/createArtist'
import { team as defaultTeam } from '@/data/site'
import type { TeamMember } from '@/types/artist'

const PLACEHOLDER_TEAM_NAMES = new Set(['niels', 'daan', 'sem'])

function publicTeam(members: TeamMember[] | null | undefined): TeamMember[] {
  if (!Array.isArray(members)) return defaultTeam.map((member) => ({ ...member }))
  return members.filter((member) => {
    const name = member.name.trim().toLowerCase()
    return name && !PLACEHOLDER_TEAM_NAMES.has(name)
  })
}

function readJson<T>(key: string): T | null {
  const raw = storageGet(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function initialPublicContent(): CmsContent {
  const cmsCache = !isSupabaseConfigured
    ? readJson<Partial<CmsContent>>(CMS_STORAGE_KEY)
    : null
  const site =
    cmsCache?.site ?? readJson<SiteContent>(PUBLIC_SITE_STORAGE_KEY)
  const team =
    cmsCache?.team ?? readJson<TeamMember[]>(PUBLIC_TEAM_STORAGE_KEY)
  const siteLooksValid =
    site &&
    typeof site === 'object' &&
    typeof site.name === 'string' &&
    typeof site.tagline === 'string'
  return {
    site: siteLooksValid ? normalizeSiteContent(site) : createDefaultSiteContent(),
    team: publicTeam(team),
    artists: [],
  }
}

const noopAsync = async () => ({ error: null as string | null })

/** Read-only site/team for the public app — no Auth, no supabase-js. */
export function PublicContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<CmsContent>(initialPublicContent)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    const refresh = () => {
      if (document.visibilityState === 'hidden') return
      void fetchPublicContent().then((remote) => {
        if (cancelled || !remote) return
        const team = publicTeam(remote.team)
        storageSet(PUBLIC_SITE_STORAGE_KEY, JSON.stringify(remote.site))
        storageSet(PUBLIC_TEAM_STORAGE_KEY, JSON.stringify(team))
        setContent((previous) => ({ ...previous, site: remote.site, team }))
      }).catch(() => undefined)
    }
    refresh()
    const timer = window.setInterval(refresh, 30_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  const value = useMemo(
    () => ({
      content,
      savedAt: null,
      contentSyncStatus: 'synced' as const,
      artistSyncError: null,
      siteSyncError: null,
      dirtyArtistIds: new Set<string>(),
      artistSaving: false,
      setSite: () => undefined,
      setTeam: () => undefined,
      setArtists: () => undefined,
      updateArtist: () => undefined,
      addArtist: (name: string) => createBlankArtist(name, []),
      removeArtist: () => undefined,
      saveArtist: noopAsync,
      publishArtist: noopAsync,
      unpublishArtist: noopAsync,
      resetContent: () => undefined,
      getArtistBySlug: (slug: string) =>
        content.artists.find((a) => a.slug === slug),
      isArtistDirty: () => false,
    }),
    [content],
  )

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>
}

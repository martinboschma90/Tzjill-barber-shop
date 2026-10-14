import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '@/cms/auth/AuthProvider'
import { loadStoredContent, loadStoredContentUpdatedAt, persistContent, type CmsContent } from '@/cms/content'
import { createDefaultContent } from '@/cms/defaultCmsContent'
import { createBlankArtist } from '@/cms/createArtist'
import { fetchCmsContentBlob, pushCmsSnapshot } from '@/cms/api/cmsStore'
import { fetchArtistsFromSupabaseCached, invalidateArtistsCache } from '@/cms/api/artistsCache'
import { fetchSiteSettingsFromSupabase } from '@/cms/api/site'
import { fetchTeamMembersFromSupabase } from '@/cms/api/team'
import { applyArtistStatus } from '@/cms/artistVisibility'
import { artistHasLocalMediaRefs, LOCAL_MEDIA_PUBLISH_WARNING } from '@/cms/artistLocalMedia'
import { isSupabaseConfigured } from '@/lib/supabaseEnv'
import { storageGet, storageSet, storageRemove } from '@/lib/safeStorage'
import { PUBLIC_SITE_STORAGE_KEY, PUBLIC_TEAM_STORAGE_KEY } from '@/cms/storageKeys'
import { validateCmsContent } from '@/cms/validateContent'
import { downloadCmsBackup } from '@/cms/cmsBackup'
import { createSnapshotQueue } from '@/cms/snapshotQueue'
import { CmsContext, type CmsContextValue, type ContentSyncStatus } from '@/cms/CmsContext'

function cachePublic(content: CmsContent) {
  storageSet(PUBLIC_SITE_STORAGE_KEY, JSON.stringify(content.site))
  storageSet(PUBLIC_TEAM_STORAGE_KEY, JSON.stringify(content.team))
}

export function CmsProvider({ children }: { children: ReactNode }) {
  const { ready: authReady, session, authRequired, canEdit } = useAuth()
  const userId = session?.user.id
  const local = !isSupabaseConfigured
  const [content, setContent] = useState<CmsContent>(() => loadStoredContent() ?? createDefaultContent())
  const contentRef = useRef(content)
  const [hydrated, setHydrated] = useState(local)
  const [savedAt, setSavedAt] = useState<number | null>(() => loadStoredContentUpdatedAt() || null)
  const [siteSyncError, setSiteSyncError] = useState<string | null>(null)
  const [artistSyncError, setArtistSyncError] = useState<string | null>(null)
  const [contentSyncStatus, setContentSyncStatus] = useState<ContentSyncStatus>(local ? 'synced' : 'pending')
  const [dirtyArtistIds, setDirtyArtistIds] = useState<Set<string>>(new Set())
  const [artistSaving, setArtistSaving] = useState(false)
  const [editVersion, setEditVersion] = useState(0)
  const [backup, setBackup] = useState(() => storageGet('tzjill-cms-unsaved-v1'))
  const versionRef = useRef(0)
  const writer = useRef<ReturnType<typeof createSnapshotQueue<CmsContent>> | null>(null)

  // Opening the CMS only reads. The remote document wins even if this browser has an old cache.
  useEffect(() => {
    if (local || !authReady || !userId || !authRequired) return
    let cancelled = false
    setHydrated(false)
    writer.current = null
    void (async () => {
      try {
        const remote = await fetchCmsContentBlob()
        let next = remote?.content
        if (!next) {
          const [site, team, roster] = await Promise.all([
            fetchSiteSettingsFromSupabase(), fetchTeamMembersFromSupabase(), fetchArtistsFromSupabaseCached({ force: true }),
          ])
          const defaults = createDefaultContent()
          next = { site: site.site ?? defaults.site, team: team.team, artists: roster.artists }
        }
        if (cancelled) return
        writer.current = createSnapshotQueue(pushCmsSnapshot, remote?.revision ?? null)
        contentRef.current = next
        setContent(next)
        versionRef.current = 0
        setEditVersion(0)
        setDirtyArtistIds(new Set())
        persistContent(next, { updatedAt: remote?.updatedAt ?? 0 })
        cachePublic(next)
        setSavedAt(remote?.updatedAt ?? null)
        setSiteSyncError(null)
        setContentSyncStatus('synced')
        setHydrated(true)
      } catch (error) {
        if (!cancelled) setSiteSyncError(error instanceof Error ? error.message : 'CMS ophalen mislukt. Herlaad om opnieuw te proberen.')
      }
    })()
    return () => { cancelled = true }
  }, [authReady, userId, authRequired, local])

  const edit = useCallback((updater: (previous: CmsContent) => CmsContent) => {
    if (!canEdit || !hydrated) return
    const next = updater(contentRef.current)
    if (next === contentRef.current) return
    contentRef.current = next
    setContent(next)
    versionRef.current += 1
    setEditVersion(versionRef.current)
    persistContent(next)
    if (!local) { const draft = JSON.stringify(next); storageSet('tzjill-cms-unsaved-v1', draft); setBackup(draft) }
    if (local) {
      cachePublic(next)
      setSavedAt(Date.now())
    } else {
      setContentSyncStatus('pending')
    }
  }, [canEdit, hydrated, local])

  const save = useCallback(async () => {
    if (!canEdit || !hydrated) return { error: 'CMS is nog niet geladen of je hebt geen schrijfrechten.' }
    if (local) return { error: null }
    if (!writer.current) return { error: 'CMS is nog niet geladen.' }
    const snapshot = contentRef.current
    const validationError = validateCmsContent(snapshot)
    if (validationError) { setSiteSyncError(validationError); return { error: validationError } }
    const version = versionRef.current
    const result = await writer.current.save(snapshot)
    if (result.error) {
      setSiteSyncError(result.error)
      setContentSyncStatus('pending')
      return { error: result.error }
    }
    invalidateArtistsCache()
    if (version === versionRef.current) {
      persistContent(snapshot, { updatedAt: result.updatedAt ?? 0 })
      cachePublic(snapshot)
      setSavedAt(result.updatedAt)
      setContentSyncStatus('synced')
      setSiteSyncError(null)
      setDirtyArtistIds(new Set())
      storageRemove('tzjill-cms-unsaved-v1'); setBackup(null)
    }
    return { error: null }
  }, [canEdit, hydrated, local])

  useEffect(() => {
    if (local || !hydrated || editVersion === 0 || !canEdit) return
    const timer = window.setTimeout(() => { void save() }, 700)
    return () => window.clearTimeout(timer)
  }, [canEdit, editVersion, hydrated, local, save])

  const saveArtist = useCallback(async (slug: string) => {
    if (!contentRef.current.artists.some((artist) => artist.slug === slug)) return { error: 'Kapper niet gevonden.' }
    setArtistSaving(true)
    const result = await save()
    setArtistSaving(false)
    setArtistSyncError(result.error)
    return result
  }, [save])

  const changeStatus = useCallback(async (slug: string, published: boolean) => {
    const current = contentRef.current.artists.find((artist) => artist.slug === slug)
    if (!current) return { error: 'Kapper niet gevonden.' }
    if (published && artistHasLocalMediaRefs(current)) {
      setArtistSyncError(LOCAL_MEDIA_PUBLISH_WARNING)
      return { error: LOCAL_MEDIA_PUBLISH_WARNING }
    }
    edit((previous) => ({ ...previous, artists: previous.artists.map((artist) => artist.slug === slug
      ? applyArtistStatus(artist, published ? 'published' : 'draft', { touchPublishedAt: published }) : artist) }))
    return saveArtist(slug)
  }, [edit, saveArtist])

  const value = useMemo<CmsContextValue>(() => ({
    content, savedAt, contentSyncStatus, siteSyncError, artistSyncError, dirtyArtistIds, artistSaving,
    setSite: (updater) => edit((previous) => ({ ...previous, site: updater(previous.site) })),
    setTeam: (updater) => edit((previous) => ({ ...previous, team: updater(previous.team) })),
    setArtists: (updater) => edit((previous) => {
      const artists = updater(previous.artists)
      setDirtyArtistIds(new Set(artists.map((artist) => artist.id)))
      return { ...previous, artists }
    }),
    updateArtist: (slug, updater) => edit((previous) => {
      const artists = previous.artists.map((artist) => artist.slug === slug ? updater(artist) : artist)
      setDirtyArtistIds((ids) => new Set([...ids, ...artists.filter((artist) => artist.slug === slug).map((artist) => artist.id)]))
      return { ...previous, artists }
    }),
    addArtist: (name) => {
      const created = createBlankArtist(name, contentRef.current.artists.map((artist) => artist.slug))
      edit((previous) => ({ ...previous, artists: [...previous.artists, created] }))
      return created
    },
    removeArtist: (slug) => edit((previous) => ({ ...previous, artists: previous.artists.filter((artist) => artist.slug !== slug) })),
    saveArtist,
    publishArtist: (slug) => changeStatus(slug, true),
    unpublishArtist: (slug) => changeStatus(slug, false),
    resetContent: () => edit(() => createDefaultContent()),
    getArtistBySlug: (slug) => content.artists.find((artist) => artist.slug === slug),
    isArtistDirty: (id) => dirtyArtistIds.has(id),
  }), [content, savedAt, contentSyncStatus, siteSyncError, artistSyncError, dirtyArtistIds, artistSaving, edit, saveArtist, changeStatus])

  return <CmsContext.Provider value={value}>{hydrated ? <>{backup ? <div data-cms className="border-b border-amber-200 bg-amber-50 p-3 text-sm text-neutral-900">Een lokale conceptkopie is bewaard. <button type="button" className="underline" onClick={() => { try { downloadCmsBackup(JSON.parse(backup)) } catch { /* invalid backup remains untouched */ } }}>Conceptkopie downloaden</button></div> : null}{children}</> : <div data-cms className="flex min-h-svh flex-col items-center justify-center gap-4 bg-neutral-50 p-6 text-neutral-900"><p role={siteSyncError ? 'alert' : 'status'}>{siteSyncError || 'CMS-inhoud veilig laden…'}</p>{siteSyncError ? <button type="button" onClick={() => window.location.reload()} className="rounded-lg border px-4 py-3">Opnieuw laden</button> : null}</div>}</CmsContext.Provider>
}

export { useCms } from '@/cms/CmsContext'

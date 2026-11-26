import { useState } from 'react'
import { Globe, UploadCloud } from 'lucide-react'
import { useCms } from '@/cms/CmsProvider'
import { useAuth } from '@/cms/auth/AuthProvider'
import { isSupabaseConfigured } from '@/lib/supabaseEnv'
import { PrimaryButton, GhostButton } from '@/cms/flow-mates/cms-ui'
import { ViewSiteButton, formatRelative, EditorStatusPill } from '@/cms/flow-mates/EditorTopBar'
import type { ContentSyncStatus } from '@/cms/CmsContext'

function statusFromSync(
  contentSyncStatus: ContentSyncStatus,
  needsPublish: boolean,
  publishing: boolean,
): 'draft' | 'saving' | 'published' | 'error' {
  if (publishing || contentSyncStatus === 'pending') return 'saving'
  if (contentSyncStatus === 'live' && !needsPublish) return 'published'
  return 'draft'
}

function statusLabel(
  contentSyncStatus: ContentSyncStatus,
  needsPublish: boolean,
  publishing: boolean,
): string {
  if (publishing) return 'Live zetten…'
  if (contentSyncStatus === 'pending') return 'Concept opslaan…'
  if (needsPublish) return 'Klaar om live te zetten'
  return 'Live op de website'
}

/** Co-public-style global publish bar (draft auto-sync, explicit go-live). */
export function SiteDocumentBar() {
  const local = !isSupabaseConfigured
  const { canEdit } = useAuth()
  const {
    savedAt,
    publishedAt,
    contentSyncStatus,
    needsPublish,
    siteSyncError,
    saveDraft,
    publishLive,
  } = useCms()
  const [publishing, setPublishing] = useState(false)

  if (local || !canEdit) return null

  const hasUnsavedEdits = contentSyncStatus === 'pending'
  const pill = statusFromSync(contentSyncStatus, needsPublish, publishing)
  const pillLabel = statusLabel(contentSyncStatus, needsPublish, publishing)
  const saving = hasUnsavedEdits || publishing
  const canPublish = needsPublish || hasUnsavedEdits

  async function handlePublish() {
    setPublishing(true)
    await publishLive()
    setPublishing(false)
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200/80 bg-white px-4 py-3 shadow-sm">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 text-xs text-neutral-600">
        <EditorStatusPill
          state={siteSyncError ? 'error' : pill}
          label={siteSyncError ? 'Sync mislukt' : pillLabel}
        />
        {savedAt ? (
          <span className="text-neutral-400">
            Concept {formatRelative(new Date(savedAt))}
          </span>
        ) : null}
        {publishedAt && !needsPublish ? (
          <span className="text-neutral-400">
            · Live {formatRelative(new Date(publishedAt))}
          </span>
        ) : needsPublish ? (
          <span className="text-amber-700/90">Bezoekers zien nog de vorige live versie.</span>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <ViewSiteButton />
        <GhostButton
          type="button"
          disabled={saving || !hasUnsavedEdits}
          onClick={() => void saveDraft()}
        >
          Concept opslaan
        </GhostButton>
        <PrimaryButton
          type="button"
          disabled={saving || !canPublish}
          onClick={() => void handlePublish()}
        >
          <span className="inline-flex items-center gap-1.5">
            <UploadCloud className="h-4 w-4" />
            {publishing ? 'Publiceren…' : 'Live zetten'}
          </span>
        </PrimaryButton>
      </div>
    </div>
  )
}

export function SiteDocumentBarHint() {
  return (
    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-400">
      <Globe className="h-3 w-3" />
      Wijzigingen worden als concept opgeslagen. Zet live wanneer bezoekers het mogen zien.
    </p>
  )
}
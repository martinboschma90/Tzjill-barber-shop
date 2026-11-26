import { useState } from 'react'
import { useCms } from '@/cms/CmsProvider'
import { useAuth } from '@/cms/auth/AuthProvider'
import { isSupabaseConfigured } from '@/lib/supabaseEnv'
import { formatRelative } from '@/cms/flow-mates/EditorTopBar'
import type { ContentSyncStatus } from '@/cms/CmsContext'

function statusCopy(
  contentSyncStatus: ContentSyncStatus,
  needsPublish: boolean,
  publishing: boolean,
  error: string | null,
): string {
  if (error) return 'Opslaan mislukt.'
  if (publishing) return 'Publiceren…'
  if (contentSyncStatus === 'pending') return 'Niet opgeslagen.'
  if (needsPublish) return 'Concept opgeslagen — nog niet live.'
  return 'Live op de website.'
}

/** Co-public editor footer: status + Opslaan + Publiceren. */
export function SiteDocumentBar() {
  const local = !isSupabaseConfigured
  const { canEdit } = useAuth()
  const {
    savedAt,
    contentSyncStatus,
    needsPublish,
    siteSyncError,
    saveDraft,
    publishLive,
  } = useCms()
  const [publishing, setPublishing] = useState(false)

  if (local || !canEdit) return null

  const hasUnsavedEdits = contentSyncStatus === 'pending'
  const saving = hasUnsavedEdits || publishing
  const canPublish = needsPublish || hasUnsavedEdits

  async function handlePublish() {
    setPublishing(true)
    await publishLive()
    setPublishing(false)
  }

  return (
    <footer className="sticky bottom-0 z-20 flex min-h-[56px] shrink-0 flex-wrap items-center gap-2 border-t border-[#e7e4dc] bg-white/96 px-4 py-3 sm:px-6 lg:px-8">
      <span className="mr-auto text-[12px] text-[#6b6b66]">
        {statusCopy(contentSyncStatus, needsPublish, publishing, siteSyncError)}
        {savedAt && !hasUnsavedEdits ? ` ${formatRelative(new Date(savedAt))}` : ''}
      </span>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-10 items-center px-2 text-[13px] font-medium text-[#6b6b66] hover:text-[#111214]"
      >
        Bekijk website
      </a>
      <button
        type="button"
        disabled={saving || !hasUnsavedEdits}
        onClick={() => void saveDraft()}
        className="inline-flex min-h-10 items-center rounded-[8px] bg-[#111214] px-4 text-[13px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-45"
      >
        Opslaan
      </button>
      <button
        type="button"
        disabled={saving || !canPublish}
        onClick={() => void handlePublish()}
        className="inline-flex min-h-10 items-center rounded-[8px] bg-[#16c060] px-4 text-[13px] font-semibold text-white hover:bg-[#12a352] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {publishing ? 'Publiceren…' : 'Publiceren'}
      </button>
    </footer>
  )
}

import { useState } from 'react'
import { Globe } from 'lucide-react'
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
): { label: string; live: boolean } {
  if (error) return { label: 'Opslaan mislukt', live: false }
  if (publishing) return { label: 'Publiceren…', live: false }
  if (contentSyncStatus === 'pending') return { label: 'Concept opslaan…', live: false }
  if (needsPublish) return { label: 'Concept klaar', live: false }
  return { label: 'Live op de website', live: true }
}

function formatDay(ts: number | null): string | null {
  if (!ts) return null
  return formatRelative(new Date(ts))
}

/** Co-public-style document chrome: concept vs publiceren, all Tzjill content. */
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
  const saving = hasUnsavedEdits || publishing
  const canPublish = needsPublish || hasUnsavedEdits
  const status = statusCopy(contentSyncStatus, needsPublish, publishing, siteSyncError)
  const conceptLabel = formatDay(savedAt)
  const liveLabel = formatDay(publishedAt)

  async function handlePublish() {
    setPublishing(true)
    await publishLive()
    setPublishing(false)
  }

  return (
    <div className="sticky top-0 z-30 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e5e5] bg-white px-0 py-3 lg:static lg:rounded-xl lg:border lg:px-4">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5 text-[12px] text-[#6b6b66]">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
            siteSyncError
              ? 'bg-rose-50 text-rose-700'
              : status.live
                ? 'bg-[#16c060]/12 text-[#0f8f46]'
                : 'bg-amber-50 text-amber-800'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              siteSyncError ? 'bg-rose-500' : status.live ? 'bg-[#16c060]' : 'bg-amber-500'
            }`}
          />
          {status.label}
        </span>
        {conceptLabel ? <span>Concept {conceptLabel}</span> : null}
        {liveLabel && !needsPublish ? <span>· Live {liveLabel}</span> : null}
        {needsPublish ? (
          <span className="text-amber-800">Bezoekers zien nog de vorige live versie.</span>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3.5 text-[13px] font-semibold text-[#3a3a37] hover:bg-[#fafafa]"
        >
          Bekijk website
          <Globe className="h-3.5 w-3.5 text-[#8a8a86]" />
        </a>
        <button
          type="button"
          disabled={saving || !hasUnsavedEdits}
          onClick={() => void saveDraft()}
          className="inline-flex min-h-10 items-center rounded-lg border border-[#e5e5e5] bg-white px-4 text-[13px] font-semibold text-[#111214] hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Concept opslaan
        </button>
        <button
          type="button"
          disabled={saving || !canPublish}
          onClick={() => void handlePublish()}
          className="inline-flex min-h-10 items-center rounded-lg border border-[#16c060] bg-[#16c060] px-4 text-[13px] font-semibold text-white hover:bg-[#12a352] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {publishing ? 'Publiceren…' : 'Publiceren'}
        </button>
      </div>
    </div>
  )
}

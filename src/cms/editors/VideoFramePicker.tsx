import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { Field } from '@/cms/fields'
import { captureCurrentVideoFrame } from '@/cms/media/convert'
import { useMedia } from '@/cms/media/MediaProvider'
import { toMediaRef } from '@/cms/media/refs'
import { useResolvedMediaUrl } from '@/cms/media/useResolvedMediaUrl'

const TAINTED_MESSAGE =
  'Kan geen beeld uit deze video halen, upload de video via de mediabibliotheek'

type VideoFramePickerProps = {
  videoUrl: string
  onThumbnail: (url: string) => void
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function VideoFramePicker({ videoUrl, onThumbnail }: VideoFramePickerProps) {
  const resolvedUrl = useResolvedMediaUrl(videoUrl)
  const { uploadFiles, uploading } = useMedia()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [scrub, setScrub] = useState(0)
  const [duration, setDuration] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPlaying(false)
    setScrub(0)
    setDuration(0)
    setError(null)
  }, [resolvedUrl, videoUrl])

  const readDuration = useCallback((el: HTMLVideoElement) => {
    const d = el.duration
    if (Number.isFinite(d) && d > 0) setDuration(d)
  }, [])

  const togglePlay = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } else {
      el.pause()
      setPlaying(false)
    }
  }, [])

  const onScrub = useCallback((next: number) => {
    setScrub(next)
    const el = videoRef.current
    if (!el) return
    el.pause()
    setPlaying(false)
    el.currentTime = next
  }, [])

  const captureThumbnail = useCallback(async () => {
    const el = videoRef.current
    if (!el || !resolvedUrl) return
    setBusy(true)
    setError(null)
    try {
      if (el.readyState < 2) {
        await new Promise<void>((resolve, reject) => {
          const onOk = () => {
            cleanup()
            resolve()
          }
          const onErr = () => {
            cleanup()
            reject(new Error('Video kon niet worden geladen.'))
          }
          const cleanup = () => {
            el.removeEventListener('loadeddata', onOk)
            el.removeEventListener('error', onErr)
          }
          el.addEventListener('loadeddata', onOk)
          el.addEventListener('error', onErr)
        })
      }
      if ('requestVideoFrameCallback' in el) {
        await new Promise<void>((resolve) => {
          el.requestVideoFrameCallback(() => resolve())
        })
      } else {
        await new Promise<void>((r) => window.setTimeout(r, 80))
      }
      const { blob } = await captureCurrentVideoFrame(el, 1920)
      const file = new File([blob], `collab-thumbnail-${Date.now()}.webp`, {
        type: 'image/webp',
      })
      const created = await uploadFiles([file])
      const asset = created[0]
      if (!asset) throw new Error('Upload mislukt.')
      onThumbnail(asset.publicUrl || toMediaRef(asset.id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Thumbnail maken mislukt.'
      setError(message === 'TAINTED_CANVAS' ? TAINTED_MESSAGE : message)
    } finally {
      setBusy(false)
    }
  }, [onThumbnail, resolvedUrl, uploadFiles])

  if (!videoUrl.trim()) return null

  const uploadBusy = busy || (uploading !== null && uploading.stage !== 'error' && uploading.stage !== 'done')

  return (
    <Field
      label="Thumbnail uit video"
      hint="Scrub naar het gewenste frame en zet dat beeld als poster-foto."
    >
      <div className="space-y-2">
        {!resolvedUrl ? (
          <p className="rounded-lg bg-amber-500/10 px-2.5 py-2 text-[11px] leading-relaxed text-amber-600">
            Video-URL laden…
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-neutral-50">
            <div className="relative aspect-[4/3] w-full bg-neutral-900">
              <video
                ref={videoRef}
                key={resolvedUrl}
                src={resolvedUrl}
                crossOrigin="anonymous"
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover object-center"
                onLoadedMetadata={(e) => readDuration(e.currentTarget)}
                onLoadedData={(e) => readDuration(e.currentTarget)}
                onDurationChange={(e) => readDuration(e.currentTarget)}
                onTimeUpdate={(e) => setScrub(e.currentTarget.currentTime)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              />
              <button
                type="button"
                onClick={togglePlay}
                className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm hover:bg-black/65"
                aria-label={playing ? 'Pauzeren' : 'Afspelen'}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        {resolvedUrl && duration > 0 ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-[10px] tabular-nums text-neutral-500">
              <span>{formatTime(scrub)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.05}
              value={Math.min(scrub, duration)}
              disabled={!duration}
              onChange={(e) => onScrub(Number(e.target.value))}
              className="h-1.5 w-full accent-neutral-700 disabled:opacity-40"
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!resolvedUrl || uploadBusy}
            onClick={() => void captureThumbnail()}
            className="cms-secondary-action rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
          >
            {uploadBusy ? 'Bezig…' : 'Gebruik als thumbnail'}
          </button>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-[11px] leading-relaxed text-red-800">
            {error}
          </p>
        ) : null}

        {uploadBusy && uploading?.message ? (
          <p className="rounded-lg bg-sky-500/10 px-2.5 py-2 text-[11px] leading-relaxed text-sky-600">
            {uploading.message}
          </p>
        ) : null}
      </div>
    </Field>
  )
}
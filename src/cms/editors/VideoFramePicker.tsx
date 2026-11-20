import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { Field } from '@/cms/fields'
import { captureCurrentVideoFrame } from '@/cms/media/convert'
import { useMedia } from '@/cms/media/MediaProvider'
import { toMediaRef } from '@/cms/media/refs'
import { useResolvedMediaUrl } from '@/cms/media/useResolvedMediaUrl'
import { OptimizedImg } from '@/components/ui/OptimizedImg'

const TAINTED_MESSAGE =
  'Kan geen beeld uit deze video halen, upload de video via de mediabibliotheek'

const INITIAL_FRAME_OFFSET = 0.1

type VideoFramePickerProps = {
  videoUrl: string
  onThumbnail: (url: string) => void
  currentImage?: string
  onClearImage?: () => void
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function waitForSeeked(video: HTMLVideoElement): Promise<void> {
  if (video.seeking) {
    return new Promise((resolve, reject) => {
      const onOk = () => {
        cleanup()
        resolve()
      }
      const onErr = () => {
        cleanup()
        reject(new Error('Video kon niet worden geladen.'))
      }
      const cleanup = () => {
        video.removeEventListener('seeked', onOk)
        video.removeEventListener('error', onErr)
      }
      video.addEventListener('seeked', onOk)
      video.addEventListener('error', onErr)
    })
  }
  return Promise.resolve()
}

function waitForReadyState(video: HTMLVideoElement, minState: number): Promise<void> {
  if (video.readyState >= minState) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const onOk = () => {
      if (video.readyState >= minState) {
        cleanup()
        resolve()
      }
    }
    const onErr = () => {
      cleanup()
      reject(new Error('Video kon niet worden geladen.'))
    }
    const cleanup = () => {
      video.removeEventListener('loadeddata', onOk)
      video.removeEventListener('canplay', onOk)
      video.removeEventListener('error', onErr)
    }
    video.addEventListener('loadeddata', onOk)
    video.addEventListener('canplay', onOk)
    video.addEventListener('error', onErr)
    onOk()
  })
}

function videoFrameLooksBlack(video: HTMLVideoElement): boolean {
  if (!video.videoWidth || !video.videoHeight) return false
  const canvas = document.createElement('canvas')
  canvas.width = 16
  canvas.height = 16
  const ctx = canvas.getContext('2d')
  if (!ctx) return false
  ctx.drawImage(video, 0, 0, 16, 16)
  try {
    const { data } = ctx.getImageData(0, 0, 16, 16)
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 4 || data[i + 1] > 4 || data[i + 2] > 4) return false
    }
    return true
  } catch {
    return false
  }
}

async function waitForPaintedFrame(video: HTMLVideoElement): Promise<void> {
  await waitForReadyState(video, 2)
  await waitForSeeked(video)
  if ('requestVideoFrameCallback' in video) {
    await new Promise<void>((resolve) => {
      video.requestVideoFrameCallback(() => resolve())
    })
    return
  }
  await new Promise<void>((r) => window.setTimeout(r, 50))
}

export function VideoFramePicker({
  videoUrl,
  onThumbnail,
  currentImage,
  onClearImage,
}: VideoFramePickerProps) {
  const resolvedUrl = useResolvedMediaUrl(videoUrl)
  const previewImage = useResolvedMediaUrl(currentImage)
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

  const primeFirstFrame = useCallback((el: HTMLVideoElement) => {
    readDuration(el)
    const d = el.duration
    const target =
      Number.isFinite(d) && d > 0
        ? Math.min(INITIAL_FRAME_OFFSET, Math.max(0, d - 0.05))
        : INITIAL_FRAME_OFFSET
    el.currentTime = target
  }, [readDuration])

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

  const captureFrameBlob = useCallback(async (el: HTMLVideoElement) => {
    await waitForPaintedFrame(el)
    let result = await captureCurrentVideoFrame(el, 1920)
    if (videoFrameLooksBlack(el)) {
      await new Promise<void>((r) => window.setTimeout(r, 150))
      await waitForPaintedFrame(el)
      result = await captureCurrentVideoFrame(el, 1920)
    }
    return result
  }, [])

  const captureThumbnail = useCallback(async () => {
    const el = videoRef.current
    if (!el || !resolvedUrl) return
    setBusy(true)
    setError(null)
    try {
      el.pause()
      setPlaying(false)
      const at = Math.min(scrub, duration > 0 ? duration : scrub)
      if (Math.abs(el.currentTime - at) > 0.02) {
        el.currentTime = at
      }
      const { blob } = await captureFrameBlob(el)
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
  }, [captureFrameBlob, duration, onThumbnail, resolvedUrl, scrub, uploadFiles])

  if (!videoUrl.trim()) return null

  const uploadBusy =
    busy || (uploading !== null && uploading.stage !== 'error' && uploading.stage !== 'done')

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
                preload="auto"
                className="h-full w-full object-cover object-center"
                onLoadedMetadata={(e) => primeFirstFrame(e.currentTarget)}
                onDurationChange={(e) => readDuration(e.currentTarget)}
                onSeeked={(e) => setScrub(e.currentTarget.currentTime)}
                onTimeUpdate={(e) => {
                  const el = e.currentTarget
                  if (!el.seeking) setScrub(el.currentTime)
                }}
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

        {previewImage ? (
          <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
            <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
              <OptimizedImg
                src={previewImage}
                alt=""
                size="thumb"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Huidige thumbnail
              </p>
              {onClearImage ? (
                <button
                  type="button"
                  className="mt-1 text-[11px] font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900"
                  onClick={onClearImage}
                >
                  Verwijderen
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

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
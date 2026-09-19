import { useContext, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { MediaContext } from '@/cms/media/MediaContext'
import { parseMediaRef } from '@/cms/media/refs'
import { useResolvedMediaUrl } from '@/cms/media/useResolvedMediaUrl'
import {
  bindMobilePlayback,
  browserCanPlayWebm,
  guessVideoSourceType,
  mediaLooksWebm,
  pauseVideo,
  releaseVideo,
  requestPlay,
} from '@/components/artists/videoPlayback'

function canPlayInThisBrowser(url?: string) {
  if (!url) return false
  return !(mediaLooksWebm(url) && !browserCanPlayWebm())
}

type CollabMediaProps = {
  image: string
  video?: string
  className?: string
  priority?: boolean
  /** Short frame so mobile slides can keep caption text on screen. */
  frame?: 'editorial' | 'carousel'
}

/**
 * Editorial still + muted loop. Reuses artist iOS playback helpers
 * (playsinline / mute / single active clip) so offscreen slides pause.
 */
export function CollabMedia({
  image,
  video,
  className = '',
  priority = false,
  frame = 'editorial',
}: CollabMediaProps) {
  const reduceMotion = useReducedMotion()
  const media = useContext(MediaContext)
  const tileRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inViewRef = useRef(false)
  const [inView, setInView] = useState(false)
  const [armed, setArmed] = useState(false)
  const [playing, setPlaying] = useState(false)

  const clipRef = video?.trim() || ''
  const clipPlayable = canPlayInThisBrowser(clipRef)
  const resolvedClip = useResolvedMediaUrl(clipPlayable ? clipRef : undefined)
  const posterUrl = useResolvedMediaUrl(image)
  const mediaId = parseMediaRef(clipRef)
  const localUrl = media?.assets.find(
    (item) => item.id === mediaId || item.publicUrl === clipRef,
  )?.url
  const clipUrl = !reduceMotion && clipPlayable ? localUrl || resolvedClip : ''
  const sourceType = clipUrl ? guessVideoSourceType(clipUrl) : undefined

  useEffect(() => {
    const node = tileRef.current
    if (!node) return
    if (!window.IntersectionObserver) {
      setInView(true)
      setArmed(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.45
        setInView(inViewRef.current)
        if (entry.isIntersecting) setArmed(true)
      },
      { rootMargin: '80px', threshold: [0, 0.25, 0.45, 0.7] },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const element = videoRef.current
    if (!element || !clipUrl || !armed) return
    bindMobilePlayback(element)
    if (inView) requestPlay(element)
    else pauseVideo(element)
  }, [armed, inView, clipUrl])

  useEffect(() => {
    return () => {
      const element = videoRef.current
      if (element) releaseVideo(element)
    }
  }, [clipUrl])

  return (
    <div
      ref={tileRef}
      className={`group relative overflow-hidden rounded-[1.75rem] bg-black sm:rounded-[2rem] ${
        frame === 'carousel'
          ? 'h-[min(36svh,16.5rem)]'
          : 'aspect-[4/5]'
      } ${className}`}
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt=""
          className={`wf-media-zoom absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            playing ? 'opacity-0' : 'opacity-100'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-black" />
      )}
      {clipUrl && armed ? (
        <video
          key={clipUrl}
          ref={(element) => {
            videoRef.current = element
            if (element) bindMobilePlayback(element)
          }}
          className="absolute inset-0 h-full w-full object-cover"
          poster={posterUrl || undefined}
          muted
          autoPlay={inView}
          playsInline
          loop
          preload={inView ? 'auto' : 'metadata'}
          controls={false}
          disablePictureInPicture
          onLoadedMetadata={(event) => {
            bindMobilePlayback(event.currentTarget)
            if (inViewRef.current) requestPlay(event.currentTarget)
          }}
          onLoadedData={(event) => {
            if (inViewRef.current) requestPlay(event.currentTarget)
          }}
          onCanPlay={(event) => {
            if (inViewRef.current) requestPlay(event.currentTarget)
          }}
          onPlaying={(event) => {
            bindMobilePlayback(event.currentTarget)
            setPlaying(true)
          }}
          onPause={() => setPlaying(false)}
          onError={() => {
            const element = videoRef.current
            if (element) pauseVideo(element)
            setPlaying(false)
          }}
          onPointerUp={() => {
            const element = videoRef.current
            if (element) requestPlay(element)
          }}
        >
          <source src={clipUrl} type={sourceType} />
        </video>
      ) : null}
    </div>
  )
}

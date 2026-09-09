import type { Artist } from '@/types/artist'
import { normalizeArtistVideos } from '@/cms/artistVideos'
import { ArtistReelsCarousel } from '@/components/artists/ArtistReelsCarousel'

type ArtistVideoSlideProps = {
  artist: Artist
  /** Show CMS empty-state when no video is linked yet */
  showEmptyState?: boolean
  /** CMS live preview — muted autoplay on the active reel */
  previewMode?: boolean
}

/**
 * Artist page Visuals section — cinematic filmstrip for short vertical clips.
 * Public playback uses generated `clipUrl` only — never the original file.
 */
export function ArtistVideoSlide({
  artist,
  showEmptyState = false,
  previewMode = false,
}: ArtistVideoSlideProps) {
  const videos = normalizeArtistVideos(artist)
  const visibleVideos = previewMode
    ? videos
    : videos.filter((video) => Boolean(video.clipUrl?.trim() || video.posterUrl?.trim()))

  if (!visibleVideos.length && !showEmptyState) return null

  return (
    <ArtistReelsCarousel
      artist={artist}
      videos={visibleVideos}
      showEmptyState={showEmptyState}
      previewMode={previewMode}
    />
  )
}

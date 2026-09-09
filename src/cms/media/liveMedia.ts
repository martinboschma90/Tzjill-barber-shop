import type { MediaAsset } from '@/cms/media/types'

/** Generated website clip — short MP4, never the uploaded original. */
export function isLiveClipAsset(asset: MediaAsset) {
  if (asset.kind !== 'video') return false
  if (/-clip(\.|$)/i.test(asset.name)) return true
  const mp4 = asset.mimeType.includes('mp4') || /\.mp4(\?|#|$)/i.test(asset.name)
  const short = !asset.duration || asset.duration <= 8.5
  const light = asset.size > 0 && asset.size <= 3 * 1024 * 1024
  return mp4 && short && light
}

/** Raw upload used in CMS to cut a clip — not loaded on the public site. */
export function isSourceVideoAsset(asset: MediaAsset) {
  return asset.kind === 'video' && !isLiveClipAsset(asset)
}

export function isLiveImageAsset(asset: MediaAsset) {
  return asset.kind === 'image'
}

/** What the public site may load: portraits, posters, short clips. */
export function isLiveSiteAsset(asset: MediaAsset) {
  return isLiveImageAsset(asset) || isLiveClipAsset(asset)
}

export function liveAssetLabel(asset: MediaAsset) {
  if (isLiveClipAsset(asset)) return 'Live clip'
  if (isLiveImageAsset(asset) && /-poster(\.|$)/i.test(asset.name)) return 'Poster'
  if (isLiveImageAsset(asset)) return 'Live'
  return 'Origineel'
}

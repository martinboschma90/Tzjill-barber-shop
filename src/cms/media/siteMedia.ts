import type { CmsContent } from '@/cms/content'
import type { MediaAsset } from './types'

/** Index references without downloading or copying the files. */
export function collectSiteMedia(content: CmsContent): MediaAsset[] {
  const found = new Map<string, MediaAsset>()
  function visit(value: unknown) {
    if (typeof value === 'string') {
      const url = value.trim()
      if (!/^(\/[^/]|https?:\/\/)/i.test(url)) return
      const extension = url.match(/\.(avif|webp|png|jpe?g|gif|svg|mp4|webm|mov)(?:[?#]|$)/i)?.[1]?.toLowerCase()
      if (!extension || found.has(url)) return
      const video = ['mp4', 'webm', 'mov'].includes(extension)
      const mimeType = `${video ? 'video' : 'image'}/${extension === 'jpg' ? 'jpeg' : extension === 'svg' ? 'svg+xml' : extension === 'mov' ? 'quicktime' : extension}`
      const name = url.split(/[?#]/)[0].split('/').pop() || 'Websitebestand'
      found.set(url, { id: `site:${url}`, name, kind: video ? 'video' : 'image', mimeType, size: 0, createdAt: 0, blob: new Blob([], { type: mimeType }), url, publicUrl: url, source: 'website' })
    } else if (Array.isArray(value)) value.forEach(visit)
    else if (value && typeof value === 'object') Object.values(value).forEach(visit)
  }
  visit(content)
  const labels: [string | undefined, string][] = [
    [content.site.homeHeroImageUrl, 'Homepage — hoofdfoto'],
    [content.site.homeHeroVideoUrl, 'Homepage — video'],
    [content.site.welcomeImageUrl, 'Homepage — welkomstfoto'],
    [content.site.logoUrl, 'Logo'],
    [content.site.texts?.['popup.image'], 'Mailingpop-up'],
    ...(content.site.reviews ?? []).map(r => [r.image, `Review — ${r.name}`] as [string,string]),
    ...(content.site.treatments ?? []).map(r => [r.image, `Behandeling — ${r.title}`] as [string,string]),
    ...content.team.map(r => [r.imageUrl, `Team — ${r.name}`] as [string,string]),
  ]
  const named = new Set<string>()
  for (const [url, label] of labels) {
    const asset = url ? found.get(url) : undefined
    if(asset && url && !named.has(url)){asset.name = `${label} · ${asset.name}`;named.add(url)}
  }
  return [...found.values()]
}

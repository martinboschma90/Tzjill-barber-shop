import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { CmsContent } from '@/cms/content'
import { normalizeSiteContent } from '@/cms/mappers/site'
import { withArtDirection } from '@/cms/imageFocus'
import { coerceArtist } from '@/cms/mappers/artist'
import type { Json } from '@/lib/database.types'
import type { Artist } from '@/types/artist'
import { projectPublishedFromDraft } from '@/cms/api/publicSnapshot'

export type { CmsArtistRow, CmsContentRow } from '@/cms/api/publicCmsRead'
export {
  fetchPublicCmsArtistBySlug,
  fetchPublicCmsArtistsRow,
} from '@/cms/api/publicCmsRead'

function asJson(value: unknown): Json {
  return value as Json
}

function parseCmsBlob(data: unknown): CmsContent | null {
  if (!data || typeof data !== 'object') return null
  const parsed = data as CmsContent
  if (!parsed.site || !Array.isArray(parsed.artists) || !Array.isArray(parsed.team)) {
    return null
  }
  return {
    ...parsed,
    site: normalizeSiteContent(parsed.site),
    artists: parsed.artists.map((artist) => coerceArtist(withArtDirection(artist))),
  }
}

function parseArtist(data: unknown, fallbackSlug: string): Artist | null {
  if (!data || typeof data !== 'object') return null
  const artist = data as Artist
  if (!artist.name) return null
  return coerceArtist(
    withArtDirection({
      ...artist,
      slug: artist.slug || fallbackSlug,
    }),
  )
}

export async function fetchCmsContentRow(
  key: string,
): Promise<{ data: unknown; updatedAt: number; revision: string } | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase
    .from('cms_content')
    .select('key,data,updated_at')
    .eq('key', key)
    .maybeSingle()
  if (error) throw new Error("CMS ophalen mislukt. Er is niets teruggeschreven.")
  if (!data) return null
  return {
    revision: data.updated_at,
    data: data.data,
    updatedAt: new Date(data.updated_at).getTime(),
  }
}

export async function upsertCmsContentRow(
  key: string,
  data: unknown,
): Promise<{ error: string | null; updatedAt: number | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: 'Supabase is not configured', updatedAt: null }
  }
  const { data: row, error } = await supabase
    .from('cms_content')
    .upsert({ key, data: asJson(data) }, { onConflict: 'key' })
    .select('updated_at')
    .single()
  if (error) return { error: error.message, updatedAt: null }
  return {
    error: null,
    updatedAt: row?.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
  }
}

type AdminDocumentRow = {
  draft: unknown
  published: unknown
  updated_at: string | null
  revision: string | null
}

function publishedMatchesDraft(content: CmsContent, published: unknown): boolean {
  const live = parseCmsBlob(published)
  if (!live) return false
  const projected = projectPublishedFromDraft(content)
  return (
    JSON.stringify(projected) ===
    JSON.stringify({
      site: live.site,
      team: live.team,
      artists: live.artists,
    })
  )
}

export async function fetchCmsContentBlob(): Promise<{
  content: CmsContent
  updatedAt: number
  revision: string
  publishedAt: number | null
  needsPublish: boolean
} | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase.rpc('tzjill_admin_document')
  if (error) throw new Error("CMS ophalen mislukt. Er is niets teruggeschreven.")
  const row = data as AdminDocumentRow | null
  if (!row?.draft) return null
  const content = parseCmsBlob(row.draft)
  if (!content) throw new Error("De opgeslagen CMS-inhoud is ongeldig. Er is niets teruggeschreven.")
  const updatedAt = row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
  const revision = row.updated_at ?? row.revision ?? ''
  const inSync = publishedMatchesDraft(content, row.published)
  return {
    content,
    updatedAt,
    revision,
    publishedAt: inSync ? updatedAt : null,
    needsPublish: !inSync,
  }
}

export async function fetchCmsArtists(): Promise<Artist[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('cms_artists')
    .select('id,slug,data,updated_at')
    .order('slug', { ascending: true })
  if (error || !data?.length) return []
  return data
    .map((row) => parseArtist(row.data, row.slug))
    .filter((artist): artist is Artist => Boolean(artist))
}

export async function upsertCmsArtist(
  artist: Artist,
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: 'Supabase is not configured' }
  }
  const payload = {
    slug: artist.slug,
    data: asJson(artist),
  }
  const { error } = await supabase
    .from('cms_artists')
    .upsert(payload, { onConflict: 'slug' })
  return { error: error?.message ?? null }
}

export async function deleteCmsArtist(
  slug: string,
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: 'Supabase is not configured' }
  }
  const { error } = await supabase.from('cms_artists').delete().eq('slug', slug)
  return { error: error?.message ?? null }
}

export async function replaceCmsArtists(
  artists: Artist[],
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: 'Supabase is not configured' }
  }
  const { data: existing, error: listError } = await supabase
    .from('cms_artists')
    .select('slug')
  if (listError) return { error: listError.message }

  const unique = new Map<string, Artist>()
  for (const artist of artists) {
    if (!artist.slug) continue
    unique.set(artist.slug, artist)
  }
  const list = [...unique.values()]

  const keep = new Set(list.map((a) => a.slug))
  for (const artist of list) {
    const { error } = await upsertCmsArtist(artist)
    if (error) return { error }
  }
  const toDelete = (existing ?? [])
    .map((row) => row.slug)
    .filter((slug) => !keep.has(slug))
  if (toDelete.length) {
    const { error } = await supabase.from('cms_artists').delete().in('slug', toDelete)
    if (error) return { error: error.message }
  }
  return { error: null }
}

/** Publish the complete document as one atomic row. Exact server revision prevents lost updates. */
export async function pushCmsSnapshot(
  content: CmsContent,
  expectedRevision: string | null,
  publish = false,
): Promise<{ error: string | null; updatedAt: number | null; revision: string | null }> {
  if (!supabase) return { error: 'Supabase is not configured', updatedAt: null, revision: expectedRevision }
  const p_expected = expectedRevision ? expectedRevision : null
  const { data, error } = await supabase.rpc('tzjill_save_document', {
    p_draft: asJson(content),
    p_publish: publish,
    p_expected,
  })
  if (error) {
    const conflict =
      error.code === '40001' ||
      error.message?.toLowerCase().includes('conflict')
    return {
      error: conflict
        ? 'De inhoud is intussen elders gewijzigd. Je wijzigingen blijven lokaal bewaard. Herlaad en vergelijk vóór je opnieuw opslaat.'
        : 'Opslaan mislukt. Je wijzigingen blijven lokaal bewaard. Herlaad om opnieuw te verbinden.',
      updatedAt: null,
      revision: expectedRevision,
    }
  }
  const row = data as AdminDocumentRow | null
  const updatedAt = row?.updated_at ? Date.parse(row.updated_at) : null
  const revision = row?.updated_at ?? expectedRevision
  return { error: null, updatedAt, revision }
}

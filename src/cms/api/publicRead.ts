import { artistFromRow, artistFromRosterRow, type ArtistRosterRow } from '@/cms/mappers/artist'
import { teamMemberFromRow } from '@/cms/mappers/team'
import { normalizeSiteContent } from '@/cms/mappers/site'
import {
  CMS_STORAGE_KEY,
  PUBLIC_SITE_STORAGE_KEY,
  PUBLIC_TEAM_STORAGE_KEY,
} from '@/cms/storageKeys'
import { fetchPublicCmsArtistBySlug } from '@/cms/api/publicCmsRead'
import { slimPublicArtistDetail } from '@/cms/api/publicArtistsFormat'
import { restGet, publicStorageUrl } from '@/lib/publicRest'
import { isSupabaseConfigured } from '@/lib/supabaseEnv'
import type { ArtistRow, TeamMemberRow } from '@/lib/database.types'
import type { Artist, TeamMember } from '@/types/artist'
import type { SiteContent } from '@/cms/content'
import { dedupeArtists } from '@/cms/dedupeArtists'

export type ArtistsReadResult = {
  artists: Artist[]
  fromSupabase: boolean
}

export const ROSTER_COLUMNS =
  'id,slug,name,genre,image_url,image_alt,image_focus,image_focus_x,image_focus_y,image_scale,art_direction_version,status,published_at,visible'

export async function fetchPublicRoster(): Promise<ArtistsReadResult> {
  if (!isSupabaseConfigured) return { artists: [], fromSupabase: false }

  const data = await restGet<ArtistRosterRow[]>(
    `artists?select=${ROSTER_COLUMNS}&order=name.asc`,
  )
  if (!data?.length) return { artists: [], fromSupabase: false }

  const artists = dedupeArtists(
    data
      .map(artistFromRosterRow)
      .filter((a) => a.status === 'published'),
  )

  return { artists, fromSupabase: true }
}

export async function fetchPublicArtistBySlug(
  slug: string,
): Promise<Artist | null> {
  if (!isSupabaseConfigured || !slug) return null
  const fromStore = await fetchPublicCmsArtistBySlug(slug)
  if (fromStore) return slimPublicArtistDetail(fromStore)
  const data = await restGet<ArtistRow[]>(
    `artists?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`,
  )
  const row = data?.[0]
  if (!row) return null
  return slimPublicArtistDetail(artistFromRow(row))
}

async function fetchCmsContentData(key: string): Promise<unknown | null> {
  const rows = await restGet<{ data: unknown }[]>(
    `cms_content?key=eq.${encodeURIComponent(key)}&select=data&limit=1`,
  )
  return rows?.[0]?.data ?? null
}

function siteFromCmsBlob(data: unknown): SiteContent | null {
  if (!data || typeof data !== 'object' || !('site' in data)) return null
  const site = (data as { site?: unknown }).site
  if (!site || typeof site !== 'object') return null
  return normalizeSiteContent(site)
}

function teamFromUnknown(data: unknown): TeamMember[] | null {
  if (!Array.isArray(data) || data.length === 0) return null
  const team = data.filter(
    (item): item is TeamMember =>
      Boolean(item) &&
      typeof item === 'object' &&
      typeof (item as TeamMember).name === 'string',
  )
  return team.length ? team : null
}

export async function fetchPublicSite(): Promise<SiteContent | null> {
  if (!isSupabaseConfigured) return null
  const direct = await fetchCmsContentData(PUBLIC_SITE_STORAGE_KEY)
  if (direct && typeof direct === 'object') return normalizeSiteContent(direct)
  const fromBlob = siteFromCmsBlob(await fetchCmsContentData(CMS_STORAGE_KEY))
  if (fromBlob) return fromBlob
  const data = await restGet<{ id: string; content: unknown }[]>(
    'site_settings?select=id,content&order=updated_at.desc&limit=1',
  )
  const row = data?.[0]
  if (!row) return null
  return normalizeSiteContent(row.content)
}

export async function fetchPublicTeam(): Promise<TeamMember[] | null> {
  if (!isSupabaseConfigured) return null
  const direct = teamFromUnknown(await fetchCmsContentData(PUBLIC_TEAM_STORAGE_KEY))
  if (direct) return direct
  const blob = await fetchCmsContentData(CMS_STORAGE_KEY)
  const fromBlob =
    blob && typeof blob === 'object' && 'team' in blob
      ? teamFromUnknown((blob as { team?: unknown }).team)
      : null
  if (fromBlob) return fromBlob
  const data = await restGet<TeamMemberRow[]>(
    'team_members?select=id,name,role,image_url,sort_order&order=sort_order.asc',
  )
  if (!data?.length) return null
  return data.map(teamMemberFromRow)
}

export async function fetchPublicMediaUrl(
  mediaId: string,
): Promise<string | null> {
  if (!isSupabaseConfigured || !mediaId) return null
  const data = await restGet<{ storage_path: string }[]>(
    `media_assets?id=eq.${encodeURIComponent(mediaId)}&select=storage_path&limit=1`,
  )
  const path = data?.[0]?.storage_path
  if (!path) return null
  return publicStorageUrl(path)
}

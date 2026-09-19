import { team as defaultTeam } from '@/data/site'
import { createDefaultSiteContent, type CmsContent } from '@/cms/content'

/** Empty shop seed — no leftover music roster. */
export function createDefaultContent(): CmsContent {
  return {
    site: createDefaultSiteContent(),
    team: defaultTeam.map((member) => ({ ...member })),
    artists: [],
  }
}

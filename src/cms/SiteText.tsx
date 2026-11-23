import { useCms } from '@/cms/CmsContext'
import { siteText, type TextDefaultKey } from '@/cms/siteText'
import defaults from '@/cms/textDefaults.json'

export function SiteText({ textKey }: { textKey: TextDefaultKey }) {
  const { content } = useCms()
  return <>{siteText(content.site, textKey)}</>
}

export type { TextDefaultKey }
export type TextDefaultGroup = (typeof defaults)[TextDefaultKey]['group']

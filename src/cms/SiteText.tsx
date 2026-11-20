import { useCms } from '@/cms/CmsContext'
import defaults from '@/cms/textDefaults.json'
export function SiteText({textKey}: {textKey: keyof typeof defaults}) {
 const {content} = useCms()
 return <>{content.site.texts[textKey] ?? defaults[textKey].text}</>
}

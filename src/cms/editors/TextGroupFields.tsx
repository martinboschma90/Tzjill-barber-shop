import defaults from '@/cms/textDefaults.json'
import { useCms } from '@/cms/CmsContext'
import { TextArea } from '@/cms/fields'

/** Editable CMS text fields for one `textDefaults` group (e.g. InstagramFeed). */
export function TextGroupFields({ group }: { group: string }) {
  const {
    content: { site },
    setSite,
  } = useCms()
  const entries = Object.entries(defaults).filter(([, item]) => item.group === group)

  return (
    <div className="space-y-5">
      {entries.map(([key, item]) => (
        <div key={key}>
          <TextArea
            label={item.text}
            value={site.texts[key] ?? item.text}
            onChange={(value) =>
              setSite((s) => ({ ...s, texts: { ...s.texts, [key]: value } }))
            }
          />
          <button
            type="button"
            className="mt-2 text-xs text-neutral-500 underline disabled:opacity-40"
            disabled={site.texts[key] === undefined}
            onClick={() =>
              setSite((s) => {
                const texts = { ...s.texts }
                delete texts[key]
                return { ...s, texts }
              })
            }
          >
            Oorspronkelijke tekst
          </button>
        </div>
      ))}
    </div>
  )
}
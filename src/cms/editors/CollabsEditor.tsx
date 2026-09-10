import { useState } from 'react'
import { useCms } from '@/cms/CmsProvider'
import { cloneCollabs } from '@/cms/content'
import { listBtnClass } from '@/cms/editors/listBtn'
import { AdminListCard } from '@/cms/editors/AdminListCard'
import { TextArea, TextInput } from '@/cms/fields'
import { MediaUrlField } from '@/cms/media/MediaUrlField'

export function CollabsEditor() {
  const { content, setSite } = useCms()
  const collabs = content.site.collabs ?? cloneCollabs()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-2">
      {collabs.map((item, index) => (
        <AdminListCard
          key={`${item.name}-${index}`}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
          thumbnail={
            item.image ? (
              <img src={item.image} alt="" className="h-full w-full object-cover" />
            ) : null
          }
          title={item.name || `Collab ${index + 1}`}
          meta={item.year || 'collab'}
          actions={
            <button
              type="button"
              className={listBtnClass}
              onClick={() =>
                setSite((s) => ({
                  ...s,
                  collabs: s.collabs.filter((_, i) => i !== index),
                }))
              }
            >
              Verwijder
            </button>
          }
        >
          <TextInput
            label="Naam"
            value={item.name}
            onChange={(name) =>
              setSite((s) => ({
                ...s,
                collabs: s.collabs.map((row, i) =>
                  i === index ? { ...row, name } : row,
                ),
              }))
            }
          />
          <TextInput
            label="Jaar"
            value={item.year}
            onChange={(year) =>
              setSite((s) => ({
                ...s,
                collabs: s.collabs.map((row, i) =>
                  i === index ? { ...row, year } : row,
                ),
              }))
            }
          />
          <TextArea
            label="Tekst"
            value={item.text}
            rows={3}
            onChange={(text) =>
              setSite((s) => ({
                ...s,
                collabs: s.collabs.map((row, i) =>
                  i === index ? { ...row, text } : row,
                ),
              }))
            }
          />
          <MediaUrlField
            label="Foto"
            kind="image"
            value={item.image}
            onChange={(image) =>
              setSite((s) => ({
                ...s,
                collabs: s.collabs.map((row, i) =>
                  i === index ? { ...row, image } : row,
                ),
              }))
            }
          />
        </AdminListCard>
      ))}
      <button
        type="button"
        className={listBtnClass}
        onClick={() =>
          setSite((s) => ({
            ...s,
            collabs: [
              ...s.collabs,
              {
                name: 'Nieuwe collab',
                year: '2026',
                text: '',
                image: '/lookbook/01.jpg',
              },
            ],
          }))
        }
      >
        + Collab
      </button>
    </div>
  )
}

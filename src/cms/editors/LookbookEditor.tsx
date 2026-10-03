import { useState } from 'react'
import { useCms } from '@/cms/CmsProvider'
import { cloneLookbook } from '@/cms/content'
import { listBtnClass } from '@/cms/editors/listBtn'
import { AdminListCard } from '@/cms/editors/AdminListCard'
import { TextInput } from '@/cms/fields'
import { MediaUrlField } from '@/cms/media/MediaUrlField'

export function LookbookEditor() {
  const { content, setSite } = useCms()
  const images = content.site.lookbookImages ?? cloneLookbook()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-2">
      {images.map((image, index) => (
        <AdminListCard
          key={`${image.src}-${index}`}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
          thumbnail={
            image.src ? (
              <img src={image.src} alt="" className="h-full w-full object-cover" />
            ) : null
          }
          title={image.alt || `Look ${index + 1}`}
          meta={image.tags.join(', ') || 'lookbook'}
          actions={
            <button
              type="button"
              className={listBtnClass}
              onClick={() =>
                setSite((s) => ({
                  ...s,
                  lookbookImages: s.lookbookImages.filter((_, i) => i !== index),
                }))
              }
            >
              Verwijder
            </button>
          }
        >
          <MediaUrlField
            label="Foto"
            kind="image"
            value={image.src}
            onChange={(src) =>
              setSite((s) => ({
                ...s,
                lookbookImages: s.lookbookImages.map((item, i) =>
                  i === index ? { ...item, src } : item,
                ),
              }))
            }
          />
          <TextInput
            label="Beschrijving"
            value={image.alt}
            placeholder="Fade en baard"
            onChange={(alt) =>
              setSite((s) => ({
                ...s,
                lookbookImages: s.lookbookImages.map((item, i) =>
                  i === index ? { ...item, alt } : item,
                ),
              }))
            }
          />
          <TextInput
            label="Tags"
            hint="Komma: haircut, baard, kids"
            value={image.tags.join(', ')}
            onChange={(value) =>
              setSite((s) => ({
                ...s,
                lookbookImages: s.lookbookImages.map((item, i) =>
                  i === index
                    ? {
                        ...item,
                        tags: value
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      }
                    : item,
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
            lookbookImages: [
              ...s.lookbookImages,
              { src: '/feed/DSC00016.jpg', alt: 'Look', tags: ['haircut'] },
            ],
          }))
        }
      >
        + Look
      </button>
    </div>
  )
}

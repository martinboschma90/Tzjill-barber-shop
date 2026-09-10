import { useState } from 'react'
import { useCms } from '@/cms/CmsProvider'
import { cloneProducts } from '@/cms/content'
import { listBtnClass } from '@/cms/editors/listBtn'
import { AdminListCard } from '@/cms/editors/AdminListCard'
import { TextArea, TextInput } from '@/cms/fields'
import { MediaUrlField } from '@/cms/media/MediaUrlField'

export function ProductsEditor() {
  const { content, setSite } = useCms()
  const products = content.site.products ?? cloneProducts()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-2">
      {products.map((item, index) => (
        <AdminListCard
          key={`${item.name}-${index}`}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
          thumbnail={
            item.image ? (
              <img src={item.image} alt="" className="h-full w-full object-cover" />
            ) : null
          }
          title={item.name || `Product ${index + 1}`}
          meta="products"
          actions={
            <button
              type="button"
              className={listBtnClass}
              onClick={() =>
                setSite((s) => ({
                  ...s,
                  products: s.products.filter((_, i) => i !== index),
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
                products: s.products.map((row, i) =>
                  i === index ? { ...row, name } : row,
                ),
              }))
            }
          />
          <TextArea
            label="Tekst"
            value={item.text}
            rows={2}
            onChange={(text) =>
              setSite((s) => ({
                ...s,
                products: s.products.map((row, i) =>
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
                products: s.products.map((row, i) =>
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
            products: [
              ...s.products,
              {
                name: 'Nieuw product',
                text: 'Koop je in de zaak.',
                image: '/lookbook/04.jpg',
              },
            ],
          }))
        }
      >
        + Product
      </button>
    </div>
  )
}

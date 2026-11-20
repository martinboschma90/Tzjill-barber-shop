import { useState } from 'react'
import { useCms } from '@/cms/CmsContext'
import { listBtnClass } from '@/cms/editors/listBtn'
import { AdminListCard } from '@/cms/editors/AdminListCard'
import { TextGroupFields } from '@/cms/editors/TextGroupFields'
import { EditorSection, TextArea, TextInput, Field, controlClass } from '@/cms/fields'
import { SectionGroup } from '@/cms/flow-mates/cms-ui'
import { MediaUrlField } from '@/cms/media/MediaUrlField'
import type { SiteContent } from '@/cms/content'

const REVIEW_SOURCES = ['', 'Google', 'Instagram', 'WhatsApp'] as const

function emptyReview(): SiteContent['reviews'][number] {
  return { name: '', role: '', quote: '', image: '', video: '', stars: 5, source: '' }
}

export function ReviewsEditor() {
  const {
    content: { site },
    setSite,
  } = useCms()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const update = (
    index: number,
    patch: Partial<SiteContent['reviews'][number]>,
  ) =>
    setSite((s) => ({
      ...s,
      reviews: s.reviews.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }))

  return (
    <EditorSection
      sectionKey="reviews"
      title="Reviews"
      description="Klantreviews op de homepage."
      thumbnail={site.reviews.find((r) => r.image)?.image}
      visible={site.reviewsVisible}
      onVisibleChange={(reviewsVisible) => setSite((s) => ({ ...s, reviewsVisible }))}
    >
      <div className="space-y-7">
        <SectionGroup title="Label boven reviews" description="Klein label boven de sectietitel.">
          <TextGroupFields group="Testimonials" />
        </SectionGroup>
        <SectionGroup title="Sectiekop" description="Titel en intro onder het label.">
          <TextInput
            label="Titel"
            value={site.reviewsTitle}
            onChange={(reviewsTitle) => setSite((s) => ({ ...s, reviewsTitle }))}
          />
          <TextArea
            label="Intro"
            value={site.reviewsIntro}
            onChange={(reviewsIntro) => setSite((s) => ({ ...s, reviewsIntro }))}
          />
        </SectionGroup>
        <SectionGroup title="Reviews" description="Voornaam alleen — geen achternaam of telefoon.">
          {site.reviews.map((review, index) => (
            <AdminListCard
              key={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
              thumbnail={
                review.image ? (
                  <img src={review.image} alt="" className="h-full w-full object-cover" />
                ) : null
              }
              title={review.name || `Review ${index + 1}`}
              meta={[review.source, review.role].filter(Boolean).join(' · ') || 'review'}
              actions={
                <div className="flex gap-1">
                  <button
                    type="button"
                    className={listBtnClass}
                    onClick={() =>
                      setSite((s) => ({
                        ...s,
                        reviews: s.reviews.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    Verwijder
                  </button>
                  {[-1, 1].map((offset) => (
                    <button
                      key={offset}
                      type="button"
                      className={listBtnClass}
                      aria-label={offset < 0 ? 'Omhoog' : 'Omlaag'}
                      disabled={
                        index + offset < 0 || index + offset >= site.reviews.length
                      }
                      onClick={() =>
                        setSite((previous) => {
                          const next = [...previous.reviews]
                          ;[next[index], next[index + offset]] = [
                            next[index + offset],
                            next[index],
                          ]
                          return { ...previous, reviews: next }
                        })
                      }
                    >
                      {offset < 0 ? '↑' : '↓'}
                    </button>
                  ))}
                </div>
              }
            >
              <TextInput
                label="Voornaam"
                value={review.name}
                placeholder="Mark"
                onChange={(name) => update(index, { name })}
              />
              <TextInput
                label="Omschrijving"
                value={review.role}
                onChange={(role) => update(index, { role })}
              />
              <TextArea
                label="Reviewtekst"
                value={review.quote}
                onChange={(quote) => update(index, { quote })}
              />
              <Field label="Sterren">
                <select
                  className={controlClass}
                  value={review.stars ?? 5}
                  onChange={(event) =>
                    update(index, { stars: Number(event.target.value) })
                  }
                >
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <option key={stars} value={stars}>
                      {stars} {stars === 1 ? 'ster' : 'sterren'}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Bron" hint="Waar de review vandaan komt — optioneel.">
                <select
                  className={controlClass}
                  value={review.source ?? ''}
                  onChange={(event) => update(index, { source: event.target.value })}
                >
                  {REVIEW_SOURCES.map((source) => (
                    <option key={source || 'none'} value={source}>
                      {source || 'Geen bron'}
                    </option>
                  ))}
                </select>
              </Field>
              <MediaUrlField
                label="Foto"
                kind="image"
                value={review.image}
                onChange={(image) => update(index, { image })}
              />
              <MediaUrlField
                label="Video"
                kind="video"
                value={review.video ?? ''}
                onChange={(video) => update(index, { video })}
              />
            </AdminListCard>
          ))}
          <button
            type="button"
            className={listBtnClass}
            onClick={() =>
              setSite((s) => ({ ...s, reviews: [...s.reviews, emptyReview()] }))
            }
          >
            + Review toevoegen
          </button>
        </SectionGroup>
      </div>
    </EditorSection>
  )
}
import { useState } from 'react'
import { useCms } from '@/cms/CmsProvider'
import type { BookingTreatmentSetting } from '@/cms/content'
import { ArtistVisibilityToggle } from '@/cms/editors/ArtistVisibilityToggle'
import { listBtnClass } from '@/cms/editors/listBtn'
import { EditorSection, TextArea, TextInput, CompactInput } from '@/cms/fields'
import { loadTreatments, type LiveTreatment } from '@/lib/salonhubApi'

export function BookingEditor() {
  const { content, setSite } = useCms()
  const { site } = content
  const visible = site.bookingVisible !== false
  const [live, setLive] = useState<LiveTreatment[] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(false)

  const settings = site.bookingTreatments

  async function loadLive() {
    setLoading(true)
    setLoadError('')
    try {
      const result = await loadTreatments(crypto.randomUUID())
      setLive(result.treatments)
      setSite((current) => {
        const existing = new Map(
          current.bookingTreatments.map((item) => [item.salonhubTreatmentId, item]),
        )
        const bookingTreatments: BookingTreatmentSetting[] = result.treatments.map(
          (item, index) => {
            const saved = existing.get(item.id)
            return {
              salonhubTreatmentId: item.id,
              label: saved?.label ?? '',
              sortOrder: saved?.sortOrder ?? index,
              active: saved?.active ?? true,
            }
          },
        )
        return { ...current, bookingTreatments }
      })
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Lijst laden mislukt.')
    } finally {
      setLoading(false)
    }
  }

  function patch(id: string, next: Partial<BookingTreatmentSetting>) {
    setSite((current) => ({
      ...current,
      bookingTreatments: current.bookingTreatments.map((item) =>
        item.salonhubTreatmentId === id ? { ...item, ...next } : item,
      ),
    }))
  }

  return (
    <>
      <EditorSection
        title="Visibility"
        description="Show or hide the public Booking page. Content is kept when hidden."
        defaultOpen
        badge="Settings"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/8 bg-ink/[0.03] px-3.5 py-3">
          <div>
            <p className="type-label text-[0.65rem] tracking-[0.14em] text-ink/45 uppercase">
              Booking page
            </p>
            <p className="type-body mt-1 text-xs text-ink/45">
              {visible
                ? 'Visible at /booking'
                : 'Hidden — visitors are redirected home'}
            </p>
          </div>
          <ArtistVisibilityToggle
            visible={visible}
            onChange={(bookingVisible) =>
              setSite((s) => ({ ...s, bookingVisible }))
            }
          />
        </div>
      </EditorSection>

      <EditorSection
        title="Intro"
        description="Headline and supporting copy above the booking flow."
        defaultOpen
        badge="Content"
      >
        <TextInput
          label="Title"
          value={site.bookingTitle}
          onChange={(bookingTitle) => setSite((s) => ({ ...s, bookingTitle }))}
        />
        <TextArea
          label="Intro"
          value={site.bookingIntro}
          rows={3}
          onChange={(bookingIntro) => setSite((s) => ({ ...s, bookingIntro }))}
        />
      </EditorSection>

      <EditorSection
        title="Behandelingen"
        description="De widget leest naam, prijs en duur live uit Salonhub. Hier verberg, hernoem of sorteer je ze. Een lege lijst toont de hele live catalogus."
        defaultOpen
        badge="Salonhub"
      >
        <button type="button" className={listBtnClass} onClick={() => void loadLive()} disabled={loading}>
          {loading ? 'Laden…' : 'Salonhub-lijst laden'}
        </button>
        {loadError ? <p className="text-xs text-red-700">{loadError}</p> : null}
        {!settings.length ? (
          <p className="type-body text-xs leading-relaxed text-ink/45">
            Nog geen uitzonderingen. Bezoekers zien elke behandeling die Salonhub teruggeeft.
          </p>
        ) : (
          <ul className="space-y-3">
            {settings
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item) => {
                const fromLive = live?.find((row) => row.id === item.salonhubTreatmentId)
                return (
                  <li
                    key={item.salonhubTreatmentId}
                    className="rounded-xl border border-ink/8 px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-ink">
                        {fromLive?.name || `Salonhub ${item.salonhubTreatmentId}`}
                        {fromLive?.priceLabel ? (
                          <span className="text-ink/45"> · {fromLive.priceLabel}</span>
                        ) : null}
                      </p>
                      <label className="flex items-center gap-2 text-[11px] text-ink/55">
                        <input
                          type="checkbox"
                          checked={item.active}
                          onChange={(event) =>
                            patch(item.salonhubTreatmentId, { active: event.target.checked })
                          }
                        />
                        Zichtbaar
                      </label>
                    </div>
                    <div className="mt-2 grid grid-cols-[1fr_5rem] gap-2">
                      <CompactInput
                        value={item.label}
                        placeholder="Label (leeg = Salonhub-naam)"
                        onChange={(label) => patch(item.salonhubTreatmentId, { label })}
                      />
                      <CompactInput
                        value={String(item.sortOrder)}
                        placeholder="0"
                        onChange={(value) => {
                          const sortOrder = Number(value.replace(/\D/g, ''))
                          patch(item.salonhubTreatmentId, {
                            sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
                          })
                        }}
                      />
                    </div>
                  </li>
                )
              })}
          </ul>
        )}
        <p className="type-body text-xs leading-relaxed text-ink/40">
          Afspraak aanmaken gaat via de server naar Salonhub. De klant blijft op Tzjill.
          Zie docs/SALONHUB-API.md.
        </p>
      </EditorSection>
    </>
  )
}

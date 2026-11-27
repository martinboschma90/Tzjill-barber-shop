import { useCms } from '@/cms/CmsProvider'
import { listBtnClass } from '@/cms/editors/listBtn'
import { TextInput, Field } from '@/cms/fields'
import type { SiteNavLink } from '@/cms/content'
import { defaultNavLinks } from '@/lib/siteNav'

const desktopOptions = [
  { value: 'left', label: 'Desktop links' },
  { value: 'right', label: 'Desktop rechts' },
  { value: 'none', label: 'Niet in desktopbalk' },
] as const

const footerOptions = [
  { value: 'main', label: "Footer: Pagina's" },
  { value: 'studio', label: 'Footer: Studio' },
] as const

function emptyLink(): SiteNavLink {
  return {
    label: 'Link',
    to: '/',
    visible: true,
    desktop: 'none',
    footerSection: 'main',
  }
}

export function NavLinksEditor() {
  const { content, setSite } = useCms()
  const links = content.site.navLinks ?? defaultNavLinks()

  const setLinks = (next: SiteNavLink[]) =>
    setSite((site) => ({ ...site, navLinks: next }))

  const update = (index: number, patch: Partial<SiteNavLink>) => {
    setLinks(links.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  const move = (index: number, offset: number) => {
    const next = index + offset
    if (next < 0 || next >= links.length) return
    const copy = [...links]
    ;[copy[index], copy[next]] = [copy[next], copy[index]]
    setLinks(copy)
  }

  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div
          key={`nav-${index}-${link.to}`}
          className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              {link.label || `Link ${index + 1}`}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                className={listBtnClass}
                aria-label="Omhoog"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                className={listBtnClass}
                aria-label="Omlaag"
                disabled={index === links.length - 1}
                onClick={() => move(index, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                className={listBtnClass}
                onClick={() => setLinks(links.filter((_, i) => i !== index))}
              >
                Verwijder
              </button>
            </div>
          </div>
          <TextInput
            label="Label"
            value={link.label}
            onChange={(label) => update(index, { label })}
          />
          <TextInput
            label="Pad"
            value={link.to}
            hint="Bijv. /prijzen of /contact"
            onChange={(to) => update(index, { to })}
          />
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={link.visible}
              onChange={(event) => update(index, { visible: event.target.checked })}
            />
            Zichtbaar
          </label>
          <Field label="Desktop header">
            <select
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              value={link.desktop}
              onChange={(event) =>
                update(index, {
                  desktop: event.target.value as SiteNavLink['desktop'],
                })
              }
            >
              {desktopOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Footerkolom">
            <select
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              value={link.footerSection}
              onChange={(event) =>
                update(index, {
                  footerSection: event.target.value as SiteNavLink['footerSection'],
                })
              }
            >
              {footerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      ))}
      <button
        type="button"
        className={listBtnClass}
        onClick={() => setLinks([...links, emptyLink()])}
      >
        + Navigatielink
      </button>
      <button
        type="button"
        className={listBtnClass}
        onClick={() => setLinks(defaultNavLinks())}
      >
        Standaardvolgorde
      </button>
    </div>
  )
}
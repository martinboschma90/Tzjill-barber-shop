import { useCms } from '@/cms/CmsProvider'
import { cloneShopMenu } from '@/cms/content'
import { listBtnClass } from '@/cms/editors/listBtn'
import { CompactInput, EditorSection, TextInput } from '@/cms/fields'

export function PricesEditor() {
  const { content, setSite } = useCms()
  const menu = content.site.shopMenu ?? cloneShopMenu()

  return (
    <div className="space-y-3">
      {menu.map((category, catIndex) => (
        <EditorSection
          key={category.id}
          title={category.label || 'Categorie'}
          description="Naam links, prijs rechts — zoals op de site."
          defaultOpen={catIndex === 0}
        >
          <TextInput
            label="Categorie"
            value={category.label}
            placeholder="Knippen"
            onChange={(label) =>
              setSite((s) => ({
                ...s,
                shopMenu: (s.shopMenu ?? cloneShopMenu()).map((c, i) =>
                  i === catIndex ? { ...c, label } : c,
                ),
              }))
            }
          />
          {category.groups.map((group, groupIndex) => (
            <div key={`${category.id}-${groupIndex}`} className="space-y-2">
              <CompactInput
                value={group.title}
                placeholder="Groep (optioneel)"
                onChange={(title) =>
                  setSite((s) => ({
                    ...s,
                    shopMenu: (s.shopMenu ?? cloneShopMenu()).map((c, i) =>
                      i !== catIndex
                        ? c
                        : {
                            ...c,
                            groups: c.groups.map((g, gi) =>
                              gi === groupIndex ? { ...g, title } : g,
                            ),
                          },
                    ),
                  }))
                }
              />
              <div className="grid grid-cols-[1fr_5.5rem_3.5rem] gap-2 px-0.5 text-[11px] text-neutral-500">
                <span>Behandeling</span>
                <span>Prijs</span>
                <span>Min</span>
              </div>
              {group.items.map((item, itemIndex) => (
                <div
                  key={`${item.name}-${itemIndex}`}
                  className="grid grid-cols-[1fr_5.5rem_3.5rem_auto] gap-2"
                >
                  <CompactInput
                    value={item.name}
                    placeholder="Fade"
                    onChange={(name) =>
                      setSite((s) => ({
                        ...s,
                        shopMenu: (s.shopMenu ?? cloneShopMenu()).map((c, i) =>
                          i !== catIndex
                            ? c
                            : {
                                ...c,
                                groups: c.groups.map((g, gi) =>
                                  gi !== groupIndex
                                    ? g
                                    : {
                                        ...g,
                                        items: g.items.map((it, ii) =>
                                          ii === itemIndex ? { ...it, name } : it,
                                        ),
                                      },
                                ),
                              },
                        ),
                      }))
                    }
                  />
                  <CompactInput
                    value={item.price}
                    placeholder="€35"
                    onChange={(price) =>
                      setSite((s) => ({
                        ...s,
                        shopMenu: (s.shopMenu ?? cloneShopMenu()).map((c, i) =>
                          i !== catIndex
                            ? c
                            : {
                                ...c,
                                groups: c.groups.map((g, gi) =>
                                  gi !== groupIndex
                                    ? g
                                    : {
                                        ...g,
                                        items: g.items.map((it, ii) =>
                                          ii === itemIndex ? { ...it, price } : it,
                                        ),
                                      },
                                ),
                              },
                        ),
                      }))
                    }
                  />
                  <CompactInput
                    value={item.minutes ? String(item.minutes) : ''}
                    placeholder="min"
                    onChange={(value) => {
                      const minutes = Number(value.replace(/\D/g, ''))
                      setSite((s) => ({
                        ...s,
                        shopMenu: (s.shopMenu ?? cloneShopMenu()).map((c, i) =>
                          i !== catIndex
                            ? c
                            : {
                                ...c,
                                groups: c.groups.map((g, gi) =>
                                  gi !== groupIndex
                                    ? g
                                    : {
                                        ...g,
                                        items: g.items.map((it, ii) =>
                                          ii === itemIndex
                                            ? {
                                                ...it,
                                                minutes:
                                                  Number.isFinite(minutes) && minutes > 0
                                                    ? minutes
                                                    : undefined,
                                              }
                                            : it,
                                        ),
                                      },
                                ),
                              },
                        ),
                      }))
                    }}
                  />
                  <button
                    type="button"
                    className={listBtnClass}
                    onClick={() =>
                      setSite((s) => ({
                        ...s,
                        shopMenu: (s.shopMenu ?? cloneShopMenu()).map((c, i) =>
                          i !== catIndex
                            ? c
                            : {
                                ...c,
                                groups: c.groups.map((g, gi) =>
                                  gi !== groupIndex
                                    ? g
                                    : {
                                        ...g,
                                        items: g.items.filter((_, ii) => ii !== itemIndex),
                                      },
                                ),
                              },
                        ),
                      }))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={listBtnClass}
                onClick={() =>
                  setSite((s) => ({
                    ...s,
                    shopMenu: (s.shopMenu ?? cloneShopMenu()).map((c, i) =>
                      i !== catIndex
                        ? c
                        : {
                            ...c,
                            groups: c.groups.map((g, gi) =>
                              gi !== groupIndex
                                ? g
                                : {
                                    ...g,
                                    items: [...g.items, { name: '', price: '€' }],
                                  },
                            ),
                          },
                    ),
                  }))
                }
              >
                + Regel
              </button>
            </div>
          ))}
        </EditorSection>
      ))}
    </div>
  )
}

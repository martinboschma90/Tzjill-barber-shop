import { SiteText } from '@/cms/SiteText'
import { useMemo, useState } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { buttonClass } from '@/components/ui/buttonStyles'
import { useCms } from '@/cms/CmsContext'
import type { FaqCategory, FaqItem } from '@/cms/content'

function visibleCategories(categories: FaqCategory[]): FaqCategory[] {
  return categories
    .filter((category) => category.visible)
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => item.visible && item.question.trim()),
    }))
    .filter((category) => category.items.length > 0)
}

export function HomeFaq() {
  const { content } = useCms()
  const categories = useMemo(
    () => visibleCategories(content.site.faqCategories ?? []),
    [content.site.faqCategories],
  )
  const filters = useMemo(
    () => [
      { id: 'all', label: 'Alle' },
      ...categories.map((category) => ({
        id: category.id,
        label: category.title.trim() || category.id,
      })),
    ],
    [categories],
  )
  const allItems = useMemo(
    () => categories.flatMap((category) => category.items),
    [categories],
  )
  const [filter, setFilter] = useState<string>('all')
  const [open, setOpen] = useState<string | null>(null)

  const visible: FaqItem[] = useMemo(() => {
    if (filter === 'all') return allItems
    const match = categories.find((category) => category.id === filter)
    return match?.items ?? []
  }, [allItems, categories, filter])

  if (!allItems.length) return null

  return (
    <section data-cms-section="texts-HomeFaq" id="faq" className="text-white">
      <div className="content-wrap section-y">
        <div className="mx-auto max-w-3xl text-center">
            <p className="type-label inline-flex items-center justify-center gap-2 text-white/65">
              <span className="h-1.5 w-1.5 rounded-full bg-white/55" aria-hidden />
              <SiteText textKey="HomeFaq.1" />
            </p>
            <Reveal>
              <h2 className="type-headline mt-5">
                <SiteText textKey="HomeFaq.2" />
                <br />
                <SiteText textKey="HomeFaq.3" />
              </h2>
            </Reveal>
            <p className="type-lead mx-auto mt-5 max-w-lg text-white/55">
              <SiteText textKey="HomeFaq.4" />
            </p>
        </div>

        {filters.length > 1 ? (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {filters.map((item) => {
              const active = filter === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setFilter(item.id)
                    setOpen(null)
                  }}
                  className={buttonClass({
                    variant: active ? 'solid' : 'ghost',
                    surface: 'dark',
                    className: 'px-5 py-2.5',
                  })}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        ) : null}

        <ul className="mx-auto mt-10 max-w-2xl space-y-3">
          {visible.map((item) => {
            const isOpen = open === item.id
            return (
              <li
                key={item.id}
                {...(isOpen ? { 'data-faq-open': '' } : {})}
                className={`group overflow-hidden rounded-[1.25rem] border transition-colors duration-300 sm:rounded-[1.5rem] ${
                  isOpen
                    ? 'border-[#efeae3] bg-[#efeae3]'
                    : 'border-white/12 bg-white/[0.03] hover:border-[#efeae3] hover:bg-[#efeae3]'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left sm:px-7 sm:py-6"
                >
                  <span
                    className={`type-lead ${
                      isOpen
                        ? 'text-[#2c241c]'
                        : 'text-white group-hover:text-[#2c241c]'
                    }`}
                  >
                    {item.question}
                  </span>
                  <span
                    aria-hidden
                    className={`type-ui shrink-0 transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                      isOpen ? 'rotate-45 text-[#2c241c]/70' : 'text-white/65 group-hover:text-[#2c241c]/70'
                    }`}
                  >
                    +
                  </span>
                </button>
                {item.answer.trim() ? (
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`type-lead px-6 pb-8 pr-8 sm:px-7 sm:pb-6 ${
                          isOpen
                            ? 'text-[#2c241c]/60'
                            : 'text-white/50 group-hover:text-[#2c241c]/60'
                        }`}
                      >
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
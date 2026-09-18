import { useMemo, useState } from 'react'
import { SHOP_FAQ_FILTERS, SHOP_FAQ_ITEMS } from '@/data/shopFaq'

type FilterId = (typeof SHOP_FAQ_FILTERS)[number]['id']

export function HomeFaq() {
  const [filter, setFilter] = useState<FilterId>('all')
  const [open, setOpen] = useState<number | null>(0)

  const visible = useMemo(
    () =>
      filter === 'all'
        ? SHOP_FAQ_ITEMS
        : SHOP_FAQ_ITEMS.filter((item) => item.tag === filter),
    [filter],
  )

  return (
    <section className="text-white">
      <div className="mx-auto max-w-[1240px] px-8 section-y sm:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="type-label inline-flex items-center justify-center gap-2 text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-white/55" aria-hidden />
            FAQ
          </p>
          <h2 className="type-headline mt-5">
            Voor je in
            <br />
            de stoel zit
          </h2>
          <p className="type-lead mx-auto mt-5 max-w-lg text-white/55">
            Boeken, te laat, kids — de rest regel je aan de balie.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {SHOP_FAQ_FILTERS.map((item) => {
            const active = filter === item.id
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setFilter(item.id)
                  setOpen(0)
                }}
                className={`type-ui rounded-full border px-5 py-2.5 transition-[color,background-color,border-color,transform] duration-300 hover:-translate-y-px ${
                  active
                    ? 'border-[#efeae3] bg-[#efeae3] text-[#2c241c]'
                    : 'border-white/25 bg-transparent text-white/70 hover:border-white hover:text-white'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <ul className="mx-auto mt-10 max-w-2xl space-y-3">
          {visible.map((item, index) => {
            const isOpen = open === index
            return (
              <li
                key={item.q}
                className={`group overflow-hidden rounded-[1.25rem] border transition-colors duration-300 sm:rounded-[1.5rem] ${
                  isOpen
                    ? 'border-[#efeae3] bg-[#efeae3]'
                    : 'border-white/12 bg-white/[0.03] hover:border-[#efeae3] hover:bg-[#efeae3]'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left sm:px-7 sm:py-6"
                >
                  <span
                    className={`type-lead ${
                      isOpen
                        ? 'text-[#2c241c]'
                        : 'text-white group-hover:text-[#2c241c]'
                    }`}
                  >
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className={`type-ui shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-45 text-[#2c241c]/45' : 'text-white/40 group-hover:text-[#2c241c]/45'
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p
                      className={`type-lead px-6 pb-6 sm:px-7 ${
                        isOpen
                          ? 'text-[#2c241c]/60'
                          : 'text-white/50 group-hover:text-[#2c241c]/60'
                      }`}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

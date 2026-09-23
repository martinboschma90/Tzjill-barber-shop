import { useState } from 'react'
import { FaqAnswer } from '@/components/faq/FaqAnswer'
import type { SeoFaqItem } from '@/data/seoPages'

export function SeoFaq({
  id = 'faq',
  kicker,
  title,
  intro,
  items,
}: {
  id?: string
  kicker: string
  title: string
  intro?: string
  items: readonly SeoFaqItem[]
}) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id={id} className="text-white">
      <div className="mx-auto max-w-3xl">
        <p className="type-label inline-flex items-center gap-2 text-white/45">
          <span className="h-1.5 w-1.5 rounded-full bg-white/55" aria-hidden />
          {kicker}
        </p>
        <h2 className="type-headline mt-5">{title}</h2>
        {intro ? (
          <p className="type-lead mt-5 max-w-lg text-white/55">{intro}</p>
        ) : null}
      </div>
      <ul className="mx-auto mt-10 max-w-2xl space-y-3">
        {items.map((item, index) => {
          const isOpen = open === index
          return (
            <li
              key={item.q}
              {...(isOpen ? { 'data-faq-open': '' } : {})}
              className={`overflow-hidden rounded-[1.25rem] border transition-colors duration-300 sm:rounded-[1.5rem] ${
                isOpen
                  ? 'border-[#efeae3] bg-[#efeae3]'
                  : 'border-white/12 bg-white/[0.03] hover:border-[#efeae3] hover:bg-[#efeae3]'
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : index)}
                className="group flex w-full items-center justify-between gap-6 px-6 py-5 text-left sm:px-7 sm:py-6"
              >
                <span
                  className={`type-lead ${
                    isOpen ? 'text-[#1c1b19]' : 'text-white group-hover:text-[#1c1b19]'
                  }`}
                >
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className={`type-ui shrink-0 transition-transform duration-300 ${
                    isOpen
                      ? 'rotate-45 text-[#1c1b19]/45'
                      : 'text-white/40 group-hover:text-[#1c1b19]/45'
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
                      isOpen ? 'text-[#1c1b19]/70' : 'text-white/50'
                    }`}
                  >
                    <FaqAnswer text={item.a} />
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

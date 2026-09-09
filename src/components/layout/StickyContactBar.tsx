import { openSalonhub } from '@/lib/salonhub'

export function StickyContactBar() {
  return (
    <button
      type="button"
      onClick={() => openSalonhub()}
      className="type-ui group fixed bottom-5 right-4 z-[55] inline-flex items-center gap-2 rounded-full border border-[#efeae3] bg-[#efeae3] px-5 py-3 text-[#2c241c] transition-[color,background-color,transform] duration-300 hover:-translate-y-px hover:bg-white sm:bottom-6 sm:right-6"
    >
      Afspraak
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
        →
      </span>
    </button>
  )
}

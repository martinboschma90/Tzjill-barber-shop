import { useMemo, useState } from 'react'

const WEEKDAYS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'] as const

type DateAgendaProps = {
  dates: string[]
  value: string
  onSelect: (iso: string) => void
}

function monthParts(key: string) {
  const [year, month] = key.split('-').map(Number)
  return { year: year || 1970, month: (month || 1) - 1 }
}

function isoFrom(year: number, monthIndex: number, day: number) {
  const month = String(monthIndex + 1).padStart(2, '0')
  const date = String(day).padStart(2, '0')
  return `${year}-${month}-${date}`
}

function monthTitle(key: string) {
  const { year, month } = monthParts(key)
  return new Intl.DateTimeFormat('nl-NL', { month: 'long', year: 'numeric' }).format(
    new Date(year, month, 1),
  )
}

function longDay(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(year || 1970, (month || 1) - 1, day || 1))
}

/**
 * Month grid of Salonhub bookable days. Days that are not in `dates` stay quiet.
 */
export function DateAgenda({ dates, value, onSelect }: DateAgendaProps) {
  const months = useMemo(() => [...new Set(dates.map((iso) => iso.slice(0, 7)))].sort(), [dates])
  const available = useMemo(() => new Set(dates), [dates])
  const [cursor, setCursor] = useState<string | null>(null)
  const activeMonth =
    (cursor && months.includes(cursor) && cursor) ||
    (value && months.includes(value.slice(0, 7)) && value.slice(0, 7)) ||
    months[0] ||
    ''
  const monthIndex = Math.max(0, months.indexOf(activeMonth))

  const cells = useMemo(() => {
    if (!activeMonth) return []
    const { year, month } = monthParts(activeMonth)
    const first = new Date(year, month, 1)
    const pad = (first.getDay() + 6) % 7
    const count = new Date(year, month + 1, 0).getDate()
    const slots: ({ iso: string; day: number; open: boolean } | null)[] = []
    for (let i = 0; i < pad; i += 1) slots.push(null)
    for (let day = 1; day <= count; day += 1) {
      const iso = isoFrom(year, month, day)
      slots.push({ iso, day, open: available.has(iso) })
    }
    while (slots.length % 7 !== 0) slots.push(null)
    return slots
  }, [activeMonth, available])

  const openThisMonth = cells.filter((cell) => cell?.open).length

  return (
    <div className="mt-7 overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] px-3 py-4 sm:px-5 sm:py-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Vorige maand"
          disabled={monthIndex <= 0}
          onClick={() => setCursor(months[monthIndex - 1] || activeMonth)}
          className="type-ui flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-[#f6f3ee] disabled:border-white/10 disabled:text-white/25"
        >
          ←
        </button>
        <div className="min-w-0 text-center">
          <p className="type-lead capitalize text-[#f6f3ee]">{monthTitle(activeMonth)}</p>
          <p className="type-label mt-1 text-white/40">
            {openThisMonth} {openThisMonth === 1 ? 'dag vrij' : 'dagen vrij'}
          </p>
        </div>
        <button
          type="button"
          aria-label="Volgende maand"
          disabled={monthIndex >= months.length - 1}
          onClick={() => setCursor(months[monthIndex + 1] || activeMonth)}
          className="type-ui flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-[#f6f3ee] disabled:border-white/10 disabled:text-white/25"
        >
          →
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1" role="grid" aria-label="Agenda">
        {WEEKDAYS.map((label) => (
          <span key={label} className="type-label pb-1 text-center text-white/35">
            {label}
          </span>
        ))}
        {cells.map((cell, index) =>
          cell ? (
            <button
              key={cell.iso}
              type="button"
              role="gridcell"
              disabled={!cell.open}
              aria-pressed={value === cell.iso}
              aria-label={longDay(cell.iso)}
              onClick={() => {
                setCursor(cell.iso.slice(0, 7))
                onSelect(cell.iso)
              }}
              className={`flex h-11 items-center justify-center rounded-xl text-[15px] ${
                value === cell.iso
                  ? 'bg-[#efeae3] text-[#2c241c]'
                  : cell.open
                    ? 'bg-white/[0.06] text-[#f6f3ee] hover:bg-[#efeae3] hover:text-[#2c241c]'
                    : 'text-white/20'
              }`}
            >
              {cell.day}
            </button>
          ) : (
            <span key={`empty-${index}`} aria-hidden className="h-11" />
          ),
        )}
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        {value ? (
          <>
            <p className="type-lead capitalize text-[#f6f3ee]">{longDay(value)}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-white/50">
              Deze dag is vrij. De tijden komen in de volgende stap.
            </p>
          </>
        ) : (
          <p className="text-[13px] leading-relaxed text-white/50">
            Kies een vrije dag. Alleen dagen met plek in de agenda zijn aanklikbaar.
          </p>
        )}
      </div>
    </div>
  )
}

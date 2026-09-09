const phrases = [
  'Haircut',
  'Hot towel shave',
  'Leeuwarden',
  'A man’s world',
  'Fade',
  'Straight razor',
  'Kids cut',
]

export function Ticker() {
  const loop = [...phrases, ...phrases]

  return (
    <div
      className="overflow-hidden border-y border-white/10 py-4 text-white"
      aria-hidden
    >
      <div className="wf-marquee flex w-max gap-10">
        {loop.map((phrase, index) => (
          <span key={`${phrase}-${index}`} className="flex items-center gap-10">
            <span className="type-ui whitespace-nowrap text-white/55">{phrase}</span>
            <span className="h-1 w-1 rounded-full bg-white/25" />
          </span>
        ))}
      </div>
    </div>
  )
}

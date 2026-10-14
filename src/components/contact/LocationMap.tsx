import { useState } from 'react'
import { MAPS_DIRECTIONS_URL, MAPS_EMBED_URL } from '@/data/site'

export function LocationMap() {
  const [enabled, setEnabled] = useState(false)
  return (
    <div>
      <div className="overflow-hidden rounded-[1.25rem] bg-black">
        {enabled ? <iframe
          title="Tzjill Barber & Lounge op de kaart"
          src={MAPS_EMBED_URL}
          className="h-32 w-full border-0 grayscale-[20%] contrast-[1.05] sm:h-36"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        /> : <div className="flex h-32 items-center justify-center px-4 sm:h-36"><button type="button" onClick={() => setEnabled(true)} className="type-ui min-h-11 rounded-full border border-white/60 px-5 py-3 text-white">Kaart laden · Google Maps</button></div>}
      </div>
      <a
        href={MAPS_DIRECTIONS_URL}
        target="_blank"
        rel="noreferrer"
        className="type-ui mt-2 inline-block text-white/55 hover:text-white"
      >
        Route →
      </a>
    </div>
  )
}

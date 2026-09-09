import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'

export type MapDot = {
  id: string
  label: string
  lng: number
  lat: number
  value: number
  kind?: 'city' | 'country'
  artists?: string[]
  cities?: string[]
}

/** Approximate country centroids (lng, lat) for visitor dots. */
const COUNTRY_XY: Record<string, [number, number]> = {
  NL: [5.3, 52.1],
  BE: [4.5, 50.5],
  DE: [10.5, 51.2],
  FR: [2.2, 46.2],
  GB: [-1.5, 52.5],
  UK: [-1.5, 52.5],
  ES: [-3.7, 40.4],
  IT: [12.6, 42.8],
  PT: [-8.2, 39.4],
  CH: [8.2, 46.8],
  AT: [14.6, 47.6],
  US: [-98.6, 39.8],
  CA: [-96.0, 56.1],
  BR: [-51.9, -14.2],
  MX: [-102.5, 23.6],
  AU: [133.8, -25.3],
  NZ: [174.9, -41.3],
  JP: [138.3, 36.5],
  KR: [127.8, 35.9],
  CN: [104.2, 35.9],
  IN: [78.9, 21.8],
  ID: [113.9, -0.8],
  AE: [53.8, 23.4],
  SA: [45.1, 24.0],
  TR: [35.2, 39.0],
  PL: [19.1, 52.0],
  SE: [18.6, 62.2],
  NO: [8.5, 60.5],
  DK: [10.0, 56.0],
  IE: [-8.2, 53.1],
  CZ: [15.5, 49.8],
  GR: [21.8, 39.1],
  ZA: [25.1, -29.0],
  EG: [30.8, 26.8],
  NG: [8.7, 9.1],
  AR: [-64.0, -34.0],
  CL: [-71.5, -35.7],
  CO: [-74.3, 4.6],
  RU: [90.0, 60.0],
  UA: [31.2, 48.4],
  RO: [25.0, 45.9],
  HU: [19.5, 47.2],
  FI: [26.0, 64.0],
  SG: [103.8, 1.4],
  TH: [100.5, 15.9],
  VN: [108.3, 14.1],
  PH: [122.0, 12.9],
  MY: [102.0, 4.2],
}

const CITY_XY: Record<string, [number, number]> = {
  amsterdam: [4.9, 52.37],
  rotterdam: [4.48, 51.92],
  utrecht: [5.12, 52.09],
  antwerp: [4.4, 51.22],
  antwerpen: [4.4, 51.22],
  brussels: [4.35, 50.85],
  brussel: [4.35, 50.85],
  berlin: [13.4, 52.52],
  paris: [2.35, 48.86],
  london: [-0.13, 51.51],
  madrid: [-3.7, 40.42],
  barcelona: [2.17, 41.39],
  rome: [12.5, 41.9],
  milano: [9.19, 45.46],
  milan: [9.19, 45.46],
  lisbon: [-9.14, 38.72],
  zurich: [8.54, 47.38],
  vienna: [16.37, 48.21],
  'new york': [-74.0, 40.71],
  'los angeles': [-118.24, 34.05],
  miami: [-80.19, 25.76],
  chicago: [-87.63, 41.88],
  toronto: [-79.38, 43.65],
  dubai: [55.27, 25.2],
  tokyo: [139.69, 35.68],
  sydney: [151.21, -33.87],
  singapore: [103.82, 1.35],
  eindhoven: [5.48, 51.44],
  'den haag': [4.3, 52.07],
  'the hague': [4.3, 52.07],
  haarlem: [4.64, 52.38],
  groningen: [6.57, 53.22],
  gent: [3.73, 51.05],
  ghent: [3.73, 51.05],
  hamburg: [9.99, 53.55],
  cologne: [6.96, 50.94],
  koln: [6.96, 50.94],
  munich: [11.58, 48.14],
  munchen: [11.58, 48.14],
  lyon: [4.84, 45.76],
  marseille: [5.37, 43.3],
  manchester: [-2.24, 53.48],
  birmingham: [-1.9, 52.49],
  dublin: [-6.26, 53.35],
  oslo: [10.75, 59.91],
  stockholm: [18.07, 59.33],
  copenhagen: [12.57, 55.68],
  kobenhavn: [12.57, 55.68],
  warsaw: [21.01, 52.23],
  prague: [14.44, 50.08],
  budapest: [19.04, 47.5],
  porto: [-8.61, 41.15],
  geneva: [6.14, 46.2],
  basel: [7.59, 47.56],
  austin: [-97.74, 30.27],
  seattle: [-122.33, 47.61],
  boston: [-71.06, 42.36],
  'san francisco': [-122.42, 37.77],
  washington: [-77.04, 38.91],
  houston: [-95.37, 29.76],
  atlanta: [-84.39, 33.75],
  denver: [-104.99, 39.74],
  montreal: [-73.57, 45.5],
  vancouver: [-123.12, 49.28],
  melbourne: [144.96, -37.81],
  auckland: [174.76, -36.85],
  seoul: [126.98, 37.57],
  shanghai: [121.47, 31.23],
  beijing: [116.41, 39.9],
  mumbai: [72.88, 19.08],
  jakarta: [106.85, -6.21],
  'cape town': [18.42, -33.92],
  johannesburg: [28.05, -26.2],
  istanbul: [28.98, 41.01],
  athens: [23.73, 37.98],
  helsinki: [24.94, 60.17],
  edinburgh: [-3.19, 55.95],
  glasgow: [-4.25, 55.86],
}

export function coordsForCountry(code?: string): [number, number] | null {
  const key = code?.trim().toUpperCase()
  if (!key) return null
  return COUNTRY_XY[key] ?? null
}

function normalizeCity(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(',')[0]
    .trim()
}

export function coordsForCity(name?: string): [number, number] | null {
  const key = name ? normalizeCity(name) : ''
  if (!key) return null
  return CITY_XY[key] ?? null
}

const MAP_W = 1000
const MAP_H = 500
const MIN_VIEW_W = 90
type View = { x: number; y: number; w: number; h: number }
const WORLD: View = { x: 0, y: 0, w: MAP_W, h: MAP_H }

function project(lng: number, lat: number) {
  return {
    x: ((lng + 180) / 360) * MAP_W,
    y: ((90 - lat) / 180) * MAP_H,
  }
}

function clampView(view: View): View {
  const w = Math.min(MAP_W, Math.max(MIN_VIEW_W, view.w))
  const h = w / 2
  const x = Math.min(MAP_W - w, Math.max(0, view.x))
  const y = Math.min(MAP_H - h, Math.max(0, view.y))
  return { x, y, w, h }
}

function fitDots(dots: { x: number; y: number }[]): View {
  if (!dots.length) return WORLD
  const xs = dots.map((dot) => dot.x)
  const ys = dots.map((dot) => dot.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const spanX = Math.max(48, maxX - minX)
  const spanY = Math.max(24, maxY - minY)
  const pad = Math.max(28, Math.max(spanX, spanY * 2) * 0.35)
  const w = Math.min(MAP_W, Math.max(spanX + pad * 2, (spanY + pad) * 2))
  const h = w / 2
  return clampView({
    x: (minX + maxX) / 2 - w / 2,
    y: (minY + maxY) / 2 - h / 2,
    w,
    h,
  })
}

function zoomView(view: View, factor: number, cx: number, cy: number): View {
  const w = view.w * factor
  const k = w / view.w
  return clampView({
    x: cx - (cx - view.x) * k,
    y: cy - (cy - view.y) * k,
    w,
    h: w / 2,
  })
}

export function WorldTrafficMap({ dots }: { dots: MapDot[] }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ id: number; x: number; y: number; view: View } | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const plotted = useMemo(
    () =>
      dots
        .filter((dot) => Number.isFinite(dot.lng) && Number.isFinite(dot.lat))
        .map((dot) => ({ ...dot, ...project(dot.lng, dot.lat) })),
    [dots],
  )
  const home = useMemo(() => fitDots(plotted), [plotted])
  const [view, setView] = useState<View>(home)
  const viewRef = useRef(view)
  viewRef.current = view
  const homeKey = `${home.x.toFixed(1)}:${home.y.toFixed(1)}:${home.w.toFixed(1)}`

  useEffect(() => {
    setView(home)
  }, [home, homeKey])

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const current = viewRef.current
      const box = frame.getBoundingClientRect()
      const cx = current.x + ((event.clientX - box.left) / box.width) * current.w
      const cy = current.y + ((event.clientY - box.top) / box.height) * current.h
      setView(zoomView(current, event.deltaY > 0 ? 1.12 : 0.88, cx, cy))
    }
    frame.addEventListener('wheel', onWheel, { passive: false })
    return () => frame.removeEventListener('wheel', onWheel)
  }, [plotted.length])

  const max = Math.max(1, ...plotted.map((dot) => dot.value))
  const zoom = MAP_W / view.w
  const active = plotted.find((dot) => dot.id === activeId) ?? null

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, view }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId) return
    const box = frameRef.current?.getBoundingClientRect()
    if (!box) return
    const dx = ((event.clientX - drag.x) / box.width) * drag.view.w
    const dy = ((event.clientY - drag.y) / box.height) * drag.view.h
    setView(clampView({ ...drag.view, x: drag.view.x - dx, y: drag.view.y - dy }))
  }

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.id === event.pointerId) dragRef.current = null
  }

  if (!plotted.length) return null

  return (
    <div className="cms-world-map relative h-full min-h-[240px] overflow-hidden rounded-xl lg:min-h-[300px]">
      <div
        ref={frameRef}
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseLeave={() => setActiveId(null)}
      >
        <svg
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          className="h-full w-full"
          role="img"
          aria-label="Kaart met bezoekerslocaties"
          preserveAspectRatio="xMidYMid meet"
        >
          <rect className="cms-world-ocean" width={MAP_W} height={MAP_H} />
          <image
            href="/cms/world.svg"
            x="0"
            y="0"
            width={MAP_W}
            height={MAP_H}
            className="cms-world-land pointer-events-none"
          />
          {plotted.map((dot) => {
            const r = (5.5 + (dot.value / max) * 8) / Math.sqrt(zoom)
            const lit = activeId === dot.id
            return (
              <g
                key={dot.id}
                className="cursor-pointer"
                onPointerEnter={() => setActiveId(dot.id)}
                onPointerDown={(event) => {
                  event.stopPropagation()
                  setActiveId(dot.id)
                }}
              >
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={r * 2.4}
                  fill={lit ? 'rgba(16,185,129,0.28)' : 'rgba(16,185,129,0.14)'}
                />
                <circle cx={dot.x} cy={dot.y} r={r} fill={lit ? '#6ee7b7' : '#34d399'} />
              </g>
            )
          })}
        </svg>
      </div>

      <div className="absolute top-2 right-2 z-10 flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center text-neutral-700 hover:bg-neutral-50"
          onClick={() =>
            setView(zoomView(view, 0.82, view.x + view.w / 2, view.y + view.h / 2))
          }
          aria-label="Inzoomen"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center border-t border-neutral-200 text-neutral-700 hover:bg-neutral-50"
          onClick={() =>
            setView(zoomView(view, 1.18, view.x + view.w / 2, view.y + view.h / 2))
          }
          aria-label="Uitzoomen"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center border-t border-neutral-200 text-neutral-700 hover:bg-neutral-50"
          onClick={() => setView(home)}
          aria-label="Reset view"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {active ? (
        <div className="pointer-events-none absolute bottom-2 left-2 z-10 max-w-[220px] rounded-lg border border-neutral-200 bg-white px-2.5 py-2 shadow-sm">
          <p className="text-[12px] font-semibold text-neutral-900">{active.label}</p>
          <p className="mt-0.5 text-[11px] text-emerald-700">
            {new Intl.NumberFormat('nl-NL').format(active.value)} bezoeken
          </p>
          {active.cities?.length ? (
            <p className="mt-1 text-[11px] leading-snug text-neutral-500">
              {active.cities.join(' · ')}
            </p>
          ) : null}
          {active.artists?.length ? (
            <p className="mt-1 text-[11px] leading-snug text-neutral-400">
              {active.artists.join(' · ')}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="pointer-events-none absolute bottom-2 left-3 text-[10px] text-neutral-400">
          Scroll om te zoomen · sleep om te bewegen
        </p>
      )}
    </div>
  )
}

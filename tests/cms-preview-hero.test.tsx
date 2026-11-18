import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Hero } from '@/components/hero/Hero'
import { CmsPreviewModeProvider } from '@/cms/previews/PreviewMode'

vi.mock('framer-motion', () => ({ useReducedMotion: () => false }))
vi.mock('@/cms/CmsContext', () => ({ useCms: () => ({ content: { site: {
  homeHeroImageUrl: '/feed/DSC00064.jpg', homeHeroVideoUrl: '/brand/hero.mp4',
  fullName: 'Tzjill', homeHeroTitle: 'A man’s world.', homeHeroSubtitle: '',
} } }) }))
vi.mock('@/cms/media/useResolvedMediaUrl', () => ({ useResolvedMediaUrl: (src: string, fallback: string) => src || fallback }))
vi.mock('@/components/motion/Reveal', () => ({ Reveal: ({ children }: { children: ReactNode }) => <>{children}</> }))

function matchMediaFor(width: number) {
  return vi.fn((query: string) => ({
    matches: query === '(min-width: 768px)' && width >= 768,
    media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }))
}

beforeEach(() => { vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined) })
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('hero viewport in CMS preview', () => {
  it.each([390, 1280])('uses the %ipx iframe rather than the desktop CMS window', (width) => {
    vi.stubGlobal('matchMedia', matchMediaFor(1280))
    const frameMedia = matchMediaFor(width)
    const frameWindow = { matchMedia: frameMedia } as unknown as Window
    const { container } = render(<CmsPreviewModeProvider ownerWindow={frameWindow}><Hero /></CmsPreviewModeProvider>)
    expect(Boolean(container.querySelector('video'))).toBe(width < 768)
    expect(frameMedia).toHaveBeenCalledWith('(min-width: 768px)')
  })

  it.each([390, 1280])('keeps the public %ipx hero behavior outside the CMS', (width) => {
    vi.stubGlobal('matchMedia', matchMediaFor(width))
    const { container } = render(<Hero />)
    expect(Boolean(container.querySelector('video'))).toBe(width < 768)
  })
})

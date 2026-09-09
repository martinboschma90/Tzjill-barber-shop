import { AppShell } from '@/components/layout/AppShell'
import { Hero } from '@/components/hero/Hero'
import { Welcome } from '@/components/home/Welcome'
import { Treatments } from '@/components/home/Treatments'
import { HomePrices } from '@/components/home/HomePrices'
import { InstagramFeed } from '@/components/home/InstagramFeed'
import { Testimonials } from '@/components/home/Testimonials'
import { HomeFaq } from '@/components/home/HomeFaq'
import { Newsletter } from '@/components/home/Newsletter'
import { useCms } from '@/cms/CmsContext'
import { prefetchRoute } from '@/lib/prefetchRoute'
import { useEffect } from 'react'

export function HomePage() {
  const { content } = useCms()
  const heroVisible = content.site.homeHeroVisible !== false

  useEffect(() => {
    const warm = () => {
      prefetchRoute('/prijzen')
      prefetchRoute('/lookbook')
      prefetchRoute('/products')
      prefetchRoute('/collabs')
      prefetchRoute('/team')
      prefetchRoute('/over-ons')
      prefetchRoute('/contact')
    }
    const idle = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      }
    ).requestIdleCallback
    if (idle) {
      const id = idle(warm, { timeout: 700 })
      return () =>
        (
          window as Window & { cancelIdleCallback?: (id: number) => void }
        ).cancelIdleCallback?.(id)
    }
    const timer = window.setTimeout(warm, 500)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <AppShell navVariant={heroVisible ? 'hero' : 'wordmark'}>
      {heroVisible ? <Hero /> : null}
      <Welcome />
      <Treatments />
      <HomePrices />
      <InstagramFeed />
      <Testimonials />
      <HomeFaq />
      <Newsletter />
    </AppShell>
  )
}

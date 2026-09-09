import { Hero } from '@/components/hero/Hero'
import { Welcome } from '@/components/home/Welcome'
import { Treatments } from '@/components/home/Treatments'
import { HomePrices } from '@/components/home/HomePrices'
import { InstagramFeed } from '@/components/home/InstagramFeed'
import { Testimonials } from '@/components/home/Testimonials'
import { HomeFaq } from '@/components/home/HomeFaq'
import { Newsletter } from '@/components/home/Newsletter'
import { AppShell } from '@/components/layout/AppShell'
import { useCms } from '@/cms/CmsProvider'
import { PreviewFrame } from '@/cms/previews/PreviewFrame'

export function HomePreview() {
  const { content } = useCms()

  return (
    <PreviewFrame label="Home">
      <AppShell navVariant={content.site.homeHeroVisible !== false ? 'hero' : 'wordmark'}>
        {content.site.homeHeroVisible !== false ? <Hero /> : null}
        <Welcome />
        <Treatments />
        <HomePrices />
        <InstagramFeed />
        <Testimonials />
        <HomeFaq />
        <Newsletter />
      </AppShell>
    </PreviewFrame>
  )
}

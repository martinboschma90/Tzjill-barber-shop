/** Warm lazy route chunks on intent (hover / focus). */
const loaders: Record<string, () => Promise<unknown>> = {
  '/artists/:slug': () => import('@/pages/ArtistPage'),
  '/about': () => import('@/pages/AboutPage'),
  '/over-ons': () => import('@/pages/AboutPage'),
  '/booking': () => import('@/pages/BookingPage'),
  '/faq': () => import('@/pages/FaqPage'),
  '/contact': () => import('@/pages/ContactPage'),
  '/menu': () => import('@/pages/MenuPage'),
  '/prijzen': () => import('@/pages/MenuPage'),
  '/team': () => import('@/pages/TeamPage'),
  '/lookbook': () => import('@/pages/LookbookPage'),
  '/products': () => import('@/pages/ProductsPage'),
  '/collabs': () => import('@/pages/CollabsPage'),
}

const warmed = new Set<string>()

export function prefetchRoute(to: string) {
  const path = to.split('?')[0]
  if (warmed.has(path)) return
  if (path.startsWith('/artists/') && path !== '/artists') {
    warmed.add(path)
    void loaders['/artists/:slug']()
    return
  }
  const load = loaders[path]
  if (!load) return
  warmed.add(path)
  void load()
}


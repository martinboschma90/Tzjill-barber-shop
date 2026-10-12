/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_PUBLIC_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface PublicArtistsBoot {
  cached: unknown
  promise: Promise<unknown>
}

interface Window {
  __TZJILL_BOOT__?: PublicArtistsBoot
  /** Previous boot global, still read if an older HTML document is cached. */
  __NOTYPE_BOOT__?: PublicArtistsBoot
}

/**
 * Tzjill data lives in the shared Flow Mates - Websites project, in its own
 * Postgres schema and storage bucket. PostgREST picks the schema via the
 * Accept-Profile (reads) / Content-Profile (writes) headers.
 */
export const SUPABASE_DB_SCHEMA = 'tzjill'
export const SUPABASE_MEDIA_BUCKET = 'tzjill-media'

export function schemaHeaders() {
  return { 'Accept-Profile': SUPABASE_DB_SCHEMA, 'Content-Profile': SUPABASE_DB_SCHEMA }
}

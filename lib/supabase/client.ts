import { createBrowserClient } from '@supabase/ssr'

function getCleanSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
}

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    getCleanSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

export const supabase = createSupabaseBrowserClient()

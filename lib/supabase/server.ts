import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getCleanSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    getCleanSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Dipanggil dari Server Component, diabaikan karena session di-refresh di middleware
          }
        },
      },
    }
  )
}

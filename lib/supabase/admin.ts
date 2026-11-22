import { createClient } from '@supabase/supabase-js'

function getCleanSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
}

/**
 * Supabase Admin Client yang menggunakan SUPABASE_SERVICE_ROLE_KEY.
 * Bypasses RLS - HANYA boleh digunakan di server actions atau backend jobs.
 */
export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di environment variables.')
  }
  return createClient(getCleanSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

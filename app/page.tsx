import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const instant = false

export default async function HomePage() {
  await connection()
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/invoices')
  } else {
    redirect('/login')
  }
}

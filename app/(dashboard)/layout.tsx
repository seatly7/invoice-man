import * as React from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getInvoiceSettings } from '@/lib/queries/settings.queries'
import { Header } from '@/components/dashboard/Header'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { BottomNav } from '@/components/dashboard/BottomNav'

export const instant = false

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ambil profil bisnis untuk header
  const settings = await getInvoiceSettings()
  const businessName = settings?.businessName || (user.user_metadata?.business_name as string) || 'Usaha Saya'

  return (
    <div className="min-h-dvh flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header Utama */}
      <Header businessName={businessName} userEmail={user.email} />

      {/* Konten Dashboard (Sidebar di Desktop, Full di Mobile) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 w-full p-4 sm:p-6 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Navigasi Bawah Khusus Mobile */}
      <BottomNav />
    </div>
  )
}

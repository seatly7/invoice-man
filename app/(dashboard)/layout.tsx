import * as React from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
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
  await connection()
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ambil profil bisnis untuk header & sidebar
  const settings = await getInvoiceSettings()
  const businessName = settings?.businessName || (user.user_metadata?.business_name as string) || 'Usaha Saya'

  return (
    <div className="min-h-dvh flex bg-zinc-50 dark:bg-zinc-950 print:min-h-0 print:bg-white print:block">
      {/* Sidebar Navigasi Khusus Desktop (Docked to Left Edge) */}
      <div className="print:hidden">
        <Sidebar businessName={businessName} userEmail={user.email} />
      </div>

      {/* Konten Area Utama (Offset by w-64 di Desktop) */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 print:pl-0 print:block">
        {/* Header Atas */}
        <div className="print:hidden">
          <Header businessName={businessName} userEmail={user.email} />
        </div>

        {/* Konten Halaman */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 print:p-0 print:m-0 print:w-full print:max-w-none print:block">
          {children}
        </main>
      </div>

      {/* Navigasi Bawah Khusus Mobile */}
      <div className="print:hidden">
        <BottomNav />
      </div>
    </div>
  )
}

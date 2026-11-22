import * as React from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Branding */}
      <div className="flex flex-col items-center justify-center pt-4 sm:pt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm transition-transform active:scale-95"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 dark:bg-zinc-900/10">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-base">Invoice-Man</span>
        </Link>
        <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Cetak Faktur PDF & Struk Kasir Thermal Cepat
        </p>
      </div>

      {/* Main Form Content Container */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        {children}
      </div>

      {/* Footer Note */}
      <div className="pb-safe text-center text-xs text-zinc-400 dark:text-zinc-600">
        &copy; 2026 Invoice-Man. Desain hemat kuota & ramah mobile.
      </div>
    </div>
  )
}

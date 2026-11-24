import * as React from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import Image from 'next/image'

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
          className="inline-flex items-center gap-2.5 px-3 py-1.5"
        >
          <Image
            alt='Logo'
            height={80}
            width={80}
            className="object-contain"
            priority
            src={"/logo/Invoice_Man_Mascot_Logo.png"}
          />
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

'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { signOutAction } from '@/lib/actions/auth.actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileText, LogOut, User, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export interface HeaderProps {
  businessName?: string
  userEmail?: string
}

export function Header({ businessName, userEmail }: HeaderProps) {
  const [isLoggingOut, startLoggingOut] = useTransition()

  function handleSignOut() {
    const toastId = toast.loading('Sedang keluar dari akun...')
    startLoggingOut(async () => {
      try {
        await signOutAction()
      } catch {
        toast.error('Gagal keluar', { id: toastId })
      }
    })
  }

  return (
    <header className="sticky top-0 z-20 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 pt-safe shadow-[0_1px_3px_rgba(0,0,0,0.02)] print:hidden">
      <div className="flex items-center justify-between h-14 md:h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Tampilan Mobile: Brand & Toko */}
        <div className="flex md:hidden items-center gap-2.5">
          <Link
            href="/invoices"
            className="flex items-center gap-2 font-bold tracking-tight text-base text-zinc-900 dark:text-zinc-100 active:scale-95 transition-transform"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shadow-xs">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span>Invoice-Man</span>
          </Link>

          {businessName && (
            <div className="flex items-center gap-1 pl-2 border-l border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 font-medium max-w-[130px] truncate">
              <span className="truncate">{businessName}</span>
            </div>
          )}
        </div>

        {/* Tampilan Desktop: Konteks Menu / Info */}
        <div className="hidden md:flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Invoice-Man System</span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span>Aplikasi Pembuat Faktur & Struk Kasir</span>
        </div>

        {/* User Profile & Aksi Cepat */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tombol Buat Cepat (Desktop & Tablet) */}
          {/* <Link
            href="/invoices/new"
            className="hidden sm:inline-flex items-center justify-center h-9 px-3.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Buat Invoice</span>
          </Link> */}

          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full w-9 h-9 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors shadow-2xs">
              <User className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none truncate text-zinc-900 dark:text-zinc-100">
                    {businessName || 'Usaha Saya'}
                  </p>
                  <p className="text-xs leading-none text-zinc-500 dark:text-zinc-400 truncate">
                    {userEmail || 'Akun Pengguna'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/settings" className="w-full">
                <DropdownMenuItem className="cursor-pointer">
                  Pengaturan Usaha
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                disabled={isLoggingOut}
                onClick={handleSignOut}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Sedang Keluar...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Keluar Akun</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

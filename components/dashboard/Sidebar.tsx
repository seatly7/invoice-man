'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Package, Settings, Store, LogOut, Loader2 } from 'lucide-react'
import { signOutAction } from '@/lib/actions/auth.actions'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Image from 'next/image'

const NAV_ITEMS = [
  {
    href: '/invoices',
    label: 'Daftar Invoice',
    icon: FileText,
  },
  {
    href: '/products',
    label: 'Master Barang',
    icon: Package,
  },
  {
    href: '/settings',
    label: 'Pengaturan Usaha',
    icon: Settings,
  },
]

export interface SidebarProps {
  businessName?: string
  userEmail?: string
}

export function Sidebar({ businessName, userEmail }: SidebarProps) {
  const pathname = usePathname()
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
    <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-30 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 print:hidden">
      {/* Brand & Logo Header */}
      <div className="h-16 flex items-center px-5 border-b border-zinc-100 dark:border-zinc-800 gap-3">
        <Link
          href="/invoices"
          className="flex items-center gap-2.5 font-bold tracking-tight text-lg text-zinc-900 dark:text-zinc-100"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shadow-xs">
            <Image
              alt='Logo'
              height={50}
              width={50}
              className="object-contain"
              priority
              src={"/logo/Invoice_Man_Mascot_Logo.png"}
            />
          </div>
          <span className="font-semibold tracking-tight">Invoice-Man</span>
        </Link>
      </div>

      {/* Profil Toko / Nama Usaha */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
          <Store className="w-4 h-4 text-zinc-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Profil Toko</p>
            <p className="font-semibold truncate text-zinc-900 dark:text-zinc-100">{businessName || 'Usaha Saya'}</p>
          </div>
        </div>
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Menu Utama
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== '/invoices' && pathname.startsWith(`${item.href}/`)) ||
            (item.href === '/invoices' && pathname.startsWith('/invoices/'))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Section di Bawah Sidebar */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 text-zinc-700 dark:text-zinc-200 text-xs font-bold uppercase">
              {businessName ? businessName.charAt(0) : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {businessName || 'Usaha Saya'}
              </p>
              <p className="text-[11px] text-zinc-400 truncate max-w-[110px]">
                {userEmail || 'Akun'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleSignOut}
            title="Keluar Akun"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}

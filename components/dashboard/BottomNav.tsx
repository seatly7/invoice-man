'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Package, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    href: '/invoices',
    label: 'Invoices',
    icon: FileText,
  },
  {
    href: '/products',
    label: 'Barang',
    icon: Package,
  },
  {
    href: '/settings',
    label: 'Pengaturan',
    icon: Settings,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  // Sembunyikan navigasi bawah pada mode cetak atau saat mengisi formulir baru
  // agar tidak bentrok dengan sticky submit bar di layar ponsel
  if (
    pathname.includes('/print') ||
    pathname.includes('/thermal') ||
    pathname === '/invoices/new'
  ) {
    return null
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.04)] print:hidden">
      <div className="grid grid-cols-3 h-16 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== '/invoices' && pathname.startsWith(`${item.href}/`)) ||
            (item.href === '/invoices' && (pathname === '/invoices' || pathname.startsWith('/invoices/')))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors relative py-1 text-xs font-medium',
                isActive
                  ? 'text-zinc-950 dark:text-white font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-7 rounded-full transition-colors',
                  isActive ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-transparent'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'stroke-[2.2px]' : 'stroke-[1.8px]')} />
              </div>
              <span className="text-[11px] font-medium leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

'use client'

import * as React from 'react'
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

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      <div className="grid grid-cols-3 h-16 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

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
              <span className="text-xs font-medium leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

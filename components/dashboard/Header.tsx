'use client'

import * as React from 'react'
import Link from 'next/link'
import { signOutAction } from '@/lib/actions/auth.actions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileText, LogOut, Store, User } from 'lucide-react'

export interface HeaderProps {
  businessName?: string
  userEmail?: string
}

export function Header({ businessName, userEmail }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 pt-safe shadow-xs">
      <div className="flex items-center justify-between h-14 md:h-16 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="flex items-center gap-2 font-bold tracking-tight text-lg text-zinc-900 dark:text-zinc-100 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">Invoice-Man</span>
          </Link>

          {/* Nama Toko / Bisnis */}
          {businessName && (
            <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
              <Store className="w-3.5 h-3.5 text-zinc-400" />
              <span className="truncate max-w-[200px]">{businessName}</span>
            </div>
          )}
        </div>

        {/* User Profile & Menu Dropdown */}
        <div className="flex items-center gap-2">
          {businessName && (
            <div className="sm:hidden flex items-center gap-1 text-xs text-zinc-700 dark:text-zinc-300 font-medium max-w-[140px] truncate">
              <span>{businessName}</span>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full w-9 h-9 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
              <User className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none truncate">
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
                onClick={() => signOutAction()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Keluar Akun</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export interface PrintButtonProps {
  label?: string
  className?: string
}

export function PrintButton({ label = 'Cetak Sekarang', className = '' }: PrintButtonProps) {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className={`h-10 px-4 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-medium shadow-xs shrink-0 ${className}`}
    >
      <Printer className="w-4 h-4 mr-2" />
      <span>{label}</span>
    </Button>
  )
}

'use client'

import * as React from 'react'
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

export type ResponsiveModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
}

export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: ResponsiveModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg p-6">
          <DialogHeader className="mb-3">
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="pt-1">{children}</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-h-[92dvh] overflow-y-auto px-5 pt-3 pb-8 pb-safe border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 gap-0 shadow-2xl"
      >
        {/* Handle Bar / Indikator Tarik Khas Bottom Sheet Ponsel */}
        <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4 shrink-0" />

        <SheetHeader className="p-0 text-left mb-4 pr-8">
          <SheetTitle className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="w-full">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { InvoiceStatus } from '@/types/invoice.types'
import { updateInvoiceStatusAction, deleteInvoiceAction } from '@/lib/actions/invoice.actions'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export interface InvoiceDetailActionsProps {
  invoiceId: string
  invoiceNumber: string
  status: InvoiceStatus
}

export function InvoiceDetailActions({
  invoiceId,
  invoiceNumber,
  status,
}: InvoiceDetailActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeAction, setActiveAction] = useState<'mark-paid' | 'delete' | null>(null)

  function handleMarkAsPaid() {
    setActiveAction('mark-paid')
    const toastId = toast.loading(`Menandai invoice ${invoiceNumber} lunas...`)

    startTransition(async () => {
      try {
        const res = await updateInvoiceStatusAction(invoiceId, 'paid')
        if (res.error) {
          toast.error('Gagal memperbarui status', { id: toastId, description: res.error })
        } else {
          toast.success(`Invoice ${invoiceNumber} berhasil ditandai Lunas`, { id: toastId })
        }
      } catch {
        toast.error('Terjadi kesalahan saat memproses status', { id: toastId })
      } finally {
        setActiveAction(null)
      }
    })
  }

  function handleDelete() {
    if (!confirm(`Hapus permanen invoice ${invoiceNumber}? Tindakan ini tidak dapat dibatalkan.`)) {
      return
    }

    setActiveAction('delete')
    const toastId = toast.loading(`Menghapus invoice ${invoiceNumber}...`)

    startTransition(async () => {
      try {
        const res = await deleteInvoiceAction(invoiceId)
        if (res.error) {
          toast.error('Gagal menghapus invoice', { id: toastId, description: res.error })
          setActiveAction(null)
        } else {
          toast.success(`Invoice ${invoiceNumber} telah dihapus`, { id: toastId })
          router.push('/invoices')
        }
      } catch {
        toast.error('Terjadi kesalahan saat menghapus invoice', { id: toastId })
        setActiveAction(null)
      }
    })
  }

  return (
    <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
      {status !== 'paid' && (
        <Button
          type="button"
          disabled={isPending}
          onClick={handleMarkAsPaid}
          className="w-full h-11 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs rounded-xl cursor-pointer transition-all active:scale-[0.99] disabled:opacity-70"
        >
          {activeAction === 'mark-paid' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Memproses Lunas...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              <span>Tandai Faktur Lunas</span>
            </>
          )}
        </Button>
      )}

      <Button
        type="button"
        variant="ghost"
        disabled={isPending}
        onClick={handleDelete}
        className="w-full h-10 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl cursor-pointer disabled:opacity-70"
      >
        {activeAction === 'delete' ? (
          <>
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            <span>Menghapus...</span>
          </>
        ) : (
          <>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            <span>Hapus Invoice</span>
          </>
        )}
      </Button>
    </div>
  )
}

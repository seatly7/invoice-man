'use client'

import * as React from 'react'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { InvoiceListItem } from '@/types/invoice.types'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { updateInvoiceStatusAction, deleteInvoiceAction } from '@/lib/actions/invoice.actions'
import { formatRupiah } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  MoreVertical,
  Printer,
  Receipt,
  Download,
  Truck,
  Eye,
  Edit2,
  CheckCircle2,
  Trash2,
  FileQuestion,
  Calendar,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

export interface InvoiceCardListProps {
  initialInvoices: InvoiceListItem[]
}

export function InvoiceCardList({ initialInvoices }: InvoiceCardListProps) {
  const [search, setSearch] = useState('')
  const deferredSearch = React.useDeferredValue(search)
  const [statusFilter, setStatusFilter] = useState<'all' | 'issued' | 'paid' | 'draft'>('all')
  const [isPending, startTransition] = useTransition()
  const [processingAction, setProcessingAction] = useState<{ id: string; type: 'mark-paid' | 'delete' } | null>(null)

  // Filter lokal dengan deferred value untuk performa rendering ketik yang mulus
  const filteredInvoices = initialInvoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(deferredSearch.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(deferredSearch.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter !== 'all') {
      return inv.status === statusFilter
    }
    return true
  })

  function handleMarkAsPaid(inv: InvoiceListItem) {
    setProcessingAction({ id: inv.id, type: 'mark-paid' })
    const toastId = toast.loading(`Menandai invoice ${inv.invoiceNumber} lunas...`)

    startTransition(async () => {
      try {
        const res = await updateInvoiceStatusAction(inv.id, 'paid')
        if (res.error) {
          toast.error('Gagal memperbarui status', { id: toastId, description: res.error })
        } else {
          toast.success(`Invoice ${inv.invoiceNumber} berhasil ditandai Lunas`, { id: toastId })
        }
      } catch {
        toast.error('Terjadi kesalahan saat memproses status', { id: toastId })
      } finally {
        setProcessingAction(null)
      }
    })
  }

  function handleDelete(inv: InvoiceListItem) {
    if (!confirm(`Hapus invoice ${inv.invoiceNumber}? Tindakan ini tidak dapat dibatalkan.`)) {
      return
    }
    setProcessingAction({ id: inv.id, type: 'delete' })
    const toastId = toast.loading(`Menghapus invoice ${inv.invoiceNumber}...`)

    startTransition(async () => {
      try {
        const res = await deleteInvoiceAction(inv.id)
        if (res.error) {
          toast.error('Gagal menghapus', { id: toastId, description: res.error })
        } else {
          toast.success(`Invoice ${inv.invoiceNumber} telah dihapus`, { id: toastId })
        }
      } catch {
        toast.error('Terjadi kesalahan saat menghapus invoice', { id: toastId })
      } finally {
        setProcessingAction(null)
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Bar & Filter Chips & Tombol Buat */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        {/* Row 1 di Mobile: Search + Tombol Buat */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Cari no. invoice atau pelanggan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
          </div>
          <Link
            href="/invoices/new"
            className="sm:hidden inline-flex items-center justify-center h-11 px-3.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Buat</span>
          </Link>
        </div>

        {/* Tab Filter Status & Tombol Buat di Desktop */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end">
          <div className="grid grid-cols-4 sm:flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-1.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors text-center truncate ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('issued')}
              className={`px-1.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors text-center truncate ${
                statusFilter === 'issued'
                  ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 font-semibold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Belum
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('paid')}
              className={`px-1.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors text-center truncate ${
                statusFilter === 'paid'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Lunas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              className={`px-1.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors text-center truncate ${
                statusFilter === 'draft'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Draft
            </button>
          </div>

          <Link
            href="/invoices/new"
            className="hidden sm:inline-flex items-center justify-center h-11 px-4 rounded-xl text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shrink-0 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Buat Invoice</span>
          </Link>
        </div>
      </div>

      {/* Loading Banner Sinkronisasi Data */}
      {isPending && !processingAction && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
          <span>Menyinkronkan daftar invoice...</span>
        </div>
      )}

      {/* Konten Daftar Tagihan */}
      {filteredInvoices.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed border-2 bg-white/50 dark:bg-zinc-900/50 py-12 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <FileQuestion className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base">Belum Ada Invoice</h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-xs mx-auto">
                {search
                  ? 'Tidak ada tagihan yang cocok dengan kata kunci pencarian.'
                  : 'Buat dokumen faktur invoice pertama Anda dengan cepat dan mudah.'}
              </p>
            </div>
            {!search && (
              <Link
                href="/invoices/new"
                className="mt-2 inline-flex items-center justify-center h-9 px-3 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Buat Invoice Pertama
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tampilan Desktop: Table */}
          <div className="hidden md:block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto shadow-xs">
            <Table className="min-w-[700px]">
              <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                <TableRow>
                  <TableHead className="w-32 font-mono text-xs uppercase">No. Invoice</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead className="w-28">Tanggal</TableHead>
                  <TableHead className="w-28">Jatuh Tempo</TableHead>
                  <TableHead className="w-36 text-right">Total Tagihan</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-12 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => {
                  const isItemProcessing = processingAction?.id === inv.id
                  return (
                    <TableRow
                      key={inv.id}
                      className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors ${
                        isItemProcessing ? 'bg-emerald-50/30 dark:bg-emerald-950/20 opacity-70' : ''
                      }`}
                    >
                      <TableCell className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        <Link href={`/invoices/${inv.id}`} className="hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {inv.customerName}
                        </div>
                        {inv.customerPhone && (
                          <div className="text-xs text-zinc-400">
                            {inv.customerPhone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                        {formatDate(inv.issueDate)}
                      </TableCell>
                      <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                        {inv.dueDate ? formatDate(inv.dueDate) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-sm">
                        {formatRupiah(inv.grandTotal)}
                      </TableCell>
                      <TableCell className="text-center">
                        {isItemProcessing ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-pulse">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                            {processingAction.type === 'mark-paid' ? 'Menandai Lunas...' : 'Menghapus...'}
                          </span>
                        ) : (
                          <InvoiceStatusBadge status={inv.status} />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isItemProcessing ? (
                          <div className="h-8 w-8 inline-flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              disabled={isPending}
                              className="h-8 w-8 rounded-md inline-flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer transition-colors disabled:opacity-50"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <Link href={`/invoices/${inv.id}`}>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Eye className="w-4 h-4 mr-2" />
                                  <span>Lihat Detail</span>
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/invoices/${inv.id}/edit`}>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  <span>Ubah / Edit Data</span>
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/invoices/${inv.id}/print`}>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Printer className="w-4 h-4 mr-2" />
                                  <span>Cetak Faktur A4</span>
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/invoices/${inv.id}/print?download=png`}>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Download className="w-4 h-4 mr-2" />
                                  <span>Unduh Gambar (PNG)</span>
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/invoices/${inv.id}/thermal`}>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Receipt className="w-4 h-4 mr-2" />
                                  <span>Cetak Struk 80mm</span>
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/invoices/${inv.id}/surat-jalan`}>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Truck className="w-4 h-4 mr-2" />
                                  <span>Cetak Surat Jalan</span>
                                </DropdownMenuItem>
                              </Link>
                              {inv.status !== 'paid' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleMarkAsPaid(inv)}
                                    disabled={isPending}
                                    className="cursor-pointer text-emerald-600 focus:text-emerald-600"
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    <span>Tandai Lunas</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(inv)}
                                disabled={isPending}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                <span>Hapus Invoice</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Tampilan Mobile: Card Grid (Mobile-First sesuai rancangan Google Stitch) */}
          <div className="grid grid-cols-1 gap-2.5 md:hidden">
            {filteredInvoices.map((inv) => {
              const isItemProcessing = processingAction?.id === inv.id
              return (
                <Card
                  key={inv.id}
                  className={`bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl overflow-hidden active:bg-zinc-50/50 transition-colors ${
                    isItemProcessing
                      ? 'ring-2 ring-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 opacity-75'
                      : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Header baris atas: No Invoice & Status Badge */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
                          >
                            {inv.invoiceNumber}
                          </Link>
                          {isItemProcessing ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse">
                              <Loader2 className="w-3 h-3 animate-spin text-emerald-600 dark:text-emerald-400" />
                              {processingAction.type === 'mark-paid' ? 'Menandai Lunas...' : 'Menghapus...'}
                            </span>
                          ) : (
                            <InvoiceStatusBadge status={inv.status} />
                          )}
                        </div>

                        {/* Nama Pelanggan */}
                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-snug truncate">
                          {inv.customerName}
                        </h4>

                        {/* Info Tanggal */}
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                          <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span>{formatDate(inv.issueDate)}</span>
                          {inv.dueDate && (
                            <span>· Tempo: {formatDate(inv.dueDate)}</span>
                          )}
                        </div>
                      </div>

                      {/* Menu Aksi Titik Tiga */}
                      {isItemProcessing ? (
                        <div className="h-9 w-9 -mr-1.5 -mt-1 inline-flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            disabled={isPending}
                            className="h-9 w-9 -mr-1.5 -mt-1 rounded-md inline-flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <Link href={`/invoices/${inv.id}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" />
                                <span>Lihat Detail</span>
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/invoices/${inv.id}/edit`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit2 className="w-4 h-4 mr-2" />
                                <span>Ubah / Edit Data</span>
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/invoices/${inv.id}/print`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Printer className="w-4 h-4 mr-2" />
                                <span>Cetak Faktur A4</span>
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/invoices/${inv.id}/print?download=png`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Download className="w-4 h-4 mr-2" />
                                <span>Unduh Gambar (PNG)</span>
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/invoices/${inv.id}/thermal`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Receipt className="w-4 h-4 mr-2" />
                                <span>Cetak Struk 80mm</span>
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/invoices/${inv.id}/surat-jalan`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Truck className="w-4 h-4 mr-2" />
                                <span>Cetak Surat Jalan</span>
                              </DropdownMenuItem>
                            </Link>
                            {inv.status !== 'paid' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleMarkAsPaid(inv)}
                                  disabled={isPending}
                                  className="cursor-pointer text-emerald-600 focus:text-emerald-600"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  <span>Tandai Lunas</span>
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(inv)}
                              disabled={isPending}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              <span>Hapus Invoice</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {/* Baris Bawah: Total Rupiah & Quick Button */}
                    <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs text-zinc-500 block">
                          {inv.itemCount} item barang
                        </span>
                        <span className="font-mono font-bold text-base text-zinc-950 dark:text-white">
                          {formatRupiah(inv.grandTotal)}
                        </span>
                      </div>

                      {inv.status !== 'paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => handleMarkAsPaid(inv)}
                          className="h-8 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 cursor-pointer"
                        >
                          {isItemProcessing && processingAction.type === 'mark-paid' ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              <span>Memproses...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                              <span>Tandai Lunas</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

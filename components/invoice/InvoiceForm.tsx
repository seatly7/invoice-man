'use client'

import * as React from 'react'
import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Product } from '@/types/product.types'
import { CreateInvoicePayload, UpdateInvoicePayload, InvoiceStatus, InvoiceWithItems } from '@/types/invoice.types'
import { createInvoiceAction, updateInvoiceAction } from '@/lib/actions/invoice.actions'
import { calcInvoiceTotals } from '@/lib/utils/invoice-calc'
import { formatRupiah } from '@/lib/utils/currency'
import { toDateInputValue } from '@/lib/utils/date'
import { ProductPickerModal } from './ProductPickerModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Plus,
  Minus,
  Trash2,
  Calendar,
  User,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  FileCheck2,
  Save,
  PackagePlus,
  History,
} from 'lucide-react'
import { toast } from 'sonner'

export interface InvoiceFormProps {
  availableProducts: Product[]
  defaultTaxRate?: number
  initialInvoice?: InvoiceWithItems
}

interface FormItem {
  id: string // temporary client id
  productId?: string | null
  itemName: string
  unit: string
  qty: number | string
  unitPrice: number
}

export function InvoiceForm({
  availableProducts,
  defaultTaxRate = 11,
  initialInvoice,
}: InvoiceFormProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const isEditMode = !!initialInvoice

  // Form States
  const [customerName, setCustomerName] = useState(initialInvoice?.customerName || '')
  const [customerPhone, setCustomerPhone] = useState(initialInvoice?.customerPhone || '')
  const [customerAddress, setCustomerAddress] = useState(initialInvoice?.customerAddress || '')

  // Tanggal
  const today = new Date()
  const defaultDue = new Date()
  defaultDue.setDate(today.getDate() + 7)

  const [issueDate, setIssueDate] = useState(
    initialInvoice?.issueDate || toDateInputValue(today)
  )
  const [dueDate, setDueDate] = useState(
    initialInvoice?.dueDate || toDateInputValue(defaultDue)
  )

  // Items
  const [items, setItems] = useState<FormItem[]>(
    initialInvoice?.items?.map((it) => ({
      id: it.id,
      productId: it.productId,
      itemName: it.itemName,
      unit: it.unit,
      qty: it.qty,
      unitPrice: it.unitPrice,
    })) || []
  )
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  // Diskon & Pajak & Catatan
  const [discountAmount, setDiscountAmount] = useState<number>(initialInvoice?.discountAmount || 0)
  const [taxRate, setTaxRate] = useState<number>(initialInvoice?.taxRate ?? defaultTaxRate)
  const [notes, setNotes] = useState(initialInvoice?.notes || '')
  const [revisionNote, setRevisionNote] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Real-time Live Totals Calculation (di-memoize agar tidak hitung ulang saat ketik nama pelanggan/notes)
  const totals = React.useMemo(() => {
    return calcInvoiceTotals(
      items.map((it) => ({ qty: Number(it.qty) || 0, unit_price: it.unitPrice })),
      discountAmount,
      taxRate
    )
  }, [items, discountAmount, taxRate])

  // Item Management
  function handleAddProduct(p: { productId?: string; itemName: string; unit: string; unitPrice: number }) {
    // Cek jika item dengan productId yang sama sudah ada di list
    if (p.productId) {
      const existingIdx = items.findIndex((it) => it.productId === p.productId)
      if (existingIdx !== -1) {
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === existingIdx ? { ...it, qty: Number(it.qty) + 1 } : it
          )
        )
        toast.info(`Jumlah "${p.itemName}" ditambah menjadi ${Number(items[existingIdx].qty) + 1}`)
        return
      }
    }

    const newItem: FormItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      productId: p.productId || null,
      itemName: p.itemName,
      unit: p.unit || 'pcs',
      qty: 1,
      unitPrice: p.unitPrice,
    }

    setItems((prev) => [...prev, newItem])
  }

  function handleQtyChange(id: string, delta: number) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const current = Number(it.qty) || 0
          // shortcut: stepper loncat 1 (minimal 0.5), upgrade jika butuh step custom per unit
          const nextQty = Math.max(0.5, Math.round((current + delta) * 100) / 100)
          return { ...it, qty: nextQty }
        }
        return it
      })
    )
  }

  function handleQtyDirectChange(id: string, newQty: number | string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: newQty } : it))
    )
  }

  function handlePriceChange(id: string, newPrice: number) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, unitPrice: Math.max(0, newPrice) } : it))
    )
  }

  function handleRemoveItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const resetForm = useCallback(() => {
    setCustomerName('')
    setCustomerPhone('')
    setCustomerAddress('')
    const t = new Date()
    const d = new Date()
    d.setDate(t.getDate() + 7)
    setIssueDate(toDateInputValue(t))
    setDueDate(toDateInputValue(d))
    setItems([])
    setDiscountAmount(0)
    setTaxRate(defaultTaxRate)
    setNotes('')
    setRevisionNote('')
    setErrorMessage(null)
  }, [defaultTaxRate])

  // shortcut: hapus unsaved changes saat berpindah halaman dari /invoices/new
  useEffect(() => {
    if (!isEditMode) {
      resetForm()
      return () => {
        resetForm()
      }
    }
  }, [isEditMode, pathname, resetForm])

  // Submit Handler
  function handleSubmit(status: InvoiceStatus) {
    setErrorMessage(null)

    if (!customerName.trim()) {
      setErrorMessage('Nama pelanggan wajib diisi.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (items.length === 0) {
      setErrorMessage('Tambahkan minimal satu baris barang ke dalam invoice.')
      return
    }

    const payload: CreateInvoicePayload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,
      issueDate,
      dueDate: dueDate || undefined,
      discountAmount,
      taxRate,
      notes: notes.trim() || undefined,
      status,
      items: items.map((it, idx) => ({
        productId: it.productId,
        itemName: it.itemName,
        unit: it.unit,
        qty: Number(it.qty) || 1,
        unitPrice: it.unitPrice,
        sortOrder: idx + 1,
      })),
    }

    const toastId = toast.loading(
      isEditMode
        ? 'Menyimpan perubahan invoice...'
        : status === 'issued'
        ? 'Menerbitkan invoice baru...'
        : 'Menyimpan draft invoice...'
    )

    startTransition(async () => {
      try {
        let res
        if (isEditMode && initialInvoice) {
          res = await updateInvoiceAction(initialInvoice.id, {
            ...payload,
            revisionNote: revisionNote.trim() || undefined,
          })
        } else {
          res = await createInvoiceAction(payload)
        }

        if (res.error) {
          setErrorMessage(res.error)
          toast.error(isEditMode ? 'Gagal memperbarui invoice' : 'Gagal membuat invoice', {
            id: toastId,
            description: res.error,
          })
        } else if (res.invoiceId) {
          toast.success(
            isEditMode
              ? 'Perubahan invoice berhasil disimpan!'
              : status === 'issued'
              ? 'Invoice berhasil diterbitkan!'
              : 'Draft invoice berhasil disimpan!',
            { id: toastId }
          )
          if (!isEditMode) {
            resetForm()
          }
          router.push(`/invoices/${res.invoiceId}`)
          router.refresh()
        }
      } catch {
        toast.error('Terjadi kesalahan saat memproses invoice', { id: toastId })
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Alert Error */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Responsive Grid: Kolom Kiri untuk Data & Barang, Kolom Kanan untuk Rincian & Aksi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri (lg:col-span-7 xl:col-span-8) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          {/* Bagian 1: Informasi Pelanggan */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 pb-1 border-b border-zinc-100 dark:border-zinc-800">
            <User className="w-3.5 h-3.5" />
            <span>Tujuan Tagihan (Pelanggan)</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customerName" className="text-xs sm:text-sm font-medium">
              Nama Pelanggan / Perusahaan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerName"
              placeholder="Contoh: PT. Samudra Logistik / Ibu Ani"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="h-11 text-base placeholder:text-zinc-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="customerPhone" className="text-xs sm:text-sm font-medium">
                No. WhatsApp / Telepon
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="0812-xxxx-xxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="pl-9 h-11 text-sm placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customerAddress" className="text-xs sm:text-sm font-medium">
                Alamat Pelanggan
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  id="customerAddress"
                  placeholder="Kota / Alamat lengkap"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="pl-9 h-11 text-sm placeholder:text-zinc-400"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bagian 2: Tanggal Invoice */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 pb-1 border-b border-zinc-100 dark:border-zinc-800">
            <Calendar className="w-3.5 h-3.5" />
            <span>Tanggal Dokumen</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="issueDate" className="text-xs sm:text-sm font-medium">
                Tanggal Terbit
              </Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="h-11 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="text-xs sm:text-sm font-medium">
                Jatuh Tempo
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-11 text-sm font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bagian 3: Daftar Rincian Barang (Snapshot) */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Rincian Barang & Jasa ({items.length})
            </span>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsPickerOpen(true)}
              className="h-9 px-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>Tambah Barang</span>
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="py-8 text-center text-zinc-400 space-y-2 border border-dashed rounded-xl p-4">
              <PackagePlus className="w-8 h-8 mx-auto text-zinc-300" />
              <p className="text-sm">Belum ada barang di invoice ini.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPickerOpen(true)}
                className="mt-1"
              >
                Pilih Barang dari Master
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((it, idx) => (
                <div
                  key={it.id}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mb-0.5">
                        <span>#{idx + 1}</span>
                        <span>· per {it.unit}</span>
                      </div>
                      <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                        {it.itemName}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(it.id)}
                      className="h-8 w-8 text-zinc-400 hover:text-red-600 -mr-1 -mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Baris Harga & Stepper Qty Ramah Jempol */}
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-zinc-200/60 dark:border-zinc-800">
                    {/* Input Harga Satuan */}
                    <div className="flex-1 max-w-35">
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 text-xs text-zinc-400">Rp</span>
                        <Input
                          type="number"
                          min={0}
                          value={it.unitPrice}
                          onChange={(e) => handlePriceChange(it.id, Number(e.target.value) || 0)}
                          className="h-9 pl-7 font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Stepper & Input Qty Manual */}
                    <div className="flex items-center gap-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(it.id, -1)}
                        className="w-7 h-7 rounded flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all text-zinc-700 dark:text-zinc-300 cursor-pointer"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={it.qty}
                        onChange={(e) => {
                          const val = e.target.value.replace(',', '.')
                          if (val === '' || /^\d*\.?\d*$/.test(val)) {
                            handleQtyDirectChange(it.id, val)
                          }
                        }}
                        onBlur={(e) => {
                          const val = parseFloat(String(e.target.value))
                          if (!val || val <= 0) {
                            handleQtyDirectChange(it.id, 1)
                          } else {
                            handleQtyDirectChange(it.id, val)
                          }
                        }}
                        className="w-14 h-7 text-center font-mono font-bold text-xs sm:text-sm px-1 py-0 border-0 bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                        aria-label={`Jumlah kuantitas ${it.itemName}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleQtyChange(it.id, 1)}
                        className="w-7 h-7 rounded flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all text-zinc-700 dark:text-zinc-300 cursor-pointer"
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal Item */}
                    <div className="text-right font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 shrink-0">
                      {formatRupiah((Number(it.qty) || 0) * it.unitPrice)}
                    </div>
                  </div>

                  {/* Quick Action Qty Presets */}
                  <div className="flex items-center justify-end gap-1.5 pt-0.5">
                    <span className="text-[11px] text-zinc-400">Qty:</span>
                    {[10, 50, 100, 200].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleQtyDirectChange(it.id, preset)}
                        className={`text-xs px-2 py-0.5 font-mono rounded border transition-colors ${
                          Number(it.qty) === preset
                            ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200/70 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

        </div>

        {/* Kolom Kanan: Rincian Pembayaran, Diskon, Pajak & Tombol Aksi Desktop */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-24">
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                Rincian Pembayaran
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-mono font-semibold">{formatRupiah(totals.subtotal)}</span>
              </div>

              {/* Diskon */}
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-zinc-500 shrink-0">Potongan Diskon (Rp)</span>
                <div className="w-36">
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                    className="h-9 font-mono text-right text-sm"
                  />
                </div>
              </div>

              {/* PPN / Pajak */}
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-zinc-500">Pajak (PPN)</span>
                  <div className="flex gap-1.5">
                    {[0, 11, 12].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setTaxRate(rate)}
                        className={`text-xs px-2.5 py-1 font-medium rounded border transition-colors ${
                          taxRate === rate
                            ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-16">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                      className="h-9 font-mono text-center text-sm"
                    />
                  </div>
                  <span className="font-mono text-xs text-zinc-500 w-24 text-right">
                    +{formatRupiah(totals.tax_amount)}
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Grand Total
                  </span>
                  <p className="text-xs text-zinc-500">Total bersih yang harus dibayar</p>
                </div>
                <span className="font-mono font-extrabold text-2xl text-zinc-950 dark:text-white">
                  {formatRupiah(totals.grand_total)}
                </span>
              </div>

              {/* Catatan / Info Pembayaran */}
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="notes" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Catatan Kaki Dokumen (Opsional)
                </Label>
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder="Info transfer bank, syarat jatuh tempo, atau ucapan terima kasih..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none text-sm placeholder:text-zinc-400"
                />
              </div>

              {/* Input Catatan Audit Trail (Khusus Mode Edit) */}
              {isEditMode && (
                <div className="space-y-1.5 pt-1 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                  <Label htmlFor="revisionNote" className="text-xs font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>Alasan Perubahan / Catatan Revisi</span>
                  </Label>
                  <Input
                    id="revisionNote"
                    placeholder="Contoh: Mengubah qty item atas persetujuan klien..."
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    className="text-xs h-9 bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800"
                  />
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                    Akan dicatat dalam riwayat perubahan (audit trail) faktur ini.
                  </p>
                </div>
              )}

              {/* Tombol Aksi di Desktop */}
              <div className="hidden lg:flex flex-col gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSubmit('issued')}
                  className="w-full h-12 text-base font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm active:scale-95 transition-transform"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {isEditMode ? 'Menyimpan...' : 'Menerbitkan...'}
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-5 h-5 mr-1.5" />
                      {isEditMode ? 'Simpan Perubahan Invoice' : 'Terbitkan Invoice'}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleSubmit('draft')}
                  className="w-full h-11 text-sm font-medium border-zinc-300 dark:border-zinc-700 active:scale-95 transition-transform"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1.5" />
                      Simpan sebagai Draft
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Bottom Action Bar KHUSUS Layar Ponsel & Tablet (lg:hidden) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-md mx-auto flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => handleSubmit('draft')}
            className="flex-1 h-12 text-xs sm:text-sm font-medium border-zinc-300 dark:border-zinc-700 active:scale-95 transition-transform rounded-xl cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                Draft
              </>
            )}
          </Button>

          <Button
            type="button"
            disabled={isPending}
            onClick={() => handleSubmit('issued')}
            className="flex-[2] h-12 text-sm sm:text-base font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm active:scale-95 transition-transform rounded-xl cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                {isEditMode ? 'Menyimpan...' : 'Menerbitkan...'}
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" />
                {isEditMode ? 'Simpan Perubahan' : 'Terbitkan Invoice'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Modal Picker Barang */}
      <ProductPickerModal
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        availableProducts={availableProducts}
        onSelectProduct={handleAddProduct}
      />
    </div>
  )
}

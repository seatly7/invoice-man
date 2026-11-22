'use client'

import { FormEvent, useDeferredValue, useEffect, useState } from 'react'
import { Product } from '@/types/product.types'
import { formatRupiah } from '@/lib/utils/currency'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Package } from 'lucide-react'

export interface ProductPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableProducts: Product[]
  onSelectProduct: (product: { productId?: string; itemName: string; unit: string; unitPrice: number }) => void
}

export function ProductPickerModal({
  open,
  onOpenChange,
  availableProducts,
  onSelectProduct,
}: ProductPickerModalProps) {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [manualName, setManualName] = useState('')
  const [manualPrice, setManualPrice] = useState<number>(0)
  const [manualUnit, setManualUnit] = useState('pcs')
  const [isManualMode, setIsManualMode] = useState(false)

  // Bersihkan state form & pencarian saat modal ditutup
  useEffect(() => {
    if (!open) {
      setSearch('')
      setManualName('')
      setManualPrice(0)
      setManualUnit('pcs')
      setIsManualMode(false)
    }
  }, [open])

  const filtered = availableProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(deferredSearch.toLowerCase())
  )

  function handleSelect(p: Product) {
    onSelectProduct({
      productId: p.id,
      itemName: p.name,
      unit: p.unit || 'pcs',
      unitPrice: p.price,
    })
    onOpenChange(false)
  }

  function handleAddManual(e: FormEvent) {
    e.preventDefault()
    if (!manualName.trim()) return

    onSelectProduct({
      itemName: manualName.trim(),
      unit: manualUnit.trim() || 'pcs',
      unitPrice: manualPrice || 0,
    })
    setManualName('')
    setManualPrice(0)
    setIsManualMode(false)
    onOpenChange(false)
  }

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Pilih Barang dari Master"
      description="Pilih barang dari katalog atau tambahkan barang manual sekali pakai."
    >
      <div className="space-y-3.5 pt-1">
        {!isManualMode ? (
          <>
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Cari barang atau SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl"
              />
            </div>

            {/* List Barang */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-0.5">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs sm:text-sm">
                  <Package className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                  Barang tidak ditemukan di katalog.
                </div>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p)}
                    className="w-full text-left p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 active:scale-[0.99] transition-all flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        {p.sku} · per {p.unit}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 shrink-0">
                      {formatRupiah(p.price)}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Tombol Input Manual */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsManualMode(true)}
                className="w-full h-11 border-dashed rounded-xl text-xs sm:text-sm font-medium cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Input Barang Manual (Tanpa Masuk Master)
              </Button>
            </div>
          </>
        ) : (
          /* Form Input Manual */
          <form onSubmit={handleAddManual} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Nama Barang / Jasa</label>
              <Input
                placeholder="Contoh: Konsultasi Teknis"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                required
                className="h-11 text-sm rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Harga (Rp)</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(Number(e.target.value) || 0)}
                  required
                  className="h-11 font-mono text-sm rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Satuan</label>
                <Input
                  placeholder="pcs / jam"
                  value={manualUnit}
                  onChange={(e) => setManualUnit(e.target.value)}
                  className="h-11 text-sm rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsManualMode(false)}
                className="flex-1 h-11 rounded-xl cursor-pointer"
              >
                Kembali
              </Button>
              <Button type="submit" className="flex-1 h-11 bg-zinc-900 text-white rounded-xl font-semibold cursor-pointer">
                Tambahkan
              </Button>
            </div>
          </form>
        )}
      </div>
    </ResponsiveModal>
  )
}

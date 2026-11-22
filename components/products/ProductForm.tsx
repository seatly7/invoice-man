'use client'

import * as React from 'react'
import { useActionState, useEffect, useState } from 'react'
import { upsertProductAction, type ProductActionResult } from '@/lib/actions/product.actions'
import { Product } from '@/types/product.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatRupiah } from '@/lib/utils/currency'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export interface ProductFormProps {
  product?: Product | null
  onSuccess?: () => void
}

const COMMON_UNITS = ['pcs', 'unit', 'paket', 'box', 'kg', 'jam', 'hari']

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [state, formAction, isPending] = useActionState<ProductActionResult | null, FormData>(
    upsertProductAction,
    null
  )

  const [price, setPrice] = useState<number>(product?.price || 0)
  const [unit, setUnit] = useState<string>(product?.unit || 'pcs')

  useEffect(() => {
    if (state?.success) {
      toast.success(product ? 'Barang berhasil diperbarui' : 'Barang baru berhasil ditambahkan')
      onSuccess?.()
    }
  }, [state, product, onSuccess])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* Hidden ID jika mode Edit */}
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      {/* Alert Error */}
      {state?.error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Baris 1: Kode SKU & Satuan */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="sku" className="text-xs sm:text-sm font-medium">
            Kode SKU <span className="text-red-500">*</span>
          </Label>
          <Input
            id="sku"
            name="sku"
            placeholder="BRG-001"
            defaultValue={product?.sku || ''}
            required
            className="h-11 font-mono uppercase text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="unit" className="text-xs sm:text-sm font-medium">
            Satuan <span className="text-red-500">*</span>
          </Label>
          <Input
            id="unit"
            name="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="pcs"
            required
            className="h-11 text-sm"
          />
        </div>
      </div>

      {/* Saran Satuan Cepat */}
      <div className="flex flex-wrap gap-1.5 -mt-2">
        {COMMON_UNITS.map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnit(u)}
            className={`text-xs px-2.5 py-1 rounded-md border min-h-[30px] font-medium transition-colors ${
              unit.toLowerCase() === u
                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Baris 2: Nama Barang */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs sm:text-sm font-medium">
          Nama Barang / Jasa <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Contoh: Kertas Thermal 80mm / Jasa Desain"
          defaultValue={product?.name || ''}
          required
          className="h-11 text-base placeholder:text-zinc-400"
        />
      </div>

      {/* Baris 3: Harga Satuan */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="price" className="text-xs sm:text-sm font-medium">
            Harga Satuan (Rp) <span className="text-red-500">*</span>
          </Label>
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            {formatRupiah(price || 0)}
          </span>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-3 text-sm text-zinc-400 font-medium">
            Rp
          </span>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step="100"
            value={price === 0 ? '' : price}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
            placeholder="0"
            required
            className="h-11 pl-10 text-base font-mono"
          />
        </div>
      </div>

      {/* Baris 4: Deskripsi (Opsional) */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Keterangan Tambahan (Opsional)
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          placeholder="Rincian spesifikasi atau catatan produk..."
          defaultValue={product?.description || ''}
          className="resize-none text-sm placeholder:text-zinc-400"
        />
      </div>

      {/* Tombol Simpan */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 text-base font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow transition-transform active:scale-[0.98]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : product ? (
            'Perbarui Barang'
          ) : (
            'Simpan Barang'
          )}
        </Button>
      </div>
    </form>
  )
}

'use client'

import * as React from 'react'
import { useState, useTransition } from 'react'
import { Product } from '@/types/product.types'
import { ProductModal } from './ProductModal'
import { toggleProductStatusAction, deleteProductAction } from '@/lib/actions/product.actions'
import { formatRupiah } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Plus, Search, MoreVertical, Edit2, PowerOff, CheckCircle2, PackageOpen, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export interface ProductListClientProps {
  initialProducts: Product[]
}

export function ProductListClient({ initialProducts }: ProductListClientProps) {
  const [search, setSearch] = useState('')
  const deferredSearch = React.useDeferredValue(search)
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isPending, startTransition] = useTransition()

  // Filter lokal dengan deferred value untuk rendering halus tanpa freeze
  const filteredProducts = initialProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(deferredSearch.toLowerCase())

    if (!matchesSearch) return false

    if (filterActive === 'active') return p.isActive
    if (filterActive === 'inactive') return !p.isActive
    return true
  })

  function handleCreateNew() {
    setSelectedProduct(null)
    setModalOpen(true)
  }

  function handleEdit(product: Product) {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  function handleToggleStatus(product: Product) {
    startTransition(async () => {
      const res = await toggleProductStatusAction(product.id, product.isActive)
      if (res.error) {
        toast.error('Gagal mengubah status', { description: res.error })
      } else {
        toast.success(
          product.isActive
            ? `Barang "${product.name}" dinonaktifkan`
            : `Barang "${product.name}" diaktifkan kembali`
        )
      }
    })
  }

  function handleDelete(product: Product) {
    if (!window.confirm(`Hapus permanen barang "${product.name}"?`)) return
    startTransition(async () => {
      const res = await deleteProductAction(product.id)
      if (res.error) {
        toast.error('Gagal menghapus barang', { description: res.error })
      } else {
        toast.success(`Barang "${product.name}" berhasil dihapus permanen`)
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Top Action Bar: Search & Filter Chips & Tombol Tambah */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        {/* Row 1 di Mobile: Search + Tombol Tambah Cepat */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Cari nama barang atau SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
          </div>
          <Button
            onClick={handleCreateNew}
            className="sm:hidden h-11 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs shrink-0 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Tambah</span>
          </Button>
        </div>

        {/* Filter Tabs & Tombol Tambah di Desktop */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end">
          <div className="grid grid-cols-3 sm:flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterActive('active')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-center ${
                filterActive === 'active'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Aktif
            </button>
            <button
              type="button"
              onClick={() => setFilterActive('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-center ${
                filterActive === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilterActive('inactive')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-center ${
                filterActive === 'inactive'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Arsip
            </button>
          </div>

          <Button
            onClick={handleCreateNew}
            className="hidden sm:inline-flex h-11 px-4 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-semibold shadow-xs shrink-0 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Tambah Barang</span>
          </Button>
        </div>
      </div>

      {/* Konten Daftar Barang */}
      {filteredProducts.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed border-2 bg-white/50 dark:bg-zinc-900/50 py-12 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <PackageOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base">Belum Ada Barang</h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-xs mx-auto">
                {search
                  ? 'Tidak ada barang yang cocok dengan kata kunci pencarian.'
                  : 'Tambahkan daftar produk atau jasa Anda untuk mempermudah pembuatan faktur invoice.'}
              </p>
            </div>
            {!search && (
              <Button onClick={handleCreateNew} size="sm" className="mt-2">
                <Plus className="w-4 h-4 mr-1.5" />
                Tambah Barang Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tampilan Desktop: Table */}
          <div className="hidden md:block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto shadow-xs">
            <Table className="min-w-[650px]">
              <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                <TableRow>
                  <TableHead className="w-28 font-mono text-xs uppercase">SKU</TableHead>
                  <TableHead>Nama Barang / Jasa</TableHead>
                  <TableHead className="w-24">Satuan</TableHead>
                  <TableHead className="w-36 text-right">Harga Satuan</TableHead>
                  <TableHead className="w-24 text-center">Status</TableHead>
                  <TableHead className="w-12 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => (
                  <TableRow key={p.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                    <TableCell className="font-mono text-xs text-zinc-500 uppercase">
                      {p.sku}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {p.name}
                      </div>
                      {p.description && (
                        <div className="text-xs text-zinc-400 truncate max-w-md mt-0.5">
                          {p.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-600 dark:text-zinc-400">
                      {p.unit}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-sm">
                      {formatRupiah(p.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={p.isActive ? 'default' : 'secondary'}
                        className={
                          p.isActive
                            ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }
                      >
                        {p.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 rounded-md inline-flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleEdit(p)} className="cursor-pointer">
                            <Edit2 className="w-4 h-4 mr-2" />
                            <span>Ubah Data</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(p)}
                            disabled={isPending}
                            className={`cursor-pointer ${
                              p.isActive
                                ? 'text-amber-600 focus:text-amber-600'
                                : 'text-emerald-600 focus:text-emerald-600'
                            }`}
                          >
                            {p.isActive ? (
                              <>
                                <PowerOff className="w-4 h-4 mr-2" />
                                <span>Nonaktifkan</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                <span>Aktifkan</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(p)}
                            disabled={isPending}
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            <span>Hapus Permanen</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Tampilan Mobile: Card Grid (Mobile-First, Ramah Layar Sentuh) */}
          <div className="grid grid-cols-1 gap-2.5 md:hidden">
            {filteredProducts.map((p) => (
              <Card
                key={p.id}
                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl overflow-hidden"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="font-mono text-xs font-semibold text-zinc-500 uppercase tracking-wide bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                          {p.sku}
                        </span>
                        <Badge
                          variant={p.isActive ? 'default' : 'secondary'}
                          className={`text-xs px-2 py-0.5 ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : 'bg-zinc-100 text-zinc-500'
                          }`}
                        >
                          {p.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-snug truncate">
                        {p.name}
                      </h4>
                      {p.description && (
                        <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                          {p.description}
                        </p>
                      )}
                    </div>

                    {/* Menu Aksi */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-9 w-9 -mr-1.5 -mt-1 rounded-lg inline-flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleEdit(p)} className="cursor-pointer">
                          <Edit2 className="w-4 h-4 mr-2" />
                          <span>Ubah Data</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(p)}
                          className={`cursor-pointer ${p.isActive ? 'text-amber-600' : 'text-emerald-600'}`}
                        >
                          {p.isActive ? (
                            <>
                              <PowerOff className="w-4 h-4 mr-2" />
                              <span>Nonaktifkan</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              <span>Aktifkan</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(p)}
                          disabled={isPending}
                          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          <span>Hapus Permanen</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-medium">
                      Per {p.unit}
                    </span>
                    <span className="font-mono font-bold text-base text-zinc-900 dark:text-zinc-100">
                      {formatRupiah(p.price)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Modal Tambah / Edit Produk */}
      <ProductModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) {
            setSelectedProduct(null)
          }
        }}
        product={selectedProduct}
      />
    </div>
  )
}

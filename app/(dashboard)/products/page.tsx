import { Metadata } from 'next'
import { getProducts } from '@/lib/queries/product.queries'
import { ProductListClient } from '@/components/products/ProductListClient'

export const metadata: Metadata = {
  title: 'Master Barang - Invoice-Man',
  description: 'Kelola daftar produk dan jasa untuk faktur tagihan Anda.',
}

export const instant = false

export default async function ProductsPage() {
  const { data: products } = await getProducts()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Master Barang
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Kelola katalog produk atau jasa yang dapat langsung dipilih saat membuat faktur invoice.
        </p>
      </div>

      {/* Interactive Client List with Search, Filter & Modals */}
      <ProductListClient initialProducts={products} />
    </div>
  )
}

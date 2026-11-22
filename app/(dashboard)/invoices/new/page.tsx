import { Metadata } from 'next'
import Link from 'next/link'
import { getProducts } from '@/lib/queries/product.queries'
import { getInvoiceSettings } from '@/lib/queries/settings.queries'
import { InvoiceForm } from '@/components/invoice/InvoiceForm'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Buat Invoice Baru - Invoice-Man',
  description: 'Form pembuatan faktur tagihan invoice baru cepat dan praktis.',
}

export const instant = false

export default async function NewInvoicePage() {
  // Ambil produk katalog yang aktif dan default tarif pajak pengguna
  const [productsRes, settings] = await Promise.all([
    getProducts({ isActiveOnly: true, pageSize: 100 }),
    getInvoiceSettings(),
  ])

  const defaultTaxRate = settings?.defaultTaxRate ?? 11

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-28 lg:pb-12">
      {/* Top Header dengan Tombol Kembali */}
      <div className="flex items-center gap-3">
        <Link
          href="/invoices"
          className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 shadow-2xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Buat Invoice Baru
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Nomor faktur akan di-generate otomatis saat disimpan.
          </p>
        </div>
      </div>

      {/* Formulir Interaktif dengan Kalkulasi Live */}
      <InvoiceForm
        availableProducts={productsRes.data}
        defaultTaxRate={defaultTaxRate}
      />
    </div>
  )
}

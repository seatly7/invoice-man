import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { getInvoiceById } from '@/lib/queries/invoice.queries'
import { getProducts } from '@/lib/queries/product.queries'
import { getInvoiceSettings } from '@/lib/queries/settings.queries'
import { InvoiceForm } from '@/components/invoice/InvoiceForm'
import { ArrowLeft } from 'lucide-react'

export const instant = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const invoice = await getInvoiceById(id)
  return {
    title: invoice ? `Edit Invoice ${invoice.invoiceNumber} - Invoice-Man` : 'Edit Invoice',
  }
}

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await connection()
  const { id } = await params

  const [invoice, productsRes, settings] = await Promise.all([
    getInvoiceById(id),
    getProducts({ isActiveOnly: true, pageSize: 200 }),
    getInvoiceSettings(),
  ])

  if (!invoice) {
    notFound()
  }

  const defaultTaxRate = settings?.defaultTaxRate ?? 11

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-28 lg:pb-12">
      {/* Top Header dengan Tombol Kembali */}
      <div className="flex items-center gap-3">
        <Link
          href={`/invoices/${invoice.id}`}
          className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 shadow-2xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Edit Invoice</span>
            <span className="font-mono text-base font-normal text-zinc-500">
              #{invoice.invoiceNumber}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Perbarui rincian item, kuantitas, harga, atau identitas pelanggan faktur ini.
          </p>
        </div>
      </div>

      {/* Formulir Interaktif dengan Data Awal Terisi */}
      <InvoiceForm
        availableProducts={productsRes.data}
        defaultTaxRate={defaultTaxRate}
        initialInvoice={invoice}
      />
    </div>
  )
}

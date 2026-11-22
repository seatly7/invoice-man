import { Metadata } from 'next'
import { getInvoices, getInvoiceMetrics } from '@/lib/queries/invoice.queries'
import { InvoiceSummaryCards } from '@/components/invoice/InvoiceSummaryCards'
import { InvoiceCardList } from '@/components/invoice/InvoiceCardList'

export const metadata: Metadata = {
  title: 'Daftar Invoice - Invoice-Man',
  description: 'Kelola seluruh riwayat tagihan faktur dan status pembayaran.',
}

export const instant = false

export default async function InvoicesPage() {
  // Ambil daftar invoice dan statistik metrik secara paralel
  const [invoicesRes, metrics] = await Promise.all([
    getInvoices(),
    getInvoiceMetrics(),
  ])

  return (
    <div className="space-y-5">
      {/* Kartu Ringkasan Metrik (Total Belum Bayar & Mini KPI) */}
      <InvoiceSummaryCards metrics={metrics} />

      {/* Daftar Invoice Interaktif (Card di Mobile, Table di Desktop) */}
      <InvoiceCardList initialInvoices={invoicesRes.data} />
    </div>
  )
}

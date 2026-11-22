import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getInvoiceById } from '@/lib/queries/invoice.queries'
import { getInvoiceSettings } from '@/lib/queries/settings.queries'
import { InvoiceStatusBadge } from '@/components/invoice/InvoiceStatusBadge'
import { formatRupiah } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  Printer,
  Receipt,
  MessageCircle,
  Calendar,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Share2,
} from 'lucide-react'

export const instant = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const invoice = await getInvoiceById(id)
  return {
    title: invoice ? `${invoice.invoiceNumber} - Detail Invoice` : 'Detail Invoice',
  }
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [invoice, settings] = await Promise.all([
    getInvoiceById(id),
    getInvoiceSettings(),
  ])

  if (!invoice) {
    notFound()
  }

  // Format WhatsApp Link
  let waLink = '#'
  if (invoice.customerPhone) {
    let cleanPhone = invoice.customerPhone.replace(/[^0-9]/g, '')
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1)
    }
    const message = encodeURIComponent(
      `Halo ${invoice.customerName},\nBerikut kami kirimkan rincian tagihan faktur ${invoice.invoiceNumber} sebesar ${formatRupiah(invoice.grandTotal)}.\n\nTerima kasih.`
    )
    waLink = `https://wa.me/${cleanPhone}?text=${message}`
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24">
      {/* Top Header dengan Tombol Kembali */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
                {invoice.invoiceNumber}
              </h1>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Diterbitkan pada {formatDate(invoice.issueDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Aksi Cepat Cetak & Kirim (Sesuai Desain Stitch) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <Link
          href={`/invoices/${invoice.id}/print`}
          className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 active:scale-95 transition-all text-center shadow-xs"
        >
          <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
            <Printer className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Faktur PDF (A4)
          </span>
          <span className="text-xs text-zinc-400">Ukuran dokumen resmi</span>
        </Link>

        <Link
          href={`/invoices/${invoice.id}/thermal`}
          className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 active:scale-95 transition-all text-center shadow-xs"
        >
          <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
            <Receipt className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Struk POS (80mm)
          </span>
          <span className="text-xs text-zinc-400">Printer kasir bluetooth</span>
        </Link>

        {invoice.customerPhone ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 active:scale-95 transition-all text-center shadow-xs"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Kirim WhatsApp
            </span>
            <span className="text-xs text-emerald-600/80">Kirim tagihan ke klien</span>
          </a>
        ) : (
          <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-center opacity-60">
            <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Share2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-zinc-500">No. WhatsApp kosong</span>
          </div>
        )}
      </div>

      {/* Kartu Informasi Pelanggan */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 pb-1 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>Penerima Tagihan</span>
          </div>

          <div>
            <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
              {invoice.customerName}
            </h3>
            {invoice.customerPhone && (
              <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1 font-mono">
                <Phone className="w-3 h-3 text-zinc-400" />
                {invoice.customerPhone}
              </p>
            )}
            {invoice.customerAddress && (
              <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                <span>{invoice.customerAddress}</span>
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-zinc-400">Tanggal Terbit</span>
              <p className="font-medium text-zinc-800 dark:text-zinc-200">
                {formatDate(invoice.issueDate)}
              </p>
            </div>
            <div>
              <span className="text-zinc-400">Jatuh Tempo</span>
              <p className="font-medium text-zinc-800 dark:text-zinc-200">
                {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kartu Rincian Barang (Snapshot) */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 pb-1 border-b border-zinc-100 dark:border-zinc-800">
            Daftar Barang & Jasa ({invoice.items.length})
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {invoice.items.map((it, idx) => (
              <div key={it.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                    {it.itemName}
                  </p>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {it.qty} {it.unit} × {formatRupiah(it.unitPrice)}
                  </p>
                </div>
                <span className="font-mono font-semibold text-sm text-zinc-900 dark:text-zinc-100 shrink-0">
                  {formatRupiah(it.lineTotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Rincian Kalkulasi */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5 text-sm">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span className="font-mono">{formatRupiah(invoice.subtotal)}</span>
            </div>

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Potongan Diskon</span>
                <span className="font-mono">-{formatRupiah(invoice.discountAmount)}</span>
              </div>
            )}

            {invoice.taxRate > 0 && (
              <div className="flex justify-between text-zinc-500">
                <span>Pajak (PPN {invoice.taxRate}%)</span>
                <span className="font-mono">+{formatRupiah(invoice.taxAmount)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-baseline font-bold">
              <span className="text-zinc-900 dark:text-zinc-100">Grand Total</span>
              <span className="font-mono text-xl text-zinc-950 dark:text-white">
                {formatRupiah(invoice.grandTotal)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catatan Pembayaran / Rekening Bank */}
      {(invoice.notes || settings?.footerNote) && (
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Instruksi Pembayaran & Catatan
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed">
              {invoice.notes || settings?.footerNote}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

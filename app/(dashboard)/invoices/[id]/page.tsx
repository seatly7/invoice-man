import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getInvoiceById } from '@/lib/queries/invoice.queries'
import { getInvoiceSettings } from '@/lib/queries/settings.queries'
import { InvoiceStatusBadge } from '@/components/invoice/InvoiceStatusBadge'
import { formatRupiah } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
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
  Share2,
  CreditCard,
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
    <div className="max-w-6xl mx-auto space-y-6 pb-24 lg:pb-12">
      {/* Top Header dengan Tombol Kembali & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
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

      {/* Grid 2-Kolom Seimbang di Desktop, Responsif di Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Rincian Barang, Kalkulasi & Catatan Pembayaran (lg:col-span-7 xl:col-span-8) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5 order-2 lg:order-1">
          {/* Kartu Rincian Barang (Snapshot) */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pb-1 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span>Daftar Barang & Jasa ({invoice.items.length})</span>
                <span className="text-zinc-400 font-normal">Harga & Subtotal</span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {invoice.items.map((it) => (
                  <div key={it.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
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
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium">{formatRupiah(invoice.subtotal)}</span>
                </div>

                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Potongan Diskon</span>
                    <span className="font-mono font-medium">-{formatRupiah(invoice.discountAmount)}</span>
                  </div>
                )}

                {invoice.taxRate > 0 && (
                  <div className="flex justify-between text-zinc-500">
                    <span>Pajak (PPN {invoice.taxRate}%)</span>
                    <span className="font-mono font-medium">+{formatRupiah(invoice.taxAmount)}</span>
                  </div>
                )}

                <div className="pt-2.5 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-baseline font-bold">
                  <div>
                    <span className="text-zinc-900 dark:text-zinc-100 text-base">Grand Total</span>
                    <p className="text-xs text-zinc-400 font-normal">Total yang harus dibayarkan</p>
                  </div>
                  <span className="font-mono text-2xl text-zinc-950 dark:text-white">
                    {formatRupiah(invoice.grandTotal)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Catatan Pembayaran / Rekening Bank */}
          {(invoice.notes || settings?.footerNote) && (
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pb-1 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Instruksi Pembayaran & Catatan Kaki</span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed">
                  {invoice.notes || settings?.footerNote}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Kolom Kanan: Aksi Cepat Cetak, Kirim WA & Info Penerima (lg:col-span-5 xl:col-span-4) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-24 order-1 lg:order-2">
          {/* Card Aksi Cepat Cetak & Kirim */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                Aksi Cepat Dokumen
              </div>

              <div className="space-y-2">
                {/* Cetak Faktur PDF A4 */}
                <Link
                  href={`/invoices/${invoice.id}/print`}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shrink-0">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Cetak Faktur PDF (A4)
                      </p>
                      <p className="text-[11px] text-zinc-400">Format dokumen invoice resmi</p>
                    </div>
                  </div>
                </Link>

                {/* Cetak Struk POS 80mm */}
                <Link
                  href={`/invoices/${invoice.id}/thermal`}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0 border border-zinc-200 dark:border-zinc-700">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Cetak Struk Kasir (80mm)
                      </p>
                      <p className="text-[11px] text-zinc-400">Untuk printer kasir bluetooth</p>
                    </div>
                  </div>
                </Link>

                {/* Kirim WhatsApp */}
                {invoice.customerPhone ? (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                          Kirim via WhatsApp
                        </p>
                        <p className="text-[11px] text-emerald-600/80">Kirim pesan tagihan ke klien</p>
                      </div>
                    </div>
                  </a>
                ) : (
                  <div className="w-full flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 opacity-60">
                    <div className="w-9 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-zinc-500">No. WhatsApp tidak diisi</p>
                      <p className="text-[11px] text-zinc-400">Klien tidak memiliki no. telepon</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Kartu Informasi Pelanggan */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pb-1 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Penerima Tagihan</span>
              </div>

              <div>
                <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                  {invoice.customerName}
                </h3>
                {invoice.customerPhone && (
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    {invoice.customerPhone}
                  </p>
                )}
                {invoice.customerAddress && (
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{invoice.customerAddress}</span>
                  </p>
                )}
              </div>

              <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-zinc-400">Tanggal Terbit</span>
                  <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {formatDate(invoice.issueDate)}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-400">Jatuh Tempo</span>
                  <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

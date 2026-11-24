import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { getInvoiceById } from '@/lib/queries/invoice.queries'
import { getInvoiceSettings } from '@/lib/queries/settings.queries'
import { formatRupiah } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { PrintButton } from '@/components/invoice/PrintButton'
import { DownloadDocumentButton } from '@/components/invoice/DownloadDocumentButton'
import { ArrowLeft, FileText } from 'lucide-react'
import Image from 'next/image'

export const instant = false

export const metadata: Metadata = {
  title: 'Cetak Faktur PDF A4 - Invoice-Man',
}

export default async function PrintInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await connection()
  const { id } = await params

  const [invoice, settings] = await Promise.all([
    getInvoiceById(id),
    getInvoiceSettings(),
  ])

  if (!invoice) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 pb-16 print:min-h-0 print:bg-white print:p-0 print:pb-0 print:m-0">
      {/* Pengaturan CSS Cetak Khusus Lembar A4 agar Pas 1 Halaman */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            @media print {
              html, body {
                background: #ffffff !important;
                color: #000000 !important;
                height: auto !important;
                min-height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              header, nav, aside, footer, .print-hidden, [data-print-hidden] {
                display: none !important;
              }
            }
          `,
        }}
      />

      {/* Top Floating Control Bar (Disembunyikan saat mencetak) */}
      <div className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 shadow-xs print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Link
            href={`/invoices/${invoice.id}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Detail</span>
          </Link>

          <div className="flex items-center gap-2">
            <DownloadDocumentButton
              targetId="invoice-print-sheet"
              filename={`Faktur-${invoice.invoiceNumber}`}
            />
            <PrintButton label="Cetak Faktur A4" />
          </div>
        </div>
      </div>

      {/* Container scroll horizontal untuk mobile agar lembar kertas A4 tetap utuh & tajam */}
      <div className="w-full overflow-x-auto p-3 sm:p-6 flex justify-center print:p-0 print:m-0 print:overflow-visible">
        {/* Lembar Dokumen Kertas A4 (Print Sheet) */}
        <div
          id="invoice-print-sheet"
          className="w-200 min-w-200 bg-white text-zinc-900 shadow-sm border border-zinc-200/80 p-10 pb-12 rounded-none print:shadow-none print:border-none print:m-0 print:p-0 print:w-full print:min-w-0 print:max-w-none break-inside-avoid print:break-inside-avoid"
        >
          {/* Header Usaha & Judul Faktur */}
          <div className="flex justify-between items-start gap-4 pb-4 border-b-2 border-zinc-900">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 text-white flex items-center justify-center font-bold text-xs">
                  {/* <FileText className="w-3.5 h-3.5" /> */}
                  <Image 
                    alt='Logo'
                    height={50}
                    width={50}
                    className="object-contain"
                    priority
                    src={"/logo/Invoice_Man_Mascot_Logo.png"} 
                  />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-zinc-900">
                  {settings?.businessName || 'INVOICE-MAN'}
                </h2>
              </div>
              {settings?.businessAddress && (
                <p className="text-xs text-zinc-600 max-w-sm whitespace-pre-line leading-relaxed">
                  {settings.businessAddress}
                </p>
              )}
              <div className="text-xs text-zinc-500 space-y-0.5 mt-1 font-mono">
                {settings?.businessPhone && <p>Telp / WA: {settings.businessPhone}</p>}
                {settings?.businessEmail && <p>Email: {settings.businessEmail}</p>}
                {settings?.taxId && <p>NPWP: {settings.taxId}</p>}
              </div>
            </div>

            <div className="text-right">
              <h1 className="text-3xl font-extrabold uppercase tracking-tight text-zinc-900">
                FAKTUR TAGIHAN
              </h1>
              <p className="font-mono text-base font-bold text-zinc-800 mt-0.5">
                #{invoice.invoiceNumber}
              </p>
              <div className="text-xs text-zinc-600 mt-1.5 space-y-0.5">
                <p>Tanggal Terbit: <span className="font-medium font-mono">{formatDate(invoice.issueDate)}</span></p>
                {invoice.dueDate && (
                  <p>Jatuh Tempo: <span className="font-medium font-mono">{formatDate(invoice.dueDate)}</span></p>
                )}
              </div>
            </div>
          </div>

          {/* Informasi Tagihan: Kepada Siapa */}
          <div className="py-3.5 border-b border-zinc-200 grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Tagihan Ditujukan Kepada:
              </span>
              <h3 className="font-bold text-base text-zinc-900 mt-0.5">
                {invoice.customerName}
              </h3>
              {invoice.customerAddress && (
                <p className="text-xs text-zinc-600 mt-0.5 whitespace-pre-line leading-relaxed">
                  {invoice.customerAddress}
                </p>
              )}
              {invoice.customerPhone && (
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  Telp: {invoice.customerPhone}
                </p>
              )}
            </div>
          </div>

          {/* Tabel Rincian Barang */}
          <div className="py-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-zinc-900 text-zinc-900 uppercase font-bold tracking-wider">
                  <th className="py-2.5 w-12 text-center">No</th>
                  <th className="py-2.5">Deskripsi Barang / Jasa</th>
                  <th className="py-2.5 w-20 text-center">Satuan</th>
                  <th className="py-2.5 w-16 text-center">Qty</th>
                  <th className="py-2.5 w-32 text-right font-mono">Harga (Rp)</th>
                  <th className="py-2.5 w-36 text-right font-mono">Total (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {invoice.items.map((it, idx) => (
                  <tr key={it.id} className="text-zinc-800">
                    <td className="py-2.5 text-center text-zinc-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 font-medium pr-2">{it.itemName}</td>
                    <td className="py-2.5 text-center text-zinc-600">{it.unit}</td>
                    <td className="py-2.5 text-center font-mono font-bold">{it.qty}</td>
                    <td className="py-2.5 text-right font-mono">{formatRupiah(it.unitPrice, false)}</td>
                    <td className="py-2.5 text-right font-mono font-semibold">{formatRupiah(it.lineTotal, false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kalkulasi Total & Catatan */}
          <div className="pt-3 border-t-2 border-zinc-900 flex justify-between gap-6">
            <div className="flex-1 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Catatan & Instruksi Pembayaran:
              </span>
              <p className="text-xs text-zinc-600 whitespace-pre-line leading-relaxed max-w-md">
                {invoice.notes || settings?.footerNote || 'Pembayaran dapat ditransfer sesuai kesepakatan. Terima kasih.'}
              </p>
            </div>

            <div className="w-72 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-mono">{formatRupiah(invoice.subtotal)}</span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>Diskon</span>
                  <span className="font-mono">-{formatRupiah(invoice.discountAmount)}</span>
                </div>
              )}

              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>PPN ({invoice.taxRate}%)</span>
                  <span className="font-mono">+{formatRupiah(invoice.taxAmount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-900 flex justify-between font-bold text-sm text-zinc-900">
                <span>Grand Total</span>
                <span className="font-mono text-base">{formatRupiah(invoice.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Kolom Tanda Tangan */}
          <div className="pt-12 pb-4 flex justify-between text-center text-xs text-zinc-800 break-inside-avoid print:break-inside-avoid">
            <div className="w-48">
              <p>Penerima,</p>
              <div className="h-16"></div>
              <p className="border-t border-zinc-400 pt-1 font-medium">{invoice.customerName}</p>
            </div>

            <div className="w-48">
              <p>Hormat Kami,</p>
              <div className="h-16"></div>
              <p className="border-t border-zinc-400 pt-1 font-bold text-zinc-900">
                {settings?.businessName || 'Pihak Pengirim'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { getInvoiceById } from '@/lib/queries/invoice.queries'
import { getInvoiceSettings } from '@/lib/queries/settings.queries'
import { formatDateSlash } from '@/lib/utils/date'
import { PrintButton } from '@/components/invoice/PrintButton'
import { DownloadDocumentButton } from '@/components/invoice/DownloadDocumentButton'
import { ArrowLeft, Truck } from 'lucide-react'

export const instant = false

export const metadata: Metadata = {
  title: 'Cetak Surat Jalan - Invoice-Man',
}

export default async function SuratJalanPage({
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
      {/* Pengaturan CSS Cetak Khusus Lembar A4 */}
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

      {/* Top Floating Control Bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-3 sm:px-4 py-2.5 sm:py-3 shadow-xs print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          <Link
            href={`/invoices/${invoice.id}`}
            className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke Detail</span>
            <span className="sm:hidden">Kembali</span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <DownloadDocumentButton
              targetId="surat-jalan-sheet"
              filename={`Surat-Jalan-${invoice.invoiceNumber}`}
              label="Unduh Gambar"
            />
            <PrintButton label="Cetak Surat Jalan" />
          </div>
        </div>
      </div>

      {/* Container utama yang responsif di mobile & rapi di desktop */}
      <div className="w-full p-2.5 sm:p-6 flex justify-center print:p-0 print:m-0">
        {/* Lembar Surat Jalan */}
        <div
          id="surat-jalan-sheet"
          className="w-full max-w-3xl bg-white text-black p-4 sm:p-10 pb-10 sm:pb-16 border border-zinc-200/80 shadow-sm rounded-xl sm:rounded-none font-sans print:shadow-none print:border-none print:m-0 print:p-0 print:w-full print:max-w-none break-inside-avoid print:break-inside-avoid"
        >
          {/* Header Atas: Kotak Pelanggan di Kiri & Judul SURAT JALAN di Kanan */}
          <div className="flex justify-between items-start gap-2.5 sm:gap-6 pb-4 sm:pb-6">
            {/* Kotak Penerima (Border hitam persegi sesuai format) */}
            <div className="border border-black p-2.5 sm:p-3.5 w-[52%] sm:w-80 text-xs sm:text-sm leading-snug">
              <p className="font-semibold text-black text-sm sm:text-base truncate">{invoice.customerName}</p>
              {invoice.customerAddress && (
                <p className="text-zinc-800 text-[11px] sm:text-xs mt-0.5 whitespace-pre-line leading-relaxed">
                  {invoice.customerAddress}
                </p>
              )}
              {invoice.customerPhone && (
                <p className="text-zinc-600 text-[11px] sm:text-xs mt-0.5 font-mono">
                  Telp: {invoice.customerPhone}
                </p>
              )}
            </div>

            {/* Judul SURAT JALAN & Shipping Date */}
            <div className="text-right w-[46%] sm:w-auto">
              <h1 className="text-xl sm:text-3xl font-extrabold uppercase tracking-wide text-black">
                SURAT JALAN
              </h1>
              <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-0.5 sm:gap-6 mt-2 sm:mt-5 text-xs sm:text-sm">
                <span className="font-medium text-black">Shipping Date</span>
                <span className="font-mono font-bold text-black sm:min-w-28 text-right">
                  {formatDateSlash(invoice.issueDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabel Rincian Barang (Sesuai Gambar: No, Nama Barang, Qty dengan Border Hitam Penuh) */}
          <div className="mt-3 sm:mt-4">
            <table className="w-full border-collapse border border-black text-xs sm:text-sm">
              <thead>
                <tr className="bg-white">
                  <th className="border border-black py-2 px-1.5 sm:px-3 text-center font-bold text-black w-10 sm:w-14">
                    No
                  </th>
                  <th className="border border-black py-2 px-2.5 sm:px-4 text-center font-bold text-black">
                    Nama Barang
                  </th>
                  <th className="border border-black py-2 px-2 sm:px-4 text-center font-bold text-black w-20 sm:w-32">
                    Qty
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it, idx) => (
                  <tr key={it.id}>
                    <td className="border border-black py-2 px-1.5 sm:px-3 text-center font-mono text-black">
                      {idx + 1}
                    </td>
                    <td className="border border-black py-2 px-2.5 sm:px-4 font-medium text-black">
                      {it.itemName}
                    </td>
                    <td className="border border-black py-2 px-2 sm:px-4 text-right font-mono font-semibold text-black">
                      {it.qty} {it.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bagian Tanda Tangan: Pengirim & Penerima */}
          <div className="pt-12 sm:pt-20 pb-4 sm:pb-8 flex justify-between px-2 sm:px-16 text-center text-xs sm:text-sm font-bold text-black break-inside-avoid print:break-inside-avoid">
            <div className="w-32 sm:w-56">
              <p>Pengirim</p>
              <div className="h-16 sm:h-24"></div>
              <div className="border-b border-black w-28 sm:w-44 mx-auto"></div>
              {settings?.businessName && (
                <p className="text-[11px] sm:text-xs text-zinc-600 font-normal mt-1.5 truncate">{settings.businessName}</p>
              )}
            </div>

            <div className="w-32 sm:w-56">
              <p>Penerima</p>
              <div className="h-16 sm:h-24"></div>
              <div className="border-b border-black w-28 sm:w-44 mx-auto"></div>
              <p className="text-[11px] sm:text-xs text-zinc-600 font-normal mt-1.5 truncate">{invoice.customerName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

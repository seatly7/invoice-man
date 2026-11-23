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
              targetId="surat-jalan-sheet"
              filename={`Surat-Jalan-${invoice.invoiceNumber}`}
              label="Unduh Gambar"
            />
            <PrintButton label="Cetak Surat Jalan" />
          </div>
        </div>
      </div>

      {/* Container scroll horizontal untuk mobile agar dokumen tetap presisi */}
      <div className="w-full overflow-x-auto p-3 sm:p-6 flex justify-center print:p-0 print:m-0 print:overflow-visible">
        {/* Lembar Surat Jalan */}
        <div
          id="surat-jalan-sheet"
          className="w-[800px] min-w-[800px] bg-white text-black p-10 pb-16 border border-zinc-200/80 shadow-sm print:shadow-none print:border-none print:m-0 print:p-0 print:w-full print:min-w-0 print:max-w-none break-inside-avoid print:break-inside-avoid font-sans"
        >
          {/* Header Atas: Kotak Pelanggan di Kiri & Judul SURAT JALAN di Kanan */}
          <div className="flex justify-between items-start gap-6 pb-6">
            {/* Kotak Penerima (Border hitam persegi sesuai format) */}
            <div className="border border-black p-3.5 w-80 text-sm leading-snug">
              <p className="font-semibold text-black text-base">{invoice.customerName}</p>
              {invoice.customerAddress && (
                <p className="text-zinc-800 text-xs mt-1 whitespace-pre-line leading-relaxed">
                  {invoice.customerAddress}
                </p>
              )}
              {invoice.customerPhone && (
                <p className="text-zinc-600 text-xs mt-1 font-mono">
                  Telp: {invoice.customerPhone}
                </p>
              )}
            </div>

            {/* Judul SURAT JALAN & Shipping Date */}
            <div className="text-right">
              <h1 className="text-3xl font-extrabold uppercase tracking-wide text-black">
                SURAT JALAN
              </h1>
              <div className="flex justify-end items-center gap-8 mt-5 text-sm">
                <span className="font-medium text-black">Shipping Date</span>
                <span className="font-mono font-bold text-black min-w-28 text-right">
                  {formatDateSlash(invoice.issueDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabel Rincian Barang (Sesuai Gambar: No, Nama Barang, Qty dengan Border Hitam Penuh) */}
          <div className="mt-4">
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr className="bg-white">
                  <th className="border border-black py-2 px-3 text-center font-bold text-black w-14">
                    No
                  </th>
                  <th className="border border-black py-2 px-4 text-center font-bold text-black">
                    Nama Barang
                  </th>
                  <th className="border border-black py-2 px-3 text-center font-bold text-black w-32">
                    Qty
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it, idx) => (
                  <tr key={it.id}>
                    <td className="border border-black py-2.5 px-3 text-center font-mono text-black">
                      {idx + 1}
                    </td>
                    <td className="border border-black py-2.5 px-4 font-medium text-black">
                      {it.itemName}
                    </td>
                    <td className="border border-black py-2.5 px-4 text-right font-mono font-semibold text-black">
                      {it.qty} {it.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bagian Tanda Tangan: Pengirim & Penerima */}
          <div className="pt-20 pb-8 flex justify-between px-16 text-center text-sm font-bold text-black break-inside-avoid print:break-inside-avoid">
            <div className="w-56">
              <p>Pengirim</p>
              <div className="h-24"></div>
              <div className="border-b border-black w-full mx-auto"></div>
              {settings?.businessName && (
                <p className="text-xs text-zinc-600 font-normal mt-1.5">{settings.businessName}</p>
              )}
            </div>

            <div className="w-56">
              <p>Penerima</p>
              <div className="h-24"></div>
              <div className="border-b border-black w-full mx-auto"></div>
              <p className="text-xs text-zinc-600 font-normal mt-1.5">{invoice.customerName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

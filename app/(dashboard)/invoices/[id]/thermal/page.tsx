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
import { ArrowLeft } from 'lucide-react'

export const instant = false

export const metadata: Metadata = {
  title: 'Cetak Struk Kasir Thermal 80mm - Invoice-Man',
}

export default async function ThermalInvoicePage({
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
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 pb-20 print:min-h-0 print:bg-white print:p-0 print:pb-0 print:m-0">
      {/* Pengaturan CSS Cetak Khusus Struk Roll Thermal 80mm */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: 80mm auto;
              margin: 2mm 3mm;
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
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <Link
            href={`/invoices/${invoice.id}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Detail</span>
          </Link>

          <div className="flex items-center gap-2">
            <DownloadDocumentButton
              targetId="invoice-thermal-sheet"
              filename={`Struk-${invoice.invoiceNumber}`}
            />
            <PrintButton label="Cetak Struk" />
          </div>
        </div>
      </div>

      {/* Lembar Simulasi Kertas Thermal Struk 80mm */}
      <div className="w-full overflow-x-auto p-4 flex justify-center print:p-0 print:m-0 print:overflow-visible">
        <div
          id="invoice-thermal-sheet"
          className="w-[320px] min-w-[320px] max-w-[320px] bg-white text-black font-mono text-xs shadow-md border border-zinc-200/80 p-6 pb-8 rounded-none print:shadow-none print:border-none print:m-0 print:p-1 print:w-[72mm] print:max-w-[72mm]"
        >
        {/* Header Toko */}
        <div className="text-center space-y-1 pb-3">
          <h2 className="text-base font-extrabold uppercase tracking-tight">
            {settings?.businessName || 'INVOICE-MAN'}
          </h2>
          {settings?.businessAddress && (
            <p className="text-xs text-zinc-600 leading-tight whitespace-pre-line">
              {settings.businessAddress}
            </p>
          )}
          {settings?.businessPhone && (
            <p className="text-xs text-zinc-600">
              Telp: {settings.businessPhone}
            </p>
          )}
        </div>

        {/* Garis Putus-putus */}
        <div className="border-b border-dashed border-zinc-400 my-2" />

        {/* Info Faktur */}
        <div className="space-y-0.5 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-500">No:</span>
            <span className="font-bold">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Tgl:</span>
            <span>{formatDate(invoice.issueDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Kpd:</span>
            <span className="font-bold truncate max-w-[180px]">{invoice.customerName}</span>
          </div>
          {invoice.customerPhone && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Telp:</span>
              <span>{invoice.customerPhone}</span>
            </div>
          )}
        </div>

        {/* Garis Putus-putus */}
        <div className="border-b border-dashed border-zinc-400 my-2" />

        {/* Daftar Barang */}
        <div className="space-y-2 py-1">
          {invoice.items.map((it) => (
            <div key={it.id} className="space-y-0.5">
              <div className="font-bold text-xs leading-tight">
                {it.itemName}
              </div>
              <div className="flex justify-between text-xs text-zinc-700">
                <span>
                  {it.qty} {it.unit} × {formatRupiah(it.unitPrice, false)}
                </span>
                <span className="font-bold text-black">
                  {formatRupiah(it.lineTotal, false)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Garis Putus-putus */}
        <div className="border-b border-dashed border-zinc-400 my-2" />

        {/* Kalkulasi Pembayaran */}
        <div className="space-y-1 text-xs pt-1">
          <div className="flex justify-between text-zinc-600">
            <span>Subtotal:</span>
            <span>{formatRupiah(invoice.subtotal, false)}</span>
          </div>

          {invoice.discountAmount > 0 && (
            <div className="flex justify-between text-zinc-600">
              <span>Diskon:</span>
              <span>-{formatRupiah(invoice.discountAmount, false)}</span>
            </div>
          )}

          {invoice.taxRate > 0 && (
            <div className="flex justify-between text-zinc-600">
              <span>PPN ({invoice.taxRate}%):</span>
              <span>+{formatRupiah(invoice.taxAmount, false)}</span>
            </div>
          )}

          <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-zinc-300">
            <span>TOTAL:</span>
            <span>{formatRupiah(invoice.grandTotal)}</span>
          </div>

          <div className="flex justify-between text-xs pt-1 text-zinc-500">
            <span>STATUS:</span>
            <span className="font-bold uppercase tracking-wider text-black">
              {invoice.status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
            </span>
          </div>
        </div>

        {/* Garis Putus-putus */}
        <div className="border-b border-dashed border-zinc-400 my-2" />

        {/* Catatan Kaki / Ucapan Terima Kasih */}
        <div className="text-center pt-2 space-y-1 text-xs text-zinc-600">
          <p className="whitespace-pre-line leading-tight">
            {invoice.notes || settings?.footerNote || 'Terima kasih atas kepercayaan Anda.'}
          </p>
          <p className="text-xs text-zinc-400 pt-1">
            Dicetak via Invoice-Man
          </p>
        </div>
      </div>
    </div>
  </div>
  )
}

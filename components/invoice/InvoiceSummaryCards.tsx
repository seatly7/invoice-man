import * as React from 'react'
import { InvoiceMetrics } from '@/types/invoice.types'
import { formatRupiah } from '@/lib/utils/currency'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Calendar, CheckCircle2, FileEdit, AlertTriangle } from 'lucide-react'

export interface InvoiceSummaryCardsProps {
  metrics: InvoiceMetrics
}

export function InvoiceSummaryCards({ metrics }: InvoiceSummaryCardsProps) {
  return (
    <div>
      {/* Tampilan Desktop & Tablet: 4 Kolom Seimbang (grid-cols-2 lg:grid-cols-4) */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Belum Bayar (Primary Hero Highlight) */}
        <div className="rounded-xl p-4 bg-zinc-900 text-white dark:bg-zinc-900 dark:border dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Total Belum Bayar
            </span>
            <span className="text-[11px] font-medium bg-white/10 text-zinc-200 px-2 py-0.5 rounded-full">
              {metrics.unpaidCount} Tagihan
            </span>
          </div>

          <div className="mt-3">
            <h3 className="text-xl font-bold font-mono tracking-tight text-white">
              {formatRupiah(metrics.totalUnpaidAmount)}
            </h3>
            {metrics.overdueCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 mt-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                {metrics.overdueCount} tagihan jatuh tempo
              </span>
            ) : (
              <p className="text-[11px] text-zinc-400 mt-1">Tidak ada jatuh tempo</p>
            )}
          </div>
        </div>

        {/* Card 2: Bulan Ini */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Tagihan Bulan Ini
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {metrics.thisMonthCount}
                </span>
                <span className="text-xs text-zinc-400">Invoice</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Dibuat bulan ini</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Sudah Lunas */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Sudah Lunas
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {metrics.paidCount}
                </span>
                <span className="text-xs text-zinc-400">Invoice</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Pembayaran selesai</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Draft */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <FileEdit className="w-3.5 h-3.5 text-zinc-400" />
                Faktur Draft
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {metrics.draftCount}
                </span>
                <span className="text-xs text-zinc-400">Invoice</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Belum diterbitkan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tampilan Mobile: Hero Card Atas + 3 Kolom Mini KPI di Bawah */}
      <div className="space-y-2.5 md:hidden">
        {/* Unpaid Outstanding Alert/Banner */}
        <div className="rounded-2xl p-4 bg-zinc-900 text-white dark:bg-zinc-900 dark:border dark:border-zinc-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Total Belum Bayar
            </span>
            <span className="text-xs font-medium bg-white/10 text-zinc-200 px-2.5 py-0.5 rounded-full">
              {metrics.unpaidCount} Tagihan
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between gap-2 flex-wrap">
            <h2 className="text-2xl font-bold tracking-tight font-mono">
              {formatRupiah(metrics.totalUnpaidAmount)}
            </h2>

            {metrics.overdueCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                {metrics.overdueCount} Jatuh Tempo
              </span>
            )}
          </div>
        </div>

        {/* Mini KPI Stat Grid (3 Kolom Sesuai Layar Ponsel) */}
        <div className="grid grid-cols-3 gap-2">
          {/* Bulan Ini */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
            <CardContent className="p-3">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1 truncate">
                <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                Bulan Ini
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {metrics.thisMonthCount}
                </span>
                <span className="text-xs text-zinc-400">Inv</span>
              </div>
            </CardContent>
          </Card>

          {/* Lunas */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
            <CardContent className="p-3">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Lunas
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {metrics.paidCount}
                </span>
                <span className="text-xs text-zinc-400">Inv</span>
              </div>
            </CardContent>
          </Card>

          {/* Draft */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
            <CardContent className="p-3">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1 truncate">
                <FileEdit className="w-3 h-3 text-zinc-400 shrink-0" />
                Draft
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {metrics.draftCount}
                </span>
                <span className="text-xs text-zinc-400">Inv</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

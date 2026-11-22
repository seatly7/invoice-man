import { Badge } from '@/components/ui/badge'
import { InvoiceStatus } from '@/types/invoice.types'

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
  },
  issued: {
    label: 'Belum Bayar',
    className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  paid: {
    label: 'Lunas',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  cancelled: {
    label: 'Batal',
    className: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800',
  },
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft

  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${config.className}`}
    >
      {config.label}
    </Badge>
  )
}

import { Metadata } from 'next'
import { getInvoiceSettings } from '@/lib/queries/settings.queries'
import { SettingsForm } from '@/components/settings/SettingsForm'

export const metadata: Metadata = {
  title: 'Pengaturan Usaha - Invoice-Man',
  description: 'Atur identitas bisnis, nomor rekening, dan format faktur tagihan.',
}

export const instant = false

export default async function SettingsPage() {
  const initialSettings = await getInvoiceSettings()

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 md:pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Pengaturan Usaha
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Identitas bisnis dan rekening pembayaran Anda akan tercetak di lembar tagihan faktur.
        </p>
      </div>

      <SettingsForm initialSettings={initialSettings} />
    </div>
  )
}

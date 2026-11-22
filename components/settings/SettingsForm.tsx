'use client'

import * as React from 'react'
import { useActionState, useEffect, useState } from 'react'
import { updateSettingsAction, type SettingsActionResult } from '@/lib/actions/settings.actions'
import { InvoiceSettings } from '@/types/settings.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Store,
  MapPin,
  Phone,
  Mail,
  FileSpreadsheet,
  Percent,
  CreditCard,
  Loader2,
  AlertCircle,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'

export interface SettingsFormProps {
  initialSettings: InvoiceSettings | null
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState<SettingsActionResult | null, FormData>(
    updateSettingsAction,
    null
  )

  const [taxRate, setTaxRate] = useState<number>(initialSettings?.defaultTaxRate ?? 11)

  useEffect(() => {
    if (state?.success) {
      toast.success('Pengaturan profil usaha berhasil disimpan!')
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-5">
      {/* Alert Error */}
      {state?.error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Bagian 1: Identitas Bisnis & Usaha */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 pb-1 border-b border-zinc-100 dark:border-zinc-800">
            <Store className="w-3.5 h-3.5" />
            <span>Identitas Bisnis / Pengirim</span>
          </div>

          {/* Nama Usaha */}
          <div className="space-y-1.5">
            <Label htmlFor="businessName" className="text-xs sm:text-sm font-medium">
              Nama Usaha / Toko / Perusahaan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="businessName"
              name="businessName"
              defaultValue={initialSettings?.businessName || ''}
              placeholder="Contoh: CV. Maju Berkah Solusindo"
              required
              className="h-11 text-base placeholder:text-zinc-400"
            />
          </div>

          {/* Alamat Usaha */}
          <div className="space-y-1.5">
            <Label htmlFor="businessAddress" className="text-xs sm:text-sm font-medium">
              Alamat Usaha
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                id="businessAddress"
                name="businessAddress"
                defaultValue={initialSettings?.businessAddress || ''}
                placeholder="Jl. Raya No. 123, Kota, Provinsi"
                className="pl-9 h-11 text-sm placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Kontak: Telepon & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="businessPhone" className="text-xs sm:text-sm font-medium">
                No. Telepon / WhatsApp
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  id="businessPhone"
                  name="businessPhone"
                  type="tel"
                  defaultValue={initialSettings?.businessPhone || ''}
                  placeholder="0812-xxxx-xxxx"
                  className="pl-9 h-11 text-sm placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="businessEmail" className="text-xs sm:text-sm font-medium">
                Email Usaha
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  id="businessEmail"
                  name="businessEmail"
                  type="email"
                  defaultValue={initialSettings?.businessEmail || ''}
                  placeholder="kontak@toko.com"
                  className="pl-9 h-11 text-sm placeholder:text-zinc-400"
                />
              </div>
            </div>
          </div>

          {/* NPWP (Tax ID) */}
          <div className="space-y-1.5">
            <Label htmlFor="taxId" className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
              NPWP Usaha (Opsional)
            </Label>
            <Input
              id="taxId"
              name="taxId"
              defaultValue={initialSettings?.taxId || ''}
              placeholder="01.234.567.8-901.000"
              className="h-11 text-sm font-mono placeholder:text-zinc-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bagian 2: Pengaturan Dokumen Faktur */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 pb-1 border-b border-zinc-100 dark:border-zinc-800">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Format Dokumen Tagihan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Awalan Invoice (Prefix) */}
            <div className="space-y-1.5">
              <Label htmlFor="invoicePrefix" className="text-xs sm:text-sm font-medium">
                Awalan Nomor Invoice <span className="text-red-500">*</span>
              </Label>
              <Input
                id="invoicePrefix"
                name="invoicePrefix"
                defaultValue={initialSettings?.invoicePrefix || 'INV'}
                placeholder="INV"
                required
                className="h-11 font-mono uppercase text-sm"
              />
              <p className="text-xs text-zinc-500">
                Contoh hasil: {initialSettings?.invoicePrefix || 'INV'}-0001
              </p>
            </div>

            {/* Tarif Pajak Default */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="defaultTaxRate" className="text-xs sm:text-sm font-medium">
                  Tarif Pajak Standar (%)
                </Label>
                <div className="flex gap-1.5">
                  {[0, 11, 12].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTaxRate(r)}
                      className={`text-xs px-2.5 py-1 font-medium rounded border transition-colors ${
                        taxRate === r
                          ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Percent className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                <Input
                  id="defaultTaxRate"
                  name="defaultTaxRate"
                  type="number"
                  min={0}
                  max={100}
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                  className="pl-9 h-11 font-mono text-sm"
                />
              </div>
              <p className="text-xs text-zinc-500">
                Akan otomatis terisi saat membuat invoice baru.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bagian 3: Info Rekening & Catatan Pembayaran */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 pb-1 border-b border-zinc-100 dark:border-zinc-800">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Info Pembayaran & Catatan Kaki</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="footerNote" className="text-xs sm:text-sm font-medium">
              Instruksi Rekening Transfer Bank / Catatan Kaki
            </Label>
            <Textarea
              id="footerNote"
              name="footerNote"
              rows={3}
              defaultValue={
                initialSettings?.footerNote ||
                'Pembayaran via transfer Bank BCA: 8290-xxx-xxx a.n Nama Rekening. Mohon kirimkan bukti pembayaran.'
              }
              placeholder="Nomor rekening bank, nama pemilik rekening, atau instruksi pembayaran..."
              className="text-sm resize-none"
            />
            <p className="text-xs text-zinc-500">
              Teks ini akan selalu tercetak di bagian bawah lembar Faktur PDF A4 dan struk kasir.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tombol Simpan */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 text-base font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow transition-transform active:scale-[0.98]"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Menyimpan Pengaturan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Simpan Pengaturan
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

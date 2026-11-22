'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { invoiceSettingsSchema } from '@/lib/schemas/settings.schema'

export interface SettingsActionResult {
  success?: boolean
  error?: string
}

export async function updateSettingsAction(
  prevState: SettingsActionResult | null,
  formData: FormData
): Promise<SettingsActionResult> {
  const rawData = {
    businessName: formData.get('businessName') as string,
    businessAddress: (formData.get('businessAddress') as string) || null,
    businessPhone: (formData.get('businessPhone') as string) || null,
    businessEmail: (formData.get('businessEmail') as string) || null,
    taxId: (formData.get('taxId') as string) || null,
    invoicePrefix: (formData.get('invoicePrefix') as string) || 'INV',
    defaultTaxRate: Number(formData.get('defaultTaxRate')) || 0,
    footerNote: (formData.get('footerNote') as string) || null,
  }

  const validated = invoiceSettingsSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      error: validated.error.issues[0]?.message || 'Data pengaturan tidak valid',
    }
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesi telah berakhir. Silakan login kembali.' }
  }

  const payload = {
    user_id: user.id,
    business_name: validated.data.businessName,
    business_address: validated.data.businessAddress || null,
    business_phone: validated.data.businessPhone || null,
    business_email: validated.data.businessEmail || null,
    tax_id: validated.data.taxId || null,
    invoice_prefix: validated.data.invoicePrefix,
    default_tax_rate: validated.data.defaultTaxRate,
    footer_note: validated.data.footerNote || null,
  }

  const { error } = await supabase
    .from('invoice_settings')
    .upsert(payload, { onConflict: 'user_id' })

  if (error) {
    console.error('Update invoice_settings error:', error.message)
    if (error.code === '42501') {
      return {
        error: 'Izin database ditolak (permission denied) pada tabel invoice_settings. Silakan jalankan script SQL GRANT di Supabase.',
      }
    }
    return { error: error.message || 'Gagal menyimpan pengaturan.' }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/settings')
  return { success: true }
}

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InvoiceSettings } from '@/types/settings.types'

/**
 * Mengambil pengaturan invoice dan identitas usaha untuk user yang aktif.
 * Mengembalikan objek InvoiceSettings dengan fallback default jika data belum tersimpan.
 */
export async function getInvoiceSettings(): Promise<InvoiceSettings | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('invoice_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    // Fallback: gunakan metadata user jika tabel belum memiliki baris untuk user ini
    return {
      id: '',
      userId: user.id,
      businessName: (user.user_metadata?.business_name as string) || 'Usaha Saya',
      businessAddress: null,
      businessPhone: null,
      businessEmail: user.email || null,
      taxId: null,
      logoUrl: null,
      invoicePrefix: 'INV',
      lastInvoiceNumber: 0,
      defaultTaxRate: 11,
      footerNote: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  return {
    id: data.id,
    userId: data.user_id,
    businessName: data.business_name,
    businessAddress: data.business_address,
    businessPhone: data.business_phone,
    businessEmail: data.business_email,
    taxId: data.tax_id,
    logoUrl: data.logo_url,
    invoicePrefix: data.invoice_prefix || 'INV',
    lastInvoiceNumber: data.last_invoice_number || 0,
    defaultTaxRate: Number(data.default_tax_rate) || 0,
    footerNote: data.footer_note,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

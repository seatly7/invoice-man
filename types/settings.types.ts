import { Database } from './database.types'

export type InvoiceSettingsRow = Database['public']['Tables']['invoice_settings']['Row']

/**
 * Pengaturan Profil Usaha & Standar Dokumen Tagihan
 */
export interface InvoiceSettings {
  id: string
  userId: string
  businessName: string
  businessAddress: string | null
  businessPhone: string | null
  businessEmail: string | null
  taxId: string | null // NPWP
  logoUrl: string | null // Storage path
  invoicePrefix: string // default: 'INV'
  lastInvoiceNumber: number
  defaultTaxRate: number // default: 0% / 11%
  footerNote: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Nilai Form Pengaturan
 */
export interface InvoiceSettingsFormValues {
  businessName: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
  taxId?: string
  invoicePrefix: string
  defaultTaxRate: number
  footerNote?: string
}

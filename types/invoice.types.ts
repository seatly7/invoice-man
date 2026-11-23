import { Database, InvoiceStatus } from './database.types'

export type { InvoiceStatus }

export type InvoiceRow = Database['public']['Tables']['invoices']['Row']
export type InvoiceItemRow = Database['public']['Tables']['invoice_items']['Row']

/**
 * Entitas Baris Detail Item Invoice (Snapshot)
 */
export interface InvoiceItem {
  id: string
  invoiceId: string
  productId: string | null
  itemName: string
  unit: string
  qty: number
  unitPrice: number
  lineTotal: number
  sortOrder: number
  createdAt: string
}

/**
 * Entitas Header Tagihan Invoice
 */
export interface Invoice {
  id: string
  userId: string
  invoiceNumber: string
  customerName: string
  customerPhone: string | null
  customerEmail: string | null
  customerAddress: string | null
  issueDate: string
  dueDate: string | null
  subtotal: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  grandTotal: number
  notes: string | null
  status: InvoiceStatus
  createdAt: string
  updatedAt: string
}

/**
 * Invoice lengkap beserta seluruh rincian itemnya
 */
export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[]
}

/**
 * Item ringkas untuk daftar / list view invoice
 */
export interface InvoiceListItem {
  id: string
  invoiceNumber: string
  customerName: string
  customerPhone: string | null
  issueDate: string
  dueDate: string | null
  grandTotal: number
  status: InvoiceStatus
  itemCount: number
  createdAt: string
}

/**
 * Payload item saat membuat/mengubah invoice
 */
export interface InvoiceItemInput {
  productId?: string | null
  itemName: string
  unit: string
  qty: number
  unitPrice: number
  sortOrder?: number
}

/**
 * Payload form buat invoice baru
 */
export interface CreateInvoicePayload {
  customerName: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
  issueDate: string
  dueDate?: string
  discountAmount?: number
  taxRate?: number
  notes?: string
  status?: InvoiceStatus
  items: InvoiceItemInput[]
}

/**
 * Payload form edit/perbarui invoice yang sudah ada (termasuk catatan audit trail)
 */
export interface UpdateInvoicePayload extends CreateInvoicePayload {
  revisionNote?: string
}

/**
 * Filter & query params daftar invoice
 */
export interface InvoiceQueryParams {
  search?: string
  status?: InvoiceStatus | 'all'
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

/**
 * Ringkasan metrik dashboard invoice (sesuai rancangan Stitch)
 */
export interface InvoiceMetrics {
  totalUnpaidAmount: number
  unpaidCount: number
  overdueCount: number
  thisMonthCount: number
  paidCount: number
  draftCount: number
}

/**
 * Respon paginasi daftar invoice
 */
export interface InvoiceListResponse {
  data: InvoiceListItem[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

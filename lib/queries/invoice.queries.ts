import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  InvoiceListItem,
  InvoiceMetrics,
  InvoiceWithItems,
  InvoiceQueryParams,
  InvoiceListResponse,
} from '@/types/invoice.types'

/**
 * Mengambil daftar invoice pengguna dengan pagination & filter status
 */
export async function getInvoices({
  search,
  status = 'all',
  page = 1,
  pageSize = 50,
}: InvoiceQueryParams = {}): Promise<InvoiceListResponse> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], count: 0, page, pageSize, totalPages: 0 }
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('invoices')
    .select('id, invoice_number, customer_name, customer_phone, issue_date, due_date, grand_total, status, created_at, invoice_items(id)', {
      count: 'exact',
    })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status && status !== 'all') {
    if (status === 'issued') {
      // 'issued' = Belum bayar
      query = query.eq('status', 'issued')
    } else {
      query = query.eq('status', status)
    }
  }

  if (search && search.trim()) {
    const s = search.trim()
    query = query.or(`customer_name.ilike.%${s}%,invoice_number.ilike.%${s}%`)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('getInvoices error:', error.message)
    return { data: [], count: 0, page, pageSize, totalPages: 0 }
  }

  const list: InvoiceListItem[] = (data || []).map((row: any) => ({
    id: row.id,
    invoiceNumber: row.invoice_number,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    grandTotal: Number(row.grand_total) || 0,
    status: row.status,
    itemCount: Array.isArray(row.invoice_items) ? row.invoice_items.length : 0,
    createdAt: row.created_at,
  }))

  const totalCount = count ?? list.length
  return {
    data: list,
    count: totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  }
}

/**
 * Mengambil ringkasan metrik statistik invoice untuk widget kartu atas
 */
export async function getInvoiceMetrics(): Promise<InvoiceMetrics> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      totalUnpaidAmount: 0,
      unpaidCount: 0,
      overdueCount: 0,
      thisMonthCount: 0,
      paidCount: 0,
      draftCount: 0,
    }
  }

  // Filter invoices to recent / current year or unpaid to prevent downloading unbounded history into memory
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString()

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('grand_total, status, due_date, created_at')
    .eq('user_id', user.id)
    .or(`created_at.gte.${startOfYear},status.eq.issued`)

  if (error || !invoices) {
    return {
      totalUnpaidAmount: 0,
      unpaidCount: 0,
      overdueCount: 0,
      thisMonthCount: 0,
      paidCount: 0,
      draftCount: 0,
    }
  }

  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const todayStr = now.toISOString().split('T')[0]

  let totalUnpaidAmount = 0
  let unpaidCount = 0
  let overdueCount = 0
  let thisMonthCount = 0
  let paidCount = 0
  let draftCount = 0

  for (const inv of invoices) {
    const total = Number(inv.grand_total) || 0
    const invDate = new Date(inv.created_at)

    if (invDate.getFullYear() === currentYear && invDate.getMonth() === currentMonth) {
      thisMonthCount++
    }

    if (inv.status === 'issued') {
      totalUnpaidAmount += total
      unpaidCount++
      if (inv.due_date && inv.due_date < todayStr) {
        overdueCount++
      }
    } else if (inv.status === 'paid') {
      paidCount++
    } else if (inv.status === 'draft') {
      draftCount++
    }
  }

  return {
    totalUnpaidAmount,
    unpaidCount,
    overdueCount,
    thisMonthCount,
    paidCount,
    draftCount,
  }
}

/**
 * Mengambil detail satu invoice beserta seluruh rincian itemnya
 */
export async function getInvoiceById(id: string): Promise<InvoiceWithItems | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      id, user_id, invoice_number, customer_name, customer_phone,
      customer_email, customer_address, issue_date, due_date,
      subtotal, discount_amount, tax_rate, tax_amount, grand_total,
      notes, status, created_at, updated_at,
      invoice_items (
        id, invoice_id, product_id, item_name, unit, qty, unit_price, line_total, sort_order, created_at
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !invoice) {
    return null
  }

  const items = ((invoice as any).invoice_items || []).map((it: any) => ({
    id: it.id,
    invoiceId: it.invoice_id,
    productId: it.product_id,
    itemName: it.item_name,
    unit: it.unit || 'pcs',
    qty: Number(it.qty) || 0,
    unitPrice: Number(it.unit_price) || 0,
    lineTotal: Number(it.line_total) || (Number(it.qty) * Number(it.unit_price)),
    sortOrder: it.sort_order || 0,
    createdAt: it.created_at,
  }))

  items.sort((a: any, b: any) => a.sortOrder - b.sortOrder)

  return {
    id: invoice.id,
    userId: invoice.user_id,
    invoiceNumber: invoice.invoice_number,
    customerName: invoice.customer_name,
    customerPhone: invoice.customer_phone,
    customerEmail: invoice.customer_email,
    customerAddress: invoice.customer_address,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    subtotal: Number(invoice.subtotal) || 0,
    discountAmount: Number(invoice.discount_amount) || 0,
    taxRate: Number(invoice.tax_rate) || 0,
    taxAmount: Number(invoice.tax_amount) || 0,
    grandTotal: Number(invoice.grand_total) || 0,
    notes: invoice.notes,
    status: invoice.status as any,
    createdAt: invoice.created_at,
    updatedAt: invoice.updated_at,
    items,
  }
}

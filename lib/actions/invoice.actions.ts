'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createInvoiceSchema, updateInvoiceSchema } from '@/lib/schemas/invoice.schema'
import { calcInvoiceTotals } from '@/lib/utils/invoice-calc'
import { generateInvoiceNumber } from '@/lib/utils/invoice-number'
import { CreateInvoicePayload, UpdateInvoicePayload, InvoiceStatus } from '@/types/invoice.types'

export interface CreateInvoiceResult {
  success?: boolean
  invoiceId?: string
  error?: string
}

/**
 * Mendapatkan nomor invoice berikutnya:
 * 1. Coba panggil RPC PostgreSQL generate_invoice_number(user_id) (atomik)
 * 2. Jika RPC belum terpasang di database user, gunakan fallback atomik via SQL update
 */
async function getNextInvoiceNumber(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string): Promise<string> {
  // Coba via RPC yang didefinisikan di PRD
  const { data: rpcNumber, error: rpcError } = await supabase.rpc('generate_invoice_number', {
    p_user_id: userId,
  })

  if (!rpcError && rpcNumber) {
    return rpcNumber as string
  }

  // Fallback: baca invoice_settings lalu update counter tanpa menimpa business_name profil user
  const { data: settings } = await supabase
    .from('invoice_settings')
    .select('invoice_prefix, last_invoice_number')
    .eq('user_id', userId)
    .single()

  const prefix = settings?.invoice_prefix || 'INV'
  const nextNum = (settings?.last_invoice_number || 0) + 1

  if (settings) {
    await supabase
      .from('invoice_settings')
      .update({ last_invoice_number: nextNum })
      .eq('user_id', userId)
  } else {
    await supabase
      .from('invoice_settings')
      .insert({
        user_id: userId,
        business_name: 'Usaha Saya',
        invoice_prefix: prefix,
        last_invoice_number: nextNum,
      })
  }

  return generateInvoiceNumber(prefix, nextNum, 4)
}

/**
 * Server Action: Buat Faktur Tagihan Baru
 */
export async function createInvoiceAction(
  payload: CreateInvoicePayload
): Promise<CreateInvoiceResult> {
  const validated = createInvoiceSchema.safeParse(payload)
  if (!validated.success) {
    return {
      error: validated.error.issues[0]?.message || 'Data faktur tidak valid',
    }
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesi login telah berakhir. Silakan masuk kembali.' }
  }

  const { customerName, customerPhone, customerEmail, customerAddress, issueDate, dueDate, discountAmount, taxRate, notes, status, items } = validated.data

  // Hitung ulang kalkulasi di server untuk integritas data finansial
  const itemInputs = items.map((it) => ({
    qty: it.qty,
    unit_price: it.unitPrice,
  }))
  const totals = calcInvoiceTotals(itemInputs, discountAmount || 0, taxRate || 0)

  // Dapatkan nomor invoice otomatis
  let invoiceNumber: string
  try {
    invoiceNumber = await getNextInvoiceNumber(supabase, user.id)
  } catch {
    invoiceNumber = `INV-${Date.now().toString().slice(-4)}`
  }

  // 1. Simpan Header Invoice
  const { data: invoiceRecord, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      invoice_number: invoiceNumber,
      customer_name: customerName,
      customer_phone: customerPhone || null,
      customer_email: customerEmail || null,
      customer_address: customerAddress || null,
      issue_date: issueDate,
      due_date: dueDate || null,
      subtotal: totals.subtotal,
      discount_amount: totals.discount_amount,
      tax_rate: totals.tax_rate,
      tax_amount: totals.tax_amount,
      grand_total: totals.grand_total,
      notes: notes || null,
      status: status || 'issued',
    })
    .select('id')
    .single()

  if (invoiceError || !invoiceRecord) {
    console.error('Insert invoice error:', invoiceError)
    if (invoiceError?.code === '42501') {
      return { error: 'Izin database ditolak (permission denied) pada tabel invoices. Jalankan script SQL GRANT di Supabase.' }
    }
    return { error: invoiceError?.message || 'Gagal menyimpan faktur invoice.' }
  }

  // 2. Simpan Item Detail (Snapshot)
  const itemRows = items.map((it, idx) => ({
    invoice_id: invoiceRecord.id,
    product_id: it.productId || null,
    item_name: it.itemName,
    unit: it.unit || 'pcs',
    qty: it.qty,
    unit_price: it.unitPrice,
    sort_order: it.sortOrder ?? idx + 1,
  }))

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemRows)

  if (itemsError) {
    console.error('Insert invoice_items error:', itemsError)
    // Jika gagal insert item, hapus header invoice untuk menjaga integritas data
    await supabase.from('invoices').delete().eq('id', invoiceRecord.id).eq('user_id', user.id)
    if (itemsError.code === '42501') {
      return { error: 'Izin database ditolak (permission denied) pada tabel invoice_items. Jalankan script SQL GRANT di Supabase.' }
    }
    return { error: 'Gagal menyimpan rincian barang invoice.' }
  }

  revalidatePath('/invoices')
  return { success: true, invoiceId: invoiceRecord.id }
}

/**
 * Server Action: Edit / Perbarui Data Invoice yang Sudah Ada (Beserta Audit Trail)
 */
export async function updateInvoiceAction(
  invoiceId: string,
  payload: UpdateInvoicePayload
): Promise<CreateInvoiceResult> {
  const validated = updateInvoiceSchema.safeParse(payload)
  if (!validated.success) {
    return {
      error: validated.error.issues[0]?.message || 'Data faktur tidak valid',
    }
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesi login telah berakhir. Silakan masuk kembali.' }
  }

  // 1. Verifikasi kepemilikan invoice
  const { data: existingInvoice, error: fetchError } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, notes, created_at')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existingInvoice) {
    return { error: 'Invoice tidak ditemukan atau Anda tidak memiliki akses.' }
  }

  const {
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    issueDate,
    dueDate,
    discountAmount,
    taxRate,
    notes,
    status,
    items,
    revisionNote,
  } = validated.data

  // 2. Hitung ulang total finansial di server
  const itemInputs = items.map((it) => ({
    qty: it.qty,
    unit_price: it.unitPrice,
  }))
  const totals = calcInvoiceTotals(itemInputs, discountAmount || 0, taxRate || 0)

  // 3. Catat audit trail riwayat perubahan pada notes jika ada catatan revisi
  let updatedNotes = notes?.trim() || null
  const now = new Date()
  const timestampStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(now)

  const revisionLog = revisionNote?.trim()
    ? `\n[Riwayat Revisi ${timestampStr}]: ${revisionNote.trim()}`
    : `\n[Riwayat Revisi ${timestampStr}]: Data tagihan diperbarui.`

  if (updatedNotes) {
    updatedNotes = `${updatedNotes}${revisionLog}`
  } else {
    updatedNotes = revisionLog.trim()
  }

  // 4. Update Header Invoice
  const { error: updateError } = await supabase
    .from('invoices')
    .update({
      customer_name: customerName,
      customer_phone: customerPhone || null,
      customer_email: customerEmail || null,
      customer_address: customerAddress || null,
      issue_date: issueDate,
      due_date: dueDate || null,
      subtotal: totals.subtotal,
      discount_amount: totals.discount_amount,
      tax_rate: totals.tax_rate,
      tax_amount: totals.tax_amount,
      grand_total: totals.grand_total,
      notes: updatedNotes,
      status: status || existingInvoice.status,
      updated_at: now.toISOString(),
    })
    .eq('id', invoiceId)
    .eq('user_id', user.id)

  if (updateError) {
    console.error('Update invoice error:', updateError)
    return { error: updateError.message || 'Gagal memperbarui invoice.' }
  }

  // 5. Update Items: Hapus item lama lalu masukkan item baru yang sudah diperbarui
  await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId)

  const itemRows = items.map((it, idx) => ({
    invoice_id: invoiceId,
    product_id: it.productId || null,
    item_name: it.itemName,
    unit: it.unit || 'pcs',
    qty: it.qty,
    unit_price: it.unitPrice,
    sort_order: it.sortOrder ?? idx + 1,
  }))

  const { error: insertItemsError } = await supabase.from('invoice_items').insert(itemRows)
  if (insertItemsError) {
    console.error('Update invoice_items error:', insertItemsError)
    return { error: 'Gagal memperbarui rincian barang invoice.' }
  }

  revalidatePath('/invoices')
  revalidatePath(`/invoices/${invoiceId}`)
  revalidatePath(`/invoices/${invoiceId}/print`)
  revalidatePath(`/invoices/${invoiceId}/thermal`)
  return { success: true, invoiceId }
}

/**
 * Server Action: Ubah Status Invoice Cepat (misal Lunas / Batalkan)
 */
export async function updateInvoiceStatusAction(
  id: string,
  newStatus: InvoiceStatus
) {
  const statusValidation = z.enum(['draft', 'issued', 'paid', 'cancelled']).safeParse(newStatus)
  if (!statusValidation.success) {
    return { error: 'Status invoice tidak valid' }
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('invoices')
    .update({ status: newStatus })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/invoices')
  revalidatePath(`/invoices/${id}`)
  return { success: true }
}

/**
 * Server Action: Hapus Invoice
 */
export async function deleteInvoiceAction(id: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/invoices')
  return { success: true }
}

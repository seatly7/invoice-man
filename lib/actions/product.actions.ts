'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { productSchema } from '@/lib/schemas/product.schema'

export interface ProductActionResult {
  success?: boolean
  error?: string
}

/**
 * Server Action: Tambah atau Ubah Produk
 */
export async function upsertProductAction(
  prevState: ProductActionResult | null,
  formData: FormData
): Promise<ProductActionResult> {
  const id = formData.get('id') as string | null
  const rawData = {
    id: id || undefined,
    sku: formData.get('sku') as string,
    name: formData.get('name') as string,
    unit: formData.get('unit') as string,
    price: Number(formData.get('price')),
    description: (formData.get('description') as string) || null,
    isActive: formData.get('isActive') !== 'false',
  }

  const validated = productSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      error: validated.error.issues[0]?.message || 'Data produk tidak valid',
    }
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesi login telah berakhir. Silakan masuk kembali.' }
  }

  const payload = {
    user_id: user.id,
    sku: validated.data.sku,
    name: validated.data.name,
    unit: validated.data.unit,
    price: validated.data.price,
    description: validated.data.description || null,
    is_active: validated.data.isActive,
  }

  if (id) {
    // Mode Update
    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      if (error.code === '23505') {
        return { error: `Kode SKU "${validated.data.sku}" sudah digunakan oleh barang lain.` }
      }
      if (error.code === '42501') {
        return {
          error: 'Izin database ditolak (permission denied). Silakan jalankan script SQL GRANT di Supabase SQL Editor.',
        }
      }
      return { error: error.message || 'Gagal memperbarui barang.' }
    }
  } else {
    // Mode Insert Baru
    const { error } = await supabase
      .from('products')
      .insert(payload)

    if (error) {
      if (error.code === '23505') {
        return { error: `Kode SKU "${validated.data.sku}" sudah ada di master barang Anda.` }
      }
      if (error.code === '42501') {
        return {
          error: 'Izin database ditolak (permission denied). Silakan jalankan script SQL GRANT di Supabase SQL Editor.',
        }
      }
      return { error: error.message || 'Gagal menyimpan barang baru.' }
    }
  }

  revalidatePath('/products')
  revalidatePath('/invoices/new')
  return { success: true }
}

/**
 * Server Action: Toggle Status Aktif (Soft Delete / Arsip)
 */
export async function toggleProductStatusAction(
  id: string,
  currentStatus: boolean
): Promise<ProductActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesi login telah berakhir.' }
  }

  const { error } = await supabase
    .from('products')
    .update({ is_active: !currentStatus })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    if (error.code === '42501') {
      return { error: 'Izin database ditolak (permission denied). Jalankan skrip GRANT di Supabase.' }
    }
    return { error: error.message || 'Gagal mengubah status barang.' }
  }

  revalidatePath('/products')
  return { success: true }
}

/**
 * Server Action: Hapus Barang Permanen (Hard Delete)
 */
export async function deleteProductAction(id: string): Promise<ProductActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesi login telah berakhir.' }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    if (error.code === '42501') {
      return { error: 'Izin database ditolak (permission denied). Jalankan skrip GRANT di Supabase.' }
    }
    return { error: error.message || 'Gagal menghapus barang.' }
  }

  revalidatePath('/products')
  return { success: true }
}

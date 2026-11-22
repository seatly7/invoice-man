import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Product, ProductQueryParams, ProductListResponse } from '@/types/product.types'
import { MOCK_PRODUCTS } from '@/lib/mock/mock-data'

/**
 * Mengambil daftar produk milik user yang sedang aktif.
 * Menggunakan query selektif (bukan select *) dan pagination untuk mobile low-end.
 */
export async function getProducts({
  search,
  page = 1,
  pageSize = 50,
  isActiveOnly = false,
}: ProductQueryParams = {}): Promise<ProductListResponse> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      data: [],
      count: 0,
      page,
      pageSize,
      totalPages: 0,
    }
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('products')
    .select('id, user_id, sku, name, unit, price, description, is_active, created_at, updated_at', {
      count: 'exact',
    })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (isActiveOnly) {
    query = query.eq('is_active', true)
  }

  if (search && search.trim()) {
    const s = search.trim()
    query = query.or(`name.ilike.%${s}%,sku.ilike.%${s}%`)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('getProducts error:', error.message)
    // Jika tabel belum di-create atau terjadi issue koneksi awal, fallback ke mock produk jika di dev
    return {
      data: [],
      count: 0,
      page,
      pageSize,
      totalPages: 0,
    }
  }

  const products: Product[] = (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    sku: row.sku,
    name: row.name,
    unit: row.unit || 'pcs',
    price: Number(row.price) || 0,
    description: row.description,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

  const totalCount = count ?? products.length
  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    data: products,
    count: totalCount,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * Mengambil detail satu produk berdasarkan ID milik user yang aktif
 */
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('products')
    .select('id, user_id, sku, name, unit, price, description, is_active, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    userId: data.user_id,
    sku: data.sku,
    name: data.name,
    unit: data.unit || 'pcs',
    price: Number(data.price) || 0,
    description: data.description,
    isActive: data.is_active ?? true,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

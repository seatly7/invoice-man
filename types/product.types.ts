import { Database } from './database.types'

export type ProductRow = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

/**
 * Entitas Produk Master dalam aplikasi
 */
export interface Product {
  id: string
  userId: string
  sku: string
  name: string
  unit: string
  price: number
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Nilai Form Tambah/Ubah Produk
 */
export interface ProductFormValues {
  id?: string
  sku: string
  name: string
  unit: string
  price: number
  description?: string
  isActive?: boolean
}

/**
 * Parameter filter dan paginasi daftar produk
 */
export interface ProductQueryParams {
  search?: string
  page?: number
  pageSize?: number
  isActiveOnly?: boolean
}

/**
 * Respon paginasi daftar produk
 */
export interface ProductListResponse {
  data: Product[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

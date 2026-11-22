import { z } from 'zod'

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z
    .string()
    .min(1, 'Kode SKU wajib diisi')
    .max(50, 'Kode SKU maksimal 50 karakter')
    .trim(),
  name: z
    .string()
    .min(1, 'Nama barang wajib diisi')
    .max(255, 'Nama barang maksimal 255 karakter')
    .trim(),
  unit: z
    .string()
    .min(1, 'Satuan barang wajib diisi')
    .max(20, 'Satuan maksimal 20 karakter')
    .default('pcs'),
  price: z
    .number({ message: 'Harga harus berupa angka' })
    .min(0, 'Harga tidak boleh negatif'),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional().nullable(),
  isActive: z.boolean().default(true),
})

export type ProductSchemaInput = z.infer<typeof productSchema>

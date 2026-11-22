import { z } from 'zod'

export const invoiceItemSchema = z.object({
  productId: z.string().uuid().optional().nullable(),
  itemName: z.string().min(1, 'Nama barang wajib diisi').trim(),
  unit: z.string().min(1, 'Satuan wajib diisi').default('pcs'),
  qty: z
    .number({ message: 'Jumlah harus angka' })
    .gt(0, 'Jumlah (Qty) harus lebih dari 0'),
  unitPrice: z
    .number({ message: 'Harga harus angka' })
    .min(0, 'Harga satuan tidak boleh negatif'),
  sortOrder: z.number().int().default(0),
})

export const createInvoiceSchema = z.object({
  customerName: z
    .string()
    .min(1, 'Nama pelanggan wajib diisi')
    .max(200, 'Nama pelanggan maksimal 200 karakter')
    .trim(),
  customerPhone: z
    .string()
    .max(30, 'Nomor telepon maksimal 30 karakter')
    .optional()
    .nullable(),
  customerEmail: z
    .string()
    .email('Format email tidak valid')
    .optional()
    .nullable()
    .or(z.literal('')),
  customerAddress: z
    .string()
    .max(500, 'Alamat maksimal 500 karakter')
    .optional()
    .nullable(),
  issueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal terbit harus YYYY-MM-DD'),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal jatuh tempo harus YYYY-MM-DD')
    .optional()
    .nullable()
    .or(z.literal('')),
  discountAmount: z
    .number()
    .min(0, 'Diskon tidak boleh negatif')
    .default(0),
  taxRate: z
    .number()
    .min(0, 'Tarif pajak tidak boleh negatif')
    .max(100, 'Tarif pajak maksimal 100%')
    .default(0),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().nullable(),
  status: z.enum(['draft', 'issued', 'paid', 'cancelled']).default('draft'),
  items: z
    .array(invoiceItemSchema)
    .min(1, 'Minimal harus ada 1 barang dalam invoice'),
})

export type InvoiceItemSchemaInput = z.infer<typeof invoiceItemSchema>
export type CreateInvoiceSchemaInput = z.infer<typeof createInvoiceSchema>

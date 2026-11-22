import { z } from 'zod'

export const invoiceSettingsSchema = z.object({
  businessName: z
    .string()
    .min(1, 'Nama usaha wajib diisi')
    .max(200, 'Nama usaha maksimal 200 karakter')
    .trim(),
  businessAddress: z.string().max(500, 'Alamat maksimal 500 karakter').optional().nullable(),
  businessPhone: z.string().max(30, 'Nomor telepon maksimal 30 karakter').optional().nullable(),
  businessEmail: z
    .string()
    .email('Format email tidak valid')
    .optional()
    .nullable()
    .or(z.literal('')),
  taxId: z.string().max(50, 'NPWP maksimal 50 karakter').optional().nullable(),
  invoicePrefix: z
    .string()
    .min(1, 'Awalan nomor invoice wajib diisi')
    .max(10, 'Awalan nomor invoice maksimal 10 karakter')
    .regex(/^[A-Za-z0-9-_]+$/, 'Awalan invoice hanya boleh huruf, angka, tanda strip atau garis bawah')
    .default('INV'),
  defaultTaxRate: z
    .number({ message: 'Tarif pajak harus angka' })
    .min(0, 'Tarif pajak tidak boleh negatif')
    .max(100, 'Tarif pajak maksimal 100%')
    .default(0),
  footerNote: z.string().max(1000, 'Catatan kaki maksimal 1000 karakter').optional().nullable(),
})

export type InvoiceSettingsSchemaInput = z.infer<typeof invoiceSettingsSchema>

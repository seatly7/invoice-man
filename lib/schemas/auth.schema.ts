import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Kata sandi wajib diisi')
    .min(6, 'Kata sandi minimal 6 karakter'),
})

export const registerSchema = z
  .object({
    businessName: z
      .string()
      .min(1, 'Nama usaha / bisnis wajib diisi')
      .min(2, 'Nama usaha minimal 2 karakter')
      .max(100, 'Nama usaha maksimal 100 karakter')
      .trim(),
    email: z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid')
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(1, 'Kata sandi wajib diisi')
      .min(6, 'Kata sandi minimal 6 karakter'),
    confirmPassword: z
      .string()
      .min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak sesuai',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

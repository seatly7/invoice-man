'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema } from '@/lib/schemas/auth.schema'

export interface AuthActionState {
  error?: string
  success?: string
  fields?: {
    email?: string
    businessName?: string
  }
}

/**
 * Server Action: Masuk (Sign In)
 */
export async function signInAction(
  prevState: AuthActionState | null,
  formData: FormData
): Promise<AuthActionState> {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const validated = loginSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      error: validated.error.issues[0]?.message || 'Data login tidak valid',
      fields: { email: rawData.email },
    }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  })

  if (error) {
    console.error('Supabase signIn error:', error)
    let errorMessage = error.message
    const lower = error.message.toLowerCase()
    if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
      errorMessage = 'Email atau kata sandi yang Anda masukkan salah.'
    } else if (lower.includes('email not confirmed')) {
      errorMessage = 'Email Anda belum diverifikasi. Silakan periksa inbox email Anda.'
    } else if (lower.includes('rate limit')) {
      errorMessage = 'Terlalu banyak percobaan masuk. Harap tunggu beberapa saat.'
    }
    return {
      error: errorMessage,
      fields: { email: rawData.email },
    }
  }

  revalidatePath('/', 'layout')
  redirect('/invoices')
}

/**
 * Server Action: Daftar Akun Baru (Sign Up)
 */
export async function signUpAction(
  prevState: AuthActionState | null,
  formData: FormData
): Promise<AuthActionState> {
  const rawData = {
    businessName: formData.get('businessName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const validated = registerSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      error: validated.error.issues[0]?.message || 'Data pendaftaran tidak valid',
      fields: {
        email: rawData.email,
        businessName: rawData.businessName,
      },
    }
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        business_name: validated.data.businessName,
      },
    },
  })

  if (error) {
    console.error('Supabase signUp error:', error)
    let errorMessage = error.message
    const lower = error.message.toLowerCase()
    if (lower.includes('already registered') || lower.includes('user already exists')) {
      errorMessage = 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.'
    } else if (lower.includes('password should be')) {
      errorMessage = 'Kata sandi terlalu pendek. Minimal 6 karakter.'
    } else if (lower.includes('rate limit')) {
      errorMessage = 'Terlalu banyak percobaan pendaftaran. Harap tunggu beberapa saat.'
    } else if (lower.includes('signups not allowed') || lower.includes('signup is disabled')) {
      errorMessage = 'Pendaftaran akun baru sedang dinonaktifkan di Supabase (Auth > Providers > Email).'
    }
    return {
      error: errorMessage,
      fields: {
        email: rawData.email,
        businessName: rawData.businessName,
      },
    }
  }

  // Jika akun berhasil dibuat dan ada sesi aktif (email auto-confirm)
  if (data.user) {
    // Inisialisasi baris setting invoice default untuk user baru
    try {
      const { createSupabaseAdminClient } = await import('@/lib/supabase/admin')
      const adminClient = createSupabaseAdminClient()
      await adminClient.from('invoice_settings').upsert({
        user_id: data.user.id,
        business_name: validated.data.businessName,
        invoice_prefix: 'INV',
        last_invoice_number: 0,
        default_tax_rate: 11,
      }, { onConflict: 'user_id' })
    } catch (e: any) {
      const { error: settingsError } = await supabase
        .from('invoice_settings')
        .upsert({
          user_id: data.user.id,
          business_name: validated.data.businessName,
          invoice_prefix: 'INV',
          last_invoice_number: 0,
          default_tax_rate: 11,
        }, { onConflict: 'user_id' })

      if (settingsError) {
        console.error('Inisialisasi invoice_settings:', settingsError.message)
      }
    }

    // Jika Supabase membutuhkan konfirmasi email (data.session null)
    if (!data.session) {
      return {
        success: 'Akun berhasil dibuat! Silakan periksa inbox email Anda untuk memverifikasi akun sebelum masuk.',
        fields: {
          email: validated.data.email,
          businessName: validated.data.businessName,
        },
      }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/invoices')
}

/**
 * Server Action: Keluar (Sign Out)
 */
export async function signOutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

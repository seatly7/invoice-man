'use client'

import * as React from 'react'
import Link from 'next/link'
import { useActionState } from 'react'
import { signUpAction, type AuthActionState } from '@/lib/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthActionState | null, FormData>(
    signUpAction,
    null
  )
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-center">
          Daftar Akun Baru
        </CardTitle>
        <CardDescription className="text-center text-sm">
          Mulai cetak invoice profesional dan struk thermal dalam hitungan menit
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        <CardContent className="space-y-4">
          {/* Alert Success (jika verifikasi email diperlukan) */}
          {state?.success && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-sm">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{state.success}</span>
            </div>
          )}

          {/* Alert Error */}
          {state?.error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Nama Usaha */}
          <div className="space-y-1.5">
            <Label htmlFor="businessName" className="text-sm font-medium">
              Nama Usaha / Toko / Bisnis
            </Label>
            <Input
              id="businessName"
              name="businessName"
              type="text"
              placeholder="Contoh: Toko Berkah Mandiri"
              required
              defaultValue={state?.fields?.businessName || ''}
              className="h-11 text-base placeholder:text-zinc-400"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Alamat Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@bisnis.com"
              required
              autoComplete="email"
              defaultValue={state?.fields?.email || ''}
              className="h-11 text-base placeholder:text-zinc-400"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">
              Kata Sandi
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                required
                autoComplete="new-password"
                className="h-11 text-base pr-11 placeholder:text-zinc-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Konfirmasi Kata Sandi
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ulangi kata sandi"
              required
              autoComplete="new-password"
              className="h-11 text-base placeholder:text-zinc-400"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 font-medium text-base bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow transition-transform active:scale-[0.98]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mendaftarkan...
              </>
            ) : (
              'Daftar Akun'
            )}
          </Button>

          {/* Login Link */}
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Sudah memiliki akun?{' '}
            <Link
              href="/login"
              className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4"
            >
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

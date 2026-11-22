'use client'

import * as React from 'react'
import Link from 'next/link'
import { useActionState } from 'react'
import { signInAction, type AuthActionState } from '@/lib/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthActionState | null, FormData>(
    signInAction,
    null
  )
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-center">
          Selamat Datang
        </CardTitle>
        <CardDescription className="text-center text-sm">
          Masuk untuk mengelola produk dan tagihan invoice Anda
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        <CardContent className="space-y-4">
          {/* Alert Error */}
          {state?.error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Kata Sandi
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi"
                required
                autoComplete="current-password"
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
                Memproses...
              </>
            ) : (
              'Masuk ke Akun'
            )}
          </Button>

          {/* Register Link */}
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Belum memiliki akun?{' '}
            <Link
              href="/register"
              className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4"
            >
              Daftar sekarang
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

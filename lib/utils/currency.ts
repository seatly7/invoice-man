/**
 * Format angka ke format mata uang Rupiah (IDR).
 * Contoh: 150000 -> "Rp 150.000"
 */
export function formatRupiah(amount: number, withPrefix: boolean = true): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(amount)

  return withPrefix ? `Rp ${formatted}` : formatted
}

/**
 * Parse string Rupiah ke number murni.
 * Contoh: "150.000" -> 150000
 */
export function parseRupiah(input: string): number {
  const clean = input.replace(/[^0-9]/g, '')
  return clean ? parseInt(clean, 10) : 0
}

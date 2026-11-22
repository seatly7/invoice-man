/**
 * Format angka ke format mata uang Rupiah (IDR).
 * Contoh: 150000 -> "Rp 150.000"
 */
export function formatRupiah(amount: number, withPrefix: boolean = true): string {
  const safeAmount = Number(amount) || 0
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(safeAmount)

  return withPrefix ? `Rp ${formatted}` : formatted
}

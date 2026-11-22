/**
 * Format tanggal ke format lokal Indonesia.
 * Contoh: "2026-11-22" -> "22 Nov 2026"
 */
export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return '-'
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString

  if (isNaN(date.getTime())) return '-'

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }

  return new Intl.DateTimeFormat('id-ID', defaultOptions).format(date)
}

/**
 * Format tanggal ke format input HTML date (YYYY-MM-DD).
 */
export function toDateInputValue(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

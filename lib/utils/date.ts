/**
 * Format tanggal ke format lokal Indonesia tanpa pergeseran zona waktu.
 * Contoh: "2026-11-22" -> "22 Nov 2026"
 */
export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return '-'

  // Date-only string (YYYY-MM-DD): parse eksplisit sebagai UTC agar tidak geser 1 hari di server/klien
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
    const [year, month, day] = dateString.trim().split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
      ...options,
    }).format(date)
  }

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
 * Format tanggal dan waktu ke format lokal Indonesia (contoh: "23 Nov 2026, 11:30")
 * Berguna untuk audit trail riwayat perubahan invoice.
 */
export function formatDateTime(dateString: string | Date): string {
  if (!dateString) return '-'
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(date)
}

/**
 * Format tanggal ke format slash DD/MM/YYYY (contoh: "23/11/2026")
 * Khusus digunakan untuk dokumen resmi seperti Surat Jalan.
 */
export function formatDateSlash(dateString: string | Date): string {
  if (!dateString) return '-'
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
    const [year, month, day] = dateString.trim().split('-')
    return `${day}/${month}/${year}`
  }
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(date.getTime())) return '-'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
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

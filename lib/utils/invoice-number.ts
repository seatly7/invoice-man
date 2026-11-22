/**
 * Format nomor invoice berdasarkan prefix dan urutan counter.
 * Contoh: generateInvoiceNumber('INV', 1) -> "INV-0001"
 */
export function generateInvoiceNumber(prefix: string = 'INV', sequenceNumber: number, padLength: number = 4): string {
  const cleanPrefix = (prefix || 'INV').trim().toUpperCase()
  const padded = String(Math.max(0, sequenceNumber)).padStart(padLength, '0')
  return `${cleanPrefix}-${padded}`
}

export type InvoiceItemCalcInput = {
  qty: number
  unit_price: number
}

export type InvoiceTotals = {
  subtotal: number
  discount_amount: number
  tax_rate: number
  tax_amount: number
  grand_total: number
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Kalkulasi total invoice secara instan di sisi klien.
 * Mencegah ketidaksinkronan angka antara form preview dan database.
 */
export function calcInvoiceTotals(
  items: InvoiceItemCalcInput[],
  discountAmount: number = 0,
  taxRate: number = 0 // dalam persen, misal: 11 untuk 11%
): InvoiceTotals {
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.qty) || 0
    const price = Number(item.unit_price) || 0
    return sum + qty * price
  }, 0)

  const safeDiscount = Math.min(Math.max(0, Number(discountAmount) || 0), subtotal)
  const taxable = Math.max(0, subtotal - safeDiscount)
  const safeTaxRate = Math.max(0, Number(taxRate) || 0)
  const taxAmount = taxable * (safeTaxRate / 100)
  const grandTotal = taxable + taxAmount

  return {
    subtotal: round2(subtotal),
    discount_amount: round2(safeDiscount),
    tax_rate: round2(safeTaxRate),
    tax_amount: round2(taxAmount),
    grand_total: round2(grandTotal),
  }
}

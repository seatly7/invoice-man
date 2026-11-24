import { describe, it } from 'node:test'
import assert from 'node:assert'
import { calcInvoiceTotals } from '../lib/utils/invoice-calc.ts'
import { generateInvoiceNumber } from '../lib/utils/invoice-number.ts'

describe('calcInvoiceTotals', () => {
  it('correctly calculates subtotal with decimal qty (e.g. 0.5)', () => {
    const items = [
      { qty: 0.5, unit_price: 50000 },
      { qty: 1.5, unit_price: 20000 },
    ]
    const result = calcInvoiceTotals(items, 5000, 11)

    assert.strictEqual(result.subtotal, 55000)
    assert.strictEqual(result.discount_amount, 5000)
    assert.strictEqual(result.tax_amount, 5500)
    assert.strictEqual(result.grand_total, 55500)
  })

  it('correctly calculates subtotal, 11% tax, and grand total', () => {
    const items = [
      { qty: 2, unit_price: 50000 },
      { qty: 1, unit_price: 25000 },
    ]
    const discount = 5000
    const taxRate = 11

    const result = calcInvoiceTotals(items, discount, taxRate)

    assert.strictEqual(result.subtotal, 125000)
    assert.strictEqual(result.discount_amount, 5000)
    assert.strictEqual(result.tax_amount, 13200)
    assert.strictEqual(result.grand_total, 133200)
  })

  it('handles zero discount and zero tax rate', () => {
    const items = [{ qty: 3, unit_price: 10000 }]
    const result = calcInvoiceTotals(items, 0, 0)

    assert.strictEqual(result.subtotal, 30000)
    assert.strictEqual(result.discount_amount, 0)
    assert.strictEqual(result.tax_amount, 0)
    assert.strictEqual(result.grand_total, 30000)
  })

  it('handles empty items array gracefully without crashing', () => {
    const result = calcInvoiceTotals([], 1000, 11)

    assert.strictEqual(result.subtotal, 0)
    assert.strictEqual(result.grand_total, 0)
  })

  it('does not allow negative grand totals when discount exceeds subtotal', () => {
    const items = [{ qty: 1, unit_price: 10000 }]
    const result = calcInvoiceTotals(items, 50000, 11)

    assert.strictEqual(result.subtotal, 10000)
    assert.strictEqual(result.discount_amount, 10000)
    assert.strictEqual(result.tax_amount, 0)
    assert.strictEqual(result.grand_total, 0)
  })
})

describe('generateInvoiceNumber', () => {
  it('formats invoice number with padding', () => {
    assert.strictEqual(generateInvoiceNumber('INV', 1), 'INV-0001')
    assert.strictEqual(generateInvoiceNumber('INV', 99), 'INV-0099')
    assert.strictEqual(generateInvoiceNumber('PO', 1000), 'PO-1000')
    assert.strictEqual(generateInvoiceNumber('FAKTUR', 12345), 'FAKTUR-12345')
  })
})

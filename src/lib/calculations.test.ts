import { describe, expect, it } from 'vitest'
import { componentCost, distanceKm, productCost, summarize, unitPrice } from './calculations'
import type { Category, SupplierProduct } from './types'

const object: Category = { id: 'o', name: 'Objetos', kind: 'object', unitsPerSheet: 1 }
const sheet: Category = { id: 'h', name: 'Hojas', kind: 'sheet', unitsPerSheet: 20 }
const mk = (id: string, price: number, qty: number, categoryId: string): SupplierProduct => ({
  id, supplierId: 's', name: id, type: '', price, packageQty: qty, categoryId, sourceUrl: '',
})

describe('calculations', () => {
  it('computes unit price', () => {
    expect(unitPrice(3500, 50)).toBe(70)
    expect(unitPrice(10, 0)).toBe(0)
  })
  it('sticker costs 3.5', () => {
    expect(componentCost(mk('p', 3500, 50, 'h'), sheet, 1)).toBe(3.5)
  })
  it('taza + dtf with 150% margin', () => {
    const products = [mk('taza', 1000, 1, 'o'), mk('dtf', 2000, 1, 'o')]
    const cost = productCost(
      [{ supplierProductId: 'taza', quantity: 1 }, { supplierProductId: 'dtf', quantity: 1 }],
      products,
      [object, sheet],
    )
    expect(summarize(cost, 150)).toEqual({ cost: 3000, profit: 4500, price: 7500 })
  })
  it('only taza', () => {
    expect(summarize(1000, 150)).toEqual({ cost: 1000, profit: 1500, price: 2500 })
  })
  it('distance', () => {
    expect(distanceKm(0, 0, 0, 0)).toBe(0)
    expect(distanceKm(0, 0, 0, 1)).toBeCloseTo(111.19, 1)
  })
})

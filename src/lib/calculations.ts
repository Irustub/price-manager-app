import type { Category, Component, SupplierProduct } from './types'

export function unitPrice(price: number, packageQty: number): number {
  return packageQty > 0 ? price / packageQty : 0
}

/** Cost of using `quantity` of a supplier product, applying the category divisor for sheets. */
export function componentCost(
  product: Pick<SupplierProduct, 'price' | 'packageQty'>,
  category: Pick<Category, 'kind' | 'unitsPerSheet'> | undefined,
  quantity: number,
): number {
  const unit = unitPrice(product.price, product.packageQty)
  if (category?.kind === 'sheet') {
    return category.unitsPerSheet > 0 ? (unit / category.unitsPerSheet) * quantity : 0
  }
  return unit * quantity
}

export interface PriceSummary {
  cost: number
  profit: number
  price: number
}

/** profit = cost * margin%, price = cost + profit */
export function summarize(cost: number, marginPercent: number): PriceSummary {
  const profit = cost * (marginPercent / 100)
  return { cost, profit, price: cost + profit }
}

export function productCost(
  components: Component[],
  products: SupplierProduct[],
  categories: Category[],
): number {
  return components.reduce((sum, c) => {
    const p = products.find((x) => x.id === c.supplierProductId)
    if (!p) return sum
    const cat = categories.find((x) => x.id === p.categoryId)
    return sum + componentCost(p, cat, c.quantity)
  }, 0)
}

/** Haversine distance in kilometres. */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(bLat - aLat)
  const dLng = rad(bLng - aLng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

export const money = (n: number) =>
  n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 2 })

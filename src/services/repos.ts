import { createRepository } from './repository'
import type { Category, MyProduct, PriceRecord, Supplier, SupplierProduct } from '../lib/types'

export const suppliersRepo = createRepository<Supplier>('suppliers')
export const productsRepo = createRepository<SupplierProduct>('supplierProducts')
export const categoriesRepo = createRepository<Category>('categories')
export const historyRepo = createRepository<PriceRecord>('priceHistory')
export const myProductsRepo = createRepository<MyProduct>('myProducts')

/** Manual price update: stores the new price and appends a history record. */
export async function updatePrice(product: SupplierProduct, price: number) {
  await productsRepo.update({ ...product, price })
  await historyRepo.add({ productId: product.id, price, date: new Date().toISOString() })
}

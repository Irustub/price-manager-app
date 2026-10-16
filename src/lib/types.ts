export interface Entity { id: string }

export interface Supplier extends Entity {
  name: string
  lat: number
  lng: number
}

export type CategoryKind = 'sheet' | 'object'

export interface Category extends Entity {
  name: string
  kind: CategoryKind
  /** Units (stickers, labels...) that fit in one sheet. Only for kind 'sheet'. */
  unitsPerSheet: number
}

export interface SupplierProduct extends Entity {
  supplierId: string
  name: string
  type: string
  price: number
  packageQty: number
  categoryId: string
  sourceUrl: string
}

export interface PriceRecord extends Entity {
  productId: string
  price: number
  date: string
}

export interface Component {
  supplierProductId: string
  /** Units of the final item (e.g. stickers) for sheets, or whole objects. */
  quantity: number
}

export interface MyProduct extends Entity {
  name: string
  marginPercent: number
  components: Component[]
}

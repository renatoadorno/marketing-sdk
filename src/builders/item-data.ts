import type { UnifiedItem } from '../types/unified-events'

export class ItemData {
  private data: Partial<UnifiedItem> = {}

  setId(id: string): this {
    this.data.id = id
    return this
  }

  setName(name: string): this {
    this.data.name = name
    return this
  }

  setPrice(price: number): this {
    this.data.price = price
    return this
  }

  setQuantity(quantity: number): this {
    this.data.quantity = quantity
    return this
  }

  setCategory(category: string): this {
    this.data.category = category
    return this
  }

  setBrand(brand: string): this {
    this.data.brand = brand
    return this
  }

  setVariant(variant: string): this {
    this.data.variant = variant
    return this
  }

  setCoupon(coupon: string): this {
    this.data.coupon = coupon
    return this
  }

  setDiscount(discount: number): this {
    this.data.discount = discount
    return this
  }

  setIndex(index: number): this {
    this.data.index = index
    return this
  }

  setListId(listId: string): this {
    this.data.listId = listId
    return this
  }

  setListName(listName: string): this {
    this.data.listName = listName
    return this
  }

  toUnifiedItem(): UnifiedItem {
    return {
      id: this.data.id ?? '',
      name: this.data.name ?? '',
      ...this.data,
    } as UnifiedItem
  }
}

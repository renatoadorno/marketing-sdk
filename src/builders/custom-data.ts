import type { UnifiedItem } from '../types/unified-events'
import { ItemData } from './item-data'

export interface CustomDataFields {
  currency?: string
  value?: number
  contentName?: string
  orderId?: string
  transactionId?: string
  tax?: number
  shipping?: number
  coupon?: string
  discountCode?: string
  isNewCustomer?: boolean
  type?: string
  category?: string
  method?: string
  items: UnifiedItem[]
}

export class CustomData {
  private data: CustomDataFields = { items: [] }

  setCurrency(currency: string): this {
    this.data.currency = currency
    return this
  }

  setValue(value: number): this {
    this.data.value = value
    return this
  }

  setContentName(contentName: string): this {
    this.data.contentName = contentName
    return this
  }

  setOrderId(orderId: string): this {
    this.data.orderId = orderId
    this.data.transactionId = orderId
    return this
  }

  setTransactionId(transactionId: string): this {
    this.data.transactionId = transactionId
    this.data.orderId = transactionId
    return this
  }

  setTax(tax: number): this {
    this.data.tax = tax
    return this
  }

  setShipping(shipping: number): this {
    this.data.shipping = shipping
    return this
  }

  setCoupon(coupon: string): this {
    this.data.coupon = coupon
    return this
  }

  setDiscountCode(discountCode: string): this {
    this.data.discountCode = discountCode
    return this
  }

  setIsNewCustomer(isNew: boolean): this {
    this.data.isNewCustomer = isNew
    return this
  }

  setType(type: string): this {
    this.data.type = type
    return this
  }

  setCategory(category: string): this {
    this.data.category = category
    return this
  }

  setMethod(method: string): this {
    this.data.method = method
    return this
  }

  addItem(item: ItemData): this {
    this.data.items.push(item.toUnifiedItem())
    return this
  }

  setItems(items: ItemData[]): this {
    this.data.items = items.map((i) => i.toUnifiedItem())
    return this
  }

  getData(): CustomDataFields {
    return { ...this.data, items: [...this.data.items] }
  }
}

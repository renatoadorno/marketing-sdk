import { test, expect } from 'bun:test'
import { ItemData } from '../../src/builders/item-data'

test('ItemData builds a UnifiedItem with all fields', () => {
  const item = new ItemData()
    .setId('SKU-001')
    .setName('Ingresso VIP')
    .setPrice(299.90)
    .setQuantity(2)
    .setCategory('Ingressos')
    .setBrand('Evento X')
    .setVariant('Pista')
    .setCoupon('PROMO10')
    .setDiscount(10)
    .toUnifiedItem()

  expect(item.id).toBe('SKU-001')
  expect(item.name).toBe('Ingresso VIP')
  expect(item.price).toBe(299.90)
  expect(item.quantity).toBe(2)
  expect(item.category).toBe('Ingressos')
  expect(item.brand).toBe('Evento X')
  expect(item.variant).toBe('Pista')
  expect(item.coupon).toBe('PROMO10')
  expect(item.discount).toBe(10)
})

test('ItemData defaults id and name to empty string if not set', () => {
  const item = new ItemData().setPrice(100).toUnifiedItem()
  expect(item.id).toBe('')
  expect(item.name).toBe('')
  expect(item.price).toBe(100)
})

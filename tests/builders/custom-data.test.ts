import { test, expect } from 'bun:test'
import { CustomData } from '../../src/builders/custom-data'
import { ItemData } from '../../src/builders/item-data'

test('CustomData builds purchase fields', () => {
  const item = new ItemData().setId('SKU-01').setName('Ingresso').setPrice(100).setQuantity(2)

  const data = new CustomData()
    .setCurrency('BRL')
    .setValue(200)
    .setOrderId('PED-123')
    .setTax(10)
    .setShipping(15)
    .setCoupon('PROMO')
    .setDiscountCode('DESC10')
    .setIsNewCustomer(true)
    .addItem(item)
    .getData()

  expect(data.currency).toBe('BRL')
  expect(data.value).toBe(200)
  expect(data.transactionId).toBe('PED-123')
  expect(data.orderId).toBe('PED-123')
  expect(data.tax).toBe(10)
  expect(data.shipping).toBe(15)
  expect(data.coupon).toBe('PROMO')
  expect(data.discountCode).toBe('DESC10')
  expect(data.isNewCustomer).toBe(true)
  expect(data.items).toHaveLength(1)
  expect(data.items[0]!.id).toBe('SKU-01')
})

test('CustomData addItem accumulates items', () => {
  const data = new CustomData()
    .addItem(new ItemData().setId('A').setName('A'))
    .addItem(new ItemData().setId('B').setName('B'))
    .getData()

  expect(data.items).toHaveLength(2)
})

test('CustomData setItems replaces all items', () => {
  const data = new CustomData()
    .addItem(new ItemData().setId('OLD').setName('Old'))
    .setItems([
      new ItemData().setId('NEW1').setName('New1'),
      new ItemData().setId('NEW2').setName('New2'),
    ])
    .getData()

  expect(data.items).toHaveLength(2)
  expect(data.items[0]!.id).toBe('NEW1')
})

test('CustomData builds lead fields', () => {
  const data = new CustomData()
    .setValue(50)
    .setType('newsletter')
    .setCategory('marketing')
    .getData()

  expect(data.value).toBe(50)
  expect(data.type).toBe('newsletter')
  expect(data.category).toBe('marketing')
})

test('CustomData builds sign_up fields', () => {
  const data = new CustomData().setMethod('google').getData()
  expect(data.method).toBe('google')
})

test('CustomData getData returns a copy', () => {
  const builder = new CustomData().setValue(100)
  const d1 = builder.getData()
  const d2 = builder.getData()
  expect(d1.items).not.toBe(d2.items)
})

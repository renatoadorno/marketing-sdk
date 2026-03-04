import { test, expect } from 'bun:test'
import { assembleEvent } from '../../src/core/event-assembler'
import { UserData } from '../../src/builders/user-data'
import { CustomData } from '../../src/builders/custom-data'
import { ItemData } from '../../src/builders/item-data'
import { sha256 } from '../../src/core/hash'

test('assembleEvent generates eventId and timestamp automatically', () => {
  const event = assembleEvent('page_view', {}, {})
  expect(event.context.eventId).toBeTruthy()
  expect(event.context.timestamp).toBeTruthy()
  expect(event.event).toBe('page_view')
})

test('assembleEvent uses custom eventId when provided', () => {
  const event = assembleEvent('page_view', { eventId: 'custom-id' }, {})
  expect(event.context.eventId).toBe('custom-id')
})

test('assembleEvent applies tracker defaults', () => {
  const event = assembleEvent('lead', {}, { sourceUrl: 'https://loja.com', actionSource: 'web' })
  expect(event.context.sourceUrl).toBe('https://loja.com')
  expect(event.context.actionSource).toBe('web')
})

test('assembleEvent track options override defaults', () => {
  const event = assembleEvent(
    'lead',
    { sourceUrl: 'https://loja.com/form' },
    { sourceUrl: 'https://loja.com' },
  )
  expect(event.context.sourceUrl).toBe('https://loja.com/form')
})

test('assembleEvent builds purchase event correctly', () => {
  const userData = new UserData().setEmail('joao@email.com')
  const customData = new CustomData()
    .setCurrency('BRL')
    .setValue(299)
    .setOrderId('PED-1')
    .setTax(10)
    .setShipping(15)
    .setIsNewCustomer(true)
    .addItem(new ItemData().setId('SKU-01').setName('Ingresso').setPrice(299).setQuantity(1))

  const event = assembleEvent('purchase', { userData, customData }, {})

  expect(event.event).toBe('purchase')
  if (event.event === 'purchase') {
    expect(event.transactionId).toBe('PED-1')
    expect(event.value).toBe(299)
    expect(event.tax).toBe(10)
    expect(event.shipping).toBe(15)
    expect(event.isNewCustomer).toBe(true)
    expect(event.items).toHaveLength(1)
    expect(event.items[0]!.id).toBe('SKU-01')
    expect(event.context.currency).toBe('BRL')
    expect(event.user?.email).toBe('joao@email.com')
  }
})

test('assembleEvent builds add_to_cart event correctly', () => {
  const customData = new CustomData()
    .setValue(50)
    .addItem(new ItemData().setId('SKU-02').setName('Camiseta'))

  const event = assembleEvent('add_to_cart', { customData }, {})

  expect(event.event).toBe('add_to_cart')
  if (event.event === 'add_to_cart') {
    expect(event.item.id).toBe('SKU-02')
    expect(event.value).toBe(50)
  }
})

test('assembleEvent builds begin_checkout event correctly', () => {
  const customData = new CustomData()
    .setValue(100)
    .setCoupon('SAVE10')
    .addItem(new ItemData().setId('A').setName('A'))
    .addItem(new ItemData().setId('B').setName('B'))

  const event = assembleEvent('begin_checkout', { customData }, {})

  if (event.event === 'begin_checkout') {
    expect(event.items).toHaveLength(2)
    expect(event.coupon).toBe('SAVE10')
  }
})

test('assembleEvent builds lead event correctly', () => {
  const customData = new CustomData().setValue(30).setType('form').setCategory('marketing')
  const event = assembleEvent('lead', { customData }, {})

  if (event.event === 'lead') {
    expect(event.value).toBe(30)
    expect(event.type).toBe('form')
    expect(event.category).toBe('marketing')
  }
})

test('assembleEvent builds sign_up event correctly', () => {
  const customData = new CustomData().setMethod('google')
  const event = assembleEvent('sign_up', { customData }, {})

  if (event.event === 'sign_up') {
    expect(event.method).toBe('google')
  }
})

test('assembleEvent truncates eventId longer than 64 chars via SHA-256', () => {
  const longId = 'a'.repeat(100)
  const event = assembleEvent('page_view', { eventId: longId }, {})
  expect(event.context.eventId).toBe(sha256(longId).slice(0, 64))
  expect(event.context.eventId.length).toBeLessThanOrEqual(64)
})

test('assembleEvent preserves short eventId as-is', () => {
  const shortId = 'purchase.123.456'
  const event = assembleEvent('page_view', { eventId: shortId }, {})
  expect(event.context.eventId).toBe(shortId)
})

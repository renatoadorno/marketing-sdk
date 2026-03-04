import { test, expect } from 'bun:test'
import { validateEvent } from '../../src/core/validator'
import type { UnifiedPurchase, UnifiedAddToCart } from '../../src/types/unified-events'

const baseContext = {
  eventId: 'test-id',
  timestamp: '2026-03-02T10:00:00Z',
  currency: 'BRL',
}

test('warns when user data is missing', () => {
  const event: UnifiedPurchase = {
    event: 'purchase',
    context: baseContext,
    transactionId: 'PED-1',
    value: 100,
    items: [{ id: 'A', name: 'A' }],
  }
  const warnings = validateEvent(event, false)
  expect(warnings.some((w) => w.message.includes('usuario'))).toBe(true)
})

test('warns when sourceUrl is missing for facebook', () => {
  const event: UnifiedPurchase = {
    event: 'purchase',
    context: { ...baseContext },
    user: { email: 'test@test.com' },
    transactionId: 'PED-1',
    value: 100,
    items: [{ id: 'A', name: 'A' }],
  }
  const warnings = validateEvent(event, false)
  expect(warnings.some((w) => w.destination === 'facebook' && w.field === 'sourceUrl')).toBe(true)
})

test('warns when gaClientId is missing and google destination exists', () => {
  const event: UnifiedPurchase = {
    event: 'purchase',
    context: { ...baseContext, sourceUrl: 'https://loja.com' },
    user: { email: 'test@test.com' },
    transactionId: 'PED-1',
    value: 100,
    items: [{ id: 'A', name: 'A' }],
  }
  const warnings = validateEvent(event, true)
  expect(warnings.some((w) => w.destination === 'google' && w.field === 'gaClientId')).toBe(true)
})

test('warns when purchase has no items', () => {
  const event: UnifiedPurchase = {
    event: 'purchase',
    context: { ...baseContext, sourceUrl: 'https://loja.com' },
    user: { email: 'test@test.com' },
    transactionId: 'PED-1',
    value: 100,
    items: [],
  }
  const warnings = validateEvent(event, false)
  expect(warnings.some((w) => w.field === 'items')).toBe(true)
})

test('warns when purchase has no transactionId', () => {
  const event: UnifiedPurchase = {
    event: 'purchase',
    context: { ...baseContext, sourceUrl: 'https://loja.com' },
    user: { email: 'test@test.com' },
    transactionId: '',
    value: 100,
    items: [{ id: 'A', name: 'A' }],
  }
  const warnings = validateEvent(event, false)
  expect(warnings.some((w) => w.field === 'transactionId')).toBe(true)
})

test('warns when add_to_cart has no item', () => {
  const event: UnifiedAddToCart = {
    event: 'add_to_cart',
    context: { ...baseContext, sourceUrl: 'https://loja.com' },
    user: { email: 'test@test.com' },
    item: { id: '', name: '' },
  }
  const warnings = validateEvent(event, false)
  expect(warnings.some((w) => w.field === 'item')).toBe(true)
})

test('no warnings when purchase is complete', () => {
  const event: UnifiedPurchase = {
    event: 'purchase',
    context: { ...baseContext, sourceUrl: 'https://loja.com' },
    user: { email: 'test@test.com', gaClientId: 'GA1.2.123' },
    transactionId: 'PED-1',
    value: 100,
    items: [{ id: 'A', name: 'A' }],
  }
  const warnings = validateEvent(event, true)
  expect(warnings).toHaveLength(0)
})

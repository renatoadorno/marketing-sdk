import { test, expect } from 'bun:test'
import { GoogleMapper } from '../../src/mappers/google-mapper'
import { sha256 } from '../../src/core/hash'
import type { UnifiedPurchase } from '../../src/types/unified-events'

const mapper = new GoogleMapper()

const baseContext = {
  eventId: 'evt-1',
  timestamp: '2026-03-02T10:00:00Z',
  sourceUrl: 'https://loja.com',
  actionSource: 'web' as const,
  currency: 'BRL',
}

// ─── Phone normalization ──────────────────────────────────────

test('phone: strips non-digits before hashing', () => {
  const user = mapper.mapUserData({ phone: '+55 (11) 99999-9999' })
  expect(user.sha256_phone_number).toBe(sha256('5511999999999'))
})

// ─── Email normalization ──────────────────────────────────────

test('email: lowercases and trims before hashing', () => {
  const user = mapper.mapUserData({ email: ' Joao@Email.COM ' })
  expect(user.sha256_email_address).toBe(sha256('joao@email.com'))
})

// ─── Address fields ───────────────────────────────────────────

test('firstName and lastName are hashed, city/state/zip are raw', () => {
  const user = mapper.mapUserData({
    firstName: 'Joao',
    lastName: 'Silva',
    city: 'Sao Paulo',
    state: 'SP',
    zipCode: '01310-100',
    country: 'BR',
  })

  const address = user.address as Record<string, string>
  expect(address.sha256_first_name).toBe(sha256('joao'))
  expect(address.sha256_last_name).toBe(sha256('silva'))
  expect(address.city).toBe('Sao Paulo')
  expect(address.region).toBe('SP')
  expect(address.postal_code).toBe('01310-100')
  expect(address.country).toBe('BR')
})

// ─── CAPI output structure ────────────────────────────────────

test('toCapiEvent produces correct MP body', () => {
  const event: UnifiedPurchase = {
    event: 'purchase',
    context: baseContext,
    user: {
      email: 'joao@email.com',
      gaClientId: 'GA1.2.123.456',
      externalId: '12345',
    },
    transactionId: 'PED-1',
    value: 299.90,
    items: [{ id: 'SKU-01', name: 'Ingresso VIP', price: 299.90, quantity: 1 }],
  }

  const body = mapper.toCapiEvent(event)

  expect(body.client_id).toBe('GA1.2.123.456')
  expect(body.user_id).toBe('12345')
  expect(body.events).toHaveLength(1)
  expect(body.events[0]!.name).toBe('purchase')
  expect(body.events[0]!.params.transaction_id).toBe('PED-1')
  expect(body.events[0]!.params.value).toBe(299.90)
  expect(body.events[0]!.params.currency).toBe('BRL')
  expect(body.user_data?.sha256_email_address).toBe(sha256('joao@email.com'))
})

test('toCapiEvent uses "unknown" when gaClientId is missing', () => {
  const event: UnifiedPurchase = {
    event: 'purchase',
    context: baseContext,
    user: { email: 'joao@email.com' },
    transactionId: 'PED-1',
    value: 100,
    items: [{ id: 'A', name: 'A' }],
  }

  const body = mapper.toCapiEvent(event)
  expect(body.client_id).toBe('unknown')
})

// ─── Pixel output ─────────────────────────────────────────────

test('toPixelEvent maps event name for purchase', () => {
  const event: UnifiedPurchase = {
    event: 'purchase',
    context: baseContext,
    transactionId: 'PED-1',
    value: 100,
    items: [{ id: 'A', name: 'A' }],
  }

  const pixel = mapper.toPixelEvent(event)
  expect(pixel.eventName).toBe('purchase')
  expect(pixel.params.transaction_id).toBe('PED-1')
})

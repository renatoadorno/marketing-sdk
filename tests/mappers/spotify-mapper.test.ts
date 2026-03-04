import { test, expect } from 'bun:test'
import { SpotifyMapper } from '../../src/mappers/spotify-mapper'
import { sha256 } from '../../src/core/hash'
import type { UnifiedPurchase, UnifiedLead } from '../../src/types/unified-events'

const mapper = new SpotifyMapper()

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
  expect(user.hashed_phone_number).toBe(sha256('5511999999999'))
})

// ─── Email normalization ──────────────────────────────────────

test('email: lowercases and trims, returns as array', () => {
  const user = mapper.mapUserData({ email: ' Joao@Email.COM ' })
  expect(user.hashed_emails).toEqual([sha256('joao@email.com')])
})

// ─── Passthrough fields ───────────────────────────────────────

test('ip passes through raw', () => {
  const user = mapper.mapUserData({ ip: '189.0.0.1' })
  expect(user.ip_address).toBe('189.0.0.1')
})

test('deviceId passes through raw', () => {
  const user = mapper.mapUserData({ deviceId: 'device-123' })
  expect(user.device_id).toBe('device-123')
})

// ─── CAPI output structure ────────────────────────────────────

test('toCapiEvent uses uppercase event names', () => {
  const event: UnifiedPurchase = {
    event: 'purchase',
    context: baseContext,
    user: { email: 'joao@email.com', ip: '1.2.3.4' },
    transactionId: 'PED-1',
    value: 299.90,
    items: [{ id: 'SKU-01', name: 'Ingresso', price: 299.90, quantity: 1 }],
  }

  const capi = mapper.toCapiEvent(event)

  expect(capi.event_name).toBe('PURCHASE')
  expect(capi.event_id).toBe('evt-1')
  expect(capi.action_source).toBe('WEB')
  expect(capi.user_data.hashed_emails).toEqual([sha256('joao@email.com')])
  expect(capi.user_data.ip_address).toBe('1.2.3.4')
  expect(capi.event_details?.amount).toBe(299.90)
  expect(capi.event_details?.currency).toBe('BRL')
})

test('toCapiEvent maps lead event correctly', () => {
  const event: UnifiedLead = {
    event: 'lead',
    context: baseContext,
    user: { email: 'lead@test.com' },
    value: 50,
  }

  const capi = mapper.toCapiEvent(event)
  expect(capi.event_name).toBe('LEAD')
  expect(capi.event_details?.amount).toBe(50)
})

// ─── Pixel output ─────────────────────────────────────────────

test('toPixelEvent maps purchase event name', () => {
  const event: UnifiedPurchase = {
    event: 'purchase',
    context: baseContext,
    transactionId: 'PED-1',
    value: 100,
    items: [{ id: 'A', name: 'A' }],
  }

  const pixel = mapper.toPixelEvent(event)
  expect(pixel.eventName).toBe('purchase')
  expect(pixel.params.event_id).toBe('evt-1')
  expect(pixel.params.value).toBe(100)
})

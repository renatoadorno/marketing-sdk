import { test, expect } from 'bun:test'
import { FacebookMapper } from '../../src/mappers/facebook-mapper'
import { sha256 } from '../../src/core/hash'
import type { UnifiedPurchase, UnifiedPageView } from '../../src/types/unified-events'

const mapper = new FacebookMapper()

const baseContext = {
  eventId: 'evt-1',
  timestamp: '2026-03-02T10:00:00Z',
  sourceUrl: 'https://loja.com',
  actionSource: 'web' as const,
  currency: 'BRL',
}

// ─── Phone normalization ──────────────────────────────────────

test('phone: strips + and non-digits before hashing', () => {
  const user = mapper.mapUserData({ phone: '+55 (11) 99999-9999' })
  expect(user.ph).toBe(sha256('5511999999999'))
})

test('phone: already clean number hashes correctly', () => {
  const user = mapper.mapUserData({ phone: '5511999999999' })
  expect(user.ph).toBe(sha256('5511999999999'))
})

// ─── Email normalization ──────────────────────────────────────

test('email: lowercases and trims before hashing', () => {
  const user = mapper.mapUserData({ email: ' Joao@Email.COM ' })
  expect(user.em).toBe(sha256('joao@email.com'))
})

// ─── BirthDate normalization ──────────────────────────────────

test('birthDate: strips separators before hashing', () => {
  const user = mapper.mapUserData({ birthDate: '1990-01-15' })
  expect(user.db).toBe(sha256('19900115'))
})

test('birthDate: already clean value hashes correctly', () => {
  const user = mapper.mapUserData({ birthDate: '19900115' })
  expect(user.db).toBe(sha256('19900115'))
})

// ─── Gender normalization ─────────────────────────────────────

test('gender: lowercases and trims before hashing', () => {
  const user = mapper.mapUserData({ gender: 'f' })
  expect(user.ge).toBe(sha256('f'))
})

// ─── City normalization ───────────────────────────────────────

test('city: removes spaces and lowercases before hashing', () => {
  const user = mapper.mapUserData({ city: 'Sao Paulo' })
  expect(user.ct).toBe(sha256('saopaulo'))
})

// ─── State / ZipCode / Country ────────────────────────────────

test('state: lowercases before hashing', () => {
  const user = mapper.mapUserData({ state: 'SP' })
  expect(user.st).toBe(sha256('sp'))
})

test('zipCode: strips dashes before hashing', () => {
  const user = mapper.mapUserData({ zipCode: '01310-100' })
  expect(user.zp).toBe(sha256('01310100'))
})

test('country: lowercases before hashing', () => {
  const user = mapper.mapUserData({ country: 'BR' })
  expect(user.country).toBe(sha256('br'))
})

// ─── Non-hashed passthrough ───────────────────────────────────

test('ip passes through raw', () => {
  const user = mapper.mapUserData({ ip: '189.0.0.1' })
  expect(user.client_ip_address).toBe('189.0.0.1')
})

test('userAgent passes through raw', () => {
  const user = mapper.mapUserData({ userAgent: 'Mozilla/5.0' })
  expect(user.client_user_agent).toBe('Mozilla/5.0')
})

test('fbp passes through raw', () => {
  const user = mapper.mapUserData({ fbp: 'fb.1.123.456' })
  expect(user.fbp).toBe('fb.1.123.456')
})

test('fbc passes through raw', () => {
  const user = mapper.mapUserData({ fbc: 'fb.1.123.abc' })
  expect(user.fbc).toBe('fb.1.123.abc')
})

test('deviceId maps to madid', () => {
  const user = mapper.mapUserData({ deviceId: 'device-123' })
  expect(user.madid).toBe('device-123')
})

// ─── CAPI output structure ────────────────────────────────────

test('toCapiEvent produces correct structure for purchase', () => {
  const event: UnifiedPurchase = {
    event: 'purchase',
    context: baseContext,
    user: {
      email: 'joao@email.com',
      phone: '+5511999999999',
      ip: '189.0.0.1',
      userAgent: 'Mozilla/5.0',
    },
    transactionId: 'PED-1',
    value: 299.90,
    items: [{ id: 'SKU-01', name: 'Ingresso VIP', price: 299.90, quantity: 1 }],
  }

  const capi = mapper.toCapiEvent(event)

  expect(capi.event_name).toBe('Purchase')
  expect(capi.event_id).toBe('evt-1')
  expect(capi.action_source).toBe('website')
  expect(capi.user_data.em).toBe(sha256('joao@email.com'))
  expect(capi.user_data.ph).toBe(sha256('5511999999999'))
  expect(capi.user_data.client_ip_address).toBe('189.0.0.1')
  expect(capi.custom_data?.value).toBe(299.90)
  expect(capi.custom_data?.currency).toBe('BRL')
  expect(capi.custom_data?.content_ids).toEqual(['SKU-01'])
})

// ─── Pixel output ─────────────────────────────────────────────

test('toPixelEvent maps event names correctly', () => {
  const pageView: UnifiedPageView = {
    event: 'page_view',
    context: baseContext,
  }

  const pixel = mapper.toPixelEvent(pageView)
  expect(pixel.eventName).toBe('PageView')
  expect(pixel.eventId).toBe('evt-1')
})

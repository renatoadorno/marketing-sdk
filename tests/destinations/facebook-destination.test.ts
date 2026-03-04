import { test, expect, mock, beforeEach } from 'bun:test'
import { FacebookDestination } from '../../src/destinations/facebook-destination'
import type { UnifiedPurchase } from '../../src/types/unified-events'

const purchaseEvent: UnifiedPurchase = {
  event: 'purchase',
  context: {
    eventId: 'evt-123',
    timestamp: '2026-03-02T10:00:00Z',
    sourceUrl: 'https://loja.com/obrigado',
    actionSource: 'web',
    currency: 'BRL',
  },
  user: {
    email: 'joao@email.com',
    phone: '+5511999999999',
    ip: '189.0.0.1',
    userAgent: 'Mozilla/5.0',
    externalId: '12345',
  },
  transactionId: 'PED-789',
  value: 299.90,
  items: [{ id: 'SKU-01', name: 'Ingresso VIP', price: 299.90, quantity: 1 }],
}

test('FacebookDestination.toPixelPayload returns correct format', () => {
  const dest = new FacebookDestination({ pixelId: 'PX-1', accessToken: 'tk-1' })
  const payload = dest.toPixelPayload(purchaseEvent)

  expect(payload.eventName).toBe('Purchase')
  expect(payload.eventId).toBe('evt-123')
  expect(payload.params.value).toBe(299.90)
  expect(payload.params.currency).toBe('BRL')
  expect(payload.params.content_ids).toEqual(['SKU-01'])
})

test('FacebookDestination.send calls correct endpoint', async () => {
  const originalFetch = globalThis.fetch
  let capturedUrl = ''
  let capturedBody: Record<string, unknown> = {}

  globalThis.fetch = mock(async (url: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(url)
    capturedBody = JSON.parse(init?.body as string)
    return new Response('{"events_received":1}', { status: 200 })
  }) as unknown as typeof fetch

  const dest = new FacebookDestination({ pixelId: 'PX-1', accessToken: 'tk-1' })
  const result = await dest.send(purchaseEvent)

  expect(result.status).toBe('success')
  expect(result.httpStatus).toBe(200)
  expect(result.platform).toBe('facebook')
  expect(result.instanceId).toBe('PX-1')
  expect(capturedUrl).toContain('graph.facebook.com')
  expect(capturedUrl).toContain('PX-1')
  expect(capturedUrl).toContain('access_token=tk-1')
  expect(capturedBody.data).toHaveLength(1)

  globalThis.fetch = originalFetch
})

test('FacebookDestination.send includes test_event_code when configured', async () => {
  const originalFetch = globalThis.fetch
  let capturedBody: Record<string, unknown> = {}

  globalThis.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
    capturedBody = JSON.parse(init?.body as string)
    return new Response('{"events_received":1}', { status: 200 })
  }) as unknown as typeof fetch

  const dest = new FacebookDestination({ pixelId: 'PX-1', accessToken: 'tk-1', testEventCode: 'TEST123' })
  await dest.send(purchaseEvent)

  expect(capturedBody.test_event_code).toBe('TEST123')

  globalThis.fetch = originalFetch
})

test('FacebookDestination.send handles HTTP errors gracefully', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = mock(async () => {
    return new Response('Invalid access token', { status: 400 })
  }) as unknown as typeof fetch

  const dest = new FacebookDestination({ pixelId: 'PX-1', accessToken: 'bad' })
  const result = await dest.send(purchaseEvent)

  expect(result.status).toBe('error')
  expect(result.httpStatus).toBe(400)
  expect(result.errorMessage).toContain('Invalid access token')

  globalThis.fetch = originalFetch
})

test('FacebookDestination.send handles network errors gracefully', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = mock(async () => {
    throw new Error('Network failure')
  }) as unknown as typeof fetch

  const dest = new FacebookDestination({ pixelId: 'PX-1', accessToken: 'tk-1' })
  const result = await dest.send(purchaseEvent)

  expect(result.status).toBe('error')
  expect(result.errorMessage).toContain('Network failure')

  globalThis.fetch = originalFetch
})

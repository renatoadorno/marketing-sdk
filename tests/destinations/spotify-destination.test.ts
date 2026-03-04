import { test, expect, mock } from 'bun:test'
import { SpotifyDestination } from '../../src/destinations/spotify-destination'
import type { UnifiedPurchase } from '../../src/types/unified-events'

const purchaseEvent: UnifiedPurchase = {
  event: 'purchase',
  context: {
    eventId: 'evt-789',
    timestamp: '2026-03-02T10:00:00Z',
    sourceUrl: 'https://loja.com/obrigado',
    actionSource: 'web',
    currency: 'BRL',
  },
  user: {
    email: 'joao@email.com',
    ip: '189.0.0.1',
  },
  transactionId: 'PED-789',
  value: 299.90,
  items: [{ id: 'SKU-01', name: 'Ingresso VIP', price: 299.90, quantity: 1 }],
}

test('SpotifyDestination.toPixelPayload returns correct format', () => {
  const dest = new SpotifyDestination({ connectionId: 'conn-1', bearerToken: 'tk-1' })
  const payload = dest.toPixelPayload(purchaseEvent)

  expect(payload.eventName).toBe('purchase')
  expect(payload.eventId).toBe('evt-789')
  expect(payload.params.value).toBe(299.90)
})

test('SpotifyDestination.send calls correct endpoint with bearer token', async () => {
  const originalFetch = globalThis.fetch
  let capturedUrl = ''
  let capturedHeaders: Record<string, string> = {}
  let capturedBody: Record<string, unknown> = {}

  globalThis.fetch = mock(async (url: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(url)
    capturedHeaders = Object.fromEntries(new Headers(init?.headers).entries())
    capturedBody = JSON.parse(init?.body as string)
    return new Response('{"message":"SUCCESS"}', { status: 200 })
  }) as unknown as typeof fetch

  const dest = new SpotifyDestination({ connectionId: 'conn-1', bearerToken: 'tk-1' })
  const result = await dest.send(purchaseEvent)

  expect(result.status).toBe('success')
  expect(result.httpStatus).toBe(200)
  expect(capturedUrl).toContain('capi.spotify.com')
  expect(capturedHeaders.authorization).toBe('Bearer tk-1')
  const convEvents = capturedBody.conversion_events as Record<string, unknown>
  expect(convEvents.capi_connection_id).toBe('conn-1')
  expect((convEvents.events as unknown[])).toHaveLength(1)

  globalThis.fetch = originalFetch
})

test('SpotifyDestination.send handles errors gracefully', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = mock(async () => {
    return new Response('Unauthorized', { status: 401 })
  }) as unknown as typeof fetch

  const dest = new SpotifyDestination({ connectionId: 'conn-1', bearerToken: 'bad' })
  const result = await dest.send(purchaseEvent)

  expect(result.status).toBe('error')
  expect(result.httpStatus).toBe(401)

  globalThis.fetch = originalFetch
})

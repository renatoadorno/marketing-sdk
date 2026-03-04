import { test, expect, mock } from 'bun:test'
import { GoogleDestination } from '../../src/destinations/google-destination'
import type { UnifiedPurchase } from '../../src/types/unified-events'

const purchaseEvent: UnifiedPurchase = {
  event: 'purchase',
  context: {
    eventId: 'evt-456',
    timestamp: '2026-03-02T10:00:00Z',
    sourceUrl: 'https://loja.com/obrigado',
    actionSource: 'web',
    currency: 'BRL',
  },
  user: {
    email: 'joao@email.com',
    gaClientId: 'GA1.2.123456789.1234567890',
    externalId: '12345',
  },
  transactionId: 'PED-789',
  value: 299.90,
  items: [{ id: 'SKU-01', name: 'Ingresso VIP', price: 299.90, quantity: 1 }],
}

test('GoogleDestination.toPixelPayload returns correct format', () => {
  const dest = new GoogleDestination({ measurementId: 'G-123', apiSecret: 'secret' })
  const payload = dest.toPixelPayload(purchaseEvent)

  expect(payload.eventName).toBe('purchase')
  expect(payload.eventId).toBe('evt-456')
  expect(payload.params.value).toBe(299.90)
  expect(payload.params.transaction_id).toBe('PED-789')
})

test('GoogleDestination.send calls correct endpoint', async () => {
  const originalFetch = globalThis.fetch
  let capturedUrl = ''
  let capturedBody: Record<string, unknown> = {}

  globalThis.fetch = mock(async (url: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(url)
    capturedBody = JSON.parse(init?.body as string)
    return new Response('', { status: 204 })
  }) as unknown as typeof fetch

  const dest = new GoogleDestination({ measurementId: 'G-123', apiSecret: 'secret' })
  const result = await dest.send(purchaseEvent)

  expect(result.status).toBe('success')
  expect(result.httpStatus).toBe(204)
  expect(capturedUrl).toContain('google-analytics.com/mp/collect')
  expect(capturedUrl).toContain('measurement_id=G-123')
  expect(capturedUrl).toContain('api_secret=secret')
  expect(capturedBody.client_id).toBe('GA1.2.123456789.1234567890')
  expect((capturedBody.events as unknown[])).toHaveLength(1)

  globalThis.fetch = originalFetch
})

test('GoogleDestination.send handles errors gracefully', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = mock(async () => {
    throw new Error('Timeout')
  }) as unknown as typeof fetch

  const dest = new GoogleDestination({ measurementId: 'G-123', apiSecret: 'secret' })
  const result = await dest.send(purchaseEvent)

  expect(result.status).toBe('error')
  expect(result.errorMessage).toContain('Timeout')

  globalThis.fetch = originalFetch
})

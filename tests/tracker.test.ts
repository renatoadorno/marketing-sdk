import { test, expect, mock } from 'bun:test'
import { Tracker } from '../src/tracker'
import { UserData } from '../src/builders/user-data'
import { CustomData } from '../src/builders/custom-data'
import { ItemData } from '../src/builders/item-data'
import { FacebookDestination } from '../src/destinations/facebook-destination'
import { GoogleDestination } from '../src/destinations/google-destination'
import { SpotifyDestination } from '../src/destinations/spotify-destination'

function mockFetchSuccess() {
  return mock(async () => new Response('{"events_received":1}', { status: 200 })) as unknown as typeof fetch
}

test('Tracker end-to-end: purchase dispatched to all destinations', async () => {
  const originalFetch = globalThis.fetch
  const calls: string[] = []

  globalThis.fetch = mock(async (url: string | URL | Request) => {
    const urlStr = String(url)
    if (urlStr.includes('facebook')) calls.push('facebook')
    else if (urlStr.includes('google')) calls.push('google')
    else if (urlStr.includes('spotify')) calls.push('spotify')
    return new Response('{"message":"SUCCESS"}', { status: 200 })
  }) as unknown as typeof fetch

  const tracker = new Tracker()
    .setSourceUrl('https://loja.com')
    .setActionSource('web')
    .addDestination(new FacebookDestination({ pixelId: 'PX-1', accessToken: 'tk-1' }))
    .addDestination(new GoogleDestination({ measurementId: 'G-123', apiSecret: 'secret' }))
    .addDestination(new SpotifyDestination({ connectionId: 'conn-1', bearerToken: 'tk-2' }))

  const userData = new UserData()
    .setEmail('joao@email.com')
    .setClientIpAddress('189.0.0.1')
    .setExternalId('12345')
    .setGaClientId('GA1.2.123')

  const customData = new CustomData()
    .setCurrency('BRL')
    .setValue(299.90)
    .setOrderId('PED-789')
    .addItem(new ItemData().setId('SKU-01').setName('Ingresso VIP').setPrice(299.90).setQuantity(1))

  const result = await tracker.track('purchase', { userData, customData })

  expect(result.success).toBe(true)
  expect(result.destinations).toHaveLength(3)
  expect(result.errors).toHaveLength(0)
  expect(calls).toContain('facebook')
  expect(calls).toContain('google')
  expect(calls).toContain('spotify')

  globalThis.fetch = originalFetch
})

test('Tracker returns client payloads when requested', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = mockFetchSuccess()

  const tracker = new Tracker()
    .setSourceUrl('https://loja.com')
    .addDestination(new FacebookDestination({ pixelId: 'PX-1', accessToken: 'tk-1' }))
    .addDestination(new GoogleDestination({ measurementId: 'G-123', apiSecret: 'secret' }))

  const customData = new CustomData().setCurrency('BRL').setValue(50)
  const result = await tracker.track('lead', { customData, returnClientPayloads: true })

  expect(result.clientPayloads).toBeDefined()
  expect(result.clientPayloads!.facebook).toHaveLength(1)
  expect(result.clientPayloads!.facebook![0]!.eventName).toBe('Lead')
  expect(result.clientPayloads!.google).toHaveLength(1)
  expect(result.clientPayloads!.google![0]!.eventName).toBe('generate_lead')

  globalThis.fetch = originalFetch
})

test('Tracker isolates destination errors', async () => {
  const originalFetch = globalThis.fetch
  let callCount = 0

  globalThis.fetch = mock(async (url: string | URL | Request) => {
    callCount++
    const urlStr = String(url)
    if (urlStr.includes('facebook')) {
      return new Response('Error', { status: 500 })
    }
    return new Response('OK', { status: 200 })
  }) as unknown as typeof fetch

  const tracker = new Tracker()
    .addDestination(new FacebookDestination({ pixelId: 'PX-1', accessToken: 'tk-1' }))
    .addDestination(new GoogleDestination({ measurementId: 'G-123', apiSecret: 'secret' }))

  const result = await tracker.track('page_view', {})

  expect(result.success).toBe(false)
  expect(result.errors).toHaveLength(1)
  expect(result.errors[0]!.destination).toContain('facebook')
  expect(result.destinations[1]!.status).toBe('success')
  // Facebook retries 500 twice (3 calls) + Google 1 call = 4 total
  expect(callCount).toBe(4)

  globalThis.fetch = originalFetch
})

test('Tracker supports multiple accounts of same platform', async () => {
  const originalFetch = globalThis.fetch
  const pixelIds: string[] = []

  globalThis.fetch = mock(async (url: string | URL | Request) => {
    const urlStr = String(url)
    const match = urlStr.match(/\/(\w+-\d+)\/events/)
    if (match) pixelIds.push(match[1]!)
    return new Response('OK', { status: 200 })
  }) as unknown as typeof fetch

  const tracker = new Tracker()
    .addDestination(new FacebookDestination({ pixelId: 'PX-1', accessToken: 'tk-1' }))
    .addDestination(new FacebookDestination({ pixelId: 'PX-2', accessToken: 'tk-2' }))

  const result = await tracker.track('page_view', {})

  expect(result.destinations).toHaveLength(2)
  expect(pixelIds).toContain('PX-1')
  expect(pixelIds).toContain('PX-2')

  globalThis.fetch = originalFetch
})

test('Tracker generates warnings for incomplete data', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = mockFetchSuccess()

  const tracker = new Tracker()
    .addDestination(new GoogleDestination({ measurementId: 'G-123', apiSecret: 'secret' }))

  const customData = new CustomData()
    .setValue(100)
    .setOrderId('PED-1')

  const result = await tracker.track('purchase', { customData })

  expect(result.warnings.length).toBeGreaterThan(0)
  expect(result.warnings.some((w) => w.field === 'items')).toBe(true)
  expect(result.warnings.some((w) => w.destination === 'google')).toBe(true)

  globalThis.fetch = originalFetch
})

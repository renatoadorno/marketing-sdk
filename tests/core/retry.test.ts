import { test, expect, mock, beforeEach } from 'bun:test'
import { fetchWithRetry } from '../../src/core/retry'

let originalFetch: typeof fetch
let callCount: number

beforeEach(() => {
  originalFetch = globalThis.fetch
  callCount = 0
})

function restoreFetch() {
  globalThis.fetch = originalFetch
}

function mockFetchSequence(responses: Array<() => Response | Promise<Response>>) {
  globalThis.fetch = mock(async () => {
    const fn = responses[callCount] ?? responses[responses.length - 1]!
    callCount++
    return fn()
  }) as unknown as typeof fetch
}

function mockFetchThrowThenSucceed(errorMsg: string) {
  globalThis.fetch = mock(async () => {
    callCount++
    if (callCount <= 1) throw new Error(errorMsg)
    return new Response('ok', { status: 200 })
  }) as unknown as typeof fetch
}

// ─── 200 retorna imediato ─────────────────────────────────────

test('200 returns immediately with 1 call', async () => {
  mockFetchSequence([() => new Response('ok', { status: 200 })])

  const res = await fetchWithRetry('https://api.test.com', {}, { maxRetries: 2, baseDelayMs: 1 })

  expect(res.status).toBe(200)
  expect(callCount).toBe(1)
  restoreFetch()
})

// ─── 4xx nao retenta ──────────────────────────────────────────

test('4xx does not retry', async () => {
  mockFetchSequence([() => new Response('bad request', { status: 400 })])

  const res = await fetchWithRetry('https://api.test.com', {}, { maxRetries: 2, baseDelayMs: 1 })

  expect(res.status).toBe(400)
  expect(callCount).toBe(1)
  restoreFetch()
})

// ─── 500 retenta e sucesso ────────────────────────────────────

test('500 retries and succeeds on second attempt', async () => {
  mockFetchSequence([
    () => new Response('server error', { status: 500 }),
    () => new Response('ok', { status: 200 }),
  ])

  const res = await fetchWithRetry('https://api.test.com', {}, { maxRetries: 2, baseDelayMs: 1 })

  expect(res.status).toBe(200)
  expect(callCount).toBe(2)
  restoreFetch()
})

// ─── 429 retenta ──────────────────────────────────────────────

test('429 rate limit retries', async () => {
  mockFetchSequence([
    () => new Response('rate limited', { status: 429 }),
    () => new Response('ok', { status: 200 }),
  ])

  const res = await fetchWithRetry('https://api.test.com', {}, { maxRetries: 2, baseDelayMs: 1 })

  expect(res.status).toBe(200)
  expect(callCount).toBe(2)
  restoreFetch()
})

// ─── Max retries respeitado ───────────────────────────────────

test('max retries respected (3 total calls)', async () => {
  mockFetchSequence([
    () => new Response('error', { status: 500 }),
    () => new Response('error', { status: 500 }),
    () => new Response('error', { status: 500 }),
  ])

  const res = await fetchWithRetry('https://api.test.com', {}, { maxRetries: 2, baseDelayMs: 1 })

  expect(res.status).toBe(500)
  expect(callCount).toBe(3)
  restoreFetch()
})

// ─── Network error retentado ──────────────────────────────────

test('network error retries and succeeds', async () => {
  mockFetchThrowThenSucceed('DNS resolution failed')

  const res = await fetchWithRetry('https://api.test.com', {}, { maxRetries: 2, baseDelayMs: 1 })

  expect(res.status).toBe(200)
  expect(callCount).toBe(2)
  restoreFetch()
})

// ─── Network error esgota retries ─────────────────────────────

test('network error throws after max retries', async () => {
  globalThis.fetch = mock(async () => {
    callCount++
    throw new Error('Connection refused')
  }) as unknown as typeof fetch

  try {
    await fetchWithRetry('https://api.test.com', {}, { maxRetries: 2, baseDelayMs: 1 })
    expect(true).toBe(false) // should not reach
  } catch (err) {
    expect((err as Error).message).toBe('Connection refused')
    expect(callCount).toBe(3)
  }

  restoreFetch()
})

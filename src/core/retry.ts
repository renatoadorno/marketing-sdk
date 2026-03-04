export interface RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
}

const DEFAULT_MAX_RETRIES = 2
const DEFAULT_BASE_DELAY_MS = 500

function isRetryableStatus(status: number): boolean {
  return status >= 500 || status === 429
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchWithRetry(
  url: string | URL | Request,
  init?: RequestInit,
  options?: RetryOptions,
): Promise<Response> {
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES
  const baseDelay = options?.baseDelayMs ?? DEFAULT_BASE_DELAY_MS

  let lastError: unknown
  let lastResponse: Response | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, init)

      if (!isRetryableStatus(response.status) || attempt === maxRetries) {
        return response
      }

      lastResponse = response
    } catch (err) {
      lastError = err

      if (attempt === maxRetries) {
        throw err
      }
    }

    await delay(baseDelay * Math.pow(2, attempt))
  }

  if (lastResponse) return lastResponse
  throw lastError
}

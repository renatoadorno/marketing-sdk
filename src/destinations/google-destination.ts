import type { Destination, GoogleDestinationConfig } from './destination'
import type { UnifiedEvent } from '../types/unified-events'
import type { DestinationResult, ClientPayloadEntry } from '../types/track-result'
import { GoogleMapper } from '../mappers/google-mapper'
import { fetchWithRetry } from '../core/retry'

const MP_ENDPOINT = 'https://www.google-analytics.com/mp/collect'
const TIMEOUT_MS = 10_000

export class GoogleDestination implements Destination {
  readonly platform = 'google'
  readonly instanceId: string
  private mapper = new GoogleMapper()
  private config: GoogleDestinationConfig

  constructor(config: GoogleDestinationConfig) {
    this.config = config
    this.instanceId = config.measurementId
  }

  async send(event: UnifiedEvent): Promise<DestinationResult> {
    const capiPayload = this.mapper.toCapiEvent(event)
    const url = `${MP_ENDPOINT}?measurement_id=${this.config.measurementId}&api_secret=${this.config.apiSecret}`

    try {
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(capiPayload),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      return {
        platform: this.platform,
        instanceId: this.instanceId,
        status: response.ok ? 'success' : 'error',
        httpStatus: response.status,
        errorMessage: response.ok ? undefined : await response.text(),
      }
    } catch (err) {
      return {
        platform: this.platform,
        instanceId: this.instanceId,
        status: 'error',
        errorMessage: err instanceof Error ? err.message : String(err),
      }
    }
  }

  toPixelPayload(event: UnifiedEvent): ClientPayloadEntry {
    const pixel = this.mapper.toPixelEvent(event)
    return {
      eventName: pixel.eventName,
      params: pixel.params,
      eventId: pixel.eventId,
    }
  }
}

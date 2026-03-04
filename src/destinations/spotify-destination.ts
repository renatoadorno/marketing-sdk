import type { Destination, SpotifyDestinationConfig } from './destination'
import type { UnifiedEvent } from '../types/unified-events'
import type { DestinationResult, ClientPayloadEntry } from '../types/track-result'
import type { SpotifyCapiRequestBody } from '../../interfaces/spotify/capi'
import { SpotifyMapper } from '../mappers/spotify-mapper'
import { fetchWithRetry } from '../core/retry'

const CAPI_ENDPOINT = 'https://capi.spotify.com/capi-direct/events/'
const TIMEOUT_MS = 10_000

export class SpotifyDestination implements Destination {
  readonly platform = 'spotify'
  readonly instanceId: string
  private mapper = new SpotifyMapper()
  private config: SpotifyDestinationConfig

  constructor(config: SpotifyDestinationConfig) {
    this.config = config
    this.instanceId = config.connectionId
  }

  async send(event: UnifiedEvent): Promise<DestinationResult> {
    const capiPayload = this.mapper.toCapiEvent(event)

    const body: SpotifyCapiRequestBody = {
      conversion_events: {
        capi_connection_id: this.config.connectionId,
        events: [capiPayload],
      },
    }

    try {
      const response = await fetchWithRetry(CAPI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.bearerToken}`,
        },
        body: JSON.stringify(body),
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

import type { Destination, FacebookDestinationConfig } from './destination'
import type { UnifiedEvent } from '../types/unified-events'
import type { DestinationResult, ClientPayloadEntry } from '../types/track-result'
import type { FacebookCapiRequestBody } from '../../interfaces/facebook/capi'
import { FacebookMapper } from '../mappers/facebook-mapper'
import { fetchWithRetry } from '../core/retry'

const GRAPH_API_VERSION = 'v21.0'
const TIMEOUT_MS = 10_000

export class FacebookDestination implements Destination {
  readonly platform = 'facebook'
  readonly instanceId: string
  private mapper = new FacebookMapper()
  private config: FacebookDestinationConfig

  constructor(config: FacebookDestinationConfig) {
    this.config = config
    this.instanceId = config.pixelId
  }

  async send(event: UnifiedEvent): Promise<DestinationResult> {
    const capiPayload = this.mapper.toCapiEvent(event)
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${this.config.pixelId}/events?access_token=${this.config.accessToken}`

    const body: FacebookCapiRequestBody = {
      data: [capiPayload],
    }
    if (this.config.testEventCode) {
      body.test_event_code = this.config.testEventCode
    }

    try {
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

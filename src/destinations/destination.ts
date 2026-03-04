import type { UnifiedEvent } from '../types/unified-events'
import type { DestinationResult, ClientPayloadEntry } from '../types/track-result'

export interface Destination {
  readonly platform: string
  readonly instanceId: string
  send(event: UnifiedEvent): Promise<DestinationResult>
  toPixelPayload(event: UnifiedEvent): ClientPayloadEntry
}

export interface FacebookDestinationConfig {
  pixelId: string
  accessToken: string
  testEventCode?: string
}

export interface GoogleDestinationConfig {
  measurementId: string
  apiSecret: string
}

export interface SpotifyDestinationConfig {
  connectionId: string
  bearerToken: string
}

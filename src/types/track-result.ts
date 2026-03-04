export interface TrackResult {
  success: boolean
  destinations: DestinationResult[]
  warnings: TrackWarning[]
  errors: TrackError[]
  clientPayloads?: ClientPayloads
}

export interface DestinationResult {
  platform: string
  instanceId: string
  status: 'success' | 'error'
  httpStatus?: number
  errorMessage?: string
}

export interface TrackWarning {
  destination?: string
  field?: string
  message: string
}

export interface TrackError {
  destination: string
  message: string
  httpStatus?: number
}

export interface ClientPayloads {
  facebook?: ClientPayloadEntry[]
  google?: ClientPayloadEntry[]
  spotify?: ClientPayloadEntry[]
}

export interface ClientPayloadEntry {
  eventName: string
  params: Record<string, unknown>
  eventId: string
}

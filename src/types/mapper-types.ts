import type {
  UnifiedEvent,
  UnifiedEventName,
  UnifiedItem,
  UnifiedUserData,
} from './unified-events'

export interface PlatformMapper<TPixelResult, TCapiResult> {
  readonly platform: string

  toPixelEvent(event: UnifiedEvent): PlatformPixelOutput<TPixelResult>
  toCapiEvent(event: UnifiedEvent): TCapiResult

  mapEventName(internalName: UnifiedEventName, target: 'pixel' | 'capi'): string
  mapItem(item: UnifiedItem): unknown
  mapUserData(user: UnifiedUserData): unknown
  hashPii(value: string): string
}

export interface PlatformPixelOutput<TParams> {
  eventName: string
  params: TParams
  eventId: string
}

export type EventNameMap = Record<UnifiedEventName, string>

export interface FieldMappingRule<TFrom = string, TTo = string> {
  from: TFrom
  to: TTo
  transform?: (value: unknown) => unknown
  required?: boolean
}

export type ExtractEvent<TUnion extends { event: string }, TName extends string> =
  TUnion extends { event: TName } ? TUnion : never

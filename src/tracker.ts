import type { Destination } from './destinations/destination'
import type { UnifiedActionSource, UnifiedEventName } from './types/unified-events'
import type { TrackResult, ClientPayloads, TrackWarning, TrackError } from './types/track-result'
import type { TrackOptions } from './core/event-assembler'
import { assembleEvent, type TrackerDefaults } from './core/event-assembler'
import { validateEvent } from './core/validator'

export class Tracker {
  private destinations: Destination[] = []
  private defaults: TrackerDefaults = {}

  setSourceUrl(sourceUrl: string): this {
    this.defaults.sourceUrl = sourceUrl
    return this
  }

  setActionSource(actionSource: UnifiedActionSource): this {
    this.defaults.actionSource = actionSource
    return this
  }

  addDestination(destination: Destination): this {
    this.destinations.push(destination)
    return this
  }

  async track(eventName: UnifiedEventName, options: TrackOptions = {}): Promise<TrackResult> {
    const event = assembleEvent(eventName, options, this.defaults)

    const hasGoogle = this.destinations.some((d) => d.platform === 'google')
    const warnings: TrackWarning[] = validateEvent(event, hasGoogle)
    const errors: TrackError[] = []

    const results = await Promise.allSettled(
      this.destinations.map((dest) => dest.send(event)),
    )

    const destinationResults = results.map((result, i) => {
      const dest = this.destinations[i]!
      if (result.status === 'fulfilled') {
        if (result.value.status === 'error') {
          errors.push({
            destination: `${dest.platform}:${dest.instanceId}`,
            message: result.value.errorMessage ?? 'Unknown error',
            httpStatus: result.value.httpStatus,
          })
        }
        return result.value
      }
      const errorMsg = result.reason instanceof Error ? result.reason.message : String(result.reason)
      errors.push({
        destination: `${dest.platform}:${dest.instanceId}`,
        message: errorMsg,
      })
      return {
        platform: dest.platform,
        instanceId: dest.instanceId,
        status: 'error' as const,
        errorMessage: errorMsg,
      }
    })

    let clientPayloads: ClientPayloads | undefined
    if (options.returnClientPayloads) {
      clientPayloads = { facebook: [], google: [], spotify: [] }
      for (const dest of this.destinations) {
        const payload = dest.toPixelPayload(event)
        const platform = dest.platform as keyof ClientPayloads
        clientPayloads[platform]?.push(payload)
      }
    }

    return {
      success: errors.length === 0,
      destinations: destinationResults,
      warnings,
      errors,
      clientPayloads,
    }
  }
}

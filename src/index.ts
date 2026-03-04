export { Tracker } from './tracker'
export { UserData } from './builders/user-data'
export { CustomData } from './builders/custom-data'
export { ItemData } from './builders/item-data'
export { FacebookDestination } from './destinations/facebook-destination'
export { GoogleDestination } from './destinations/google-destination'
export { SpotifyDestination } from './destinations/spotify-destination'

export type {
  TrackResult,
  DestinationResult,
  ClientPayloads,
  ClientPayloadEntry,
  TrackWarning,
  TrackError,
} from './types/track-result'

export type {
  Destination,
  FacebookDestinationConfig,
  GoogleDestinationConfig,
  SpotifyDestinationConfig,
} from './destinations/destination'

export type {
  UnifiedEvent,
  UnifiedEventName,
  UnifiedItem,
  UnifiedUserData,
  UnifiedEventContext,
  UnifiedActionSource,
} from './types/unified-events'

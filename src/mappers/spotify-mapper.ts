import type {
  SpotifyCapiEvent,
  SpotifyCapiEventName,
  SpotifyCapiUserData,
  SpotifyCapiEventDetails,
  SpotifyCapiActionSource,
} from '../../interfaces/spotify/capi'
import type { SpotifyPixelLineItem } from '../../interfaces/spotify/pixel'
import type {
  PlatformMapper,
  PlatformPixelOutput,
  EventNameMap,
} from '../types/mapper-types'
import type {
  UnifiedEvent,
  UnifiedEventName,
  UnifiedItem,
  UnifiedUserData,
  UnifiedActionSource,
} from '../types/unified-events'
import { sha256 } from '../core/hash'

const PIXEL_EVENT_NAMES: EventNameMap = {
  page_view: 'view',
  view_product: 'product',
  add_to_cart: 'addtocart',
  begin_checkout: 'checkout',
  purchase: 'purchase',
  lead: 'lead',
  sign_up: 'signup',
}

const CAPI_EVENT_NAMES: Record<UnifiedEventName, SpotifyCapiEventName> = {
  page_view: 'PRODUCT',
  view_product: 'PRODUCT',
  add_to_cart: 'ADD_TO_CART',
  begin_checkout: 'CHECK_OUT',
  purchase: 'PURCHASE',
  lead: 'LEAD',
  sign_up: 'SIGN_UP',
}

const ACTION_SOURCE_MAP: Record<UnifiedActionSource, SpotifyCapiActionSource> = {
  web: 'WEB',
  app: 'APP',
  offline: 'OFFLINE',
  other: 'WEB',
}

function mapItemToLineItem(item: UnifiedItem): SpotifyPixelLineItem {
  return {
    value: item.price,
    quantity: item.quantity ?? 1,
  }
}

function mapUserDataToSpotify(user: UnifiedUserData, hashFn: (v: string) => string): SpotifyCapiUserData {
  const userData: SpotifyCapiUserData = {}

  if (user.email) {
    userData.hashed_emails = [hashFn(user.email.toLowerCase().trim())]
  }

  if (user.phone) {
    userData.hashed_phone_number = hashFn(user.phone.replace(/\D/g, ''))
  }

  if (user.ip) {
    userData.ip_address = user.ip
  }

  if (user.deviceId) {
    userData.device_id = user.deviceId
  }

  return userData
}

type SpotifyPixelParams = Record<string, unknown>

function buildPixelParams(event: UnifiedEvent): SpotifyPixelParams {
  const params: SpotifyPixelParams = {}
  const currency = event.context.currency

  params.event_id = event.context.eventId

  switch (event.event) {
    case 'page_view':
      break

    case 'view_product':
      if (event.value != null) params.value = event.value
      if (currency) params.currency = currency
      params.product_id = event.item.id
      params.product_name = event.item.name
      if (event.item.category) params.product_type = event.item.category
      if (event.item.brand) params.product_vendor = event.item.brand
      break

    case 'add_to_cart':
      if (event.value != null) params.value = event.value
      if (currency) params.currency = currency
      params.quantity = event.item.quantity ?? 1
      params.product_id = event.item.id
      params.product_name = event.item.name
      if (event.item.category) params.product_type = event.item.category
      if (event.item.brand) params.product_vendor = event.item.brand
      if (event.item.variant) {
        params.variant_id = event.item.variant
        params.variant_name = event.item.variant
      }
      break

    case 'begin_checkout':
      if (event.value != null) params.value = event.value
      if (currency) params.currency = currency
      params.quantity = event.items.reduce((sum, i) => sum + (i.quantity ?? 1), 0)
      params.line_items = event.items.map(mapItemToLineItem)
      break

    case 'purchase':
      params.value = event.value
      if (currency) params.currency = currency
      if (event.discountCode) params.discount_code = event.discountCode
      if (event.isNewCustomer != null) params.is_new_customer = event.isNewCustomer
      params.line_items = event.items.map(mapItemToLineItem)
      break

    case 'lead':
      if (event.value != null) params.value = event.value
      if (currency) params.currency = currency
      if (event.type) params.type = event.type
      if (event.category) params.category = event.category
      break

    case 'sign_up':
      break
  }

  return params
}

function buildCapiEvent(event: UnifiedEvent, hashFn: (v: string) => string): SpotifyCapiEvent {
  const eventDetails: SpotifyCapiEventDetails = {}
  const currency = event.context.currency

  switch (event.event) {
    case 'view_product':
      if (event.value != null) eventDetails.amount = event.value
      if (currency) eventDetails.currency = currency
      eventDetails.content_name = event.item.name
      if (event.item.category) eventDetails.content_category = event.item.category
      break

    case 'add_to_cart':
      if (event.value != null) eventDetails.amount = event.value
      if (currency) eventDetails.currency = currency
      eventDetails.content_name = event.item.name
      break

    case 'begin_checkout':
      if (event.value != null) eventDetails.amount = event.value
      if (currency) eventDetails.currency = currency
      break

    case 'purchase':
      eventDetails.amount = event.value
      if (currency) eventDetails.currency = currency
      break

    case 'lead':
      if (event.value != null) eventDetails.amount = event.value
      if (currency) eventDetails.currency = currency
      break

    default:
      break
  }

  const capiEvent: SpotifyCapiEvent = {
    event_id: event.context.eventId,
    event_name: CAPI_EVENT_NAMES[event.event],
    event_time: event.context.timestamp,
    user_data: event.user
      ? mapUserDataToSpotify(event.user, hashFn)
      : { ip_address: '0.0.0.0' },
    event_source_url: event.context.sourceUrl,
    action_source: ACTION_SOURCE_MAP[event.context.actionSource ?? 'web'],
  }

  if (Object.keys(eventDetails).length > 0) {
    capiEvent.event_details = eventDetails
  }

  return capiEvent
}

export class SpotifyMapper implements PlatformMapper<SpotifyPixelParams, SpotifyCapiEvent> {
  readonly platform = 'spotify'

  mapEventName(internalName: UnifiedEventName, target: 'pixel' | 'capi'): string {
    return target === 'pixel'
      ? PIXEL_EVENT_NAMES[internalName]
      : CAPI_EVENT_NAMES[internalName]
  }

  mapItem(item: UnifiedItem): SpotifyPixelLineItem {
    return mapItemToLineItem(item)
  }

  mapUserData(user: UnifiedUserData): SpotifyCapiUserData {
    return mapUserDataToSpotify(user, this.hashPii)
  }

  hashPii(value: string): string {
    return sha256(value)
  }

  toPixelEvent(event: UnifiedEvent): PlatformPixelOutput<SpotifyPixelParams> {
    return {
      eventName: this.mapEventName(event.event, 'pixel'),
      params: buildPixelParams(event),
      eventId: event.context.eventId,
    }
  }

  toCapiEvent(event: UnifiedEvent): SpotifyCapiEvent {
    return buildCapiEvent(event, this.hashPii)
  }
}

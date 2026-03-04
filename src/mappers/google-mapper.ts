import type { GoogleGtagItem } from '../../interfaces/google/pixel'
import type { GoogleMPRequestBody, GoogleMPEvent, GoogleMPUserData, GoogleMPUserAddress } from '../../interfaces/google/capi'
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
} from '../types/unified-events'
import { sha256 } from '../core/hash'

const PIXEL_EVENT_NAMES: EventNameMap = {
  page_view: 'page_view',
  view_product: 'view_item',
  add_to_cart: 'add_to_cart',
  begin_checkout: 'begin_checkout',
  purchase: 'purchase',
  lead: 'generate_lead',
  sign_up: 'sign_up',
}

const CAPI_EVENT_NAMES: EventNameMap = { ...PIXEL_EVENT_NAMES }

function mapItemToGoogle(item: UnifiedItem): GoogleGtagItem {
  return {
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity ?? 1,
    item_category: item.category,
    item_brand: item.brand,
    item_variant: item.variant,
    coupon: item.coupon,
    discount: item.discount,
    index: item.index,
    item_list_id: item.listId,
    item_list_name: item.listName,
  }
}

function mapUserDataToGoogle(user: UnifiedUserData, hashFn: (v: string) => string): GoogleMPUserData {
  const userData: GoogleMPUserData = {}

  if (user.email) {
    const normalizedEmail = user.email.toLowerCase().trim()
    userData.sha256_email_address = hashFn(normalizedEmail)
  }

  if (user.phone) {
    userData.sha256_phone_number = hashFn(user.phone.replace(/\D/g, ''))
  }

  if (user.firstName || user.lastName || user.city || user.state || user.zipCode || user.country) {
    const address: GoogleMPUserAddress = {}
    if (user.firstName) address.sha256_first_name = hashFn(user.firstName.toLowerCase().trim())
    if (user.lastName) address.sha256_last_name = hashFn(user.lastName.toLowerCase().trim())
    if (user.city) address.city = user.city
    if (user.state) address.region = user.state
    if (user.zipCode) address.postal_code = user.zipCode
    if (user.country) address.country = user.country
    userData.address = address
  }

  return userData
}

type GooglePixelParams = Record<string, unknown>

function buildPixelParams(event: UnifiedEvent): GooglePixelParams {
  const params: GooglePixelParams = {}
  const currency = event.context.currency

  switch (event.event) {
    case 'page_view':
      break

    case 'view_product':
      if (currency) params.currency = currency
      if (event.value != null) params.value = event.value
      params.items = [mapItemToGoogle(event.item)]
      break

    case 'add_to_cart':
      if (currency) params.currency = currency
      if (event.value != null) params.value = event.value
      params.items = [mapItemToGoogle(event.item)]
      break

    case 'begin_checkout':
      if (currency) params.currency = currency
      if (event.value != null) params.value = event.value
      if (event.coupon) params.coupon = event.coupon
      params.items = event.items.map(mapItemToGoogle)
      break

    case 'purchase':
      params.transaction_id = event.transactionId
      params.currency = currency
      params.value = event.value
      if (event.tax != null) params.tax = event.tax
      if (event.shipping != null) params.shipping = event.shipping
      if (event.coupon) params.coupon = event.coupon
      if (event.isNewCustomer != null) params.customer_type = event.isNewCustomer ? 'new' : 'returning'
      params.items = event.items.map(mapItemToGoogle)
      break

    case 'lead':
      if (currency) params.currency = currency
      if (event.value != null) params.value = event.value
      break

    case 'sign_up':
      if (event.method) params.method = event.method
      break
  }

  return params
}

function buildCapiEvent(event: UnifiedEvent, hashFn: (v: string) => string): GoogleMPRequestBody {
  const mpEvent: GoogleMPEvent = {
    name: CAPI_EVENT_NAMES[event.event],
    params: {
      ...buildPixelParams(event),
      engagement_time_msec: 100,
    },
  }

  const body: GoogleMPRequestBody = {
    client_id: event.user?.gaClientId ?? 'unknown',
    user_id: event.user?.externalId,
    events: [mpEvent],
  }

  if (event.context.timestamp) {
    body.timestamp_micros = new Date(event.context.timestamp).getTime() * 1000
  }

  if (event.user) {
    body.user_data = mapUserDataToGoogle(event.user, hashFn)
  }

  return body
}

export class GoogleMapper implements PlatformMapper<GooglePixelParams, GoogleMPRequestBody> {
  readonly platform = 'google'

  mapEventName(internalName: UnifiedEventName, target: 'pixel' | 'capi'): string {
    return target === 'pixel'
      ? PIXEL_EVENT_NAMES[internalName]
      : CAPI_EVENT_NAMES[internalName]
  }

  mapItem(item: UnifiedItem): GoogleGtagItem {
    return mapItemToGoogle(item)
  }

  mapUserData(user: UnifiedUserData): GoogleMPUserData {
    return mapUserDataToGoogle(user, this.hashPii)
  }

  hashPii(value: string): string {
    return sha256(value)
  }

  toPixelEvent(event: UnifiedEvent): PlatformPixelOutput<GooglePixelParams> {
    return {
      eventName: this.mapEventName(event.event, 'pixel'),
      params: buildPixelParams(event),
      eventId: event.context.eventId,
    }
  }

  toCapiEvent(event: UnifiedEvent): GoogleMPRequestBody {
    return buildCapiEvent(event, this.hashPii)
  }
}

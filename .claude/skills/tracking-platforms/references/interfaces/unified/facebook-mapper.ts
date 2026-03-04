/**
 * Facebook Mapper — Converte UnifiedEvent → Facebook (Meta)
 *
 * Pixel: fbq('track', 'NomeEvento', { params }, { eventID })  →  PascalCase
 * CAPI:  Conversions API POST /{PIXEL_ID}/events               →  PascalCase
 */

import type { FacebookPixelContentItem } from '../facebook/pixel'
import type {
  FacebookCapiServerEvent,
  FacebookCapiUserData,
  FacebookCapiCustomData,
  FacebookCapiActionSource,
} from '../facebook/capi'
import type {
  PlatformMapper,
  PlatformPixelOutput,
  EventNameMap,
} from './mapper-types'
import type {
  UnifiedEvent,
  UnifiedEventName,
  UnifiedItem,
  UnifiedUserData,
  UnifiedActionSource,
} from './unified-events'

// ─── Event Name Maps ─────────────────────────────────────────────

// Facebook usa PascalCase para Pixel e CAPI (mesma nomenclatura)
const EVENT_NAMES: EventNameMap = {
  page_view: 'PageView',
  view_product: 'ViewContent',
  add_to_cart: 'AddToCart',
  begin_checkout: 'InitiateCheckout',
  purchase: 'Purchase',
  lead: 'Lead',
  sign_up: 'CompleteRegistration',
}

// ─── Action Source Map ───────────────────────────────────────────

const ACTION_SOURCE_MAP: Record<UnifiedActionSource, FacebookCapiActionSource> = {
  web: 'website',
  app: 'app',
  offline: 'physical_store',
  other: 'other',
}

// ─── Item Mappers ────────────────────────────────────────────────

function mapItemToContentItem(item: UnifiedItem): FacebookPixelContentItem {
  return {
    id: item.id,
    quantity: item.quantity ?? 1,
  }
}

function extractContentIds(items: UnifiedItem[]): string[] {
  return items.map((item) => item.id)
}

// ─── User Data Mapper ────────────────────────────────────────────

function mapUserDataToFacebook(user: UnifiedUserData, hashFn: (v: string) => string): FacebookCapiUserData {
  const userData: FacebookCapiUserData = {}

  // Campos com hash SHA-256
  if (user.email) userData.em = hashFn(user.email.toLowerCase().trim())
  if (user.phone) userData.ph = hashFn(user.phone.replace(/[^0-9+]/g, ''))
  if (user.firstName) userData.fn = hashFn(user.firstName.toLowerCase().trim())
  if (user.lastName) userData.ln = hashFn(user.lastName.toLowerCase().trim())
  if (user.birthDate) userData.db = hashFn(user.birthDate)
  if (user.gender) userData.ge = hashFn(user.gender)
  if (user.city) userData.ct = hashFn(user.city.toLowerCase().replace(/\s/g, ''))
  if (user.state) userData.st = hashFn(user.state.toLowerCase())
  if (user.zipCode) userData.zp = hashFn(user.zipCode.replace(/-/g, ''))
  if (user.country) userData.country = hashFn(user.country.toLowerCase())

  // Campos SEM hash
  if (user.ip) userData.client_ip_address = user.ip
  if (user.userAgent) userData.client_user_agent = user.userAgent
  if (user.fbp) userData.fbp = user.fbp
  if (user.fbc) userData.fbc = user.fbc
  if (user.externalId) userData.external_id = hashFn(user.externalId)
  if (user.deviceId) userData.madid = user.deviceId

  return userData
}

// ─── Pixel Event Builder ─────────────────────────────────────────

type FacebookPixelParams = Record<string, unknown>

function buildPixelParams(event: UnifiedEvent): FacebookPixelParams {
  const params: FacebookPixelParams = {}
  const currency = event.context.currency

  switch (event.event) {
    case 'page_view':
      break

    case 'view_product':
      params.content_ids = [event.item.id]
      params.content_name = event.item.name
      params.content_type = 'product'
      if (event.item.category) params.content_category = event.item.category
      if (currency) params.currency = currency
      if (event.value != null) params.value = event.value
      params.contents = [mapItemToContentItem(event.item)]
      break

    case 'add_to_cart':
      params.content_ids = [event.item.id]
      params.content_type = 'product'
      if (currency) params.currency = currency
      if (event.value != null) params.value = event.value
      params.contents = [mapItemToContentItem(event.item)]
      break

    case 'begin_checkout':
      params.content_ids = extractContentIds(event.items)
      params.contents = event.items.map(mapItemToContentItem)
      params.num_items = event.items.length
      if (currency) params.currency = currency
      if (event.value != null) params.value = event.value
      break

    case 'purchase':
      params.content_ids = extractContentIds(event.items)
      params.content_type = 'product'
      params.contents = event.items.map(mapItemToContentItem)
      params.currency = currency
      params.value = event.value
      params.num_items = event.items.length
      break

    case 'lead':
      if (currency) params.currency = currency
      if (event.value != null) params.value = event.value
      break

    case 'sign_up':
      params.status = true
      break
  }

  return params
}

// ─── CAPI Event Builder ──────────────────────────────────────────

function buildCapiEvent(event: UnifiedEvent, hashFn: (v: string) => string): FacebookCapiServerEvent {
  const pixelParams = buildPixelParams(event)

  const serverEvent: FacebookCapiServerEvent = {
    event_name: EVENT_NAMES[event.event],
    // Facebook: Unix timestamp em segundos
    event_time: Math.floor(new Date(event.context.timestamp).getTime() / 1000),
    action_source: ACTION_SOURCE_MAP['web'],
    user_data: event.user
      ? mapUserDataToFacebook(event.user, hashFn)
      : { client_ip_address: '0.0.0.0' }, // pelo menos 1 campo obrigatório
    event_id: event.context.eventId,
    event_source_url: event.context.sourceUrl,
    custom_data: pixelParams as FacebookCapiCustomData,
  }

  // User agent obrigatório para website
  if (event.user?.userAgent) {
    serverEvent.client_user_agent = event.user.userAgent
  }

  return serverEvent
}

// ─── Facebook Mapper (implementação) ─────────────────────────────

export class FacebookMapper implements PlatformMapper<FacebookPixelParams, FacebookCapiServerEvent> {
  readonly platform = 'facebook'

  mapEventName(internalName: UnifiedEventName, _target: 'pixel' | 'capi'): string {
    // Facebook usa o mesmo nome para Pixel e CAPI
    return EVENT_NAMES[internalName]
  }

  mapItem(item: UnifiedItem): FacebookPixelContentItem {
    return mapItemToContentItem(item)
  }

  mapUserData(user: UnifiedUserData): FacebookCapiUserData {
    return mapUserDataToFacebook(user, this.hashPii)
  }

  hashPii(value: string): string {
    return `sha256:${value}`
  }

  toPixelEvent(event: UnifiedEvent): PlatformPixelOutput<FacebookPixelParams> {
    return {
      eventName: this.mapEventName(event.event, 'pixel'),
      params: buildPixelParams(event),
      eventId: event.context.eventId,
    }
  }

  toCapiEvent(event: UnifiedEvent): FacebookCapiServerEvent {
    return buildCapiEvent(event, this.hashPii)
  }
}

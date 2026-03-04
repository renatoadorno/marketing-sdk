import type { UnifiedEvent, UnifiedEventName, UnifiedEventContext, UnifiedActionSource } from '../types/unified-events'
import type { CustomDataFields } from '../builders/custom-data'
import type { UserData } from '../builders/user-data'
import type { CustomData } from '../builders/custom-data'
import { sha256 } from './hash'

function sanitizeEventId(eventId?: string): string | undefined {
  if (!eventId) return undefined
  if (eventId.length <= 64) return eventId
  return sha256(eventId).slice(0, 64)
}

export interface TrackerDefaults {
  sourceUrl?: string
  actionSource?: UnifiedActionSource
}

export interface TrackOptions {
  userData?: UserData
  customData?: CustomData
  sourceUrl?: string
  actionSource?: UnifiedActionSource
  eventId?: string
  returnClientPayloads?: boolean
}

export function assembleEvent(
  eventName: UnifiedEventName,
  options: TrackOptions,
  defaults: TrackerDefaults,
): UnifiedEvent {
  const userData = options.userData?.toUnifiedUserData()
  const customFields = options.customData?.getData()
  const currency = customFields?.currency

  const context: UnifiedEventContext = {
    eventId: sanitizeEventId(options.eventId) ?? crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    sourceUrl: options.sourceUrl ?? defaults.sourceUrl,
    actionSource: options.actionSource ?? defaults.actionSource ?? 'web',
    currency,
  }

  switch (eventName) {
    case 'page_view':
      return { event: 'page_view', context, user: userData }

    case 'view_product':
      return {
        event: 'view_product',
        context,
        user: userData,
        item: customFields?.items[0] ?? { id: '', name: '' },
        value: customFields?.value,
      }

    case 'add_to_cart':
      return {
        event: 'add_to_cart',
        context,
        user: userData,
        item: customFields?.items[0] ?? { id: '', name: '' },
        value: customFields?.value,
      }

    case 'begin_checkout':
      return {
        event: 'begin_checkout',
        context,
        user: userData,
        items: customFields?.items ?? [],
        value: customFields?.value,
        coupon: customFields?.coupon,
      }

    case 'purchase':
      return {
        event: 'purchase',
        context,
        user: userData,
        transactionId: customFields?.transactionId ?? '',
        value: customFields?.value ?? 0,
        tax: customFields?.tax,
        shipping: customFields?.shipping,
        coupon: customFields?.coupon,
        discountCode: customFields?.discountCode,
        isNewCustomer: customFields?.isNewCustomer,
        items: customFields?.items ?? [],
      }

    case 'lead':
      return {
        event: 'lead',
        context,
        user: userData,
        value: customFields?.value,
        type: customFields?.type,
        category: customFields?.category,
      }

    case 'sign_up':
      return {
        event: 'sign_up',
        context,
        user: userData,
        method: customFields?.method,
      }
  }
}

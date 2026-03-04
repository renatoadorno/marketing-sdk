import type { UnifiedEvent } from '../types/unified-events'
import type { TrackWarning } from '../types/track-result'

export function validateEvent(event: UnifiedEvent, hasGoogle: boolean): TrackWarning[] {
  const warnings: TrackWarning[] = []

  if (!event.user) {
    warnings.push({ message: 'Nenhum dado de usuario fornecido. Matching quality sera baixa em todas as plataformas.' })
  }

  if (!event.context.sourceUrl) {
    warnings.push({
      destination: 'facebook',
      field: 'sourceUrl',
      message: 'sourceUrl ausente. Obrigatorio para Facebook quando action_source e "website".',
    })
  }

  if (hasGoogle && !event.user?.gaClientId) {
    warnings.push({
      destination: 'google',
      field: 'gaClientId',
      message: 'gaClientId (cookie _ga) ausente. Eventos Google serao atribuidos a usuario desconhecido.',
    })
  }

  switch (event.event) {
    case 'purchase':
      if (!event.items || event.items.length === 0) {
        warnings.push({ field: 'items', message: 'Purchase sem items. Dados de produto nao serao enviados.' })
      }
      if (!event.transactionId) {
        warnings.push({ field: 'transactionId', message: 'Purchase sem transactionId. Deduplicacao por pedido nao funcionara.' })
      }
      if (!event.context.currency) {
        warnings.push({ field: 'currency', message: 'Purchase sem currency. Obrigatorio para Facebook e Google.' })
      }
      break

    case 'add_to_cart':
      if (!event.item || !event.item.id) {
        warnings.push({ field: 'item', message: 'AddToCart sem item. Dados de produto nao serao enviados.' })
      }
      break

    case 'view_product':
      if (!event.item || !event.item.id) {
        warnings.push({ field: 'item', message: 'ViewProduct sem item. Dados de produto nao serao enviados.' })
      }
      break

    case 'begin_checkout':
      if (!event.items || event.items.length === 0) {
        warnings.push({ field: 'items', message: 'BeginCheckout sem items. Dados de produto nao serao enviados.' })
      }
      break
  }

  return warnings
}

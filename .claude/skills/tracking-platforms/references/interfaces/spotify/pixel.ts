/**
 * Spotify Ads — Pixel (Client-Side)
 *
 * Função global: w.spdt('evento', { params })
 * Script: https://pixel.byspotify.com/ping.min.js
 *
 * Nomenclatura: lowercase sem separador (ex: addtocart, checkout)
 */

// ─── Parâmetros por Evento ──────────────────────────────────────

/** Page View — Já incluso no base code. Sem parâmetros adicionais. */
export interface SpotifyPixelPageView {
  // Disparado automaticamente pelo base code: w.spdt('view')
  // Nenhum parâmetro adicional
}

/** View Product — Visualização de página de produto */
export interface SpotifyPixelProduct {
  value?: number
  currency?: string
  product_id?: string
  product_name?: string
  product_type?: string
  product_vendor?: string
  event_id?: string
}

/** Lead — Submissão de interesse (ex: newsletter, formulário) */
export interface SpotifyPixelLead {
  type?: string
  category?: string
  currency?: string
  value?: number
  event_id?: string
}

/** Sign Up — Registro/cadastro */
export interface SpotifyPixelSignUp {
  event_id?: string
}

/** Add to Cart — Item adicionado ao carrinho */
export interface SpotifyPixelAddToCart {
  value?: number
  currency?: string
  quantity?: number
  product_id?: string
  product_name?: string
  product_type?: string
  product_vendor?: string
  variant_id?: string
  variant_name?: string
  event_id?: string
}

/** Start Checkout — Início do processo de checkout */
export interface SpotifyPixelCheckout {
  value?: number
  currency?: string
  quantity?: number
  line_items?: SpotifyPixelLineItem[]
  event_id?: string
}

/** Purchase — Compra finalizada (página de confirmação) */
export interface SpotifyPixelPurchase {
  value?: number
  currency?: string
  discount_code?: string
  is_new_customer?: boolean
  line_items?: SpotifyPixelLineItem[]
  event_id?: string
}

/** Alias — Identificação do cliente */
export interface SpotifyPixelAlias {
  email?: string
  phone_number?: string
}

/** Custom Event — Eventos personalizados (máx 5, não renomeáveis) */
export interface SpotifyPixelCustomEvent {
  [key: string]: unknown
}

// ─── Tipos auxiliares ────────────────────────────────────────────

export interface SpotifyPixelLineItem {
  value?: number
  quantity?: number
  [key: string]: unknown
}

// ─── Mapa de eventos ─────────────────────────────────────────────

export interface SpotifyPixelEvents {
  view: SpotifyPixelPageView
  product: SpotifyPixelProduct
  lead: SpotifyPixelLead
  signup: SpotifyPixelSignUp
  addtocart: SpotifyPixelAddToCart
  checkout: SpotifyPixelCheckout
  purchase: SpotifyPixelPurchase
  alias: SpotifyPixelAlias
  custom_event_1: SpotifyPixelCustomEvent
  custom_event_2: SpotifyPixelCustomEvent
  custom_event_3: SpotifyPixelCustomEvent
  custom_event_4: SpotifyPixelCustomEvent
  custom_event_5: SpotifyPixelCustomEvent
}

/**
 * Spotify Ads — Conversions API (Server-Side)
 *
 * Endpoint: POST https://capi.spotify.com/capi-direct/events/
 * Auth: Bearer token (não expira, máx 3 ativos)
 *
 * Nomenclatura dos eventos: UPPER_SNAKE_CASE (ex: PURCHASE, ADD_TO_CART)
 */

// ─── Request Body ────────────────────────────────────────────────

/** Corpo principal do request para a CAPI */
export interface SpotifyCapiRequestBody {
  conversion_events: {
    /** UUID do Connection ID (obrigatório) */
    capi_connection_id: string
    /** Lista de eventos de conversão (obrigatório) */
    events: SpotifyCapiEvent[]
  }
}

// ─── Evento de Conversão ─────────────────────────────────────────

export type SpotifyCapiEventName =
  | 'PRODUCT'
  | 'CHECK_OUT'
  | 'ADD_TO_CART'
  | 'PURCHASE'
  | 'LEAD'
  | 'ALIAS'
  | 'SIGN_UP'
  | 'CUSTOM_EVENT_1'
  | 'CUSTOM_EVENT_2'
  | 'CUSTOM_EVENT_3'
  | 'CUSTOM_EVENT_4'
  | 'CUSTOM_EVENT_5'

export type SpotifyCapiActionSource = 'WEB' | 'APP' | 'OFFLINE'

export interface SpotifyCapiEvent {
  /** ID único do evento — usado para deduplicação (obrigatório) */
  event_id: string
  /** Nome do evento de conversão (obrigatório) */
  event_name: SpotifyCapiEventName
  /** Timestamp RFC 3339 — deve estar no passado (obrigatório) */
  event_time: string
  /** Dados do usuário — pelo menos 1 identificador obrigatório */
  user_data: SpotifyCapiUserData
  /** URL onde o evento ocorreu */
  event_source_url?: string
  /** Meio da conversão */
  action_source?: SpotifyCapiActionSource
  /** Se true, evento usado apenas para atribuição (não retargeting) */
  opt_out_targeting?: boolean
  /** Detalhes adicionais do evento */
  event_details?: SpotifyCapiEventDetails
}

// ─── User Data ───────────────────────────────────────────────────

/** Pelo menos 1 campo é obrigatório */
export interface SpotifyCapiUserData {
  /** Emails do cliente hasheados em SHA-256 */
  hashed_emails?: string[]
  /** Device ID raw do dispositivo (recomendado) */
  device_id?: string
  /** Telefone hasheado em SHA-256 */
  hashed_phone_number?: string
  /** IP do dispositivo do cliente (recomendado) */
  ip_address?: string
}

// ─── Event Details ───────────────────────────────────────────────

export interface SpotifyCapiEventDetails {
  /** Valor monetário — obrigatório para PURCHASE */
  amount?: number
  /** Código de moeda ISO 4217 — obrigatório para PURCHASE */
  currency?: string
  /** Nome do produto/página */
  content_name?: string
  /** Categoria — alinhar com Google Product Taxonomy */
  content_category?: string
}

// ─── Resposta ────────────────────────────────────────────────────

export interface SpotifyCapiResponse {
  message: 'SUCCESS' | string
}

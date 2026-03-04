/**
 * Google Analytics 4 — Measurement Protocol (Server-Side)
 *
 * Endpoint: POST https://www.google-analytics.com/mp/collect
 *           ?measurement_id=G-XXXXXXXXXX&api_secret=SEU_SECRET
 *
 * Nomenclatura dos eventos: snake_case (mesma do gtag)
 * Ex: purchase, add_to_cart, view_item
 */

import type { GoogleGtagItem } from './pixel'

// ─── Request Body ────────────────────────────────────────────────

/** Corpo principal do request para o Measurement Protocol */
export interface GoogleMPRequestBody {
  /** Identificador único do browser/dispositivo — cookie _ga (obrigatório) */
  client_id: string
  /** ID interno do usuário logado (opcional, máx 256 chars) */
  user_id?: string
  /** Dados do usuário com hash para enhanced matching */
  user_data?: GoogleMPUserData
  /** Propriedades segmentáveis do usuário (até 25) */
  user_properties?: Record<string, { value: string | number }>
  /** Timestamp Unix em microssegundos (opcional, máx 72h no passado) */
  timestamp_micros?: number
  /** Array de eventos (obrigatório, máx 25 por request) */
  events: GoogleMPEvent[]
}

// ─── Evento ──────────────────────────────────────────────────────

export interface GoogleMPEvent {
  /** Nome do evento — snake_case, máx 40 chars (obrigatório) */
  name: string
  /** Parâmetros do evento (máx 25 por evento) */
  params: GoogleMPEventParams
}

/** Parâmetros comuns + específicos do evento */
export interface GoogleMPEventParams {
  /** ID da sessão — sem ele, aparece como "(not set)" */
  session_id?: string
  /** Tempo de engajamento em ms — necessário para relatórios Realtime */
  engagement_time_msec?: number

  // === Parâmetros de e-commerce ===

  /** ID único do pedido — previne duplicação */
  transaction_id?: string
  /** Moeda ISO 4217 (obrigatório quando value é definido) */
  currency?: string
  /** Valor monetário — soma de price × quantity dos items */
  value?: number
  /** Impostos */
  tax?: number
  /** Frete */
  shipping?: number
  /** Cupom aplicado */
  coupon?: string
  /** Tipo de cliente */
  customer_type?: string
  /** Tier de frete */
  shipping_tier?: string
  /** Tipo de pagamento */
  payment_type?: string
  /** Termo de busca */
  search_term?: string
  /** Método (login, sign_up) */
  method?: string

  // === Promoções ===
  creative_name?: string
  creative_slot?: string
  promotion_id?: string
  promotion_name?: string

  // === Listas ===
  item_list_id?: string
  item_list_name?: string

  /** Produtos/itens do evento */
  items?: GoogleGtagItem[]

  /** Parâmetros custom (até 25 por evento, nomes máx 40 chars) */
  [key: string]: unknown
}

// ─── User Data (Enhanced Matching) ───────────────────────────────

/**
 * Dados PII do usuário — sempre com hash SHA-256 em hex.
 * user_id é OBRIGATÓRIO quando user_data é fornecido.
 *
 * Normalizar antes do hash:
 * - Remover espaços no início e fim
 * - Converter para minúsculas
 * - Telefone: formato E.164 (ex: +5511999999999)
 * - Email: remover pontos antes de @ em gmail.com/googlemail.com
 */
export interface GoogleMPUserData {
  /** Email hasheado SHA-256 — até 3 */
  sha256_email_address?: string | string[]
  /** Telefone hasheado SHA-256 (E.164) — até 3 */
  sha256_phone_number?: string | string[]
  /** Endereço — até 2 */
  address?: GoogleMPUserAddress | GoogleMPUserAddress[]
}

export interface GoogleMPUserAddress {
  /** Primeiro nome hasheado SHA-256 */
  sha256_first_name?: string
  /** Sobrenome hasheado SHA-256 */
  sha256_last_name?: string
  /** Rua hasheada SHA-256 */
  sha256_street?: string
  /** Cidade (sem hash) */
  city?: string
  /** Estado/região (sem hash) */
  region?: string
  /** CEP (sem hash) */
  postal_code?: string
  /** País ISO 3166-1 alpha-2 (sem hash) */
  country?: string
}

// ─── Geolocalização e Dispositivo (opcionais) ────────────────────

export interface GoogleMPUserLocation {
  city?: string
  /** Região no formato ISO (ex: BR-SP) */
  region_id?: string
  /** País ISO 3166-1 alpha-2 (ex: BR) */
  country_id?: string
}

export interface GoogleMPDevice {
  /** mobile, desktop, tablet */
  category?: string
  /** Idioma (ex: pt-br) */
  language?: string
  /** Sistema operacional */
  operating_system?: string
  /** Navegador */
  browser?: string
}

/** Request body estendido com geolocalização e dispositivo */
export interface GoogleMPRequestBodyFull extends GoogleMPRequestBody {
  user_location?: GoogleMPUserLocation
  device?: GoogleMPDevice
}

// ─── Parâmetros de URL (query string) ────────────────────────────

/** Parâmetros obrigatórios na URL do endpoint */
export interface GoogleMPQueryParams {
  /** ID de métricas do fluxo Web (formato G-XXXXXXXXXX) */
  measurement_id: string
  /** Chave secreta da API */
  api_secret: string
}

// ─── Debug / Validação ───────────────────────────────────────────

/**
 * Endpoint de validação:
 * POST https://www.google-analytics.com/debug/mp/collect?measurement_id=...&api_secret=...
 *
 * Usar para debug antes de enviar para produção.
 * O endpoint de produção retorna 204 e NÃO reporta erros de dados inválidos.
 */
export interface GoogleMPValidationResponse {
  validationMessages: GoogleMPValidationMessage[]
}

export interface GoogleMPValidationMessage {
  fieldPath: string
  description: string
  validationCode: string
}

/**
 * Facebook (Meta) — Conversions API / CAPI (Server-Side)
 *
 * Endpoint: POST https://graph.facebook.com/v21.0/{PIXEL_ID}/events?access_token=...
 *
 * Nomenclatura dos eventos: PascalCase (mesma do Pixel)
 * Ex: Purchase, AddToCart, InitiateCheckout
 */

// ─── Request Body ────────────────────────────────────────────────

/** Corpo principal do request para a CAPI */
export interface FacebookCapiRequestBody {
  /** Array de eventos do servidor (obrigatório) */
  data: FacebookCapiServerEvent[]
  /** Código para teste sem afetar métricas reais */
  test_event_code?: string
}

// ─── Server Event ────────────────────────────────────────────────

export type FacebookCapiActionSource =
  | 'website'
  | 'app'
  | 'email'
  | 'phone_call'
  | 'chat'
  | 'physical_store'
  | 'system_generated'
  | 'business_messaging'
  | 'other'

export type FacebookCapiStandardEventName =
  | 'AddPaymentInfo'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'CompleteRegistration'
  | 'Contact'
  | 'CustomizeProduct'
  | 'Donate'
  | 'FindLocation'
  | 'InitiateCheckout'
  | 'Lead'
  | 'Purchase'
  | 'Schedule'
  | 'Search'
  | 'StartTrial'
  | 'SubmitApplication'
  | 'Subscribe'
  | 'ViewContent'

export type FacebookCapiCustomerSegmentation =
  | 'new_customer_to_business'
  | 'existing_customer_to_business'
  | 'customer_in_loyalty_program'

export interface FacebookCapiServerEvent {
  /** Nome do evento — padrão ou custom (obrigatório) */
  event_name: FacebookCapiStandardEventName | string
  /** Timestamp Unix em segundos GMT — máx 7 dias no passado (obrigatório) */
  event_time: number
  /** Dados do cliente para matching — pelo menos 1 campo (obrigatório) */
  user_data: FacebookCapiUserData
  /** Indica onde a conversão ocorreu (obrigatório) */
  action_source: FacebookCapiActionSource

  /** URL do navegador onde o evento aconteceu (obrigatório para website) */
  event_source_url?: string
  /** User agent do navegador (obrigatório para website) */
  client_user_agent?: string
  /** ID único para deduplicação — deve bater com eventID do Pixel */
  event_id?: string
  /** Dados adicionais de negócio */
  custom_data?: FacebookCapiCustomData
  /** Se true, evento usado apenas para atribuição */
  opt_out?: boolean
  /** Header HTTP referrer */
  referrer_url?: string
  /** Para associar eventos atrasados a um evento anterior */
  original_event_data?: FacebookCapiOriginalEventData
  /** Segmento do cliente */
  customer_segmentation?: FacebookCapiCustomerSegmentation
  /** Limited Data Use */
  data_processing_options?: ('LDU')[]
  /** 1 = EUA, 0 = geolocalização (obrigatório se LDU) */
  data_processing_options_country?: number
  /** 1000 = Califórnia, 0 = geolocalização (obrigatório se LDU sem IP) */
  data_processing_options_state?: number
  /** Info do app e dispositivo (obrigatório para eventos de app) */
  app_data?: FacebookCapiAppData
}

// ─── User Data ───────────────────────────────────────────────────

/**
 * Pelo menos 1 campo é obrigatório.
 * Campos com hash: normalizar para lowercase, sem espaços, antes de SHA-256.
 * Se usar o Business SDK, o hash é automático.
 */
export interface FacebookCapiUserData {
  // === Campos que EXIGEM hash SHA-256 ===

  /** Email — lowercase, sem espaços, SHA-256 */
  em?: string
  /** Telefone — apenas números + código país, SHA-256 */
  ph?: string
  /** Primeiro nome — lowercase, sem pontuação, SHA-256 */
  fn?: string
  /** Sobrenome — lowercase, sem pontuação, SHA-256 */
  ln?: string
  /** Data de nascimento — formato YYYYMMDD, SHA-256 */
  db?: string
  /** Gênero — 'f' ou 'm', SHA-256 */
  ge?: string
  /** Cidade — lowercase, sem espaços/pontuação, SHA-256 */
  ct?: string
  /** Estado — código 2 chars lowercase, SHA-256 */
  st?: string
  /** CEP — lowercase, sem traço, SHA-256 */
  zp?: string
  /** País — ISO 3166-1 alpha-2 lowercase, SHA-256 */
  country?: string

  // === Hash recomendado (não obrigatório) ===

  /** ID do usuário no seu sistema — hash recomendado */
  external_id?: string

  // === NÃO hashear ===

  /** IP do navegador (IPV4 ou IPV6) — obrigatório configurar manualmente no server */
  client_ip_address?: string
  /** User agent do navegador — obrigatório para website */
  client_user_agent?: string
  /** Click ID do Meta — cookie _fbc */
  fbc?: string
  /** Browser ID do Meta — cookie _fbp */
  fbp?: string
  /** ID de assinatura */
  subscription_id?: string
  /** App-Scoped ID do Facebook Login */
  fb_login_id?: string
  /** ID de lead do Lead Ads */
  lead_id?: string
  /** ID de instalação do app (apenas app events) */
  anon_id?: string
  /** Mobile Advertiser ID / IDFA (apenas app events) */
  madid?: string
  /** ID da página do Facebook (para bots) */
  page_id?: string
  /** ID do usuário no escopo da página (Messenger) */
  page_scoped_user_id?: string
  /** Click ID para ads → WhatsApp */
  ctwa_clid?: string
  /** ID da conta Instagram */
  ig_account_id?: string
  /** Instagram-Scoped User ID (webhook) */
  ig_sid?: string
}

// ─── Custom Data ─────────────────────────────────────────────────

export interface FacebookCapiCustomData {
  /** Valor monetário — obrigatório para Purchase */
  value?: number
  /** Moeda ISO 4217 — obrigatório para Purchase */
  currency?: string
  /** Nome do conteúdo/produto */
  content_name?: string
  /** Categoria do conteúdo */
  content_category?: string
  /** IDs dos produtos */
  content_ids?: (string | number)[]
  /** 'product' ou 'product_group' */
  content_type?: 'product' | 'product_group'
  /** Objetos com id e quantity */
  contents?: { id: string | number; quantity: number; [key: string]: unknown }[]
  /** Número de itens */
  num_items?: number
  /** Tipo de entrega */
  delivery_category?: 'in_store' | 'curbside' | 'home_delivery'
  /** Termo de busca */
  search_string?: string
  /** Status do registro */
  status?: boolean
  /** Lifetime value estimado */
  predicted_ltv?: number
  /** Código de pedido/transação */
  order_id?: string
  /** Parâmetros customizados (chaves sem espaços) */
  [key: string]: unknown
}

// ─── Original Event Data ─────────────────────────────────────────

/** Para associar eventos atrasados a um evento de aquisição original */
export interface FacebookCapiOriginalEventData {
  /** Nome do evento original */
  event_name?: string
  /** Timestamp Unix do evento original */
  event_time?: number
  /** ID do pedido da transação original */
  order_id?: string
  /** ID do evento original */
  event_id?: string
}

// ─── App Data ────────────────────────────────────────────────────

/** Obrigatório para eventos de app */
export interface FacebookCapiAppData {
  advertiser_tracking_enabled?: boolean
  application_tracking_enabled?: boolean
  /**
   * Info estendida do dispositivo — todos os valores obrigatórios.
   * Versão deve ser 'a2' (Android) ou 'i2' (iOS).
   * Use string vazia como placeholder para valores ausentes.
   */
  extinfo?: string[]
  campaign_ids?: string[]
  install_referrer?: string
  installer_package?: string
  url_schemes?: string[]
  windows_attribution_id?: string
  anon_id?: string
  madid?: string
  vendor_id?: string
}

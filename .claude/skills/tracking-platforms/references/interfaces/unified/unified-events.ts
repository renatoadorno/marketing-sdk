/**
 * Schema Unificado — Taxonomia Interna da Aplicação
 *
 * Todos os dados de tracking passam por estes tipos antes de serem
 * convertidos para o formato de cada plataforma via mappers.
 *
 * Nomenclatura interna: snake_case (ex: view_product, add_to_cart)
 */

// ─── Item (Produto/Ingresso) ─────────────────────────────────────

export interface UnifiedItem {
  /** ID do produto/SKU (obrigatório) */
  id: string
  /** Nome do produto (obrigatório) */
  name: string
  /** Preço unitário */
  price?: number
  /** Quantidade (default: 1) */
  quantity?: number
  /** Categoria principal */
  category?: string
  /** Marca/Produtor */
  brand?: string
  /** Variante (ex: setor, tipo de ingresso, cor) */
  variant?: string
  /** Cupom aplicado no item */
  coupon?: string
  /** Valor do desconto unitário */
  discount?: number
  /** Posição em uma lista */
  index?: number
  /** Lista de origem (ex: "resultados de busca", "destaques") */
  listId?: string
  /** Nome da lista de origem */
  listName?: string
}

// ─── User Data (dados raw, antes do hash) ────────────────────────

export interface UnifiedUserData {
  /** Email do cliente (raw — será hasheado pelo mapper) */
  email?: string
  /** Telefone com código do país (ex: +5511999999999) */
  phone?: string
  /** Primeiro nome */
  firstName?: string
  /** Sobrenome */
  lastName?: string
  /** IP do cliente */
  ip?: string
  /** User agent do browser */
  userAgent?: string
  /** ID interno do usuário no seu sistema */
  externalId?: string
  /** Cidade */
  city?: string
  /** Estado (código 2 chars, ex: SP) */
  state?: string
  /** CEP */
  zipCode?: string
  /** País (ISO 3166-1 alpha-2, ex: BR) */
  country?: string
  /** Data de nascimento (YYYYMMDD) */
  birthDate?: string
  /** Gênero ('m' ou 'f') */
  gender?: 'm' | 'f'
  /** Client ID do Google Analytics (cookie _ga) */
  gaClientId?: string
  /** Browser ID do Facebook (cookie _fbp) */
  fbp?: string
  /** Click ID do Facebook (cookie _fbc) */
  fbc?: string
  /** Google Click ID (gclid) */
  gclid?: string
  /** Device ID (mobile) */
  deviceId?: string
}

// ─── Event Context (metadata compartilhado) ──────────────────────

export type UnifiedActionSource = 'web' | 'app' | 'offline' | 'other'

export interface UnifiedEventContext {
  /** UUID único do evento — usado para deduplicação em TODAS as plataformas */
  eventId: string
  /** Timestamp ISO 8601 (ex: 2026-03-02T10:30:00Z) */
  timestamp: string
  /** URL onde o evento ocorreu */
  sourceUrl?: string
  /** Origem da ação */
  actionSource?: UnifiedActionSource
  /** Moeda ISO 4217 (ex: BRL, USD) — padrão para todos os valores monetários */
  currency?: string
}

// ─── Eventos Tipados ─────────────────────────────────────────────

export interface UnifiedPageView {
  event: 'page_view'
  context: UnifiedEventContext
  user?: UnifiedUserData
}

export interface UnifiedViewProduct {
  event: 'view_product'
  context: UnifiedEventContext
  user?: UnifiedUserData
  /** Produto visualizado */
  item: UnifiedItem
  /** Valor total exibido */
  value?: number
}

export interface UnifiedAddToCart {
  event: 'add_to_cart'
  context: UnifiedEventContext
  user?: UnifiedUserData
  /** Item adicionado */
  item: UnifiedItem
  /** Valor total (price × quantity) */
  value?: number
}

export interface UnifiedBeginCheckout {
  event: 'begin_checkout'
  context: UnifiedEventContext
  user?: UnifiedUserData
  /** Itens no checkout */
  items: UnifiedItem[]
  /** Valor total do checkout */
  value?: number
  /** Cupom aplicado no checkout */
  coupon?: string
}

export interface UnifiedPurchase {
  event: 'purchase'
  context: UnifiedEventContext
  user?: UnifiedUserData
  /** ID único do pedido/transação — permanente */
  transactionId: string
  /** Valor total (soma de price × quantity) — NÃO incluir tax/shipping */
  value: number
  /** Impostos */
  tax?: number
  /** Frete */
  shipping?: number
  /** Cupom aplicado */
  coupon?: string
  /** Código de desconto */
  discountCode?: string
  /** É um novo cliente? */
  isNewCustomer?: boolean
  /** Itens comprados */
  items: UnifiedItem[]
}

export interface UnifiedLead {
  event: 'lead'
  context: UnifiedEventContext
  user?: UnifiedUserData
  /** Valor estimado do lead */
  value?: number
  /** Tipo/categoria do lead */
  type?: string
  /** Categoria */
  category?: string
}

export interface UnifiedSignUp {
  event: 'sign_up'
  context: UnifiedEventContext
  user?: UnifiedUserData
  /** Método de cadastro (ex: email, google, facebook) */
  method?: string
}

// ─── Union Discriminada ──────────────────────────────────────────

export type UnifiedEvent =
  | UnifiedPageView
  | UnifiedViewProduct
  | UnifiedAddToCart
  | UnifiedBeginCheckout
  | UnifiedPurchase
  | UnifiedLead
  | UnifiedSignUp

// ─── Event Name Type ─────────────────────────────────────────────

export type UnifiedEventName = UnifiedEvent['event']

// ─── Event Map (type-safe lookup) ────────────────────────────────

export interface UnifiedEventMap {
  page_view: UnifiedPageView
  view_product: UnifiedViewProduct
  add_to_cart: UnifiedAddToCart
  begin_checkout: UnifiedBeginCheckout
  purchase: UnifiedPurchase
  lead: UnifiedLead
  sign_up: UnifiedSignUp
}

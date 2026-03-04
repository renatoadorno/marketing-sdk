/**
 * Google Analytics 4 — gtag.js (Client-Side)
 *
 * Função global: gtag('event', 'nome_do_evento', { params })
 *
 * Nomenclatura: snake_case (ex: add_to_cart, view_item, purchase)
 */

// ─── Item (compartilhado por todos os eventos de e-commerce) ────

export interface GoogleGtagItem {
  /** SKU ou identificador do produto (obrigatório: item_id OU item_name) */
  item_id?: string
  /** Nome do produto (obrigatório: item_id OU item_name) */
  item_name?: string
  /** Preço unitário (com desconto se aplicável) */
  price?: number
  /** Quantidade (default: 1) */
  quantity?: number
  /** Marca */
  item_brand?: string
  /** Categoria principal */
  item_category?: string
  /** Sub-categorias (até 5 níveis) */
  item_category2?: string
  item_category3?: string
  item_category4?: string
  item_category5?: string
  /** Variante (cor, tamanho, etc.) */
  item_variant?: string
  /** Loja/fornecedor */
  affiliation?: string
  /** Cupom aplicado no item */
  coupon?: string
  /** Valor do desconto unitário */
  discount?: number
  /** Posição em uma lista */
  index?: number
  /** ID da lista de origem */
  item_list_id?: string
  /** Nome da lista de origem */
  item_list_name?: string
  /** Local físico (Google Place ID) */
  location_id?: string
  /** Vertical do negócio (ex: 'retail') */
  google_business_vertical?: string
  /** Parâmetros personalizados (até 27 por item) */
  [key: string]: unknown
}

// ─── Eventos do Funil Principal ──────────────────────────────────

/** view_item — Visualização de página de produto */
export interface GoogleGtagViewItem {
  currency?: string
  value?: number
  items: GoogleGtagItem[]
}

/** view_item_list — Listagem de produtos exibida */
export interface GoogleGtagViewItemList {
  item_list_id?: string
  item_list_name?: string
  items: GoogleGtagItem[]
}

/** select_item — Item selecionado de uma lista */
export interface GoogleGtagSelectItem {
  item_list_id?: string
  item_list_name?: string
  items: GoogleGtagItem[]
}

/** add_to_cart — Item adicionado ao carrinho */
export interface GoogleGtagAddToCart {
  currency?: string
  value?: number
  items: GoogleGtagItem[]
}

/** remove_from_cart — Item removido do carrinho */
export interface GoogleGtagRemoveFromCart {
  currency?: string
  value?: number
  items: GoogleGtagItem[]
}

/** view_cart — Visualização do carrinho */
export interface GoogleGtagViewCart {
  currency?: string
  value?: number
  items: GoogleGtagItem[]
}

/** add_to_wishlist — Item adicionado à lista de desejos */
export interface GoogleGtagAddToWishlist {
  currency?: string
  value?: number
  items: GoogleGtagItem[]
}

/** begin_checkout — Início do checkout */
export interface GoogleGtagBeginCheckout {
  currency?: string
  value?: number
  coupon?: string
  items: GoogleGtagItem[]
}

/** add_shipping_info — Informações de frete preenchidas */
export interface GoogleGtagAddShippingInfo {
  currency?: string
  value?: number
  coupon?: string
  shipping_tier?: string
  items: GoogleGtagItem[]
}

/** add_payment_info — Informações de pagamento preenchidas */
export interface GoogleGtagAddPaymentInfo {
  currency?: string
  value?: number
  coupon?: string
  payment_type?: string
  items: GoogleGtagItem[]
}

/** purchase — Compra finalizada (conversão principal) */
export interface GoogleGtagPurchase {
  /** ID único do pedido — previne duplicação (obrigatório) */
  transaction_id: string
  /** Moeda ISO 4217 (obrigatório) */
  currency: string
  /** Soma de price × quantity dos itens — NÃO incluir shipping/tax (obrigatório) */
  value: number
  /** Impostos */
  tax?: number
  /** Frete */
  shipping?: number
  /** Cupom aplicado */
  coupon?: string
  /** Tipo de cliente */
  customer_type?: 'new' | 'returning'
  /** Produtos comprados (obrigatório) */
  items: GoogleGtagItem[]
}

/** refund — Reembolso (total ou parcial) */
export interface GoogleGtagRefund {
  /** ID do pedido original */
  transaction_id: string
  currency?: string
  value?: number
  /** Items reembolsados (omitir para reembolso total) */
  items?: GoogleGtagItem[]
}

// ─── Eventos Complementares ──────────────────────────────────────

/** generate_lead — Lead gerado */
export interface GoogleGtagGenerateLead {
  currency?: string
  value?: number
}

/** login — Login do usuário */
export interface GoogleGtagLogin {
  method?: string
}

/** sign_up — Cadastro do usuário */
export interface GoogleGtagSignUp {
  method?: string
}

/** search — Pesquisa no site */
export interface GoogleGtagSearch {
  search_term?: string
}

/** view_promotion — Promoção visualizada */
export interface GoogleGtagViewPromotion {
  creative_name?: string
  creative_slot?: string
  promotion_id?: string
  promotion_name?: string
  items?: GoogleGtagItem[]
}

/** select_promotion — Promoção clicada */
export interface GoogleGtagSelectPromotion {
  creative_name?: string
  creative_slot?: string
  promotion_id?: string
  promotion_name?: string
  items?: GoogleGtagItem[]
}

// ─── Mapa de Eventos ─────────────────────────────────────────────

export interface GoogleGtagEvents {
  view_item: GoogleGtagViewItem
  view_item_list: GoogleGtagViewItemList
  select_item: GoogleGtagSelectItem
  add_to_cart: GoogleGtagAddToCart
  remove_from_cart: GoogleGtagRemoveFromCart
  view_cart: GoogleGtagViewCart
  add_to_wishlist: GoogleGtagAddToWishlist
  begin_checkout: GoogleGtagBeginCheckout
  add_shipping_info: GoogleGtagAddShippingInfo
  add_payment_info: GoogleGtagAddPaymentInfo
  purchase: GoogleGtagPurchase
  refund: GoogleGtagRefund
  generate_lead: GoogleGtagGenerateLead
  login: GoogleGtagLogin
  sign_up: GoogleGtagSignUp
  search: GoogleGtagSearch
  view_promotion: GoogleGtagViewPromotion
  select_promotion: GoogleGtagSelectPromotion
}

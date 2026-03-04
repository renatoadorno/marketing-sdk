/**
 * Facebook (Meta) — Pixel (Client-Side)
 *
 * Função global: fbq('track', 'NomeDoEvento', { params })
 *                fbq('trackCustom', 'NomeEvento', { params })
 *
 * Nomenclatura: PascalCase (ex: AddToCart, ViewContent, Purchase)
 */

// ─── Object Properties (parâmetros comuns a vários eventos) ─────

export interface FacebookPixelObjectProperties {
  /** Categoria da página/produto */
  content_category?: string
  /** IDs dos produtos/SKUs */
  content_ids?: (string | number)[]
  /** Nome da página/produto */
  content_name?: string
  /** 'product' ou 'product_group' */
  content_type?: 'product' | 'product_group'
  /** Objetos com id e quantity obrigatórios */
  contents?: FacebookPixelContentItem[]
  /** Moeda do value (ISO 4217) */
  currency?: string
  /** Tipo de entrega */
  delivery_category?: 'in_store' | 'curbside' | 'home_delivery'
  /** Número de itens (usado com InitiateCheckout) */
  num_items?: number
  /** Lifetime value estimado */
  predicted_ltv?: number
  /** Termo de busca (usado com Search) */
  search_string?: string
  /** Status do registro (usado com CompleteRegistration) */
  status?: boolean
  /** Valor monetário — obrigatório para Purchase */
  value?: number
}

export interface FacebookPixelContentItem {
  /** ID do produto (obrigatório) */
  id: string | number
  /** Quantidade (obrigatório) */
  quantity: number
  [key: string]: unknown
}

// ─── Parâmetros por Evento ──────────────────────────────────────

/** AddPaymentInfo — Info de pagamento adicionada no checkout */
export interface FacebookPixelAddPaymentInfo extends FacebookPixelObjectProperties {
  content_ids?: (string | number)[]
  contents?: FacebookPixelContentItem[]
  currency?: string
  value?: number
}

/** AddToCart — Produto adicionado ao carrinho */
export interface FacebookPixelAddToCart extends FacebookPixelObjectProperties {
  content_ids?: (string | number)[]
  content_type?: 'product' | 'product_group'
  /** Obrigatório para Advantage+ catalog ads */
  contents?: FacebookPixelContentItem[]
  currency?: string
  value?: number
}

/** AddToWishlist — Produto adicionado à lista de desejos */
export interface FacebookPixelAddToWishlist extends FacebookPixelObjectProperties {
  content_ids?: (string | number)[]
  contents?: FacebookPixelContentItem[]
  currency?: string
  value?: number
}

/** CompleteRegistration — Formulário de cadastro concluído */
export interface FacebookPixelCompleteRegistration {
  currency?: string
  value?: number
  status?: boolean
}

/** Contact — Pessoa entra em contato */
export interface FacebookPixelContact {
  [key: string]: unknown
}

/** CustomizeProduct — Pessoa personaliza um produto */
export interface FacebookPixelCustomizeProduct {
  [key: string]: unknown
}

/** Donate — Doação realizada */
export interface FacebookPixelDonate {
  [key: string]: unknown
}

/** FindLocation — Busca por localização de loja */
export interface FacebookPixelFindLocation {
  [key: string]: unknown
}

/** InitiateCheckout — Início do checkout */
export interface FacebookPixelInitiateCheckout extends FacebookPixelObjectProperties {
  content_ids?: (string | number)[]
  contents?: FacebookPixelContentItem[]
  currency?: string
  num_items?: number
  value?: number
}

/** Lead — Cadastro/signup concluído */
export interface FacebookPixelLead {
  currency?: string
  value?: number
}

/** Purchase — Compra concluída. currency e value são OBRIGATÓRIOS */
export interface FacebookPixelPurchase {
  /** OBRIGATÓRIO */
  currency: string
  /** OBRIGATÓRIO */
  value: number
  content_ids?: (string | number)[]
  content_type?: 'product' | 'product_group'
  /** Obrigatório para Advantage+ catalog ads */
  contents?: FacebookPixelContentItem[]
  content_name?: string
  content_category?: string
  num_items?: number
}

/** Schedule — Agendamento de visita */
export interface FacebookPixelSchedule {
  [key: string]: unknown
}

/** Search — Busca no site */
export interface FacebookPixelSearch extends FacebookPixelObjectProperties {
  content_ids?: (string | number)[]
  content_type?: 'product' | 'product_group'
  contents?: FacebookPixelContentItem[]
  currency?: string
  search_string?: string
  value?: number
}

/** StartTrial — Início de período de teste */
export interface FacebookPixelStartTrial {
  currency?: string
  predicted_ltv?: number
  value?: number
}

/** SubmitApplication — Candidatura a produto/serviço/programa */
export interface FacebookPixelSubmitApplication {
  [key: string]: unknown
}

/** Subscribe — Assinatura paga */
export interface FacebookPixelSubscribe {
  currency?: string
  predicted_ltv?: number
  value?: number
}

/** ViewContent — Visualização de página de produto/landing page */
export interface FacebookPixelViewContent extends FacebookPixelObjectProperties {
  content_ids?: (string | number)[]
  content_type?: 'product' | 'product_group'
  /** Obrigatório para Advantage+ catalog ads */
  contents?: FacebookPixelContentItem[]
  currency?: string
  value?: number
}

// ─── Options (4º parâmetro do fbq) ──────────────────────────────

/** Opções extras passadas como 4º argumento do fbq('track', ...) */
export interface FacebookPixelTrackOptions {
  /** ID para deduplicação com CAPI */
  eventID?: string
}

// ─── Mapa de eventos ─────────────────────────────────────────────

export interface FacebookPixelEvents {
  AddPaymentInfo: FacebookPixelAddPaymentInfo
  AddToCart: FacebookPixelAddToCart
  AddToWishlist: FacebookPixelAddToWishlist
  CompleteRegistration: FacebookPixelCompleteRegistration
  Contact: FacebookPixelContact
  CustomizeProduct: FacebookPixelCustomizeProduct
  Donate: FacebookPixelDonate
  FindLocation: FacebookPixelFindLocation
  InitiateCheckout: FacebookPixelInitiateCheckout
  Lead: FacebookPixelLead
  Purchase: FacebookPixelPurchase
  Schedule: FacebookPixelSchedule
  Search: FacebookPixelSearch
  StartTrial: FacebookPixelStartTrial
  SubmitApplication: FacebookPixelSubmitApplication
  Subscribe: FacebookPixelSubscribe
  ViewContent: FacebookPixelViewContent
}

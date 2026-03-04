/**
 * Pattern de Mapeamento — Interface Genérica
 *
 * Qualquer nova plataforma implementa PlatformMapper<TPixel, TCapi>.
 * O dispatcher chama toPixelEvent() ou toCapiEvent() sem saber os detalhes.
 */

import type {
  UnifiedEvent,
  UnifiedEventName,
  UnifiedItem,
  UnifiedUserData,
} from './unified-events'

// ─── Mapper Interface ────────────────────────────────────────────

/**
 * Contrato que todo mapper de plataforma deve implementar.
 *
 * TPixelResult — formato de saída para o Pixel (client-side)
 * TCapiResult  — formato de saída para a CAPI (server-side)
 */
export interface PlatformMapper<TPixelResult, TCapiResult> {
  /** Identificador da plataforma */
  readonly platform: string

  /**
   * Converte um evento unificado para o formato do Pixel.
   * Retorna { eventName, params } para ser passado ao SDK client-side.
   */
  toPixelEvent(event: UnifiedEvent): PlatformPixelOutput<TPixelResult>

  /**
   * Converte um evento unificado para o formato da CAPI.
   * Retorna o objeto pronto para enviar ao endpoint server-side.
   */
  toCapiEvent(event: UnifiedEvent): TCapiResult

  /** Converte o nome interno para o nome da plataforma */
  mapEventName(internalName: UnifiedEventName, target: 'pixel' | 'capi'): string

  /** Converte um UnifiedItem para o formato de item da plataforma */
  mapItem(item: UnifiedItem): unknown

  /** Converte UnifiedUserData para o formato de user_data da plataforma (com hash) */
  mapUserData(user: UnifiedUserData): unknown

  /** Aplica SHA-256 em um valor PII (após normalização) */
  hashPii(value: string): string
}

// ─── Output Types ────────────────────────────────────────────────

/** Resultado do mapeamento para Pixel (client-side) */
export interface PlatformPixelOutput<TParams> {
  /** Nome do evento na nomenclatura da plataforma */
  eventName: string
  /** Parâmetros do evento no formato da plataforma */
  params: TParams
  /** ID para deduplicação (enviar como option/metadata no SDK) */
  eventId: string
}

// ─── Event Name Map ──────────────────────────────────────────────

/**
 * Mapa de nomes de evento: interno → plataforma.
 * Cada mapper declara o seu.
 */
export type EventNameMap = Record<UnifiedEventName, string>

// ─── Field Mapping Rule ──────────────────────────────────────────

/**
 * Define uma regra de transformação de campo.
 * Usado internamente pelos mappers para documentar e aplicar transformações.
 *
 * Exemplo:
 * { from: 'id', to: 'item_id' }
 * { from: 'name', to: 'content_name', transform: (v) => String(v) }
 */
export interface FieldMappingRule<TFrom = string, TTo = string> {
  /** Nome do campo no schema unificado */
  from: TFrom
  /** Nome do campo na plataforma de destino */
  to: TTo
  /** Transformação opcional do valor */
  transform?: (value: unknown) => unknown
  /** Se true, o campo é obrigatório na plataforma */
  required?: boolean
}

// ─── Helper Types ────────────────────────────────────────────────

/**
 * Extrai o tipo de um evento específico a partir da union.
 * Uso: ExtractEvent<UnifiedEvent, 'purchase'> → UnifiedPurchase
 */
export type ExtractEvent<TUnion extends { event: string }, TName extends string> =
  TUnion extends { event: TName } ? TUnion : never

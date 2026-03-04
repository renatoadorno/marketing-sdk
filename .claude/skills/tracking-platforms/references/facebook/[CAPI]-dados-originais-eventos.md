# [CAPI] Dados originais do evento (`original_event_data`)

Use `original_event_data` quando o evento é enviado com atraso e precisa ser associado a um evento anterior (ex.: compra aprovada horas depois do clique).

## Campos principais

- `event_name`: nome do evento original (`Purchase`, `Lead`, etc.)
- `event_time`: timestamp Unix (segundos) do evento original
- `order_id`: ID do pedido/transação
- `event_id`: ID único para deduplicação e reconciliação

## Quando usar

- Atraso entre ação do usuário e confirmação no backend
- Reprocessamento de eventos após falha temporária
- Integração CRM/offline com histórico

## Exemplo

```json
{
  "event_name": "Purchase",
  "event_time": 1730390400,
  "action_source": "website",
  "event_id": "PEDIDO_12345",
  "original_event_data": {
    "event_name": "InitiateCheckout",
    "event_time": 1730389800,
    "order_id": "PEDIDO_12345",
    "event_id": "CHK_12345"
  }
}
```

## Boas práticas

- Manter IDs estáveis entre Pixel, CAPI e CRM.
- Garantir timezone coerente (Unix timestamp UTC).
- Não usar `original_event_data` sem necessidade real de atraso/contexto.

# [CAPI] Evento de servidor (essencial)

Estrutura mínima para enviar eventos ao endpoint da Conversions API.

## Campos obrigatórios

- `event_name`
- `event_time` (Unix seconds)
- `action_source` (para e-commerce web: `website`)
- `user_data`

## Campos muito recomendados

- `event_id` (deduplicação com Pixel)
- `custom_data` (`currency`, `value`, `contents`)
- `event_source_url` (eventos de website)

## Exemplo de payload

```json
{
  "data": [
    {
      "event_name": "Purchase",
      "event_time": 1730390400,
      "event_id": "PEDIDO_12345",
      "action_source": "website",
      "event_source_url": "https://loja.com/checkout/sucesso",
      "user_data": {
        "em": "<sha256_email>",
        "ph": "<sha256_phone>",
        "client_user_agent": "<user-agent>",
        "client_ip_address": "203.0.113.10",
        "fbp": "fb.1.1700000000000.123456789",
        "fbc": "fb.1.1700000000000.AbCdEf"
      },
      "custom_data": {
        "currency": "BRL",
        "value": 199.9,
        "contents": [
          { "id": "SKU_001", "quantity": 2, "item_price": 99.95 }
        ]
      }
    }
  ]
}
```

## Regras críticas

- `event_time` não pode ser antigo demais (janela limitada pela Meta).
- `event_id` deve bater com `eventID` no Pixel para deduplicar.
- Nunca enviar PII sem hash nos campos que exigem hash.

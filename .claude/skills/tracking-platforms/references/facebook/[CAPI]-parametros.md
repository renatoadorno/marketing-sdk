# [CAPI] Parâmetros (visão essencial)

Estrutura mínima de envio para website:

```json
{
  "data": [
    {
      "event_name": "Purchase",
      "event_time": 1730390400,
      "event_id": "PEDIDO_12345",
      "action_source": "website",
      "event_source_url": "https://loja.com/checkout/sucesso",
      "user_data": { "em": "<sha256_email>", "client_user_agent": "<ua>" },
      "custom_data": { "currency": "BRL", "value": 199.9 }
    }
  ]
}
```

## Blocos importantes

- `event_name` + `event_time`: identifica o que aconteceu e quando
- `event_id`: deduplicação com Pixel
- `action_source`: origem da conversão (`website`, `app`, etc.)
- `user_data`: dados para match
- `custom_data`: contexto comercial (valor, moeda, itens)

## Para e-commerce

- Obrigatório na prática: `event_name`, `event_time`, `action_source`, `user_data`
- Fortemente recomendado: `event_id`, `event_source_url`, `currency`, `value`, `contents`

## Checklist rápido

- Hash correta nos campos sensíveis
- `currency` coerente com `value`
- `event_id` igual ao `eventID` no Pixel

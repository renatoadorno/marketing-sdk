# [CAPI] Informações do cliente (`user_data`)

`user_data` é a base de correspondência (match) do evento com usuários Meta.

## Campos principais para e-commerce

- Hash obrigatória: `em`, `ph`, `fn`, `ln`, `ct`, `st`, `zp`, `country`
- Sem hash: `client_ip_address`, `client_user_agent`, `fbp`, `fbc`
- Recomendado: `external_id` (hash recomendada)

## Regras de formatação

- Normalizar antes de hash (lowercase, sem espaços extras, formato correto).
- Usar SHA-256 para campos que exigem hash.
- Sempre enviar `client_user_agent` e, quando possível, `client_ip_address`.

## Exemplo enxuto

```json
"user_data": {
  "em": "<sha256_email>",
  "ph": "<sha256_phone>",
  "external_id": "<sha256_customer_id>",
  "client_user_agent": "<user-agent>",
  "client_ip_address": "203.0.113.10",
  "fbp": "fb.1.1700000000000.123456789",
  "fbc": "fb.1.1700000000000.AbCdEf"
}
```

## Prioridade prática

1. `em` + `ph`
2. `fbp` + `fbc`
3. `external_id`

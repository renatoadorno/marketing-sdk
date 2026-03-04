# [CAPI] `external_id` (essencial)

`external_id` é o identificador do usuário no seu sistema (ex.: ID do cliente, loyalty ID).

## Para que serve

- Melhorar taxa de match entre canais
- Reforçar deduplicação e reconciliação de identidade
- Ajudar criação de audiências com consistência entre fontes

## Como usar corretamente

1. Defina um ID estável por usuário no seu backend.
2. Envie o mesmo valor no Pixel e no CAPI para o mesmo usuário.
3. Mantenha o formato consistente ao longo do tempo.

## Exemplo

```json
"user_data": {
  "external_id": "<sha256_customer_id>",
  "fbp": "fb.1.1700000000000.123456789"
}
```

## Boas práticas

- Hash recomendado para `external_id`.
- Não reutilizar IDs entre usuários diferentes.
- Atualizar mapeamentos quando houver merge de contas internas.

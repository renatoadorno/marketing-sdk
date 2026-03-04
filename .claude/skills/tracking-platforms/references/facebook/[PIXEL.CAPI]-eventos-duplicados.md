# [PIXEL + CAPI] Deduplicação de eventos

Quando Pixel e CAPI enviam o mesmo evento, é obrigatório deduplicar.

## Método recomendado

Deduplicar por:
- nome do evento (`event` no Pixel e `event_name` no CAPI)
- ID do evento (`eventID` no Pixel e `event_id` no CAPI)

## Exemplo (browser)

```js
fbq('track', 'Purchase', { value: 199.9, currency: 'BRL' }, { eventID: 'PEDIDO_12345' });
```

## Exemplo (server)

```json
{
  "event_name": "Purchase",
  "event_id": "PEDIDO_12345"
}
```

## Regras importantes

- IDs devem ser idênticos entre browser e servidor.
- Use janela curta entre os dois envios (idealmente quase simultâneo).
- Sem `event_id/eventID` igual, a chance de duplicidade aumenta.

## Erros comuns

- Gerar ID diferente no front e no back.
- Reenviar eventos de retry sem idempotência.
- Disparar `Purchase` duas vezes em refresh de página de obrigado.

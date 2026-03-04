# [GTAG] Evento `purchase` (essencial)

Use o evento `purchase` para registrar a conversão final do pedido no GA4.

## Quando disparar

Dispare apenas quando o pagamento/pedido estiver confirmado (página de sucesso ou retorno confirmado do backend).

## Parâmetros obrigatórios na prática

- `transaction_id` (string única por pedido)
- `currency` (ex.: `BRL`)
- `value` (valor total da compra)
- `items` (array com produtos)

## Parâmetros importantes recomendados

- `tax`
- `shipping`
- `coupon`
- Em cada item: `item_id`, `item_name`, `price`, `quantity`

## Exemplo objetivo

```html
<script>
  gtag('event', 'purchase', {
    transaction_id: 'PEDIDO_12345',
    currency: 'BRL',
    value: 199.90,
    tax: 0,
    shipping: 15,
    coupon: 'CUPOM10',
    items: [
      {
        item_id: 'SKU_CAMISA_001',
        item_name: 'Camiseta Preta',
        price: 99.95,
        quantity: 2
      }
    ]
  });
</script>
```

## Regras críticas de qualidade de dados

- `transaction_id` deve ser único e estável.
- Não disparar `purchase` duas vezes para o mesmo pedido.
- `value` deve bater com a soma dos itens (mais ajustes de frete/impostos conforme sua regra).
- `currency` deve seguir ISO 4217 (`BRL`, `USD`, etc.).

## Checklist de validação

- Evento aparece no DebugView com todos os parâmetros.
- Pedido de teste aparece em Monetização/Compras.
- Valor e quantidade conferem com o pedido real.

---

Referência oficial:
- https://developers.google.com/analytics/devguides/collection/ga4/set-up-ecommerce

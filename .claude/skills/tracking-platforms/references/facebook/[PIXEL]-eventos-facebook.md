# [PIXEL] Eventos padrão essenciais

## Eventos recomendados (e-commerce)

- `ViewContent`: visualização de produto
- `AddToCart`: adição ao carrinho
- `InitiateCheckout`: início do checkout
- `AddPaymentInfo`: envio de pagamento
- `Purchase`: compra concluída

## Parâmetros mais usados

- `currency`
- `value`
- `contents` (itens e quantidades)
- `content_ids`
- `content_type`
- `num_items` (checkout)

## Exemplo objetivo

```js
fbq('track', 'AddToCart', {
  currency: 'BRL',
  value: 99.95,
  content_type: 'product',
  content_ids: ['SKU_001'],
  contents: [{ id: 'SKU_001', quantity: 1 }]
});
```

## Dica de consistência

Use os mesmos IDs de produto no catálogo, Pixel e CAPI para melhorar qualidade de atribuição.

# [PIXEL] Conversion tracking (essencial)

Use o Pixel para medir ações do funil e alimentar otimização de campanhas.

## Formas de rastrear

1. Eventos padrão (`fbq('track', ...)`)
2. Eventos customizados (`fbq('trackCustom', ...)`)
3. Conversões customizadas por regra de URL

## Eventos-chave para e-commerce

- `ViewContent`
- `AddToCart`
- `InitiateCheckout`
- `Purchase`

## Exemplo: compra

```js
fbq('track', 'Purchase', {
  value: 199.9,
  currency: 'BRL',
  contents: [{ id: 'SKU_001', quantity: 2 }],
  content_type: 'product'
});
```

## Onde disparar

- Em carregamento de página de sucesso, ou
- Após confirmação real no frontend

Evite disparar antes da confirmação final do pedido.

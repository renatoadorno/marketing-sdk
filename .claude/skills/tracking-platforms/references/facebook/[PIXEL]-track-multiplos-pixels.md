# [PIXEL] Múltiplos pixels sem overfiring

Quando há mais de um Pixel na página, `track` pode disparar eventos para todos os pixels inicializados.

## Comportamento

- `fbq('track', ...)`: envia para todos os pixels inicializados
- `fbq('trackSingle', pixelId, ...)`: envia para um pixel específico
- `fbq('trackSingleCustom', pixelId, ...)`: custom event para um pixel específico

## Exemplo prático

```js
fbq('init', 'PIXEL_A');
fbq('init', 'PIXEL_B');
fbq('track', 'PageView'); // ambos

fbq('trackSingle', 'PIXEL_A', 'Purchase', { value: 199.9, currency: 'BRL' });
fbq('trackSingleCustom', 'PIXEL_B', 'Step4');
```

## Checklist

- Use `trackSingle` quando cada time/parceiro tiver pixel próprio.
- Evite duplicar base code sem necessidade.
- Valide no Events Manager qual pixel recebeu cada evento.

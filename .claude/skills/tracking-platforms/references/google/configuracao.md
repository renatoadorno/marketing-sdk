# Configuração essencial (GA4 + gtag)

Este guia resume o mínimo necessário para começar o tracking de e-commerce com Google Analytics 4 via `gtag.js`.

## 1) Pré-requisitos

- Propriedade GA4 criada.
- Fluxo Web criado.
- `measurement_id` (formato `G-XXXXXXXXXX`).
- Acesso ao código do site e ao GTM/gtag.

## 2) Tag base no site

Adicione no `<head>` de todas as páginas:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 3) Padrões recomendados para e-commerce

- Sempre enviar `currency` junto com `value`.
- Enviar `items` com `item_id` ou `item_name` (ideal: ambos).
- Garantir `transaction_id` único no `purchase` para evitar deduplicação indevida.
- Evitar disparo duplicado do mesmo evento (ex.: reload de página de obrigado).

## 4) Validação rápida

- Ative `debug_mode` em homologação:

```js
gtag('config', 'G-XXXXXXXXXX', { debug_mode: true });
```

- Valide no **DebugView** se os eventos chegam com parâmetros corretos.
- Confira depois nos relatórios de Monetização/Compras (pode levar algumas horas).

## 5) Eventos essenciais do funil

1. `view_item`
2. `add_to_cart`
3. `begin_checkout`
4. `add_payment_info` (opcional, recomendado)
5. `purchase`

---

Referências oficiais:
- https://developers.google.com/analytics/devguides/collection/ga4
- https://developers.google.com/analytics/devguides/collection/ga4/ecommerce

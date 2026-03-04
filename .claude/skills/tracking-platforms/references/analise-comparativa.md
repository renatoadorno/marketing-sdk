# Análise Comparativa — Plataformas de Tracking

Comparação detalhada entre **Google Analytics 4**, **Facebook (Meta)** e **Spotify Ads**, cobrindo Pixel (client-side) e CAPI/Measurement Protocol (server-side).

---

## 1. Arquitetura: Pixel + Server-Side

As 3 plataformas seguem **exatamente a mesma arquitetura**:

| Aspecto | Google Analytics 4 | Facebook (Meta) | Spotify Ads |
|---|---|---|---|
| **Client-side** | `gtag.js` | Meta Pixel (`fbq()`) | Spotify Pixel (`spdt()`) |
| **Server-side** | Measurement Protocol | Conversions API (CAPI) | Conversions API (CAPI) |
| **Setup redundante** | Recomendado (gtag + MP) | Recomendado (Pixel + CAPI) | Recomendado (Pixel + CAPI) |
| **Deduplicação** | Via `transaction_id` | Via `event_id` + `event_name` | Via `event_id` + dataset |

> **Conclusão:** O padrão da indústria é **Pixel no browser + API server-side**, com deduplicação por ID único. A lógica é sempre a mesma: o Pixel pode falhar (ad blocker, cookie), então o servidor garante a entrega.

---

## 2. Eventos — Mapeamento de Equivalências

Todos rastreiam o **mesmo funil de e-commerce**, mas com nomenclaturas diferentes:

### Eventos do Funil Principal

| Etapa do Funil | Google Analytics 4 | Facebook (Meta) | Spotify Ads |
|---|---|---|---|
| **Visualizar produto** | `view_item` | `ViewContent` | `product` |
| **Adicionar ao carrinho** | `add_to_cart` | `AddToCart` | `addtocart` |
| **Iniciar checkout** | `begin_checkout` | `InitiateCheckout` | `checkout` |
| **Info de pagamento** | `add_payment_info` | `AddPaymentInfo` | — |
| **Info de frete** | `add_shipping_info` | — | — |
| **Compra** | `purchase` | `Purchase` | `purchase` / `PURCHASE` |
| **Lead** | `generate_lead` | `Lead` | `lead` |
| **Cadastro** | `sign_up` | `CompleteRegistration` | `signup` |
| **Busca** | `search` | `Search` | — |
| **Lista de desejos** | `add_to_wishlist` | `AddToWishlist` | — |
| **Reembolso** | `refund` | — | — |
| **Page View** | `page_view` (automático) | `PageView` (automático) | `view` (no base code) |

> **Padrão de nomenclatura:**
> - Google: `snake_case` (ex: `add_to_cart`)
> - Facebook Pixel: `PascalCase` (ex: `AddToCart`)
> - Spotify Pixel: `lowercase` sem separador (ex: `addtocart`)
> - Spotify CAPI: `UPPER_SNAKE_CASE` (ex: `ADD_TO_CART`)

### Eventos Exclusivos por Plataforma

| Plataforma | Eventos Exclusivos |
|---|---|
| **Google** | `view_item_list`, `select_item`, `view_cart`, `remove_from_cart`, `view_promotion`, `select_promotion`, `login` |
| **Facebook** | `Contact`, `CustomizeProduct`, `Donate`, `FindLocation`, `Schedule`, `StartTrial`, `SubmitApplication`, `Subscribe` |
| **Spotify** | `alias` (identificação de usuário), `custom_event_1` a `custom_event_5` |

---

## 3. Parâmetros de Evento — O Que se Envia

### Parâmetros Comuns (presentes nas 3 plataformas)

| Dado | Google Analytics 4 | Facebook (Meta) | Spotify Ads |
|---|---|---|---|
| **Valor monetário** | `value` | `value` | `value` / `amount` (CAPI) |
| **Moeda** | `currency` | `currency` | `currency` |
| **ID do evento (dedup)** | `transaction_id` | `event_id` / `eventID` | `event_id` |
| **ID do produto** | `item_id` (dentro de `items[]`) | `content_ids` / `contents[].id` | `product_id` |
| **Nome do produto** | `item_name` (dentro de `items[]`) | `content_name` | `product_name` / `content_name` (CAPI) |
| **Quantidade** | `quantity` (dentro de `items[]`) | `contents[].quantity` / `num_items` | `quantity` |
| **Categoria** | `item_category` (dentro de `items[]`) | `content_category` | `product_type` / `content_category` (CAPI) |

### Diferenças na Estrutura de Itens/Produtos

| Aspecto | Google Analytics 4 | Facebook (Meta) | Spotify Ads |
|---|---|---|---|
| **Estrutura** | Array `items[]` com objetos completos | `content_ids[]` + `contents[]` separados | Parâmetros flat no Pixel / `event_details` na CAPI |
| **Múltiplos itens** | ✅ Nativo via `items[]` | ✅ Via `contents[]` | ⚠️ Via `line_items` (menos estruturado) |
| **Preço unitário** | `price` (dentro de `items[]`) | Dentro de `contents[]` | Não tem campo específico |
| **Variante** | `item_variant` | — | `variant_id`, `variant_name` |
| **Marca** | `item_brand` | — | `product_vendor` |
| **Cupom por item** | `coupon` (item-level) | — | — |
| **Desconto** | `discount` (item-level) | — | `discount_code` (evento-level) |
| **Categorias hierárquicas** | Até 5 níveis (`item_category` a `item_category5`) | `content_category` (único) | `product_type` (único) |

### Parâmetros Exclusivos Notáveis

| Plataforma | Parâmetros Exclusivos |
|---|---|
| **Google** | `transaction_id`, `tax`, `shipping`, `affiliation`, `item_list_id`, `item_list_name`, `location_id`, `customer_type`, `engagement_time_msec`, `session_id` |
| **Facebook** | `content_type` (`product`/`product_group`), `predicted_ltv`, `delivery_category`, `status`, `search_string`, `num_items` |
| **Spotify** | `is_new_customer`, `product_vendor`, `variant_id`, `variant_name`, `line_items` |

---

## 4. Dados do Usuário — Customer Matching

### Parâmetros de Identificação Comuns

| Dado | Google Analytics 4 | Facebook (Meta) | Spotify Ads |
|---|---|---|---|
| **Email (hash)** | `sha256_email_address` | `em` (SHA-256) | `hashed_emails[]` (SHA-256) |
| **Telefone (hash)** | `sha256_phone_number` | `ph` (SHA-256) | `hashed_phone_number` (SHA-256) |
| **IP** | — (automático) | `client_ip_address` | `ip_address` |
| **User Agent** | — (automático) | `client_user_agent` | — |
| **Device ID** | — | `madid` (mobile) | `device_id` |
| **ID interno (seu)** | `user_id` | `external_id` | — |
| **ID do browser** | `client_id` (cookie `_ga`) | `fbp` (cookie `_fbp`) | — |
| **Click ID** | `gclid` (Google Ads) | `fbc` (cookie `_fbc`) | — |

### Hashing — Regras Comuns

As 3 plataformas exigem **SHA-256** para dados PII, com normalização prévia:

| Regra | Google | Facebook | Spotify |
|---|---|---|---|
| **Algoritmo** | SHA-256 (hex) | SHA-256 | SHA-256 |
| **Normalizar antes** | ✅ lowercase, trim | ✅ lowercase, trim, sem espaços | ✅ (implícito) |
| **Email** | Remover pontos antes de `@` (gmail) | Lowercase, sem espaços | Hash direto |
| **Telefone** | Formato E.164 | Apenas números + código país | Hash direto |
| **Hash automático pelo SDK** | — | ✅ (Business SDK) | — |

### Dados Adicionais de Endereço

| Dado | Google | Facebook | Spotify |
|---|---|---|---|
| **Nome** | `sha256_first_name` | `fn` (hash) | — |
| **Sobrenome** | `sha256_last_name` | `ln` (hash) | — |
| **Cidade** | `city` | `ct` (hash) | — |
| **Estado** | `region` | `st` (hash) | — |
| **CEP** | `postal_code` | `zp` (hash) | — |
| **País** | `country` | `country` (hash) | — |
| **Rua** | `sha256_street` | — | — |
| **Data nascimento** | — | `db` (hash) | — |
| **Gênero** | — | `ge` (hash) | — |

> **Conclusão:** Facebook é o mais exigente em dados de matching (nome, sobrenome, endereço completo, gênero, data de nascimento). Google vem em segundo. Spotify é o mais simples (email, telefone, IP, device_id).

---

## 5. Estrutura de Request — Server-Side

### Request Body Comparado

| Aspecto | Google (Measurement Protocol) | Facebook (CAPI) | Spotify (CAPI) |
|---|---|---|---|
| **Endpoint** | `POST /mp/collect?measurement_id=...&api_secret=...` | `POST /{PIXEL_ID}/events?access_token=...` | `POST /capi-direct/events/` |
| **Autenticação** | `api_secret` na URL | `access_token` na URL | Bearer token no header |
| **ID da conexão** | `measurement_id` (URL) | `pixel_id` (URL) | `capi_connection_id` (body) |
| **Array de eventos** | `events[]` | `data[]` | `events[]` |
| **Resposta sucesso** | `204 No Content` | `200 OK` | `200 OK` com `{"message": "SUCCESS"}` |

### Campos Obrigatórios no Evento

| Campo | Google | Facebook | Spotify |
|---|---|---|---|
| **Nome do evento** | `name` | `event_name` | `event_name` |
| **Timestamp** | `timestamp_micros` (opcional) | `event_time` (**obrigatório**, Unix seg) | `event_time` (**obrigatório**, RFC 3339) |
| **User data** | `user_data` (opcional) | `user_data` (**obrigatório**, ≥1 campo) | `user_data` (**obrigatório**, ≥1 campo) |
| **Source** | — | `action_source` (**obrigatório**) | `action_source` (opcional) |
| **Event ID** | — | `event_id` (recomendado) | `event_id` (**obrigatório**) |
| **Client ID** | `client_id` (**obrigatório**) | — | — |
| **Event source URL** | — | `event_source_url` (obrig. p/ web) | `event_source_url` (opcional) |

### Janela de Tempo para Eventos Atrasados

| Plataforma | Janela Máxima |
|---|---|
| **Google** | 72 horas |
| **Facebook** | 7 dias |
| **Spotify** | Não especificado (deve estar no passado) |

---

## 6. Deduplicação — Como Cada Plataforma Implementa

| Aspecto | Google | Facebook | Spotify |
|---|---|---|---|
| **Método principal** | `transaction_id` (previne duplicação) | `event_id` + `event_name` | `event_id` + dataset |
| **Janela de dedup** | Permanente por `transaction_id` | 48 horas | Via dataset |
| **Prioridade** | — | Browser preferido (se < 5min) | — |
| **Fallback** | — | `fbp` ou `external_id` | — |

---

## 7. Eventos Personalizados (Custom Events)

| Aspecto | Google | Facebook | Spotify |
|---|---|---|---|
| **Suporte** | ✅ Ilimitado | ✅ Ilimitado | ⚠️ Máximo 5 |
| **Nome customizado** | ✅ | ✅ (máx 50 chars) | ❌ (nome fixo: `custom_event_1` a `5`) |
| **Custom Conversions** | — | ✅ (máx 100 por account, baseado em URL) | — |

---

## 8. Limitações Comparadas

| Limitação | Google | Facebook | Spotify |
|---|---|---|---|
| **Eventos por request** | 25 | Não especificado | Não especificado |
| **Parâmetros por evento** | 25 | Sem limite documentado | Sem limite documentado |
| **Caracteres no nome do evento** | 40 | 50 | — |
| **Custom events** | Ilimitado | Ilimitado | 5 |
| **Custom conversions** | — | 100 por account | — |
| **Tamanho do body** | < 130 KB | Não especificado | Não especificado |
| **Expiração do token** | — | Access token expira | Nunca expira |

---

## 9. Padrão Unificado — O Que Toda Plataforma Precisa

Independente da plataforma, para rastrear um funil de e-commerce, você **sempre** precisa enviar:

### No Pixel (client-side)
1. **`valor`** — Quanto custou
2. **`moeda`** — Em qual moeda
3. **`id do evento`** — Para deduplicação
4. **`id(s) do produto`** — O que foi comprado/visualizado
5. **`quantidade`** — Quantos itens

### Na CAPI (server-side)
1. **Todos os acima** +
2. **`identificador do usuário`** — Email hasheado, telefone, IP, etc.
3. **`timestamp`** — Quando aconteceu
4. **`source`** — De onde veio (web, app, etc.)

> **A grande diferença está apenas na NOMENCLATURA.** O dado subjacente é sempre o mesmo. Uma camada de abstração pode normalizar os dados uma única vez e dispatcher para as 3 plataformas, alterando apenas os nomes dos campos.

---

## 10. Resumo Visual — Mapa Mental

```
Funil de E-commerce (dados universais)
│
├── Visualizar Produto
│   ├── Google: view_item          { items[{item_id, item_name, price}] }
│   ├── Facebook: ViewContent      { content_ids, content_name, value, currency }
│   └── Spotify: product           { product_id, product_name, value, currency }
│
├── Adicionar ao Carrinho
│   ├── Google: add_to_cart        { items[{item_id, quantity, price}], value, currency }
│   ├── Facebook: AddToCart        { content_ids, contents[{id, quantity}], value, currency }
│   └── Spotify: addtocart         { product_id, quantity, value, currency }
│
├── Iniciar Checkout
│   ├── Google: begin_checkout     { items[], value, currency, coupon }
│   ├── Facebook: InitiateCheckout { content_ids, contents[], num_items, value, currency }
│   └── Spotify: checkout          { value, currency, quantity, line_items }
│
├── Compra
│   ├── Google: purchase           { transaction_id, items[], value, currency, tax, shipping }
│   ├── Facebook: Purchase         { content_ids, contents[], value*, currency* }
│   └── Spotify: purchase          { value, currency, discount_code, is_new_customer, line_items }
│
└── Identificação do Usuário
    ├── Google: user_data           { sha256_email, sha256_phone, address{} }
    ├── Facebook: user_data         { em, ph, fn, ln, db, ge, ct, st, zp, country, external_id }
    └── Spotify: user_data          { hashed_emails[], hashed_phone_number, ip_address, device_id }
```

# Facebook — Resumo Completo: Meta Pixel e Conversions API (CAPI)

## O que é cada coisa

### Meta Pixel
É um snippet JavaScript que roda no **navegador do usuário**. Ele captura ações (eventos) do visitante no site — como visualizar um produto, adicionar ao carrinho ou concluir uma compra — e envia esses dados para o Facebook. Serve para mensuração, otimização de anúncios e criação de audiências.

### Conversions API (CAPI)
É uma API **server-side** (servidor para servidor). Envia os mesmos tipos de evento diretamente do seu backend para o Facebook, sem depender do navegador. Isso contorna bloqueadores de anúncios, restrições de cookies e limitações de privacidade dos navegadores.

### Setup Redundante (Recomendado pela Meta)
A Meta recomenda usar **Pixel + CAPI juntos** para o mesmo evento. Isso garante cobertura máxima: se o Pixel falhar (bloqueador, cookie expirado), o servidor ainda envia. Quando ambos enviam o mesmo evento, a **deduplicação** evita contagem duplicada.

---

## Três formas de rastrear conversões

### 1. Standard Events (Eventos Padrão)
São eventos predefinidos pela Meta. Chamados via `fbq('track', 'NomeDoEvento', {params})`.

**Lista completa dos eventos padrão:**

- **AddPaymentInfo** — Quando info de pagamento é adicionada no checkout. Parâmetros opcionais: `content_ids`, `contents`, `currency`, `value`
- **AddToCart** — Produto adicionado ao carrinho. Parâmetros opcionais: `content_ids`, `content_type`, `contents`, `currency`, `value`. **Obrigatório para Advantage+ catalog ads:** `contents`
- **AddToWishlist** — Produto adicionado à lista de desejos. Parâmetros opcionais: `content_ids`, `contents`, `currency`, `value`
- **CompleteRegistration** — Formulário de cadastro concluído. Parâmetros opcionais: `currency`, `value`
- **Contact** — Pessoa entra em contato (telefone, SMS, email, chat)
- **CustomizeProduct** — Pessoa personaliza um produto
- **Donate** — Doação para sua organização
- **FindLocation** — Busca por localização de loja
- **InitiateCheckout** — Início do checkout. Parâmetros opcionais: `content_ids`, `contents`, `currency`, `num_items`, `value`
- **Lead** — Cadastro/signup concluído. Parâmetros opcionais: `currency`, `value`
- **Purchase** — Compra concluída. **Obrigatório:** `currency` e `value`. **Obrigatório para Advantage+ catalog ads:** `contents` ou `content_ids`
- **Schedule** — Agendamento de visita
- **Search** — Busca no site. Parâmetros opcionais: `content_ids`, `content_type`, `contents`, `currency`, `search_string`, `value`. **Obrigatório para Advantage+ catalog ads:** `contents` ou `content_ids`
- **StartTrial** — Início de período de teste. Parâmetros opcionais: `currency`, `predicted_ltv`, `value`
- **SubmitApplication** — Pessoa se candidata a produto/serviço/programa
- **Subscribe** — Assinatura paga. Parâmetros opcionais: `currency`, `predicted_ltv`, `value`
- **ViewContent** — Visualização de página de produto/landing page. Parâmetros opcionais: `content_ids`, `content_type`, `contents`, `currency`, `value`. **Obrigatório para Advantage+ catalog ads:** `contents` ou `content_ids`

### 2. Custom Events (Eventos Personalizados)
Definidos por você quando os padrão não atendem. Chamados via `fbq('trackCustom', 'NomeEvento', {params})`.

```js
fbq('trackCustom', 'ShareDiscount', {promotion: 'share_discount_10%'});
```

**Regras:**
- O nome precisa ser uma string de **no máximo 50 caracteres**
- Suportam parâmetros custom como os eventos padrão
- Podem ser usados para definir custom audiences

### 3. Custom Conversions (Conversões Personalizadas)
Rastreadas **automaticamente** analisando URLs. Não exigem código adicional além do base code do Pixel. Você configura regras baseadas em URLs no Events Manager.

**Exemplo:** Toda visita a uma URL que contenha `/obrigado` conta como conversão.

**Limitações:**
- Máximo de **100 custom conversions por ad account**
- Não suportam breakdown por product ID
- Não suportam contagem de ações únicas
- A partir de **setembro de 2025**, custom conversions que sugiram informações sensíveis (condições de saúde, status financeiro) serão bloqueadas. O campo `is_unavailable` retornará `true` quando bloqueada

---

## Object Properties (Parâmetros de evento)

Propriedades predefinidas que podem ser enviadas junto com eventos padrão e custom:

- **`content_category`** (string) — Categoria da página/produto
- **`content_ids`** (array de int ou string) — IDs dos produtos (SKUs). Ex: `['ABC123', 'XYZ789']`
- **`content_name`** (string) — Nome da página/produto
- **`content_type`** (string) — `product` ou `product_group`. Se não informado, o Meta faz match com qualquer item do mesmo ID
- **`contents`** (array de objetos) — Cada objeto **precisa** de `id` e `quantity`. Ex: `[{'id': 'ABC123', 'quantity': 2}]`
- **`currency`** (string) — Moeda do `value`
- **`delivery_category`** (string) — `in_store`, `curbside` ou `home_delivery`
- **`num_items`** (integer) — Número de itens no checkout (usado com `InitiateCheckout`)
- **`predicted_ltv`** (integer/float) — Lifetime value estimado do assinante
- **`search_string`** (string) — Termo de busca (usado com `Search`)
- **`status`** (boolean) — Status do registro (usado com `CompleteRegistration`)
- **`value`** (integer/float) — **Obrigatório para Purchase e qualquer evento com otimização por valor.** Deve representar valor monetário

Você também pode criar **custom properties** próprias. **Cuidado:** chaves de parâmetros **não podem conter espaços** se forem usadas para definir custom audiences.

---

## Conversions API (CAPI) — Estrutura de Dados

### Parâmetros do Server Event

**Obrigatórios:**
- **`event_name`** (string) — Nome do evento padrão ou custom. Usado para deduplicação junto com `event_id`
- **`event_time`** (integer) — Timestamp Unix em segundos (GMT). Pode ser até **7 dias no passado**. Se qualquer evento no payload exceder 7 dias, **todo o request é rejeitado**
- **`user_data`** (object) — Dados do cliente para matching. Pelo menos um parâmetro de `user_data` é obrigatório
- **`action_source`** (string) — **Obrigatório.** Indica onde a conversão ocorreu. Valores possíveis:
  - `website` — No site
  - `app` — No app mobile
  - `email` — Por email
  - `phone_call` — Por telefone
  - `chat` — Via mensageiro/SMS
  - `physical_store` — Em loja física
  - `system_generated` — Automática (ex: renovação de assinatura)
  - `business_messaging` — De ads que direcionam para Messenger, Instagram ou WhatsApp
  - `other` — Outro

**Obrigatórios para eventos de website:**
- **`event_source_url`** (string) — URL do navegador onde o evento aconteceu. Deve bater com o domínio verificado
- **`client_user_agent`** (string) — User agent do navegador do cliente

**Recomendado (mas tecnicamente opcional):**
- **`event_id`** (string) — ID único para deduplicação. **Altamente recomendado.** Precisa bater com o `eventID` enviado pelo Pixel do navegador

**Opcionais:**
- **`custom_data`** (object) — Dados adicionais de negócio (value, currency, contents, etc.)
- **`opt_out`** (boolean) — Se `true`, o evento é usado apenas para atribuição, não para otimização de anúncios
- **`referrer_url`** (string) — Header HTTP referrer da página que disparou o evento
- **`original_event_data`** (object) — Para associar eventos "atrasados" a um evento de aquisição anterior. **Altamente recomendado quando há delay**
- **`customer_segmentation`** (enum) — Segmento do cliente. Valores possíveis: `new_customer_to_business`, `existing_customer_to_business`, `customer_in_loyalty_program`, entre outros
- **`data_processing_options`** (array) — Para habilitar Limited Data Use (LDU). Valor aceito: `LDU`
- **`data_processing_options_country`** (integer) — **Obrigatório se enviar LDU.** `1` para EUA, `0` para geolocalização
- **`data_processing_options_state`** (integer) — **Obrigatório se enviar LDU sem IP.** `1000` para Califórnia, `0` para geolocalização

**Para eventos de app (obrigatórios):**
- **`app_data`** (object) — Info do app e dispositivo
- **`extinfo`** (array) — Info estendida do dispositivo. **Todos os valores são obrigatórios e devem seguir a ordem indexada** (versão, package name, OS version, device model, locale, timezone, carrier, screen width/height, density, CPU cores, storage, etc.). Use string vazia como placeholder para valores ausentes. Versão deve ser `a2` (Android) ou `i2` (iOS)

---

## Customer Information Parameters (`user_data`)

Esses parâmetros identificam o usuário para matching. **Pelo menos um é obrigatório.**

### Parâmetros que EXIGEM hash (SHA256)
Todos devem ser normalizados para lowercase, sem espaços extras, antes do hash:

- **`em`** — Email. Lowercase, sem espaços
- **`ph`** — Telefone. Apenas números, com código do país (ex: `16505551212`). **Sempre inclua o código do país**
- **`fn`** — Primeiro nome. Lowercase, sem pontuação. UTF-8 para caracteres especiais
- **`ln`** — Sobrenome. Mesmas regras do `fn`
- **`db`** — Data de nascimento. Formato `YYYYMMDD` (ex: `19970216`)
- **`ge`** — Gênero. Inicial lowercase: `f` ou `m`
- **`ct`** — Cidade. Lowercase, sem pontuação, sem espaços (ex: `newyork`)
- **`st`** — Estado. Código de 2 caracteres lowercase (ex: `ca`)
- **`zp`** — CEP/Zip. Lowercase, sem espaços, sem traço. Apenas 5 primeiros dígitos para EUA
- **`country`** — País. Código ISO 3166-1 alpha-2 lowercase (ex: `br`). **Sempre inclua mesmo se todos os dados são do mesmo país**

### Parâmetro com hash RECOMENDADO (mas não obrigatório)
- **`external_id`** — ID do usuário no seu sistema (loyalty ID, user ID, cookie ID). Hashing recomendado

### Parâmetros que NÃO devem ser hasheados
- **`client_ip_address`** — IP do navegador (IPV4 ou IPV6). **Obrigatório configurar manualmente no servidor** (no navegador é automático)
- **`client_user_agent`** — User agent do navegador. **Obrigatório para eventos de website via CAPI**
- **`fbc`** — Click ID do Meta. Formato: `fb.{subdomain_index}.{creation_time}.{fbclid}`. Vem do cookie `_fbc`
- **`fbp`** — Browser ID do Meta. Formato: `fb.{subdomain_index}.{creation_time}.{random_number}`. Vem do cookie `_fbp`
- **`subscription_id`** — ID de assinatura
- **`fb_login_id`** — App-Scoped ID do Facebook Login
- **`lead_id`** — ID de lead do Lead Ads
- **`anon_id`** — ID de instalação do app (apenas app events)
- **`madid`** — Mobile Advertiser ID / IDFA (apenas app events)
- **`page_id`** — ID da página do Facebook (para bots)
- **`page_scoped_user_id`** — ID do usuário no escopo da página (webhooks de Messenger)
- **`ctwa_clid`** — Click ID para ads que direcionam ao WhatsApp
- **`ig_account_id`** — ID da conta do Instagram associada ao negócio
- **`ig_sid`** — Instagram-Scoped User ID (via webhook)

> **Cuidado com hashing:** Se usar o Meta Business SDK, o hashing é feito automaticamente. Se implementar manualmente, normalize os dados **antes** de aplicar SHA256. O sistema do Facebook **não aceita** informações de contato (email, telefone, nome) sem hash.

---

## External ID — Como funciona em detalhe

O `external_id` é o ID do usuário **no seu sistema** (user ID, loyalty ID, cookie ID). Ele serve como ponte entre diferentes canais.

### Quando usar
**Sempre que possível.** Benefícios:
- Melhora match rates entre canais (Pixel envia email hasheado, CAPI pode usar só o `external_id` depois)
- Permite reutilizar o match sem reenviar PIIs
- Permite criar audiências (Website Custom, Mobile App Custom, Offline Custom, Lookalike)

### Como funciona
1. Você envia evento com `external_id` + outros dados de cliente (email, etc.)
2. Facebook encontra o match e associa o `external_id` ao usuário
3. Nos próximos eventos, você pode enviar **apenas** o `external_id` e o Facebook reutiliza o match anterior

**O match expira periodicamente** — refresque-o com frequência.

### Regra de ouro
**Seja consistente:** se o Pixel envia `external_id: "123"`, o CAPI para o mesmo usuário **deve** enviar `external_id: "123"`. Isso vale para Pixel, CAPI e Offline Conversions API.

### Fallback com `fbp`
Se seu sistema não tem `external_id`, o Facebook usa o `fbp` (cookie do browser) como fallback. Porém, `external_id` tem **performance superior** e é preferido quando ambos estão presentes. O `fbp` tem data de expiração por ser cookie.

> **Importante:** `Customer File Custom Audience` **NÃO pode** ser criada usando `external_id` da CAPI.

---

## Deduplicação de Eventos (Pixel + CAPI)

Quando você usa o setup redundante (Pixel + CAPI enviando o mesmo evento), **precisa configurar deduplicação** para não contar o evento duas vezes.

### Método 1: Event ID + Event Name (RECOMENDADO)

O `eventID` do Pixel deve bater com o `event_id` da CAPI, **e** o `event` do Pixel deve bater com o `event_name` da CAPI.

**Pixel:**
```js
fbq('track', 'Purchase', {value: 12, currency: 'USD'}, {eventID: 'EVENT_ID'});
```

**CAPI:**
```json
{
  "event_name": "Purchase",
  "event_id": "EVENT_ID"
}
```

**Regras de deduplicação:**
- Eventos são deduplicados se recebidos **dentro de 48 horas** do primeiro evento com aquele `event_id`
- Se servidor e browser chegam quase ao mesmo tempo (dentro de 5 minutos), **o evento do browser é preferido**
- O `event_id` pode ser um número de pedido, transaction ID, ou qualquer string única (inclusive aleatória, desde que a mesma seja enviada em ambos os lados)

### Método 2: FBP ou External ID

Se você configurar `fbp` e/ou `external_id` de forma consistente entre browser e servidor, o Facebook deduplica automaticamente comparando `event_name` + `fbp`/`external_id`.

**Limitações deste método:**
- Geralmente só funciona na direção **browser → servidor** (primeiro o browser, depois o servidor)
- **Não** deduplica eventos de uma mesma fonte (dois eventos browser iguais ou dois eventos servidor iguais são ambos contados)
- Se nenhum evento browser foi recebido nas últimas 48 horas, o evento servidor não será descartado, mesmo que um browser event idêntico chegue depois

### Como configurar o `eventID` no Pixel

Três opções:

```js
// Para todos os Pixels da página
fbq('track', 'Purchase', {value: 12, currency: 'USD'}, {eventID: 'EVENT_ID'});

// Para um Pixel específico
fbq('trackSingle', 'PIXEL_ID', 'Purchase', {value: 12, currency: 'USD'}, {eventID: 'EVENT_ID'});

// Via image tag
// <img src="https://www.facebook.com/tr?id=PIXEL_ID&ev=Purchase&eid=EVENT_ID"/>
```

Para eventos sem parâmetros:
```js
fbq('track', 'Lead', {}, {eventID: 'EVENT_ID'});
```

---

## Múltiplos Pixels na mesma página

### O Problema
Quando você inicializa múltiplos Pixels na página, **qualquer chamada `fbq('track', ...)` dispara para TODOS os pixels inicializados**, não apenas o último. Isso acontece porque o `fbq` mantém todos os pixels em uma fila global.

**Exemplo do comportamento indesejado:**
```js
fbq('init', 'PIXEL-A');
fbq('track', 'Purchase', {value: 4, currency: 'GBP'}); // Dispara para PIXEL-A

fbq('init', 'PIXEL-B');
fbq('trackCustom', 'Step4'); // Dispara para PIXEL-A E PIXEL-B (indesejado!)
```

### A solução: `trackSingle` e `trackSingleCustom`

Permite disparar eventos para um Pixel **específico**:

```js
fbq('init', 'PIXEL-A');
fbq('init', 'PIXEL-B');
fbq('track', 'PageView'); // Dispara para ambos (intencional)

// Apenas para PIXEL-A
fbq('trackSingle', 'PIXEL-A', 'Purchase', {value: 4, currency: 'GBP'});

// Apenas para PIXEL-B
fbq('trackSingleCustom', 'PIXEL-B', 'Step4', {});
```

> **Cuidado:** Se você usa múltiplos Pixels e faz `fbq('track', ...)` em vez de `fbq('trackSingle', ...)`, vai disparar eventos extras que distorcem os relatórios.

---

## Original Event Data (Dados Originais do Evento)

Usado na CAPI para associar eventos "atrasados" a um evento de aquisição original. Todos os campos são **opcionais**:

- **`event_name`** — Nome do evento original (padrão ou custom)
- **`event_time`** — Timestamp Unix do evento original (GMT)
- **`order_id`** — ID do pedido da transação original
- **`event_id`** — ID do evento original (mesmo conceito usado na deduplicação)

> **Quando usar:** Quando existe um delay significativo entre a ação real do usuário e o momento em que o evento é enviado ao Facebook.

---

## Mapa de Parâmetros: Visão Geral por Categoria

### Main Body (Request Level)
- **`data`** — Array de eventos do servidor
- **`test_event_code`** — Código para testar eventos sem afetar métricas reais

### Server Event
`event_name`, `event_time`, `user_data`, `custom_data`, `event_source_url`, `opt_out`, `event_id`, `action_source`, `data_processing_options`, `data_processing_options_country`, `data_processing_options_state`, `referrer_url`, `customer_segmentation`

### Customer Information (`user_data`)
Com hash: `em`, `ph`, `fn`, `ln`, `ge`, `db`, `ct`, `st`, `zp`, `country`
Hash recomendado: `external_id`
Sem hash: `client_ip_address`, `client_user_agent`, `fbc`, `fbp`, `subscription_id`, `fb_login_id`, `lead_id`, `anon_id`, `madid`, `page_id`, `page_scoped_user_id`, `ctwa_clid`, `ig_account_id`, `ig_sid`

### App Data
`advertiser_tracking_enabled`, `application_tracking_enabled`, `extinfo`, `campaign_ids`, `install_referrer`, `installer_package`, `url_schemes`, `windows_attribution_id`, `anon_id`, `madid`, `vendor_id`

### Original Event Data
`event_name`, `event_time`, `order_id`, `event_id`

---

## Checklist de Cuidados

1. **Hashing:** Normalize ANTES de hashear (lowercase, sem espaços). Se usar o Business SDK, é automático. Se manual, use SHA256
2. **Deduplicação:** Se usa Pixel + CAPI, **sempre envie `event_id`** igual em ambos os lados
3. **`event_time` na CAPI:** Máximo de **7 dias no passado**. Se ultrapassar, todo o request é rejeitado
4. **`action_source`:** É obrigatório e deve ser preciso. Você concorda com a veracidade ao usar a CAPI
5. **Website events via CAPI:** Precisam de `client_user_agent`, `action_source` e `event_source_url`
6. **Non-web events via CAPI:** Precisam apenas de `action_source`
7. **Múltiplos Pixels:** Use `trackSingle`/`trackSingleCustom` para evitar disparo cruzado
8. **`external_id`:** Seja consistente entre Pixel, CAPI e Offline API
9. **IP e User Agent:** No servidor, precisam ser configurados manualmente (no browser são automáticos)
10. **Telefone:** Sempre inclua código do país, mesmo que todos os dados sejam do mesmo país
11. **País:** Sempre envie o campo `country`, mesmo que todos os dados sejam de um país só
12. **Custom Conversions:** Máximo 100 por ad account. Cuidado com nomes que sugiram dados sensíveis (saúde, financeiro)
13. **`fbp` e `fbc`:** Não hashear. São cookies do browser que devem ser lidos e repassados ao servidor
14. **Purchase event:** `currency` e `value` são **obrigatórios**

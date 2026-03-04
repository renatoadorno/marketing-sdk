# Google Analytics 4 — Resumo Consolidado

Guia objetivo cobrindo **gtag.js (client-side)** e **Measurement Protocol (server-side)** para rastreamento de e-commerce no GA4.

---

## 1. Visão geral das duas camadas

### 1.1 gtag.js (Client-side)

O script `gtag.js` roda no navegador do usuário. Ele coleta automaticamente informações de dispositivo, geolocalização, navegador e gera identificadores como `client_id` e `session_id`. É o responsável pela coleta principal de dados.

**Instalação mínima** — adicionar no `<head>` de todas as páginas:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 1.2 Measurement Protocol (Server-side)

O Measurement Protocol permite enviar eventos diretamente dos seus servidores para o GA4 via requisições HTTP POST. Foi projetado para **complementar** a coleta do gtag — não para substituí-la completamente.

**Casos de uso:**
- Registrar conversões confirmadas no backend (ex: pagamento aprovado por webhook)
- Associar comportamentos online com dados offline (CRM, PDV)
- Enviar eventos de dispositivos sem coleta automática (quiosques, wearables)
- Enriquecer dados do lado do cliente com informações do servidor

**Atenção:** Usar **apenas** o Measurement Protocol (sem gtag) gera relatórios apenas parciais — informações geográficas, de dispositivo, remarketing e identificadores de publicidade dependem do gtag.

---

## 2. Identificadores — Quem gera o quê

### `client_id` — **Gerado pelo Google (gtag)**

- Identificador único do navegador/dispositivo
- Armazenado no cookie `_ga`
- **Obrigatório** no payload do Measurement Protocol (campo raiz)
- Extrair no front-end: `gtag('get', 'G-XXXXXXXXXX', 'client_id', (id) => { ... })`

### `session_id` — **Gerado pelo Google (gtag)**

- Identificador da sessão ativa
- Armazenado dentro do cookie `_ga_<MEASUREMENT_ID>`
- Deve ser enviado dentro de `params` do evento no Measurement Protocol
- Sem ele, os eventos server-side aparecem como "(not set)" nos relatórios
- Extrair no front-end: `gtag('get', 'G-XXXXXXXXXX', 'session_id', (id) => { ... })`
- **Criar um novo `session_id` gera automaticamente uma nova sessão** sem precisar enviar `session_start`

### `user_id` — **Gerado pela SUA aplicação**

- Identificador interno do usuário logado no seu sistema (chave primária, UUID, código)
- Só enviar quando o usuário estiver autenticado
- Usado para rastreamento cross-device (unificar um mesmo usuário em diferentes navegadores/dispositivos)
- Não pode conter PII em texto plano (não usar email/CPF diretamente)
- Máximo de 256 caracteres
- Enviado no campo raiz do payload junto com `client_id`

### `engagement_time_msec`

- Tempo de engajamento em milissegundos
- Recomendado enviar com cada evento server-side (ex: `100`)
- Necessário para que o evento apareça corretamente nos relatórios de Realtime

---

## 3. Measurement Protocol — Estrutura da requisição

### Endpoint

```
POST https://www.google-analytics.com/mp/collect?measurement_id=G-XXXXXXXXXX&api_secret=SEU_SECRET
```

### Parâmetros de URL (obrigatórios)

- `measurement_id` — ID de métricas do fluxo Web (formato `G-XXXXXXXXXX`). **Não é** o ID do fluxo.
- `api_secret` — Chave gerada em: **Admin > Coleta e modificação de dados > Fluxos de dados > (seu fluxo) > Chaves secretas da API Measurement Protocol > Criar**

### Corpo JSON — Estrutura base

```json
{
  "client_id": "123456789.987654321",
  "user_id": "id-interno-do-usuario",
  "events": [
    {
      "name": "purchase",
      "params": {
        "session_id": "1746773758",
        "engagement_time_msec": 100,
        "transaction_id": "PEDIDO_12345",
        "currency": "BRL",
        "value": 199.90,
        "items": [
          {
            "item_id": "SKU_001",
            "item_name": "Ingresso VIP",
            "price": 199.90,
            "quantity": 1
          }
        ]
      }
    }
  ]
}
```

### Campos no corpo — onde cada coisa vai

**Na raiz do JSON:**
- `client_id` (obrigatório)
- `user_id` (opcional, só se logado)
- `user_data` (opcional, dados do usuário com hash para matching)
- `user_properties` (opcional, propriedades segmentáveis do usuário)
- `timestamp_micros` (opcional, Unix epoch em microssegundos)
- `events` (obrigatório, array de eventos)

**Dentro de cada evento (`events[].params`):**
- `session_id`
- `engagement_time_msec`
- Todos os parâmetros específicos do evento (currency, value, items, etc.)

### Resposta

- **204 No Content** = sucesso
- O Measurement Protocol **não retorna erros de dados inválidos** no endpoint de produção; use o endpoint de validação para debug

### Endpoint de validação (debug)

```
POST https://www.google-analytics.com/debug/mp/collect?measurement_id=G-XXXXXXXXXX&api_secret=SEU_SECRET
```

---

## 4. Timestamps — Controle de data/hora

O Measurement Protocol usa o **primeiro timestamp** que encontrar, nesta prioridade:

1. `timestamp_micros` no nível do evento ou da user property
2. `timestamp_micros` na raiz da requisição
3. Hora em que o servidor do Google recebeu a requisição

**Janela máxima:** Eventos e user properties podem ser enviados com até **72 horas** de atraso.
- Se `validation_behavior` não estiver definido ou for `RELAXED`: aceita, mas ajusta o timestamp para 72h atrás
- Se for `ENFORCE_RECOMMENDATIONS`: rejeita o evento

---

## 5. User Properties — Propriedades do usuário

Servem para criar segmentos no GA4 (ex: `customer_tier: "premium"`). O GA4 registra algumas automaticamente; você pode configurar até **25 adicionais** por projeto.

### Estrutura no payload

```json
{
  "client_id": "...",
  "user_properties": {
    "customer_tier": {
      "value": "premium"
    }
  },
  "events": [...]
}
```

### Nomes reservados (NÃO usar)

- `first_open_time`
- `first_visit_time`
- `last_deep_link_referrer`
- `user_id`
- `first_open_after_install`

Nomes também **não podem** começar com: `google_`, `ga_`, `firebase_`

### Fluxo recomendado

1. Front-end dispara o evento via gtag e envia o `client_id` para sua API
2. Sua API consulta o CRM/banco para obter a propriedade (ex: tier do cliente)
3. Sua API envia o evento via Measurement Protocol com a `user_property` preenchida

---

## 6. User Data — Dados do usuário com hash (Enhanced Matching)

Para melhorar o matching de conversões (similar ao Enhanced Conversions do Ads), você pode enviar dados PII do usuário — mas **sempre com hash SHA-256 em formato hexadecimal**.

### Requisitos

- O campo `user_id` é **obrigatório** quando `user_data` é fornecido
- Campos com prefixo `sha256_` devem ser hasheados e codificados em hex

### Normalização antes do hash

- Remover espaços no início e fim
- Converter para minúsculas
- Telefone: formatar no padrão E.164 (ex: `+5511999999999`)
- Email: remover pontos antes do `@` em domínios gmail.com/googlemail.com

### Função de hash (Node.js/Bun)

```js
const { subtle } = require('crypto').webcrypto;

async function hashSHA256(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hash = await subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

### Estrutura do `user_data` no payload

```json
{
  "client_id": "...",
  "user_id": "id-interno",
  "user_data": {
    "sha256_email_address": "hash_do_email",
    "sha256_phone_number": "hash_do_telefone",
    "address": {
      "sha256_first_name": "hash_do_nome",
      "sha256_last_name": "hash_do_sobrenome",
      "sha256_street": "hash_da_rua",
      "city": "sao paulo",
      "region": "sp",
      "postal_code": "01000000",
      "country": "BR"
    }
  },
  "events": [{ "name": "purchase" }]
}
```

### Limites de valores múltiplos

- Até **3** e-mails e telefones
- Até **2** endereços
- Mais valores = maior probabilidade de match

---

## 7. Geolocalização e Dispositivo

Você pode enviar informações de localização e dispositivo manualmente no Measurement Protocol:

```json
{
  "client_id": "...",
  "events": [...],
  "user_location": {
    "city": "São Paulo",
    "region_id": "BR-SP",
    "country_id": "BR"
  },
  "device": {
    "category": "mobile",
    "language": "pt-br",
    "operating_system": "Android",
    "browser": "Chrome"
  }
}
```

**Importante:** Na prática, o GA4 combina automaticamente a geolocalização mais recente do gtag com os eventos do Measurement Protocol usando o `client_id`. Informações de dispositivo só estão disponíveis nativamente via coleta automática do gtag.

---

## 8. Eventos recomendados para E-commerce

### Funil essencial (ordem cronológica)

1. **`view_item`** — Usuário visualizou a página de um produto
2. **`add_to_cart`** — Item adicionado ao carrinho
3. **`begin_checkout`** — Início do checkout
4. **`add_shipping_info`** — Informações de frete preenchidas
5. **`add_payment_info`** — Informações de pagamento preenchidas
6. **`purchase`** — Compra finalizada (conversão principal)

### Eventos complementares úteis

- **`view_item_list`** — Listagem de produtos exibida
- **`select_item`** — Item selecionado de uma lista
- **`view_cart`** — Visualização do carrinho
- **`remove_from_cart`** — Item removido do carrinho
- **`add_to_wishlist`** — Item adicionado à lista de desejos
- **`refund`** — Reembolso (total ou parcial)
- **`view_promotion`** / **`select_promotion`** — Promoções visualizadas/clicadas
- **`generate_lead`** — Lead gerado (formulário)
- **`login`** / **`sign_up`** — Login e cadastro
- **`search`** — Pesquisa no site

---

## 9. Estrutura do objeto Item

O array `items` é compartilhado pela maioria dos eventos de e-commerce. A estrutura de cada item segue o mesmo padrão em todos os eventos.

### Campos obrigatórios (pelo menos um)

- `item_id` (string) — SKU ou identificador do produto
- `item_name` (string) — Nome do produto

### Campos recomendados

- `price` (number) — Preço unitário. Se houver desconto, usar o preço com desconto e preencher `discount` separadamente
- `quantity` (number) — Quantidade (default: 1)
- `item_brand` (string) — Marca
- `item_category` (string) — Categoria principal. Suporta até 5 níveis: `item_category`, `item_category2`, `item_category3`, `item_category4`, `item_category5`

### Campos opcionais

- `affiliation` — Loja/fornecedor (escopo item apenas)
- `coupon` — Cupom aplicado no item (independente do cupom do evento)
- `discount` — Valor do desconto unitário
- `index` — Posição em uma lista
- `item_variant` — Variante (cor, tamanho)
- `item_list_id` / `item_list_name` — Lista de origem do item
- `location_id` — Local físico associado (Google Place ID)
- `google_business_vertical` — Vertical do negócio (ex: `retail`)

Cada item aceita até **27 parâmetros personalizados** adicionais.

---

## 10. Evento `purchase` — Detalhamento completo

O evento mais importante do funil. Registra a conversão final da venda.

### Quando disparar

Apenas quando o pagamento/pedido estiver **confirmado** (página de sucesso ou retorno confirmado do backend).

### Parâmetros obrigatórios

- `transaction_id` (string) — ID único do pedido. Previne duplicação.
- `currency` (string) — Moeda ISO 4217 (`BRL`, `USD`)
- `value` (number) — Soma de `(price × quantity)` de todos os itens. **NÃO** incluir shipping/tax.
- `items` (array) — Produtos comprados

### Parâmetros recomendados

- `tax` (number) — Impostos
- `shipping` (number) — Frete
- `coupon` (string) — Cupom aplicado
- `customer_type` — `"new"` ou `"returning"` (se souber)

### Exemplo gtag (client-side)

```js
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
```

### Exemplo Measurement Protocol (server-side)

```js
const url = `https://www.google-analytics.com/mp/collect?measurement_id=G-XXXXXXXXXX&api_secret=SEU_SECRET`;

await fetch(url, {
  method: 'POST',
  body: JSON.stringify({
    client_id: '123456789.987654321',
    user_id: '78912',
    events: [{
      name: 'purchase',
      params: {
        session_id: '1746773758',
        engagement_time_msec: 100,
        transaction_id: 'PEDIDO_12345',
        currency: 'BRL',
        value: 199.90,
        items: [{
          item_id: 'SKU_CAMISA_001',
          item_name: 'Camiseta Preta',
          price: 99.95,
          quantity: 2
        }]
      }
    }]
  })
});
```

---

## 11. Captura de IDs no front-end para envio server-side

Para que o Measurement Protocol funcione corretamente vinculado à sessão do usuário, é preciso capturar os IDs do gtag no front-end e enviá-los para sua API backend:

```js
// Capturar client_id
async function getClientId() {
  return new Promise((resolve) => {
    gtag('get', 'G-XXXXXXXXXX', 'client_id', resolve);
  });
}

// Capturar session_id
async function getSessionId() {
  return new Promise((resolve) => {
    gtag('get', 'G-XXXXXXXXXX', 'session_id', resolve);
  });
}

// Enviar para sua API junto com os dados do pedido
async function enviarConversao(dadosPedido) {
  const clientId = await getClientId();
  const sessionId = await getSessionId();

  await fetch('/api/confirmar-compra', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...dadosPedido,
      tracking: { client_id: clientId, session_id: sessionId }
    })
  });
}
```

---

## 12. Limitações do Measurement Protocol

- Máximo de **25 eventos** por requisição
- Cada evento: máximo de **25 parâmetros**
- Cada evento: máximo de **25 user properties**
- Nomes de user properties: máximo **24 caracteres**
- Valores de user properties: máximo **36 caracteres**
- Nomes de eventos: máximo **40 caracteres** (alfanuméricos + underscore, começando com letra)
- Nomes de parâmetros: máximo **40 caracteres** (mesma regra)
- Valores de parâmetros: máximo **100 caracteres** (standard) ou **500** (GA4 360)
- Itens: máximo de **10 parâmetros personalizados**
- Corpo POST: menor que **130 KB**
- Timestamps: dentro das últimas **72 horas**
- Regras de eventos criadas na UI do GA4 **não são acionadas** para eventos enviados via Measurement Protocol — seu código precisa replicar a lógica
- Eventos de app via M.P. **não adicionam** usuários aos públicos de pesquisa do Google Ads

---

## 13. Validação e Debug

### No gtag (client-side)

```js
gtag('config', 'G-XXXXXXXXXX', { debug_mode: true });
```

Verifique no **DebugView** do GA4 se os eventos chegam com os parâmetros corretos.

### No Measurement Protocol (server-side)

Use o endpoint de validação antes de enviar para produção:

```
POST https://www.google-analytics.com/debug/mp/collect?measurement_id=...&api_secret=...
```

---

## 14. Google Ads — Conversões Server-Side (sem GTM)

Além do GA4, o envio de conversões server-side para o **Google Ads** é feito pela **Google Ads API**, usando o `ConversionUploadService`.

### Fluxo do GCLID

1. **Front-end captura o `gclid`** da URL quando o usuário clica num anúncio (ex: `?gclid=ABC123`)
2. Salva o `gclid` em cookie + banco de dados, associado ao usuário/sessão
3. Quando a conversão acontecer no backend (pagamento aprovado), sua API envia o `gclid` + dados da conversão para a Google Ads API

### Enhanced Conversions (fallback sem GCLID)

Se o `gclid` não estiver disponível, é possível enviar dados first-party hasheados (email, telefone) com SHA-256. O Google cruza esses dados com usuários logados em contas Google.

### Requisitos

- Projeto no Google Cloud com OAuth2/Service Account
- Developer Token no Google Ads
- Auto-tagging ativado na conta do Google Ads

---

## 15. Checklist final — Cuidados importantes

- **Nunca** contar apenas com o Measurement Protocol — sempre ter gtag no front
- **Sempre** enviar `client_id` + `session_id` nos eventos server-side para manter a sessão
- **`engagement_time_msec`** (mesmo que `100`) é necessário para os relatórios Realtime
- **`transaction_id`** deve ser único e estável — previne duplicação
- Não disparar `purchase` duas vezes para o mesmo pedido (atenção ao reload)
- `value` deve bater com a soma dos itens (`price × quantity`)
- `currency` é obrigatório quando `value` é definido (ISO 4217: `BRL`)
- Dados sensíveis (`email`, `phone`) em `user_data` devem ser normalizados e hasheados com SHA-256 antes do envio
- Eventos do Measurement Protocol não acionam regras de modificação de eventos configuradas na UI do GA4
- Timestamps além de 72 horas são rejeitados ou ajustados

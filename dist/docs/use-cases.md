# Casos de Uso — marketing-sdk

Guia pratico mostrando como migrar do `facebook-nodejs-business-sdk` para o `marketing-sdk` unificado. Cada caso de uso mostra o **antes** (codigo Facebook isolado) e o **depois** (SDK unificado enviando para Facebook + Google + Spotify simultaneamente).

---

## Setup Inicial

### Antes (Facebook-only)

Cada chamada precisava buscar tokens e pixels no banco, instanciar `EventRequest` manualmente por token, e construir pixel data na mao para devolver ao frontend.

```typescript
// Para cada evento, era necessario:
// 1. Buscar tokens do Facebook no banco
// 2. Criar UserData, CustomData, ServerEvent
// 3. Criar EventRequest POR TOKEN e executar
// 4. Montar pixel data manualmente para o frontend
```

### Depois (marketing-sdk)

O Tracker e configurado **uma unica vez** no boot do servidor. Todas as credenciais de todas as plataformas ficam centralizadas.

```typescript
import {
  Tracker,
  FacebookDestination,
  GoogleDestination,
  SpotifyDestination,
} from 'marketing-sdk'

// Boot do servidor (1x) — pode vir do banco, env, config, etc.
const tracker = new Tracker()
  .setSourceUrl('https://www.guicheweb.com.br')
  .setActionSource('web')
  // Multiplas contas Facebook (produtor, plataforma, etc.)
  .addDestination(new FacebookDestination({
    pixelId: process.env.FB_PIXEL_PLATAFORMA!,
    accessToken: process.env.FB_TOKEN_PLATAFORMA!,
  }))
  .addDestination(new FacebookDestination({
    pixelId: process.env.FB_PIXEL_PRODUTOR!,
    accessToken: process.env.FB_TOKEN_PRODUTOR!,
  }))
  // Google Analytics 4
  .addDestination(new GoogleDestination({
    measurementId: process.env.GA_MEASUREMENT_ID!,
    apiSecret: process.env.GA_API_SECRET!,
  }))
  // Spotify Ads (multiplas contas tambem)
  .addDestination(new SpotifyDestination({
    connectionId: process.env.SPOTIFY_CONN_1!,
    bearerToken: process.env.SPOTIFY_TOKEN_1!,
  }))
  .addDestination(new SpotifyDestination({
    connectionId: process.env.SPOTIFY_CONN_2!,
    bearerToken: process.env.SPOTIFY_TOKEN_2!,
  }))

export { tracker }
```

---

## Caso 1: Purchase (Compra)

A conversao principal. O evento mais critico para atribuicao de campanhas.

### Antes (Facebook-only)

```typescript
async purchasePhase(payload: FbEventPurchase, ip: string, userAgent: string) {
  const { id_cliente, id_venda, id_evento } = payload

  // 1. Buscar dados do cliente no banco
  const cliente = await this.repository.dadosClienteById(Number(id_cliente))
  const nomesCliente = this.splitNames(cliente.nome)

  // 2. Montar UserData manualmente
  const newUserData = new UserData()
    .setExternalId(String(id_cliente))
    .setFirstName(nomesCliente.firstName)
    .setLastName(nomesCliente.lastName)
    .setEmail(cliente.email)
    .setPhone(cliente.fone_celular || '')
    .setGender(cliente?.sexo || 'f')
    .setClientIpAddress(ip)
    .setClientUserAgent(userAgent)
    .setCity(cliente?.cidade || '')
    .setState(cliente?.uf || '')
    .setCountry(cliente?.pais || '')

  // 3. Buscar dados da venda
  const venda = await this.repository.getPurchaseData(Number(id_venda))
  const eventId = `purchase.${id_cliente}.${id_venda}`
  const contentName = `${venda.nome_produtor}-${id_evento}`

  // 4. Montar CustomData
  const newCustomData = new CustomData()
    .setOrderId(String(id_venda))
    .setCurrency(venda.moeda.toLowerCase())
    .setValue(venda.valor_total)
    .setContentName(contentName)

  // 5. Montar ServerEvent
  const newServerEvent = new ServerEvent()
    .setEventName('Purchase')
    .setEventTime(Math.floor(Date.now() / 1000))
    .setUserData(newUserData)
    .setCustomData(newCustomData)
    .setActionSource('website')
    .setEventId(eventId)
    .setEventSourceUrl(payload.sourceUrl)

  // 6. Buscar tokens e pixels
  const { pixels, tokens } = await this._getAllPixelsAndTokens(
    [venda.id_evento],
    Number(venda.id_produtor),
  )

  // 7. Enviar para cada token Facebook separadamente
  const eventRequests = tokens.map((token) => {
    const eventRequest = new EventRequest(token.access_token, token.pixel_id)
      .setEvents([newServerEvent])
    if (token.test_event_code) {
      eventRequest.setTestEventCode(token.test_event_code)
    }
    return eventRequest.execute()
  })
  const results = await Promise.allSettled(eventRequests)

  // 8. Montar pixel data manualmente para o frontend
  const eventData = {
    pixels,
    content_name: contentName,
    num_items: venda.itens.length,
    value: venda.valor_total,
    currency: venda.moeda.toLowerCase(),
    eventId,
    order_id: String(id_venda),
  }
  const encodedData = encodeURIComponent(JSON.stringify(eventData))

  return {
    events: results,
    urlParams: `event=Purchase&data=${encodedData}`,
  }
}
```

### Depois (marketing-sdk)

```typescript
import { tracker } from './tracker-setup'
import { UserData, CustomData, ItemData } from 'marketing-sdk'

async function purchasePhase(payload: PurchasePayload, ip: string, userAgent: string) {
  const { id_cliente, id_venda, id_evento } = payload

  // 1. Buscar dados (mesma logica de negocio)
  const cliente = await repository.dadosClienteById(Number(id_cliente))
  const venda = await repository.getPurchaseData(Number(id_venda))
  if (!venda) return null

  const nomes = splitNames(cliente.nome)

  // 2. Montar UserData (mesma API fluente, porem agora serve para TODAS as plataformas)
  const userData = new UserData()
    .setExternalId(String(id_cliente))
    .setFirstName(nomes.firstName)
    .setLastName(nomes.lastName)
    .setEmail(cliente.email)
    .setPhone(cliente.fone_celular || '')
    .setGender(cliente?.sexo || 'f')
    .setClientIpAddress(ip)
    .setClientUserAgent(userAgent)
    .setCity(cliente?.cidade || '')
    .setState(cliente?.uf || '')
    .setCountry(cliente?.pais || '')
    // Novos campos: Google e Spotify
    .setGaClientId(payload.gaClientId || '')   // cookie _ga do frontend
    .setFbp(payload.fbp || '')                 // cookie _fbp do frontend
    .setFbc(payload.fbc || '')                 // cookie _fbc do frontend

  // 3. Montar items (antes nao existia — agora envia dados de produto para Google e Spotify)
  const items = venda.itens.map((item) =>
    new ItemData()
      .setId(String(item.id_ingresso))
      .setName(item.nome)
      .setPrice(item.valor)
      .setQuantity(item.qtd)
      .setCategory(item.categoria || 'Ingressos')
  )

  // 4. Montar CustomData
  const customData = new CustomData()
    .setOrderId(String(id_venda))
    .setCurrency(venda.moeda.toLowerCase())
    .setValue(venda.valor_total)
    .setContentName(`${venda.nome_produtor}-${id_evento}`)
    .setItems(items)

  // 5. Enviar para TODAS as plataformas de uma vez
  //    (Facebook, Google, Spotify — tudo configurado no tracker)
  const result = await tracker.track('purchase', {
    userData,
    customData,
    sourceUrl: payload.sourceUrl,
    returnClientPayloads: true,  // retorna payloads para pixel client-side
  })

  // 6. result ja vem com tudo
  return {
    success: result.success,
    errors: result.errors,       // ex: [{destination: 'spotify:conn-2', message: 'Timeout'}]
    warnings: result.warnings,   // ex: [{field: 'gaClientId', message: '...'}]
    // Payloads prontos para o frontend disparar os pixels
    clientPayloads: result.clientPayloads,
    // result.clientPayloads.facebook => [{ eventName: 'Purchase', params: {...}, eventId: 'uuid' }]
    // result.clientPayloads.google   => [{ eventName: 'purchase', params: {...}, eventId: 'uuid' }]
    // result.clientPayloads.spotify  => [{ eventName: 'purchase', params: {...}, eventId: 'uuid' }]
  }
}
```

**O que mudou:**
- Nao precisa buscar tokens/pixels por request — ja esta no Tracker
- Nao precisa criar `ServerEvent`, `EventRequest` — o SDK faz tudo
- Nao precisa montar pixel data manualmente — `returnClientPayloads` devolve pronto
- Nao precisa gerar `eventId` e `timestamp` — auto-gerados (mesmo UUID para CAPI e pixel = dedup)
- SHA-256 aplicado automaticamente (email, phone, nome, etc.)
- Google e Spotify recebem o mesmo evento com zero codigo extra

---

## Caso 2: AddToCart (Carrinho)

### Antes (Facebook-only)

```typescript
async cartPhase(payload: FbEventsCart, ip: string, userAgent: string) {
  const { id_cliente, dataCart } = payload
  const ids_evento = dataCart.map((item) => Number(item.id_evento))
  const contentIds = dataCart.map((item) => String(item.id_ingresso))
  const itemCart = dataCart[0]
  const eventId = `addtocart.${id_cliente}.${contentIds.join()}.${Date.now()}`
  const totalCompra = dataCart.reduce((acc, curr) => acc + Number(curr.valor), 0)

  const newUserData = await this.createUserData(Number(id_cliente), ip, userAgent)

  const newCustomData = new CustomData()
    .setContentIds(contentIds)
    .setNumItems(contentIds.length)
    .setContentType('product_group')
    .setCurrency(itemCart.moeda.toLowerCase())
    .setValue(totalCompra)

  const newServerEvent = new ServerEvent()
    .setEventName('AddToCart')
    .setEventTime(this.getCurrentTimestamp())
    .setUserData(newUserData)
    .setCustomData(newCustomData)
    .setActionSource('website')
    .setEventId(eventId)
    .setEventSourceUrl(payload.sourceUrl)

  const { pixels, tokens } = await this._getAllPixelsAndTokens(ids_evento, Number(itemCart.id_produtor))
  const resultEvents = await this.sendFbEvent([newServerEvent], tokens)

  // Montar pixel data manualmente...
  const eventData = {
    pixels, content_name: itemCart.evento, content_ids: contentIds,
    content_type: 'product_group', value: totalCompra,
    currency: itemCart.moeda.toLowerCase(), eventId,
  }
  const encodedData = encodeURIComponent(JSON.stringify(eventData))

  return { events: resultEvents, urlParams: `event=AddToCart&data=${encodedData}` }
}
```

### Depois (marketing-sdk)

```typescript
async function addToCartPhase(payload: CartPayload, ip: string, userAgent: string) {
  const { id_cliente, dataCart } = payload
  const itemCart = dataCart[0]

  const cliente = await repository.dadosClienteById(Number(id_cliente))
  const nomes = splitNames(cliente.nome)

  const userData = new UserData()
    .setExternalId(String(id_cliente))
    .setFirstName(nomes.firstName)
    .setLastName(nomes.lastName)
    .setEmail(cliente.email)
    .setPhone(cliente.fone_celular || '')
    .setClientIpAddress(ip)
    .setClientUserAgent(userAgent)

  // Para add_to_cart, o SDK espera UM item (singular)
  // Se o carrinho tem multiplos itens, dispare um evento por item
  // ou use begin_checkout para o lote
  const item = new ItemData()
    .setId(String(itemCart.id_ingresso))
    .setName(itemCart.evento)
    .setPrice(Number(itemCart.valor))
    .setQuantity(itemCart.qtd)

  const customData = new CustomData()
    .setCurrency(itemCart.moeda.toLowerCase())
    .setValue(Number(itemCart.valor) * itemCart.qtd)
    .addItem(item)

  const result = await tracker.track('add_to_cart', {
    userData,
    customData,
    sourceUrl: payload.sourceUrl,
    returnClientPayloads: true,
  })

  return {
    success: result.success,
    clientPayloads: result.clientPayloads,
  }
}
```

**Diferenca-chave:** `add_to_cart` no schema unificado espera um unico item (como o Google e Spotify definem). Se o carrinho tem multiplos itens de uma vez, ha duas opcoes:

```typescript
// Opcao A: Disparar um evento por item
for (const cartItem of dataCart) {
  const item = new ItemData()
    .setId(String(cartItem.id_ingresso))
    .setName(cartItem.evento)
    .setPrice(Number(cartItem.valor))
    .setQuantity(cartItem.qtd)

  const customData = new CustomData()
    .setCurrency(cartItem.moeda.toLowerCase())
    .setValue(Number(cartItem.valor) * cartItem.qtd)
    .addItem(item)

  await tracker.track('add_to_cart', { userData, customData, sourceUrl: payload.sourceUrl })
}

// Opcao B: Usar begin_checkout para enviar o lote inteiro
const items = dataCart.map((cartItem) =>
  new ItemData()
    .setId(String(cartItem.id_ingresso))
    .setName(cartItem.evento)
    .setPrice(Number(cartItem.valor))
    .setQuantity(cartItem.qtd)
)

const customData = new CustomData()
  .setCurrency(dataCart[0].moeda.toLowerCase())
  .setValue(dataCart.reduce((acc, curr) => acc + Number(curr.valor) * curr.qtd, 0))
  .setItems(items)

await tracker.track('begin_checkout', { userData, customData, sourceUrl: payload.sourceUrl })
```

---

## Caso 3: InitiateCheckout

### Antes (Facebook-only)

```typescript
async initiateCheckoutPhase(payload: FbInitiateCheckout, ip: string, userAgent: string) {
  const { id_produtor, nome_evento, moeda, total, cliente, ingressos } = payload
  const contentIds = ingressos.map((item) => String(item.id_ingresso))
  const eventId = `initiatecheckout.${cliente?.cpf || total}.${contentIds.join()}`

  const userData = new UserData()
    .setExternalId(String(cliente.id))
    .setPhone(cliente.fone_celular || '')
  // ... mais campos condicionais

  const newCustomData = new CustomData()
    .setContentIds(contentIds)
    .setNumItems(contentIds.length)
    .setContentType('product_group')
    .setCurrency(moeda)
    .setValue(total)

  const newServerEvent = new ServerEvent()
    .setEventName('InitiateCheckout')
    .setEventTime(this.getCurrentTimestamp())
    .setUserData(userData)
    .setCustomData(newCustomData)
    .setActionSource('website')
    .setEventId(eventId)
    .setEventSourceUrl(payload.sourceUrl)

  // ... buscar tokens, enviar, montar pixel data
}
```

### Depois (marketing-sdk)

```typescript
async function initiateCheckoutPhase(payload: CheckoutPayload, ip: string, userAgent: string) {
  const { moeda, total, cliente, ingressos } = payload

  // UserData com campos condicionais (mesmo pattern)
  const userData = new UserData()
    .setExternalId(String(cliente.id))
    .setPhone(cliente.fone_celular || '')

  if (cliente.nome) {
    const nomes = splitNames(cliente.nome)
    userData.setFirstName(nomes.firstName).setLastName(nomes.lastName)
  }
  if (cliente.email) userData.setEmail(cliente.email)
  if (ip) userData.setClientIpAddress(ip)
  if (userAgent) userData.setClientUserAgent(userAgent)

  // Items do checkout
  const items = ingressos.map((ingresso) =>
    new ItemData()
      .setId(String(ingresso.id_ingresso))
      .setName(ingresso.nome || 'Ingresso')
      .setPrice(ingresso.valor)
      .setQuantity(ingresso.qtd)
  )

  const customData = new CustomData()
    .setCurrency(moeda)
    .setValue(total)
    .setItems(items)

  const result = await tracker.track('begin_checkout', {
    userData,
    customData,
    sourceUrl: payload.sourceUrl,
    returnClientPayloads: true,
  })

  return {
    success: result.success,
    clientPayloads: result.clientPayloads,
    // clientPayloads.facebook[0] => { eventName: 'InitiateCheckout', params: {...}, eventId: 'auto-uuid' }
    // clientPayloads.google[0]   => { eventName: 'begin_checkout',   params: {...}, eventId: 'auto-uuid' }
    // clientPayloads.spotify[0]  => { eventName: 'checkout',         params: {...}, eventId: 'auto-uuid' }
  }
}
```

---

## Caso 4: Lead (Cadastro de Interesse)

Evento novo — antes nao existia no servico Facebook, agora facil de adicionar.

```typescript
async function leadPhase(payload: LeadPayload) {
  const userData = new UserData()
    .setEmail(payload.email)
    .setPhone(payload.phone || '')
    .setClientIpAddress(payload.ip)

  const customData = new CustomData()
    .setCurrency('BRL')
    .setValue(payload.estimatedValue || 0)
    .setCategory(payload.category || 'ingresso')

  const result = await tracker.track('lead', {
    userData,
    customData,
    sourceUrl: payload.sourceUrl,
  })

  return { success: result.success, warnings: result.warnings }
}
```

---

## Caso 5: SignUp (Cadastro)

```typescript
async function signUpPhase(payload: SignUpPayload) {
  const userData = new UserData()
    .setEmail(payload.email)
    .setExternalId(String(payload.userId))
    .setClientIpAddress(payload.ip)

  const customData = new CustomData()
    .setMethod(payload.method || 'email')  // 'email', 'google', 'facebook'

  const result = await tracker.track('sign_up', {
    userData,
    customData,
    sourceUrl: payload.sourceUrl,
    returnClientPayloads: true,
  })

  return { success: result.success, clientPayloads: result.clientPayloads }
}
```

---

## Caso 6: ViewProduct (Visualizacao de Produto)

```typescript
async function viewProductPhase(payload: ViewProductPayload) {
  const userData = new UserData()
    .setClientIpAddress(payload.ip)
    .setClientUserAgent(payload.userAgent)

  // Se o usuario esta logado, adicionar dados
  if (payload.cliente) {
    userData
      .setExternalId(String(payload.cliente.id))
      .setEmail(payload.cliente.email)
  }

  const item = new ItemData()
    .setId(String(payload.id_ingresso))
    .setName(payload.nome_evento)
    .setPrice(payload.preco)
    .setCategory('Ingressos')
    .setBrand(payload.nome_produtor)

  const customData = new CustomData()
    .setCurrency('BRL')
    .setValue(payload.preco)
    .addItem(item)

  const result = await tracker.track('view_product', {
    userData,
    customData,
    sourceUrl: payload.sourceUrl,
    returnClientPayloads: true,
  })

  return { success: result.success, clientPayloads: result.clientPayloads }
}
```

---

## Caso 7: PageView

```typescript
async function pageViewPhase(payload: { ip: string; userAgent: string; sourceUrl: string }) {
  const userData = new UserData()
    .setClientIpAddress(payload.ip)
    .setClientUserAgent(payload.userAgent)

  const result = await tracker.track('page_view', {
    userData,
    sourceUrl: payload.sourceUrl,
  })

  return { success: result.success }
}
```

---

## Padroes Avancados

### Tracker Dinamico por Produtor

Se cada produtor tem suas proprias credenciais (como no codigo original que busca tokens por `ownerIds`), voce pode criar trackers dinamicos:

```typescript
const trackerCache = new Map<number, Tracker>()

async function getTrackerForProdutor(produtorId: number): Promise<Tracker> {
  if (trackerCache.has(produtorId)) return trackerCache.get(produtorId)!

  const configs = await repository.getAllTrackingConfigs(produtorId)

  const tracker = new Tracker()
    .setSourceUrl('https://www.guicheweb.com.br')
    .setActionSource('web')

  for (const fb of configs.facebook) {
    tracker.addDestination(new FacebookDestination({
      pixelId: fb.pixel_id,
      accessToken: fb.access_token,
      testEventCode: fb.test_event_code,
    }))
  }

  for (const ga of configs.google) {
    tracker.addDestination(new GoogleDestination({
      measurementId: ga.measurement_id,
      apiSecret: ga.api_secret,
    }))
  }

  for (const sp of configs.spotify) {
    tracker.addDestination(new SpotifyDestination({
      connectionId: sp.connection_id,
      bearerToken: sp.bearer_token,
    }))
  }

  trackerCache.set(produtorId, tracker)
  return tracker
}

// Uso
const tracker = await getTrackerForProdutor(produtorId)
await tracker.track('purchase', { userData, customData })
```

### Frontend-First Dedup (eventId gerado no frontend)

Por padrao, o SDK gera o `eventId` automaticamente via `crypto.randomUUID()`. Isso funciona perfeitamente quando o CAPI dispara **antes** do pixel client-side, pois o `eventId` e retornado no `clientPayloads` para o frontend usar.

Porem, se o pixel client-side dispara **antes** da resposta do backend (ex: SPA que dispara `fbq('track', ...)` no click e envia o CAPI em background), o frontend precisa gerar o `eventId` e enviar ao backend:

```typescript
// Frontend: gerar eventId ANTES de disparar o pixel
const eventId = crypto.randomUUID()

// Disparar pixel imediatamente
fbq('track', 'Purchase', purchaseParams, { eventID: eventId })
gtag('event', 'purchase', { ...purchaseParams, event_id: eventId })

// Enviar para o backend com o mesmo eventId
await fetch('/api/track/purchase', {
  method: 'POST',
  body: JSON.stringify({ ...payload, eventId }),
})

// Backend: passar o eventId para o tracker
const result = await tracker.track('purchase', {
  userData,
  customData,
  eventId: payload.eventId,  // usa o eventId do frontend
})
```

Isso garante que CAPI e pixel usam o mesmo `eventId`, permitindo deduplicacao correta em todas as plataformas. O SDK aceita eventIds de qualquer tamanho — se exceder 64 caracteres (limite do Facebook), sera truncado automaticamente via SHA-256 deterministico.

### Cookies do Frontend para Deduplicacao

Para deduplicacao perfeita, o frontend deve enviar os cookies de cada plataforma ao backend:

```typescript
// Frontend: extrair cookies e enviar junto com o request
const cookies = {
  fbp: getCookie('_fbp'),           // Facebook Browser ID
  fbc: getCookie('_fbc'),           // Facebook Click ID
  gaClientId: getCookie('_ga'),     // Google Analytics Client ID
}
// enviar `cookies` no body do request para o backend

// Backend: usar no UserData
const userData = new UserData()
  .setEmail(cliente.email)
  .setFbp(cookies.fbp || '')
  .setFbc(cookies.fbc || '')
  .setGaClientId(cookies.gaClientId || '')
```

### Usando clientPayloads no Frontend

O `returnClientPayloads` retorna objetos prontos para disparar os pixels client-side:

```typescript
// Backend retorna clientPayloads na response HTTP
const result = await tracker.track('purchase', {
  userData, customData,
  returnClientPayloads: true,
})
// response.json({ clientPayloads: result.clientPayloads })

// Frontend: recebe e dispara os pixels
const { clientPayloads } = await response.json()

// Facebook Pixel
if (clientPayloads.facebook) {
  for (const fb of clientPayloads.facebook) {
    fbq('track', fb.eventName, fb.params, { eventID: fb.eventId })
  }
}

// Google gtag
if (clientPayloads.google) {
  for (const ga of clientPayloads.google) {
    gtag('event', ga.eventName, ga.params)
  }
}

// Spotify Pixel
if (clientPayloads.spotify) {
  for (const sp of clientPayloads.spotify) {
    spdt(sp.eventName, { ...sp.params, event_id: sp.eventId })
  }
}
```

O `eventId` e o mesmo que foi enviado na CAPI — isso garante deduplicacao automatica em todas as plataformas.

### Tratamento de Erros

O SDK nunca lanca excecoes. Verifique o `result` para saber o que aconteceu:

```typescript
const result = await tracker.track('purchase', { userData, customData })

if (!result.success) {
  // Pelo menos um destino falhou
  for (const error of result.errors) {
    console.error(`[${error.destination}] ${error.message} (HTTP ${error.httpStatus})`)
    // Ex: [facebook:PX-1] Invalid access token (HTTP 400)
    // Ex: [spotify:conn-2] Network failure (HTTP undefined)
  }
}

// Warnings nao impedem o envio — sao recomendacoes
for (const warning of result.warnings) {
  console.warn(`[${warning.destination || 'sdk'}] ${warning.message}`)
  // Ex: [google] gaClientId (cookie _ga) ausente. Eventos Google serao atribuidos a usuario desconhecido.
  // Ex: [sdk] Purchase sem items. Dados de produto nao serao enviados.
}
```

---

## Tabela de Migracao Rapida

| Antes (Facebook SDK)                   | Depois (marketing-sdk)                |
|----------------------------------------|---------------------------------------|
| `new UserData().setEmail(...)`         | `new UserData().setEmail(...)` (igual)|
| `new CustomData().setOrderId(...)`     | `new CustomData().setOrderId(...)` (igual)|
| `new ServerEvent().setEventName(...)` | Nao precisa — `tracker.track('purchase')` faz isso |
| `new EventRequest(token, pixel).setEvents([...]).execute()` | Nao precisa — `tracker.track()` envia para todos |
| Montar pixel data manual + `encodeURIComponent` | `returnClientPayloads: true` |
| `Promise.allSettled(eventRequests)` | Interno ao SDK (ja isolado por destino) |
| Buscar tokens/pixels por request | Configurado 1x no Tracker (ou cache por produtor) |
| Gerar `eventId` manualmente | Auto-gerado via `crypto.randomUUID()` |
| `Math.floor(Date.now() / 1000)` para timestamp | Auto-gerado via `new Date().toISOString()` |
| Hash SHA-256 pelo Facebook SDK | Hash automatico pelo marketing-sdk |
| Apenas Facebook | Facebook + Google + Spotify simultaneamente |

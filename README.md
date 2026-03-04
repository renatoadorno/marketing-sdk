# @renatoadorno/marketing-sdk

SDK TypeScript para unificar tracking server-side (CAPI) de conversoes em e-commerce. Envia dados para **Facebook**, **Google Analytics 4** e **Spotify Ads** a partir de um unico objeto padronizado.

## Instalacao

O pacote esta hospedado no GitHub Packages. Configure o registry antes de instalar:

**1. Adicione ao `.npmrc` do seu projeto:**

```
@renatoadorno:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=SEU_GITHUB_TOKEN
```

> O `SEU_GITHUB_TOKEN` e um [Personal Access Token](https://github.com/settings/tokens) com permissao `read:packages`.

**2. Instale o pacote:**

```bash
# Bun
bun add @renatoadorno/marketing-sdk

# npm
npm install @renatoadorno/marketing-sdk

# pnpm
pnpm add @renatoadorno/marketing-sdk
```

## Quick Start

```typescript
import {
  Tracker,
  FacebookDestination,
  GoogleDestination,
  SpotifyDestination,
  UserData,
  CustomData,
  ItemData,
} from '@renatoadorno/marketing-sdk'

// 1. Configurar o tracker uma unica vez (boot do servidor)
const tracker = new Tracker()
  .setSourceUrl('https://www.seusite.com.br')
  .setActionSource('web')
  .addDestination(new FacebookDestination({
    pixelId: 'SEU_PIXEL_ID',
    accessToken: 'SEU_ACCESS_TOKEN',
  }))
  .addDestination(new GoogleDestination({
    measurementId: 'G-XXXXXXXXXX',
    apiSecret: 'SEU_API_SECRET',
  }))
  .addDestination(new SpotifyDestination({
    connectionId: 'SEU_CONNECTION_ID',
    bearerToken: 'SEU_BEARER_TOKEN',
  }))

// 2. Por requisicao: montar dados do usuario
const userData = new UserData()
  .setExternalId('12345')
  .setFirstName('Joao')
  .setLastName('Silva')
  .setEmail('joao@email.com')
  .setPhone('+5511999999999')
  .setClientIpAddress('189.0.0.1')
  .setClientUserAgent('Mozilla/5.0...')

// 3. Montar dados do evento
const item = new ItemData()
  .setId('SKU-001')
  .setName('Ingresso VIP')
  .setPrice(299.90)
  .setQuantity(1)

const customData = new CustomData()
  .setOrderId('PEDIDO-789')
  .setCurrency('BRL')
  .setValue(299.90)
  .addItem(item)

// 4. Disparar para todas as plataformas
const result = await tracker.track('purchase', {
  userData,
  customData,
  returnClientPayloads: true,
})

console.log(result.success)          // true se todos enviaram
console.log(result.errors)           // [] ou detalhes de falha por destino
console.log(result.warnings)         // campos recomendados faltando
console.log(result.clientPayloads)   // payloads prontos para pixel client-side
```

## Eventos Suportados

| Evento | Metodo | Facebook | Google GA4 | Spotify |
|--------|--------|----------|------------|---------|
| `page_view` | `tracker.track('page_view', ...)` | PageView | page_view | view |
| `view_product` | `tracker.track('view_product', ...)` | ViewContent | view_item | product |
| `add_to_cart` | `tracker.track('add_to_cart', ...)` | AddToCart | add_to_cart | addtocart |
| `begin_checkout` | `tracker.track('begin_checkout', ...)` | InitiateCheckout | begin_checkout | checkout |
| `purchase` | `tracker.track('purchase', ...)` | Purchase | purchase | purchase |
| `lead` | `tracker.track('lead', ...)` | Lead | generate_lead | lead |
| `sign_up` | `tracker.track('sign_up', ...)` | CompleteRegistration | sign_up | signup |

## Builders

### UserData

Dados do usuario. O SDK aplica SHA-256 automaticamente onde cada plataforma exige.

```typescript
const userData = new UserData()
  .setEmail('joao@email.com')       // hash automatico para FB, Google, Spotify
  .setPhone('+5511999999999')       // hash automatico
  .setFirstName('Joao')             // hash para FB e Google
  .setLastName('Silva')
  .setClientIpAddress('189.0.0.1')  // sem hash (FB e Spotify usam raw)
  .setClientUserAgent('Mozilla...')
  .setExternalId('12345')
  .setCity('Sao Paulo')
  .setState('SP')
  .setZipCode('01001-000')
  .setCountry('BR')
  .setGender('m')
  .setBirthDate('19900115')
  // Cookies do frontend (importantes para deduplicacao)
  .setGaClientId('GA1.2.123...')    // cookie _ga (obrigatorio para Google)
  .setFbp('fb.1.123...')            // cookie _fbp (melhora matching Facebook)
  .setFbc('fb.1.123...')            // cookie _fbc
  .setGclid('CjwK...')             // Google Click ID
  .setDeviceId('device-abc')        // mobile device ID
```

### ItemData

Produto ou ingresso individual.

```typescript
const item = new ItemData()
  .setId('SKU-001')
  .setName('Ingresso Pista')
  .setPrice(150.00)
  .setQuantity(2)
  .setCategory('Ingressos')
  .setBrand('Produtor X')
  .setVariant('Meia-entrada')
  .setCoupon('PROMO10')
  .setDiscount(15.00)
```

### CustomData

Dados do evento/conversao. Campos variam por tipo de evento.

```typescript
// Purchase
const customData = new CustomData()
  .setOrderId('PEDIDO-789')        // transactionId para deduplicacao
  .setCurrency('BRL')
  .setValue(300.00)
  .setTax(10.00)
  .setShipping(15.00)
  .setCoupon('PROMO10')
  .setDiscountCode('DESC10')
  .setIsNewCustomer(true)
  .addItem(item1)
  .addItem(item2)

// Lead
const leadData = new CustomData()
  .setValue(50.00)
  .setType('newsletter')
  .setCategory('marketing')

// SignUp
const signUpData = new CustomData()
  .setMethod('google')
```

## Multiplas Contas

Suporta multiplas credenciais da mesma plataforma:

```typescript
const tracker = new Tracker()
  .addDestination(new FacebookDestination({ pixelId: 'PIXEL_1', accessToken: 'TOKEN_1' }))
  .addDestination(new FacebookDestination({ pixelId: 'PIXEL_2', accessToken: 'TOKEN_2' }))
  .addDestination(new GoogleDestination({ measurementId: 'G-AAA', apiSecret: 'SECRET_A' }))
  .addDestination(new SpotifyDestination({ connectionId: 'CONN_1', bearerToken: 'TK_1' }))
  .addDestination(new SpotifyDestination({ connectionId: 'CONN_2', bearerToken: 'TK_2' }))
  .addDestination(new SpotifyDestination({ connectionId: 'CONN_3', bearerToken: 'TK_3' }))
```

## Client-Side Payloads (Deduplicacao)

O SDK envia via CAPI (server-side) e opcionalmente retorna payloads formatados para o pixel client-side, compartilhando o mesmo `eventId` para deduplicacao:

```typescript
const result = await tracker.track('purchase', {
  userData, customData,
  returnClientPayloads: true,
})

// Frontend usa os payloads retornados:
// fbq('track', 'Purchase', result.clientPayloads.facebook[0].params, { eventID: result.clientPayloads.facebook[0].eventId })
// gtag('event', 'purchase', result.clientPayloads.google[0].params)
// spdt('purchase', { ...result.clientPayloads.spotify[0].params })
```

## Tratamento de Erros

O SDK nunca lanca excecoes. Falhas em um destino nao afetam os outros:

```typescript
const result = await tracker.track('purchase', { userData, customData })

result.success       // false se algum destino falhou
result.errors        // [{ destination: 'facebook:PX-1', message: '...', httpStatus: 400 }]
result.warnings      // [{ field: 'gaClientId', message: 'cookie _ga ausente...' }]
result.destinations  // status individual de cada destino
```

## Testes

```bash
bun test
```

## Documentacao

- `docs/use-cases.md` — Casos de uso detalhados com migracao do Facebook SDK

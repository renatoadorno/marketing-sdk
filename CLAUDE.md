# marketing-sdk

SDK unificado de tracking server-side (CAPI) para e-commerce. Envia eventos para Facebook, Google GA4 e Spotify Ads.

## Runtime

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun install` instead of `npm install`
- Use `bunx <package>` instead of `npx <package>`
- Bun automatically loads .env, so don't use dotenv.
- Use native `fetch()` for HTTP. Don't use `axios`.
- Use `Bun.CryptoHasher` for SHA-256 hashing.

## Arquitetura

```
src/
├── index.ts                      # Barrel exports
├── tracker.ts                    # Tracker singleton (core)
├── builders/
│   ├── user-data.ts              # UserData fluent builder
│   ├── custom-data.ts            # CustomData fluent builder
│   └── item-data.ts              # ItemData fluent builder
├── destinations/
│   ├── destination.ts            # Interface Destination + configs
│   ├── facebook-destination.ts   # Facebook CAPI (graph.facebook.com)
│   ├── google-destination.ts     # Google MP (google-analytics.com/mp/collect)
│   └── spotify-destination.ts    # Spotify CAPI (capi.spotify.com)
├── mappers/
│   ├── facebook-mapper.ts        # UnifiedEvent → Facebook format
│   ├── google-mapper.ts          # UnifiedEvent → Google format
│   └── spotify-mapper.ts         # UnifiedEvent → Spotify format
├── types/
│   ├── unified-events.ts         # Schema canonico (UnifiedEvent union)
│   ├── mapper-types.ts           # PlatformMapper interface
│   ├── track-result.ts           # TrackResult, errors, warnings
│   ├── facebook.ts               # Re-exports de interfaces/facebook/
│   ├── google.ts                 # Re-exports de interfaces/google/
│   └── spotify.ts                # Re-exports de interfaces/spotify/
└── core/
    ├── hash.ts                   # sha256() via Bun.CryptoHasher
    ├── event-assembler.ts        # Builders → UnifiedEvent
    └── validator.ts              # Warnings por tipo de evento
```

## Decisoes Arquiteturais

- **Builder Pattern**: UserData, CustomData, ItemData com fluent API
- **Tracker singleton**: destinations configurados 1x no boot, userData/customData por chamada
- **Envio imediato**: sem batching/fila. `tracker.track()` envia direto para todas as APIs
- **SHA-256 automatico**: usuario envia dados raw, SDK faz hash com normalizacao por plataforma
- **CAPI + Pixel hibrido**: CAPI por padrao, `returnClientPayloads: true` retorna pixel payloads
- **Erros nao-bloqueantes**: nunca throw. Retorna `errors[]` e `warnings[]`. Falha em um destino nao bloqueia os outros
- **Zero dependencias**: usa fetch nativo e Bun.CryptoHasher. Sem axios, sem facebook-nodejs-business-sdk

## Interfaces de Plataforma

Interfaces TypeScript de cada plataforma estao em `interfaces/`:
- `interfaces/facebook/capi.ts` e `pixel.ts`
- `interfaces/google/capi.ts` e `pixel.ts`
- `interfaces/spotify/capi.ts` e `pixel.ts`

Referencias detalhadas (docs, resumos, analise comparativa) em `.claude/skills/tracking-platforms/references/`.

## Fluxo de Dados

```
UserData builder  ──┐
                    ├── EventAssembler ──> UnifiedEvent ──> Mapper ──> fetch() POST
CustomData builder ─┘     (auto eventId,     (union         (por         (endpoint
ItemData builder ───┘      timestamp)      discriminada)   plataforma)   especifico)
```

## Testing

```bash
bun test
```

Tests in `tests/` cover: builders, hash, assembler, validator, destinations (mock fetch), tracker e2e.

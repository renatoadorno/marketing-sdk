---
name: tracking-platforms
description: Use para dúvidas e implementação de tracking para e-commerce com Google Analytics/Ads, Facebook Pixel+CAPI e Spotify Pixel+CAPI. Cobre mapeamento de eventos, deduplicação, parâmetros obrigatórios, hashing SHA-256 e arquitetura híbrida client-side + server-side.
---

# Tracking Platforms (Google, Facebook, Spotify)

Guia para decisões e implementação de tracking de conversão em e-commerce, cobrindo Google Analytics 4 / Ads, Facebook (Meta) Pixel + CAPI, e Spotify Pixel + CAPI.

## Arquivos de Referência

| Diretório | Conteúdo | Arquivos |
|-----------|----------|----------|
| `references/analise-comparativa.md` | **Análise comparativa unificada** entre as 3 plataformas | 1 arquivo |
| `references/google/` | Docs Google (gtag, Measurement Protocol, server-side) | 8 arquivos |
| `references/facebook/` | Docs Facebook (Pixel, CAPI, deduplicação) | 10 arquivos |
| `references/spotify/` | Docs Spotify (Pixel, CAPI, event types) | 5 arquivos |
| `references/interfaces/` | **Interfaces TypeScript** (Pixel + CAPI por plataforma) | 6 arquivos |

> **REGRA**: Use o script `inspect.cjs` para navegar e buscar nos arquivos. Evite abrir múltiplos arquivos manualmente.

### Resumos Consolidados (consulte primeiro)

Cada plataforma possui um **resumo consolidado** que cobre tudo de forma objetiva:

- `references/google/resumo-google-analytics.md` (17KB)
- `references/facebook/resumo-facebook.md` (19KB)
- `references/spotify/resumo-spotify.md` (12KB)
- `references/analise-comparativa.md` (13KB) — comparação cross-platform

## Ferramenta de Inspeção (`scripts/inspect.cjs`)

**Caminho base**: `node .gemini/skills/tracking-platforms/scripts/inspect.cjs`

### Comandos

**1. Listar todos os arquivos de referência:**
```bash
node .gemini/skills/tracking-platforms/scripts/inspect.cjs list-files
# Filtrar por plataforma:
node .gemini/skills/tracking-platforms/scripts/inspect.cjs list-files google
```

**2. Ver resumo consolidado de uma plataforma:**
```bash
node .gemini/skills/tracking-platforms/scripts/inspect.cjs summary google
node .gemini/skills/tracking-platforms/scripts/inspect.cjs summary facebook
node .gemini/skills/tracking-platforms/scripts/inspect.cjs summary spotify
```

**3. Buscar um termo em todos os arquivos:**
```bash
node .gemini/skills/tracking-platforms/scripts/inspect.cjs search "event_id"
# Restringir a uma plataforma:
node .gemini/skills/tracking-platforms/scripts/inspect.cjs search "Purchase" facebook
```

**4. Ver mapa de equivalência de eventos:**
```bash
node .gemini/skills/tracking-platforms/scripts/inspect.cjs events
```
→ Mostra o mapeamento completo entre Google, Facebook e Spotify.

**5. Comparar um aspecto entre plataformas:**
```bash
node .gemini/skills/tracking-platforms/scripts/inspect.cjs compare <aspecto>
```
Aspectos disponíveis:

| Aspecto | O que compara |
|---------|---------------|
| `dedup` | Mecanismos de deduplicação |
| `userdata` | Customer matching e dados de usuário |
| `structure` | Estrutura de request server-side |
| `params` | Parâmetros de evento |
| `limits` | Limitações de cada plataforma |
| `auth` | Autenticação e endpoints |
| `custom` | Eventos personalizados |

**6. Listar interfaces TypeScript:**
```bash
node .gemini/skills/tracking-platforms/scripts/inspect.cjs interfaces
# Por plataforma:
node .gemini/skills/tracking-platforms/scripts/inspect.cjs interfaces facebook
```

**7. Ler um arquivo específico:**
```bash
node .gemini/skills/tracking-platforms/scripts/inspect.cjs read facebook/[CAPI]-parametros.md
node .gemini/skills/tracking-platforms/scripts/inspect.cjs read interfaces/google/pixel.ts
```

## Fluxo de Consulta Recomendado

### Cenário 1: Preciso implementar um evento

1. Use `events` para ver o nome equivalente em cada plataforma
2. Use `search "<nome_evento>" <plataforma>` para encontrar detalhes específicos
3. Use `interfaces <plataforma>` para ver os tipos TypeScript disponíveis
4. Se necessário, `read interfaces/<plataforma>/pixel.ts` ou `capi.ts` para ver os campos

### Cenário 2: Dúvida sobre uma configuração específica

1. Use `search "<termo>"` para localizar o assunto em todos os arquivos
2. Use `summary <plataforma>` para contexto completo
3. Use `read <caminho>` para o arquivo específico

### Cenário 3: Comparar como as plataformas tratam algo

1. Use `compare <aspecto>` para ver a tabela comparativa
2. Se precisar de mais detalhes, `summary <plataforma>` para cada uma

## Princípios-base (sempre válidos)

1. Arquitetura híbrida: **Pixel no browser + API server-side**
2. Sempre gere um **ID único por evento** para deduplicação
3. Envie `value` + `currency` em eventos de receita
4. Trate PII com normalização e **hash SHA-256** antes de enviar
5. Não dispare compra em página recarregável sem idempotência

## Mapa rápido de equivalência de eventos

| Funil | Google (GA4) | Facebook (Pixel/CAPI) | Spotify (Pixel/CAPI) |
|---|---|---|---|
| Visualização de item | `view_item` | `ViewContent` | `product` / `PRODUCT` |
| Adição ao carrinho | `add_to_cart` | `AddToCart` | `addtocart` / `ADD_TO_CART` |
| Início checkout | `begin_checkout` | `InitiateCheckout` | `checkout` / `CHECK_OUT` |
| Compra | `purchase` | `Purchase` | `purchase` / `PURCHASE` |
| Lead | `generate_lead` | `Lead` | `lead` / `LEAD` |
| Cadastro | `sign_up` | `CompleteRegistration` | `signup` / `SIGN_UP` |

## Deduplicação por plataforma

- **Google**: `transaction_id` estável por pedido (permanente)
- **Facebook**: `eventID` (Pixel) = `event_id` (CAPI) + mesmo `event_name` (janela 48h)
- **Spotify**: mesmo `event_id` em Pixel e CAPI, no mesmo dataset

## Checklist de implementação

1. Definir taxonomia interna única de eventos (agnóstica de plataforma)
2. Criar mapper por plataforma (somente renomeia campos e formatos)
3. Garantir geração de `event_id` único por ação relevante
4. Disparar Pixel no client e CAPI/MP no backend para os mesmos eventos
5. Aplicar idempotência no backend (`transaction_id`/`event_id` por pedido)
6. Validar payloads em ambiente de teste e monitorar deduplicação

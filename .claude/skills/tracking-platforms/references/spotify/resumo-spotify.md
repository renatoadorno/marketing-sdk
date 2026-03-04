# Spotify Ads — Resumo Completo: Pixel e Conversions API (CAPI)

## O que é cada coisa

### Spotify Pixel
É um snippet JavaScript que roda no **navegador do usuário**. Captura ações (eventos) dos visitantes no site após ouvirem/verem anúncios no Spotify. Serve para mensuração de campanhas e atribuição de conversões.

A função global é `spdt()` (equivalente ao `fbq()` do Facebook). O script é carregado de `https://pixel.byspotify.com/ping.min.js`.

### Conversions API (CAPI)
É uma integração **server-to-server** (tagless). Permite enviar eventos de conversão (web, app ou offline) diretamente do seu backend para o Spotify, sem depender do navegador. Oferece atribuição cross-device.

### Quando usar os dois juntos
O Spotify recomenda criar um **dataset** para habilitar medição de conversão deduplicada quando se usa Pixel + CAPI. A deduplicação é feita via `event_id`.

---

## Configuração do Pixel

### Base Code (obrigatório)
O código base inclui o evento **Page View** por padrão. Deve ser instalado entre as tags `<head>` de **no mínimo 3 páginas** do seu site para enviar dados de baseline suficientes.

```js
<script>
  (function(w, d){
    var id='spdt-capture', n='script';
    if (!d.getElementById(id)) {
      w.spdt =
        w.spdt ||
        function() {
          (w.spdt.q = w.spdt.q || []).push(arguments);
        };
      var e = d.createElement(n); e.id = id; e.async=1;
      e.src = 'https://pixel.byspotify.com/ping.min.js';
      var s = d.getElementsByTagName(n)[0];
      s.parentNode.insertBefore(e, s);
    }
    w.spdt('conf', { key: 'SUA_PIXEL_KEY' });
    w.spdt('view');  // Page View padrão
  })(window, document);
</script>
```

> **Cuidado:** Cada anunciante precisa gerar seu próprio Pixel no Ads Manager. Os códigos de exemplo da documentação não funcionam por si só.

---

## Eventos do Pixel (Standard Events)

Todos os eventos são chamados via `w.spdt('nome_do_evento', {params})`. Os parâmetros são **opcionais**, mas recomendados para granularidade nos relatórios.

### Page View (`view`)
- Mede a ação de alguém acessar uma página
- **Já incluso no base code** — não precisa adicionar separadamente
- **Boa prática:** instalar em 3+ páginas para baseline suficiente

### View Product (`product`)
- Mede a visualização de uma página de produto específico
- **Boa prática:** usar o parâmetro `product_name` para identificar qual produto foi visto
- Parâmetros comuns: `value`, `currency`, `product_id`, `product_name`, `product_type`, `product_vendor`, `event_id`

### Lead (`lead`)
- Mede quando alguém submete informações expressando interesse (ex: email para newsletter)
- Deve disparar **apenas** no resultado desejado (ex: confirmação do formulário, não na abertura)
- Pode ser por trigger de ação (submit) ou por visita a página específica
- Parâmetros comuns: `type`, `category`, `currency`, `value`, `event_id`

### Sign Up (`signup`)
- Mede a ação de se registrar/cadastrar para evento, produto ou serviço
- Parâmetros comuns: `event_id`

### Add to Cart (`addtocart`)
- Mede quando um item é adicionado ao carrinho (antes da compra)
- Parâmetros comuns: `value`, `currency`, `quantity`, `product_id`, `product_name`, `product_type`, `product_vendor`, `variant_id`, `variant_name`, `event_id`

### Start Checkout (`checkout`)
- Mede quando o usuário inicia o processo de checkout
- Parâmetros comuns: `value`, `currency`, `quantity`, `line_items`, `event_id`

### Purchase (`purchase`)
- Mede a conclusão de uma compra (geralmente na página de confirmação/thank you)
- Parâmetros comuns: `value`, `currency`, `discount_code`, `is_new_customer`, `line_items`, `event_id`

### Alias (`alias`)
- Envia dados de identificação do cliente para o Spotify
- Parâmetros: `email`, `phone_number`

### Custom Events (`custom_event_1` a `custom_event_5`)
- Eventos personalizados para ações que não se encaixam nos padrão
- **Limite:** máximo de **5 custom events** por conta
- **Em beta:** não podem ser renomeados. Aparecem nos relatórios como "Custom Event 1", "Custom Event 2", etc.

> **Cuidado:** Como custom events não podem ser renomeados durante o beta, **documente qual custom event corresponde a qual ação** na configuração inicial.

---

## Parâmetros do Pixel (todos opcionais, em beta)

Parâmetros são objetos passados junto com eventos para dar mais granularidade.

- **`quantity`** (int) — Quantidade de itens. Usado com `addtocart`, `checkout`, `purchase`
- **`category`** (string) — Campo customizável para eventos `lead`
- **`currency`** (string) — Moeda para eventos de receita. **Obrigatório junto com `value` para calcular AOV, ROAS e CAC**
- **`is_new_customer`** (boolean) — Indica se é cliente novo
- **`product_id`** (string) — ID único do produto
- **`product_name`** (string) — Nome do produto/página
- **`product_type`** (string) — Categoria do produto (ex: "Accessories")
- **`product_vendor`** (string) — Vendedor/marca (ex: "Adidas")
- **`type`** (string) — Campo customizável para eventos `lead`
- **`value`** (float) — Valor monetário. **Obrigatório junto com `currency` para calcular AOV, ROAS e CAC**
- **`variant_id`** (string) — ID da variante do produto
- **`variant_name`** (string) — Nome correspondente ao variant_id
- **`event_id`** (string) — ID único do evento, **usado para deduplicação** Pixel ↔ CAPI
- **`line_items`** (list) — Metadados adicionais (itens da compra com `value` e `quantity`)
- **`discount_code`** (string) — Código de desconto

> **Importante:** Para métricas de receita (AOV, ROAS, CAC), os parâmetros `value` **e** `currency` devem ser instalados **juntos** em um evento de receita (purchase, checkout, etc.).

---

## Conversions API (CAPI) — Integração Server-to-Server

### Configuração

1. No Ads Manager, navegue até **Events** no menu global
2. Clique em **Connect data source** → **Conversions API**
3. Nomeie sua Conversions API
4. Se usar Pixel também, **crie um dataset** para deduplicação
5. Conecte as Ad Account(s) desejadas
6. Gere o **token de autenticação** (até 3 tokens simultâneos; não expiram)
7. Copie o **token** e o **Connection ID**

### Autenticação
- Token de longa duração (não expira)
- Máximo de **3 tokens ativos** por vez. Para criar um novo além do limite, delete um existente
- O token é usado como Bearer token no header de autenticação

### Connection ID
- Chave única da sua organização
- Só é possível enviar eventos para Connection IDs pertencentes à org que gerou o token

---

## Estrutura de Dados da CAPI

### Endpoint
- **URL:** `https://capi.spotify.com/capi-direct/events/`
- **Método:** POST
- **Content-Type:** application/json
- **Authorization:** Bearer [access_token]

### Request Body

**Nível raiz:**
- **`capi_connection_id`** (string) — **Obrigatório.** UUID do Connection ID para mapear o dataset
- **`events`** (list) — **Obrigatório.** Lista de ConversionEvent

### ConversionEvent

**Obrigatórios:**
- **`event_id`** (string) — ID único do evento, escolhido pelo anunciante. Usado para deduplicação
- **`event_name`** (string) — Nome do evento de conversão. Valores aceitos: `PRODUCT`, `CHECK_OUT`, `ADD_TO_CART`, `PURCHASE`, `LEAD`, `ALIAS`, `SIGN_UP`, `CUSTOM_EVENT_1` a `CUSTOM_EVENT_5`
- **`event_time`** (long) — Timestamp RFC 3339 de quando o evento ocorreu. **Deve estar no passado**
- **`user_data`** (UserData) — Identificadores do usuário. **Pelo menos um identificador é obrigatório**

**Opcionais:**
- **`event_source_url`** (string) — URL onde o evento ocorreu. Deve começar com `http://` ou `https://`
- **`action_source`** (string) — Meio da conversão: `WEB`, `APP` ou `OFFLINE`
- **`opt_out_targeting`** (boolean) — Se `true`, evento usado apenas para atribuição (não retargeting)
- **`event_details`** (EventDetails) — Detalhes adicionais do evento

### UserData (pelo menos 1 obrigatório)

- **`hashed_emails`** (list de strings) — Emails do cliente hasheados em **SHA-256**
- **`device_id`** (string) — **Recomendado.** Device ID raw do dispositivo do cliente
- **`hashed_phone_number`** (string) — Telefone hasheado em **SHA-256**
- **`ip_address`** (string) — **Recomendado.** IP do dispositivo do cliente

> **Boa prática:** Envie `ip_address` e `device_id` sempre que possível para melhor matching.

### EventDetails (opcional)

- **`amount`** (double) — Valor monetário. **Obrigatório para eventos PURCHASE**
- **`currency`** (string) — Código de moeda ISO 4217. **Obrigatório para eventos PURCHASE**
- **`content_name`** (string) — Nome do produto/página
- **`content_category`** (string) — Categoria do conteúdo. Deve estar alinhada com a **Google Product Taxonomy**

---

## Deduplicação Pixel ↔ CAPI

A deduplicação é feita via **`event_id`**. O mesmo `event_id` enviado pelo Pixel e pela CAPI para o mesmo evento é reconhecido como duplicata.

Para funcionar:
1. O `event_id` do Pixel (`w.spdt('purchase', {event_id: 'XYZ'})`) deve bater com o `event_id` da CAPI
2. Os eventos devem pertencer ao mesmo **dataset** (configurado na criação da CAPI)

---

## Diferenças notáveis comparado ao Facebook

- **Identificadores de usuário** são mais simples: apenas IP, device ID, email hasheado e telefone hasheado (sem `fbp`, `fbc`, `external_id`, etc.)
- **Nomes de eventos na CAPI** usam UPPER_SNAKE_CASE (`PURCHASE`, `ADD_TO_CART`, `CHECK_OUT`), diferente do Pixel que usa lowercase (`purchase`, `addtocart`, `checkout`)
- **Custom events** têm limite rígido de **5** e **não podem ser renomeados** (aparecem como "Custom Event 1", etc.)
- **Token não expira** (diferente de muitas APIs que exigem refresh)
- **Não existe** equivalente ao `action_source` obrigatório como no Facebook (é opcional no Spotify)
- **`event_id` é obrigatório** na CAPI (no Facebook é recomendado, mas tecnicamente opcional)
- **Parâmetros do Pixel** estão em beta

---

## Exemplo completo — Request da CAPI

```json
{
  "conversion_events": {
    "capi_connection_id": "[CONNECTION_ID]",
    "events": [
      {
        "event_name": "PURCHASE",
        "event_id": "bcde3456",
        "event_time": "2022-10-12T07:00:00.00Z",
        "user_data": {
          "device_id": "rawdeviceid123xyz"
        },
        "event_details": {
          "content_category": "35",
          "currency": "USD",
          "amount": 100.0
        }
      },
      {
        "event_name": "CHECK_OUT",
        "event_id": "xyz987",
        "event_time": "2022-10-12T07:00:00.00Z",
        "user_data": {
          "hashed_emails": ["sha256hashedemail"],
          "device_id": "rawdeviceid123xyz"
        },
        "event_details": {
          "content_category": "90"
        }
      }
    ]
  }
}
```

Resposta de sucesso: `200 OK` com `{"message": "SUCCESS"}`

---

## Checklist de Cuidados

1. **Base code em 3+ páginas:** O Pixel precisa estar em no mínimo 3 páginas para baseline suficiente
2. **`value` + `currency` juntos:** Sempre envie os dois para eventos de receita, senão AOV/ROAS/CAC não são calculados
3. **Custom events — documente:** Como não podem ser renomeados (beta), mantenha documentação de qual `custom_event_N` mapeia para qual ação
4. **Custom events — limite de 5:** Não há possibilidade de adicionar mais
5. **Token — guarde com segurança:** O token da CAPI não expira e dá acesso indefinido
6. **Connection ID:** Só aceita eventos da mesma org que gerou o token
7. **CAPI `event_id` é obrigatório:** Diferente do Facebook onde é recomendado
8. **CAPI `event_time` deve estar no passado:** Timestamps futuros são rejeitados
9. **Pelo menos 1 identificador no `user_data`:** IP, device ID, email hasheado ou telefone hasheado
10. **Hashing:** Use SHA-256 para emails e telefones na CAPI
11. **`content_category` na CAPI:** Alinhe com Google Product Taxonomy
12. **Nomes de eventos na CAPI são UPPER_SNAKE_CASE:** `PURCHASE`, não `purchase`
13. **Deduplicação exige dataset:** Crie um dataset ao configurar a CAPI se também usar Pixel
14. **Evento Lead — cuidado com o trigger:** Garanta que dispara apenas no resultado desejado, não na abertura do formulário

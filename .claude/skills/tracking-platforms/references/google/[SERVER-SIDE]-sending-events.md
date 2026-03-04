# Enviar eventos do Measurement Protocol para o Google Analytics
Este guia explica como enviar a um servidor do Analytics os eventos de fluxos de app e Web do Measurement Protocol do Google Analytics. Assim, você pode conferir eventos do Measurement Protocol nos seus relatórios do Analytics.

Escolha a plataforma a ser retratada neste guia:

## Formatar a solicitação

O Measurement Protocol do Google Analytics só oferece suporte a solicitações `POST` HTTP.

Para enviar um evento, use este formato:

```
POST /mp/collect HTTP/1.1
HOST: www.google-analytics.com
Content-Type: application/json

PAYLOAD_DATA
```

É necessário informar o seguinte no URL da solicitação:

- `api_secret`: a **chave secreta da API** gerada na interface do Google Analytics.

Para criar uma chave secreta, navegue até
**Administrador** \> **Coleta e modificação de dados** \> **Fluxos de dados** >
**escolha seu fluxo** \> **Chaves secretas da API Measurement Protocol** \> **Criar**.

- `measurement_id`: o ID de métricas associado a um fluxo, que fica na interface do Google Analytics, em **Administrador** \> **Fluxos de dados** \> **escolha seu fluxo** \> **ID de métricas**.

O `measurement_id` não é o **ID do fluxo**.

É necessário fornecer um corpo de solicitação no formato JSON POST body para o Measurement Protocol. Veja um exemplo:

```
  {
   "client_id": "CLIENT_ID",
   "events": [\
      {\
        "name": "login",\
        "params": {\
          "method": "Google",\
          "session_id": "SESSION_ID",\
          "engagement_time_msec": 100\
        }\
      }\
   ]
  }
```

Embora `session_start` seja um nome de evento reservado, criar um novo `session_id` gera uma nova sessão sem a necessidade de enviar `session_start`. Saiba como as sessões são contabilizadas.

## Testar

Confira um exemplo que você pode usar para enviar vários eventos de uma só vez. Este exemplo envia um evento `tutorial_begin` e um evento `join_group` ao servidor do Google Analytics, inclui informações geográficas usando o campo `user_location` e inclui informações do dispositivo usando o campo `device`.

```
const measurementId = "MEASUREMENT_ID";
const apiSecret = "API_SECRET";

fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
  method: "POST",
  body: JSON.stringify({
    client_id: "CLIENT_ID",
    events: [\
      {\
        name: "tutorial_begin",\
        params: {\
          "session_id": "SESSION_ID",\
          "engagement_time_msec": 100\
        }\
      },\
      {\
        name: "join_group",\
        params: {\
          "group_id": "G_12345",\
          "session_id": "SESSION_ID",\
          "engagement_time_msec": 150\
        }\
      }\
    ],
    user_location: {
      city: "Mountain View",
      region_id: "US-CA",
      country_id: "US",
      subcontinent_id: "021",
      continent_id: "019"
    },
    device: {
      category: "mobile",
      language: "en",
      screen_resolution: "1280x2856",
      operating_system: "Android",
      operating_system_version: "14",
      model: "Pixel 9 Pro",
      brand: "Google",
      browser: "Chrome",
      browser_version: "136.0.7103.60"
    }
  })
});
```

## Substituir carimbo de data/hora

O Measurement Protocol usa o carimbo de data/hora _first_ que encontra na seguinte lista para cada evento e propriedade do usuário na solicitação:

1. O `timestamp_micros` do evento ou da propriedade do usuário.
2. O `timestamp_micros` da solicitação.
3. O horário em que o Measurement Protocol recebe a solicitação.

O exemplo a seguir envia uma marca de tempo no nível da solicitação que se aplica a todos os
eventos e propriedades do\\
usuário na
solicitação. Como resultado, o Measurement Protocol atribui um carimbo de data/hora de
`requestUnixEpochTimeInMicros` aos eventos `tutorial_begin` e `join_group`
e à propriedade do usuário `customer_tier`.

```
{
  "timestamp_micros": requestUnixEpochTimeInMicros,
  "events": [\
    {\
      "name": "tutorial_begin"\
    },\
    {\
      "name": "join_group",\
      "params": {\
        "group_id": "G_12345",\
      }\
    }\
  ],
  "user_properties": {
    "customer_tier": {
      "value": "PREMIUM"
    }
  }
}
```

O exemplo a seguir envia um carimbo de data/hora no nível da solicitação, um carimbo de data/hora no nível do evento e um carimbo de data/hora no nível da propriedade do usuário. Como resultado, o Protocolo de medição atribui os seguintes carimbos de data/hora:

- `tutorialBeginUnixEpochTimeInMicros` para o evento `tutorial_begin`
- `customerTierUnixEpochTimeInMicros` para a propriedade do usuário `customer_tier`
- `requestUnixEpochTimeInMicros` para o evento `join_group` e a propriedade do usuário `newsletter_reader`.

```
{
  "timestamp_micros": requestUnixEpochTimeInMicros,
  "events": [\
    {\
      "name": "tutorial_begin",\
      "timestamp_micros": tutorialBeginUnixEpochTimeInMicros\
    },\
    {\
      "name": "join_group",\
      "params": {\
        "group_id": "G_12345",\
      }\
    }\
  ],
  "user_properties": {
    "customer_tier": {
      "value": "PREMIUM",
      "timestamp_micros": customerTierUnixEpochTimeInMicros
    },
    "newsletter_reader": {
      "value": "true"
    }
  }
}
```

### Comportamento de validação para eventos passados e propriedades do usuário

Os eventos e as propriedades do usuário podem ser atualizados em até 72 horas. Se o valor de `timestamp_micros` for anterior a 72 horas, o Measurement Protocol vai aceitar ou rejeitar o evento ou a propriedade do usuário da seguinte forma:

- Se `validation_behavior` não estiver definido ou estiver definido como `RELAXED`, o Protocolo de
Medição vai aceitar o evento ou a propriedade do usuário, mas vai substituir o
carimbo de data/hora por 72 horas atrás.
- Se o `validation_behavior` estiver definido como `ENFORCE_RECOMMENDATIONS`, o Measurement Protocol vai rejeitar o evento ou a propriedade do usuário.

## Limitações

As limitações a seguir são válidas para o envio de eventos do Measurement Protocol ao Google Analytics:

- As solicitações podem ter no máximo 25 eventos.
- Os eventos podem ter no máximo 25 parâmetros.
- Os eventos podem ter até 25 propriedades do usuário.
- Os nomes das propriedades do usuário podem ter, no máximo, 24 caracteres.
- Os valores de propriedade do usuário precisam ter, no máximo, 36 caracteres.
- Os nomes dos eventos precisam ter no máximo 40 caracteres alfanuméricos e sublinhados, além de começar com um caractere alfabético.
- Os nomes dos parâmetros (incluindo os parâmetros de item) precisam ter no máximo 40 caracteres alfanuméricos e sublinhados, além de começar com um caractere alfabético.
- Os valores de parâmetros, incluindo os de itens, precisam ter no máximo 100 caracteres em uma propriedade padrão do Google Analytics e 500 caracteres em uma propriedade do Google Analytics 360.

Esse limite não se aplica aos parâmetros `session_id` e `session_number` quando os valores são fornecidos pelas variáveis integradas ID da sessão do Google Analytics e Número da sessão do Google Analytics no Gerenciador de tags do Google.

- Os parâmetros de itens podem ter no máximo 10 parâmetros personalizados.

- O corpo da postagem precisa ter menos de 130 KB.

- O carimbo de data/hora precisa estar dentro das últimas 72 horas. Consulte Comportamento de validação para eventos anteriores para mais detalhes.

- Eventos de app relacionados ao Measurement Protocol que são enviados ao Google Analytics não adicionam usuários de apps para preencher os públicos-alvo de pesquisa no Google Ads.

Para outros requisitos de cada caso de uso, consulte casos de uso comuns.

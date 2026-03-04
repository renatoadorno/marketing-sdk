# Enviar propriedades do usuário
As propriedades do usuário descrevem segmentos da sua base de usuários, como preferência de idioma ou localização geográfica. O Google Analytics registra algumas propriedades automaticamente. Se você quiser coletar mais propriedades, pode configurar até 25 adicionais por projeto. Consulte Propriedades do usuário personalizadas para saber como definir e registrar propriedades do usuário.

As propriedades do usuário melhoram a segmentação, mas os dados referentes a essas propriedades costumam ficar somente no servidor. Com o Measurement Protocol, você pode aumentar
medições do lado do cliente com dados do lado do servidor, o que normalmente é inviável
usando apenas soluções do lado do cliente.

## Nomes reservados

Alguns nomes de propriedade do usuário são reservados e não podem ser utilizados em medições:

- `first_open_time`
- `first_visit_time`
- `last_deep_link_referrer`
- `user_id`
- `first_open_after_install`

Além disso, eles não podem começar com:

- `google_`
- `ga_`
- `firebase_`

## Exemplo de uso

No exemplo a seguir, o CRM tem uma propriedade do usuário (`customer_tier`) que você quer adicionar às medições. `customer_tier` pode ser definido como `premium` ou `standard`. Para receber essa propriedade do usuário nos seus relatórios, faça o seguinte:

Primeiro, peça para o cliente enviar um evento `add_payment_info` com uma chamada para um
Server API que tem acesso ao seu sistema de CRM:

**Código do cliente**

```
gtag('event', 'add_payment_info');
gtag('get', 'G-XXXXXXXXX', 'client_id', (clientId) => {
  ServerAPI.addCustomerTier(clientId, [{name: "add_payment_info"}]);
});
```

Seu servidor aumenta a medição com a propriedade do usuário `customer_tier`
usando o Measurement Protocol:

**Código do servidor**

```
const measurementId = "MEASUREMENT_ID";
const apiSecret = "API_SECRET";

function addCustomerTier(clientId, events) {

  // Request the customer tier from the CRM.
  const customerTier = getCustomerTier(clientId);

  const queryParams = `?measurement_id=${measurementId}&api_secret=${apiSecret}`;
  fetch(`https://www.google-analytics.com/mp/collect${queryParams}`, {
    method: "POST",
    body: JSON.stringify({
      "client_id": clientId,
      "user_properties": {
        "customer_tier": {
          "value": "CUSTOMER_TIER"
        }
      },
      "events": JSON.parse(events)
    })
  });
}
```

Essa propriedade do usuário informa os dois segmentos `premium` e `standard`.

Consulte Enviar eventos para detalhes completos sobre como enviar eventos usando o
Measurement Protocol.

## Carimbo de data/hora da substituição

O Measurement Protocol usa o _primeiro_ carimbo de data/hora que encontra nas seguintes
para cada propriedade do usuário na solicitação:

1. O `timestamp_micros` da entrada em `user_properties`.
2. O `timestamp_micros` da solicitação.
3. A hora em que o Measurement Protocol recebe a solicitação.

O exemplo a seguir envia um carimbo de data/hora no nível da solicitação que se aplica a todas
as propriedades do usuário na solicitação. Por isso, o Measurement Protocol atribui
um carimbo de data/hora de um carimbo de data/hora às propriedades do usuário `customer_tier` e `customer_group``requestUnixEpochTimeInMicros`

```
{
  "timestamp_micros": requestUnixEpochTimeInMicros,
  "user_properties": {
      "customer_tier": {
        "value": customerTierValue
      },
      "customer_group": {
        "value": customerGroupValue
      }
  }
}
```

O exemplo a seguir envia um carimbo de data/hora no nível da solicitação e um carimbo de data/hora para
a propriedade do usuário `customer_tier`. Por isso, o Measurement Protocol atribui
ao `customer_tier` um carimbo de data/hora de `customerTierUnixEpochTimeInMicros`, e o
`customer_group` é um carimbo de data/hora de `requestUnixEpochTimeInMicros`.

```
"timestamp_micros": requestUnixEpochTimeInMicros,
"user_properties": {
    "customer_tier": {
      "value": customerTierValue,
      "timestamp_micros": customerTierUnixEpochTimeInMicros
    },
    "customer_group": {
      "value": customerGroupValue
    }
}
```

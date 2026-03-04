# Enviar dados fornecidos pelo usuário com o User-ID utilizando o Measurement Protocol
Da mesma forma que você usa a gtag, é possível utilizar o Measurement Protocol do Google Analytics para GA4 se quiser enviar dados fornecidos pelo usuário com o User-ID, que ajudam a melhorar o comportamento e a medição de conversões.

Para enviar dados fornecidos pelo usuário com uma solicitação do Measurement Protocol, adicione o parâmetro `user_data` no payload JSON. O parâmetro `user_id` tem que estar presente quando o valor `user_data` é fornecido.

O Measurement Protocol está usando a mesma normalização e o mesmo algoritmo de hash que a medição otimizada da API Google Ads.
Por questões de privacidade, os endereços de e-mail, números de telefone, nomes, sobrenomes e endereços precisam ser criptografados com hash usando o algoritmo SHA-256 antes de serem enviados. O valor com hash deve ser codificado no formato de string hexadecimal (objeto que inclui apenas dígitos hexadecimais), como `88d7ecb5c5b21d7b1`.

Para padronizar os resultados, antes de aplicar hash a um desses valores, você precisa:

- Remover os espaços em branco à esquerda e à direita
- Converter o texto em letras minúsculas
- Formatar números de telefone de acordo com o padrão E164
- Remover todos os pontos (.) que antecedem o nome de domínio nos endereços de e-mail `gmail.com` e `googlemail.com`

## Corpo da postagem JSON

| Chave | Tipo | Descrição |
| --- | --- | --- |
| user\_id | string | Identificador exclusivo de um usuário. Para mais informações sobre esse identificador, consulte User-ID para análise multiplataforma. |
| user\_data | objeto | Campos de dados otimizados do usuário que servem como identificação dele. |
| user\_data.sha256\_email\_address\[\] | matriz de strings | Endereços de e-mail com hash e codificados do usuário.<br>Normalizado da seguinte forma: <br>- Letras minúsculas<br>- Remoção dos pontos antes de `@` nos endereços gmail.com/googlemail.com<br>- Remoção de todos os espaços<br>- Geração de hash usando o algoritmo SHA256<br>- Codificação com o formato de string hexadecimal |
| user\_data.sha256\_phone\_number\[\] | matriz de strings | Número de telefone com hash e codificado do usuário.<br>Normalizado da seguinte forma: <br>- Remoção de todos os caracteres não alfanuméricos<br>- Adição do prefixo `+`<br>- Geração de hash usando o algoritmo SHA256<br>- Codificação com o formato de string hexadecimal |
| user\_data.address\[\] | matriz | Identifica um usuário com base na localização física. |
| user\_data.address\[\].sha256\_first\_name | string | Nome com hash e codificado do usuário.<br>Normalizado da seguinte forma: <br>- Remoção de dígitos e caracteres de símbolo<br>- Letras minúsculas<br>- Remoção de espaços à esquerda e à direita<br>- Geração de hash usando o algoritmo SHA256<br>- Codificação com o formato de string hexadecimal |
| user\_data.address\[\].sha256\_last\_name | string | Sobrenome com hash e codificado do usuário.<br>Normalizado da seguinte forma: <br>- Remoção de dígitos e caracteres de símbolo<br>- Letras minúsculas<br>- Remoção de espaços à esquerda e à direita<br>- Geração de hash usando o algoritmo SHA256<br>- Codificação com o formato de string hexadecimal |
| user\_data.address\[\].sha256\_street | string | Nome da rua e número do endereço com hash e codificado do usuário.<br>Normalizado da seguinte forma: <br>- Remoção de caracteres de símbolo<br>- Letras minúsculas<br>- Remoção de espaços à esquerda e à direita<br>- Geração de hash usando o algoritmo SHA256<br>- Codificação com o formato de string hexadecimal |
| user\_data.address\[\].city | string | Cidade do endereço do usuário.<br>Normalizado da seguinte forma: <br>- Remoção de dígitos e caracteres de símbolo<br>- Letras minúsculas<br>- Remoção de espaços à esquerda e à direita |
| user\_data.address\[\].region | string | Estado ou território do endereço do usuário.<br>Normalizado da seguinte forma: <br>- Remoção de dígitos e caracteres de símbolo<br>- Letras minúsculas<br>- Remoção de espaços à esquerda e à direita |
| user\_data.address\[\].postal\_code | string | CEP do endereço do usuário.<br>Normalizado da seguinte forma: <br>- Remoção dos caracteres `.` e `~`<br>- Remoção de espaços à esquerda e à direita |
| user\_data.address\[\].country | string | Código do país do endereço do usuário. Formatado de acordo com o padrão ISO 3166-1 alfa-2. |

Consulte a documentação de referência do Measurement Protocol para mais detalhes sobre como o transporte e o payload são formatados.

## Enviar dados fornecidos pelo usuário

Ao contrário da gtag, que gera hash automaticamente dos dados sensíveis fornecidos pelo usuário, o Measurement Protocol exige que um desenvolvedor use um algoritmo de hash unidirecional chamado SHA256 e codifique-o utilizando um formato de string hexadecimal antes de chamar a API.

Todos os campos de dados do usuário com o prefixo `sha256` no nome só devem ser preenchidos com valores de hash e codificados usando o código hexadecimal.

O exemplo de código a seguir realiza as etapas necessárias de criptografia e codificação.

```
const { subtle } = require('crypto').webcrypto;

async function populateSensitiveUserData(value) {
  const encoder = new TextEncoder();
  // Convert a string value to UTF-8 encoded text.
  const value_utf8 = encoder.encode(value);
  // Compute the hash (digest) using the SHA-256 algorithm.
  const hash_sha256 = await subtle.digest('SHA-256', value_utf8);
  // Convert buffer to byte array.
  const hash_array = Array.from(new Uint8Array(hash_sha256));
  // Return a hex-encoded string.
  return hash_array.map(b => b.toString(16).padStart(2, "0")).join('');
};

// Test the encryption function by calling it.
async function main() {
  return await populateSensitiveUserData('<value>');
}

main()
  .then(v => console.log(v))
  .catch(err => console.error(err));
```

Por conveniência, todos os campos repetidos no objeto `user_data` (como `address`, `sha256_email_address` e `sha256_phone_number`) podem receber um valor singular em vez de uma matriz.

O exemplo de código a seguir chama o Measurement Protocol e transmite os dados do usuário com o User-ID.

```
const measurement_id = 'G-XXXXXXXXXX';
const api_secret = '<secret_value>';

// Populate mock User Data using the `populateSensitiveUserData` function defined
// above.
const yourEmailSha256Variable = await populateSensitiveUserData('test@yourdomain.com');
const yourPhoneSha256Variable  = await populateSensitiveUserData('+15555555555');
const yourFirstNameSha256Variable  = await populateSensitiveUserData('john');
const yourLastNameSha256Variable  = await populateSensitiveUserData('doe');
const yourStreetAddressSha256Variable  = await populateSensitiveUserData('123 main street');

// Populate mock unencrypted user data.
const yourCityVariable = 'san francisco';
const yourRegionVariable = 'california';
const yourPostalCodeVariable = '94000';
const yourCountryVariable = 'US';

fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`, {
  method: "POST",
  body: JSON.stringify({
    client_id: 'XXXXXXXXXX.YYYYYYYYYY',
    user_id: "XXX",
    events: [{\
      name: 'purchase'\
    }],
    user_data: {
      sha256_email_address: yourEmailSha256Variable,
      sha256_phone_number: yourPhoneSha256Variable,
      address: {
        sha256_first_name: yourFirstNameSha256Variable,
        sha256_last_name: yourLastNameSha256Variable,
        sha256_street: yourStreetAddressSha256Variable,
        city: yourCityVariable,
        region: yourRegionVariable,
        postal_code: yourPostalCodeVariable,
        country: yourCountryVariable
      }
    }
  })
});
```

## Diversos valores

Como alternativa, os desenvolvedores podem enviar diversos valores (até 3 para telefone/e-mail e 2 para endereço) usando um valor de matriz em vez de uma string. Se você capturar mais de um valor, isso vai aumentar a probabilidade de uma correspondência.

```
const measurement_id = 'G-XXXXXXXXXX';
const api_secret = '<secret_value>';

fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`, {
  method: "POST",
  body: JSON.stringify({
    client_id: 'XXXXXXXXXX.YYYYYYYYYY',
    user_id: "XXX",
    events: [{\
      name: 'purchase'\
    }],
    user_data: {
      sha256_email_address: [yourEmailSha256Variable1, yourEmailSha256Variable2],
      sha256_phone_number: [yourPhoneSha256Variable1, yourPhoneSha256Variable2],
      address: [{\
        sha256_first_name: yourFirstNameSha256Variable1,\
        sha256_last_name: yourLastNameSha256Variable1,\
        sha256_street: yourStreetAddressSha256Variable1,\
        city: yourCityVariable1,\
        region: yourRegionVariable1,\
        postal_code: yourPostalCodeVariable1,\
        country: yourCountryVariable1\
      },{\
        sha256_first_name: yourFirstNameSha256Variable2,\
        sha256_last_name: yourLastNameSha256Variable2,\
        sha256_street: yourStreetAddressSha256Variable2,\
        city: yourCityVariable2,\
        region: yourRegionVariable2,\
        postal_code: yourPostalCodeVariable2,\
        country: yourCountryVariable2\
      }]
    }
  })
});
```

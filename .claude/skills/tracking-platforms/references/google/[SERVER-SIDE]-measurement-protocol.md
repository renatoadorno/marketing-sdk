# Measurement Protocol (Google Analytics 4)
O Measurement Protocol do GA para Google Analytics 4 melhora a medição dos fluxos da Web e de apps enviando eventos diretamente aos servidores do Google Analytics em solicitações HTTP. Você pode registrar interações off-line e de servidor para servidor e enviá-las como eventos do Measurement Protocol ao Google Analytics, onde elas podem ser incluídas nos relatórios.

É necessário ativar a inclusão de tag (gTag, Gerenciador de tags ou Google Analytics para Firebase) para usar esse protocolo. Na seção Principais recursos, temos informações importantes sobre como o Measurement Protocol funciona com o Google Analytics 4.

## Casos de uso

Veja algumas formas de usar o Measurement Protocol:

- Associar comportamentos on-line e off-line.
- Medir as interações do lado do cliente e do lado do servidor.
- Enviar eventos que acontecem fora da interação do usuário padrão, como as conversões off-line.
- Enviar eventos de dispositivos e apps em que a coleta automática não está disponível, como quiosques e relógios.

## Começar

Na seção Enviar eventos, você aprende a enviar eventos ao Google Analytics usando o Measurement Protocol.

Se estiver implementando o Measurement Protocol para um fluxo de apps, você poderá começar pelo codelab Enviar eventos do app para o GA4 usando o Measurement Protocol.

## Arquitetura

Confira uma visão geral do Measurement Protocol.

## Principais recursos

Esta seção dá informações importantes sobre o uso do Measurement Protocol.
Você precisará usar a gTag, o Gerenciador de tags ou o Google Analytics para Firebase se quiser utilizar a maioria dos recursos do Measurement Protocol com o Google Analytics 4.

### Remarketing

É possível fazer o remarketing no mesmo dispositivo quando os Indicadores do Google estão ativados. Para o remarketing entre dispositivos, é necessário usar um User-ID.

### Identificadores de publicidade

Identificadores de publicidade, como o GBRAID/WBRAID, coletados durante as interações on-line são combinados automaticamente usando o Client-ID ou o ID da instância do app com eventos do Measurement Protocol.

### Configurações de privacidade

Os eventos do Measurement Protocol são combinados a interações on-line usando o Client-ID ou o ID da instância do app para adotar de forma funcional configurações de privacidade do usuário como "anúncios não personalizados" e "limitar o rastreamento de anúncios".

### Informações geográficas

O Google Analytics 4 combina automaticamente as mais recentes informações geográficas da inclusão de tag com os eventos do Measurement Protocol usando `client_id` ou `app_instance_id`.
Isso garante que os eventos do Measurement Protocol apareçam em relatórios que incluem dimensões geográficas.

Não é possível enviar informações geográficas com o Measurement Protocol.

### Informações do dispositivo

As informações de dispositivo só estão disponíveis pela coleta automática da gtag, do Gerenciador de tags do Google ou do Google Analytics para Firebase.

### Servidor para servidor completo

Você pode enviar eventos ao Google Analytics usando apenas o Measurement Protocol, mas, ao fazer isso, talvez só gere relatórios parciais. O objetivo do Measurement Protocol é aprimorar os eventos coletados com a gtag, o GTM ou o Firebase.
Alguns nomes de eventos e parâmetros são reservados para uso com a coleta automática e não podem ser enviados pelo Measurement Protocol.

As regras para gerar ou renomear eventos não são acionadas automaticamente com base nos eventos enviados com o Measurement Protocol.
Seu aplicativo precisa implementar a lógica para enviar eventos personalizados pelo Measurement Protocol de forma semelhante às regras configuradas na interface do Google Analytics.

## Próximas etapas

- Valide seus payloads de evento usando o servidor de validação do Measurement Protocol.
- Confira a referência de protocolo e evento.

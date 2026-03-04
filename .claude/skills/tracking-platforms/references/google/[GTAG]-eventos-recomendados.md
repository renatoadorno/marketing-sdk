# Eventos recomendados
O Google Analytics envia alguns tipos de eventos automaticamente. Esta página descreve eventos opcionais e adicionais que você pode configurar para medir mais comportamentos e gerar relatórios mais úteis para sua empresa. Esses eventos adicionais exigem mais esforço para serem configurados antes do uso, então o Google Analytics 4 não pode enviá-los automaticamente. Para instruções detalhadas sobre como configurar eventos recomendados e personalizados para seu site ou app, consulte Configurar eventos.

Para conferir detalhes de cada evento que você pode usar, selecione sua plataforma de gerenciamento de tags:

## `add_payment_info`

Esse evento significa que um usuário enviou as informações de pagamento em um processo de finalização de compra de e-commerce.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda dos itens associados ao evento, no formato ISO 4217 de três letras.<br>Métricas de valor no evento `view_item` para não contribuir com a receita<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* Defina `value` como a soma de `(price * quantity)` para todos os itens em<br> `items`. Não inclua `shipping` ou `tax`.<br> <br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao evento.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `payment_type` | `string` | Não | Cartão de crédito | Forma de pagamento escolhida. |
| `items` | `Array<Item>` | **Sim** |  | Itens do evento. |

#### Parâmetros do item

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `item_id` | `string` | **Sim\*** | SKU\_12345 | ID do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `item_name` | `string` | **Sim\*** | Camiseta Stan and Friends | Nome do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `affiliation` | `string` | Não | Google Store | Uma afiliação de produto para indicar uma empresa fornecedora ou loja física.<br> Observação: "affiliation" está disponível apenas no escopo do item. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao item.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `discount` | `number` | Não | 2,22 | Valor do desconto monetário unitário associado ao item. |
| `index` | `number` | Não | 5 | Índice/posição do item em uma lista. |
| `item_brand` | `string` | Não | Google | Marca do item. |
| `item_category` | `string` | Não | Vestuário | Categoria do item. Quando usada como parte de uma hierarquia de categorias ou taxonomia, é a primeira categoria. |
| `item_category2` | `string` | Não | Adulto | Hierarquia da segunda categoria ou taxonomia adicional do item. |
| `item_category3` | `string` | Não | Camisas | Hierarquia da terceira categoria ou taxonomia adicional do item. |
| `item_category4` | `string` | Não | Gola redonda | Hierarquia da quarta categoria ou taxonomia adicional do item. |
| `item_category5` | `string` | Não | Manga curta | Hierarquia da quinta categoria ou taxonomia adicional do item. |

| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_id` no nível do evento (quando presente). |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_name` no nível do evento (quando presente). |
| `item_variant` | `string` | Não | verde | Variante, código exclusivo ou descrição do item para detalhes/opções adicionais. |
| `location_id` | `string` | Não | ChIJIQBpAG2ahYAR\_6128GcTUEo (o ID de lugar do Google para São Francisco) | O local físico associado ao item, como a localização da filial da loja. É recomendável usar o ID de lugar do Google que corresponde ao item associado. Também é possível usar um ID de local personalizado.<br> Observação: "location id" está disponível apenas no escopo do item. |
| `price` | `number` | Não | 10,01 | O preço unitário monetário do item, em unidades do parâmetro de moeda especificado.<br> <br>Se um desconto for aplicado ao item, defina `price` como o preço unitário com desconto e<br> especifique o desconto no preço unitário no parâmetro `discount`. |
| `quantity` | `number` | Não | 3 | Quantidade do item.<br>Se não for definido, `quantity` vai usar o valor "1". |

Além dos parâmetros prescritos, você pode incluir até 27 parâmetros personalizados na matriz `items`.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "add_payment_info", {
  currency: "USD",
  value: 30.03,
  coupon: "SUMMER_FUN",
  payment_type: "Credit Card",
  items: [\
    {\
      item_id: "SKU_12345",\
      item_name: "Stan and Friends Tee",\
      affiliation: "Google Merchandise Store",\
      coupon: "SUMMER_FUN",\
      discount: 2.22,\
      index: 0,\
      item_brand: "Google",\
      item_category: "Apparel",\
      item_category2: "Adult",\
      item_category3: "Shirts",\
      item_category4: "Crew",\
      item_category5: "Short sleeve",\
      item_list_id: "related_products",\
      item_list_name: "Related Products",\
      item_variant: "green",\
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",\
      price: 10.01,\
      google_business_vertical: "retail",\
      quantity: 3\
    }\
  ]
});
```

## `add_shipping_info`

Esse evento significa que um usuário enviou as informações de frete em um processo de finalização de compra de e-commerce.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda dos itens associados ao evento, no formato ISO 4217 de três letras.<br>Métricas de valor no evento `view_item` para não contribuir com a receita<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* Defina `value` como a soma de `(price * quantity)` para todos os itens em<br> `items`. Não inclua `shipping` ou `tax`.<br> <br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao evento.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `shipping_tier` | `string` | Não | Terrestre | Tipo de frete (por exemplo, `Ground`, `Air`, `Next-day`) selecionado para a entrega do item comprado. |
| `items` | `Array<Item>` | **Sim** |  | Itens do evento. |

#### Parâmetros do item

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `item_id` | `string` | **Sim\*** | SKU\_12345 | ID do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `item_name` | `string` | **Sim\*** | Camiseta Stan and Friends | Nome do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `affiliation` | `string` | Não | Google Store | Uma afiliação de produto para indicar uma empresa fornecedora ou loja física.<br> Observação: "affiliation" está disponível apenas no escopo do item. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao item.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `discount` | `number` | Não | 2,22 | Valor do desconto monetário unitário associado ao item. |
| `index` | `number` | Não | 5 | Índice/posição do item em uma lista. |
| `item_brand` | `string` | Não | Google | Marca do item. |
| `item_category` | `string` | Não | Vestuário | Categoria do item. Quando usada como parte de uma hierarquia de categorias ou taxonomia, é a primeira categoria. |
| `item_category2` | `string` | Não | Adulto | Hierarquia da segunda categoria ou taxonomia adicional do item. |
| `item_category3` | `string` | Não | Camisas | Hierarquia da terceira categoria ou taxonomia adicional do item. |
| `item_category4` | `string` | Não | Gola redonda | Hierarquia da quarta categoria ou taxonomia adicional do item. |
| `item_category5` | `string` | Não | Manga curta | Hierarquia da quinta categoria ou taxonomia adicional do item. |

| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_id` no nível do evento (quando presente). |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_name` no nível do evento (quando presente). |
| `item_variant` | `string` | Não | verde | Variante, código exclusivo ou descrição do item para detalhes/opções adicionais. |
| `location_id` | `string` | Não | ChIJIQBpAG2ahYAR\_6128GcTUEo (o ID de lugar do Google para São Francisco) | O local físico associado ao item, como a localização da filial da loja. É recomendável usar o ID de lugar do Google que corresponde ao item associado. Também é possível usar um ID de local personalizado.<br> Observação: "location id" está disponível apenas no escopo do item. |
| `price` | `number` | Não | 10,01 | O preço unitário monetário do item, em unidades do parâmetro de moeda especificado.<br> <br>Se um desconto for aplicado ao item, defina `price` como o preço unitário com desconto e<br> especifique o desconto no preço unitário no parâmetro `discount`. |
| `quantity` | `number` | Não | 3 | Quantidade do item.<br>Se não for definido, `quantity` vai usar o valor "1". |

Além dos parâmetros prescritos, você pode incluir até 27 parâmetros personalizados na matriz `items`.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "add_shipping_info", {
  currency: "USD",
  value: 30.03,
  coupon: "SUMMER_FUN",
  shipping_tier: "Ground",
  items: [\
    {\
      item_id: "SKU_12345",\
      item_name: "Stan and Friends Tee",\
      affiliation: "Google Merchandise Store",\
      coupon: "SUMMER_FUN",\
      discount: 2.22,\
      index: 0,\
      item_brand: "Google",\
      item_category: "Apparel",\
      item_category2: "Adult",\
      item_category3: "Shirts",\
      item_category4: "Crew",\
      item_category5: "Short sleeve",\
      item_list_id: "related_products",\
      item_list_name: "Related Products",\
      item_variant: "green",\
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",\
      price: 10.01,\
      google_business_vertical: "retail",\
      quantity: 3\
    }\
  ]
});
```

## `add_to_cart`

Esse evento indica que um item foi adicionado a um carrinho de compras.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda dos itens associados ao evento, no formato ISO 4217 de três letras.<br>Métricas de valor no evento `view_item` para não contribuir com a receita<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* Defina `value` como a soma de `(price * quantity)` para todos os itens em<br> `items`. Não inclua `shipping` ou `tax`.<br> <br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |
| `items` | `Array<Item>` | **Sim** |  | Itens do evento. |

#### Parâmetros do item

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `item_id` | `string` | **Sim\*** | SKU\_12345 | ID do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `item_name` | `string` | **Sim\*** | Camiseta Stan and Friends | Nome do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `affiliation` | `string` | Não | Google Store | Uma afiliação de produto para indicar uma empresa fornecedora ou loja física.<br> Observação: "affiliation" está disponível apenas no escopo do item. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao item.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `discount` | `number` | Não | 2,22 | Valor do desconto monetário unitário associado ao item. |
| `index` | `number` | Não | 5 | Índice/posição do item em uma lista. |
| `item_brand` | `string` | Não | Google | Marca do item. |
| `item_category` | `string` | Não | Vestuário | Categoria do item. Quando usada como parte de uma hierarquia de categorias ou taxonomia, é a primeira categoria. |
| `item_category2` | `string` | Não | Adulto | Hierarquia da segunda categoria ou taxonomia adicional do item. |
| `item_category3` | `string` | Não | Camisas | Hierarquia da terceira categoria ou taxonomia adicional do item. |
| `item_category4` | `string` | Não | Gola redonda | Hierarquia da quarta categoria ou taxonomia adicional do item. |
| `item_category5` | `string` | Não | Manga curta | Hierarquia da quinta categoria ou taxonomia adicional do item. |

| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_id` no nível do evento (quando presente). |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_name` no nível do evento (quando presente). |
| `item_variant` | `string` | Não | verde | Variante, código exclusivo ou descrição do item para detalhes/opções adicionais. |
| `location_id` | `string` | Não | ChIJIQBpAG2ahYAR\_6128GcTUEo (o ID de lugar do Google para São Francisco) | O local físico associado ao item, como a localização da filial da loja. É recomendável usar o ID de lugar do Google que corresponde ao item associado. Também é possível usar um ID de local personalizado.<br> Observação: "location id" está disponível apenas no escopo do item. |
| `price` | `number` | Não | 10,01 | O preço unitário monetário do item, em unidades do parâmetro de moeda especificado.<br> <br>Se um desconto for aplicado ao item, defina `price` como o preço unitário com desconto e<br> especifique o desconto no preço unitário no parâmetro `discount`. |
| `quantity` | `number` | Não | 3 | Quantidade do item.<br>Se não for definido, `quantity` vai usar o valor "1". |

Além dos parâmetros prescritos, você pode incluir até 27 parâmetros personalizados na matriz `items`.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "add_to_cart", {
  currency: "USD",
  value: 30.03,
  items: [\
    {\
      item_id: "SKU_12345",\
      item_name: "Stan and Friends Tee",\
      affiliation: "Google Merchandise Store",\
      coupon: "SUMMER_FUN",\
      discount: 2.22,\
      index: 0,\
      item_brand: "Google",\
      item_category: "Apparel",\
      item_category2: "Adult",\
      item_category3: "Shirts",\
      item_category4: "Crew",\
      item_category5: "Short sleeve",\
      item_list_id: "related_products",\
      item_list_name: "Related Products",\
      item_variant: "green",\
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",\
      price: 10.01,\
      google_business_vertical: "retail",\
      quantity: 3\
    }\
  ]
});
```

## `add_to_wishlist`

O evento indica que um item foi adicionado à lista de desejos. Use esse evento para identificar os presentes mais procurados no seu app.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda dos itens associados ao evento, no formato ISO 4217 de três letras.<br>Métricas de valor no evento `view_item` para não contribuir com a receita<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* Defina `value` como a soma de `(price * quantity)` para todos os itens em<br> `items`. Não inclua `shipping` ou `tax`.<br> <br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |
| `items` | `Array<Item>` | **Sim** |  | Itens do evento. |

#### Parâmetros do item

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `item_id` | `string` | **Sim\*** | SKU\_12345 | ID do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `item_name` | `string` | **Sim\*** | Camiseta Stan and Friends | Nome do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `affiliation` | `string` | Não | Google Store | Uma afiliação de produto para indicar uma empresa fornecedora ou loja física.<br> Observação: "affiliation" está disponível apenas no escopo do item. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao item.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `discount` | `number` | Não | 2,22 | Valor do desconto monetário unitário associado ao item. |
| `index` | `number` | Não | 5 | Índice/posição do item em uma lista. |
| `item_brand` | `string` | Não | Google | Marca do item. |
| `item_category` | `string` | Não | Vestuário | Categoria do item. Quando usada como parte de uma hierarquia de categorias ou taxonomia, é a primeira categoria. |
| `item_category2` | `string` | Não | Adulto | Hierarquia da segunda categoria ou taxonomia adicional do item. |
| `item_category3` | `string` | Não | Camisas | Hierarquia da terceira categoria ou taxonomia adicional do item. |
| `item_category4` | `string` | Não | Gola redonda | Hierarquia da quarta categoria ou taxonomia adicional do item. |
| `item_category5` | `string` | Não | Manga curta | Hierarquia da quinta categoria ou taxonomia adicional do item. |

| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_id` no nível do evento (quando presente). |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_name` no nível do evento (quando presente). |
| `item_variant` | `string` | Não | verde | Variante, código exclusivo ou descrição do item para detalhes/opções adicionais. |
| `location_id` | `string` | Não | ChIJIQBpAG2ahYAR\_6128GcTUEo (o ID de lugar do Google para São Francisco) | O local físico associado ao item, como a localização da filial da loja. É recomendável usar o ID de lugar do Google que corresponde ao item associado. Também é possível usar um ID de local personalizado.<br> Observação: "location id" está disponível apenas no escopo do item. |
| `price` | `number` | Não | 10,01 | O preço unitário monetário do item, em unidades do parâmetro de moeda especificado.<br> <br>Se um desconto for aplicado ao item, defina `price` como o preço unitário com desconto e<br> especifique o desconto no preço unitário no parâmetro `discount`. |
| `quantity` | `number` | Não | 3 | Quantidade do item.<br>Se não for definido, `quantity` vai usar o valor "1". |

Além dos parâmetros prescritos, você pode incluir até 27 parâmetros personalizados na matriz `items`.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "add_to_wishlist", {
  currency: "USD",
  value: 30.03,
  items: [\
    {\
      item_id: "SKU_12345",\
      item_name: "Stan and Friends Tee",\
      affiliation: "Google Merchandise Store",\
      coupon: "SUMMER_FUN",\
      discount: 2.22,\
      index: 0,\
      item_brand: "Google",\
      item_category: "Apparel",\
      item_category2: "Adult",\
      item_category3: "Shirts",\
      item_category4: "Crew",\
      item_category5: "Short sleeve",\
      item_list_id: "related_products",\
      item_list_name: "Related Products",\
      item_variant: "green",\
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",\
      price: 10.01,\
      google_business_vertical: "retail",\
      quantity: 3\
    }\
  ],
});
```

## `begin_checkout`

Esse evento indica que um usuário iniciou o processo de finalização da compra.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda dos itens associados ao evento, no formato ISO 4217 de três letras.<br>Métricas de valor no evento `view_item` para não contribuir com a receita<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* Defina `value` como a soma de `(price * quantity)` para todos os itens em<br> `items`. Não inclua `shipping` ou `tax`.<br> <br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao evento.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `items` | `Array<Item>` | **Sim** |  | Itens do evento. |

#### Parâmetros do item

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `item_id` | `string` | **Sim\*** | SKU\_12345 | ID do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `item_name` | `string` | **Sim\*** | Camiseta Stan and Friends | Nome do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `affiliation` | `string` | Não | Google Store | Uma afiliação de produto para indicar uma empresa fornecedora ou loja física.<br> Observação: "affiliation" está disponível apenas no escopo do item. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao item.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `discount` | `number` | Não | 2,22 | Valor do desconto monetário unitário associado ao item. |
| `index` | `number` | Não | 5 | Índice/posição do item em uma lista. |
| `item_brand` | `string` | Não | Google | Marca do item. |
| `item_category` | `string` | Não | Vestuário | Categoria do item. Quando usada como parte de uma hierarquia de categorias ou taxonomia, é a primeira categoria. |
| `item_category2` | `string` | Não | Adulto | Hierarquia da segunda categoria ou taxonomia adicional do item. |
| `item_category3` | `string` | Não | Camisas | Hierarquia da terceira categoria ou taxonomia adicional do item. |
| `item_category4` | `string` | Não | Gola redonda | Hierarquia da quarta categoria ou taxonomia adicional do item. |
| `item_category5` | `string` | Não | Manga curta | Hierarquia da quinta categoria ou taxonomia adicional do item. |

| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_id` no nível do evento (quando presente). |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_name` no nível do evento (quando presente). |
| `item_variant` | `string` | Não | verde | Variante, código exclusivo ou descrição do item para detalhes/opções adicionais. |
| `location_id` | `string` | Não | ChIJIQBpAG2ahYAR\_6128GcTUEo (o ID de lugar do Google para São Francisco) | O local físico associado ao item, como a localização da filial da loja. É recomendável usar o ID de lugar do Google que corresponde ao item associado. Também é possível usar um ID de local personalizado.<br> Observação: "location id" está disponível apenas no escopo do item. |
| `price` | `number` | Não | 10,01 | O preço unitário monetário do item, em unidades do parâmetro de moeda especificado.<br> <br>Se um desconto for aplicado ao item, defina `price` como o preço unitário com desconto e<br> especifique o desconto no preço unitário no parâmetro `discount`. |
| `quantity` | `number` | Não | 3 | Quantidade do item.<br>Se não for definido, `quantity` vai usar o valor "1". |

Além dos parâmetros prescritos, você pode incluir até 27 parâmetros personalizados na matriz `items`.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "begin_checkout", {
  currency: "USD",
  value: 30.03,
  coupon: "SUMMER_FUN",
  items: [\
    {\
      item_id: "SKU_12345",\
      item_name: "Stan and Friends Tee",\
      affiliation: "Google Merchandise Store",\
      coupon: "SUMMER_FUN",\
      discount: 2.22,\
      index: 0,\
      item_brand: "Google",\
      item_category: "Apparel",\
      item_category2: "Adult",\
      item_category3: "Shirts",\
      item_category4: "Crew",\
      item_category5: "Short sleeve",\
      item_list_id: "related_products",\
      item_list_name: "Related Products",\
      item_variant: "green",\
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",\
      price: 10.01,\
      google_business_vertical: "retail",\
      quantity: 3\
    }\
  ]
});
```

## `close_convert_lead`

Esse evento mede quando um lead é convertido e fechado (por exemplo, por uma compra).

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda do `value` do evento, no formato ISO 4217 de três letras.<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "close_convert_lead", {
  currency: "USD",
  value: 30.03
});
```

## `close_unconvert_lead`

Esse evento mede quando um usuário é marcado como não sendo um lead convertido, além do motivo.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda do `value` do evento, no formato ISO 4217 de três letras.<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |
| `unconvert_lead_reason` | `string` | Não | Nunca respondeu | O motivo de o lead não ter gerado uma conversão. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "close_unconvert_lead", {
  currency: "USD",
  value: 30.03,
  unconvert_lead_reason: "Never responded"
});
```

## `disqualify_lead`

Esse evento mede quando um usuário é marcado como desqualificado para se tornar um lead, além do motivo da desqualificação.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda do `value` do evento, no formato ISO 4217 de três letras.<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |
| `disqualified_lead_reason` | `string` | Não | Não quero comprar | O motivo de um lead ter sido marcado como desqualificado. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "disqualify_lead", {
  currency: "USD",
  value: 30.03,
  disqualified_lead_reason: "Not looking to buy"
});
```

## `earn_virtual_currency`

Este evento mensura quando um usuário recebe moeda virtual em um jogo.
Registre-o com spend\_virtual\_currency para entender melhor sua economia virtual.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `virtual_currency_name` | `string` | Não | Pedras preciosas | Nome da moeda virtual. |
| `value` | `number` | Não | 5 | Valor da moeda virtual. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "earn_virtual_currency", {
  virtual_currency_name: "Gems",
  value: 5
});
```

## `generate_lead`

Este evento determina quando um lead é gerado (por exemplo, por meio de um formulário). Registre isso para entender a eficácia das campanhas de marketing e como muitos clientes interagem novamente com sua empresa após o remarketing para os clientes.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda do `value` do evento, no formato ISO 4217 de três letras.<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |
| `lead_source` | `string` | Não | Feira comercial | A origem do lead. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "generate_lead", {
  currency: "USD",
  value: 30.03,
  lead_source: "Trade show"
});
```

## `join_group`

Registre esse evento quando um usuário entrar em um grupo, como uma associação, equipe ou família. Use esse evento para analisar a popularidade de determinados grupos ou recursos sociais.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `group_id` | `string` | Não | G\_12345 | ID do grupo. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "join_group", {
  group_id: "G_12345"
});
```

## `level_end`

Este evento indica que um jogador chegou ao final de um nível em um jogo.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `level_name` | `string` | Não | O início da jornada... | Nome do nível. |
| `success` | `boolean` | Não | true | Defina como `true` se o nível tiver sido concluído. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "level_end", {
  level_name: "The journey begins...",
  success: true
});
```

## `level_start`

Esse evento indica que um jogador iniciou um nível em um jogo.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `level_name` | `string` | Não | O início da jornada... | Nome do nível. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "level_start", {
  level_name: "The journey begins..."
});
```

## `level_up`

Esse evento indica que um jogador subiu de nível em um jogo. Use para avaliar a distribuição de níveis da sua base de usuários e identificar fases difíceis de concluir.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `level` | `number` | Não | 5 | Nível do personagem. |
| `character` | `string` | Não | Jogador 1 | Personagem que subiu de nível. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "level_up", {
  level: 5,
  character: "Player 1"
});
```

## `login`

Envie esse evento para indicar que um usuário fez login no seu site ou app.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `method` | `string` | Não | Google | Método usado para fazer login. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "login", {
  method: "Google"
});
```

## `post_score`

Envie esse evento quando o usuário registrar uma pontuação. Use esse evento para entender o desempenho dos usuários no seu jogo e correlacionar as maiores pontuações com os públicos-alvo ou comportamentos.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `score` | `number` | **Sim** | 10.000 | Pontuação que será registrada. |
| `level` | `number` | Não | 5 | Nível da pontuação. |
| `character` | `string` | Não | Jogador 1 | Personagem que conseguiu a pontuação. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "post_score", {
  score: 10000,
  level: 5,
  character: "Player 1"
});
```

## `purchase`

Esse evento indica quando um ou mais itens são comprados por um usuário.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda dos itens associados ao evento, no formato ISO 4217 de três letras.<br>Métricas de valor no evento `view_item` para não contribuir com a receita<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* Defina `value` como a soma de `(price * quantity)` para todos os itens em<br> `items`. Não inclua `shipping` ou `tax`.<br> <br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |
| `customer_type` | `string` (`new` / `returning`) | Não | novo | A conversão é de um cliente "novo" ou "recorrente"? <br>- `new`: novo cliente que não comprou em um determinado período. Recomenda-se uma janela de 540 dias e definição padrão, mas não é obrigatório. <br>  <br>- `returning`: um cliente recorrente que comprou durante o período em questão.<br>   <br> Não especifique um valor se houver dúvidas (por exemplo, se o usuário fez<br> uma compra sem login). |
| `transaction_id` | `string` | **Sim** | T\_12345 | Identificador exclusivo de uma transação.<br>O parâmetro `transaction_id` evita duplicar eventos de uma compra. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao evento.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `shipping` | `number` | Não | 3,33 | Custo de frete associado a uma transação. |
| `tax` | `number` | Não | 1,11 | Custo dos tributos associados a uma transação. |
| `items` | `Array<Item>` | **Sim** |  | Itens do evento. |

#### Parâmetros do item

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `item_id` | `string` | **Sim\*** | SKU\_12345 | ID do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `item_name` | `string` | **Sim\*** | Camiseta Stan and Friends | Nome do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `affiliation` | `string` | Não | Google Store | Uma afiliação de produto para indicar uma empresa fornecedora ou loja física.<br> Observação: "affiliation" está disponível apenas no escopo do item. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao item.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `discount` | `number` | Não | 2,22 | Valor do desconto monetário unitário associado ao item. |
| `index` | `number` | Não | 5 | Índice/posição do item em uma lista. |
| `item_brand` | `string` | Não | Google | Marca do item. |
| `item_category` | `string` | Não | Vestuário | Categoria do item. Quando usada como parte de uma hierarquia de categorias ou taxonomia, é a primeira categoria. |
| `item_category2` | `string` | Não | Adulto | Hierarquia da segunda categoria ou taxonomia adicional do item. |
| `item_category3` | `string` | Não | Camisas | Hierarquia da terceira categoria ou taxonomia adicional do item. |
| `item_category4` | `string` | Não | Gola redonda | Hierarquia da quarta categoria ou taxonomia adicional do item. |
| `item_category5` | `string` | Não | Manga curta | Hierarquia da quinta categoria ou taxonomia adicional do item. |

| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_id` no nível do evento (quando presente). |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_name` no nível do evento (quando presente). |
| `item_variant` | `string` | Não | verde | Variante, código exclusivo ou descrição do item para detalhes/opções adicionais. |
| `location_id` | `string` | Não | ChIJIQBpAG2ahYAR\_6128GcTUEo (o ID de lugar do Google para São Francisco) | O local físico associado ao item, como a localização da filial da loja. É recomendável usar o ID de lugar do Google que corresponde ao item associado. Também é possível usar um ID de local personalizado.<br> Observação: "location id" está disponível apenas no escopo do item. |
| `price` | `number` | Não | 10,01 | O preço unitário monetário do item, em unidades do parâmetro de moeda especificado.<br> <br>Se um desconto for aplicado ao item, defina `price` como o preço unitário com desconto e<br> especifique o desconto no preço unitário no parâmetro `discount`. |
| `quantity` | `number` | Não | 3 | Quantidade do item.<br>Se não for definido, `quantity` vai usar o valor "1". |

Além dos parâmetros prescritos, você pode incluir até 27 parâmetros personalizados na matriz `items`.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "purchase", {
    transaction_id: "T_12345",
    // Sum of (price * quantity) for all items.
    value: 72.05,
    tax: 3.60,
    shipping: 5.99,
    currency: "USD",
    coupon: "SUMMER_SALE",
    customer_type: "new",
    items: [\
     {\
      item_id: "SKU_12345",\
      item_name: "Stan and Friends Tee",\
      affiliation: "Google Merchandise Store",\
      coupon: "SUMMER_FUN",\
      discount: 2.22,\
      index: 0,\
      item_brand: "Google",\
      item_category: "Apparel",\
      item_category2: "Adult",\
      item_category3: "Shirts",\
      item_category4: "Crew",\
      item_category5: "Short sleeve",\
      item_list_id: "related_products",\
      item_list_name: "Related Products",\
      item_variant: "green",\
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",\
      price: 10.01,\
      google_business_vertical: "retail",\
      quantity: 3\
    },\
    {\
      item_id: "SKU_12346",\
      item_name: "Google Grey Women's Tee",\
      affiliation: "Google Merchandise Store",\
      coupon: "SUMMER_FUN",\
      discount: 3.33,\
      index: 1,\
      item_brand: "Google",\
      item_category: "Apparel",\
      item_category2: "Adult",\
      item_category3: "Shirts",\
      item_category4: "Crew",\
      item_category5: "Short sleeve",\
      item_list_id: "related_products",\
      item_list_name: "Related Products",\
      item_variant: "gray",\
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",\
      price: 21.01,\
      promotion_id: "P_12345",\
      promotion_name: "Summer Sale",\
      google_business_vertical: "retail",\
      quantity: 2\
    }]
});
```

## `qualify_lead`

Esse evento mede quando um usuário é marcado como atendendo aos critérios para se tornar um lead qualificado.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda do `value` do evento, no formato ISO 4217 de três letras.<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "qualify_lead", {
  currency: "USD",
  value: 30.03
});
```

## `refund`

Esse evento indica quando um ou mais itens são reembolsados a um usuário.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda dos itens associados ao evento, no formato ISO 4217 de três letras.<br>Métricas de valor no evento `view_item` para não contribuir com a receita<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `transaction_id` | `string` | **Sim** | T\_12345 | Identificador exclusivo de uma transação. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* Defina `value` como a soma de `(price * quantity)` para todos os itens em<br> `items`. Não inclua `shipping` ou `tax`.<br> <br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao evento.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `shipping` | `number` | Não | 3,33 | Custo de frete associado a uma transação. |
| `tax` | `number` | Não | 1,11 | Custo dos tributos associados a uma transação. |
| `items` | `<br>        Array<Item><br>` | Não\* |  | Itens do evento. |

#### Parâmetros do item

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `item_id` | `string` | **Sim\*** | SKU\_12345 | ID do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `item_name` | `string` | **Sim\*** | Camiseta Stan and Friends | Nome do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `affiliation` | `string` | Não | Google Store | Uma afiliação de produto para indicar uma empresa fornecedora ou loja física.<br> Observação: "affiliation" está disponível apenas no escopo do item. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao item.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `discount` | `number` | Não | 2,22 | Valor do desconto monetário unitário associado ao item. |
| `index` | `number` | Não | 5 | Índice/posição do item em uma lista. |
| `item_brand` | `string` | Não | Google | Marca do item. |
| `item_category` | `string` | Não | Vestuário | Categoria do item. Quando usada como parte de uma hierarquia de categorias ou taxonomia, é a primeira categoria. |
| `item_category2` | `string` | Não | Adulto | Hierarquia da segunda categoria ou taxonomia adicional do item. |
| `item_category3` | `string` | Não | Camisas | Hierarquia da terceira categoria ou taxonomia adicional do item. |
| `item_category4` | `string` | Não | Gola redonda | Hierarquia da quarta categoria ou taxonomia adicional do item. |
| `item_category5` | `string` | Não | Manga curta | Hierarquia da quinta categoria ou taxonomia adicional do item. |

| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_id` no nível do evento (quando presente). |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_name` no nível do evento (quando presente). |
| `item_variant` | `string` | Não | verde | Variante, código exclusivo ou descrição do item para detalhes/opções adicionais. |
| `location_id` | `string` | Não | ChIJIQBpAG2ahYAR\_6128GcTUEo (o ID de lugar do Google para São Francisco) | O local físico associado ao item, como a localização da filial da loja. É recomendável usar o ID de lugar do Google que corresponde ao item associado. Também é possível usar um ID de local personalizado.<br> Observação: "location id" está disponível apenas no escopo do item. |
| `price` | `number` | Não | 10,01 | O preço unitário monetário do item, em unidades do parâmetro de moeda especificado.<br> <br>Se um desconto for aplicado ao item, defina `price` como o preço unitário com desconto e<br> especifique o desconto no preço unitário no parâmetro `discount`. |
| `quantity` | `number` | Não | 3 | Quantidade do item.<br>Se não for definido, `quantity` vai usar o valor "1". |

Além dos parâmetros prescritos, você pode incluir até 27 parâmetros personalizados na matriz `items`.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "refund", {
  currency: "USD",
  transaction_id: "T_12345", // Transaction ID. Required for purchases and refunds.
  value: 30.03,
  coupon: "SUMMER_FUN",
  shipping: 3.33,
  tax: 1.11,
  items: [\
    {\
      item_id: "SKU_12345",\
      item_name: "Stan and Friends Tee",\
      affiliation: "Google Merchandise Store",\
      coupon: "SUMMER_FUN",\
      discount: 2.22,\
      index: 0,\
      item_brand: "Google",\
      item_category: "Apparel",\
      item_category2: "Adult",\
      item_category3: "Shirts",\
      item_category4: "Crew",\
      item_category5: "Short sleeve",\
      item_list_id: "related_products",\
      item_list_name: "Related Products",\
      item_variant: "green",\
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",\
      price: 10.01,\
      google_business_vertical: "retail",\
      quantity: 3\
    }\
  ]
});
```

## `remove_from_cart`

Esse evento indica que um item foi removido do carrinho.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda dos itens associados ao evento, no formato ISO 4217 de três letras.<br>Métricas de valor no evento `view_item` para não contribuir com a receita<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* Defina `value` como a soma de `(price * quantity)` para todos os itens em<br> `items`. Não inclua `shipping` ou `tax`.<br> <br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |
| `items` | `Array<Item>` | **Sim** |  | Itens do evento. |

#### Parâmetros do item

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `item_id` | `string` | **Sim\*** | SKU\_12345 | ID do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `item_name` | `string` | **Sim\*** | Camiseta Stan and Friends | Nome do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `affiliation` | `string` | Não | Google Store | Uma afiliação de produto para indicar uma empresa fornecedora ou loja física.<br> Observação: "affiliation" está disponível apenas no escopo do item. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao item.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `discount` | `number` | Não | 2,22 | Valor do desconto monetário unitário associado ao item. |
| `index` | `number` | Não | 5 | Índice/posição do item em uma lista. |
| `item_brand` | `string` | Não | Google | Marca do item. |
| `item_category` | `string` | Não | Vestuário | Categoria do item. Quando usada como parte de uma hierarquia de categorias ou taxonomia, é a primeira categoria. |
| `item_category2` | `string` | Não | Adulto | Hierarquia da segunda categoria ou taxonomia adicional do item. |
| `item_category3` | `string` | Não | Camisas | Hierarquia da terceira categoria ou taxonomia adicional do item. |
| `item_category4` | `string` | Não | Gola redonda | Hierarquia da quarta categoria ou taxonomia adicional do item. |
| `item_category5` | `string` | Não | Manga curta | Hierarquia da quinta categoria ou taxonomia adicional do item. |

| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_id` no nível do evento (quando presente). |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_name` no nível do evento (quando presente). |
| `item_variant` | `string` | Não | verde | Variante, código exclusivo ou descrição do item para detalhes/opções adicionais. |
| `location_id` | `string` | Não | ChIJIQBpAG2ahYAR\_6128GcTUEo (o ID de lugar do Google para São Francisco) | O local físico associado ao item, como a localização da filial da loja. É recomendável usar o ID de lugar do Google que corresponde ao item associado. Também é possível usar um ID de local personalizado.<br> Observação: "location id" está disponível apenas no escopo do item. |
| `price` | `number` | Não | 10,01 | O preço unitário monetário do item, em unidades do parâmetro de moeda especificado.<br> <br>Se um desconto for aplicado ao item, defina `price` como o preço unitário com desconto e<br> especifique o desconto no preço unitário no parâmetro `discount`. |
| `quantity` | `number` | Não | 3 | Quantidade do item.<br>Se não for definido, `quantity` vai usar o valor "1". |

Além dos parâmetros prescritos, você pode incluir até 27 parâmetros personalizados na matriz `items`.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "remove_from_cart", {
  currency: "USD",
  value: 30.03,
  items: [\
    {\
      item_id: "SKU_12345",\
      item_name: "Stan and Friends Tee",\
      affiliation: "Google Merchandise Store",\
      coupon: "SUMMER_FUN",\
      discount: 2.22,\
      index: 0,\
      item_brand: "Google",\
      item_category: "Apparel",\
      item_category2: "Adult",\
      item_category3: "Shirts",\
      item_category4: "Crew",\
      item_category5: "Short sleeve",\
      item_list_id: "related_products",\
      item_list_name: "Related Products",\
      item_variant: "green",\
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",\
      price: 10.01,\
      google_business_vertical: "retail",\
      quantity: 3\
    }\
  ]
});
```

## `search`

Registre este evento para indicar quando o usuário realizou a pesquisa. Você pode usar esse evento para identificar o conteúdo que os usuários estão pesquisando no seu site ou app. Por exemplo, você pode enviar esse evento quando um usuário acessar uma página de resultados de pesquisa depois de realizar uma pesquisa.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `search_term` | `string` | **Sim** | camisetas | Termo que foi pesquisado. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "search", {
  search_term: "t-shirts"
});
```

## `select_content`

Esse evento indica que um usuário selecionou conteúdo de um determinado tipo.
além de ajudar você a identificar conteúdo e categorias em alta relacionados ao seu site ou app.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `content_type` | `string` | Não | produto | Tipo de conteúdo selecionado. |
| `content_id` | `string` | Não | C\_12345 | Um identificador para o item selecionado. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "select_content", {
  content_type: "product",
  content_id: "C_12345"
});
```

## `select_item`

Esse evento indica que um item foi selecionado em uma lista.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Ignorado quando o parâmetro é definido no nível do item. |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Ignorado quando o parâmetro é definido no nível do item. |
| `items` | `<br>      Array<Item>` | **Sim\*** |  | Itens do evento.<br>\\* A matriz do parâmetro `items` precisa ter um único elemento que representa o item selecionado. Quando há vários elementos definidos, só o primeiro em `items` é usado. |

#### Parâmetros do item

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `item_id` | `string` | **Sim\*** | SKU\_12345 | ID do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `item_name` | `string` | **Sim\*** | Camiseta Stan and Friends | Nome do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `affiliation` | `string` | Não | Google Store | Uma afiliação de produto para indicar uma empresa fornecedora ou loja física.<br> Observação: "affiliation" está disponível apenas no escopo do item. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao item.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `discount` | `number` | Não | 2,22 | Valor do desconto monetário unitário associado ao item. |
| `index` | `number` | Não | 5 | Índice/posição do item em uma lista. |
| `item_brand` | `string` | Não | Google | Marca do item. |
| `item_category` | `string` | Não | Vestuário | Categoria do item. Quando usada como parte de uma hierarquia de categorias ou taxonomia, é a primeira categoria. |
| `item_category2` | `string` | Não | Adulto | Hierarquia da segunda categoria ou taxonomia adicional do item. |
| `item_category3` | `string` | Não | Camisas | Hierarquia da terceira categoria ou taxonomia adicional do item. |
| `item_category4` | `string` | Não | Gola redonda | Hierarquia da quarta categoria ou taxonomia adicional do item. |
| `item_category5` | `string` | Não | Manga curta | Hierarquia da quinta categoria ou taxonomia adicional do item. |

| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_id` no nível do evento (quando presente). |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_name` no nível do evento (quando presente). |
| `item_variant` | `string` | Não | verde | Variante, código exclusivo ou descrição do item para detalhes/opções adicionais. |
| `location_id` | `string` | Não | ChIJIQBpAG2ahYAR\_6128GcTUEo (o ID de lugar do Google para São Francisco) | O local físico associado ao item, como a localização da filial da loja. É recomendável usar o ID de lugar do Google que corresponde ao item associado. Também é possível usar um ID de local personalizado.<br> Observação: "location id" está disponível apenas no escopo do item. |
| `price` | `number` | Não | 10,01 | O preço unitário monetário do item, em unidades do parâmetro de moeda especificado.<br> <br>Se um desconto for aplicado ao item, defina `price` como o preço unitário com desconto e<br> especifique o desconto no preço unitário no parâmetro `discount`. |
| `quantity` | `number` | Não | 3 | Quantidade do item.<br>Se não for definido, `quantity` vai usar o valor "1". |

Além dos parâmetros prescritos, você pode incluir até 27 parâmetros personalizados na matriz `items`.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "select_item", {
  item_list_id: "related_products",
  item_list_name: "Related products",
  items: [\
    {\
      item_id: "SKU_12345",\
      item_name: "Stan and Friends Tee",\
      affiliation: "Google Merchandise Store",\
      coupon: "SUMMER_FUN",\
      discount: 2.22,\
      index: 0,\
      item_brand: "Google",\
      item_category: "Apparel",\
      item_category2: "Adult",\
      item_category3: "Shirts",\
      item_category4: "Crew",\
      item_category5: "Short sleeve",\
      item_list_id: "related_products",\
      item_list_name: "Related Products",\
      item_variant: "green",\
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",\
      price: 10.01,\
      google_business_vertical: "retail",\
      quantity: 3\
    }\
  ]
});
```

## `select_promotion`

Esse evento indica que uma promoção foi selecionada em uma lista.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `creative_name` | `string` | Não | summer\_banner2 | Nome do criativo promocional.<br>Ignorado quando o parâmetro é definido no nível do item. |
| `creative_slot` | `string` | Não | featured\_app\_1 | Nome do slot do criativo promocional associado ao evento.<br>Ignorado quando o parâmetro é definido no nível do item. |
| `promotion_id` | `string` | Não | P\_12345 | ID da promoção associada ao evento.<br>Ignorado quando o parâmetro é definido no nível do item. |
| `promotion_name` | `string` | Não | Promoção de verão | Nome da promoção associada ao evento.<br>Ignorado quando o parâmetro é definido no nível do item. |
| `items` | `<br>          Array<Item>` | Não |  | Itens do evento. |

#### Parâmetros do item

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `item_id` | `string` | **Sim\*** | SKU\_12345 | ID do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `item_name` | `string` | **Sim\*** | Camiseta Stan and Friends | Nome do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `affiliation` | `string` | Não | Google Store | Uma afiliação de produto para indicar uma empresa fornecedora ou loja física.<br> Observação: "affiliation" está disponível apenas no escopo do item. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao item.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `creative_name` | `string` | Não | summer\_banner2 | Nome do criativo promocional.<br>Se definido, o parâmetro `creative_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `creative_name` no nível do evento (quando presente). |
| `creative_slot` | `string` | Não | featured\_app\_1 | Nome do slot do criativo promocional associado ao item.<br>Se definido, o parâmetro `creative_slot` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `creative_slot` no nível do evento (quando presente). |
| `discount` | `number` | Não | 2,22 | Valor do desconto monetário unitário associado ao item. |
| `index` | `number` | Não | 5 | Índice/posição do item em uma lista. |
| `item_brand` | `string` | Não | Google | Marca do item. |
| `item_category` | `string` | Não | Vestuário | Categoria do item. Quando usada como parte de uma hierarquia de categorias ou taxonomia, é a primeira categoria. |
| `item_category2` | `string` | Não | Adulto | Hierarquia da segunda categoria ou taxonomia adicional do item. |
| `item_category3` | `string` | Não | Camisas | Hierarquia da terceira categoria ou taxonomia adicional do item. |
| `item_category4` | `string` | Não | Gola redonda | Hierarquia da quarta categoria ou taxonomia adicional do item. |
| `item_category5` | `string` | Não | Manga curta | Hierarquia da quinta categoria ou taxonomia adicional do item. |

| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_id` no nível do evento (quando presente). |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_name` no nível do evento (quando presente). |
| `item_variant` | `string` | Não | verde | Variante, código exclusivo ou descrição do item para detalhes/opções adicionais. |
| `location_id` | `string` | Não | ChIJIQBpAG2ahYAR\_6128GcTUEo (o ID de lugar do Google para São Francisco) | O local físico associado ao item, como a localização da filial da loja. É recomendável usar o ID de lugar do Google que corresponde ao item associado. Também é possível usar um ID de local personalizado.<br> Observação: "location id" está disponível apenas no escopo do item. |
| `price` | `number` | Não | 10,01 | O preço unitário monetário do item, em unidades do parâmetro de moeda especificado.<br> <br>Se um desconto for aplicado ao item, defina `price` como o preço unitário com desconto e<br> especifique o desconto no preço unitário no parâmetro `discount`. |
| `promotion_id` | `string` | Não | P\_12345 | ID da promoção associada ao item.<br>Se definido, o parâmetro `promotion_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `promotion_id` no nível do evento (quando presente). |
| `promotion_name` | `string` | Não | Promoção de verão | Nome da promoção associada ao item.<br>Se definido, o parâmetro `promotion_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `promotion_name` no nível do evento (quando presente). |
| `quantity` | `number` | Não | 3 | Quantidade do item.<br>Se não for definido, `quantity` vai usar o valor "1". |

Além dos parâmetros prescritos, você pode incluir até 27 parâmetros personalizados na matriz `items`.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "select_promotion", {
  creative_name: "Summer Banner",
  creative_slot: "featured_app_1",
  promotion_id: "P_12345",
  promotion_name: "Summer Sale",
  items: [\
    {\
      item_id: "SKU_12345",\
      item_name: "Stan and Friends Tee",\
      affiliation: "Google Merchandise Store",\
      coupon: "SUMMER_FUN",\
      creative_name: "summer_banner2",\
      creative_slot: "featured_app_1",\
      discount: 2.22,\
      index: 0,\
      item_brand: "Google",\
      item_category: "Apparel",\
      item_category2: "Adult",\
      item_category3: "Shirts",\
      item_category4: "Crew",\
      item_category5: "Short sleeve",\
      item_list_id: "related_products",\
      item_list_name: "Related Products",\
      item_variant: "green",\
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",\
      price: 10.01,\
      promotion_id: "P_12345",\
      promotion_name: "Summer Sale",\
      google_business_vertical: "retail",\
      quantity: 3\
    }\
  ],
});
```

Use esse evento quando um usuário compartilhar conteúdo.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `method` | `string` | Não | Twitter | Método de compartilhamento do conteúdo. |
| `content_type` | `string` | Não | imagem | Tipo de conteúdo compartilhado. |
| `item_id` | `string` | Não | C\_12345 | ID do conteúdo compartilhado. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "share", {
  method: "Twitter",
  content_type: "image",
  item_id: "C_12345",
});
```

## `sign_up`

Esse evento indica que um usuário se inscreveu em uma conta. Use o evento para entender os diferentes comportamentos de usuários conectados e desconectados.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `method` | `string` | Não | Google | Método usado para inscrição. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "sign_up", {
  method: "Google"
});
```

## `spend_virtual_currency`

Esse evento mede a venda de produtos virtuais no seu app e ajuda você a identificar os itens mais procurados.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `value` | `number` | **Sim** | 5 | Valor da moeda virtual. |
| `virtual_currency_name` | `string` | **Sim** | Pedras preciosas | Nome da moeda virtual. |
| `item_name` | `string` | Não | Incentivo para iniciantes | Nome do item em que a moeda virtual está sendo usada. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "spend_virtual_currency", {
  value: 5,
  virtual_currency_name: "Gems",
  item_name: "Starter Boost"
});
```

## `tutorial_begin`

Esse evento indica o início do processo de integração. Use-o em um funil com tutorial\_complete para entender quantos usuários concluem o tutorial.

### Parâmetros

Não há parâmetros para esse evento.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "tutorial_begin");
```

## `tutorial_complete`

Esse evento indica a conclusão do processo de integração do usuário. Utilize-o em um funil com tutorial\_begin para entender quantos usuários concluem o tutorial.

### Parâmetros

Não há parâmetros sugeridos para esse evento.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "tutorial_complete");
```

## `unlock_achievement`

Registre esse evento quando o usuário desbloquear uma conquista. O evento ajuda você a entender como os usuários estão explorando seu jogo.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `achievement_id` | `string` | **Sim** | A\_12345 | ID da conquista que foi desbloqueada. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "unlock_achievement", {
  achievement_id: "A_12345"
});
```

## `view_cart`

Esse evento indica que um usuário viu o carrinho.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda dos itens associados ao evento, no formato ISO 4217 de três letras.<br>Métricas de valor no evento `view_item` para não contribuir com a receita<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* Defina `value` como a soma de `(price * quantity)` para todos os itens em<br> `items`. Não inclua `shipping` ou `tax`.<br> <br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |
| `items` | `Array<Item>` | **Sim** |  | Itens do evento. |

#### Parâmetros do item

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `item_id` | `string` | **Sim\*** | SKU\_12345 | ID do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `item_name` | `string` | **Sim\*** | Camiseta Stan and Friends | Nome do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `affiliation` | `string` | Não | Google Store | Uma afiliação de produto para indicar uma empresa fornecedora ou loja física.<br> Observação: "affiliation" está disponível apenas no escopo do item. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao item.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `discount` | `number` | Não | 2,22 | Valor do desconto monetário unitário associado ao item. |
| `index` | `number` | Não | 5 | Índice/posição do item em uma lista. |
| `item_brand` | `string` | Não | Google | Marca do item. |
| `item_category` | `string` | Não | Vestuário | Categoria do item. Quando usada como parte de uma hierarquia de categorias ou taxonomia, é a primeira categoria. |
| `item_category2` | `string` | Não | Adulto | Hierarquia da segunda categoria ou taxonomia adicional do item. |
| `item_category3` | `string` | Não | Camisas | Hierarquia da terceira categoria ou taxonomia adicional do item. |
| `item_category4` | `string` | Não | Gola redonda | Hierarquia da quarta categoria ou taxonomia adicional do item. |
| `item_category5` | `string` | Não | Manga curta | Hierarquia da quinta categoria ou taxonomia adicional do item. |

| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_id` no nível do evento (quando presente). |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_name` no nível do evento (quando presente). |
| `item_variant` | `string` | Não | verde | Variante, código exclusivo ou descrição do item para detalhes/opções adicionais. |
| `location_id` | `string` | Não | ChIJIQBpAG2ahYAR\_6128GcTUEo (o ID de lugar do Google para São Francisco) | O local físico associado ao item, como a localização da filial da loja. É recomendável usar o ID de lugar do Google que corresponde ao item associado. Também é possível usar um ID de local personalizado.<br> Observação: "location id" está disponível apenas no escopo do item. |
| `price` | `number` | Não | 10,01 | O preço unitário monetário do item, em unidades do parâmetro de moeda especificado.<br> <br>Se um desconto for aplicado ao item, defina `price` como o preço unitário com desconto e<br> especifique o desconto no preço unitário no parâmetro `discount`. |
| `quantity` | `number` | Não | 3 | Quantidade do item.<br>Se não for definido, `quantity` vai usar o valor "1". |

Além dos parâmetros prescritos, você pode incluir até 27 parâmetros personalizados na matriz `items`.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "view_cart", {
  currency: "USD",
  value: 30.03,
  items: [\
    {\
      item_id: "SKU_12345",\
      item_name: "Stan and Friends Tee",\
      affiliation: "Google Merchandise Store",\
      coupon: "SUMMER_FUN",\
      discount: 2.22,\
      index: 0,\
      item_brand: "Google",\
      item_category: "Apparel",\
      item_category2: "Adult",\
      item_category3: "Shirts",\
      item_category4: "Crew",\
      item_category5: "Short sleeve",\
      item_list_id: "related_products",\
      item_list_name: "Related Products",\
      item_variant: "green",\
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",\
      price: 10.01,\
      google_business_vertical: "retail",\
      quantity: 3\
    }\
  ]
});
```

## `view_item`

Esse evento indica que parte do conteúdo foi exibido ao usuário. Use o evento para descobrir os itens mais procurados que foram visualizados.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda dos itens associados ao evento, no formato ISO 4217 de três letras.<br>Métricas de valor no evento `view_item` para não contribuir com a receita<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* Defina `value` como a soma de `(price * quantity)` para todos os itens em<br> `items`. Não inclua `shipping` ou `tax`.<br> <br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |
| `items` | `Array<Item>` | **Sim** |  | Itens do evento. |

#### Parâmetros do item

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `item_id` | `string` | **Sim\*** | SKU\_12345 | ID do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `item_name` | `string` | **Sim\*** | Camiseta Stan and Friends | Nome do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `affiliation` | `string` | Não | Google Store | Uma afiliação de produto para indicar uma empresa fornecedora ou loja física.<br> Observação: "affiliation" está disponível apenas no escopo do item. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao item.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `discount` | `number` | Não | 2,22 | Valor do desconto monetário unitário associado ao item. |
| `index` | `number` | Não | 5 | Índice/posição do item em uma lista. |
| `item_brand` | `string` | Não | Google | Marca do item. |
| `item_category` | `string` | Não | Vestuário | Categoria do item. Quando usada como parte de uma hierarquia de categorias ou taxonomia, é a primeira categoria. |
| `item_category2` | `string` | Não | Adulto | Hierarquia da segunda categoria ou taxonomia adicional do item. |
| `item_category3` | `string` | Não | Camisas | Hierarquia da terceira categoria ou taxonomia adicional do item. |
| `item_category4` | `string` | Não | Gola redonda | Hierarquia da quarta categoria ou taxonomia adicional do item. |
| `item_category5` | `string` | Não | Manga curta | Hierarquia da quinta categoria ou taxonomia adicional do item. |

| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_id` no nível do evento (quando presente). |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_name` no nível do evento (quando presente). |
| `item_variant` | `string` | Não | verde | Variante, código exclusivo ou descrição do item para detalhes/opções adicionais. |
| `location_id` | `string` | Não | ChIJIQBpAG2ahYAR\_6128GcTUEo (o ID de lugar do Google para São Francisco) | O local físico associado ao item, como a localização da filial da loja. É recomendável usar o ID de lugar do Google que corresponde ao item associado. Também é possível usar um ID de local personalizado.<br> Observação: "location id" está disponível apenas no escopo do item. |
| `price` | `number` | Não | 10,01 | O preço unitário monetário do item, em unidades do parâmetro de moeda especificado.<br> <br>Se um desconto for aplicado ao item, defina `price` como o preço unitário com desconto e<br> especifique o desconto no preço unitário no parâmetro `discount`. |
| `quantity` | `number` | Não | 3 | Quantidade do item.<br>Se não for definido, `quantity` vai usar o valor "1". |

Além dos parâmetros prescritos, você pode incluir até 27 parâmetros personalizados na matriz `items`.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "view_item", {
  currency: "USD",
  value: 30.03,
  items: [\
    {\
      item_id: "SKU_12345",\
      item_name: "Stan and Friends Tee",\
      affiliation: "Google Merchandise Store",\
      coupon: "SUMMER_FUN",\
      discount: 2.22,\
      index: 0,\
      item_brand: "Google",\
      item_category: "Apparel",\
      item_category2: "Adult",\
      item_category3: "Shirts",\
      item_category4: "Crew",\
      item_category5: "Short sleeve",\
      item_list_id: "related_products",\
      item_list_name: "Related Products",\
      item_variant: "green",\
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",\
      price: 10.01,\
      google_business_vertical: "retail",\
      quantity: 3\
    }\
  ]
});
```

## `view_item_list`

Registre esse evento quando uma lista de itens de uma determinada categoria for exibida para o usuário.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda dos itens associados ao evento, no formato ISO 4217 de três letras.<br>Métricas de valor no evento `view_item` para não contribuir com a receita<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Ignorado quando o parâmetro é definido no nível do item. |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Ignorado quando o parâmetro é definido no nível do item. |
| `items` | `Array<Item>` | **Sim** |  | Itens do evento. |

#### Parâmetros do item

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `item_id` | `string` | **Sim\*** | SKU\_12345 | ID do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `item_name` | `string` | **Sim\*** | Camiseta Stan and Friends | Nome do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `affiliation` | `string` | Não | Google Store | Uma afiliação de produto para indicar uma empresa fornecedora ou loja física.<br> Observação: "affiliation" está disponível apenas no escopo do item. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao item.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `discount` | `number` | Não | 2,22 | Valor do desconto monetário unitário associado ao item. |
| `index` | `number` | Não | 5 | Índice/posição do item em uma lista. |
| `item_brand` | `string` | Não | Google | Marca do item. |
| `item_category` | `string` | Não | Vestuário | Categoria do item. Quando usada como parte de uma hierarquia de categorias ou taxonomia, é a primeira categoria. |
| `item_category2` | `string` | Não | Adulto | Hierarquia da segunda categoria ou taxonomia adicional do item. |
| `item_category3` | `string` | Não | Camisas | Hierarquia da terceira categoria ou taxonomia adicional do item. |
| `item_category4` | `string` | Não | Gola redonda | Hierarquia da quarta categoria ou taxonomia adicional do item. |
| `item_category5` | `string` | Não | Manga curta | Hierarquia da quinta categoria ou taxonomia adicional do item. |

| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_id` no nível do evento (quando presente). |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_name` no nível do evento (quando presente). |
| `item_variant` | `string` | Não | verde | Variante, código exclusivo ou descrição do item para detalhes/opções adicionais. |
| `location_id` | `string` | Não | ChIJIQBpAG2ahYAR\_6128GcTUEo (o ID de lugar do Google para São Francisco) | O local físico associado ao item, como a localização da filial da loja. É recomendável usar o ID de lugar do Google que corresponde ao item associado. Também é possível usar um ID de local personalizado.<br> Observação: "location id" está disponível apenas no escopo do item. |
| `price` | `number` | Não | 10,01 | O preço unitário monetário do item, em unidades do parâmetro de moeda especificado.<br> <br>Se um desconto for aplicado ao item, defina `price` como o preço unitário com desconto e<br> especifique o desconto no preço unitário no parâmetro `discount`. |
| `quantity` | `number` | Não | 3 | Quantidade do item.<br>Se não for definido, `quantity` vai usar o valor "1". |

Além dos parâmetros prescritos, você pode incluir até 27 parâmetros personalizados na matriz `items`.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "view_item_list", {
  item_list_id: "related_products",
  item_list_name: "Related products",
  items: [\
    {\
      item_id: "SKU_12345",\
      item_name: "Stan and Friends Tee",\
      affiliation: "Google Merchandise Store",\
      coupon: "SUMMER_FUN",\
      discount: 2.22,\
      index: 0,\
      item_brand: "Google",\
      item_category: "Apparel",\
      item_category2: "Adult",\
      item_category3: "Shirts",\
      item_category4: "Crew",\
      item_category5: "Short sleeve",\
      item_list_id: "related_products",\
      item_list_name: "Related Products",\
      item_variant: "green",\
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",\
      price: 10.01,\
      google_business_vertical: "retail",\
      quantity: 3\
    }\
  ]
});
```

## `view_promotion`

Esse evento indica que uma promoção foi acessada em uma lista.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `creative_name` | `string` | Não | summer\_banner2 | Nome do criativo promocional.<br>Ignorado quando o parâmetro é definido no nível do item. |
| `creative_slot` | `string` | Não | featured\_app\_1 | Nome do slot do criativo promocional associado ao evento.<br>Ignorado quando o parâmetro é definido no nível do item. |
| `promotion_id` | `string` | Não | P\_12345 | ID da promoção associada ao evento.<br>Ignorado quando o parâmetro é definido no nível do item. |
| `promotion_name` | `string` | Não | Promoção de verão | Nome da promoção associada ao evento.<br>Ignorado quando o parâmetro é definido no nível do item. |
| `items` | `<br>      Array<Item>` | **Sim\*** |  | Itens do evento.<br>\\* A matriz do parâmetro `items` precisa ter um único elemento que representa o item associado à promoção. Quando há vários elementos definidos, só o primeiro em `items` é usado. |

#### Parâmetros do item

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `item_id` | `string` | **Sim\*** | SKU\_12345 | ID do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `item_name` | `string` | **Sim\*** | Camiseta Stan and Friends | Nome do item.<br>\*É preciso especificar `item_id` ou `item_name`. |
| `affiliation` | `string` | Não | Google Store | Uma afiliação de produto para indicar uma empresa fornecedora ou loja física.<br> Observação: "affiliation" está disponível apenas no escopo do item. |
| `coupon` | `string` | Não | SUMMER\_FUN | Nome/código do cupom associado ao item.<br>Os parâmetros `coupon` no nível do evento e do item são independentes. |
| `creative_name` | `string` | Não | summer\_banner2 | Nome do criativo promocional.<br>Se definido, o parâmetro `creative_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `creative_name` no nível do evento (quando presente). |
| `creative_slot` | `string` | Não | featured\_app\_1 | Nome do slot do criativo promocional associado ao item.<br>Se definido, o parâmetro `creative_slot` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `creative_slot` no nível do evento (quando presente). |
| `discount` | `number` | Não | 2,22 | Valor do desconto monetário unitário associado ao item. |
| `index` | `number` | Não | 5 | Índice/posição do item em uma lista. |
| `item_brand` | `string` | Não | Google | Marca do item. |
| `item_category` | `string` | Não | Vestuário | Categoria do item. Quando usada como parte de uma hierarquia de categorias ou taxonomia, é a primeira categoria. |
| `item_category2` | `string` | Não | Adulto | Hierarquia da segunda categoria ou taxonomia adicional do item. |
| `item_category3` | `string` | Não | Camisas | Hierarquia da terceira categoria ou taxonomia adicional do item. |
| `item_category4` | `string` | Não | Gola redonda | Hierarquia da quarta categoria ou taxonomia adicional do item. |
| `item_category5` | `string` | Não | Manga curta | Hierarquia da quinta categoria ou taxonomia adicional do item. |

| `item_list_id` | `string` | Não | related\_products | ID da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_id` no nível do evento (quando presente). |
| `item_list_name` | `string` | Não | Produtos relacionados | Nome da lista em que o item foi apresentado ao usuário.<br>Se definido, o parâmetro `item_list_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `item_list_name` no nível do evento (quando presente). |
| `item_variant` | `string` | Não | verde | Variante, código exclusivo ou descrição do item para detalhes/opções adicionais. |
| `location_id` | `string` | Não | ChIJIQBpAG2ahYAR\_6128GcTUEo (o ID de lugar do Google para São Francisco) | O local físico associado ao item, como a localização da filial da loja. É recomendável usar o ID de lugar do Google que corresponde ao item associado. Também é possível usar um ID de local personalizado.<br> Observação: "location id" está disponível apenas no escopo do item. |
| `price` | `number` | Não | 10,01 | O preço unitário monetário do item, em unidades do parâmetro de moeda especificado.<br> <br>Se um desconto for aplicado ao item, defina `price` como o preço unitário com desconto e<br> especifique o desconto no preço unitário no parâmetro `discount`. |
| `promotion_id` | `string` | Não | P\_12345 | ID da promoção associada ao item.<br>Se definido, o parâmetro `promotion_id` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `promotion_id` no nível do evento (quando presente). |
| `promotion_name` | `string` | Não | Promoção de verão | Nome da promoção associada ao item.<br>Se definido, o parâmetro `promotion_name` no nível do evento é ignorado.<br> <br>Se não foi definido, é usado o parâmetro `promotion_name` no nível do evento (quando presente). |
| `quantity` | `number` | Não | 3 | Quantidade do item.<br>Se não for definido, `quantity` vai usar o valor "1". |

Além dos parâmetros prescritos, você pode incluir até 27 parâmetros personalizados na matriz `items`.

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "view_promotion", {
  creative_name: "Summer Banner",
  creative_slot: "featured_app_1",
  promotion_id: "P_12345",
  promotion_name: "Summer Sale",
  items: [\
    {\
      item_id: "SKU_12345",\
      item_name: "Stan and Friends Tee",\
      affiliation: "Google Merchandise Store",\
      coupon: "SUMMER_FUN",\
      creative_name: "summer_banner2",\
      creative_slot: "featured_app_1",\
      discount: 2.22,\
      index: 0,\
      item_brand: "Google",\
      item_category: "Apparel",\
      item_category2: "Adult",\
      item_category3: "Shirts",\
      item_category4: "Crew",\
      item_category5: "Short sleeve",\
      item_list_id: "related_products",\
      item_list_name: "Related Products",\
      item_variant: "green",\
      location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",\
      price: 10.01,\
      promotion_id: "P_12345",\
      promotion_name: "Summer Sale",\
      google_business_vertical: "retail",\
      quantity: 3\
    }\
  ]
});
```

## `working_lead`

Esse evento mede quando um usuário entra em contato ou é contatado por um representante.

### Parâmetros

| Nome | Tipo | Obrigatório | Valor de exemplo | Descrição |
| --- | --- | --- | --- | --- |
| `currency` | `string` | **Sim\*** | USD | Moeda do `value` do evento, no formato ISO 4217 de três letras.<br>\\* Se você definir `value`, será necessário usar o parâmetro `currency` para que as métricas de receita sejam calculadas corretamente. |
| `value` | `number` | **Sim\*** | 30,03 | Valor monetário do evento.<br>\\* O parâmetro `value` costuma ser necessário para gerar relatórios importantes.<br> Se você marcar o evento como principal, é recomendável definir `value`.<br> <br>\\* O parâmetro `currency` é obrigatório quando você define `value`. |
| `lead_status` | `string` | Não | Conversas iniciadas | O status do lead. |

### Exemplo

O exemplo a seguir é para implementações da gtag.js:

```
gtag("event", "working_lead", {
  currency: "USD",
  value: 30.03,
  lead_status: "Started conversations"
});
```

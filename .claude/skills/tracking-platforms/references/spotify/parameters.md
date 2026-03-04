# Parameters

_This feature is currently in beta._

Parameters are optional objects that can be paired with the Spotify Pixel’s standard and custom events to provide additional details about an event. These details offer additional granularity in the conversion reporting, giving you a deeper look at campaign performance.

Spotify currently supports the standard parameters below:

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **Parameter Name** | **Parameter Description** | **Code Snippets** | **Example Code** | **Accepted Data** |
| quantity | Quantity of items added to cart or purchase. | w.spdt('checkout', {<br>quantity: 'INSERT\_QUANTITY',<br>}); | w.spdt('checkout', {<br>quantity: '3',<br>}); | Fields.int() |
| category | Customizable field used for lead events. | w.spdt('lead', {<br>category: 'INSERT\_CATEGORY',<br>}); | w.spdt('lead', {<br>category: 'Insurance Quote',<br>}); | Fields.string() |
| currency | Type of currency for purchase events.<br>To calculate the Average order value (AOV), Return on ad spend (ROAS) _,_ or Customer acquisition cost (CAC), this must be installed with the value parameter under a revenue tracking event _._ | w.spdt('purchase', {<br>currency: 'INSERT\_CURRENCY',<br>}); | w.spdt('purchase', {<br>currency: 'USD',<br>}); | Fields.string() |
| is\_new\_customer | Track if a customer is new to the site | w.spdt('custom\_event\_1', {<br>is\_new\_customer: 'INSERT\_IS\_NEW\_CUSTOMER',<br>}); | w.spdt('custom\_event\_1', {<br>is\_new\_customer: 'true',<br>}); | Fields.boolean() |
| product\_id | Unique ID of a product. | w.spdt('addtocart', {<br>product\_id: 'INSERT\_PRODUCT\_ID',<br>}); | w.spdt('addtocart', {<br>product\_id: 'A7k4D9mP3zQ2X1L6',<br>}); | Fields.string() |
| product\_name | The name of the page or product associated with the event. | w.spdt('addtocart', {<br>product\_name: 'INSERT\_PRODUCT\_NAME',<br>}); | w.spdt('addtocart', {<br>product\_name: 'Topshop Gemma striped crochet grab bag in black stripe',<br>}); | Fields.string() |
| product\_type | The category of a product (ex: Outerwear or Accessories) | w.spdt('product', {<br>product\_type: 'INSERT\_PRODUCT\_TYPE',<br>}); | w.spdt('product', {<br>product\_type: 'Accessories',<br>}); | Fields.string() |
| product\_vendor | Used to identify the seller. | w.spdt('product', {<br>product\_vendor: 'INSERT\_PRODUCT\_VENDOR',<br>}); | w.spdt('product', {<br>product\_vendor: 'Adidas',<br>}); | Fields.string() |
| type | Customizable field used for lead events. | w.spdt('lead', {<br>type: 'INSERT\_TYPE',<br>}); | w.spdt('lead', {<br>type: 'Home Insurance',<br>}); | Fields.string() |
| value | Worth of an item or lead<br>Note: To calculate the Average order value (AOV), Return on ad spend (ROAS) _,_ or Customer acquisition cost (CAC), this must be installed with the currency parameter under a revenue tracking event _._ | w.spdt('purchase', {<br>value: 'INSERT\_VALUE',<br>}); | w.spdt('purchase', {<br>value: '133.55',<br>}); | Fields.float() |
| variant\_id | Unique ID for a product | w.spdt('addtocart', {<br>variant\_id: 'INSERT\_VARIANT\_ID',<br>}); | w.spdt('addtocart', {<br>variant\_id: 'TSHIRT-1234-RD-M',<br>}); | Fields.string() |
| variant\_name | Corresponding name to the variant ID | w.spdt('addtocart', {<br>variant\_id: 'VARIANT\_NAME',<br>}); | w.spdt('addtocart', {<br>variant\_id: 'Red / Medium / Organic Cotton.',<br>}); | Fields.string() |
| event\_id | ID given to an event(s) sent to Spotify (used for deduplication) | w.spdt('signup', {<br>event\_id: 'INSERT\_EVENT\_ID',<br>}); | w.spdt('signup', {<br>event\_id: '9XaT2mVz7QL3pF1RcP8q1ZLm7XT9Fr4e',<br>}); | Fields.string() |
| line\_items | Additional metadata or unit of information | w.spdt('purchase', {<br>line\_items: 'INSERT\_LINE\_ITEMS',<br>}); | w.spdt('purchase', {<br>line\_items: <br>        value: 22.50 // price<br>        quantity: 1,<br>}); | Fields.list({   }), |
| discount\_code | Code for reduced price on a purchase | w.spdt('purchase', {<br>discount\_code: 'INSERT\_DISCOUNT\_CODE',<br>}); | w.spdt('custom\_event\_1', {<br>discount\_code: 'SIMMONS',<br>}); | Fields.string() |

For more info on event and parameter installation requirements for our conversion metrics. For Pixel implementation examples, [review the implementation guide](https://adshelp.spotify.com/HelpCenter/s/article/Sample-Pixel-Implementation-Guide-US?language=en_US).
# Spotify Conversions API

## About Spotify’s Conversions API

**What is Spotify’s Conversions API?**

Spotify’s Conversions API is a tagless attribution tool that enables you to directly pass online and offline conversion events to Spotify. The Conversions API is designed to provide comprehensive, high-fidelity attribution to help you understand the performance of your campaigns on Spotify.

Once created, the Conversions API connection should be selected as the conversion measurement data source during the Ads Manager campaign booking process.

Using the Spotify’s Conversions API with Ads Manager, you can:

- Install the Conversions API, one time, to measure all of your campaigns on Spotify.

- See the key cross-device actions listeners take on your website, app, or offline

- Better understand the ROI of your investment across Ads Manager.


**What can the Conversions API measure?**

The Conversions API supports the following events from your website, app, or offline:

- Add to Cart

- Alias

- Lead

- Page View

- Purchase

- Sign Up

- Start Checkout

- View Product

- Custom Event (up to 5)


## Onboarding Summary

The Spotify Conversions API (CAPI) enables advertisers to send web, app, and offline events through a server-to-server integration. Like [the Spotify Pixel](https://ads.spotify.com/en-US/ad-analytics/spotify-pixel/), this integration allows you to track and measure campaign attribution for your Spotify campaigns by passing these events to Spotify.

## Integration Methods

### _Direct Integration_

To maximize control over your integration process, we recommend creating a direct integrationwith the Conversions API. This will require developer involvement.

## Connect to the Conversions API in Ads Manager

1. Login to Ads Manager and navigate to Events from the global navigation icon in the top left corner

2. Once on this page, you can navigate to Connect data source and select Conversions API

3. Next, name your Conversions API

4. If you also plan to use the Spotify Pixel, it is recommended to create a dataset in order to enable deduplicated conversion measurement using both Spotify Pixel and Conversions API data.

5. Using the search bar, choose the Ad Account(s) to connect to your Conversions API. The desired Ad Account(s) must be associated with your Business account.

![](https://adshelp.spotify.com/servlet/rtaImage?eid=ka0Ti000000BfUT&feoid=00N57000006Yipw&refid=0EMTi000004Soqn)

6. On the “View Conversions API Instructions” read the “Access Conversions API” section then navigate to the Token section

7. Click “Generate token”

8. Generate your authentication token (you can generate up to 3 tokens)

9. Copy your token and Connection ID
1. You can only send events for Connection ID that belong to the org that generated the token.

## Creating a Direct Server-to-Server Integration

To create a direct server-to-server integration and access the Conversions API, you will need an authentication token and connection ID generated from the Events page in Spotify Ads Manager. You must be a Business Admin in Ads Manager to access the dashboard and follow the steps below.

**Authentication**

Spotify supports a long lived token. You will be able to generate up to 3 tokens at a time. After your third token is created you will need to delete a previous token to generate a new one. Your token will not expire and can be used indefinitely.

**Connection ID**

In order to access the API you’ll need to have your Connection ID. The Connection ID is a unique key assigned to your organization that allows you to access the API when used with the token. The connection ID can be found in Ads Manager under “View Conversions API Instructions.”

**User Data**

The Conversions API currently accepts four (4) identifier types: IP address, device ID, hashed email address, and hashed phone number. At least one type of identifier must be passed. As a best practice, include both IP and device ID when possible.

## Using the API

Endpoint

Resource URL: [https://capi.spotify.com/capi-direct/events/](https://capi.spotify.com/capi-direct/events/)

ConversionService

Resource URL: [https://capi.spotify.com/capi-direct/events/](https://capi.spotify.com/capi-direct/events/)

Request

Method: POST

Description: This method submits conversion events, enabling the tracking of user interactions such as purchases, checkouts, and other types of engagement through the specified direct API endpoint.

Request Parameters

**Request Body Schema:** application/json

|     |     |     |     |
| --- | --- | --- | --- |
| |     |     |     |     |
| --- | --- | --- | --- |
| **Parameter** | **Data Type** | **Required / Optional** | **Description** |
| capi\_connection\_id | string | required | Random UUID generated for each client ID to track conversion batches. This is the integration id used for dataset mapping |
| events | List<ConversionEvent> | required | Contains the list of conversion events posted to the API. |

ConversionEvent

|     |     |     |     |
| --- | --- | --- | --- |
| event\_id | string | required | Unique identifier for the event chosen by the advertiser, used for deduplication. |
| event\_name | string | required | Describes the conversion event. Must be one of \[ADD\_TO\_CART, LEAD, PURCHASE\]. |
| event\_time | long | required | RFC 3339 timestamp when the event occurred. Must be in the past. |
| event\_source\_url | string | optional | The URL where the event occurred, must start with "http://" or "https://". |
| action\_source | string | optional | The medium through which the conversion was made (WEB/APP/OFFLINE). |
| opt\_out\_targeting | boolean | optional | If true, the event will not be used for retargeting, only for attribution. |
| user\_data | UserData | required | Contains identifiers for the user involved in the event. Part of an **Event.** At least one user identifier is required for the conversion event |
| event\_details | EventDetails | optional | Contains detailed information about the event, such as amount and currency for PURCHASE events. |

**UserData**

|     |     |     |     |
| --- | --- | --- | --- |
| hashed\_emails | List<string> | optional | List of SHA-256 hashed emails of the customer. |
| device\_id | string | recommended | Part of **UserData**. Raw device id of the customer device. |
| hashed\_phone\_number | string | optional | SHA-256 hashed phone number of customer |
| ip\_address | string | recommended | IP address of the customer’s device |

**EventDetails**

|     |     |     |     |
| --- | --- | --- | --- |
| amount | double | optional | Monetary value, required for PURCHASE events. |
| currency | string | optional | ISO 4217 currency code, required for PURCHASE events. |
| content\_name | string | optional | Name of the product or page involved in the event. |
| content\_category | string | optional | Category of the content, should align with Google's Product Taxonomy. | |

**Conversion Events**

    PRODUCT,

    CHECK\_OUT,

    ADD\_TO\_CART,

    PURCHASE,

    LEAD,

    ALIAS,

    SIGN\_UP,

    CUSTOM\_EVENT\_1,

    CUSTOM\_EVENT\_2,

    CUSTOM\_EVENT\_3,

    CUSTOM\_EVENT\_4,

    CUSTOM\_EVENT\_5,

**Sample Request**

|     |     |
| --- | --- |
| **Field** | **Value** |
| **URL** | [https://capi.spotify.com/capi-direct/events/](https://capi.spotify.com/capi-direct/events/) |
| **Method** | POST |
| **Authorization Header** | Bearer \[access\_token\] |
| **Content-Type Header** | application/json |
| **Request Body** | {<br>conversion\_events: {<br>"capi\_connection\_id":"\[CONNECTION ID\]",<br>"events":\[<br>      {<br>         "event\_name":"PURCHASE",<br>         "event\_id":"bcde3456",<br>         "event\_time":"2022-10-12T07:00:00.00Z",<br>         "user\_data":{<br>            "device\_id":"rawdeviceid123xyz"<br>         },<br>         "event\_details":{<br>            "content\_category":"35",<br>            "currency":"USD",<br>            "amount":100.0<br>         }<br>      }<br>},<br>      {<br>         "event\_name":"CHECK\_OUT",<br>         "event\_id":"xyz987",<br>         "event\_time":"2022-10-12T07:00:00.00Z",<br>         "user\_data":{<br>            "hashed\_emails":\[<br>               " [hashedemail@spotify.com](mailto:hashedemail@spotify.com)"<br>            \],<br>            "device\_id":"rawdeviceid123xyz"<br>         },<br>         "event\_details":{<br>            "content\_category":"90"<br>         }<br>      }<br>\]<br>} |

**Sample Response**

|     |     |
| --- | --- |
| **Field** | **Value** |
| **Status** | 200 OK |
| **Body** | json {"message": "SUCCESS"} |

**Event Definitions**

|     |     |
| --- | --- |
| **Event Type Name** | **Description** |
| **Page View**<br>_optional_ | The act of landing on or viewing a specific page on a website. For example, landing on the website’s homepage or browsing a specific product page. Note that the page view event is required for all advertisers to track if they opt to utilize the Spotify Pixel. |
| **Lead**<br>_optional_ | The submission of information about a person or company that has expressed some form of interest in a product or service. For example, submitting an email address to sign up for a newsletter. Note that lead can mean different things depending on the advertiser and industry. |
| **Add to Cart**<br>_optional_ | The action of adding an item to a virtual shopping cart or basket. For example, clicking an Add to Cart button on a website, but not actually completing the purchase transaction. |
| **Purchase**<br>_optional_ | The completion of an online purchase transaction, usually signified by receiving order or purchase confirmation, or a transaction receipt. For example, landing on a Thank You or Order Confirmation page. |
| **View Product**<br>_optional_ | Measures the action of someone viewing a webpage dedicated to a specific product. <br>Best practices: <br>- The View Product event code must be installed on every product page that the advertiser is looking to measure.<br>  <br>- To get more granular insight on specific product names, it’s recommended to use the product\_name parameter to pass the name of the page or product associated with the product view event. |
| **Sign Up**<br>_optional_ | Measures the action of signing up or registering for an event, product, service, etc. |
| **Start Checkout**<br>_optional_ | Measures when a user has initiated the online checkout process. |
| **Alias**<br>_optional_ | Sends the advertiser’s customer details to Spotify (email, phone number). |
| **Custom Event**<br>_optional_ | Measures bespoke or custom event actions on a website that are not available as one of Spotify’s standard event types. These are events that you define yourself.<br>While in beta, custom events cannot be renamed. They will appear in the reporting as _Custom Event 1_, _Custom Event 2_, etc., so it’s important to document which custom events map to specific actions on your website when conducting the initial setup. <br>Note: Ads Manager currently supports up to 5 custom events. |



var import_node_module = require("node:module");
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __moduleCache = /* @__PURE__ */ new WeakMap;
var __toCommonJS = (from) => {
  var entry = __moduleCache.get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function")
    __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    }));
  __moduleCache.set(from, entry);
  return entry;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// src/index.ts
var exports_src = {};
__export(exports_src, {
  UserData: () => UserData,
  Tracker: () => Tracker,
  SpotifyDestination: () => SpotifyDestination,
  ItemData: () => ItemData,
  GoogleDestination: () => GoogleDestination,
  FacebookDestination: () => FacebookDestination,
  CustomData: () => CustomData
});
module.exports = __toCommonJS(exports_src);

// src/core/hash.ts
var import_node_crypto = require("node:crypto");
function sha256(value) {
  return import_node_crypto.createHash("sha256").update(value).digest("hex");
}

// src/core/event-assembler.ts
function sanitizeEventId(eventId) {
  if (!eventId)
    return;
  if (eventId.length <= 64)
    return eventId;
  return sha256(eventId).slice(0, 64);
}
function assembleEvent(eventName, options, defaults) {
  const userData = options.userData?.toUnifiedUserData();
  const customFields = options.customData?.getData();
  const currency = customFields?.currency;
  const context = {
    eventId: sanitizeEventId(options.eventId) ?? crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    sourceUrl: options.sourceUrl ?? defaults.sourceUrl,
    actionSource: options.actionSource ?? defaults.actionSource ?? "web",
    currency
  };
  switch (eventName) {
    case "page_view":
      return { event: "page_view", context, user: userData };
    case "view_product":
      return {
        event: "view_product",
        context,
        user: userData,
        item: customFields?.items[0] ?? { id: "", name: "" },
        value: customFields?.value
      };
    case "add_to_cart":
      return {
        event: "add_to_cart",
        context,
        user: userData,
        item: customFields?.items[0] ?? { id: "", name: "" },
        value: customFields?.value
      };
    case "begin_checkout":
      return {
        event: "begin_checkout",
        context,
        user: userData,
        items: customFields?.items ?? [],
        value: customFields?.value,
        coupon: customFields?.coupon
      };
    case "purchase":
      return {
        event: "purchase",
        context,
        user: userData,
        transactionId: customFields?.transactionId ?? "",
        value: customFields?.value ?? 0,
        tax: customFields?.tax,
        shipping: customFields?.shipping,
        coupon: customFields?.coupon,
        discountCode: customFields?.discountCode,
        isNewCustomer: customFields?.isNewCustomer,
        items: customFields?.items ?? []
      };
    case "lead":
      return {
        event: "lead",
        context,
        user: userData,
        value: customFields?.value,
        type: customFields?.type,
        category: customFields?.category
      };
    case "sign_up":
      return {
        event: "sign_up",
        context,
        user: userData,
        method: customFields?.method
      };
  }
}

// src/core/validator.ts
function validateEvent(event, hasGoogle) {
  const warnings = [];
  if (!event.user) {
    warnings.push({ message: "Nenhum dado de usuario fornecido. Matching quality sera baixa em todas as plataformas." });
  }
  if (!event.context.sourceUrl) {
    warnings.push({
      destination: "facebook",
      field: "sourceUrl",
      message: 'sourceUrl ausente. Obrigatorio para Facebook quando action_source e "website".'
    });
  }
  if (hasGoogle && !event.user?.gaClientId) {
    warnings.push({
      destination: "google",
      field: "gaClientId",
      message: "gaClientId (cookie _ga) ausente. Eventos Google serao atribuidos a usuario desconhecido."
    });
  }
  switch (event.event) {
    case "purchase":
      if (!event.items || event.items.length === 0) {
        warnings.push({ field: "items", message: "Purchase sem items. Dados de produto nao serao enviados." });
      }
      if (!event.transactionId) {
        warnings.push({ field: "transactionId", message: "Purchase sem transactionId. Deduplicacao por pedido nao funcionara." });
      }
      if (!event.context.currency) {
        warnings.push({ field: "currency", message: "Purchase sem currency. Obrigatorio para Facebook e Google." });
      }
      break;
    case "add_to_cart":
      if (!event.item || !event.item.id) {
        warnings.push({ field: "item", message: "AddToCart sem item. Dados de produto nao serao enviados." });
      }
      break;
    case "view_product":
      if (!event.item || !event.item.id) {
        warnings.push({ field: "item", message: "ViewProduct sem item. Dados de produto nao serao enviados." });
      }
      break;
    case "begin_checkout":
      if (!event.items || event.items.length === 0) {
        warnings.push({ field: "items", message: "BeginCheckout sem items. Dados de produto nao serao enviados." });
      }
      break;
  }
  return warnings;
}

// src/tracker.ts
class Tracker {
  destinations = [];
  defaults = {};
  setSourceUrl(sourceUrl) {
    this.defaults.sourceUrl = sourceUrl;
    return this;
  }
  setActionSource(actionSource) {
    this.defaults.actionSource = actionSource;
    return this;
  }
  addDestination(destination) {
    this.destinations.push(destination);
    return this;
  }
  async track(eventName, options = {}) {
    const event = assembleEvent(eventName, options, this.defaults);
    const hasGoogle = this.destinations.some((d) => d.platform === "google");
    const warnings = validateEvent(event, hasGoogle);
    const errors = [];
    const results = await Promise.allSettled(this.destinations.map((dest) => dest.send(event)));
    const destinationResults = results.map((result, i) => {
      const dest = this.destinations[i];
      if (result.status === "fulfilled") {
        if (result.value.status === "error") {
          errors.push({
            destination: `${dest.platform}:${dest.instanceId}`,
            message: result.value.errorMessage ?? "Unknown error",
            httpStatus: result.value.httpStatus
          });
        }
        return result.value;
      }
      const errorMsg = result.reason instanceof Error ? result.reason.message : String(result.reason);
      errors.push({
        destination: `${dest.platform}:${dest.instanceId}`,
        message: errorMsg
      });
      return {
        platform: dest.platform,
        instanceId: dest.instanceId,
        status: "error",
        errorMessage: errorMsg
      };
    });
    let clientPayloads;
    if (options.returnClientPayloads) {
      clientPayloads = { facebook: [], google: [], spotify: [] };
      for (const dest of this.destinations) {
        const payload = dest.toPixelPayload(event);
        const platform = dest.platform;
        clientPayloads[platform]?.push(payload);
      }
    }
    return {
      success: errors.length === 0,
      destinations: destinationResults,
      warnings,
      errors,
      clientPayloads
    };
  }
}
// src/builders/user-data.ts
class UserData {
  data = {};
  setEmail(email) {
    this.data.email = email;
    return this;
  }
  setPhone(phone) {
    this.data.phone = phone;
    return this;
  }
  setFirstName(firstName) {
    this.data.firstName = firstName;
    return this;
  }
  setLastName(lastName) {
    this.data.lastName = lastName;
    return this;
  }
  setClientIpAddress(ip) {
    this.data.ip = ip;
    return this;
  }
  setClientUserAgent(userAgent) {
    this.data.userAgent = userAgent;
    return this;
  }
  setExternalId(externalId) {
    this.data.externalId = externalId;
    return this;
  }
  setCity(city) {
    this.data.city = city;
    return this;
  }
  setState(state) {
    this.data.state = state;
    return this;
  }
  setZipCode(zipCode) {
    this.data.zipCode = zipCode;
    return this;
  }
  setCountry(country) {
    this.data.country = country;
    return this;
  }
  setBirthDate(birthDate) {
    this.data.birthDate = birthDate;
    return this;
  }
  setGender(gender) {
    this.data.gender = gender;
    return this;
  }
  setGaClientId(gaClientId) {
    this.data.gaClientId = gaClientId;
    return this;
  }
  setFbp(fbp) {
    this.data.fbp = fbp;
    return this;
  }
  setFbc(fbc) {
    this.data.fbc = fbc;
    return this;
  }
  setGclid(gclid) {
    this.data.gclid = gclid;
    return this;
  }
  setDeviceId(deviceId) {
    this.data.deviceId = deviceId;
    return this;
  }
  toUnifiedUserData() {
    return { ...this.data };
  }
}
// src/builders/custom-data.ts
class CustomData {
  data = { items: [] };
  setCurrency(currency) {
    this.data.currency = currency;
    return this;
  }
  setValue(value) {
    this.data.value = value;
    return this;
  }
  setContentName(contentName) {
    this.data.contentName = contentName;
    return this;
  }
  setOrderId(orderId) {
    this.data.orderId = orderId;
    this.data.transactionId = orderId;
    return this;
  }
  setTransactionId(transactionId) {
    this.data.transactionId = transactionId;
    this.data.orderId = transactionId;
    return this;
  }
  setTax(tax) {
    this.data.tax = tax;
    return this;
  }
  setShipping(shipping) {
    this.data.shipping = shipping;
    return this;
  }
  setCoupon(coupon) {
    this.data.coupon = coupon;
    return this;
  }
  setDiscountCode(discountCode) {
    this.data.discountCode = discountCode;
    return this;
  }
  setIsNewCustomer(isNew) {
    this.data.isNewCustomer = isNew;
    return this;
  }
  setType(type) {
    this.data.type = type;
    return this;
  }
  setCategory(category) {
    this.data.category = category;
    return this;
  }
  setMethod(method) {
    this.data.method = method;
    return this;
  }
  addItem(item) {
    this.data.items.push(item.toUnifiedItem());
    return this;
  }
  setItems(items) {
    this.data.items = items.map((i) => i.toUnifiedItem());
    return this;
  }
  getData() {
    return { ...this.data, items: [...this.data.items] };
  }
}
// src/builders/item-data.ts
class ItemData {
  data = {};
  setId(id) {
    this.data.id = id;
    return this;
  }
  setName(name) {
    this.data.name = name;
    return this;
  }
  setPrice(price) {
    this.data.price = price;
    return this;
  }
  setQuantity(quantity) {
    this.data.quantity = quantity;
    return this;
  }
  setCategory(category) {
    this.data.category = category;
    return this;
  }
  setBrand(brand) {
    this.data.brand = brand;
    return this;
  }
  setVariant(variant) {
    this.data.variant = variant;
    return this;
  }
  setCoupon(coupon) {
    this.data.coupon = coupon;
    return this;
  }
  setDiscount(discount) {
    this.data.discount = discount;
    return this;
  }
  setIndex(index) {
    this.data.index = index;
    return this;
  }
  setListId(listId) {
    this.data.listId = listId;
    return this;
  }
  setListName(listName) {
    this.data.listName = listName;
    return this;
  }
  toUnifiedItem() {
    return {
      id: this.data.id ?? "",
      name: this.data.name ?? "",
      ...this.data
    };
  }
}
// src/mappers/facebook-mapper.ts
var EVENT_NAMES = {
  page_view: "PageView",
  view_product: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  lead: "Lead",
  sign_up: "CompleteRegistration"
};
var ACTION_SOURCE_MAP = {
  web: "website",
  app: "app",
  offline: "physical_store",
  other: "other"
};
function mapItemToContentItem(item) {
  return {
    id: item.id,
    quantity: item.quantity ?? 1
  };
}
function extractContentIds(items) {
  return items.map((item) => item.id);
}
function mapUserDataToFacebook(user, hashFn) {
  const userData = {};
  if (user.email)
    userData.em = hashFn(user.email.toLowerCase().trim());
  if (user.phone)
    userData.ph = hashFn(user.phone.replace(/\D/g, ""));
  if (user.firstName)
    userData.fn = hashFn(user.firstName.toLowerCase().trim());
  if (user.lastName)
    userData.ln = hashFn(user.lastName.toLowerCase().trim());
  if (user.birthDate)
    userData.db = hashFn(user.birthDate.replace(/\D/g, ""));
  if (user.gender)
    userData.ge = hashFn(user.gender.toLowerCase().trim());
  if (user.city)
    userData.ct = hashFn(user.city.toLowerCase().replace(/\s/g, ""));
  if (user.state)
    userData.st = hashFn(user.state.toLowerCase());
  if (user.zipCode)
    userData.zp = hashFn(user.zipCode.replace(/-/g, ""));
  if (user.country)
    userData.country = hashFn(user.country.toLowerCase());
  if (user.ip)
    userData.client_ip_address = user.ip;
  if (user.userAgent)
    userData.client_user_agent = user.userAgent;
  if (user.fbp)
    userData.fbp = user.fbp;
  if (user.fbc)
    userData.fbc = user.fbc;
  if (user.externalId)
    userData.external_id = hashFn(user.externalId);
  if (user.deviceId)
    userData.madid = user.deviceId;
  return userData;
}
function buildPixelParams(event) {
  const params = {};
  const currency = event.context.currency;
  switch (event.event) {
    case "page_view":
      break;
    case "view_product":
      params.content_ids = [event.item.id];
      params.content_name = event.item.name;
      params.content_type = "product";
      if (event.item.category)
        params.content_category = event.item.category;
      if (currency)
        params.currency = currency;
      if (event.value != null)
        params.value = event.value;
      params.contents = [mapItemToContentItem(event.item)];
      break;
    case "add_to_cart":
      params.content_ids = [event.item.id];
      params.content_type = "product";
      if (currency)
        params.currency = currency;
      if (event.value != null)
        params.value = event.value;
      params.contents = [mapItemToContentItem(event.item)];
      break;
    case "begin_checkout":
      params.content_ids = extractContentIds(event.items);
      params.contents = event.items.map(mapItemToContentItem);
      params.num_items = event.items.length;
      if (currency)
        params.currency = currency;
      if (event.value != null)
        params.value = event.value;
      break;
    case "purchase":
      params.content_ids = extractContentIds(event.items);
      params.content_type = "product";
      params.contents = event.items.map(mapItemToContentItem);
      params.currency = currency;
      params.value = event.value;
      params.num_items = event.items.length;
      break;
    case "lead":
      if (currency)
        params.currency = currency;
      if (event.value != null)
        params.value = event.value;
      break;
    case "sign_up":
      params.status = true;
      break;
  }
  return params;
}
function buildCapiEvent(event, hashFn) {
  const pixelParams = buildPixelParams(event);
  const serverEvent = {
    event_name: EVENT_NAMES[event.event],
    event_time: Math.floor(new Date(event.context.timestamp).getTime() / 1000),
    action_source: ACTION_SOURCE_MAP[event.context.actionSource ?? "web"],
    user_data: event.user ? mapUserDataToFacebook(event.user, hashFn) : { client_ip_address: "0.0.0.0" },
    event_id: event.context.eventId,
    event_source_url: event.context.sourceUrl,
    custom_data: pixelParams
  };
  if (event.user?.userAgent) {
    serverEvent.client_user_agent = event.user.userAgent;
  }
  return serverEvent;
}

class FacebookMapper {
  platform = "facebook";
  mapEventName(internalName, _target) {
    return EVENT_NAMES[internalName];
  }
  mapItem(item) {
    return mapItemToContentItem(item);
  }
  mapUserData(user) {
    return mapUserDataToFacebook(user, this.hashPii);
  }
  hashPii(value) {
    return sha256(value);
  }
  toPixelEvent(event) {
    return {
      eventName: this.mapEventName(event.event, "pixel"),
      params: buildPixelParams(event),
      eventId: event.context.eventId
    };
  }
  toCapiEvent(event) {
    return buildCapiEvent(event, this.hashPii);
  }
}

// src/core/retry.ts
var DEFAULT_MAX_RETRIES = 2;
var DEFAULT_BASE_DELAY_MS = 500;
function isRetryableStatus(status) {
  return status >= 500 || status === 429;
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function fetchWithRetry(url, init, options) {
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseDelay = options?.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  let lastError;
  let lastResponse;
  for (let attempt = 0;attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, init);
      if (!isRetryableStatus(response.status) || attempt === maxRetries) {
        return response;
      }
      lastResponse = response;
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) {
        throw err;
      }
    }
    await delay(baseDelay * Math.pow(2, attempt));
  }
  if (lastResponse)
    return lastResponse;
  throw lastError;
}

// src/destinations/facebook-destination.ts
var GRAPH_API_VERSION = "v21.0";
var TIMEOUT_MS = 1e4;

class FacebookDestination {
  platform = "facebook";
  instanceId;
  mapper = new FacebookMapper;
  config;
  constructor(config) {
    this.config = config;
    this.instanceId = config.pixelId;
  }
  async send(event) {
    const capiPayload = this.mapper.toCapiEvent(event);
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${this.config.pixelId}/events?access_token=${this.config.accessToken}`;
    const body = {
      data: [capiPayload]
    };
    if (this.config.testEventCode) {
      body.test_event_code = this.config.testEventCode;
    }
    try {
      const response = await fetchWithRetry(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      return {
        platform: this.platform,
        instanceId: this.instanceId,
        status: response.ok ? "success" : "error",
        httpStatus: response.status,
        errorMessage: response.ok ? undefined : await response.text()
      };
    } catch (err) {
      return {
        platform: this.platform,
        instanceId: this.instanceId,
        status: "error",
        errorMessage: err instanceof Error ? err.message : String(err)
      };
    }
  }
  toPixelPayload(event) {
    const pixel = this.mapper.toPixelEvent(event);
    return {
      eventName: pixel.eventName,
      params: pixel.params,
      eventId: pixel.eventId
    };
  }
}
// src/mappers/google-mapper.ts
var PIXEL_EVENT_NAMES = {
  page_view: "page_view",
  view_product: "view_item",
  add_to_cart: "add_to_cart",
  begin_checkout: "begin_checkout",
  purchase: "purchase",
  lead: "generate_lead",
  sign_up: "sign_up"
};
var CAPI_EVENT_NAMES = { ...PIXEL_EVENT_NAMES };
function mapItemToGoogle(item) {
  return {
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity ?? 1,
    item_category: item.category,
    item_brand: item.brand,
    item_variant: item.variant,
    coupon: item.coupon,
    discount: item.discount,
    index: item.index,
    item_list_id: item.listId,
    item_list_name: item.listName
  };
}
function mapUserDataToGoogle(user, hashFn) {
  const userData = {};
  if (user.email) {
    const normalizedEmail = user.email.toLowerCase().trim();
    userData.sha256_email_address = hashFn(normalizedEmail);
  }
  if (user.phone) {
    userData.sha256_phone_number = hashFn(user.phone.replace(/\D/g, ""));
  }
  if (user.firstName || user.lastName || user.city || user.state || user.zipCode || user.country) {
    const address = {};
    if (user.firstName)
      address.sha256_first_name = hashFn(user.firstName.toLowerCase().trim());
    if (user.lastName)
      address.sha256_last_name = hashFn(user.lastName.toLowerCase().trim());
    if (user.city)
      address.city = user.city;
    if (user.state)
      address.region = user.state;
    if (user.zipCode)
      address.postal_code = user.zipCode;
    if (user.country)
      address.country = user.country;
    userData.address = address;
  }
  return userData;
}
function buildPixelParams2(event) {
  const params = {};
  const currency = event.context.currency;
  switch (event.event) {
    case "page_view":
      break;
    case "view_product":
      if (currency)
        params.currency = currency;
      if (event.value != null)
        params.value = event.value;
      params.items = [mapItemToGoogle(event.item)];
      break;
    case "add_to_cart":
      if (currency)
        params.currency = currency;
      if (event.value != null)
        params.value = event.value;
      params.items = [mapItemToGoogle(event.item)];
      break;
    case "begin_checkout":
      if (currency)
        params.currency = currency;
      if (event.value != null)
        params.value = event.value;
      if (event.coupon)
        params.coupon = event.coupon;
      params.items = event.items.map(mapItemToGoogle);
      break;
    case "purchase":
      params.transaction_id = event.transactionId;
      params.currency = currency;
      params.value = event.value;
      if (event.tax != null)
        params.tax = event.tax;
      if (event.shipping != null)
        params.shipping = event.shipping;
      if (event.coupon)
        params.coupon = event.coupon;
      if (event.isNewCustomer != null)
        params.customer_type = event.isNewCustomer ? "new" : "returning";
      params.items = event.items.map(mapItemToGoogle);
      break;
    case "lead":
      if (currency)
        params.currency = currency;
      if (event.value != null)
        params.value = event.value;
      break;
    case "sign_up":
      if (event.method)
        params.method = event.method;
      break;
  }
  return params;
}
function buildCapiEvent2(event, hashFn) {
  const mpEvent = {
    name: CAPI_EVENT_NAMES[event.event],
    params: {
      ...buildPixelParams2(event),
      engagement_time_msec: 100
    }
  };
  const body = {
    client_id: event.user?.gaClientId ?? "unknown",
    user_id: event.user?.externalId,
    events: [mpEvent]
  };
  if (event.context.timestamp) {
    body.timestamp_micros = new Date(event.context.timestamp).getTime() * 1000;
  }
  if (event.user) {
    body.user_data = mapUserDataToGoogle(event.user, hashFn);
  }
  return body;
}

class GoogleMapper {
  platform = "google";
  mapEventName(internalName, target) {
    return target === "pixel" ? PIXEL_EVENT_NAMES[internalName] : CAPI_EVENT_NAMES[internalName];
  }
  mapItem(item) {
    return mapItemToGoogle(item);
  }
  mapUserData(user) {
    return mapUserDataToGoogle(user, this.hashPii);
  }
  hashPii(value) {
    return sha256(value);
  }
  toPixelEvent(event) {
    return {
      eventName: this.mapEventName(event.event, "pixel"),
      params: buildPixelParams2(event),
      eventId: event.context.eventId
    };
  }
  toCapiEvent(event) {
    return buildCapiEvent2(event, this.hashPii);
  }
}

// src/destinations/google-destination.ts
var MP_ENDPOINT = "https://www.google-analytics.com/mp/collect";
var TIMEOUT_MS2 = 1e4;

class GoogleDestination {
  platform = "google";
  instanceId;
  mapper = new GoogleMapper;
  config;
  constructor(config) {
    this.config = config;
    this.instanceId = config.measurementId;
  }
  async send(event) {
    const capiPayload = this.mapper.toCapiEvent(event);
    const url = `${MP_ENDPOINT}?measurement_id=${this.config.measurementId}&api_secret=${this.config.apiSecret}`;
    try {
      const response = await fetchWithRetry(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(capiPayload),
        signal: AbortSignal.timeout(TIMEOUT_MS2)
      });
      return {
        platform: this.platform,
        instanceId: this.instanceId,
        status: response.ok ? "success" : "error",
        httpStatus: response.status,
        errorMessage: response.ok ? undefined : await response.text()
      };
    } catch (err) {
      return {
        platform: this.platform,
        instanceId: this.instanceId,
        status: "error",
        errorMessage: err instanceof Error ? err.message : String(err)
      };
    }
  }
  toPixelPayload(event) {
    const pixel = this.mapper.toPixelEvent(event);
    return {
      eventName: pixel.eventName,
      params: pixel.params,
      eventId: pixel.eventId
    };
  }
}
// src/mappers/spotify-mapper.ts
var PIXEL_EVENT_NAMES2 = {
  page_view: "view",
  view_product: "product",
  add_to_cart: "addtocart",
  begin_checkout: "checkout",
  purchase: "purchase",
  lead: "lead",
  sign_up: "signup"
};
var CAPI_EVENT_NAMES2 = {
  page_view: "PRODUCT",
  view_product: "PRODUCT",
  add_to_cart: "ADD_TO_CART",
  begin_checkout: "CHECK_OUT",
  purchase: "PURCHASE",
  lead: "LEAD",
  sign_up: "SIGN_UP"
};
var ACTION_SOURCE_MAP2 = {
  web: "WEB",
  app: "APP",
  offline: "OFFLINE",
  other: "WEB"
};
function mapItemToLineItem(item) {
  return {
    value: item.price,
    quantity: item.quantity ?? 1
  };
}
function mapUserDataToSpotify(user, hashFn) {
  const userData = {};
  if (user.email) {
    userData.hashed_emails = [hashFn(user.email.toLowerCase().trim())];
  }
  if (user.phone) {
    userData.hashed_phone_number = hashFn(user.phone.replace(/\D/g, ""));
  }
  if (user.ip) {
    userData.ip_address = user.ip;
  }
  if (user.deviceId) {
    userData.device_id = user.deviceId;
  }
  return userData;
}
function buildPixelParams3(event) {
  const params = {};
  const currency = event.context.currency;
  params.event_id = event.context.eventId;
  switch (event.event) {
    case "page_view":
      break;
    case "view_product":
      if (event.value != null)
        params.value = event.value;
      if (currency)
        params.currency = currency;
      params.product_id = event.item.id;
      params.product_name = event.item.name;
      if (event.item.category)
        params.product_type = event.item.category;
      if (event.item.brand)
        params.product_vendor = event.item.brand;
      break;
    case "add_to_cart":
      if (event.value != null)
        params.value = event.value;
      if (currency)
        params.currency = currency;
      params.quantity = event.item.quantity ?? 1;
      params.product_id = event.item.id;
      params.product_name = event.item.name;
      if (event.item.category)
        params.product_type = event.item.category;
      if (event.item.brand)
        params.product_vendor = event.item.brand;
      if (event.item.variant) {
        params.variant_id = event.item.variant;
        params.variant_name = event.item.variant;
      }
      break;
    case "begin_checkout":
      if (event.value != null)
        params.value = event.value;
      if (currency)
        params.currency = currency;
      params.quantity = event.items.reduce((sum, i) => sum + (i.quantity ?? 1), 0);
      params.line_items = event.items.map(mapItemToLineItem);
      break;
    case "purchase":
      params.value = event.value;
      if (currency)
        params.currency = currency;
      if (event.discountCode)
        params.discount_code = event.discountCode;
      if (event.isNewCustomer != null)
        params.is_new_customer = event.isNewCustomer;
      params.line_items = event.items.map(mapItemToLineItem);
      break;
    case "lead":
      if (event.value != null)
        params.value = event.value;
      if (currency)
        params.currency = currency;
      if (event.type)
        params.type = event.type;
      if (event.category)
        params.category = event.category;
      break;
    case "sign_up":
      break;
  }
  return params;
}
function buildCapiEvent3(event, hashFn) {
  const eventDetails = {};
  const currency = event.context.currency;
  switch (event.event) {
    case "view_product":
      if (event.value != null)
        eventDetails.amount = event.value;
      if (currency)
        eventDetails.currency = currency;
      eventDetails.content_name = event.item.name;
      if (event.item.category)
        eventDetails.content_category = event.item.category;
      break;
    case "add_to_cart":
      if (event.value != null)
        eventDetails.amount = event.value;
      if (currency)
        eventDetails.currency = currency;
      eventDetails.content_name = event.item.name;
      break;
    case "begin_checkout":
      if (event.value != null)
        eventDetails.amount = event.value;
      if (currency)
        eventDetails.currency = currency;
      break;
    case "purchase":
      eventDetails.amount = event.value;
      if (currency)
        eventDetails.currency = currency;
      break;
    case "lead":
      if (event.value != null)
        eventDetails.amount = event.value;
      if (currency)
        eventDetails.currency = currency;
      break;
    default:
      break;
  }
  const capiEvent = {
    event_id: event.context.eventId,
    event_name: CAPI_EVENT_NAMES2[event.event],
    event_time: event.context.timestamp,
    user_data: event.user ? mapUserDataToSpotify(event.user, hashFn) : { ip_address: "0.0.0.0" },
    event_source_url: event.context.sourceUrl,
    action_source: ACTION_SOURCE_MAP2[event.context.actionSource ?? "web"]
  };
  if (Object.keys(eventDetails).length > 0) {
    capiEvent.event_details = eventDetails;
  }
  return capiEvent;
}

class SpotifyMapper {
  platform = "spotify";
  mapEventName(internalName, target) {
    return target === "pixel" ? PIXEL_EVENT_NAMES2[internalName] : CAPI_EVENT_NAMES2[internalName];
  }
  mapItem(item) {
    return mapItemToLineItem(item);
  }
  mapUserData(user) {
    return mapUserDataToSpotify(user, this.hashPii);
  }
  hashPii(value) {
    return sha256(value);
  }
  toPixelEvent(event) {
    return {
      eventName: this.mapEventName(event.event, "pixel"),
      params: buildPixelParams3(event),
      eventId: event.context.eventId
    };
  }
  toCapiEvent(event) {
    return buildCapiEvent3(event, this.hashPii);
  }
}

// src/destinations/spotify-destination.ts
var CAPI_ENDPOINT = "https://capi.spotify.com/capi-direct/events/";
var TIMEOUT_MS3 = 1e4;

class SpotifyDestination {
  platform = "spotify";
  instanceId;
  mapper = new SpotifyMapper;
  config;
  constructor(config) {
    this.config = config;
    this.instanceId = config.connectionId;
  }
  async send(event) {
    const capiPayload = this.mapper.toCapiEvent(event);
    const body = {
      conversion_events: {
        capi_connection_id: this.config.connectionId,
        events: [capiPayload]
      }
    };
    try {
      const response = await fetchWithRetry(CAPI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.bearerToken}`
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS3)
      });
      return {
        platform: this.platform,
        instanceId: this.instanceId,
        status: response.ok ? "success" : "error",
        httpStatus: response.status,
        errorMessage: response.ok ? undefined : await response.text()
      };
    } catch (err) {
      return {
        platform: this.platform,
        instanceId: this.instanceId,
        status: "error",
        errorMessage: err instanceof Error ? err.message : String(err)
      };
    }
  }
  toPixelPayload(event) {
    const pixel = this.mapper.toPixelEvent(event);
    return {
      eventName: pixel.eventName,
      params: pixel.params,
      eventId: pixel.eventId
    };
  }
}

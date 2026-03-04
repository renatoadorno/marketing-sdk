/**
* Schema Unificado — Taxonomia Interna da Aplicação
*
* Todos os dados de tracking passam por estes tipos antes de serem
* convertidos para o formato de cada plataforma via mappers.
*
* Nomenclatura interna: snake_case (ex: view_product, add_to_cart)
*/
interface UnifiedItem {
	/** ID do produto/SKU (obrigatório) */
	id: string;
	/** Nome do produto (obrigatório) */
	name: string;
	/** Preço unitário */
	price?: number;
	/** Quantidade (default: 1) */
	quantity?: number;
	/** Categoria principal */
	category?: string;
	/** Marca/Produtor */
	brand?: string;
	/** Variante (ex: setor, tipo de ingresso, cor) */
	variant?: string;
	/** Cupom aplicado no item */
	coupon?: string;
	/** Valor do desconto unitário */
	discount?: number;
	/** Posição em uma lista */
	index?: number;
	/** Lista de origem (ex: "resultados de busca", "destaques") */
	listId?: string;
	/** Nome da lista de origem */
	listName?: string;
}
interface UnifiedUserData {
	/** Email do cliente (raw — será hasheado pelo mapper) */
	email?: string;
	/** Telefone com código do país (ex: +5511999999999) */
	phone?: string;
	/** Primeiro nome */
	firstName?: string;
	/** Sobrenome */
	lastName?: string;
	/** IP do cliente */
	ip?: string;
	/** User agent do browser */
	userAgent?: string;
	/** ID interno do usuário no seu sistema */
	externalId?: string;
	/** Cidade */
	city?: string;
	/** Estado (código 2 chars, ex: SP) */
	state?: string;
	/** CEP */
	zipCode?: string;
	/** País (ISO 3166-1 alpha-2, ex: BR) */
	country?: string;
	/** Data de nascimento (YYYYMMDD) */
	birthDate?: string;
	/** Gênero ('m' ou 'f') */
	gender?: "m" | "f";
	/** Client ID do Google Analytics (cookie _ga) */
	gaClientId?: string;
	/** Browser ID do Facebook (cookie _fbp) */
	fbp?: string;
	/** Click ID do Facebook (cookie _fbc) */
	fbc?: string;
	/** Google Click ID (gclid) */
	gclid?: string;
	/** Device ID (mobile) */
	deviceId?: string;
}
type UnifiedActionSource = "web" | "app" | "offline" | "other";
interface UnifiedEventContext {
	/** UUID único do evento — usado para deduplicação em TODAS as plataformas */
	eventId: string;
	/** Timestamp ISO 8601 (ex: 2026-03-02T10:30:00Z) */
	timestamp: string;
	/** URL onde o evento ocorreu */
	sourceUrl?: string;
	/** Origem da ação */
	actionSource?: UnifiedActionSource;
	/** Moeda ISO 4217 (ex: BRL, USD) — padrão para todos os valores monetários */
	currency?: string;
}
interface UnifiedPageView {
	event: "page_view";
	context: UnifiedEventContext;
	user?: UnifiedUserData;
}
interface UnifiedViewProduct {
	event: "view_product";
	context: UnifiedEventContext;
	user?: UnifiedUserData;
	/** Produto visualizado */
	item: UnifiedItem;
	/** Valor total exibido */
	value?: number;
}
interface UnifiedAddToCart {
	event: "add_to_cart";
	context: UnifiedEventContext;
	user?: UnifiedUserData;
	/** Item adicionado */
	item: UnifiedItem;
	/** Valor total (price × quantity) */
	value?: number;
}
interface UnifiedBeginCheckout {
	event: "begin_checkout";
	context: UnifiedEventContext;
	user?: UnifiedUserData;
	/** Itens no checkout */
	items: UnifiedItem[];
	/** Valor total do checkout */
	value?: number;
	/** Cupom aplicado no checkout */
	coupon?: string;
}
interface UnifiedPurchase {
	event: "purchase";
	context: UnifiedEventContext;
	user?: UnifiedUserData;
	/** ID único do pedido/transação — permanente */
	transactionId: string;
	/** Valor total (soma de price × quantity) — NÃO incluir tax/shipping */
	value: number;
	/** Impostos */
	tax?: number;
	/** Frete */
	shipping?: number;
	/** Cupom aplicado */
	coupon?: string;
	/** Código de desconto */
	discountCode?: string;
	/** É um novo cliente? */
	isNewCustomer?: boolean;
	/** Itens comprados */
	items: UnifiedItem[];
}
interface UnifiedLead {
	event: "lead";
	context: UnifiedEventContext;
	user?: UnifiedUserData;
	/** Valor estimado do lead */
	value?: number;
	/** Tipo/categoria do lead */
	type?: string;
	/** Categoria */
	category?: string;
}
interface UnifiedSignUp {
	event: "sign_up";
	context: UnifiedEventContext;
	user?: UnifiedUserData;
	/** Método de cadastro (ex: email, google, facebook) */
	method?: string;
}
type UnifiedEvent = UnifiedPageView | UnifiedViewProduct | UnifiedAddToCart | UnifiedBeginCheckout | UnifiedPurchase | UnifiedLead | UnifiedSignUp;
type UnifiedEventName = UnifiedEvent["event"];
interface TrackResult {
	success: boolean;
	destinations: DestinationResult[];
	warnings: TrackWarning[];
	errors: TrackError[];
	clientPayloads?: ClientPayloads;
}
interface DestinationResult {
	platform: string;
	instanceId: string;
	status: "success" | "error";
	httpStatus?: number;
	errorMessage?: string;
}
interface TrackWarning {
	destination?: string;
	field?: string;
	message: string;
}
interface TrackError {
	destination: string;
	message: string;
	httpStatus?: number;
}
interface ClientPayloads {
	facebook?: ClientPayloadEntry[];
	google?: ClientPayloadEntry[];
	spotify?: ClientPayloadEntry[];
}
interface ClientPayloadEntry {
	eventName: string;
	params: Record<string, unknown>;
	eventId: string;
}
interface Destination {
	readonly platform: string;
	readonly instanceId: string;
	send(event: UnifiedEvent): Promise<DestinationResult>;
	toPixelPayload(event: UnifiedEvent): ClientPayloadEntry;
}
interface FacebookDestinationConfig {
	pixelId: string;
	accessToken: string;
	testEventCode?: string;
}
interface GoogleDestinationConfig {
	measurementId: string;
	apiSecret: string;
}
interface SpotifyDestinationConfig {
	connectionId: string;
	bearerToken: string;
}
declare class UserData {
	private data;
	setEmail(email: string): this;
	setPhone(phone: string): this;
	setFirstName(firstName: string): this;
	setLastName(lastName: string): this;
	setClientIpAddress(ip: string): this;
	setClientUserAgent(userAgent: string): this;
	setExternalId(externalId: string): this;
	setCity(city: string): this;
	setState(state: string): this;
	setZipCode(zipCode: string): this;
	setCountry(country: string): this;
	setBirthDate(birthDate: string): this;
	setGender(gender: "m" | "f"): this;
	setGaClientId(gaClientId: string): this;
	setFbp(fbp: string): this;
	setFbc(fbc: string): this;
	setGclid(gclid: string): this;
	setDeviceId(deviceId: string): this;
	toUnifiedUserData(): UnifiedUserData;
}
declare class ItemData {
	private data;
	setId(id: string): this;
	setName(name: string): this;
	setPrice(price: number): this;
	setQuantity(quantity: number): this;
	setCategory(category: string): this;
	setBrand(brand: string): this;
	setVariant(variant: string): this;
	setCoupon(coupon: string): this;
	setDiscount(discount: number): this;
	setIndex(index: number): this;
	setListId(listId: string): this;
	setListName(listName: string): this;
	toUnifiedItem(): UnifiedItem;
}
interface CustomDataFields {
	currency?: string;
	value?: number;
	contentName?: string;
	orderId?: string;
	transactionId?: string;
	tax?: number;
	shipping?: number;
	coupon?: string;
	discountCode?: string;
	isNewCustomer?: boolean;
	type?: string;
	category?: string;
	method?: string;
	items: UnifiedItem[];
}
declare class CustomData {
	private data;
	setCurrency(currency: string): this;
	setValue(value: number): this;
	setContentName(contentName: string): this;
	setOrderId(orderId: string): this;
	setTransactionId(transactionId: string): this;
	setTax(tax: number): this;
	setShipping(shipping: number): this;
	setCoupon(coupon: string): this;
	setDiscountCode(discountCode: string): this;
	setIsNewCustomer(isNew: boolean): this;
	setType(type: string): this;
	setCategory(category: string): this;
	setMethod(method: string): this;
	addItem(item: ItemData): this;
	setItems(items: ItemData[]): this;
	getData(): CustomDataFields;
}
interface TrackOptions {
	userData?: UserData;
	customData?: CustomData;
	sourceUrl?: string;
	actionSource?: UnifiedActionSource;
	eventId?: string;
	returnClientPayloads?: boolean;
}
declare class Tracker {
	private destinations;
	private defaults;
	setSourceUrl(sourceUrl: string): this;
	setActionSource(actionSource: UnifiedActionSource): this;
	addDestination(destination: Destination): this;
	track(eventName: UnifiedEventName, options?: TrackOptions): Promise<TrackResult>;
}
declare class FacebookDestination implements Destination {
	readonly platform = "facebook";
	readonly instanceId: string;
	private mapper;
	private config;
	constructor(config: FacebookDestinationConfig);
	send(event: UnifiedEvent): Promise<DestinationResult>;
	toPixelPayload(event: UnifiedEvent): ClientPayloadEntry;
}
declare class GoogleDestination implements Destination {
	readonly platform = "google";
	readonly instanceId: string;
	private mapper;
	private config;
	constructor(config: GoogleDestinationConfig);
	send(event: UnifiedEvent): Promise<DestinationResult>;
	toPixelPayload(event: UnifiedEvent): ClientPayloadEntry;
}
declare class SpotifyDestination implements Destination {
	readonly platform = "spotify";
	readonly instanceId: string;
	private mapper;
	private config;
	constructor(config: SpotifyDestinationConfig);
	send(event: UnifiedEvent): Promise<DestinationResult>;
	toPixelPayload(event: UnifiedEvent): ClientPayloadEntry;
}
export { UserData, UnifiedUserData, UnifiedItem, UnifiedEventName, UnifiedEventContext, UnifiedEvent, UnifiedActionSource, Tracker, TrackWarning, TrackResult, TrackError, SpotifyDestinationConfig, SpotifyDestination, ItemData, GoogleDestinationConfig, GoogleDestination, FacebookDestinationConfig, FacebookDestination, DestinationResult, Destination, CustomData, ClientPayloads, ClientPayloadEntry };

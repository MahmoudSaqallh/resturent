/* ------------------------------------------------------------------
   Domain models shared by the client, the order API and the data layer.
   Prices are in shekels (₪).
   ------------------------------------------------------------------ */

export type CategoryId =
  | "burgers"
  | "sandwiches"
  | "meals"
  | "chicken"
  | "pizza"
  | "sides"
  | "desserts"
  | "cold-drinks"
  | "hot-drinks"
  | "offers";

export type CategoryIcon =
  | "burger"
  | "sandwich"
  | "meal"
  | "chicken"
  | "pizza"
  | "fries"
  | "dessert"
  | "cold-drink"
  | "hot-drink"
  | "offer";

export interface Category {
  id: CategoryId;
  name: string;
  icon: CategoryIcon;
  /** Offers have their own section, so they are not a menu filter. */
  showInMenu: boolean;
  /** Small photo used by homepage category shortcuts. */
  image?: string;
}

export type DrinkType = "soda" | "juice" | "water" | "cold" | "coffee" | "hot";

export interface OptionChoice {
  id: string;
  label: string;
  /** Added to the unit price when selected. */
  priceDelta: number;
  /** When the choice is itself a menu item (meal drinks, combo builder). */
  productId?: string;
  available?: boolean;
  /** Real photo of this variation (size, flavour…); the product image swaps to it when chosen. */
  image?: string;
}

/** An extra is a priced choice inside an "extras" option group. */
export type Extra = OptionChoice;

export type OptionKind = "size" | "choice" | "extras" | "remove" | "drink" | "side" | "main";

export interface ProductOption {
  id: string;
  name: string;
  kind: OptionKind;
  selection: "single" | "multiple";
  required: boolean;
  maxSelections?: number;
  defaultChoiceIds?: string[];
  choices: OptionChoice[];
}

export type OfferType = "meal-deal" | "combo" | "family" | "limited";

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** One line for cards. */
  description: string;
  /** Full copy for the details view. */
  longDescription?: string;
  ingredients?: string[];
  image: string;
  imageAlt?: string;
  price: number;
  oldPrice?: number;
  /** Fixed saving applied to the configured price (combo builder). */
  bundleDiscount?: number;
  categoryId: CategoryId;
  options?: ProductOption[];
  available: boolean;
  featured?: boolean;
  popular?: boolean;
  isNew?: boolean;
  spicyLevel?: 0 | 1 | 2 | 3;
  prepNote?: string;
  keywords?: string[];
  /** Curated "goes well with" product ids. */
  pairsWith?: string[];
  drinkType?: DrinkType;
  /** What an offer contains. */
  includes?: { label: string; quantity: number; productId?: string }[];
  /** Not listed in menu grids (e.g. the combo builder product). */
  hidden?: boolean;
  /** Family meals: how many people it serves. */
  serves?: number;
  /** Verified allergen information only — never guessed. */
  allergens?: Allergen[];
  /** Real nutrition data only (per serving). */
  nutrition?: { calories: number; protein?: number; carbs?: number; fat?: number };
  /** Verified dietary tags; the menu filter appears only when some product has one. */
  dietary?: DietaryTag[];
  /** Kitchen-reported low stock ("كمية محدودة"). Unavailable items use `available: false`. */
  stock?: "limited";
  /** Time-based menu (breakfast, late night…): orderable only inside these daily windows, "HH:MM". */
  availableTimes?: { from: string; to: string }[];
}

export type Allergen = "dairy" | "gluten" | "nuts" | "eggs" | "soy" | "sesame" | "fish";
export type DietaryTag = "vegetarian" | "vegan" | "gluten-free";

export interface Promotion {
  id: string;
  type: OfferType;
  productId: string;
  /** Optional marketing line; falls back to the product description. */
  headline?: string;
  /** Shown as the homepage's featured offer. */
  featured?: boolean;
  /** ISO dates; set only for real limited-time offers. Outside the window the offer is hidden. */
  startsAt?: string;
  endsAt?: string;
}

/** Seasonal collection (رمضان، الصيف…). Shown only while active and only when configured. */
export interface Collection {
  id: string;
  title: string;
  description?: string;
  productIds: string[];
  startsAt?: string;
  endsAt?: string;
}

export interface Review {
  author: string;
  text: string;
  /** 1–5, only when the source review has a real rating. */
  rating?: number;
  source?: string;
}

export interface ImageAsset {
  src: string;
  alt: string;
}

/** A hero background file and its intrinsic size (needed for responsive srcsets). */
export interface HeroImage {
  src: string;
  width: number;
  height: number;
}

export type HighlightIcon = "flame" | "layers" | "pointer" | "timer";

/**
 * Curated homepage content. Product-linked blocks reference real product
 * ids so names, prices and add-to-cart stay live; sections hide themselves
 * when their data is empty or a product is unavailable.
 */
export interface HomeContent {
  hero: {
    /** Small brand label above the headline. */
    eyebrow: string;
    title: string[];
    /** Word in the headline set in the accent colour. */
    highlight?: string;
    supporting: string;
    /** Short handwritten-style brand phrase (desktop only). */
    note?: string;
    /** Art-directed backgrounds: food on one side, quiet dark space for the copy. */
    image: { wide: HeroImage; mid: HeroImage; tall: HeroImage; alt: string };
  };
  categoryIds: CategoryId[];
  bestSellerIds: string[];
  /** Product whose photo illustrates each build-your-meal step. */
  buildSteps: { title: string; text: string; productId: string }[];
  pair: { categoryId: CategoryId; title: string; text: string; image: ImageAsset }[];
  highlights: { icon: HighlightIcon; title: string; text: string }[];
  story: { title: string; paragraphs: string[]; image: ImageAsset } | null;
  gallery: ImageAsset[];
  /** Real customer reviews only. Leave empty to hide the section. */
  reviews: Review[];
  infoImage: ImageAsset;
  /** "وجبة اليوم": shown only when configured. */
  mealOfTheDay: { productId: string; note?: string } | null;
  /** Seasonal collections for /discover; empty = hidden. */
  collections: Collection[];
}

export interface MenuData {
  categories: Category[];
  products: Product[];
  promotions: Promotion[];
}

/** optionId -> selected choice ids */
export type Selections = Record<string, string[]>;

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  selections: Selections;
  note?: string;
  addedAt: number;
}

export interface FavoriteItem {
  productId: string;
  addedAt: number;
}

export type FulfillmentMethod = "delivery" | "pickup" | "dine-in";
export type PaymentMethodId = "cash" | "card" | "wallet";

export interface Customer {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface Address {
  zoneId: string;
  street: string;
  building: string;
  floor?: string;
  landmark?: string;
  driverNotes?: string;
}

export type OrderStatus = "received" | "preparing" | "ready" | "out-for-delivery" | "delivered";

export interface OrderLine {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  regularUnitPrice: number;
  total: number;
  options: string[];
  /** Kept so the order can be re-created ("اطلبها مرة ثانية"). */
  selections: Selections;
  note?: string;
}

export interface OrderTotals {
  subtotal: number;
  /** Savings from offer prices. */
  discount: number;
  couponDiscount: number;
  deliveryFee: number;
  total: number;
}

export type PaymentStatus = "unpaid" | "paid";

export interface Order {
  id: string;
  number: string;
  createdAt: string;
  status: OrderStatus;
  customer: Customer;
  fulfillment: FulfillmentMethod;
  branchId: string;
  address?: Address & { zoneName: string };
  /** Dine-in table from the QR code. */
  table?: string;
  /** ISO time for scheduled orders; absent = as soon as possible. */
  scheduledFor?: string;
  coupon?: { code: string; description: string };
  payment: PaymentMethodId;
  paymentStatus: PaymentStatus;
  lines: OrderLine[];
  totals: OrderTotals;
  /** Only set when a backend provides a real estimate. */
  estimatedReadyAt?: string;
}

/** Payload the client sends; the server re-prices everything from the catalog. */
export interface OrderRequest {
  items: { productId: string; quantity: number; selections: Selections; note?: string }[];
  customer: Customer;
  fulfillment: FulfillmentMethod;
  branchId?: string;
  address?: Address;
  table?: string;
  scheduledFor?: string;
  couponCode?: string;
  payment: PaymentMethodId;
}

export type OrderErrorCode =
  | "INVALID_REQUEST"
  | "EMPTY_CART"
  | "ITEM_UNAVAILABLE"
  | "INVALID_OPTIONS"
  | "RESTAURANT_CLOSED"
  | "BELOW_MINIMUM"
  | "UNSUPPORTED_METHOD"
  | "ORDERING_PAUSED"
  | "INVALID_SCHEDULE"
  | "INVALID_COUPON"
  | "DELIVERY_UNAVAILABLE";

export interface OrderErrorResponse {
  error: { code: OrderErrorCode; message: string; productIds?: string[] };
}

export interface OpeningHours {
  /** 0 = Sunday … 6 = Saturday */
  day: number;
  /** "HH:MM", 24h. A close time earlier than open means past midnight. */
  open: string;
  close: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  /** Overrides the restaurant-wide delivery minimum for this area. */
  minimumOrder?: number;
  /** Only when the business has a real estimate. */
  etaMinutes?: number;
  /** Branch that delivers to this area (defaults to the first branch). */
  branchId?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  phoneDisplay: string;
  mapsUrl: string;
  hours: OpeningHours[];
  image?: string;
  /** false = this branch is temporarily not taking orders. */
  acceptingOrders: boolean;
}

/** Manual switches the restaurant (or a backend) controls. */
export interface OperationalStatus {
  /** Closed regardless of the schedule. */
  manualClosed: boolean;
  /** ISO time; ordering paused until then. */
  pausedUntil?: string;
  /** Kitchen load, only when the restaurant or a backend reports it. Absent = not shown. */
  load?: "normal" | "high" | "very-high";
  message?: string;
}

export interface Coupon {
  code: string;
  description: string;
  type: "percent" | "fixed" | "free-delivery";
  value: number;
  /** Cap for percent coupons. */
  maxDiscount?: number;
  minimumOrder?: number;
  /** ISO date. */
  expiresAt?: string;
  /** Limits the discount to these categories; the minimum applies to their total. */
  categoryIds?: CategoryId[];
  active: boolean;
}

export type CouponResult =
  | { ok: true; coupon: Coupon; discount: number; freeDelivery: boolean }
  | { ok: false; reason: "invalid" | "expired" | "minimum" | "category"; minimumOrder?: number };

/** Prepared for a future account/backend; disabled until real rules exist. */
export interface LoyaltyConfig {
  enabled: boolean;
  pointsPerShekel?: number;
}

export interface LoyaltyAccount {
  points: number;
  rewards: { id: string; title: string; cost: number }[];
}

export interface RewardConfig {
  id: string;
  title: string;
  /** Points needed; set only from the restaurant's real programme. */
  cost: number;
  type: "free-item" | "discount";
}

/** Customer programmes. All need accounts + a backend; each stays off until both exist. */
export interface ProgramsConfig {
  loyalty: LoyaltyConfig & { rewards?: RewardConfig[]; rules?: string[] };
  referral: { enabled: boolean };
  giftCards: { enabled: boolean; fixedValues?: number[]; allowCustom?: boolean };
  wallet: { enabled: boolean };
  /** Group ordering needs a shared, live cart on the server. */
  groupOrders: { enabled: boolean };
  /** "بلغني عند توفره" needs accounts + notifications. */
  backInStockAlerts: { enabled: boolean };
}

/** Services beyond regular orders; each is shown only when the restaurant offers it. */
export interface ServicesConfig {
  /** Large orders for companies, groups and events, handled by direct contact. */
  largeOrders: { enabled: boolean; note?: string };
  catering?: { eventTypes: string[]; minimumGuests?: number; minimumOrder?: number; note?: string };
  reservations?: { maxPartySize: number };
}

export interface PoliciesConfig {
  /** The restaurant's actual cancellation / editing policy, in its own words. */
  cancellation?: string;
  delivery?: string;
}

export interface SchedulingConfig {
  enabled: boolean;
  /** Earliest slot = now + lead time. */
  leadMinutes: number;
  slotMinutes: number;
  daysAhead: number;
}

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  description: string;
  enabled: boolean;
}

export interface RestaurantInfo {
  name: string;
  nameLatin: string;
  tagline: string;
  description: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  instagram: string;
  social: { instagram?: string; facebook?: string; tiktok?: string };
  address: string;
  mapsUrl: string;
  timeZone: string;
  hours: OpeningHours[];
  acceptOrdersWhenClosed: boolean;
  /** Dine-in also requires a table number (from the table QR code). */
  fulfillment: Record<FulfillmentMethod, boolean>;
  branches: Branch[];
  operations: OperationalStatus;
  scheduling: SchedulingConfig;
  deliveryZones: DeliveryZone[];
  deliveryMinimum?: number;
  /** Free delivery from this subtotal; omit if not offered. */
  freeDeliveryOver?: number;
  /** Only when the business has a real figure. */
  prepTimeMinutes?: number;
  paymentMethods: PaymentMethod[];
  programs: ProgramsConfig;
  services: ServicesConfig;
  policies: PoliciesConfig;
}

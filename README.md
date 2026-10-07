# جمرة — restaurant ordering site

Arabic (RTL), mobile-first ordering platform for a fast-food and drinks brand. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4 and GSAP.

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npx tsc --noEmit   # run `npx next typegen` first on a fresh clone
npm run build && npm start
```

## Before launch: replace the sample data

Everything business-specific lives in four files:

| File | What to replace |
| --- | --- |
| `data/restaurant.ts` | Name, phone, WhatsApp, social links, branches (address, map, hours, `acceptingOrders`), time zone, order types, delivery zones (fee, minimum, real ETA), delivery minimum, free-delivery threshold, scheduling rules, operational switches (`manualClosed`, `pausedUntil`, `load`), payment methods, `services` (large orders, catering, reservations), `programs` (loyalty, referral, gift cards, wallet, group orders, back-in-stock — all off), `policies` (cancellation / delivery wording) |
| `data/menu.ts` | Categories, products, prices, options (size, protein, bread, spice level, extras, removals, drink — with optional real `image` per choice), offers (`serves`, `startsAt`, `endsAt`), pairings ("يُطلب معها غالباً"), `stock: "limited"`, `availableTimes` (breakfast / late night), and, only when verified, `allergens`, `nutrition`, `dietary`, `spicyLevel` |
| `data/home.ts` | Homepage copy and hero images, story, gallery, real reviews, `mealOfTheDay`, seasonal `collections` |
| `data/coupons.ts` | Promo codes (optionally limited to categories). Read on the server only; never sent to the browser |

Photos in `public/images/menu/` are Unsplash stock photos (Unsplash License) used as placeholders. Replace them with the restaurant's own photography.

**Honesty rules built into the UI:** no ratings, review counts, delivery times, prep times, discounts or "live" statuses are shown unless the data provides them. Each of these appears only when its data exists:

- A filter chip (spicy, vegetarian, discounted, available now).
- An allergen list or a nutrition table.
- A delivery ETA (`zone.etaMinutes`) or prep time (`prepTimeMinutes`).
- The `/branches` page (needs 2+ branches).
- The reviews section.
- A social icon.
- Meal of the day.

## Ordering features

| Area | Where |
| --- | --- |
| Order type: توصيل / استلام / داخل المطعم | `features/ordering/store.ts`, kept in session storage. Dine-in appears only after a table QR code (`?table=12` on any URL) |
| Branch choice | Shown only with 2+ branches. Delivery orders take the branch from the zone (`zone.branchId`) |
| Delivery zones | Fee, minimum (per zone or global) and optional ETA. Free delivery shows a progress bar ("باقي 12 ₪ لتحصل على توصيل مجاني") |
| Scheduled orders | `features/restaurant/ordering.ts` builds slots inside working hours, after the lead time, and outside any pause. The server re-validates the time |
| Restaurant status | Working hours, `manualClosed`, `pausedUntil`, `busy`. Browsing always works; when closed the customer can still schedule |
| Coupons | `POST /api/coupons` re-prices the cart lines from the catalog and previews the code; the order API validates it again. States: valid / invalid / expired / below minimum / category restriction |
| Checkout | 6 sections, guest checkout, optional email, floor field. Addresses are remembered only for this browser session. Confirm is disabled while offline |
| After ordering | Success page with order type and payment status, `/orders` history, `/track-order` lookup, reorder ("اطلبها مرة ثانية") with warnings for unavailable items, removed options and changed prices |
| Meal builder | `/build-meal`, 6 steps (main, size, side, drink, sauce, extras) with the price shown at every step |
| Menu | Filters backed by real data; search empty state "ما لقينا وجبة بهالاسم" |
| Offers | `/offers` grouped into combos, family (with "يكفي N أشخاص") and limited-time offers (hidden after `endsAt`), plus new items |
| Info pages | `/about`, `/faq` (answers generated from `data/restaurant.ts`, so they always match checkout rules), `/branches` |
| WhatsApp | The cart can send the order as a prefilled WhatsApp message; order pages prefill the order number |
| Quick order | Homepage "اطلب بسرعة" for returning customers: last order, items they ordered most, a saved meal — from this device's real history only |
| Saved meals | "وجباتي المفضلة": save a product with its exact options and note from its page; add it later at today's prices (`features/saved-meals`) |
| Reorder | Plans against today's menu first and lists every change (unavailable, removed options, new prices) before adding anything |
| Sharing | Product share menu (native share, copy link, WhatsApp). "شارك السلة" encodes the cart in the link fragment; `/shared-cart` re-checks everything before adding |
| Discover | `/discover`: mood chips and a simple price filter, seasonal collections, popular and new — secondary to the menu categories. `/menu` also has a price filter |
| Product details | Visual size selector with price difference, spice level in words, variation photos when real ones exist, limited-stock and serving-time notes, verified dietary tags |
| Restaurant state | Branch status (مفتوح / مغلق / متوقف مؤقتاً), kitchen load notices ("الطلبات مرتفعة حالياً") only when `operations.load` is set |
| QR | `/t/{branch}/{table}` → dine-in menu for that branch and table |
| Pages | `/large-orders` (catering details only if configured), `/delivery` (zones table, cancellation), `/reservations` and `/loyalty` (404 until enabled) |
| Receipt | Order pages print as a receipt (site chrome hidden). Tax invoices need the billing backend |

## Security and what's real

- `POST /api/orders` re-prices every line from the catalog. Client-sent prices and totals are ignored. It also enforces:
  - availability and required options;
  - order type and table, delivery zone and minimum;
  - opening hours, pause and manual close, and scheduled-time validity;
  - coupon rules and enabled payment methods.
- No secrets live in the client. Coupon codes stay on the server. Payment providers are not connected: card and wallet stay `enabled: false` until a real provider is integrated server-side, and every order is created with `paymentStatus: "unpaid"`.
- **Orders are not stored or forwarded yet.** Connect the POS, database or notification channel in `app/api/orders/route.ts`. Until then, the confirmed order is saved in the customer's browser so the success, history and tracking pages work. The order page says plainly that live status updates are not available yet. Wire `Order.status` and `estimatedReadyAt` to the backend for real tracking.

## PWA and offline

- `app/manifest.ts` and the icons in `public/icons/` make the site installable.
- `public/sw.js` is registered in production only. Its caching rules:
  - Hashed build assets are cache-first.
  - Menu photos are cached as they are viewed, never pre-downloaded.
  - Pages are network-first, with `public/offline.html` as the fallback.
  - `/api/*`, checkout, order pages and RSC payloads are never cached, so prices and order data are always live.
- When the browser goes offline, a banner appears and checkout cannot be submitted.

## Prepared but not built (needs accounts / a backend)

Each of these is typed and switched off in `restaurant.programs` / `restaurant.services`, so nothing fake is shown:

- **Loyalty, rewards (نقاطي):** `/loyalty` renders configured rules and rewards when enabled; balances and history need accounts.
- **Referral, gift cards, wallet:** config flags only — enabling them needs accounts, payments and server rules.
- **Group orders:** needs a shared, live server-side cart. "شارك السلة" covers the simple family case without a backend.
- **Back-in-stock alerts ("بلغني عند توفره"):** needs accounts + notifications.
- **Accounts and saved addresses across visits:** addresses (البيت / الشغل / عنوان آخر) are kept for the browser session only; the shape matches what a profile API would return.
- **Push notifications:** only once `Order.status` comes from the server; permission is never requested up front.
- **Driver tracking / map location:** needs a delivery-tracking or maps integration; until then the order page shows the status timeline only and addresses are typed.
- **Online payment:** payment methods are data-driven; a provider needs server integration plus `enabled: true`.
- **English UI:** the app is Arabic-first RTL; layouts use logical properties so an LTR locale can be added.

## Homepage vs. menu

- `/` (`app/(home)`) is a landing page with curated previews only. `features/home/selection.ts` picks them.
- `/menu` (`app/(shop)/menu`) is the full menu. The category is in the URL: `/menu?category=burgers`.
- Only shopping pages (`app/(shop)`) get the full catalog up front:
  - The homepage ships its curated items only.
  - Content pages (`app/(info)`) ship categories only.
  - On those pages, the full catalog loads from the static `/api/menu` only when search, the cart or a product sheet needs it.
- The cart drawer, product sheet, search and mobile menu are split into separate chunks (`components/layout/lazy-overlays.tsx`). They mount on first open and preload while the browser is idle.

## Structure

```
app/(home)      homepage (curated catalog)
app/(shop)      menu, product/[slug], offers, drinks, build-meal, favorites,
                checkout, orders, orders/[id] (full catalog)
app/(info)      about, faq, branches, track-order (categories only)
app/api         orders (POST), coupons (POST), menu (static JSON)
components/     ui/, navigation/, layout/, home/, menu/, products/, cart/, checkout/,
                offers/, drinks/, favorites/, orders/, ordering/, info/
features/       cart (store, pricing, delivery rules, suggestions), coupons, ordering
                (session + pricing hook), checkout (validation, session draft), orders
                (server creation, client, store, reorder), restaurant (hours, ordering
                rules, FAQ), menu (catalog, search, filters), favorites, ui, toasts
data/           sample restaurant, menu, homepage and coupon data
lib/            store (useSyncExternalStore + local/session storage), motion, formatting
types/          domain models
```

- **Pricing** (`features/cart/pricing.ts`, `features/cart/delivery.ts`, `features/coupons/validate.ts`) is pure and shared by the client and the order API.
- **Persistence:**
  - Cart, favorites, recently viewed and order history use `localStorage`. They sync across tabs and validate stored data on read.
  - The ordering session (type, table, area, time, code) and checkout details use `sessionStorage`.
- **Overlays** use native `<dialog>` for focus trapping, Esc handling and an inert background.
- **Motion** is subtle and skipped entirely under `prefers-reduced-motion`. It covers:
  - the hero entrance and reveals on scroll;
  - overlay transitions and meal-builder step transitions;
  - cart and favorite feedback, and price changes.

  There is no ScrollTrigger; reveals use `IntersectionObserver`.

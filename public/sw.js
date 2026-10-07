/* JAMRA service worker.
 *
 * - Static build assets: cache-first (they are content-hashed).
 * - Menu photos: cached as they are viewed (never pre-downloaded), capped.
 * - Pages: network-first; a page seen before opens offline, else /offline.html.
 * - Never cached: /api/* (menu prices, coupons, orders), checkout, order
 *   pages and RSC payloads, so prices and order data are always live.
 */

const VERSION = "v1";
const STATIC_CACHE = `jamra-static-${VERSION}`;
const IMAGE_CACHE = `jamra-images-${VERSION}`;
const PAGE_CACHE = `jamra-pages-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const MAX_IMAGES = 80;
const MAX_PAGES = 20;

const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png"];
const NEVER_CACHE = [/^\/api\//, /^\/checkout/, /^\/orders/, /^\/track-order/];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const keep = [STATIC_CACHE, IMAGE_CACHE, PAGE_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !keep.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function cacheFirst(request, cacheName, max) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    if (max) trim(cacheName, max);
  }
  return response;
}

async function networkFirstPage(request, cacheable) {
  try {
    const response = await fetch(request);
    if (cacheable && response.ok && response.type === "basic") {
      const cache = await caches.open(PAGE_CACHE);
      await cache.put(request, response.clone());
      trim(PAGE_CACHE, MAX_PAGES);
    }
    return response;
  } catch {
    const cached = cacheable ? await caches.match(request) : undefined;
    return cached || (await caches.match(OFFLINE_URL)) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // React Server Component payloads are per-navigation data; leave them to the network.
  if (request.headers.get("RSC") || url.searchParams.has("_rsc")) return;

  const neverCache = NEVER_CACHE.some((pattern) => pattern.test(url.pathname));

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request, !neverCache && !url.search));
    return;
  }
  if (neverCache) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  if (url.pathname.startsWith("/_next/image") || url.pathname.startsWith("/images/")) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGES));
  }
});

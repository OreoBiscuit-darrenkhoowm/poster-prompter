/* Poster Prompter service worker.
 * Strategy:
 *   - navigations  -> network-first, fall back to the cached app shell (offline)
 *   - static GETs  -> stale-while-revalidate (Next.js hashed /_next assets, icons)
 *   - everything else (POST, cross-origin) -> straight to the network
 * Bump CACHE_VERSION whenever the precache list or strategy changes so old
 * caches are cleaned out on activate.
 */
const CACHE_VERSION = "v1";
const CACHE = `poster-prompter-${CACHE_VERSION}`;

// App shell + assets we know up front. Hashed Next.js bundles are picked up at
// runtime by the stale-while-revalidate handler below.
const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Let the page tell a waiting worker to take over immediately.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GETs; never cache POSTs or other methods.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Don't touch cross-origin requests (CDN fonts, external links, etc.).
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first so users get fresh content online, cached shell offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE);
          return (await cache.match(request)) || (await cache.match("/"));
        }),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});

// Service Worker — true offline PWA support.
//
// Strategy:
//   - Pre-cache the app shell on install (HTML + JS bundles + static assets).
//   - Network-first for navigations (so updates land), cache fallback when
//     the network's down.
//   - Cache-first for hashed assets (immutable bundles) — they never change
//     so the cache is always valid.
//
// Bumped CACHE_VERSION when you ship breaking changes; the install handler
// clears old caches automatically.

const CACHE_VERSION = "brainrot-v1";
const SHELL_PRECACHE = [
  "/",
  "/home",
  "/about",
  "/friends",
  "/endless",
  "/credits",
  "/profile",
  "/settings",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/og/default.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      // Best-effort: any one URL failing shouldn't break the whole install.
      await Promise.allSettled(
        SHELL_PRECACHE.map((u) => cache.add(u).catch(() => null)),
      );
      // Activate the new SW immediately on first install.
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Clear out any non-current caches from prior versions.
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Don't handle non-GET, chrome-extension, or cross-origin requests.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation requests → network-first, cache fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE_VERSION);
          cache.put(request, fresh.clone()).catch(() => {});
          return fresh;
        } catch {
          const cached = await caches.match(request);
          return (
            cached ||
            (await caches.match("/")) ||
            new Response("offline — try once you're online again.", {
              status: 503,
              headers: { "content-type": "text/plain" },
            })
          );
        }
      })(),
    );
    return;
  }

  // Hashed static assets → cache-first (immutable URLs).
  if (
    url.pathname.startsWith("/_expo/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/og/") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE_VERSION);
          cache.put(request, fresh.clone()).catch(() => {});
          return fresh;
        } catch {
          return new Response("", { status: 504 });
        }
      })(),
    );
    return;
  }

  // Everything else: stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      const fetchPromise = fetch(request)
        .then((resp) => {
          if (resp && resp.ok) {
            caches
              .open(CACHE_VERSION)
              .then((c) => c.put(request, resp.clone()))
              .catch(() => {});
          }
          return resp;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })(),
  );
});

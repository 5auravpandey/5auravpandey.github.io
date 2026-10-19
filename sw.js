/**
 * Saurav Pandey Portfolio - Progressive Web App Service Worker
 * Architecture: NetworkFirst for HTML navigation (always fresh content),
 * CacheFirst / StaleWhileRevalidate for versioned CSS, JS, Fonts & Assets.
 */

const CACHE_NAME = "sp-portfolio-cache-v20261020_v7";

const PRECACHE_ASSETS = [
  "./",
  "index.html",
  "assets/favicon.svg",
  "assets/og-image.png",
  "css/style.css?v=20261020_v7",
  "css/transitions.css?v=20261020_v7",
  "js/data/profile.js?v=20261020_v7",
  "js/data/experience.js?v=20261020_v7",
  "js/data/projects.js?v=20261020_v7",
  "js/data/skills.js?v=20261020_v7",
  "js/data/shelf.js?v=20261020_v7",
  "js/transitions.js?v=20261020_v7",
  "js/components/perspective.js?v=20261020_v7",
  "js/components/case-study.js?v=20261020_v7",
  "js/components/stack-explorer.js?v=20261020_v7",
  "js/data/database.js?v=20261020_v7",
  "js/components/playground.js?v=20261020_v7",
  "js/app.js?v=20261020_v7"
];

// Install: precache application shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Precache partial warning:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up outdated cache keys
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-First for HTML navigation, Stale-While-Revalidate for static assets
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Ignore non-GET requests or browser-extension schemes
  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  // Never cache external third-party OAuth or Telegram API calls
  if (request.url.includes("telegram.org") || request.url.includes("oauth.telegram.org")) {
    return;
  }

  // 1. HTML Navigation Requests (Network First, Cache Fallback)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cached) => cached || caches.match("index.html"));
        })
    );
    return;
  }

  // 2. Static Resources: Stale-While-Revalidate (Fast load from disk, background update)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});

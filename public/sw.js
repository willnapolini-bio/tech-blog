// ---------------------------------------------------------------------------
// Service Worker — Cache-First for Static Assets, Network-First for Pages
// ---------------------------------------------------------------------------
// Strategy:
//   - Static assets (JS, CSS, images, fonts): Cache-First (instant loads)
//   - HTML pages: Network-First (always fresh content for SEO)
//   - External resources (fonts, ads): Network-Only (pass through)
//
// Version this cache name when you deploy new content to bust old caches.
// ---------------------------------------------------------------------------

const CACHE_NAME = 'techpulse-v1';

// Files to pre-cache on service worker install (the app shell).
// These are fetched during the install event and stored in cache immediately.
// Detect base path from the service worker's scope
// For project pages on GitHub Pages, this will be '/tech-blog/'
// For user pages, this will be '/'
const BASE = self.location.pathname.replace(/sw\.js$/, '');

const PRECACHE_URLS = [
  BASE,
  `${BASE}blog/`,
  `${BASE}manifest.json`,
  `${BASE}favicon.svg`,
  `${BASE}icons/icon-192.png`,
  `${BASE}icons/icon-512.png`,
];

// Regex patterns for cache-first static assets
const STATIC_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/i;

// ---------------------------------------------------------------------------
// Install: Pre-cache the app shell
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Add precache URLs, ignoring failures for individual entries
      // (e.g., if a specific page doesn't exist yet)
      return Promise.allSettled(
        PRECACHE_URLS.map((url) => cache.add(url))
      );
    })
  );
  // Activate immediately without waiting for old clients to close
  self.skipWaiting();
});

// ---------------------------------------------------------------------------
// Activate: Clean up old caches
// ---------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ---------------------------------------------------------------------------
// Fetch: Route requests to the appropriate caching strategy
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (ads, analytics, fonts CDN)
  if (url.origin !== self.location.origin) return;

  // --- Strategy: Cache-First for static assets ---
  if (STATIC_EXTENSIONS.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // --- Strategy: Network-First for HTML pages ---
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default: Network-First for everything else (RSS, sitemap, etc.)
  event.respondWith(networkFirst(request));
});

// ---------------------------------------------------------------------------
// Cache-First: Serve from cache, fall back to network
// ---------------------------------------------------------------------------
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      // Clone before caching because the response stream can only be consumed once
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return a fallback for offline navigation
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// ---------------------------------------------------------------------------
// Network-First: Try network, fall back to cache
// ---------------------------------------------------------------------------
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Offline fallback page
    if (request.headers.get('accept')?.includes('text/html')) {
      const cache = await caches.open(CACHE_NAME);
      const offlinePage = await cache.match(BASE);
      if (offlinePage) return offlinePage;
    }

    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

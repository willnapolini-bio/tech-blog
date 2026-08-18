---
title: "How to Make Your Website a PWA in 2026: Complete Step-by-Step Guide"
description: "Learn how to convert any website into a Progressive Web App (PWA) in 2026. Covers web app manifest, service worker caching strategies, offline support, install prompts, and Lighthouse PWA auditing."
pubDate: 2026-08-16
author: "TechPulse Team"
image: "/how-to-make-website-pwa-2026.jpg"
imageAlt: "Smartphone displaying a PWA install prompt with a progressive web app loading on the home screen"
tags:
  - PWA
  - Service Worker
  - Web Development
  - Performance
  - Mobile
  - JavaScript
---

Progressive Web Apps (PWAs) bridge the gap between websites and native applications. A PWA can be installed on a user's home screen, work offline, send push notifications, and access device hardware — all while remaining a website that is discoverable by search engines and linkable like any other web page. In 2026, PWAs are supported by all major browsers and operating systems, including iOS Safari, which has historically been the slowest to adopt PWA features.

This guide walks you through every step of turning an existing website into a fully functional PWA. We cover the web app manifest, service worker registration, caching strategies, the install experience, and how to audit your PWA with Google Lighthouse. By the end, your site will be installable, offline-capable, and scoring 100/100 on the Lighthouse PWA checklist.

## What Makes a PWA?

A website becomes a Progressive Web App when it meets three core requirements:

1. **Served over HTTPS** — Service workers require a secure origin. Most hosting platforms provide free HTTPS (GitHub Pages, Vercel, Netlify, Cloudflare Pages).
2. **Has a Web App Manifest** — A JSON file (`manifest.json`) that declares your app's name, icons, theme color, and display mode. This is what enables the "Add to Home Screen" prompt.
3. **Registers a Service Worker** — A JavaScript file that runs in the background, intercepting network requests and managing a cache of your site's assets for offline access.

Beyond these three requirements, a high-quality PWA also implements:

- **Responsive design** that works on mobile and desktop
- **Fast load times** (LCP under 2.5 seconds)
- **Page transitions** that feel native
- **Offline fallback page** for when the network is unavailable
- **Push notifications** (optional, for re-engagement)

## Step 1: Create the Web App Manifest

The manifest is a simple JSON file placed in your site's root (or any directory, referenced by a `<link>` tag). Here is a production-ready example:

```json
{
  "name": "TechPulse — Modern Web Development Guides",
  "short_name": "TechPulse",
  "description": "Practical guides and tutorials for web developers.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

**Key fields explained:**

- `name` and `short_name`: The full name is shown on the install prompt and splash screen. The short name is shown under the home screen icon (max 12 characters).
- `start_url`: The URL that opens when the user taps the home screen icon. Use `/` for the homepage.
- `display`: `"standalone"` hides the browser chrome (address bar, tabs) for an app-like experience. Other options: `"browser"`, `"minimal-ui"`, `"fullscreen"`.
- `theme_color`: Sets the color of the browser toolbar on Android and the status bar on iOS.
- `background_color`: The background shown on the splash screen while the app loads.
- `icons`: You need at least a 192x192 and 512x512 icon. Include `"purpose": "maskable"` variants for platforms that crop icons into shapes.

Link the manifest from your HTML `<head>`:

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#4f46e5" />
```

## Step 2: Generate PWA Icons

Your PWA needs icons in multiple sizes. The minimum requirement is 192x192 and 512x512 pixels. For the best experience across all platforms, provide both standard and maskable variants.

You can generate icons from an SVG source using tools like:

- **[Maskable.app Editor](https://maskable.app/editor)** — Upload your icon and preview how it looks when cropped into different shapes (circle, squircle, rounded rectangle). Export maskable-safe versions.
- **[RealFaviconGenerator](https://realfavicongenerator.net)** — Generates all icon sizes plus the favicon, Apple Touch Icon, and `site.webmanifest`.
- **Pillow (Python)** — Automate icon generation in your build pipeline.

For maskable icons, keep all important visual elements within the "safe zone" — the central 80% of the icon. Anything outside this area may be cropped on some devices.

## Step 3: Add Apple-Specific Meta Tags

iOS Safari uses Apple-specific meta tags instead of (or in addition to) the web manifest. Add these to your `<head>` for full iOS support:

```html
<link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="TechPulse" />
```

Without `apple-mobile-web-app-capable`, your PWA will open in Safari with the full browser chrome on iOS, defeating the standalone experience.

## Step 4: Create the Service Worker

The service worker is the engine that makes offline access possible. It is a JavaScript file that runs independently of your web page, intercepting every network request your site makes and deciding whether to serve a cached response or fetch from the network.

There are three main caching strategies used in PWAs:

**Cache-First:** Check the cache first. If the asset is cached, serve it immediately. If not, fetch from the network and cache the response. Best for static assets that rarely change: JS bundles, CSS, fonts, images.

**Network-First:** Try the network first. If it succeeds, cache the response and serve it. If the network fails, serve the cached version. Best for HTML pages and API responses where you want the freshest content but still support offline.

**Stale-While-Revalidate:** Serve from cache immediately (fast), then fetch from the network in the background and update the cache for the next request. Best for resources where speed matters more than freshness.

Here is a production service worker that combines Cache-First for assets and Network-First for pages:

```javascript
const CACHE_NAME = 'myapp-v1';
const STATIC_EXTENSIONS = /\.(js|css|png|jpg|svg|woff2?)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(['/', '/blog/'])
    )
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (STATIC_EXTENSIONS.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
  } else {
    event.respondWith(networkFirst(event.request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    return caches.match(request) || caches.match('/');
  }
}
```

## Step 5: Register the Service Worker

Add a registration script to your main HTML file. The registration should happen after the page loads to avoid blocking the initial render:

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (reg) => {
        console.log('SW registered:', reg.scope);
      },
      (err) => console.warn('SW registration failed:', err)
    );
  });
}
```

## Step 6: Handle the Install Prompt

Browsers automatically show an install prompt when they detect a valid manifest and service worker. You can also capture the `beforeinstallprompt` event to show a custom install button:

```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show your custom install button here
});

// When the user clicks your install button:
async function installApp() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const result = await deferredPrompt.userChoice;
  deferredPrompt = null;
}
```

## Step 7: Cache Busting

When you deploy new content, you need to update the service worker so users get the fresh version. The simplest approach is to version your cache name: change `CACHE_NAME` from `'myapp-v1'` to `'myapp-v2'` in your service worker file. The `activate` event will delete the old cache and the new one will be populated on the next page load.

For automated cache busting, you can inject a build hash into the service worker during your CI/CD pipeline.

## Auditing Your PWA with Lighthouse

Run Google Lighthouse (built into Chrome DevTools) and check the PWA section. A perfect PWA score requires:

1. Page loads with HTTPS
2. Service worker registered and active
3. Web app manifest with required fields
4. Icons in correct sizes (192px and 512px minimum)
5. Splash screen configured (via manifest)
6. Theme color set
7. Viewport meta tag present
11. Content works offline

PWAs in 2026 are no longer a nice-to-have — they are an expectation. Users increasingly expect websites to work offline, load instantly, and feel like native apps. The good news is that converting an existing site into a PWA is straightforward, requires no framework changes, and can be done incrementally. Start with the manifest and service worker, then layer on push notifications and background sync as your needs grow.
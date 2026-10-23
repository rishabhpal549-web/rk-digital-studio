/**
 * RK DIGITAL STUDIO - Progressive Web App Service Worker
 * Fast, resilient offline caching & network-first strategy for website & Android App
 */

const CACHE_NAME = 'rk-studio-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/supabase-config.js',
  '/js/supabase-client.js',
  '/site.webmanifest',
  '/assets/logo.svg',
  '/assets/founder.jpg?v=2',
  '/assets/favicon-192x192.png',
  '/assets/favicon-512x512.png',
  '/favicon.ico'
];

// Install: Cache critical static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
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

// Fetch: Network-first for fresh updates, fallback to cache for speed & offline
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // Skip external APIs like FormSubmit, Supabase, Google Maps from static cache
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    return;
  }

  // Network first strategy
  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(req).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (req.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Network offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});

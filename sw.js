const CACHE_NAME = 'broadcastic-v8';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/icon.png',
  '/manifest.json',
  '/header.webp',
  '/card1.webp',
  '/card2.webp',
  '/card3.webp',
  '/card4.webp',
  '/midder.webp',
  '/footer-bg.webp',
  '/footer-bg-mobile.webp',
  '/footer.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

function cacheFirst(request, { fallbackToIndex = false } = {}) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;

    return fetch(request).then((response) => {
      if (response.ok) {
        caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      }
      return response;
    }).catch(() => (fallbackToIndex ? caches.match('/index.html') : undefined));
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('unpkg.com')
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request, { fallbackToIndex: true }));
  }
});

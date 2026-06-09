const CACHE_NAME = 'broadcastic-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/header.jpg',
  '/card1.png',
  '/card2.png',
  '/card3.png',
  '/card4.png',
  '/midder.jpg',
  '/footer_logo.jpg',
  '/instagram.svg',
  '/telegram.svg',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

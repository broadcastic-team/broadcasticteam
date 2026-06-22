const CACHE_NAME = 'broadcastic-v7';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/manifest.json',
  '/header.jpg',
  '/card1.png',
  '/card2.png',
  '/card3.png',
  '/card4.png',
  '/midder.jpg',
  '/footer-bg.jpg',
  '/footer-bg-mobile.jpg',
  '/footer.jpg',
];

// ─── نصب: کش کردن فایل‌های اصلی ───
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ─── فعال‌سازی: حذف کش‌های قدیمی ───
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── استراتژی مشترک: cache-first با fallback به network ───
function cacheFirst(request, { fallbackToIndex = false } = {}) {
  return caches.match(request).then(cached => {
    if (cached) return cached;
    return fetch(request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
      }
      return res;
    }).catch(() => {
      if (fallbackToIndex) return caches.match('/index.html');
    });
  });
}

// ─── fetch ───
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // فونت‌ها و CDN: cache-first
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('unpkg.com')
  ) {
    e.respondWith(cacheFirst(e.request));
    return;
  }

  // فایل‌های همین دامنه: cache-first با fallback به network
  if (url.origin === self.location.origin) {
    e.respondWith(cacheFirst(e.request, { fallbackToIndex: true }));
  }
});

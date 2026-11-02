// ART AI Progressive Web App Service Worker (Bulletproof Auto-Update Strategy)
const CACHE_VERSION = 'art-ai-smas-v3.0.0';
const STATIC_ASSETS = [
  '/',
  '/teacher.jpg',
  '/teacher_female.jpg',
  '/manifest.json'
];

// Install: Cache essential core shell & skip waiting
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache non-fatal error:', err);
      });
    })
  );
});

// Activate: Purge ALL obsolete caches & claim clients immediately
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_VERSION) {
            console.log('Purging obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Listen for SKIP_WAITING from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: NEVER block, hijack or break dynamic Vite modules!
// All scripts, styles and assets are fetched directly from network.
// Only fallback to cached root if completely offline on navigation.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Bypass dynamic API routes
  if (url.pathname.startsWith('/api/')) return;

  // For HTML navigation: Network-first with offline fallback
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(e.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  // All other assets: Let browser fetch natively
  return;
});

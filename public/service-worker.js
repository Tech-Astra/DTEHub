const CACHE_NAME = 'dtehub-cache-v3'; // Bumped for reliability
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/Logo.jpeg',
  '/favicon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Become the active service worker for all open clients
      // Clean up ALL old caches to ensure fresh state
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('DTEHub Cache: Cleaning up stale cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // Navigation requests: Fetch from network always to avoid stale HTML/Assets mismatch.
  // We do NOT cache the root index page to prevent MIME errors on redeploy.
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => {
      // In case of completely offline, we can't do much without a cached index,
      // but that's better than a broken white screen from a stale cache.
      return caches.match('/index.html');
    }));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

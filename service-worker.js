const CACHE_NAME = 'blending-cache-v1.1';
const OFFLINE_URL = '/blending.html';
const URLS_TO_CACHE = [
  OFFLINE_URL,
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install and cache assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

// Activate and clean old caches
self.addEventListener('activate', event => {
  clients.claim();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch handler
self.addEventListener('fetch', event => {
  // Handle navigations (e.g., home screen launch or address bar visit)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // For other requests (e.g., images, icons, styles)
  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request)
          .then(response => {
            if (
              response.status === 200 &&
              response.type === 'basic'
            ) {
              const cloned = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, cloned);
              });
            }
            return response;
          })
          .catch(() => {
            // Optional: fallback for images/scripts/etc.
          })
      );
    })
  );
});

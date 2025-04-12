const CACHE_NAME = 'blending-cache-v1'; // Increment this when you change files
const URLS_TO_CACHE = [
  '/blending.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other static assets as needed
];

// Install event: cache core files
self.addEventListener('install', event => {
  self.skipWaiting(); // Activate new SW immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Activate event: remove old caches
self.addEventListener('activate', event => {
  clients.claim(); // Take control of uncontrolled clients
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      )
    )
  );
});

// Fetch event: handle navigation + static assets
self.addEventListener('fetch', event => {
  // Handle navigation requests (e.g. clicking app icon or page refresh)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => response)
        .catch(() => caches.match('/blending.html'))
    );
    return;
  }

  // Handle static asset requests
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          // Only cache valid responses
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse); // Fallback to cache if fetch fails

      // Return cached version if available, else wait for network
      return cachedResponse || fetchPromise;
    })
  );
});

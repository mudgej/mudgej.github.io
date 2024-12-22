self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('nitrox-cache').then(function(cache) {
      return cache.addAll([
        '/',
        '/blending-new.html',
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
        // Add any other files that should be cached
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      return cachedResponse || fetch(event.request);
    })
  );
});


// Service Worker for iShareHow Labs Ventures PWA
const CACHE_NAME = 'isharehow-labs-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  // Icons are optional - cache them if they exist
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache each URL individually to handle missing files gracefully
        return Promise.allSettled(
          urlsToCache.map((url) => 
            fetch(url)
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch(() => {
                // Silently skip files that don't exist
                console.log(`Skipping cache for ${url} (file not found)`);
              })
          )
        );
      })
      .then(() => {
        // Always skip waiting, even if some files failed
        self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker install error:', error);
        // Still skip waiting on error
        self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // If both cache and network fail, return offline page if available
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});


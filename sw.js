const CACHE_NAME = 'islamic-wisdom-cache-v1';
// Caching the essential app shell files for offline functionality.
// Using relative paths to ensure they resolve correctly.
const APP_SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(error => {
        console.error('Failed to cache app shell:', error);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Use a cache-first strategy for navigation requests for fast loading.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
    return;
  }

  // Use a cache-first strategy for other requests.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          networkResponse => {
            // Do not cache API calls or media from external services.
            if (
              event.request.url.includes('generativelanguage.googleapis.com') || 
              event.request.url.includes('supabase.co') ||
              event.request.url.includes('pexels.com') ||
              event.request.url.includes('vimeo.com')
            ) {
                return networkResponse;
            }
            
            // For other requests, clone the response, cache it, and return it.
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                // Do not cache opaque responses (e.g., from no-cors requests)
                if (responseToCache.type !== 'opaque') {
                  cache.put(event.request, responseToCache);
                }
              });
            return networkResponse;
          }
        );
      })
  );
});
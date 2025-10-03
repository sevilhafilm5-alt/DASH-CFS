const CACHE_NAME = 'cosmeticos-dashboard-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
];

// Install event: cache the app shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: serve from cache, fall back to network, and cache new requests
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For requests to external origins (like esm.sh), use a network-first strategy
  if (!event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request)
        .then(response => {
          // Cache hit - return response. Then, fetch from network to update cache.
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse) {
                cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          
          return response || fetchPromise;
        });
    })
  );
});


// Push event: handle push notifications from a server (placeholder for future use)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Cosméticos Full Service';
  const options = {
    body: data.body || 'Você tem uma nova notificação.',
    icon: data.icon || 'https://i.ibb.co/mRpB2Bw/cosmeticos-logo.png',
    badge: 'https://i.ibb.co/mRpB2Bw/cosmeticos-logo.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event: focus or open the app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});

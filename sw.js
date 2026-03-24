const CACHE_NAME = 'flood-training-v1.0.19';
const ASSETS = [
  './',
  './index.html?v=19',
  './manifest.json?v=19',
  './icon-128.png?v=19',
  './icon-192.png?v=19',
  './icon-512.png?v=19',
  './apple-touch-icon.png?v=19',
  './ch1.mp3',
  './ch2.mp3',
  './ch3.mp3',
  './ch4.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => cached);
    })
  );
});
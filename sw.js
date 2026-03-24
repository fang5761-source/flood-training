const CACHE_NAME = 'flood-training-v1.0.20';
const ASSETS = [
  './',
  './index.html?v=20',
  './manifest.json?v=20',
  './icon-128.png?v=20',
  './icon-192.png?v=20',
  './icon-512.png?v=20',
  './apple-touch-icon.png?v=20',
  './ch1.mp3',
  './ch2.mp3',
  './ch3.mp3',
  './ch4.mp3'
];

// 安裝時強制寫入新快取
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('🛡️ 正在部署新一代快取資源');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活時徹底清除舊快取，不留任何痕跡
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('🗑️ 正在銷毀舊版快取資料:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// 請求拦截：優先從快取讀取，確保穩定性
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
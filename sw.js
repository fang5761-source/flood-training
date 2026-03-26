const CACHE_NAME = 'flood-training-v1.0.28';
const ASSETS = [
  './',
  './index.html?v=28',
  './manifest.json?v=28',
  './icon-128.png?v=28',
  './icon-192.png?v=28',
  './icon-512.png?v=28',
  './apple-touch-icon.png?v=28',
  './ch1.mp3',
  './ch2.mp3',
  './ch3.mp3',
  './ch4.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('🛡️ 部署 v28 網路優先防卡死資源');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // 殺手鐧：針對網頁主體 (HTML)，永遠優先向伺服器要最新版 (Network First)
  if (event.request.mode === 'navigate') {
      event.respondWith(
          fetch(event.request).catch(() => caches.match(event.request))
      );
      return;
  }

  // 其他資源 (音檔、圖片) 使用快取優先，但背景默默更新
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
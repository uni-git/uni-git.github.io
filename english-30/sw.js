const CACHE_NAME = 'english30-v5';
const ASSETS = [
  './',
  './index.html',
  './data.js',
  './sync.js',
  './sync-config.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for pages/scripts/manifest so deploys show up immediately;
// cache-first for icons; always fall back to cache when offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // 서버(Firestore) 요청 등 다른 도메인은 건드리지 않음
  if (new URL(e.request.url).origin !== self.location.origin) return;
  const url = e.request.url;
  const isCode = e.request.mode === 'navigate' || /\.(html|js|json)(\?|$)/.test(url);

  if (isCode) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});

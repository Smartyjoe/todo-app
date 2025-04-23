const CACHE_NAME = 'todo-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './sw-register.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
});

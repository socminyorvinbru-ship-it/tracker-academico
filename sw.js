// Service Worker — Tracker Académico
// Permite uso offline y comportamiento de app nativa

const CACHE_NAME = 'tracker-v2';
const ASSETS = [
  './index.html',
  './manifest.json'
];

// Instalar y cachear archivos principales
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Limpiar caches viejos al activar
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Responder con cache si no hay red (offline first)
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        // Cachear solo recursos del mismo origen
        if (event.request.url.startsWith(self.location.origin)) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      }).catch(function() {
        // Si falla la red y no hay cache, devolver index.html
        return caches.match('./index.html');
      });
    })
  );
});

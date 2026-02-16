// ================================================================
//  SERVICE WORKER — Paga a Conta Aí (PWA Offline)
// ================================================================

const CACHE_NAME = 'paga-a-conta-v1.1.0';

// Todos os arquivos que devem ser cacheados para uso offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './scripts/script.js',
  './manifest.json',
  './musics/suspense.mp3',
  './musics/resultado.mp3',
  './css/all.min.css',
  './webfonts/fa-solid-900.woff2',
  './webfonts/fa-solid-900.ttf',
  './webfonts/fa-regular-400.woff2',
  './webfonts/fa-regular-400.ttf',
  './webfonts/fa-brands-400.woff2',
  './webfonts/fa-brands-400.ttf',
  './webfonts/fa-v4compatibility.woff2',
  './webfonts/fa-v4compatibility.ttf',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Instalar — cachear todos os assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando todos os assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Ativar imediatamente sem esperar abas antigas fecharem
  self.skipWaiting();
});

// Ativar — limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Removendo cache antigo:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Assumir controle de todas as abas abertas
  self.clients.claim();
});

// Fetch — servir do cache primeiro, fallback para rede
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      // Se não está no cache, buscar na rede e cachear
      return fetch(event.request).then((networkResponse) => {
        // Só cachear respostas válidas e do mesmo domínio
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Se falhar (offline) e for navegação, retornar index.html do cache
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

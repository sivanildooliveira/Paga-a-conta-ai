// ================================================================
//  SERVICE WORKER — Paga a Conta Aí (PWA Offline)
// ================================================================
//  ⚠️ IMPORTANTE: Ao atualizar qualquer arquivo da aplicação,
//     incremente a versão abaixo para forçar atualização no PWA.
// ================================================================

const CACHE_VERSION = 'v1.0001';  // ← INCREMENTE a cada deploy
const CACHE_NAME = `paga-a-conta-${CACHE_VERSION}`;

// Todos os arquivos que devem ser cacheados para uso offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './sobre.html',
  './politica-privacidade.html',
  './css/style.css',
  './scripts/script.js',
  './manifest.json',
  './musics/suspense.mp3',
  './musics/resultado.mp3',
  './css/all.min.css',
  './webfonts/fa-solid-900.woff2',
  './webfonts/fa-regular-400.woff2',
  './webfonts/fa-brands-400.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Arquivos que mudam frequentemente (HTML, CSS, JS)
// Esses usam estratégia "network first" para buscar atualizações
const DYNAMIC_ASSETS = [
  'index.html',
  'sobre.html',
  'politica-privacidade.html',
  'style.css',
  'script.js'
];

// Verifica se o request é de um arquivo que muda frequentemente
function isDynamicAsset(url) {
  return DYNAMIC_ASSETS.some(asset => url.includes(asset));
}

// Instalar — cachear todos os assets
self.addEventListener('install', (event) => {
  console.log(`[SW] Instalando ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando todos os assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Ativar imediatamente sem esperar abas antigas fecharem
  self.skipWaiting();
});

// Ativar — limpar TODOS os caches antigos
self.addEventListener('activate', (event) => {
  console.log(`[SW] Ativando ${CACHE_VERSION}...`);
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
  // Assumir controle de todas as abas abertas imediatamente
  self.clients.claim();
});

// Fetch — Estratégia mista:
//   - Arquivos dinâmicos (HTML/CSS/JS): Network First (busca na rede, fallback cache)
//   - Arquivos estáticos (fontes/imagens/áudio): Cache First (rápido, fallback rede)
self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  if (isDynamicAsset(requestUrl)) {
    // NETWORK FIRST — sempre tenta buscar a versão mais recente
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Atualiza o cache com a versão nova
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline — serve do cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Fallback para index.html em navegação
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
        })
    );
  } else {
    // CACHE FIRST — para assets estáticos (fontes, ícones, áudio)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
    );
  }
});

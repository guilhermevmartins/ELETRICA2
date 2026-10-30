const CACHE_PREFIX = 'senai-falstad-' + self.registration.scope + '-';
const CACHE_NAME = CACHE_PREFIX + 'v2';
const urlsToCache = [
  './about.html',
  './canvas2svg.js',
  './circuitjs.html',
  './crystal.html',
  './customfunction.html',
  './customlogic.html',
  './customtransformer.html',
  './diodecalc.html',
  './icon512.png',
  './icon128.png',
  './iframe.html',
  './lz-string.min.js',
  './manifest.json',
  './mexle.html',
  './mosfet-beta.html',
  './opampreal.html',
  './split.js',
  './subcircuits.html',
  // put everything else here
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Prefere atualizações do servidor; usa apenas o cache deste simulador offline.
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (event.request.method !== 'GET' || !url.href.startsWith(self.registration.scope)
        || url.pathname.endsWith('.php')) return;
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
            const response = await fetch(event.request);
            if (response.ok) {
                try { await cache.put(event.request, response.clone()); } catch {}
            }
            return response;
        } catch (error) {
            const saved = await cache.match(event.request);
            if (saved) return saved;
            throw error;
        }
    })());
});

// Activate event: cleans up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];  // List of cache versions you want to keep

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName.startsWith(CACHE_PREFIX) && !cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);  // Delete old caches that aren't in whitelist
                    }
                })
            );
        })
    );
});


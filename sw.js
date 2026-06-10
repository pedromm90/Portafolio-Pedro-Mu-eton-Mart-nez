/**
 * Service Worker: Intercepta recargas (F5) en las subrutas
 * Devuelve a index.html si la ruta no existe físicamente.
 */

const CACHE_NAME = "vanilla_router-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/router.js",
  "/style.css",
  "/pages/inicio.html",
  "/pages/egresados-intep.html",
];

// Instala y almacena en caché los recursos estáticos iniciales
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        // Fuerza al Service Worker en espera a convertirse en el activo
        return self.skipWaiting();
      }),
  );
});

// Activa el Service Worker y limpia cachés antíguas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cachesName) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          }),
        );
      })
      .then(() => {
        // Reclama el control de los clientes inmediatamente
        return self.clients.claim();
      }),
  );
});

// Intercepta peticiones de red
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Solo interceptar peticiones de navegación de páginas (al recargar las sub-rutas)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then((response) => {
        // Si el servidor devuelve 404 (ej. la ruta física no existe), y retorna index.html
        if (response.status === 404) {
          return caches.match("/index.html") || fetch("/index.html");
        }
        return response;
      })
        .catch(() => {
          // Si no hay red, se sirve index.html como fallback
          return caches.match('/index.html');
      })
    );
  } else {
    // Para el resto de peticiones (CSS, JS, imágenes), intentar red y caer en caché
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Devuelve el recurso en caché, pero se actualiza en segundo plano (stale-while-revalidate)
          fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {/* Ignorar errores de red en segundo plano */ });

          return cachedResponse;
        }
        return fetch(request);
      })
    );
  }
});

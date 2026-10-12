// versión: 90d75c6ee175
// Service worker: guarda la app en el móvil para que abra sin conexión y rápido.
// La lista de archivos y la versión salen de sw-lista.js (npm run precache).
//   - Al instalar se guarda la app (código, estilos, iconos); los datos (exámenes, carta, cursos) se guardan
//     después, al activarse, sin bloquear.
//   - Se sirve primero lo guardado; lo que falte se pide a la red y se guarda.
//   - Una versión nueva espera a que el alumno pulse «Actualizar» (nunca cambia a mitad de un examen).
//   - El aviso diario (docs/AVISOS.md): el servidor manda un mensaje mínimo; el texto, el icono y la etiqueta (para que
//     no se apilen) están aquí. Al tocarlo se abre la app en Hoy.
importScripts('sw-lista.js');

const APP = `app-${self.VERSION}`;
const DATOS = `datos-${self.VERSION}`;
const ruta = (url) => (url.startsWith(self.registration.scope) ? url.slice(self.registration.scope.length).split(/[?#]/)[0] : null);
const cacheDe = (r) => (r.startsWith('data/') ? DATOS : APP);

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(APP).then((c) => c.addAll(self.APP.map((u) => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('message', (e) => {
  if (e.data === 'actualizar') self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    await self.clients.claim();
    // Datos: los que no estén ya se piden ahora. Si falla la red, se queda con lo que hubiera y lo intenta al usarlos.
    const c = await caches.open(DATOS);
    for (const u of self.DATOS) {
      if (await c.match(u)) continue;
      try {
        const r = await fetch(new Request(u, { cache: 'reload' }));
        if (r.ok) await c.put(u, r);
      } catch { /* sin red: ya se guardará al usarlo */ }
    }
    // Solo cuando los datos nuevos están (o se ha intentado), se borran las versiones anteriores.
    for (const k of await caches.keys()) if (k !== APP && k !== DATOS) await caches.delete(k);
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const r = ruta(req.url);
  if (r == null) return; // otro origen o fuera de la app: lo gestiona el navegador
  if (r.startsWith('podcast/')) return; // audio de los podcasts: lo pide el navegador (por trozos, al saltar), sin guardarlo
  if (req.mode === 'navigate' && (r === '' || r === 'index.html')) {
    e.respondWith(responder(new Request('index.html'), 'index.html'));
    return;
  }
  e.respondWith(responder(req, r));
});

async function responder(req, r) {
  const actual = await caches.open(cacheDe(r));
  const guardada = await actual.match(req, { ignoreSearch: true });
  if (guardada) return guardada;
  try {
    const red = await fetch(req);
    if (red.ok && red.type === 'basic') actual.put(req, red.clone());
    return red;
  } catch (err) {
    // Sin red y sin copia en la versión actual: cualquier copia anterior antes que nada.
    const vieja = await caches.match(req, { ignoreSearch: true });
    if (vieja) return vieja;
    throw err;
  }
}

self.addEventListener('push', (e) => {
  e.waitUntil(self.registration.showNotification('Patrón', {
    body: 'Hoy toca un repaso de 10 minutos.',
    icon: 'icons/icono-192.png',
    badge: 'icons/icono-192.png',
    tag: 'recordatorio-diario', // el de hoy sustituye al de ayer si sigue ahí: nunca se apilan
    lang: 'es',
    data: { url: './#/' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL('./#/', self.registration.scope).href;
  e.waitUntil((async () => {
    const abiertas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const app = abiertas.find((c) => c.url.startsWith(self.registration.scope));
    if (app) {
      await app.focus();
      if (app.url !== url && 'navigate' in app) await app.navigate(url).catch(() => {});
      return;
    }
    await self.clients.openWindow(url);
  })());
});

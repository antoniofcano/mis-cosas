// App instalable y sin conexión: registra el service worker (sw.js), avisa cuando hay una versión nueva y guarda
// la invitación a instalar de Android para el botón de Más.
// En localhost no se registra (al desarrollar se quiere ver siempre lo último), salvo con ?sw en la dirección.

import { h } from './dom.js';

let invitacion = null; // evento beforeinstallprompt (Chrome/Android)
const oyentes = new Set();

/** ¿Se puede ofrecer el botón «Instalar»? (Android/Chrome, y si no está ya instalada). */
export const puedeInstalar = () => !!invitacion;
/** Avisa cuando cambia `puedeInstalar()`. Devuelve la función para dejar de escuchar. */
export function alCambiarInstalable(fn) { oyentes.add(fn); return () => oyentes.delete(fn); }
const notificar = () => { for (const fn of oyentes) fn(puedeInstalar()); };

export async function instalar() {
  if (!invitacion) return false;
  const ev = invitacion;
  invitacion = null;
  notificar();
  ev.prompt();
  const { outcome } = await ev.userChoice;
  return outcome === 'accepted';
}

function avisoVersion(onActualizar) {
  if (document.querySelector('.aviso-version')) return;
  const aviso = h('div.aviso-version', { role: 'status' },
    h('p', 'Hay una versión nueva de la app.'),
    h('button', { type: 'button', onclick: () => { aviso.querySelector('button').disabled = true; onActualizar(); } }, 'Actualizar'),
    h('button.secondary', { type: 'button', onclick: () => aviso.remove() }, 'Luego'));
  document.body.append(aviso);
}

/**
 * @param {{ puedeActualizarSolo?: () => boolean }} o  si devuelve true (p. ej. no hay un examen a medias), una
 *   versión nueva encontrada al abrir la app se aplica sola: recargar basta para tener lo último.
 */
export function iniciarPwa({ puedeActualizarSolo = () => false } = {}) {
  // «Al abrir» cuenta también volver a la app desde otra (en el iPhone no se recarga): ahí también se actualiza sola.
  let inicio = Date.now();
  window.addEventListener('beforeinstallprompt', (ev) => { ev.preventDefault(); invitacion = ev; notificar(); });
  window.addEventListener('appinstalled', () => { invitacion = null; notificar(); });

  if (!('serviceWorker' in navigator)) return;
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (local && !new URLSearchParams(location.search).has('sw')) return;

  let pedida = false; // solo se recarga si el alumno ha pulsado «Actualizar»
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (pedida) location.reload(); });
  // updateViaCache 'none': el navegador mira si hay versión nueva sin fiarse de su caché (también la de sw-lista.js).
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
    const aplicar = (w) => { pedida = true; w.postMessage('actualizar'); };
    // Al abrir (primeros segundos) y sin nada a medias se actualiza sola; si no, se pregunta.
    // Un minuto de margen: en el móvil, descargar la versión nueva puede tardar.
    const ofrecer = (w) => (Date.now() - inicio < 60000 && puedeActualizarSolo() ? aplicar(w) : avisoVersion(() => aplicar(w)));
    if (reg.waiting && navigator.serviceWorker.controller) ofrecer(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) ofrecer(w); });
    });
    reg.update().catch(() => {});
    // Al volver a la app (estaba en segundo plano), mira si hay versión nueva.
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { inicio = Date.now(); if (reg.waiting && navigator.serviceWorker.controller) ofrecer(reg.waiting); else reg.update().catch(() => {}); } });
  }).catch((e) => console.warn('Sin modo sin conexión:', e.message));
}

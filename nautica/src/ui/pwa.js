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

export function iniciarPwa() {
  window.addEventListener('beforeinstallprompt', (ev) => { ev.preventDefault(); invitacion = ev; notificar(); });
  window.addEventListener('appinstalled', () => { invitacion = null; notificar(); });

  if (!('serviceWorker' in navigator)) return;
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (local && !new URLSearchParams(location.search).has('sw')) return;

  let pedida = false; // solo se recarga si el alumno ha pulsado «Actualizar»
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (pedida) location.reload(); });
  navigator.serviceWorker.register('sw.js').then((reg) => {
    const ofrecer = (w) => avisoVersion(() => { pedida = true; w.postMessage('actualizar'); });
    if (reg.waiting && navigator.serviceWorker.controller) ofrecer(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) ofrecer(w); });
    });
    // Al volver a la app (estaba en segundo plano), mira si hay versión nueva.
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
  }).catch((e) => console.warn('Sin modo sin conexión:', e.message));
}

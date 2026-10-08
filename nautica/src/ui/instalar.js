// Instalar la app: en Android/Chrome el navegador ofrece un aviso propio (`beforeinstallprompt`) que se guarda para
// lanzarlo cuando el alumno quiera; en iPhone no existe y se explica en tres pasos. Una tarjeta discreta en Hoy
// (tras unos días de uso y descartable) y una fila fija en Más. Funciones puras de estado + capa fina de DOM.

import { h } from './dom.js';
import { conIcono } from './iconos.js';
import { estaInstalada, esIOS } from '../store/persistencia.js';

const DIA = 864e5;
/** Días con actividad antes de ofrecer instalar en Hoy (antes, la persona aún está viendo si le sirve). */
export const DIAS_ANTES_DE_OFRECER = 2;
/** Cuánto calla la tarjeta de Hoy tras «Ahora no». */
export const SILENCIO_DIAS = 14;

let evento = null; // el aviso de instalación guardado (Chrome/Edge/Android)
const oyentes = new Set();
const avisa = () => oyentes.forEach((f) => f());

/** Se engancha al principio, antes de que la app termine de arrancar: el evento puede llegar pronto. */
export function escucharInstalacion(win = globalThis) {
  if (typeof win?.addEventListener !== 'function') return;
  win.addEventListener('beforeinstallprompt', (ev) => { ev.preventDefault(); evento = ev; avisa(); });
  win.addEventListener('appinstalled', () => { evento = null; avisa(); });
}

/**
 * ¿Qué se le ofrece al alumno? 'instalada' (nada), 'boton' (Android/Chrome con aviso guardado), 'ios' (guía de pasos),
 * 'menu' (otro navegador: se explica el menú) o 'no' (no se puede).
 */
export function modoInstalacion({ nav = globalThis.navigator, win = globalThis, hayEvento = !!evento } = {}) {
  if (estaInstalada(nav, win)) return 'instalada';
  if (hayEvento) return 'boton';
  if (esIOS(nav)) return 'ios';
  return /Android/.test(nav?.userAgent ?? '') ? 'menu' : 'no';
}

/** ¿Toca enseñar la tarjeta de Hoy? */
export function tocaOfrecer({ modo, diasConActividad = 0, silenciadaHasta = 0, ahora = Date.now() }) {
  return modo !== 'instalada' && modo !== 'no' && diasConActividad >= DIAS_ANTES_DE_OFRECER && ahora >= silenciadaHasta;
}

const PASOS_IOS = [
  'Abre esta página en Safari.',
  'Pulsa el botón Compartir (el cuadrado con la flecha hacia arriba).',
  'Elige «Añadir a pantalla de inicio» y confirma.',
];

/** El contenido de la ayuda según el modo (botón, pasos de iPhone o el menú del navegador). */
export function ayudaInstalar(modo, alInstalar = () => {}) {
  if (modo === 'boton') {
    return h('div.instalar-ayuda',
      h('p.small', 'Se abre desde un icono, sin barra del navegador, y sigue funcionando sin conexión.'),
      h('button', { type: 'button', onclick: async () => {
        const ev = evento;
        if (!ev) return;
        try { await ev.prompt(); await ev.userChoice; } catch { /* cerrado */ }
        evento = null; avisa(); alInstalar();
      } }, conIcono('descargar', 'Instalar la app')));
  }
  if (modo === 'ios') {
    return h('div.instalar-ayuda',
      h('p.small', 'En iPhone se instala desde Safari. Así Safari tampoco borra tus datos si pasan días sin abrirla.'),
      h('ol.pasos-instalar', PASOS_IOS.map((p) => h('li', p))));
  }
  return h('div.instalar-ayuda', h('p.small', 'Abre el menú del navegador y elige «Instalar aplicación» o «Añadir a pantalla de inicio».'));
}

/** Tarjeta de Hoy: discreta, tras unos días de uso, con «Ahora no» que la calla dos semanas. null si no toca. */
export function tarjetaInstalar(progress, ahora = Date.now()) {
  const s = progress.settings();
  const modo = modoInstalacion();
  if (!tocaOfrecer({ modo, diasConActividad: progress.diasConActividadDesde(0), silenciadaHasta: s.avisoInstalarHasta ?? 0, ahora })) return null;
  const el = h('section.aviso-instalar', { 'aria-label': 'Instalar la app' },
    h('div.aviso-instalar-cab', conIcono('descargar', h('strong', 'Ten la app a un toque')),
      h('button.small.secondary', { type: 'button', onclick: () => { progress.setSetting('avisoInstalarHasta', Date.now() + SILENCIO_DIAS * DIA); el.remove(); } }, 'Ahora no')),
    ayudaInstalar(modo, () => el.remove()));
  const quita = () => { if (modoInstalacion() === 'instalada') { oyentes.delete(quita); el.remove(); } };
  oyentes.add(quita);
  return el;
}

/** Fila de Más: siempre disponible mientras no esté instalada. null si ya lo está o no se puede. */
export function filaInstalar() {
  const modo = modoInstalacion();
  if (modo === 'instalada' || modo === 'no') return null;
  return h('details.mas-instalar', h('summary', conIcono('descargar', 'Instalar la app')), ayudaInstalar(modo));
}

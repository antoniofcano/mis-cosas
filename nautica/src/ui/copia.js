// Copia de seguridad del progreso: guardar (descargar JSON), recuperar y el recordatorio de Hoy. Con la sincronización
// sana (docs/SYNC.md: con código y sincronizada hace menos de 3 días) el progreso ya está fuera del aparato y el
// recordatorio no sale; si lleva días sin sincronizar o no está vinculada, vuelve como siempre.

import { h } from './dom.js';
import { diasParaAviso, estadoProteccion } from '../store/persistencia.js';
import { syncSana } from './sync.js';

const DIA = 864e5;

export function descargar(name, text) {
  const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'application/json' })), download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Descarga la copia y recuerda cuándo se hizo. */
export function guardarCopia(progress) {
  descargar(`progreso-patron-${new Date().toLocaleDateString('sv-SE')}.json`, progress.export());
  progress.setSetting('ultimaCopia', Date.now());
}

/** Botón «Recuperar una copia» (lee un JSON exportado y recarga). */
export function botonRecuperar(progress, texto = 'Recuperar una copia') {
  const input = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: async () => {
    try { progress.import(await input.files[0].text()); location.reload(); } catch (err) { alert(`No se pudo recuperar la copia: ${err.message}`); }
  } });
  return [h('button.secondary', { type: 'button', onclick: () => input.click() }, texto), input];
}

/**
 * Recordatorio en Hoy: ≥ 7 días con actividad desde la última copia (≥ 4 si el navegador no protege los datos);
 * descartable durante 7 días.
 */
export function avisoCopia(progress, ahora = Date.now(), sana = syncSana(ahora)) {
  if (sana) return null;
  const s = progress.settings();
  if (progress.diasConActividadDesde(s.ultimaCopia) < diasParaAviso(s) || ahora < (s.avisoCopiaHasta ?? 0)) return null;
  const el = h('p.aviso-copia',
    estadoProteccion(s).estado === 'protegido' ? 'Hace tiempo que no guardas una copia de tu progreso. ' : 'Tus datos solo están en este aparato y el navegador podría borrarlos: guarda una copia. ',
    h('button.small', { type: 'button', onclick: () => { guardarCopia(progress); el.remove(); } }, 'Guardar ahora'),
    h('button.small.secondary', { type: 'button', onclick: () => { progress.setSetting('avisoCopiaHasta', Date.now() + 7 * DIA); el.remove(); } }, 'Ahora no'));
  return el;
}

/** Líneas de «Copia de seguridad» (Más y Ajustes): si el navegador protege los datos y qué hacer si no. */
export function lineaProteccion(progress) {
  const e = estadoProteccion(progress.settings());
  return h('p.small.proteccion', { class: e.estado === 'protegido' ? 'ok' : 'aviso' }, e.texto, e.consejo ? ` ${e.consejo}` : null);
}

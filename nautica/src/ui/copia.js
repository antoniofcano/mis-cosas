// Copia de seguridad del progreso: guardar (descargar JSON), recuperar y el recordatorio de Hoy.

import { h } from './dom.js';

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

/** Recordatorio en Hoy: ≥ 7 días con actividad desde la última copia; descartable durante 7 días. */
export function avisoCopia(progress, ahora = Date.now()) {
  const s = progress.settings();
  if (progress.diasConActividadDesde(s.ultimaCopia) < 7 || ahora < (s.avisoCopiaHasta ?? 0)) return null;
  const el = h('p.aviso-copia',
    'Hace tiempo que no guardas una copia de tu progreso. ',
    h('button.small', { type: 'button', onclick: () => { guardarCopia(progress); el.remove(); } }, 'Guardar ahora'),
    h('button.small.secondary', { type: 'button', onclick: () => { progress.setSetting('avisoCopiaHasta', Date.now() + 7 * DIA); el.remove(); } }, 'Ahora no'));
  return el;
}

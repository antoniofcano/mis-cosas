// Interfaz del diagnóstico por tipo de error (R-36) y de «Tus errores más repetidos».
// La lógica está en src/exams/diagnostico.js (sin DOM) y lo guardado, en src/store/errores.js.
// Nunca durante un examen: con un examen en marcha (modoExamen()) no se pinta nada.

import { h } from './dom.js';
import { conIcono } from './iconos.js';
import { modoExamen } from './modo-examen.js';
import { diagnosticar, diagnosticoUtil } from '../exams/diagnostico.js';
import { ERRORES, PASOS, fraseError } from '../exams/taxonomia.js';
import { quantity } from '../analysis/quantities.js';
import { SOLUCIONES } from '../bancos/soluciones.js';
import { erroresAlumno } from '../store/errores.js';
import { cuenta } from '../texto.js';

const valores = (vs) => vs.map((v) => quantity(v.kind).format(v.value)).join(' · ');

/**
 * «Has marcado la b). Es lo que sale si restas la Ct en vez de sumarla.» para una pregunta con resolución programada,
 * o null si no hay diagnóstico seguro (o hay un examen en marcha). Si hay un error único, lo apunta en los errores del
 * alumno (una vez por pregunta y día).
 * @param {object} q  pregunta
 * @param {string} marcada  letra marcada
 * @param {{ chart: object, registrar?: boolean }} o
 */
export function diagnosticoEl(q, marcada, { chart, registrar = true } = {}) {
  if (modoExamen() || !marcada || !chart) return null;
  const sol = SOLUCIONES[q.id];
  if (!sol) return null;
  let d;
  try { d = diagnosticar(q, marcada, { sol, chart }); } catch (e) { console.error(e); return null; }
  if (!diagnosticoUtil(d)) return null;
  if (registrar && d.estado === 'unico') erroresAlumno().error(q.id, d.tipos[0]);
  const conEse = d.tipos.length === 1
    ? `Con ese error sale ${valores(d.valores[d.tipos[0]])}.`
    : d.tipos.map((t) => `Con «${ERRORES[t].nombre.toLowerCase()}» sale ${valores(d.valores[t])}.`).join(' ');
  return h('div.diagnostico-error', { role: 'note' },
    h('p', conIcono('lupa', `Has marcado la ${marcada}). ${fraseError(d.tipos)}`)),
    h('p.small.muted', conEse, d.tipos.length === 1 ? ` Revisa el paso «${PASOS[ERRORES[d.tipos[0]].paso].nombre}».` : ''));
}

/** Texto del diagnóstico para el resumen de IA (o ''). */
export function diagnosticoTexto(q, marcada, chart) {
  const sol = SOLUCIONES[q.id];
  if (!sol || !marcada || !chart || modoExamen()) return '';
  try {
    const d = diagnosticar(q, marcada, { sol, chart });
    return diagnosticoUtil(d) ? `DIAGNÓSTICO opción ${marcada}: ${d.tipos.join(' o ')} (${fraseError(d.tipos)})` : '';
  } catch { return ''; }
}

/**
 * Sección «Tus errores más repetidos» (Mi progreso): errores típicos diagnosticados y pasos del modo guiado que más
 * fallas. null si aún no hay nada apuntado.
 */
export function seccionErrores() {
  const r = erroresAlumno().resumen();
  if (r.vacio || (!r.errores.length && !r.pasos.length)) return null;
  return h('section.prog-sec.errores-repetidos',
    h('h2.eti', 'Tus errores más repetidos'),
    r.peorPaso ? h('p', conIcono('diana', `Fallas sobre todo ${r.peorPaso.al}.`)) : null,
    r.errores.length ? h('ul.errores-lista', r.errores.slice(0, 5).map((e) => h('li',
      h('span.error-nombre', e.nombre), h('span.error-n', cuenta(e.n, 'vez')),
      h('span.error-si.small.muted', `Te pasa cuando ${e.si}.`)))) : null,
    r.pasos.length ? h('p.small.muted', 'Pasos con fallos (modo paso a paso y errores reconocidos): ',
      r.pasos.slice(0, 4).map((p) => `${p.nombre} ${p.fallos}/${p.intentos}`).join(' · '), '.') : null,
    h('p.small.muted', 'Se guarda solo en este aparato.'));
}

/** Línea para el resumen de IA de Mi progreso. */
export function erroresTexto() {
  const r = erroresAlumno().resumen();
  if (r.vacio) return '';
  return `ERRORES REPETIDOS: ${r.errores.map((e) => `${e.id} ×${e.n}`).join(', ') || '—'}${r.peorPaso ? ` · PEOR PASO: ${r.peorPaso.id}` : ''}`;
}

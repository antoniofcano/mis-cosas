// «¿Dónde te examinas?»: elegir el eje (la administración examinadora cuyo banco de preguntas se estudia).
// Solo se ofrecen los ejes publicados; si hay uno solo, no se pregunta nada (ni en la bienvenida ni en Ajustes) y la app
// se ve igual que antes de que hubiera ejes. Cambiar de eje no borra nada: el progreso va por id de pregunta y los ids
// de cada eje son distintos; la fecha del examen sigue siendo la de cada titulación.

import { h } from './dom.js';
import { ejesParaElegir } from '../bancos/index.js';
import { currentEje, setEje } from './titulacion.js';
import { fechaLarga } from '../texto.js';
import { icono, conIcono } from './iconos.js';

/** Ejes que el alumno puede elegir, con su ficha (nombre, ámbito, descripción). [] si hay uno solo: no hay que elegir. */
export const ejesElegibles = () => ejesParaElegir();

/** Texto de dónde examina un eje: «Comunidad de Madrid, Castilla y León y Aragón». */
export function ambitoTexto(ficha) {
  const a = ficha?.ambito ?? [];
  return a.length > 1 ? `${a.slice(0, -1).join(', ')} y ${a.at(-1)}` : (a[0] ?? '');
}

/**
 * Botones grandes, uno por eje elegible (el actual marcado, salvo `marcar: false`). `alElegir(id)` tras guardarlo en los ajustes.
 * @param {{ id: string, nombre: string, ficha: object }[]} ejes
 */
export function selectorEje(progress, ejes, alElegir, { marcar = true } = {}) {
  const actual = marcar ? currentEje(progress) : null;
  return h('div.opciones-grandes.selector-eje', { role: 'group', 'aria-label': 'Dónde te examinas' },
    ejes.map((e) => h('button.tarjeta-opcion', {
      type: 'button', 'aria-pressed': String(e.id === actual), class: e.id === actual ? 'activo' : '',
      onclick: () => { setEje(progress, e.id); alElegir?.(e.id); },
    },
    h('span.op-icono', icono('lugar')),
    h('span.op-texto', h('strong', e.nombre), ambitoTexto(e.ficha) && ambitoTexto(e.ficha) !== e.nombre ? h('span.op-detalle', ambitoTexto(e.ficha)) : null))));
}

/** Indicador discreto del eje que se estudia («Exámenes de Madrid (Marina Mercante)», con el icono de lugar), con enlace a Ajustes. Null si no hay que elegir. */
export function indicadorEje(progress, ejes) {
  if (!ejes?.length) return null;
  const e = ejes.find((x) => x.id === currentEje(progress)) ?? ejes[0];
  return h('a.indicador-eje', { href: '#/ajustes', title: 'Cambiar dónde te examinas' }, conIcono('lugar', `Exámenes de ${e.nombre}`));
}

/** Cita de la fuente cuando la licencia del eje la exige (p. ej. «Origen de los datos: …», con la fecha de actualización). */
export function citaFuente(ficha) {
  const l = ficha?.licencia;
  if (!l?.citaObligatoria || !l.cita) return null;
  return h('p.muted.small.cita-fuente', `${l.cita}${l.actualizado ? ` (datos actualizados el ${fechaLarga(l.actualizado)})` : ''}.`);
}

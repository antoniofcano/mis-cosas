// Arrancar la sesión de hoy desde la entrada (Hoy) o desde la Travesía: la misma ruta y el mismo ejecutor de siempre
// (#/<tit>/sesion, src/ui/sesion.js). Con conceptos etiquetados, guarda la foto de la travesía para el parte del final.

import { tlink } from './titulacion.js';
import { hrefActividad } from './cierre.js';
import { guardarSesion } from './sesion.js';
import { nuevaSesion, indiceActual } from '../course/sesion.js';
import { fotoTravesia } from '../course/travesia.js';
import { temaDeIdea } from '../course/listo.js';
import { faroDeParada, paradaDeSesion } from '../course/entrada.js';
import { sincronizarTravesia } from './travesia.js';

/**
 * Guarda una sesión nueva con los pasos de `comp` (componerSesion) y abre el ejecutor.
 * @param {object} d  el resultado de calcularPlan (banco, índice de conceptos…)
 */
export function empezarSesion(progress, tit, d, comp) {
  const hrefs = comp.pasos.map((p) => hrefActividad(tit, p));
  const sy = d.indiceConceptos ? sincronizarTravesia(progress, d.banco.eje.id, tit, d.indiceConceptos, { respuestas: progress.get().exams }) : null;
  guardarSesion(progress, tit, nuevaSesion(tit, comp, { hrefs, minutosAntes: progress.minutosHoy(), foto: sy ? fotoTravesia(sy.est, sy.reg) : null }));
  location.hash = tlink(tit, ['sesion']);
}

/**
 * Dónde va el marcador «estás aquí» de la carta: el faro del tema de lo que toca (faroDeParada). `pasos` = los de la
 * sesión que toca (o los pendientes de la que va a medias, empezando por el actual).
 * @returns {number}  índice del faro, o -1 (la bandera del examen)
 */
export function marcaDerrota(sy, ic, pasos = []) {
  const p = paradaDeSesion(pasos);
  const cache = new Map();
  const temaDe = (id) => { if (!cache.has(id)) cache.set(id, temaDeIdea(ic, id)); return cache.get(id); };
  return faroDeParada(sy.est.faros, p?.paso?.ut ?? null, temaDe);
}

/** Los pasos que tocan ahora: los pendientes de la sesión a medias o, si no hay, los de `comp`. */
export function pasosQueTocan(guardada, comp) {
  const i = guardada && guardada.estado !== 'hecha' ? indiceActual(guardada) : -1;
  return i >= 0 ? guardada.pasos.slice(i) : comp.pasos;
}

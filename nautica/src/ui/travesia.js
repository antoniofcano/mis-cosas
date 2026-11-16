// La Travesía en la interfaz: el cálculo (src/course/travesia.js) con los datos del almacén de progreso. Lo usan la
// tarjeta de Hoy, la pantalla #/<tit>/travesia y el parte al terminar una sesión. Sin etiquetas en el banco (ic null),
// todo devuelve null y la app es la de siempre.

import { estadoTravesia, examenesDe, semanaDe, fusionar, progresoRango } from '../course/travesia.js';
import { TITULACIONES, estructuraModulo } from '../theory/blocks.js';
import { focoModulo } from '../course/foco.js';

/**
 * El estado de la travesía de un banco con los datos de hoy (sin guardar nada), o null sin conceptos. Los faros son los
 * temas del temario de la titulación (su estructura da el nombre y el orden): los mismos que pinta el Temario.
 * @param {object} progress  el almacén (createProgressStore)
 * @param {string} eje  id del eje del banco (banco.eje.id)
 */
export function calcularTravesia(progress, eje, tit, ic, { respuestas = progress.get().exams, ahora = Date.now() } = {}) {
  if (!ic) return null;
  const dias = progress.get().dias ?? {};
  // Con un módulo elegido (PY, src/course/foco.js), la derrota es la de ese módulo: sus temas y sus ideas.
  const E = TITULACIONES[tit]?.estructura ?? null;
  const foco = E ? focoModulo(progress.settings(), tit, E) : null;
  const est = estadoTravesia({ ic, estructura: foco ? estructuraModulo(E, foco.id) : E, respuestas, tests: examenesDe(progress.tests(), eje, tit), dias, ahora });
  if (!est) return null;
  est.semana = semanaDe(dias, ahora);
  return est;
}

/**
 * Calcula y guarda lo que haya ganado (el rango máximo y las insignias nuevas). Idempotente.
 * @returns {null | { est: object, reg: object, nuevas: string[], rango: ReturnType<typeof progresoRango> }}
 */
export function sincronizarTravesia(progress, eje, tit, ic, { respuestas, ahora = Date.now(), extra = [] } = {}) {
  const est = calcularTravesia(progress, eje, tit, ic, { respuestas, ahora });
  if (!est) return null;
  const guardado = progress.travesia(eje, tit);
  const { reg, nuevas } = fusionar(guardado, est, { ahora, extra });
  if (nuevas.length || reg.rango !== guardado.rango) progress.guardarTravesia(eje, tit, reg);
  return { est, reg, nuevas, rango: progresoRango(est, reg.rango) };
}

/** Cuántos faros hay encendidos. */
export const farosEncendidos = (est) => est.faros.filter((f) => f.estado === 'on').length;

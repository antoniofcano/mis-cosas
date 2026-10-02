// Luces de un buque de propulsión mecánica de menos de 50 m en navegación (RIPA, Regla 21 y Anexo I) y la situación
// que se deduce de lo que ves (Reglas 13, 14 y 15). Funciones puras.
//
// `aspecto`: desde dónde miras al otro, medido desde SU proa en el sentido de las agujas del reloj (0 = lo ves de
// proa, 90 = por su través de estribor, 180 = por su popa, 270 = por su través de babor).

import { norm360 } from '../math/angles.js';

/** Sectores de la Regla 21: tope 225° hacia proa; costados 112,5° cada uno; alcance 135° hacia popa. */
export const SECTORES = { costado: 112.5, alcance: [112.5, 247.5] };
/** Anexo I, 9 a): las luces de costado se apagan «en la práctica» entre 1° y 3° fuera de su sector. */
export const SOLAPE_PROA = 3;

/**
 * Qué luces del otro buque ves.
 * Los límites (112,5° y 247,5°) son de las luces de costado: según la Regla 13 b) solo alcanzas cuando vienes
 * «desde más de 22,5° a popa del través».
 * @returns {{ tope: boolean, verde: boolean, roja: boolean, alcance: boolean }}
 */
export function lucesVisibles(aspecto) {
  const a = norm360(aspecto);
  const alcance = a > SECTORES.alcance[0] && a < SECTORES.alcance[1];
  const verde = (a >= 0 && a <= SECTORES.costado) || a >= 360 - SOLAPE_PROA;
  const roja = a >= 360 - SECTORES.costado || a <= SOLAPE_PROA;
  return { tope: !alcance, verde, roja, alcance };
}

/** Las luces en palabras: «tope y verde», «una sola luz blanca (la de alcance)»… */
export function lucesTexto(v) {
  if (v.alcance) return 'una sola luz blanca (la de alcance)';
  const partes = ['la blanca de tope'];
  if (v.verde && v.roja) partes.push('la verde y la roja');
  else if (v.verde) partes.push('la verde');
  else if (v.roja) partes.push('la roja');
  return partes.join(' y ');
}

/**
 * Situación y quién maniobra, para dos buques de propulsión mecánica a la vista con riesgo de abordaje,
 * deducida de las luces que ves del otro.
 * @returns {{ situacion: 'vuelta-encontrada'|'alcance'|'cruce', maniobra: 'tu'|'el'|'los-dos', regla: string, texto: string }}
 */
export function situacionPorLuces(v) {
  if (v.alcance) return { situacion: 'alcance', maniobra: 'tu', regla: 'Regla 13', texto: 'Lo estás alcanzando: te apartas tú, aunque seas más rápido o más grande.' };
  if (v.verde && v.roja) return { situacion: 'vuelta-encontrada', maniobra: 'los-dos', regla: 'Regla 14', texto: 'Vuelta encontrada: los dos caéis a estribor para pasar babor con babor.' };
  if (v.roja) return { situacion: 'cruce', maniobra: 'tu', regla: 'Reglas 15 y 16', texto: 'Cruce: ves su roja, así que lo tienes por tu estribor. Te apartas tú, a ser posible pasándole por la popa.' };
  return { situacion: 'cruce', maniobra: 'el', regla: 'Reglas 15 y 17', texto: 'Cruce: ves su verde, así que él te tiene por su estribor. Se aparta él; tú mantienes rumbo y velocidad, atento por si no maniobra.' };
}

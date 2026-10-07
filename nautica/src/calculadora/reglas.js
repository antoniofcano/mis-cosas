// ¿Se permite la calculadora en el examen? Lo dice la ficha del eje (data/ejes/<eje>/eje.json,
// `examen.<tit>.calculadora`); si la ficha no dice nada, lo de la titulación (src/theory/blocks.js, TITULACIONES:
// en el PY sí, en el PER no). Fuera de los exámenes (clases, tandas, ejercicios, mesa de cartas) siempre se puede usar.

import { TITULACIONES } from '../theory/blocks.js';

/**
 * @param {string} tit   'per' | 'py'
 * @param {object|null} ficha  ficha del eje (banco.eje)
 */
export function calculadoraPermitida(tit, ficha) {
  const T = TITULACIONES[tit];
  if (!T) return false;
  const delEje = ficha?.examen?.[tit]?.calculadora;
  return typeof delEje === 'boolean' ? delEje : T.calculadora === true;
}

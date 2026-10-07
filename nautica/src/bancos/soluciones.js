// Soluciones programadas de las preguntas de carta de todos los ejes (src/bancos/ejes/<eje>.js), por id de pregunta.
// Un eje nuevo con soluciones propias se añade a EJES; los ids no se repiten entre ejes (llevan su prefijo).
import andalucia from './ejes/andalucia.js';

const EJES = [andalucia];

/** id de pregunta → { ejercicio?, sinCarta?, solve(kit, q) } */
export const SOLUCIONES = Object.assign({}, ...EJES.map((e) => e.soluciones ?? {}));

/** La solución programada de una pregunta (o undefined). */
export const solucionDe = (id) => SOLUCIONES[id];

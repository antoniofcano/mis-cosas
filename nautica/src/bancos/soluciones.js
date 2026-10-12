// Soluciones programadas de las preguntas de carta de todos los ejes (src/bancos/ejes/<eje>.js), por id de pregunta.
// Un eje nuevo con soluciones propias se añade a EJES; los ids no se repiten entre ejes (llevan su prefijo).
import andalucia from './ejes/andalucia.js';
import baleares from './ejes/baleares.js';
import dgmm from './ejes/dgmm.js';

const EJES = [andalucia, dgmm, baleares];

/** id de pregunta → { ejercicio?, sinCarta?, sinMargen?, solve(kit, q) } */
export const SOLUCIONES = Object.assign({}, ...EJES.map((e) => e.soluciones ?? {}));

/**
 * Preguntas de carta sin solución programada, con el motivo documentado (id → { tipo, texto }): `discrepancia` (la
 * resolución no llega a la opción oficial: se explica por qué, con la cuenta), `sin-calculo` (no es un cálculo o falta
 * un elemento de la carta: se resuelve mirando la carta) o `anulada` (anulada por el tribunal y sin cálculo posible con
 * su enunciado: por qué). La puerta de calidad de un eje publicado exige solución o motivo para cada pregunta de carta.
 * Ninguna de ellas se practica (src/bancos/index.js, `practicable`); su vista (#/q/<id>) enseña el motivo
 * (src/exams/motivo.js). Una solución programada puede llevar `sinMargen` (texto): llega a la oficial, pero otra opción
 * queda casi igual de cerca (tests/exams.test.js); la vista lo avisa junto a la resolución.
 */
export const DOCUMENTADAS = Object.assign({}, ...EJES.map((e) => e.documentadas ?? {}));

/** La solución programada de una pregunta (o undefined). */
export const solucionDe = (id) => SOLUCIONES[id];

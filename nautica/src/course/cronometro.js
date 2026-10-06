// Tiempo de estudio real: se suma lo que pasa entre una pantalla y la siguiente, con un tope por pantalla (dejar la
// app abierta no suma). Es la única forma de medir minutos en la app: clase, tandas, repaso, tarjetas y carta.

/** Tope por pantalla: más de 2 minutos en una pantalla no cuentan. */
export const TOPE_PANTALLA_MS = 2 * 60 * 1000;

/** @param {() => number} [ahora] reloj (para los tests) */
export function cronometro(ahora = () => Date.now(), tope = TOPE_PANTALLA_MS) {
  let ultima = ahora();
  let total = 0;
  return {
    /** Cierra la pantalla actual (al contestar, pasar de tarjeta, etc.) y empieza a contar la siguiente. */
    marca() { const t = ahora(); total += Math.min(Math.max(0, t - ultima), tope); ultima = t; return total; },
    /** Milisegundos contados hasta ahora (cierra la pantalla actual). */
    ms() { return this.marca(); },
    /** Minutos enteros (redondeados): lo que se apunta a la meta del día. Unos segundos de clics son 0. */
    minutos() { return Math.round(this.marca() / 60000); },
    /** Vuelve a empezar desde cero. */
    reinicia() { ultima = ahora(); total = 0; },
  };
}

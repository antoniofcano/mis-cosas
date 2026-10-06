// Textos con número y fechas: TODO texto de la interfaz que lleva una cantidad o una fecha pasa por aquí, para que
// no haya «1 preguntas» ni fechas en formatos distintos según la pantalla (tests/texto.test.js lo vigila).

/** Plural de una palabra en español (vocal → +s; z → ces; consonante → +es). */
export function plural(w) {
  if (/[aeiouáéó]$/i.test(w)) return `${w}s`;
  if (/z$/i.test(w)) return `${w.slice(0, -1)}ces`;
  return `${w}es`;
}

/**
 * «1 pregunta», «3 preguntas». `varios` hace falta cuando no es una sola palabra («pregunta hecha» → «preguntas hechas»).
 * @param {number} n
 */
export function cuenta(n, uno, varios = uno.includes(' ') ? null : plural(uno)) {
  if (varios == null) throw new Error(`cuenta: falta el plural de «${uno}»`);
  return `${String(n).replace('.', ',')} ${n === 1 ? uno : varios}`;
}

const aFecha = (x) => (x instanceof Date ? x : typeof x === 'number' ? new Date(x) : (() => { const [y, m, d] = String(x).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); })());

/** «domingo, 4 de octubre» (con el año solo si no es el actual). Acepta 'AAAA-MM-DD', milisegundos o Date. */
export function fechaLarga(x, { ahora = Date.now() } = {}) {
  const f = aFecha(x);
  const otroAño = f.getFullYear() !== new Date(ahora).getFullYear();
  return f.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', ...(otroAño ? { year: 'numeric' } : {}) });
}

/** Día local en formato ISO ('AAAA-MM-DD'), para guardar y comparar fechas (no para enseñar). */
export const diaISO = (ms = Date.now()) => new Date(ms).toLocaleDateString('sv-SE');

// Modo examen: mientras hay un examen cronometrado en marcha (simulacro, convocatoria real o examen final), las
// ayudas no se ofrecen. Es la señal común para las piezas que dan ayuda (chuleta, glosario, hoja plegable,
// calculadora…): cada una consulta modoExamen() o escucha el evento «modo-examen» y se oculta.
//
//   document.body.dataset.modoExamen   '' | 'examen' | 'final'
//   document.body.dataset.calculadora  'si' | 'no'   (solo con un examen en marcha: si el eje y la titulación la permiten)
//   evento 'modo-examen' en window, con detail = { modo, calculadora }

/** Modo del examen en marcha: null (no hay), 'examen' (simulacro o real) o 'final' (examen final). */
export function modoExamen() {
  return typeof document === 'undefined' ? null : document.body?.dataset.modoExamen || null;
}

/** ¿Se puede usar la calculadora ahora? Fuera de un examen, sí; dentro, solo si el eje y la titulación lo permiten. */
export function calculadoraEnExamen() {
  if (!modoExamen()) return true;
  return document.body.dataset.calculadora === 'si';
}

/**
 * Entra en el modo examen (o sale, con modo null).
 * @param {'examen'|'final'|null} modo
 * @param {{ calculadora?: boolean }} o  calculadora: la permite la ficha del eje (examen.<tit>.calculadora)
 */
export function fijarModoExamen(modo, { calculadora = false } = {}) {
  if (typeof document === 'undefined' || !document.body) return;
  if (modo) {
    document.body.dataset.modoExamen = modo;
    document.body.dataset.calculadora = calculadora ? 'si' : 'no';
  } else {
    delete document.body.dataset.modoExamen;
    delete document.body.dataset.calculadora;
  }
  window.dispatchEvent(new CustomEvent('modo-examen', { detail: { modo: modo ?? null, calculadora: !!(modo && calculadora) } }));
}

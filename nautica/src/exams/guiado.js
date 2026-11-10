// Modo guiado (R-35): la resolución programada de una pregunta, pedida paso a paso. Lógica sin DOM (la interfaz está
// en src/ui/guiado.js).
// - Los pasos salen del kit (src/exams/kit.js): los que llevan `pide` se preguntan; los demás (notas, datos,
//   construcciones) se enseñan sin preguntar.
// - Cada campo se lee y se mide con su magnitud (src/analysis/quantities.js), la misma que usan los ejercicios
//   generados: rumbos, demoras, Ct con signo (E/W, +/−), coordenadas, horas, duraciones, millas, nudos y metros.
// - Tolerancia: la de examen de esa magnitud (la que usa chooseOption para elegir la opción), el doble en lo que se
//   mide sobre la carta con transportador o compás (`medido`), y por el factor de Ajustes (`toleranceFactor`).
//   Dentro: correcto; hasta el doble: «casi» (no cuenta como acierto); más: mal.

import { quantity } from '../analysis/quantities.js';

export const ESTADO = { OK: 'ok', CASI: 'casi', MAL: 'mal', VACIO: 'vacio', ILEGIBLE: 'ilegible' };

/** Los pasos de una resolución con su índice y si se preguntan. */
export const pasosGuiados = (steps) => steps.map((s, i) => ({ i, title: s.title, text: s.text, pide: s.pide ?? null }));

/** ¿Tiene la resolución al menos un paso que preguntar? */
export const tienePasosPreguntables = (steps) => steps.some((s) => s.pide?.campos?.length);

/** Tolerancia de un campo. */
export function toleranciaCampo(campo, factor = 1) {
  return quantity(campo.kind).tolerance * (campo.medido ? 2 : 1) * factor;
}

/**
 * Corrige lo que escribe el alumno en un paso.
 * @param {{ campos: {kind, value, label, medido?}[] }} pide
 * @param {string[]} entradas  texto de cada campo, en orden
 * @returns {{ ok: boolean, estado: string, campos: {label, estado, valor?, valorTexto?, esperado, esperadoTexto, error?, tol}[] }}
 *   `estado` del paso: 'ok' si todos lo están, 'vacio' o 'ilegible' si falta alguno o no se entiende (no se corrige),
 *   'casi' si alguno está casi y ninguno mal, y si no 'mal'.
 */
export function corregirPaso(pide, entradas, { factor = 1 } = {}) {
  const campos = pide.campos.map((c, i) => {
    const q = quantity(c.kind);
    const raw = String(entradas[i] ?? '').trim();
    const tol = toleranciaCampo(c, factor);
    const base = { label: c.label, kind: c.kind, esperado: c.value, esperadoTexto: q.format(c.value), tol };
    if (!raw) return { ...base, estado: ESTADO.VACIO };
    const v = q.parse(raw);
    if (Number.isNaN(v)) return { ...base, estado: ESTADO.ILEGIBLE, ejemplo: q.placeholder };
    const err = q.error(v, c.value);
    return { ...base, valor: v, valorTexto: q.format(v), error: err, errorTexto: `${err.toFixed(1).replace('.', ',')}${q.errorUnit}`,
      estado: err <= tol ? ESTADO.OK : err <= 2 * tol ? ESTADO.CASI : ESTADO.MAL };
  });
  const es = (e) => campos.some((c) => c.estado === e);
  const estado = es(ESTADO.VACIO) ? ESTADO.VACIO : es(ESTADO.ILEGIBLE) ? ESTADO.ILEGIBLE : es(ESTADO.MAL) ? ESTADO.MAL : es(ESTADO.CASI) ? ESTADO.CASI : ESTADO.OK;
  return { ok: estado === ESTADO.OK, estado, campos };
}

/** El valor de un paso escrito como en el examen: «Ct = +3,0° · Rv = 045°». */
export function valorTexto(pide) {
  return pide.campos.map((c) => `${c.label} ${quantity(c.kind).format(c.value)}`).join(' · ');
}

/**
 * Resumen del recorrido: { aciertos, fallos, dichos, total, porPaso: [{ paso, ok }] } a partir de los resultados
 * ({ i, paso, resultado: 'ok'|'casi'|'mal'|'dimelo' }).
 */
export function resumenGuiado(resultados) {
  const total = resultados.length;
  const aciertos = resultados.filter((r) => r.resultado === ESTADO.OK).length;
  const dichos = resultados.filter((r) => r.resultado === 'dimelo').length;
  return { total, aciertos, dichos, fallos: total - aciertos - dichos };
}

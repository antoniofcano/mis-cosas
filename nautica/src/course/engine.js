// Motor del curso: estado de cada lección a partir de lo que el alumno ha visto y respondido, repaso espaciado
// (cajas de Leitner) y el plan «Hoy toca». Funciones puras: el progreso entra como datos.

/** Días hasta el siguiente repaso según la caja (0 = recién aprendida o fallada). */
export const INTERVALOS = [1, 3, 7, 14, 30];
const DIA = 24 * 3600 * 1000;

/** Umbral de acierto para dar una práctica por buena. */
export const APROBADO = 0.8;

/**
 * Estado de una lección.
 * @param {object} leccion   { id, practica: [ids] }
 * @param {object} reg       registro guardado { visto, caja, proximo, ultimo, paso } (o undefined)
 * @param {object} respuestas mapa idPregunta → { ok }
 * @param {number} ahora     ms
 * @returns {{ estado: 'nueva'|'empezada'|'repasar'|'dominada', hechas: number, aciertos: number, total: number, pct: number|null, proximo: number|null }}
 */
export function estadoLeccion(leccion, reg, respuestas, ahora = Date.now()) {
  const ids = leccion.practica ?? [];
  const hechas = ids.filter((id) => respuestas[id]);
  const aciertos = hechas.filter((id) => respuestas[id].ok).length;
  const pct = hechas.length ? aciertos / hechas.length : null;
  const base = { hechas: hechas.length, aciertos, total: ids.length, pct, proximo: reg?.proximo ?? null };
  // Una clase abierta y dejada a medias (reg.paso > 0) ya está empezada.
  if (!reg?.visto && !reg?.paso && !hechas.length) return { ...base, estado: 'nueva' };
  // Una clase sin preguntas de práctica (de concepto; su práctica está en otro tema) queda aprendida al terminarla.
  // Si no, se quedaría «empezada» para siempre y su tema nunca estaría al día.
  if (!ids.length && reg?.caja == null) return { ...base, estado: reg?.visto && !reg?.paso ? 'dominada' : 'empezada' };
  if (reg?.caja == null) return { ...base, estado: 'empezada' };
  if (reg.proximo != null && reg.proximo <= ahora) return { ...base, estado: 'repasar' };
  if (pct != null && pct < 0.6) return { ...base, estado: 'repasar' };
  return { ...base, estado: reg.caja >= 1 ? 'dominada' : 'empezada' };
}

/**
 * Actualiza la caja de Leitner tras una práctica de la lección.
 * @param {object} reg      registro previo
 * @param {number} acierto  fracción 0..1 de la práctica que acaba de hacer
 */
export function trasPractica(reg = {}, acierto, ahora = Date.now()) {
  const caja = acierto >= APROBADO ? Math.min((reg.caja ?? -1) + 1, INTERVALOS.length - 1) : 0;
  return { ...reg, visto: true, caja, ultimo: ahora, proximo: ahora + INTERVALOS[caja] * DIA, ultimoAcierto: acierto };
}

/** Recorre las lecciones de un curso en orden. */
export const leccionesDe = (curso) => curso.modulos.flatMap((m) => m.lecciones.map((l) => ({ ...l, ut: l.ut ?? m.ut, modulo: m.titulo })));

/**
 * Plan del día: repasos pendientes (los más atrasados primero), la siguiente lección nueva y,
 * si hay fecha de examen, cuántas lecciones al día hacen falta para llegar.
 * @param {object} curso
 * @param {Record<string, object>} regs   registros por id de lección
 * @param {Record<string, {ok:boolean}>} respuestas
 * @param {{ ahora?: number, fechaExamen?: string, prioridad?: number[] }} o  prioridad: UTs con límite de errores
 */
export function hoyToca(curso, regs, respuestas, { ahora = Date.now(), fechaExamen = null, prioridad = [] } = {}) {
  const ls = leccionesDe(curso).map((l) => ({ l, e: estadoLeccion(l, regs[l.id], respuestas, ahora) }));
  const repasos = ls.filter((x) => x.e.estado === 'repasar')
    .sort((a, b) => (prioridad.includes(b.l.ut) - prioridad.includes(a.l.ut)) || ((a.e.proximo ?? 0) - (b.e.proximo ?? 0)));
  const empezadas = ls.filter((x) => x.e.estado === 'empezada');
  const nuevas = ls.filter((x) => x.e.estado === 'nueva');
  const siguiente = empezadas[0] ?? nuevas[0] ?? null;
  let ritmo = null;
  if (fechaExamen) {
    const dias = Math.max(1, Math.ceil((new Date(fechaExamen).getTime() - ahora) / DIA));
    const pendientes = nuevas.length + empezadas.length;
    ritmo = { dias, pendientes, porDia: Math.ceil(pendientes / Math.max(1, dias - 7)), simulacros: dias <= 14 };
  }
  const dominadas = ls.filter((x) => x.e.estado === 'dominada').length;
  return { repasos: repasos.slice(0, 3).map((x) => x.l), siguiente: siguiente?.l ?? null, ritmo, total: ls.length, dominadas };
}

/**
 * La pregunta del final de la clase sale cada vez al azar entre las preguntas reales de examen de la clase
 * (`disponibles`). Si la clase ya acaba en una pregunta fija, esta se sustituye; si no, se añade al final.
 * Sin preguntas reales, la clase queda como está.
 */
export function conPreguntaFinal(pasos, disponibles, rng) {
  if (!disponibles.length) return pasos;
  const q = rng.pick(disponibles);
  const final = { tipo: 'check', real: q, enunciado: q.enunciado, opciones: q.opciones, correcta: q.correcta };
  return pasos.at(-1)?.tipo === 'check' ? [...pasos.slice(0, -1), final] : [...pasos, final];
}

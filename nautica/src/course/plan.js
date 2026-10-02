// Recomendador único: decide qué toca hoy (pantalla Hoy, cierres de sesión y Temario), el estado de cada
// tema y el avance global. Funciones puras: el progreso entra como datos.

import { estadoLeccion } from './engine.js';

export const TANDA = 10; // preguntas por tanda
export const MIN_TANDA = 8; // minutos estimados de una tanda
export const OBJETIVO_TEMA = 20; // preguntas hechas para considerar un tema «al día» (o todas si tiene menos)
export const UMBRAL_FALLOS = 10; // preguntas falladas pendientes para proponer sesión de fallos
export const MAX_ACTIVIDADES = 3;

const DIA = 864e5;
const valida = (q) => !q.anulada && q.correcta;
const diaLocal = (ms) => new Date(ms).toLocaleDateString('sv-SE');

/** Días (naturales, hora local) desde `ahora` hasta la fecha 'YYYY-MM-DD'. Negativo si ya pasó. */
export function diasHasta(fecha, ahora = Date.now()) {
  const [y, m, d] = String(fecha).split('-').map(Number);
  if (!y || !m || !d) return null;
  const hoy = new Date(ahora);
  const a = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((Date.UTC(y, m - 1, d) - a) / DIA);
}

/** Clases publicadas de un tema. */
const clasesDe = (curso, ut) => (curso?.modulos ?? []).filter((m) => m.ut === ut).flatMap((m) => m.lecciones.map((l) => ({ ...l, ut: l.ut ?? m.ut, modulo: m.titulo })));

/**
 * Estado de un tema.
 * @returns {{ hechas, total, aciertos, pct: number|null, clases: {total, vistas, aprendidas}, alDia: boolean,
 *   estado: 'sin-empezar'|'en-marcha'|'bien'|'repasar', fallos: number }}
 */
export function estadoTema(bloque, curso, preguntas, regs = {}, respuestas = {}, ahora = Date.now()) {
  const qs = preguntas.filter((q) => q.ut === bloque.ut && valida(q));
  const hechasQ = qs.filter((q) => respuestas[q.id]);
  const aciertos = hechasQ.filter((q) => respuestas[q.id].ok).length;
  const fallos = hechasQ.length - aciertos;
  const hechas = hechasQ.length;
  const total = qs.length;
  const pct = hechas >= 10 ? Math.round((100 * aciertos) / hechas) : null;
  const estados = clasesDe(curso, bloque.ut).map((l) => estadoLeccion(l, regs[l.id], respuestas, ahora).estado);
  const clases = { total: estados.length, vistas: estados.filter((e) => e !== 'nueva').length, aprendidas: estados.filter((e) => e === 'dominada').length };
  const alDia = estados.every((e) => e !== 'nueva' && e !== 'empezada') && hechas >= Math.min(total, OBJETIVO_TEMA);
  let estado = 'en-marcha';
  if (!hechas && !clases.vistas) estado = 'sin-empezar';
  else if (pct != null && pct >= 80) estado = 'bien';
  else if (pct != null && pct < 60) estado = 'repasar';
  return { hechas, total, aciertos, pct, clases, alDia, estado, fallos };
}

/** Avance global: temas al día y fracción media de preguntas hechas respecto al objetivo de cada tema. */
export function avance(estructura, curso, preguntas, regs = {}, respuestas = {}, ahora = Date.now()) {
  const es = estructura.bloques.map((b) => estadoTema(b, curso, preguntas, regs, respuestas, ahora));
  const parte = (e) => { const obj = Math.min(e.total, OBJETIVO_TEMA); return obj ? Math.min(1, e.hechas / obj) : 0; };
  return {
    temasAlDia: es.filter((e) => e.alDia).length,
    temasTotal: es.length,
    fraccion: es.length ? es.reduce((s, e) => s + parte(e), 0) / es.length : 0,
  };
}

/** Actividad «paso 4» para un tema que no está al día: clase a medias, clase nueva o tanda de preguntas. */
function actividadTema(b, est, curso, regs, respuestas, ahora) {
  const clases = clasesDe(curso, b.ut).map((l) => ({ l, e: estadoLeccion(l, regs[l.id], respuestas, ahora).estado }));
  const empezada = clases.find((c) => c.e === 'empezada');
  const nueva = clases.find((c) => c.e === 'nueva');
  const c = empezada ?? nueva;
  if (c) return { tipo: 'clase', titulo: c.l.titulo, verbo: empezada ? 'Continuar' : 'Empezar', minutos: c.l.minutos ?? 10, ruta: ['curso', c.l.id], query: undefined, ut: b.ut };
  return { tipo: 'preguntas', titulo: `${est.hechas ? `${TANDA} preguntas más` : `${TANDA} preguntas`} de ${b.titulo}`, verbo: 'Empezar', minutos: MIN_TANDA, ruta: ['teoria', 'ut', String(b.ut)], query: undefined, ut: b.ut };
}

/**
 * Qué toca hoy, en orden (la [0] es la principal). Nunca vacía; como máximo 3 actividades.
 * @param {object} o  { estructura, curso, preguntas, regs, respuestas, tests, testEnCurso, fechaExamen, ahora }
 * @returns {{ tipo, titulo, verbo, minutos, ruta: string[], query?: object, ut: number|null }[]}
 */
export function planHoy({ estructura, curso = null, preguntas = [], regs = {}, respuestas = {}, tests = [], testEnCurso = null, fechaExamen = null, ahora = Date.now() }) {
  const lista = [];
  const simulacro = () => ({ tipo: 'simulacro', titulo: 'Simulacro de examen', verbo: 'Hacer simulacro', minutos: estructura.duracionMin, ruta: ['test', 'simulacro'], query: undefined, ut: null });

  // 1. Examen a medias
  if (testEnCurso) {
    const restante = Math.max(1, Math.round(estructura.duracionMin - (testEnCurso.consumidoMs ?? 0) / 60000));
    const real = testEnCurso.tipo === 'real';
    lista.push({ tipo: 'examen-en-curso', titulo: 'Examen a medias', verbo: 'Continuar', minutos: restante,
      ruta: real ? ['test', 'real', String(testEnCurso.conv)] : ['test', 'simulacro'],
      query: real || testEnCurso.seed == null ? undefined : { s: String(testEnCurso.seed) }, ut: null });
  }

  // 2. Simulacro en la recta final (≤ 14 días) si hoy no se ha hecho ninguno
  const dias = fechaExamen ? diasHasta(fechaExamen, ahora) : null;
  const hoy = diaLocal(ahora);
  if (dias != null && dias >= 0 && dias <= 14 && !tests.some((t) => t.t && diaLocal(new Date(t.t).getTime()) === hoy)) lista.push(simulacro());

  // 3. Repasos de clases (máximo 2): primero los temas con límite de errores, luego los más atrasados
  const prioridad = new Set(estructura.bloques.filter((b) => b.maxErrores != null).map((b) => b.ut));
  const repasos = estructura.bloques.flatMap((b) => clasesDe(curso, b.ut))
    .map((l) => ({ l, e: estadoLeccion(l, regs[l.id], respuestas, ahora) }))
    .filter((x) => x.e.estado === 'repasar')
    .sort((a, b) => (prioridad.has(b.l.ut) - prioridad.has(a.l.ut)) || ((a.e.proximo ?? 0) - (b.e.proximo ?? 0)))
    .slice(0, 2);
  for (const { l } of repasos) lista.push({ tipo: 'repaso', titulo: l.titulo, verbo: 'Repasar', minutos: MIN_TANDA, ruta: ['curso', l.id], query: { practica: '1' }, ut: l.ut });

  // 4. El primer tema que no está al día
  const estados = estructura.bloques.map((b) => ({ b, est: estadoTema(b, curso, preguntas, regs, respuestas, ahora) }));
  const pendientes = estados.filter((x) => !x.est.alDia);
  if (pendientes[0]) lista.push(actividadTema(pendientes[0].b, pendientes[0].est, curso, regs, respuestas, ahora));

  // 5. Sesión de fallos si se acumulan
  const totalFallos = estados.reduce((s, x) => s + x.est.fallos, 0);
  if (totalFallos >= UMBRAL_FALLOS) {
    const peor = [...estados].sort((a, b) => b.est.fallos - a.est.fallos)[0];
    lista.push({ tipo: 'fallos', titulo: `Repasar mis fallos de ${peor.b.titulo}`, verbo: 'Repasar', minutos: MIN_TANDA, ruta: ['teoria', 'ut', String(peor.b.ut)], query: { f: '1' }, ut: peor.b.ut });
  }

  // 6. Todo al día: simulacro
  if (!lista.length) lista.push(simulacro());

  // 7. Con una sola actividad, proponer también el siguiente tema pendiente
  if (lista.length === 1 && pendientes[1]) lista.push(actividadTema(pendientes[1].b, pendientes[1].est, curso, regs, respuestas, ahora));

  return lista.slice(0, MAX_ACTIVIDADES);
}

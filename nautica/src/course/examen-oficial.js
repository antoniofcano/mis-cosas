// Tu examen oficial, apuntado (R-60). El alumno se examina de verdad y, cuando la administración publica la plantilla y
// la convocatoria entra en el banco, pasa a la app lo que marcó en su hoja. La app lo corrige con la plantilla oficial y
// lo trata como un examen más: cada respuesta va a su progreso (las falladas, a la cola de repaso de fallos), el examen
// cuenta en «Tus fallos por materia» y el resultado por materia queda apuntado para el examen de esa fecha (con el
// módulo aprobado, si lo hay). Así lo que falló el día de verdad dirige el entrenamiento para la convocatoria siguiente.
//
// Una convocatoria que el alumno ya ha hecho no puede ser su examen final (las preguntas ya no son inéditas para él):
// al apuntarla, sale de su reserva y entra en su estudio. Se guarda en el ajuste compartido `hechas_<eje>_<tit>` (no en
// la foto de la reserva, `reserva_<eje>_<tit>`, en la que gana el primer valor; ver reservaEfectiva en src/bancos/index.js). Nada de esto cita una pregunta reservada en el
// contenido de la app: es el propio alumno quien la trae, porque ya la ha visto.
//
// Funciones puras: la fecha de hoy entra como 'AAAA-MM-DD'.

import { estructuraModulo } from '../theory/blocks.js';
import { modulosAprobados } from './tras-examen.js';

/** Días tras el examen en que se ofrece apuntarlo (los mismos que para apuntar el resultado). */
export const DIAS_OFICIAL = 120;

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const dias = (a, b) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000);

/**
 * Convocatorias que se pueden apuntar: celebradas hace `max` días o menos (y no en el futuro), la más reciente primero.
 * @param {{ key: string, titulo: string, fecha: string|null }[]} convs  todas las del banco (también las reservadas)
 */
export function convocatoriasApuntables(convs = [], hoy, { max = DIAS_OFICIAL } = {}) {
  if (!ISO.test(hoy ?? '')) return [];
  return convs.filter((c) => ISO.test(c.fecha ?? '') && (() => { const d = dias(c.fecha, hoy); return d >= 0 && d <= max; })())
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** Clave del ajuste con las convocatorias que el alumno hizo de verdad. */
export const claveHechas = (eje, tit) => `hechas_${eje}_${tit}`;

/** La lista de convocatorias hechas con `conv` (sin repetir; lo que no sea una lista de textos se descarta). */
export function marcarHecha(hechas, conv) {
  const xs = Array.isArray(hechas) ? hechas.filter((x) => typeof x === 'string') : [];
  return xs.includes(conv) ? xs : [...xs, conv];
}

/** ¿Qué partes del examen se pueden apuntar? Con módulos (PY), el examen entero o un módulo suelto (si te examinabas de uno). */
export function partesApuntables(estructura) {
  const ms = estructura.modulos ?? [];
  return ms.length ? [{ id: 'completo', titulo: 'El examen entero' }, ...ms.map((m) => ({ id: m.id, titulo: `Solo el ${m.titulo.replace(/^Módulo/, 'módulo')}` }))] : [{ id: 'completo', titulo: 'El examen entero' }];
}

/** La estructura con la que se corrige la parte elegida. */
export const estructuraParte = (estructura, parte) => (parte && parte !== 'completo' && estructuraModulo(estructura, parte)) || estructura;

/** Las preguntas de la convocatoria que entran en la parte elegida (en su orden). */
export function preguntasParte(preguntas, estructura, parte) {
  if (!parte || parte === 'completo') return preguntas;
  const uts = new Set(estructuraParte(estructura, parte).bloques.map((b) => b.ut));
  return preguntas.filter((q) => uts.has(q.ut));
}

/**
 * Hojas de respuestas como en el examen: una por módulo, numerada desde 1 (en el PY suelen ser dos cuadernillos de
 * 20), o una sola. `desde` es la posición de su primera pregunta en el examen.
 */
export function hojasDe(preguntas, estructura) {
  const ms = estructura.modulos ?? [];
  if (!ms.length) return [{ id: 'unica', titulo: null, preguntas, desde: 0 }];
  const out = [];
  let desde = 0;
  for (const m of ms) {
    const uts = new Set(estructuraModulo(estructura, m.id).bloques.map((b) => b.ut));
    const qs = preguntas.filter((q) => uts.has(q.ut));
    if (qs.length) out.push({ id: m.id, titulo: m.titulo, preguntas: qs, desde });
    desde += qs.length;
  }
  return out;
}

/**
 * El resultado por materia para apuntarlo en el examen de esa fecha (src/course/semana.js, apuntarResultado): los
 * fallos de cada materia corregida y, con módulos, el módulo aprobado si se puede saber.
 * @param {object} estructura  la del examen completo
 * @param {{ bloques: { ut, aciertos, total }[] }} g  la corrección (grade)
 */
export function resultadoDe(estructura, g) {
  const fallos = Object.fromEntries(g.bloques.map((b) => [b.ut, b.total - b.aciertos]));
  let modulo = null;
  const ms = modulosAprobados(estructura, fallos);
  if (ms) {
    const sabidos = ms.filter((m) => m.aprobado != null);
    const aprobado = sabidos.find((m) => m.aprobado);
    modulo = aprobado ? aprobado.id : sabidos.length === ms.length ? 'ninguno' : null;
  }
  return { fallos, modulo };
}

/**
 * Tus fallos del examen, agrupados por tipo de problema (los de teoría, por materia), el grupo con más fallos primero.
 * @param {object[]} preguntas  las del examen, en su orden
 * @param {{ id, ok, respuesta, correcta, retirada? }[]} detalle  de la corrección, en el mismo orden
 * @param {(q) => string} tipoDe  tipo de problema ('teoria' para las de teoría)
 * @param {(q) => string} materiaDe  nombre de la materia de una pregunta de teoría
 * @param {(i: number) => string} numeroDe  cómo se llama la pregunta i en el examen («Navegación 17»)
 */
export function fallosAgrupados(preguntas, detalle, { tipoDe, nombreTipo = (x) => x, materiaDe, numeroDe }) {
  const grupos = new Map();
  preguntas.forEach((q, i) => {
    const d = detalle[i];
    if (!d || d.ok || d.retirada) return;
    const tipo = tipoDe(q);
    const clave = tipo === 'teoria' ? `teoria:${q.ut}` : tipo;
    const titulo = tipo === 'teoria' ? materiaDe(q) : nombreTipo(tipo);
    if (!grupos.has(clave)) grupos.set(clave, { clave, titulo, carta: tipo !== 'teoria', fallos: [] });
    grupos.get(clave).fallos.push({ id: q.id, numero: numeroDe(i), marcada: d.respuesta ?? null, correcta: d.correcta });
  });
  return [...grupos.values()].sort((a, b) => b.fallos.length - a.fallos.length || Number(b.carta) - Number(a.carta));
}

/** El examen oficial ya apuntado de una convocatoria (tests del alumno de esa titulación y ese eje), o null. */
export const oficialApuntado = (tests = [], conv) => [...tests].reverse().find((t) => t?.oficial && t.conv === conv) ?? null;

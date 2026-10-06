// Recomendador único: decide qué toca hoy (pantalla Hoy, cierres de sesión y Temario), el estado de cada
// tema y el avance global. Funciones puras: el progreso entra como datos.

import { estadoLeccion, numTramos, minutosClase, minutosDeTramo, SEG_TARJETA } from './engine.js';
import { bloquesEnOrden } from '../theory/blocks.js';
import { colaRepaso } from './repaso.js';
import { cuenta, diaISO } from '../texto.js';

export const TANDA = 10; // preguntas por tanda
export const MIN_TANDA = 8; // minutos estimados de una tanda
export const OBJETIVO_TEMA = 20; // preguntas hechas para considerar un tema «al día» (o todas si tiene menos)
export const UMBRAL_FALLOS = 10; // preguntas falladas pendientes para proponer sesión de fallos
export const MAX_ACTIVIDADES = 3;

const DIA = 864e5;
const valida = (q) => !q.anulada && q.correcta;
const diaLocal = diaISO;

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
  const ls = clasesDe(curso, bloque.ut);
  const estados = ls.map((l) => estadoLeccion(l, regs[l.id], respuestas, ahora).estado);
  const terminada = (e) => e !== 'nueva' && e !== 'empezada';
  // Lo hecho de las clases a medias (tramos terminados / tramos), para que el avance se mueva al estudiar un tramo.
  const parcial = ls.reduce((s, l, i) => s + (estados[i] === 'empezada' && regs[l.id]?.tramos > 1 ? Math.min(1, (regs[l.id].tramo ?? 0) / regs[l.id].tramos) : 0), 0);
  const clases = { total: estados.length, vistas: estados.filter((e) => e !== 'nueva').length, terminadas: estados.filter(terminada).length, aprendidas: estados.filter((e) => e === 'dominada').length, parcial };
  const alDia = estados.every(terminada) && hechas >= Math.min(total, OBJETIVO_TEMA);
  let estado = 'en-marcha';
  if (!hechas && !clases.vistas) estado = 'sin-empezar';
  else if (pct != null && pct >= 80) estado = 'bien';
  else if (pct != null && pct < 60) estado = 'repasar';
  return { hechas, total, aciertos, pct, clases, alDia, estado, fallos };
}

/**
 * Cuánto lleva hecho un tema camino de estar al día, de 0 a 1, con el mismo criterio que `alDia`: cada clase terminada
 * es una unidad y las preguntas hasta el objetivo, una más (una tanda de preguntas no pesa como varias clases).
 * Vale 1 si y solo si el tema está al día.
 */
export function parteTema(e) {
  const obj = Math.min(e.total, OBJETIVO_TEMA);
  const unidades = e.clases.total + (obj ? 1 : 0);
  return unidades ? (e.clases.terminadas + (e.clases.parcial ?? 0) + (obj ? Math.min(e.hechas, obj) / obj : 0)) / unidades : 1;
}

/** Avance global: temas al día y fracción media del camino hecho en cada tema (la barra llega al 100 % con todos al día). */
export function avance(estructura, curso, preguntas, regs = {}, respuestas = {}, ahora = Date.now()) {
  const es = estructura.bloques.map((b) => estadoTema(b, curso, preguntas, regs, respuestas, ahora));
  const parte = parteTema;
  return {
    temasAlDia: es.filter((e) => e.alDia).length,
    temasTotal: es.length,
    fraccion: es.length ? es.reduce((s, e) => s + parte(e), 0) / es.length : 0,
  };
}

/** Actividad «paso 4» para un tema que no está al día: clase a medias, clase nueva o tanda de preguntas. */
function actividadTema(b, est, curso, regs, respuestas, ahora, segTarjeta = SEG_TARJETA) {
  const clases = clasesDe(curso, b.ut).map((l) => ({ l, e: estadoLeccion(l, regs[l.id], respuestas, ahora).estado }));
  const empezada = clases.find((c) => c.e === 'empezada');
  const nueva = clases.find((c) => c.e === 'nueva');
  const c = empezada ?? nueva;
  if (c) {
    // Se propone un tramo de la clase (unos 5 minutos), no la clase entera.
    const nPasos = (c.l.pasos ?? []).filter((p) => !p.extra).length || 1;
    const k = numTramos(nPasos);
    const t = empezada ? Math.min(k - 1, regs[c.l.id]?.tramo ?? 0) : 0;
    return { tipo: 'clase', titulo: c.l.titulo, verbo: empezada ? 'Continuar' : 'Empezar', minutos: minutosDeTramo(c.l, segTarjeta),
      tramo: k > 1 ? { i: t + 1, de: k } : null, ruta: ['curso', c.l.id], query: undefined, ut: b.ut };
  }
  return { tipo: 'preguntas', titulo: `${est.hechas ? `${cuenta(TANDA, 'pregunta')} más` : `${cuenta(TANDA, 'pregunta')}`} de ${b.titulo}`, verbo: 'Empezar', minutos: MIN_TANDA, ruta: ['teoria', 'ut', String(b.ut)], query: undefined, ut: b.ut };
}

/**
 * Qué toca hoy, en orden (la [0] es la principal). Nunca vacía; como máximo 3 actividades.
 * @param {object} o  { estructura, curso, preguntas, regs, respuestas, tests, testEnCurso, fechaExamen, ahora }
 * @returns {{ tipo, titulo, verbo, minutos, ruta: string[], query?: object, ut: number|null }[]}
 */
export function planHoy({ estructura, curso = null, preguntas = [], regs = {}, respuestas = {}, tests = [], testEnCurso = null, fechaExamen = null, ultimoMezclado = null, segTarjeta = SEG_TARJETA, ahora = Date.now() }) {
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
  const repasos = bloquesEnOrden(estructura).flatMap((b) => clasesDe(curso, b.ut))
    .map((l) => ({ l, e: estadoLeccion(l, regs[l.id], respuestas, ahora) }))
    .filter((x) => x.e.estado === 'repasar')
    .sort((a, b) => (prioridad.has(b.l.ut) - prioridad.has(a.l.ut)) || ((a.e.proximo ?? 0) - (b.e.proximo ?? 0)))
    .slice(0, 2);
  for (const { l } of repasos) lista.push({ tipo: 'repaso', titulo: l.titulo, verbo: 'Repasar', minutos: MIN_TANDA, ruta: ['curso', l.id], query: { practica: '1' }, ut: l.ut });

  const estados = bloquesEnOrden(estructura).map((b) => ({ b, est: estadoTema(b, curso, preguntas, regs, respuestas, ahora) }));
  const pendientes = estados.filter((x) => !x.est.alDia);

  // 4. El primer tema que no está al día, en el orden de estudio recomendado
  if (pendientes[0]) lista.push(actividadTema(pendientes[0].b, pendientes[0].est, curso, regs, respuestas, ahora, segTarjeta));

  // 5. Repaso de fallos (B1) si se acumulan muchos para hoy; con pocos basta la línea de Hoy bajo la actividad.
  const cola = colaRepaso(preguntas, respuestas, hoy);
  if (cola.hoy.length >= UMBRAL_FALLOS) {
    lista.push({ tipo: 'fallos', titulo: `Repasar ${cuenta(cola.hoy.length, 'pregunta fallada', 'preguntas falladas')}`, verbo: 'Repasar', minutos: Math.min(MIN_TANDA, cola.minutosHoy), ruta: ['teoria', 'repaso'], query: undefined, ut: null });
  }

  // 6. Todo al día: simulacro
  if (!lista.length) lista.push(simulacro());

  // 6 bis. Repaso mezclado (una vez al día) en cuanto hay dos temas con preguntas hechas: varios temas a la vez.
  // Va detrás de lo principal (aprender lo nuevo o el simulacro), nunca en su lugar.
  const empezados = estados.filter((x) => x.est.hechas > 0);
  if (empezados.length >= 2 && ultimoMezclado !== hoy) {
    lista.push({ tipo: 'mezclado', titulo: `Repaso mezclado: ${cuenta(TANDA, 'pregunta')} de ${cuenta(empezados.length, 'tema')}`, verbo: 'Empezar', minutos: MIN_TANDA, ruta: ['teoria', 'mezcla'], query: undefined, ut: null });
  }

  // 7. Con una sola actividad, proponer también el siguiente tema pendiente
  if (lista.length === 1 && pendientes[1]) lista.push(actividadTema(pendientes[1].b, pendientes[1].est, curso, regs, respuestas, ahora, segTarjeta));

  return lista.slice(0, MAX_ACTIVIDADES);
}

export const SIMULACROS_RECOMENDADOS = 3;

/**
 * Días de estudio (contando hoy) para `pendientes` minutos a `md` al día. Solo depende de lo que queda: estudiar
 * nunca lo aumenta, así que la fecha nunca se aleja por estudiar (solo si se suman fallos al repaso, y entonces se
 * dice). Contar «lo que cabe hoy» la hacía bailar: no todo minuto estudiado reduce lo pendiente.
 */
export function diasPara(pendientes, md) {
  return Math.max(1, Math.ceil(pendientes / md));
}
const fechaISO = diaISO;

/**
 * ¿Llego a tiempo? Suma lo que le queda al plan (clases sin terminar, las tandas que faltan para tener cada tema al
 * día y los simulacros recomendados) y lo reparte a `minutosDia`.
 * @returns {{ minutosPendientes, diasNecesarios, fechaFin: string|null, diasDisponibles: number|null,
 *   llega: boolean|null, minutosNecesarios: number|null, desglose: { clases, preguntas, simulacros, repaso } }}
 */
export function ritmoEstudio({ estructura, curso = null, preguntas = [], regs = {}, respuestas = {}, tests = [], fechaExamen = null, minutosDia = 20, minutosHoy = 0, segTarjeta = SEG_TARJETA, ahora = Date.now() }) {
  let clases = 0;
  let tandas = 0;
  for (const b of estructura.bloques) {
    for (const l of clasesDe(curso, b.ut)) {
      const e = estadoLeccion(l, regs[l.id], respuestas, ahora).estado;
      if (e === 'nueva' || e === 'empezada') clases += minutosClase(l, segTarjeta);
    }
    const est = estadoTema(b, curso, preguntas, regs, respuestas, ahora);
    tandas += Math.ceil(Math.max(0, Math.min(est.total, OBJETIVO_TEMA) - est.hechas) / TANDA);
  }
  const hechos = tests.filter((t) => t.tipo === 'simulacro' || t.tipo === 'real').length;
  // El repaso de fallos también ocupa tiempo: cada pregunta de la cola, las veces que le faltan para salir.
  const repaso = colaRepaso(preguntas, respuestas, diaLocal(ahora)).minutosPendientes;
  const desglose = { clases, preguntas: tandas * MIN_TANDA, simulacros: Math.max(0, SIMULACROS_RECOMENDADOS - hechos) * estructura.duracionMin, repaso };
  const minutosPendientes = desglose.clases + desglose.preguntas + desglose.simulacros + desglose.repaso;
  const md = Math.max(5, minutosDia);
  const diasNecesarios = diasPara(minutosPendientes, md);
  // contando hoy como primer día de estudio
  const fechaFin = minutosPendientes ? fechaISO(ahora + Math.max(0, diasNecesarios - 1) * DIA) : null;
  const dias = fechaExamen ? diasHasta(fechaExamen, ahora) : null;
  const diasDisponibles = dias == null ? null : Math.max(0, dias); // hasta la víspera del examen
  const llega = diasDisponibles == null ? null : diasNecesarios <= diasDisponibles;
  const minutosNecesarios = diasDisponibles ? Math.ceil(minutosPendientes / diasDisponibles / 5) * 5 : null;
  return { minutosPendientes, diasNecesarios, fechaFin, diasDisponibles, llega, minutosNecesarios, desglose };
}

/**
 * La barra y el texto de avance dicen lo mismo: el porcentaje del camino (avanceCamino) y los pasos hechos. Con
 * `temasAlDia` (de `avance`) se añaden los temas listos.
 */
export function lineaAvance(a, racha = 0) {
  const pct = Math.round(a.fraccion * 100);
  const pasos = a.total != null ? `${a.hechos} de ${cuenta(a.total, 'paso')}` : null;
  const temas = a.temasTotal == null ? null : a.temasAlDia === a.temasTotal ? `todos los temas listos (${a.temasTotal})` : `${a.temasAlDia} de ${cuenta(a.temasTotal, 'tema listo', 'temas listos')}`;
  return `Llevas el ${pct} % del camino: ${[pasos, temas].filter(Boolean).join(' · ')}${racha >= 2 ? ` · ${cuenta(racha, 'día seguido', 'días seguidos')} estudiando` : ''}`;
}

export const MIN_DIAGNOSTICO = 3; // respuestas de una clase para opinar sobre ella

/**
 * Diagnóstico por clase (B5): de cada clase, sus preguntas de práctica (lección.practica) respondidas y acertadas
 * (última respuesta). Devuelve las clases flojas, las peores primero: acierto < 70 % con al menos MIN_DIAGNOSTICO
 * respondidas.
 * @returns {{ id, titulo, ut, hechas, aciertos, pct }[]}
 */
export function clasesFlojas(curso, respuestas = {}, { max = 6 } = {}) {
  const out = [];
  for (const m of curso?.modulos ?? []) {
    for (const l of m.lecciones) {
      const ids = (l.practica ?? []).filter((id) => respuestas[id]);
      if (ids.length < MIN_DIAGNOSTICO) continue;
      const aciertos = ids.filter((id) => respuestas[id].ok).length;
      const pct = Math.round((100 * aciertos) / ids.length);
      if (pct < 70) out.push({ id: l.id, titulo: l.titulo, ut: l.ut ?? m.ut, hechas: ids.length, aciertos, pct });
    }
  }
  return out.sort((a, b) => a.pct - b.pct || (b.hechas - b.aciertos) - (a.hechas - a.aciertos)).slice(0, max);
}

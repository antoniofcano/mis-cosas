// Antes y después del examen real (R-48, R-49, R-50). Funciones puras: el progreso entra como datos y la fecha como
// `ahora` (milisegundos). Lo que guardan va en el ajuste `semana_<tit>` (src/course/semana.js, compartido entre
// aparatos), así que no hace falta una colección nueva en el servidor de sincronización.
//
// 1. Fallos por materia (R-48): en tus últimos exámenes, cuántas fallaste en cada materia frente a su límite. Es el
//    mismo dato que «¿Estás listo?» usa con probabilidades, contado tal cual: «en Carta fallaste 2, 4 y 3; el límite
//    es 3». Cuentan los simulacros completos, los exámenes reales y el final, los simulacros por módulos y el ensayo en
//    papel, solo en las materias que traen completas (las mismas preguntas que en el examen). No cuentan el simulacro
//    de tus errores (está hecho de lo que fallas) ni las tandas.
//
// 2. La foto de la predicción y el resultado (R-49): en la semana del examen, cada día hasta la víspera, se guarda una
//    foto de lo que la app predice («¿estás listo?», margen, lo que más te puede tumbar y la media de fallos por
//    materia). Pasado el examen, el alumno puede apuntar cuántas falló en cada materia (con la plantilla) y se compara
//    con la foto: si fallaste donde la app decía que ibas justo. Es lo que permite calibrar el modelo con exámenes
//    reales (hoy sus umbrales son hipótesis).
//
// 3. Recuperar un módulo (R-50, solo titulaciones con módulos: el PY). Norma: el aprobado de un módulo se conserva
//    durante las dos convocatorias siguientes en que la misma administración examine de patrón de yate, y solo vale
//    ante ella (convocatoria de la DGMM para 2026, BOE-A-2026-510, anexo III C, de acuerdo con el RD 875/2014). Con un
//    módulo aprobado y el examen suspendido, «¿Estás listo?» y la semana del examen se centran en el módulo que queda.

import { diaISO, cuenta } from '../texto.js';
import { estructuraModulo } from '../theory/blocks.js';

export const ULTIMOS = 3; // exámenes que se miran por materia
export const TIPOS_EXAMEN = new Set(['simulacro', 'real', 'final', 'modulo', 'ensayo']);
export const DIAS_RESULTADO = 120; // días tras el examen en que se puede apuntar o cambiar el resultado
export const CONVOCATORIAS_CONSERVA = 2; // convocatorias siguientes en que se conserva un módulo aprobado

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const esObj = (x) => x != null && typeof x === 'object' && !Array.isArray(x);
const entero = (x, max) => (Number.isInteger(x) && x >= 0 && x <= max ? x : null);

// --- 1. fallos por materia -------------------------------------------------------------------------------------------

/**
 * Lo que se puede fallar en cada materia y en total. En el PY el genérico no tiene límite propio en el examen completo,
 * pero sí al corregir por módulos (5 y 5): se da como `limiteModulo`.
 */
export function limites(estructura) {
  const deModulo = new Map();
  for (const m of estructura.modulos ?? []) for (const [ut, x] of Object.entries(m.maxErrores ?? {})) deModulo.set(Number(ut), x);
  const total = estructura.bloques.reduce((s, b) => s + b.n, 0);
  return {
    total, maxTotal: total - estructura.minAciertos,
    materias: estructura.bloques.map((b) => ({ ut: b.ut, titulo: b.titulo, corto: b.corto ?? b.titulo, n: b.n, limite: b.maxErrores ?? null, limiteModulo: b.maxErrores == null ? deModulo.get(b.ut) ?? null : null })),
  };
}

/** Cómo vas frente a un límite con los fallos de tus últimos exámenes (el más reciente primero). */
export function estadoFrente(fallos, limite) {
  if (limite == null || !fallos.length) return null;
  const peor = Math.max(...fallos);
  if (peor > limite) return 'pasado';
  if (peor >= limite - 1) return 'justo';
  return 'holgado';
}

/**
 * Fallos por materia en tus últimos exámenes.
 * @param {object} estructura  del examen (o de un módulo: estructuraModulo)
 * @param {object[]} tests  los de la titulación y el banco (progress.tests() filtrados), del más antiguo al más nuevo
 * @returns {{ materias: { ut, titulo, corto, n, limite, limiteModulo, fallos: number[], media: number|null, estado }[],
 *   total: { limite: number, fallos: number[], media: number|null, estado }, examenes: number }}
 */
export function fallosPorMateria(estructura, tests = [], { max = ULTIMOS } = {}) {
  const L = limites(estructura);
  const xs = tests.filter((t) => TIPOS_EXAMEN.has(t.tipo) && Array.isArray(t.porTema));
  const media = (fs) => (fs.length ? Math.round((10 * fs.reduce((s, x) => s + x, 0)) / fs.length) / 10 : null);
  const materias = L.materias.map((m) => {
    const fallos = [];
    for (let i = xs.length - 1; i >= 0 && fallos.length < max; i--) {
      const p = xs[i].porTema.find((x) => x.ut === m.ut);
      if (p && p.total === m.n && Number.isFinite(p.aciertos)) fallos.push(p.total - p.aciertos);
    }
    return { ...m, fallos, media: media(fallos), estado: estadoFrente(fallos, m.limite ?? m.limiteModulo) };
  });
  // El total, solo con exámenes que traen todas las materias.
  const fallosTotal = [];
  for (let i = xs.length - 1; i >= 0 && fallosTotal.length < max; i--) {
    const ps = L.materias.map((m) => xs[i].porTema.find((x) => x.ut === m.ut && x.total === m.n));
    if (ps.every(Boolean)) fallosTotal.push(ps.reduce((s, p) => s + p.total - p.aciertos, 0));
  }
  const examenes = Math.max(fallosTotal.length, ...materias.map((m) => m.fallos.length), 0);
  return { materias, total: { limite: L.maxTotal, fallos: fallosTotal, media: media(fallosTotal), estado: estadoFrente(fallosTotal, L.maxTotal) }, examenes };
}

const lista = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}` : String(xs[0] ?? ''));
const ESTADO_TX = { holgado: 'vas holgado', justo: 'vas justo', pasado: 'te has pasado alguna vez' };

/** Una materia en una frase: «Carta: fallaste 2, 4 y 3 (el último primero); el límite es 3: te has pasado alguna vez». */
export function lineaMateria(m) {
  if (!m.fallos.length) return `${m.corto}: aún sin examen completo de esta materia.`;
  const lim = m.limite ?? m.limiteModulo;
  const fs = `fallaste ${lista(m.fallos)}${m.fallos.length > 1 ? ' (el más reciente primero)' : ''}`;
  if (lim == null) return `${m.corto}: ${fs}; no tiene límite propio, cuenta en el total.`;
  return `${m.corto}: ${fs}; el límite es ${lim}${m.limite == null ? ' si te examinas por módulos' : ''}: ${ESTADO_TX[m.estado]}.`;
}

/** Todo en texto (para copiar o para nautica.state()). */
export function textoFallos(r) {
  const t = r.total.fallos.length ? `Fallos en total: ${lista(r.total.fallos)}; como mucho ${r.total.limite}: ${ESTADO_TX[r.total.estado]}.` : null;
  return [...r.materias.map(lineaMateria), t].filter(Boolean).join('\n');
}

// --- 2. foto de la predicción y resultado ----------------------------------------------------------------------------

/**
 * La foto de lo que la app predice hoy.
 * @param {object} listo  estoyListo() (st.listo)
 * @param {ReturnType<typeof fallosPorMateria>} fm
 * @returns {{ dia, estado, prob, bajo, alto, limitante, materias: Record<number, number> }}
 */
export function fotoPrediccion(listo, fm, ahora) {
  const r = (x) => (Number.isFinite(x) ? Math.round(x * 100) / 100 : null);
  return {
    dia: diaISO(ahora),
    estado: listo?.estado ?? null,
    prob: r(listo?.prob), bajo: r(listo?.margen?.bajo), alto: r(listo?.margen?.alto),
    limitante: listo?.limitante?.ut ?? null,
    modulo: listo?.modulo ?? null,
    materias: Object.fromEntries(fm.materias.filter((m) => m.media != null).map((m) => [m.ut, m.media])),
  };
}

/** ¿Toca guardar la foto hoy? En la semana del examen, hasta la víspera, una vez al día (se queda la última). */
export function tocaFoto(fotos, fecha, dias, ahora) {
  if (!fecha || dias == null || dias < 1) return false;
  return fotos?.[fecha]?.dia !== diaISO(ahora);
}

/** La foto guardada, normalizada (o null si no vale). */
export function leerFoto(f) {
  if (!esObj(f) || !ISO.test(f.dia ?? '')) return null;
  const p = (x) => (typeof x === 'number' && x >= 0 && x <= 1 ? x : null);
  const materias = Object.fromEntries(Object.entries(esObj(f.materias) ? f.materias : {}).filter(([ut, x]) => /^\d+$/.test(ut) && typeof x === 'number' && x >= 0 && x <= 50));
  return { dia: f.dia, estado: typeof f.estado === 'string' ? f.estado : null, prob: p(f.prob), bajo: p(f.bajo), alto: p(f.alto),
    limitante: Number.isInteger(f.limitante) ? f.limitante : null, modulo: typeof f.modulo === 'string' ? f.modulo : null, materias };
}

/** El resultado apuntado, normalizado: { fallos: {ut: n}, modulo: 'generico'|'navegacion'|'ninguno'|null }. */
export function leerResultado(x, estructura = null) {
  if (!esObj(x)) return null;
  const n = new Map((estructura?.bloques ?? []).map((b) => [String(b.ut), b.n]));
  const fallos = Object.fromEntries(Object.entries(esObj(x.fallos) ? x.fallos : {})
    .filter(([ut, v]) => /^\d+$/.test(ut) && (!estructura || n.has(ut)) && entero(v, n.get(ut) ?? 50) != null));
  const ids = new Set((estructura?.modulos ?? []).map((m) => m.id));
  const modulo = x.modulo === 'ninguno' || (typeof x.modulo === 'string' && (!estructura || ids.has(x.modulo))) ? x.modulo : null;
  return { fallos, modulo };
}

/**
 * Con los fallos de cada materia, ¿qué módulos aprobaste? (cada módulo, si no pasas de sus límites por materia).
 * null si faltan fallos de alguna materia del módulo.
 */
export function modulosAprobados(estructura, fallos = {}) {
  if (!estructura.modulos?.length) return null;
  return estructura.modulos.map((m) => {
    const E = estructuraModulo(estructura, m.id);
    const ok = E.bloques.every((b) => fallos[b.ut] != null);
    return { id: m.id, titulo: m.titulo, aprobado: ok ? E.bloques.every((b) => fallos[b.ut] <= (b.maxErrores ?? b.n)) : null };
  });
}

/** ¿Aprobaste el examen completo con esos fallos? null si falta alguna materia. */
export function aptoCompleto(estructura, fallos = {}) {
  if (!estructura.bloques.every((b) => fallos[b.ut] != null)) return null;
  const total = estructura.bloques.reduce((s, b) => s + fallos[b.ut], 0);
  return total <= limites(estructura).maxTotal && estructura.bloques.every((b) => b.maxErrores == null || fallos[b.ut] <= b.maxErrores);
}

/**
 * La foto frente al resultado, materia a materia.
 * @returns {{ filas: { ut, corto, limite, previsto: number|null, real: number|null, avisada: boolean, pasada: boolean|null,
 *   acierto: boolean|null }[], prob: number|null, estado: string|null, dia: string|null, aciertos: number, comparables: number }}
 *   avisada: la foto decía que ibas justo o pasado (media a 1 o menos del límite); pasada: en el examen te pasaste.
 *   acierto: la app avisó donde te pasaste y no avisó donde no (null sin datos para comparar).
 */
export function compararPrediccion(estructura, foto, resultado) {
  const L = limites(estructura);
  const filas = L.materias.map((m) => {
    const lim = m.limite ?? m.limiteModulo;
    const previsto = foto?.materias?.[m.ut] ?? null;
    const real = resultado?.fallos?.[m.ut] ?? null;
    const avisada = lim != null && previsto != null && previsto >= lim - 1;
    const pasada = lim != null && real != null ? real > lim : null;
    const acierto = lim == null || previsto == null || real == null ? null : avisada === (real >= lim - 1);
    return { ut: m.ut, corto: m.corto, limite: lim, previsto, real, avisada, pasada, acierto };
  });
  const comparables = filas.filter((f) => f.acierto != null);
  return { filas, prob: foto?.prob ?? null, estado: foto?.estado ?? null, dia: foto?.dia ?? null, aciertos: comparables.filter((f) => f.acierto).length, comparables: comparables.length };
}

/** La comparación en texto, para copiar y enviar (sin datos personales: solo números). */
export function textoComparacion(sigla, fecha, fue, c, resultado) {
  const p = c.prob != null ? `${Math.round(c.prob * 10)} de cada 10` : 'sin datos';
  return [
    `Examen ${sigla} del ${fecha}: ${fue}.`,
    `Predicción del ${c.dia ?? '—'}: aprobarías ${p}${c.estado ? ` (${c.estado})` : ''}.`,
    ...c.filas.map((f) => `${f.corto} (fallos): previsto ${f.previsto == null ? '—' : String(f.previsto).replace('.', ',')} · real ${f.real ?? '—'}${f.limite != null ? ` · límite ${f.limite}` : ''}${f.acierto == null ? '' : f.acierto ? ' · la app acertó' : ' · la app no acertó'}`),
    resultado?.modulo ? `Módulo aprobado: ${resultado.modulo}.` : null,
  ].filter(Boolean).join('\n');
}

// --- 3. recuperar un módulo ------------------------------------------------------------------------------------------

/**
 * El módulo que te queda: el último examen con resultado «No aprobé» y un módulo aprobado (y el otro no), si no lo has
 * descartado («fuera») ni has apuntado después otro examen. null si no hay.
 * @param {object} ajuste  leerAjuste() del modo semana
 * @returns {{ id, titulo, aprobado: { id, titulo }, desde: string } | null}
 */
export function moduloPendiente(ajuste, estructura) {
  if (!estructura?.modulos?.length) return null;
  // El último examen del que se sabe el resultado manda: si después aprobaste (o volviste a suspender sin módulo), ya no queda.
  const f = Object.keys(ajuste?.fue ?? {}).filter((x) => ajuste.fue[x] === 'suspenso' || ajuste.fue[x] === 'aprobado').sort().at(-1);
  if (!f || ajuste.fue[f] !== 'suspenso' || ajuste.moduloFuera === f) return null;
  const r = leerResultado(ajuste.resultados?.[f], estructura);
  if (!r?.modulo || r.modulo === 'ninguno') return null;
  const aprobado = estructura.modulos.find((m) => m.id === r.modulo);
  const queda = estructura.modulos.filter((m) => m.id !== r.modulo);
  if (!aprobado || queda.length !== 1) return null;
  return { id: queda[0].id, titulo: queda[0].titulo, aprobado: { id: aprobado.id, titulo: aprobado.titulo }, desde: f };
}

/** Los exámenes de un módulo, con su apto de módulo como apto (para «¿Estás listo?» del módulo). */
export const testsDelModulo = (tests, id) => tests.filter((t) => t.tipo === 'modulo' && t.modulo === id).map((t) => ({ ...t, apto: t.aptoModulo ?? null }));

/** El aviso del módulo pendiente, en palabras. */
export function lineaModuloPendiente(p, sigla = 'PY') {
  const m = (t) => t.replace(/^Módulo/, 'módulo');
  return `Aprobaste el ${m(p.aprobado.titulo)}: te queda el ${m(p.titulo)}. Te guardan el aprobado ${cuenta(CONVOCATORIAS_CONSERVA, 'convocatoria')} de ${sigla} más, y solo en el tribunal donde te examinaste.`;
}

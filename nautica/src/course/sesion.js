// Sesión de estudio del día (pantalla Hoy y ejecutor #/<tit>/sesion). Funciones puras: reciben el estado del alumno
// que calcula el motor (src/course/motor.js) y devuelven la fase, los pasos de la sesión y su estado. No deciden qué
// toca: eso lo hacen planHoy (src/course/plan.js) y la cola de repaso (src/course/repaso.js); aquí solo se ordena y se
// agrupa lo que ya proponen en una sesión que se hace de un tirón.
//
//   fase      aprender (quedan temas por ver) · mezclar (temario visto) · comprobar (examen a ≤ 14 días o listo)
//   sesión    { pasos: [{ id, tipo, titulo, sub, minutos, ruta, query, ut }] } compuesta según la fase
//   estado    lo que se guarda en el progreso (ajuste sesion_<tit>): pasos con su estado, hora de inicio y fin

import { MIN_TANDA } from './plan.js';
import { MIN_POR_PREGUNTA } from './repaso.js';
import { cuenta, diaISO } from '../texto.js';

export const FASES = [
  { id: 'aprender', nombre: 'Aprender' },
  { id: 'mezclar', nombre: 'Mezclar' },
  { id: 'comprobar', nombre: 'Comprobar' },
];
export const DIAS_COMPROBAR = 14; // con el examen a estos días o menos, toca comprobar
const TANDA_REPASO = 10; // preguntas por tanda en el repaso de fallos (theory.js usa TANDA)

const PORQUE = {
  aprender: 'Aún te quedan temas por ver: cada día, una clase nueva y repaso de lo que vas fallando.',
  mezclar: 'Ya has visto todo el temario: ahora toca mezclar temas y atacar lo que más fallas.',
  comprobar: 'El examen está cerca: simulacros con las reglas reales y repaso de lo que falles.',
  comprobarListo: 'Con lo que aciertas ya aprobarías: toca comprobarlo con simulacros y, una vez, el examen final.',
};

/** ¿Ha visto el alumno este tema? Todas sus clases terminadas; un tema sin clases, con alguna pregunta hecha. */
export const temaVisto = (e) => (e.clases.total ? e.clases.terminadas >= e.clases.total : e.hechas > 0 || e.total === 0);

/**
 * La fase del alumno, deducida de su estado. La elige el estado, no el alumno: él puede mirar otra fase en Hoy, pero
 * su plan sigue siendo este.
 * @param {object} st  estado del motor (estadoAlumno)
 * @returns {{ id: 'aprender'|'mezclar'|'comprobar', detalle: string, porque: string, vistos: number, total: number, motivo: string }}
 */
export function deducirFase(st) {
  const temas = st.temas ?? [];
  const vistos = temas.filter((t) => temaVisto(t.e)).length;
  const total = temas.length;
  const dias = st.diasAlExamen;
  const cerca = dias != null && dias >= 0 && dias <= DIAS_COMPROBAR;
  const listo = st.listo?.estado === 'listo' || !!st.final?.sugerir;
  if (cerca || listo) {
    const detalle = cerca ? (dias === 0 ? 'El examen es hoy' : dias === 1 ? 'El examen es mañana' : `Faltan ${cuenta(dias, 'día')}`) : 'Estás listo';
    return { id: 'comprobar', detalle, porque: cerca ? PORQUE.comprobar : PORQUE.comprobarListo, vistos, total, motivo: cerca ? 'examen-cerca' : 'listo' };
  }
  if (vistos < total) return { id: 'aprender', detalle: `Llevas ${vistos} de ${cuenta(total, 'tema')}`, porque: PORQUE.aprender, vistos, total, motivo: 'temas-por-ver' };
  return { id: 'mezclar', detalle: 'Temario visto', porque: PORQUE.mezclar, vistos, total, motivo: 'temario-visto' };
}

/** Texto de cada fase cuando el alumno la mira sin estar en ella. */
export function textoFase(id, real) {
  if (id === real.id) return real;
  const base = { aprender: PORQUE.aprender, mezclar: PORQUE.mezclar, comprobar: PORQUE.comprobar }[id];
  const detalle = { aprender: `Llevas ${real.vistos} de ${cuenta(real.total, 'tema')}`, mezclar: real.vistos >= real.total ? 'Temario visto' : `Te faltan ${real.total - real.vistos} por ver`, comprobar: 'Cuando falten 14 días' }[id];
  return { ...real, id, detalle, porque: base };
}

// --- pasos -----------------------------------------------------------------------------------------------------------

const rutaClave = (ruta) => ruta.join('/');
const paso = (tipo, titulo, sub, minutos, a) => ({ id: `${tipo}:${rutaClave(a.ruta)}`, tipo, titulo, sub, minutos: Math.max(1, Math.round(minutos)), ruta: a.ruta, query: a.query, ut: a.ut ?? null });

/** Paso de repaso de fallos: las preguntas falladas que vuelven hoy (como mucho una tanda). */
function pasoFallos(st, titulo = 'Tus fallos') {
  const n = st.repaso?.hoy ?? 0;
  if (!n) return null;
  const k = Math.min(n, TANDA_REPASO);
  return paso('fallos', titulo, `${cuenta(k, 'pregunta que fallaste', 'preguntas que fallaste')}, otra vez`, Math.min(MIN_TANDA, Math.ceil(k * MIN_POR_PREGUNTA)),
    { ruta: ['teoria', 'repaso'], ut: null });
}

/** Una actividad de planHoy, como paso de la sesión. */
export function pasoDeActividad(a) {
  const tramo = a.tramo ? ` · tramo ${a.tramo.i} de ${a.tramo.de}` : '';
  switch (a.tipo) {
    case 'clase': return paso('clase', a.verbo === 'Continuar' ? 'Sigue la clase' : 'Clase nueva', `${a.titulo}${tramo}`, a.minutos, a);
    case 'preguntas': return paso('preguntas', 'Preguntas del tema', a.titulo, a.minutos, a);
    case 'repaso': return paso('repaso', 'Repaso de una clase', a.titulo, a.minutos, a);
    case 'chuleta': return paso('chuleta', 'Chuleta del tema', a.titulo, a.minutos, a);
    case 'mezclado': return paso('mezclado', 'Repaso mezclado', 'Temas ya vistos, revueltos', a.minutos, a);
    case 'fallos': return paso('fallos', 'Tus fallos', a.titulo, a.minutos, a);
    case 'simulacro': return paso('simulacro', 'Simulacro', 'Examen completo con las reglas reales', a.minutos, a);
    case 'final': return paso('final', 'Examen final', 'Preguntas reservadas que no has visto', a.minutos, a);
    case 'examen-en-curso': return paso('examen-en-curso', 'Examen a medias', `Te quedan unos ${cuenta(a.minutos, 'minuto')}`, a.minutos, a);
    default: return null;
  }
}

const APRENDER = new Set(['clase', 'preguntas', 'repaso', 'chuleta']);
const EXAMEN = new Set(['simulacro', 'final', 'examen-en-curso']);

/**
 * Los pasos de la sesión de hoy en una fase. La [0] es por donde se empieza. Nunca vacía si el motor propone algo.
 * @param {object} st  estado del motor
 * @param {'aprender'|'mezclar'|'comprobar'} fase
 * @param {{ objetivo?: number }} [o]  minutos al día (por defecto, los del alumno)
 */
export function componerSesion(st, fase, { objetivo = st.dia?.objetivo ?? 20 } = {}) {
  const acts = [st.principal, ...(st.actividades ?? []).slice(1)].filter(Boolean);
  const de = (tipos) => acts.filter((a) => tipos.has(a.tipo)).map(pasoDeActividad).filter(Boolean);
  const enCurso = de(new Set(['examen-en-curso']));
  const examen = de(new Set(['final', 'simulacro']));
  const aprender = de(APRENDER);
  const mezclado = de(new Set(['mezclado']));
  const fallosPlan = de(new Set(['fallos']));
  const fallos = pasoFallos(st, fase === 'aprender' ? 'Tus fallos' : fase === 'mezclar' ? 'Lo que más fallas' : 'Lo que has fallado') ?? fallosPlan[0] ?? null;
  // El tema más flojo (acierto < 70 %), en tanda de preguntas: lo que más conviene atacar cuando ya se ha visto todo.
  const flojo = st.flojos?.temas?.[0];
  const tandaFloja = flojo ? paso('preguntas', 'Tu tema más flojo', `${flojo.titulo}: aciertas el ${flojo.pct} %`, MIN_TANDA, { ruta: ['teoria', 'ut', String(flojo.ut)], ut: flojo.ut }) : null;

  let candidatos;
  if (fase === 'aprender') candidatos = [...enCurso, fallos, ...aprender.slice(0, 2), ...mezclado];
  else if (fase === 'mezclar') candidatos = [...enCurso, fallos, tandaFloja, ...aprender.filter((p) => p.tipo === 'repaso'), ...mezclado, ...aprender.filter((p) => p.tipo !== 'repaso')];
  else candidatos = [...enCurso, ...(enCurso.length ? [] : examen), fallos, ...aprender.slice(0, 1), ...mezclado];

  // Sin repetir una misma pantalla y, si no queda nada, lo que proponga el motor.
  const vistos = new Set();
  let pasos = candidatos.filter(Boolean).filter((p) => { const k = rutaClave(p.ruta); if (vistos.has(k)) return false; vistos.add(k); return true; });
  if (!pasos.length) pasos = acts.slice(0, 1).map(pasoDeActividad).filter(Boolean);

  // Lo que cabe en los minutos del día (con un margen): siempre el primero; tras un examen, como mucho un paso más.
  const presupuesto = Math.max(15, objetivo) + 5;
  const out = [];
  let min = 0;
  for (const p of pasos) {
    if (!out.length) { out.push(p); min += p.minutos; continue; }
    if (EXAMEN.has(out[0].tipo)) { if (out.length < 2 && !EXAMEN.has(p.tipo)) { out.push(p); min += p.minutos; } continue; }
    if (EXAMEN.has(p.tipo)) continue;
    if (min + p.minutos > presupuesto) continue;
    out.push(p);
    min += p.minutos;
  }
  return { fase, titulo: 'Sesión de hoy', minutos: out.reduce((s, p) => s + p.minutos, 0), pasos: out };
}

/** Lo que dice «Mañana»: los pasos que tocarían, en una línea. */
export function lineaManana(sesion, { fallosManana = 0 } = {}) {
  const pasos = sesion?.pasos ?? [];
  const t = pasos.map((p) => (p.tipo === 'clase' ? `${p.titulo.toLowerCase()}: ${p.sub}` : p.titulo.toLowerCase()));
  const base = t.length ? `${t[0][0].toUpperCase()}${t[0].slice(1)}${t.length > 1 ? `; después, ${t.slice(1).join(' y ')}` : ''}.` : 'Lo que proponga tu plan.';
  return fallosManana ? `${base} Vuelven ${cuenta(fallosManana, 'pregunta fallada', 'preguntas falladas')}.` : base;
}

// --- estado de una sesión en marcha --------------------------------------------------------------------------------

export const VERSION_SESION = 1;

/**
 * Sesión nueva a partir de la compuesta. `hrefs` (opcional) fija la dirección de cada paso (con su semilla, para que
 * al recargar salga la misma tanda).
 */
export function nuevaSesion(tit, sesion, { ahora = Date.now(), hrefs = [], minutosAntes = 0 } = {}) {
  return {
    v: VERSION_SESION, tit, fase: sesion.fase, dia: diaISO(ahora), inicio: ahora, fin: null, estado: 'en-curso', minutosAntes,
    pasos: sesion.pasos.map((p, i) => ({ ...p, href: hrefs[i] ?? null, estado: 'pendiente', inicio: null, fin: null })),
  };
}

/** ¿Es una sesión válida de hoy? Las de otro día (o con otro formato) se descartan. */
export function sesionDeHoy(s, ahora = Date.now()) {
  return !!s && s.v === VERSION_SESION && Array.isArray(s.pasos) && s.pasos.length > 0 && s.dia === diaISO(ahora) ? s : null;
}

/** Índice del paso por el que va (el primero pendiente) o -1 si ya no queda ninguno. */
export const indiceActual = (s) => (s?.pasos ?? []).findIndex((p) => p.estado === 'pendiente');
export const terminada = (s) => !!s && indiceActual(s) === -1;

const cambia = (s, i, cambios) => ({ ...s, pasos: s.pasos.map((p, j) => (j === i ? { ...p, ...cambios } : p)) });

/** Empieza (o retoma) el paso actual: la sesión pasa a «en curso» y el paso apunta cuándo empezó. */
export function arrancar(s, ahora = Date.now()) {
  const i = indiceActual(s);
  if (i < 0) return cerrar(s, ahora);
  const r = s.pasos[i].inicio ? s : cambia(s, i, { inicio: ahora });
  return { ...r, estado: 'en-curso' };
}

/** Marca hecho el paso i (si estaba pendiente). Idempotente: repetirlo no cambia nada. */
export function marcarHecho(s, i, ahora = Date.now()) {
  if (!s?.pasos[i] || s.pasos[i].estado !== 'pendiente') return s;
  return cambia(s, i, { estado: 'hecho', inicio: s.pasos[i].inicio ?? ahora, fin: ahora });
}

/** Salta el paso i (no se pudo o no se quiso hacer). */
export function saltar(s, i, ahora = Date.now()) {
  if (!s?.pasos[i] || s.pasos[i].estado !== 'pendiente') return s;
  return cambia(s, i, { estado: 'saltado', fin: ahora });
}

/** Parar: se guarda por dónde va y la sesión queda a medias (Hoy ofrece seguir). */
export const pausar = (s) => (s && s.estado === 'en-curso' ? { ...s, estado: 'pausada' } : s);

/** Cierra la sesión cuando ya no quedan pasos. */
export function cerrar(s, ahora = Date.now()) {
  if (!s || indiceActual(s) !== -1) return s;
  return s.estado === 'hecha' ? s : { ...s, estado: 'hecha', fin: ahora };
}

/**
 * ¿Esta dirección (partes del hash, con la titulación delante) es la del paso? Se compara el camino, no la consulta:
 * una tanda cambia de semilla y un simulacro la pone al empezar.
 */
export function rutaDelPaso(p, tit, parts) {
  const esperado = [tit, ...p.ruta];
  return parts.length === esperado.length && esperado.every((x, i) => String(x) === String(parts[i]));
}

/** Índice del paso de la sesión que corresponde a esta dirección (-1 si ninguno). */
export const pasoEnRuta = (s, parts) => (s?.pasos ?? []).findIndex((p) => rutaDelPaso(p, s.tit, parts));

/**
 * Resumen de la sesión: lo respondido desde que empezó (última respuesta de cada pregunta), agrupado por tema, y los
 * minutos. `respuestas` = progress.exams; `porId` = Map id → pregunta; `temaDe(ut)` → título del tema.
 */
export function resumenSesion(s, { respuestas = {}, porId = new Map(), temaDe = (ut) => `Tema ${ut}`, minutosHoy = 0, conceptoDe = null } = {}) {
  const desde = new Date(s.inicio).toISOString();
  const hasta = s.fin ? new Date(s.fin + 1000).toISOString() : null;
  const resp = Object.entries(respuestas).filter(([id, r]) => r?.t && r.t >= desde && (!hasta || r.t <= hasta) && porId.has(id));
  const grupos = new Map();
  for (const [id, r] of resp) {
    const q = porId.get(id);
    const c = conceptoDe?.(id) ?? null;
    const clave = c ? `c:${c}` : `t:${q.ut}`;
    const g = grupos.get(clave) ?? { nombre: c ?? temaDe(q.ut), bien: 0, total: 0 };
    g.total += 1;
    if (r.ok) g.bien += 1;
    grupos.set(clave, g);
  }
  const aciertos = resp.filter(([, r]) => r.ok).length;
  return {
    aciertos, total: resp.length,
    grupos: [...grupos.values()].sort((a, b) => (a.bien / a.total) - (b.bien / b.total) || b.total - a.total),
    hechos: s.pasos.filter((p) => p.estado === 'hecho').length, saltados: s.pasos.filter((p) => p.estado === 'saltado').length, pasos: s.pasos.length,
    minutos: Math.max(0, minutosHoy - (s.minutosAntes ?? 0)),
  };
}

// «La semana antes» (R-33): un repaso comprimido para los últimos días antes del examen. Lo que más cae y las ideas
// flojas del alumno, repartido día a día hasta la fecha. Funciones puras, sin DOM ni reloj propio: la fecha de hoy
// entra siempre como `ahora` (milisegundos) o `hoy` ('AAAA-MM-DD', día local), y el progreso entra como datos.
//
// 1. Prioridad de una idea (concepto del banco del tribunal del alumno; docs/CONCEPTOS.md):
//
//      prioridad = peso del tema × flojedad × frecuencia
//
//      peso del tema = (preguntas del tema en el examen / preguntas del examen) × límite
//                      límite = 2 − maxErrores / n si el tema tiene límite de fallos propio, y 1 si no: un tema con
//                      límite pesa entre 1,5 y 2 veces más, y más cuanto más estrecho es (PER: Balizamiento, 2 de 5 →
//                      1,6; RIPA, 5 de 10 → 1,5; Carta, 2 de 4 → 1,5 · PY: Teoría, 5 de 10 → 1,5; Carta, 3 de 10 → 1,7)
//      flojedad      = 1 − tasa, con la tasa suavizada del motor de conceptos, (aciertos + 1) / (vistas + 2), de la
//                      última respuesta a cada pregunta de la idea. Sin ver, 0,5; un fallo y nada más, 0,67; dominada
//                      (3 de 3), 0,2
//      frecuencia    = convocatorias del banco en que sale la idea / convocatorias del banco (solo preguntas que se
//                      estudian: nada reservado para el examen final cuenta ni se nombra)
//
//    Sin etiquetas de conceptos, lo mismo por tema: peso del tema × (1 − tasa suavizada del tema) (frecuencia 1).
//
// 2. Reparto por días (k = días que faltan; hoy es k = dias):
//      k = 0   el examen: nada que estudiar, un mensaje de ánimo
//      k = 1   la víspera: NADA NUEVO; el repaso exprés de 15 minutos (las trampas de los temas con límite de fallos,
//              src/course/vispera.js, #/<tit>/vispera) o, sin él, un repaso corto (tarjetas o la chuleta); y descanso
//      k = 2   repaso ligero: tarjetas, la chuleta del tema con límite más flojo y una tanda de carta
//      k ≥ 3   los días «de trabajo»: ideas flojas (lo que más pesa y más cae, en orden de prioridad), y el simulacro
//              completo (en el PY, por módulos si el alumno estudia menos minutos al día de lo que dura el examen)
//              colocado para que quede un día después para repasar sus fallos. Si no cabe ese día, el repaso de sus
//              fallos entra en el repaso ligero.
//    Saltarse un día no castiga: el plan se rehace cada día con lo que queda (el simulacro que no se hizo pasa al día
//    siguiente que pueda; lo que no cabe se queda fuera, sin reproches). Lo hecho se lee del progreso: los exámenes
//    de la semana (simulacros, módulos, examen final) y los días hechos que guarda el ajuste `semana_<tit>`.
//
// 3. El modo: se activa solo con la fecha del examen (no orientativa) a 7 días o menos; a mano, eligiendo cuántos
//    días quedan (de 1 a 7). Se puede salir. Pasada la fecha se apaga solo y pregunta, sin obligar, cómo fue.

import { diasHasta, MIN_TANDA } from './plan.js';
import { MIN_POR_PREGUNTA } from './repaso.js';
import { sumaDiasISO } from './calendario.js';
import { temaDeIdea } from './listo.js';
import { totalPreguntas } from '../theory/blocks.js';
import { cuenta, diaISO } from '../texto.js';
import { leerFoto, leerResultado } from './tras-examen.js';

export const DIAS_MODO = 7; // con el examen a estos días o menos, el modo se activa solo
export const DIAS_PREGUNTAR = 14; // días tras el examen en que se pregunta cómo fue
export const IDEAS_POR_TANDA = 4; // ideas en cada tanda de ideas flojas
export const TANDA_IDEAS = 10; // preguntas por tanda de ideas
export const MAX_TANDAS_DIA = 3;
export const POR_IDEA = 3; // preguntas por idea, como mucho, en una tanda
export const MIN_TARJETAS = 5; // minutos de una tanda de tarjetas
export const MIN_CHULETA = 5; // minutos de releer la chuleta de un tema
export const TIPOS_DIA = ['ideas', 'simulacro', 'repaso-simulacro', 'ligero', 'vispera', 'examen'];
export const RESPUESTAS_FUE = { aprobado: 'Aprobé', suspenso: 'No aprobé', 'no-se': 'Aún no lo sé', omitido: 'Prefiero no decirlo' };

/** Clave del ajuste (compartido entre aparatos: prefijo `semana_` en src/store/sync/operaciones.js). */
export const claveSemana = (tit) => `semana_${tit}`;

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const esObj = (x) => x != null && typeof x === 'object' && !Array.isArray(x);

/**
 * El ajuste guardado, normalizado: { manual, fuera, hechos, fue }.
 *   manual  'AAAA-MM-DD': fecha del examen elegida a mano (activa el modo sin fecha en Ajustes), o null
 *   fuera   'AAAA-MM-DD': fecha del examen para la que el alumno salió del modo (no se vuelve a activar solo), o null
 *   hechos  { 'AAAA-MM-DD': tipo de día } los días del plan que hizo
 *   fue     { 'AAAA-MM-DD': 'aprobado'|'suspenso'|'no-se'|'omitido' } lo que contestó sobre ese examen
 */
export function leerAjuste(v) {
  const a = esObj(v) ? v : {};
  const fechas = (o, ok) => Object.fromEntries(Object.entries(esObj(o) ? o : {}).filter(([f, x]) => ISO.test(f) && ok(x)));
  return {
    manual: ISO.test(a.manual ?? '') ? a.manual : null,
    fuera: ISO.test(a.fuera ?? '') ? a.fuera : null,
    hechos: fechas(a.hechos, (x) => TIPOS_DIA.includes(x)),
    fue: fechas(a.fue, (x) => Object.hasOwn(RESPUESTAS_FUE, x)),
    // Antes y después del examen real (src/course/tras-examen.js): la foto de la predicción, el resultado apuntado y el
    // examen cuyo módulo pendiente se descartó.
    fotos: Object.fromEntries(Object.entries(esObj(a.fotos) ? a.fotos : {}).filter(([f]) => ISO.test(f)).map(([f, x]) => [f, leerFoto(x)]).filter(([, x]) => x)),
    resultados: Object.fromEntries(Object.entries(esObj(a.resultados) ? a.resultados : {}).filter(([f]) => ISO.test(f)).map(([f, x]) => [f, leerResultado(x)]).filter(([, x]) => x)),
    moduloFuera: ISO.test(a.moduloFuera ?? '') ? a.moduloFuera : null,
  };
}

const MAX_GUARDADOS = 6; // exámenes de los que se guardan foto y resultado
const ultimos = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)).slice(-MAX_GUARDADOS));

/** Guarda la foto de la predicción para el examen de `fecha` (sustituye la de un día anterior). */
export function guardarFoto(ajuste, fecha, foto) {
  const a = leerAjuste(ajuste);
  const f = leerFoto(foto);
  if (!ISO.test(fecha ?? '') || !f) return a;
  return { ...a, fotos: ultimos({ ...a.fotos, [fecha]: f }) };
}

/** Apunta (o cambia) el resultado del examen de `fecha`: fallos por materia y módulo aprobado. */
export function apuntarResultado(ajuste, fecha, resultado) {
  const a = leerAjuste(ajuste);
  const r = leerResultado(resultado);
  if (!ISO.test(fecha ?? '') || !r) return a;
  return { ...a, resultados: ultimos({ ...a.resultados, [fecha]: r }), moduloFuera: a.moduloFuera === fecha ? null : a.moduloFuera };
}

/** Deja de centrarse en el módulo pendiente del examen de `fecha`. */
export const descartarModulo = (ajuste, fecha) => ({ ...leerAjuste(ajuste), moduloFuera: ISO.test(fecha ?? '') ? fecha : null });

/**
 * ¿Está el modo activo hoy, y con qué fecha?
 * @param {{ ajuste?: object, fechaExamen?: string|null, orientativa?: boolean, ahora?: number }} p
 * @returns {{ activo: boolean, modo: 'auto'|'manual'|null, fecha: string|null, dias: number|null, examenHoy: boolean,
 *   salido: boolean, preguntar: { fecha: string } | null, diasExamen: number|null }}
 *   `salido`: la fecha del examen está a 7 días o menos pero el alumno salió del modo (se le ofrece volver).
 *   `preguntar`: el examen ya pasó (hace 14 días o menos) y aún no ha dicho cómo fue.
 */
export function estadoModo({ ajuste = null, fechaExamen = null, orientativa = false, ahora }) {
  const a = leerAjuste(ajuste);
  const dManual = a.manual ? diasHasta(a.manual, ahora) : null;
  const dExamen = fechaExamen ? diasHasta(fechaExamen, ahora) : null;
  const enVentana = (d) => d != null && d >= 0 && d <= DIAS_MODO;
  let modo = null;
  let fecha = null;
  if (a.manual && dManual >= 0) { modo = 'manual'; fecha = a.manual; }
  else if (!orientativa && enVentana(dExamen) && a.fuera !== fechaExamen) { modo = 'auto'; fecha = fechaExamen; }
  const dias = fecha ? diasHasta(fecha, ahora) : null;
  // Pasada la fecha: la manual vencida o la del examen (si no era orientativa), una sola vez y sin obligar.
  const pasada = [a.manual, orientativa ? null : fechaExamen].filter(Boolean)
    .find((f) => { const d = diasHasta(f, ahora); return d < 0 && d >= -DIAS_PREGUNTAR && !a.fue[f]; }) ?? null;
  return {
    activo: !!modo, modo, fecha, dias, examenHoy: dias === 0,
    salido: !modo && !orientativa && enVentana(dExamen) && a.fuera === fechaExamen,
    preguntar: modo ? null : pasada ? { fecha: pasada } : null,
    diasExamen: dExamen,
  };
}

// --- cambios del ajuste (devuelven el ajuste nuevo; la interfaz lo guarda con progress.setSetting) ---------------------

/** Activar a mano: quedan `dias` (1–7) hasta el examen, contando hoy. */
export function activarManual(ajuste, dias, ahora) {
  const n = Math.max(1, Math.min(DIAS_MODO, Math.round(Number(dias) || 1)));
  return { ...leerAjuste(ajuste), manual: sumaDiasISO(diaISO(ahora), n), fuera: null };
}

/** Salir del modo: el manual se borra; el automático no vuelve a activarse solo para esta fecha. */
export function salirDelModo(ajuste, { modo, fecha }) {
  const a = leerAjuste(ajuste);
  return modo === 'manual' ? { ...a, manual: null } : { ...a, fuera: fecha ?? a.fuera };
}

/** Volver al modo tras salir. */
export const volverAlModo = (ajuste) => ({ ...leerAjuste(ajuste), fuera: null });

/** Apunta un día del plan como hecho (y olvida los de hace más de 30 días). */
export function apuntarHecho(ajuste, fecha, tipo) {
  const a = leerAjuste(ajuste);
  if (!ISO.test(fecha) || !TIPOS_DIA.includes(tipo) || a.hechos[fecha] === tipo) return a;
  const limite = sumaDiasISO(fecha, -30);
  return { ...a, hechos: Object.fromEntries([...Object.entries(a.hechos).filter(([f]) => f >= limite), [fecha, tipo]]) };
}

/** Lo que contestó sobre cómo fue el examen de esa fecha (o 'omitido' si cerró la pregunta). El manual se apaga. */
export function responderComoFue(ajuste, fecha, respuesta) {
  const a = leerAjuste(ajuste);
  const r = Object.hasOwn(RESPUESTAS_FUE, respuesta) ? respuesta : 'omitido';
  return { ...a, manual: a.manual === fecha ? null : a.manual, fue: { ...a.fue, [fecha]: r } };
}

// --- prioridad ---------------------------------------------------------------------------------------------------------

/** Factor del límite de fallos de un tema: 2 − maxErrores / n con límite, 1 sin él. */
export const factorLimite = (b) => (b?.maxErrores != null && b.n > 0 ? 2 - b.maxErrores / b.n : 1);

/** Peso de un tema en el examen: su parte de las preguntas por el factor de su límite de fallos. */
export const pesoTema = (b, total) => (b && total ? (b.n / total) * factorLimite(b) : 0);

/** Convocatorias en que sale una pregunta (las del examen y las de sus duplicados). */
const convsDe = (q) => [q.conv, ...(q.apareceEn ?? []).map((x) => x.conv)].filter(Boolean);

/**
 * Prioridad de una idea. Ver la fórmula arriba.
 * @param {{ b: object, total: number, tasa: number|null, convs: number, convsTotal: number }} p
 */
export function prioridadIdea({ b, total, tasa = null, convs = 0, convsTotal = 0 }) {
  const flojedad = 1 - (tasa ?? 0.5);
  const frecuencia = convsTotal ? Math.min(1, convs / convsTotal) : 0;
  return pesoTema(b, total) * flojedad * frecuencia;
}

const estadoDe = (d) => (!d?.vistas ? 'sin-ver' : d.estado === 'flojo' ? 'floja' : d.estado === 'dominado' ? 'dominada' : 'en-progreso');

/**
 * Las ideas del banco del alumno con su prioridad, de más a menos. Solo ideas (conceptos, no grupos) con alguna pregunta
 * que se practica (`preguntas` = banco.practica: sin reservadas para el examen final, anuladas ni retiradas).
 * @param {{ ic: object, estructura: object, preguntas: object[], respuestas?: object, reservadas?: Set<string> }} p
 * @returns {{ id, etiqueta, ut, tema, conLimite, peso, flojedad, frecuencia, convs, prioridad, estado, vistas, tasa }[]}
 */
export function ideasPriorizadas({ ic, estructura, preguntas = [], respuestas = {}, reservadas = new Set() }) {
  if (!ic) return [];
  const enPractica = new Set(preguntas.filter((q) => !reservadas.has(q.id)).map((q) => q.id));
  const convsTotal = new Set(preguntas.filter((q) => enPractica.has(q.id)).flatMap(convsDe)).size;
  const total = totalPreguntas(estructura);
  const bloques = new Map(estructura.bloques.map((b) => [b.ut, b]));
  const dom = ic.dominio(respuestas);
  const out = [];
  for (const c of ic.conceptosConPreguntas()) {
    if (c.tipo !== 'concepto') continue;
    const qs = ic.preguntasDe(c.id, { soloEstudio: true, conDescendientes: false }).filter((q) => enPractica.has(q.id));
    if (!qs.length) continue;
    const ut = temaDeIdea(ic, c.id);
    const b = bloques.get(ut);
    if (!b) continue;
    const d = dom[c.id];
    const tasa = d?.vistas ? d.tasa : null;
    const convs = new Set(qs.flatMap(convsDe)).size;
    out.push({
      id: c.id, etiqueta: c.etiqueta, ut, tema: b.titulo, conLimite: b.maxErrores != null,
      peso: pesoTema(b, total), flojedad: 1 - (tasa ?? 0.5), frecuencia: convsTotal ? convs / convsTotal : 0, convs,
      prioridad: prioridadIdea({ b, total, tasa, convs, convsTotal }), estado: estadoDe(d), vistas: d?.vistas ?? 0, tasa,
    });
  }
  return out.sort((a, b) => b.prioridad - a.prioridad || a.etiqueta.localeCompare(b.etiqueta, 'es'));
}

/**
 * Los temas con su prioridad (sin etiquetas de conceptos): peso del tema × (1 − tasa suavizada del tema).
 * @returns {{ ut, titulo, conLimite, peso, tasa, prioridad }[]}
 */
export function temasPriorizados({ estructura, preguntas = [], respuestas = {}, reservadas = new Set() }) {
  const total = totalPreguntas(estructura);
  return estructura.bloques.map((b) => {
    const hechas = preguntas.filter((q) => q.ut === b.ut && !reservadas.has(q.id) && !q.anulada && q.correcta && typeof respuestas[q.id]?.ok === 'boolean');
    const bien = hechas.filter((q) => respuestas[q.id].ok).length;
    const tasa = (bien + 1) / (hechas.length + 2);
    return { ut: b.ut, titulo: b.titulo, conLimite: b.maxErrores != null, peso: pesoTema(b, total), tasa, prioridad: pesoTema(b, total) * (1 - tasa) };
  }).sort((a, b) => b.prioridad - a.prioridad || a.ut - b.ut);
}

/**
 * Tus ideas más flojas, para la vista de la semana: las flojas por prioridad (como mucho `max`); si hay menos de `min`,
 * se completan con las de más prioridad aún sin ver (y se dice).
 */
export function ideasFlojas(ideas = [], { min = 5, max = 10 } = {}) {
  const flojas = ideas.filter((i) => i.estado === 'floja').slice(0, max);
  if (flojas.length >= min) return flojas;
  return [...flojas, ...ideas.filter((i) => i.estado === 'sin-ver').slice(0, min - flojas.length)];
}

/**
 * Las preguntas de una tanda de ideas: de cada idea, como mucho `porIdea`, por turnos hasta `limite`. Solo preguntas que
 * se practican (`enPractica`) y nunca reservadas para el examen final. En cada idea, primero las falladas (las más
 * antiguas antes), luego las no vistas y luego las acertadas (las más antiguas antes); las respondidas hoy, al final.
 * Con `rng` ({ shuffle }) se barajan antes de ordenar (a igual nivel, al azar).
 */
export function tandaDeIdeas({ ic, ideas = [], respuestas = {}, rng = null, limite = TANDA_IDEAS, porIdea = POR_IDEA, hoy = null, enPractica = null, reservadas = new Set() }) {
  if (!ic) return [];
  const nivel = (q) => {
    const r = respuestas[q.id];
    if (!r || typeof r.ok !== 'boolean') return 1;
    if (hoy && String(r.t ?? '').slice(0, 10) === hoy) return 3;
    return r.ok ? 2 : 0;
  };
  const usadas = new Set();
  const colas = ideas.map((id) => {
    let qs = ic.preguntasDe(id, { soloEstudio: true, conDescendientes: false }).filter((q) => !reservadas.has(q.id) && (!enPractica || enPractica.has(q.id)));
    if (rng) qs = rng.shuffle(qs);
    return qs.map((q, i) => ({ q, i, n: nivel(q), t: String(respuestas[q.id]?.t ?? '') }))
      .sort((a, b) => a.n - b.n || a.t.localeCompare(b.t) || a.i - b.i).map((x) => x.q);
  });
  const out = [];
  const tomadas = colas.map(() => 0);
  for (let vuelta = 0; out.length < limite && vuelta < porIdea; vuelta++) {
    for (let k = 0; k < colas.length && out.length < limite; k++) {
      const q = colas[k].find((x) => !usadas.has(x.id));
      if (!q || tomadas[k] > vuelta) continue;
      usadas.add(q.id);
      tomadas[k] += 1;
      out.push(q);
    }
  }
  return out;
}

// --- el plan día a día -----------------------------------------------------------------------------------------------

const paso = (tipo, titulo, sub, minutos, ruta, query = undefined, ut = null) => ({ id: `${tipo}:${ruta.join('/')}`, tipo, titulo, sub, minutos: Math.max(1, Math.round(minutos)), ruta, query, ut });
const nombres = (xs, max = 3) => { const ys = xs.slice(0, max); const r = xs.length - ys.length; return `${ys.join(' · ')}${r > 0 ? ` y ${r} más` : ''}`; };
// Primera letra en minúscula dentro de una frase, salvo siglas y abreviaturas cortas («Ct por enfilación» se queda).
const enFrase = (t) => (/^\p{Lu}\p{Ll}{2,}/u.test(t ?? '') ? t[0].toLowerCase() + t.slice(1) : t ?? '');
const EXAMEN_COMPLETO = new Set(['simulacro', 'real', 'final']);
const diaDe = (t) => (t?.t ? diaISO(Date.parse(t.t)) : null);

/** Módulos en el orden en que se hacen: primero el que tiene temas con límite de fallos (en el PY, el de navegación). */
function ordenModulos(estructura) {
  const conLimite = (m) => estructura.bloques.some((b) => m.uts.includes(b.ut) && b.maxErrores != null);
  return [...(estructura.modulos ?? [])].sort((a, b) => conLimite(b) - conLimite(a));
}

/**
 * Lo hecho esta semana con los exámenes: simulacros completos (o el examen final, o un examen real) y módulos.
 * @returns {{ completo: boolean, modulos: Set<string>, ultimo: string|null }}  `ultimo`: día del último examen
 */
export function examenesDeLaSemana(tests = [], { desde, hasta }) {
  const xs = tests.filter((t) => { const d = diaDe(t); return d && d >= desde && d <= hasta; });
  const sims = xs.filter((t) => EXAMEN_COMPLETO.has(t.tipo) || t.tipo === 'modulo');
  return {
    completo: xs.some((t) => EXAMEN_COMPLETO.has(t.tipo)),
    modulos: new Set(xs.filter((t) => t.tipo === 'modulo' && t.modulo).map((t) => t.modulo)),
    ultimo: sims.map(diaDe).sort().at(-1) ?? null,
  };
}

/**
 * Los tipos de día de hoy (k = dias) al examen (k = 0), con lo que queda por hacer. Ver el reparto arriba.
 * @param {{ dias: number, simulacros: string[], repasoPendiente: boolean, hoyFijo?: string|null }} p
 *   simulacros: los exámenes que faltan, en orden ('completo', 'final' o el id de cada módulo)
 *   hoyFijo: el tipo de hoy si ya está decidido (hecho hoy)
 * @returns {{ k: number, tipo: string, examen?: string, conRepaso?: boolean }[]}
 */
export function repartoDias({ dias, simulacros = [], repasoPendiente = false, hoyFijo = null }) {
  const d = Math.max(0, Math.min(DIAS_MODO, Math.round(dias)));
  const out = new Map([[0, { tipo: 'examen' }]]);
  if (d >= 1) out.set(1, { tipo: 'vispera' });
  if (d >= 2) out.set(2, { tipo: 'ligero' });
  const activos = []; // los días de trabajo, de hoy hacia el examen
  for (let k = d; k >= 3; k--) activos.push(k);
  if (hoyFijo && activos[0] === d && TIPOS_DIA.includes(hoyFijo) && !['vispera', 'ligero', 'examen'].includes(hoyFijo)) out.set(activos.shift(), { tipo: hoyFijo });
  let repasoAlLigero = false;
  if (repasoPendiente && !simulacros.length) {
    // El simulacro ya está hecho y falta repasar sus fallos: el primer día que quede.
    if (activos.length) out.set(activos.shift(), { tipo: 'repaso-simulacro' });
    else repasoAlLigero = true;
  }
  const m = activos.length;
  if (simulacros.length && m >= simulacros.length + 1) {
    // Los exámenes justo antes del último día de trabajo, que repasa sus fallos.
    const ini = m - 1 - simulacros.length;
    simulacros.forEach((s, i) => out.set(activos[ini + i], { tipo: 'simulacro', examen: s }));
    out.set(activos[m - 1], { tipo: 'repaso-simulacro' });
  } else if (simulacros.length && m) {
    // No queda un día para repasar sus fallos: los exámenes que quepan, al final, y su repaso en el repaso ligero.
    const caben = simulacros.slice(0, m);
    caben.forEach((s, i) => out.set(activos[m - caben.length + i], { tipo: 'simulacro', examen: s }));
    repasoAlLigero = true;
  }
  for (const k of activos) if (!out.has(k)) out.set(k, { tipo: 'ideas' });
  if (repasoAlLigero && out.has(2)) out.set(2, { ...out.get(2), conRepaso: true });
  return [...out.entries()].sort((a, b) => b[0] - a[0]).map(([k, x]) => ({ ...x, k }));
}

const TEXTO = {
  ideas: 'Lo que más cae en tu examen y más te cuesta, idea a idea.',
  simulacro: 'Un examen entero con las reglas reales, de un tirón y sin ayudas.',
  modulo: 'Un módulo del examen con su tiempo real, de un tirón y sin ayudas.',
  final: 'Tu examen final: preguntas reservadas que no has visto nunca, con las reglas reales.',
  'repaso-simulacro': 'Lo que fallaste en el simulacro vuelve con otra pregunta; después, ideas flojas.',
  ligero: 'Un repaso ligero: tarjetas, la chuleta de un tema y unas preguntas de carta para no perder la mano.',
  vispera: 'Hoy, nada nuevo. Un repaso corto de lo que ya sabes y a descansar: dormir bien cuenta tanto como una tanda.',
  'vispera-expres': 'Hoy, nada nuevo. Una sola lectura tranquila, de unos 15 minutos, con las trampas de tus temas con límite de fallos; prepara tu lista del examen y a descansar: dormir bien cuenta tanto como una tanda.',
  examen: 'Hoy no hay tarea. Lee cada pregunta despacio, deja para el final las que dudes y confía en lo que has preparado. Buena travesía.',
};

/**
 * El plan de la semana: de hoy al examen, qué toca cada día, sus pasos (los de una sesión, src/course/sesion.js) y sus
 * minutos. Hoy es `dias[0]`.
 * @param {object} p
 * @param {object} p.estructura  la del examen (theory/blocks.js)
 * @param {number} p.dias  días que faltan (0–7)
 * @param {string} p.hoy  'AAAA-MM-DD' (día local)
 * @param {string} p.fecha  fecha del examen 'AAAA-MM-DD'
 * @param {number} [p.minutosDia]  los minutos al día del alumno
 * @param {object[]} [p.ideas]  ideasPriorizadas (vacío sin etiquetas)
 * @param {object[]} [p.temas]  temasPriorizados (para el banco sin etiquetas y la chuleta)
 * @param {number} [p.fallosHoy]  preguntas (o ideas) que vuelven hoy al repaso de fallos
 * @param {number} [p.tarjetasHoy]  tarjetas que tocan hoy
 * @param {{ id: string, titulo: string }|null} [p.mazo]  mazo de tarjetas para cuando no toca ninguna
 * @param {number|null} [p.cartaUt]  tema de carta de la titulación (null si no tiene)
 * @param {object[]} [p.tests]  exámenes hechos de esta titulación y este banco
 * @param {object} [p.hechos]  días hechos (ajuste)
 * @param {boolean} [p.finalSugerido]  el examen final está abierto y toca (estadoFinal().sugerir): el simulacro es él
 * @param {{ minutos: number }|null} [p.repasoExpres]  con él, el paso de la víspera es el repaso exprés (#/<tit>/vispera, de
 *   `minutos` minutos); sin él, el repaso corto de siempre (tarjetas o chuleta)
 * @param {string|null} [p.soloModulo]  id del módulo que queda, si ya aprobaste el otro: el simulacro es solo ese
 * @returns {{ dias: object[], simulacro: { hecho: boolean, pendientes: string[] }, porModulos: boolean }}
 */
export function planSemana({ estructura, dias, hoy, fecha, minutosDia = 20, ideas = [], temas = [], fallosHoy = 0, tarjetasHoy = 0, mazo = null, cartaUt = null, tests = [], hechos = {}, finalSugerido = false, repasoExpres = null, soloModulo = null }) {
  const d = Math.max(0, Math.min(DIAS_MODO, Math.round(dias)));
  const inicio = sumaDiasISO(fecha, -DIAS_MODO);
  const ex = examenesDeLaSemana(tests, { desde: inicio, hasta: hoy });
  // Con un módulo ya aprobado (src/course/tras-examen.js, moduloPendiente), el simulacro es solo el del que queda.
  const solo = soloModulo && (estructura.modulos ?? []).some((m) => m.id === soloModulo) ? soloModulo : null;
  const modulos = ordenModulos(estructura).filter((m) => !solo || m.id === solo);
  const porModulos = !!solo || (!finalSugerido && modulos.length > 1 && minutosDia < estructura.duracionMin);
  const simHecho = (!solo && ex.completo) || (porModulos && modulos.every((m) => ex.modulos.has(m.id)));
  const pendientes = simHecho ? [] : finalSugerido && !solo ? ['final'] : porModulos ? modulos.filter((m) => !ex.modulos.has(m.id)).map((m) => m.id) : ['completo'];
  // El repaso del simulacro: hecho el examen, falta un día de repaso hecho después (hoy no, si el examen fue hoy).
  const repasoHecho = !!ex.ultimo && Object.entries(hechos).some(([f, t]) => (t === 'repaso-simulacro' || t === 'ligero') && f > ex.ultimo);
  const repasoPendiente = simHecho && !!ex.ultimo && !repasoHecho && ex.ultimo < hoy;
  // Hoy, si ya se hizo (un día del plan o un examen de hoy), se queda como está.
  const hoyFijo = hechos[hoy] ?? (ex.ultimo === hoy && d >= 3 ? 'simulacro' : null);
  const reparto = repartoDias({ dias: d, simulacros: hoyFijo === 'simulacro' ? [] : pendientes, repasoPendiente: hoyFijo === 'simulacro' ? false : repasoPendiente, hoyFijo });
  // Tras un examen hecho hoy, el día de después repasa sus fallos.
  if (hoyFijo === 'simulacro' && simHecho) { const sig = reparto.find((x) => x.k === d - 1); if (sig?.tipo === 'ideas') sig.tipo = 'repaso-simulacro'; else if (sig?.tipo === 'ligero') sig.conRepaso = true; }

  // Las ideas se reparten sin repetir, en orden de prioridad (las dominadas al final; si se acaban, vuelta a empezar).
  const lista = ideas.length ? [...ideas.filter((i) => i.estado !== 'dominada'), ...ideas.filter((i) => i.estado === 'dominada')] : [];
  let cursor = 0;
  const siguientesIdeas = (n) => {
    if (!lista.length) return [];
    const xs = [];
    for (let i = 0; i < n && i < lista.length; i++) { xs.push(lista[cursor % lista.length]); cursor += 1; }
    return xs;
  };
  const temasOrden = temas.length ? temas : [];
  let cursorTema = 0;
  const siguienteTema = (usados) => {
    for (let i = 0; i < temasOrden.length; i++) {
      const t = temasOrden[(cursorTema + i) % temasOrden.length];
      if (!usados.has(t.ut)) { cursorTema = (cursorTema + i + 1) % temasOrden.length; return t; }
    }
    return null;
  };
  // Tema de la chuleta: el de más prioridad con límite de fallos que no sea el de carta (la carta va aparte).
  const temaChuleta = (() => {
    const porPrioridad = temas.length ? temas : [];
    return porPrioridad.find((t) => t.conLimite && t.ut !== cartaUt) ?? porPrioridad.find((t) => t.ut !== cartaUt) ?? porPrioridad[0] ?? null;
  })();

  const pasoFallos = (titulo, esHoy) => {
    if (esHoy && !fallosHoy) return null;
    const n = esHoy ? Math.min(fallosHoy, 10) : 10;
    return paso('fallos', titulo, esHoy ? `${cuenta(n, 'pregunta que fallaste', 'preguntas que fallaste')}, con otra pregunta` : 'Lo que fallaste, con otra pregunta', Math.min(MIN_TANDA, Math.ceil(n * MIN_POR_PREGUNTA)), ['teoria', 'repaso']);
  };
  const tandasIdeas = (minutos, n0 = 1) => {
    const n = Math.max(1, Math.min(MAX_TANDAS_DIA, Math.floor(minutos / MIN_TANDA)));
    const out = [];
    const usados = new Set();
    for (let j = 0; j < n; j++) {
      const xs = siguientesIdeas(IDEAS_POR_TANDA);
      if (xs.length) {
        out.push({ ...paso('ideas', 'Tus ideas flojas', nombres(xs.map((x) => enFrase(x.etiqueta))), MIN_TANDA, ['semana', 'ideas', String(n0 + j)], { c: xs.map((x) => x.id).join(',') }, xs[0].ut), ideas: xs.map((x) => x.id) });
      } else {
        const t = siguienteTema(usados);
        if (!t) break;
        usados.add(t.ut);
        out.push(paso('preguntas', 'Tu tema más flojo', `${t.titulo}${t.conLimite ? ' (con límite de fallos)' : ''}`, MIN_TANDA, ['teoria', 'ut', String(t.ut)], undefined, t.ut));
      }
    }
    return out;
  };
  const pasoTarjetas = () => (tarjetasHoy > 0
    ? paso('tarjetas', 'Tarjetas de memoria', `${cuenta(Math.min(tarjetasHoy, 20), 'tarjeta')} que tocan hoy`, MIN_TARJETAS, ['tarjetas', 'repaso'])
    : mazo ? paso('tarjetas', 'Tarjetas de memoria', mazo.titulo, MIN_TARJETAS, ['tarjetas', mazo.id]) : null);
  const pasoChuleta = () => (temaChuleta ? paso('chuleta', 'Chuleta del tema', `${temaChuleta.titulo}: léela con calma`, MIN_CHULETA, ['temario', String(temaChuleta.ut), 'chuleta'], undefined, temaChuleta.ut) : null);
  const pasoCarta = () => (cartaUt != null ? paso('preguntas', 'Carta', 'Unas preguntas de carta para no perder la mano', MIN_TANDA, ['teoria', 'ut', String(cartaUt)], undefined, cartaUt) : null);
  const titSim = (s) => (s === 'final' ? 'Examen final' : s === 'completo' ? 'Simulacro completo' : `Simulacro: ${modulos.find((m) => m.id === s)?.titulo.replace(/^Módulo/, 'módulo') ?? s}`);

  const out = reparto.map((x) => {
    const f = sumaDiasISO(hoy, d - x.k);
    const esHoy = x.k === d;
    let pasos = [];
    let titulo = '';
    let texto = TEXTO[x.tipo];
    if (x.tipo === 'ideas') {
      const fallos = esHoy ? pasoFallos('Tus fallos', true) : null;
      pasos = [fallos, ...tandasIdeas(minutosDia - (fallos?.minutos ?? 0))].filter(Boolean);
      const ids = pasos.flatMap((p) => p.ideas ?? []);
      titulo = 'Tus ideas flojas';
      if (ids.length) texto = `${TEXTO.ideas} Hoy, para empezar: ${nombres(lista.filter((i) => ids.includes(i.id)).map((i) => enFrase(i.etiqueta)), 2)}.`;
      else if (pasos.some((p) => p.tipo === 'preguntas')) { titulo = 'Tus temas más flojos'; texto = 'Lo que más pesa en tu examen y más te cuesta, tema a tema.'; }
    } else if (x.tipo === 'simulacro') {
      const s = x.examen ?? 'completo';
      const m = modulos.find((y) => y.id === s);
      const min = m ? m.duracionMin : estructura.duracionMin;
      pasos = [paso(s === 'final' ? 'final' : 'simulacro', titSim(s), s === 'final' ? 'Preguntas reservadas que no has visto' : m ? `${m.titulo}, con su tiempo real` : 'Examen completo con las reglas reales', min, ['test', s === 'final' ? 'final' : 'simulacro'], m ? { m: m.id } : undefined)];
      titulo = titSim(s);
      texto = s === 'final' ? TEXTO.final : m ? TEXTO.modulo : TEXTO.simulacro;
      if (min > minutosDia + 5) texto += ` Hoy pide más tiempo que otros días (${cuenta(min, 'minuto')}): si hoy no puedes, pasa al día siguiente.`;
    } else if (x.tipo === 'repaso-simulacro') {
      const fallos = pasoFallos('Los fallos del simulacro', esHoy);
      pasos = [fallos, ...tandasIdeas(minutosDia - (fallos?.minutos ?? 0))];
      titulo = 'Repaso del simulacro';
    } else if (x.tipo === 'ligero') {
      const fallos = x.conRepaso ? pasoFallos('Los fallos del simulacro', esHoy) : null;
      pasos = [fallos, pasoTarjetas(), pasoChuleta(), pasoCarta()];
      titulo = 'Repaso ligero';
      if (x.conRepaso) texto = `${TEXTO.ligero} Antes, los fallos del simulacro.`;
    } else if (x.tipo === 'vispera') {
      if (repasoExpres?.minutos) {
        pasos = [paso('vispera', 'Repaso exprés de la víspera', 'Las trampas de tus temas con límite de fallos, en una pantalla', repasoExpres.minutos, ['vispera'])];
        texto = TEXTO['vispera-expres'];
      } else pasos = [pasoTarjetas() ?? pasoChuleta()];
      titulo = 'Nada nuevo: repaso corto y descanso';
    } else {
      titulo = 'Hoy es el examen';
    }
    pasos = pasos.filter(Boolean);
    // El repaso ligero no pasa de los minutos del día: lo primero (fallos, tarjetas, chuleta) entra siempre; la carta, si cabe.
    if (x.tipo === 'ligero') { let t = 0; pasos = pasos.filter((p, i) => { t += p.minutos; return i < 2 || t <= minutosDia + 5; }); }
    // Sin repetir la misma pantalla en un día (el ejecutor de la sesión reconoce cada paso por su dirección).
    const vistos = new Set();
    pasos = pasos.filter((p) => { const k = p.ruta.join('/'); if (vistos.has(k)) return false; vistos.add(k); return true; });
    const minutos = pasos.reduce((s, p) => s + p.minutos, 0);
    return { fecha: f, k: x.k, tipo: x.tipo, examen: x.examen ?? null, titulo, texto, pasos, minutos, hoy: esHoy, hecho: !!hechos[f] || (esHoy && hoyFijo === 'simulacro'), largo: minutos > minutosDia + 5 };
  });
  return { dias: out, simulacro: { hecho: simHecho, pendientes }, porModulos };
}

/** La sesión de hoy del plan (como componerSesion, src/course/sesion.js), o null si hoy no hay nada que hacer. */
export function sesionDeSemana(plan) {
  const hoy = plan?.dias?.[0];
  if (!hoy || !hoy.pasos.length) return null;
  return { fase: 'semana', semana: hoy.tipo, titulo: hoy.titulo, minutos: hoy.minutos, pasos: hoy.pasos.map(({ ideas, ...p }) => p) };
}

/** «Faltan 3 días», «El examen es mañana», «El examen es hoy». */
export function lineaFaltan(dias) {
  if (dias === 0) return 'El examen es hoy';
  if (dias === 1) return 'El examen es mañana';
  return `Faltan ${cuenta(dias, 'día')}`;
}

/** Rótulo de la tarjeta de Hoy: «Semana del examen · faltan 3 días». */
export function rotuloSemana(dias) {
  if (dias === 0) return 'Semana del examen · hoy es el día';
  if (dias === 1) return 'Semana del examen · mañana es el día';
  return `Semana del examen · faltan ${cuenta(dias, 'día')}`;
}

/** Lo que se dice tras contestar cómo fue. */
export function textoTrasExamen(r) {
  if (r === 'aprobado') return 'Enhorabuena, patrón. Todo lo que has estudiado sigue aquí para cuando lo necesites.';
  if (r === 'suspenso') return 'Ánimo: lo que has estudiado no se pierde. Cuando sepas la próxima fecha, ponla en Ajustes y Hoy volverá a preparar tu plan.';
  if (r === 'no-se') return 'Que haya suerte con la nota. Mientras, tu progreso sigue aquí.';
  return 'De acuerdo. Tu progreso sigue aquí.';
}

/** Resumen en texto del plan (para nautica.state() y la documentación). */
export function resumenPlan(plan) {
  return (plan?.dias ?? []).map((x) => `${x.k === 0 ? 'examen' : `k=${x.k}`} ${x.fecha} ${x.tipo}${x.hecho ? ' [hecho]' : ''}: ${x.titulo} (${x.minutos} min)${x.pasos.length ? ` — ${x.pasos.map((p) => `${p.titulo}: ${p.sub}`).join(' · ')}` : ''}`).join('\n');
}

// ---------------------------------------------------------------------------------------------------------------
// Ensayo general en papel (R-41, src/theory/ensayo.js): antes del examen se recomienda haber hecho al menos dos. No es un
// día del plan (el plan no cambia): es un recordatorio con la cuenta de los hechos y el enlace, en la página de la
// semana. Con días de trabajo por delante (k ≥ 3) se propone hacer el que falte; después, solo se cuenta.

/**
 * @param {object[]} tests  exámenes de la titulación y el eje (los ensayos llevan tipo 'ensayo')
 * @param {{ dias: number, recomendados?: number }} o  dias: los que faltan; recomendados: ENSAYOS_RECOMENDADOS
 * @returns {{ hechos: number, recomendados: number, faltan: number, texto: string, proponer: boolean }}
 */
export function recordatorioEnsayos(tests = [], { dias, recomendados = 2 }) {
  const hechos = tests.filter((t) => t?.tipo === 'ensayo').length;
  const faltan = Math.max(0, recomendados - hechos);
  const proponer = faltan > 0 && dias >= 3;
  const texto = !faltan ? `Llevas ${cuenta(hechos, 'ensayo')} en papel: ya sabes cómo te va con la carta de papel y el reloj.`
    : proponer ? `Llevas ${hechos} de ${recomendados} ensayos en papel. Antes del examen, haz ${faltan === 1 ? 'otro' : faltan} con la carta de papel, el transportador, el compás y el reloj: mejor en uno de los días de trabajo que en la víspera.`
      : `Llevas ${hechos} de ${recomendados} ensayos en papel. A estas alturas, mejor no empezar otro: descansa y repasa lo ligero.`;
  return { hechos, recomendados, faltan, texto, proponer };
}

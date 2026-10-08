// La Travesía: el progreso del alumno contado como una derrota con faros, un rango y unas insignias (docs/TRAVESIA.md).
// Funciones puras: reciben el índice de conceptos del banco (src/conceptos), las respuestas, los exámenes hechos y los
// días de actividad, y devuelven el estado de cada faro, el rango, las insignias, la semana y el parte de una sesión.
// Nunca leen la hora ni el almacén: `ahora` (ms) se inyecta.
//
// Reglas que esta capa NO toca (y que fijan los tests):
//   - «¿Estás listo?» (src/course/listo.js) y el dominio de cada idea (src/conceptos/conceptos.js) son los de siempre:
//     aquí solo se LEEN. Una idea está dominada cuando dominio() dice 'dominado'. Única extensión: dominio() pide al menos
//     UMBRALES.vistasDominado (3) preguntas respondidas, y hay ideas con una o dos preguntas en el banco que así nunca
//     llegarían a dominadas (y un faro podría no poder encenderse jamás); esas se dan por dominadas cuando TODAS sus
//     preguntas están respondidas y bien (ideaDominada). Ningún umbral nuevo.
//   - Ni puntos, ni ranking, ni nada que premie la velocidad o el número de preguntas.
//   - Cuarentena: solo cuentan las preguntas del ESTUDIO del banco. Las respuestas a preguntas reservadas para el examen
//     final, anuladas o retiradas se dejan fuera antes de calcular nada, y no se nombra ni se cuenta ninguna pregunta.

import { bloqueDe } from './nivel.js';
import { pesoExamen, temaDeIdea } from './listo.js';
import { UMBRALES } from '../conceptos/conceptos.js';
import { diaISO, cuenta } from '../texto.js';

export const VERSION_TRAVESIA = 1;

/** Un faro se enciende con este porcentaje de las ideas de su bloque dominadas. */
export const FARO_ENCENDIDO = 0.8;

/** Días de estudio en una semana (lunes a domingo) para la insignia «Una semana de travesía». */
export const DIAS_SEMANA = 4;

/**
 * Los faros: los bloques del catálogo (nivel.js, bloqueDe: la raíz de cada idea en el árbol del catálogo) agrupados en
 * seis tramos de la derrota, en el orden en que se estudia. Un bloque que no esté aquí (un grupo nuevo del catálogo)
 * va al faro «Otras ideas», que solo existe si hace falta.
 */
export const FAROS = [
  { id: 'nomenclatura', nombre: 'Nomenclatura náutica', corto: 'Nomenclatura', bloques: ['nomen'] },
  { id: 'maniobra', nombre: 'Maniobra y marinería', corto: 'Maniobra', bloques: ['amarre', 'maniobra'] },
  { id: 'seguridad', nombre: 'Seguridad y legislación', corto: 'Seguridad', bloques: ['estabilidad', 'seguridad', 'legis', 'emergencia'] },
  { id: 'balizamiento', nombre: 'Balizamiento y RIPA', corto: 'Balizamiento', bloques: ['baliza', 'ripa'] },
  { id: 'meteorologia', nombre: 'Meteorología', corto: 'Meteorología', bloques: ['meteo'] },
  { id: 'navegacion', nombre: 'Navegación y carta', corto: 'Carta', bloques: ['nav', 'mareas', 'carta'] },
];
const OTROS = { id: 'otras', nombre: 'Otras ideas', corto: 'Otras', bloques: [] };

/** Faro de un bloque del catálogo. */
export const faroDe = (bloque) => FAROS.find((f) => f.bloques.includes(bloque)) ?? OTROS;

/**
 * Los rangos. `desde` = fracción de las ideas del banco (de la titulación y el eje) que hay que tener dominadas; no son
 * cifras fijas, así valen igual para un banco de 200 ideas que para uno de 400. `exige`: además, un examen:
 * 'simulacro' = algún simulacro (o examen real) aprobado; 'inedito' = un examen aprobado cuyas preguntas no habías visto.
 */
export const RANGOS = [
  { id: 'grumete', nombre: 'Grumete', desde: 0, exige: null },
  { id: 'marinero', nombre: 'Marinero', desde: 0.2, exige: null },
  { id: 'timonel', nombre: 'Timonel', desde: 0.45, exige: null },
  { id: 'contramaestre', nombre: 'Contramaestre', desde: 0.7, exige: 'simulacro' },
  { id: 'patron', nombre: 'Patrón', desde: 0.9, exige: 'inedito' },
];
export const rangoPorId = (id) => RANGOS.find((r) => r.id === id) ?? null;
const indiceRango = (id) => RANGOS.findIndex((r) => r.id === id);

/** Las insignias fijas (las de bloque se generan, una por faro). `icono` = nombre en src/ui/iconos.js. */
export const INSIGNIAS = [
  { id: 'guardia', nombre: 'Guardia de 5 minutos', icono: 'ins-guardia', texto: 'Completaste una sesión de «5 minutos»: cinco preguntas seguidas, sin saltarte ninguna.', falta: 'Haz una sesión de «5 minutos» (desde Hoy, «Tengo 5 minutos»).' },
  { id: 'semana', nombre: 'Una semana de travesía', icono: 'ins-semana', texto: `Estudiaste al menos ${cuenta(DIAS_SEMANA, 'día')} de una misma semana (de lunes a domingo). No hace falta que sean seguidos: un día de descanso no rompe nada.`, falta: `Estudia ${cuenta(DIAS_SEMANA, 'día')} de una misma semana.` },
  { id: 'rescate', nombre: 'Idea rescatada', icono: 'ins-rescate', texto: 'Una idea que se te resistía ya no está floja: la rescataste repasándola.', falta: 'Te falta rescatar una idea floja.' },
  { id: 'simulacro', nombre: 'Primer simulacro aprobado', icono: 'ins-simulacro', texto: 'Aprobaste un simulacro completo con las reglas reales del examen.', falta: 'Aún sin simulacros aprobados.' },
  { id: 'inedito', nombre: 'Examen inédito aprobado', icono: 'ins-inedito', texto: 'Aprobaste un examen cuyas preguntas casi no habías visto. Es la prueba que más pesa.', falta: 'Se consigue al final de la ruta, con el examen final o con un examen de preguntas nuevas.' },
];
const ORDEN_FIJAS = ['guardia', 'semana', 'rescate'];
const ORDEN_FINAL = ['simulacro', 'inedito'];
const idBloque = (faro) => `bloque:${faro}`;

// --- las ideas del banco -------------------------------------------------------------------------------------------------

/**
 * Las ideas del banco que se estudian: conceptos (no grupos) con alguna pregunta del ESTUDIO. Con su bloque, su faro y los
 * ids de sus preguntas de estudio (solo para filtrar respuestas; nunca salen a la pantalla).
 * @returns {{ id: string, etiqueta: string, bloque: string, faro: string, qs: string[] }[]}
 */
export function ideasDelBanco(ic) {
  if (!ic) return [];
  const out = [];
  for (const c of ic.conceptosConPreguntas()) {
    if (c.tipo !== 'concepto') continue;
    const qs = ic.preguntasDe(c.id, { soloEstudio: true, conDescendientes: false });
    if (!qs.length) continue;
    const bloque = bloqueDe(ic.catalogo, c.id);
    out.push({ id: c.id, etiqueta: c.etiqueta, bloque, faro: faroDe(bloque).id, qs: qs.map((q) => q.id) });
  }
  return out;
}

/** Exámenes hechos: ¿algún simulacro (o examen real) aprobado? ¿alguno inédito aprobado? (criterio de «¿Estás listo?»). */
export function resumenExamenes(tests = []) {
  const aprobados = tests.filter((t) => t?.apto === true);
  return { simulacro: aprobados.length > 0, inedito: aprobados.some((t) => pesoExamen(t) > 1) };
}

/** Los exámenes de una titulación y un eje (los de antes de los ejes ya traen el eje por defecto desde el almacén). */
export const examenesDe = (tests = [], eje, tit) => tests.filter((t) => (t?.tit ?? 'per') === tit && t?.eje === eje);

// --- el estado -----------------------------------------------------------------------------------------------------------

const COD = { flojo: 'f', 'en-progreso': 'e', dominado: 'd' };

/**
 * Estado de una idea para la travesía: el de dominio() ('sin-datos' | 'flojo' | 'en-progreso' | 'dominado'), salvo que la
 * idea tenga menos preguntas de estudio que UMBRALES.vistasDominado (nunca podría llegar a 'dominado'): entonces, con todas
 * sus preguntas respondidas y bien (y sin estar floja), cuenta como dominada.
 */
export function estadoIdea(d, preguntas) {
  const base = d?.estado ?? 'sin-datos';
  if (base === 'en-progreso' && preguntas < UMBRALES.vistasDominado && d.vistas === preguntas && d.aciertos === d.vistas) return 'dominado';
  return base;
}

/**
 * La luz de un faro a partir de sus ideas (con su estado de estadoIdea): cuántas hay, cuántas dominadas y vistas, el
 * porcentaje y el estado 'on' (≥ FARO_ENCENDIDO dominadas) | 'parcial' (alguna vista) | 'off'. La usan los faros de la
 * carta (por bloque del catálogo) y los del Temario (por tema): un solo criterio.
 */
export function luzDeFaro(xs) {
  const dominadas = xs.filter((i) => i.estado === 'dominado').length;
  const vistas = xs.filter((i) => i.vistas > 0).length;
  const pct = xs.length ? dominadas / xs.length : 0;
  const flojas = xs.filter((i) => i.estado === 'flojo').sort((a, b) => a.tasa - b.tasa || a.etiqueta.localeCompare(b.etiqueta));
  return { total: xs.length, dominadas, vistas, pct,
    estado: xs.length && pct >= FARO_ENCENDIDO ? 'on' : vistas > 0 ? 'parcial' : 'off', completo: dominadas === xs.length,
    faltan: Math.max(0, Math.ceil(FARO_ENCENDIDO * xs.length - 1e-9) - dominadas), flojas, ideas: xs };
}

/**
 * Un faro por TEMA del examen (ut) para el Temario, con el mismo criterio que la carta (luzDeFaro). Cada idea va al tema
 * de la mayoría de sus preguntas (temaDeIdea, como las «ideas por tema» de Mi progreso). `est` = estadoTravesia(…).
 * @returns {Map<number, ReturnType<typeof luzDeFaro>>}  vacío sin travesía (banco sin etiquetas)
 */
export function farosPorTema(est, ic) {
  const porUt = new Map();
  if (!est || !ic) return porUt;
  for (const i of est.ideas) {
    const ut = temaDeIdea(ic, i.id);
    if (ut == null) continue;
    if (!porUt.has(ut)) porUt.set(ut, []);
    porUt.get(ut).push(i);
  }
  return new Map([...porUt].map(([ut, xs]) => [ut, luzDeFaro(xs)]));
}

/**
 * El estado de la travesía.
 * @param {{ ic: object|null, respuestas?: object, tests?: object[], dias?: object, ahora?: number }} p
 *   `tests`: los exámenes de ESTE banco (examenesDe); `dias`: progress.get().dias.
 * @returns {null | { ideas: object[], faros: object[], total: number, dominadas: number, pct: number,
 *   examenes: {simulacro: boolean, inedito: boolean}, rangoAhora: string, rescate: boolean, ganadas: string[] }}
 *   null sin conceptos (banco sin etiquetas): entonces no hay travesía.
 */
export function estadoTravesia({ ic, respuestas = {}, tests = [], dias = {}, ahora = Date.now() }) {
  const ideas = ideasDelBanco(ic);
  if (!ideas.length) return null;
  // Cuarentena: solo las respuestas a preguntas del estudio de las ideas.
  const estudio = new Set(ideas.flatMap((i) => i.qs));
  const resp = {};
  for (const id of Object.keys(respuestas ?? {})) if (estudio.has(id)) resp[id] = respuestas[id];
  const dom = ic.dominio(resp);
  const conEstado = ideas.map((i) => {
    const d = dom[i.id];
    return { id: i.id, etiqueta: i.etiqueta, bloque: i.bloque, faro: i.faro, estado: estadoIdea(d, i.qs.length), tasa: d?.tasa ?? null, vistas: d?.vistas ?? 0,
      rescatable: i.qs.some((q) => resp[q]?.ok1 === false) };
  });
  const faros = [...FAROS, OTROS].map((f) => {
    const xs = conEstado.filter((i) => i.faro === f.id);
    if (!xs.length) return null;
    return { id: f.id, nombre: f.nombre, corto: f.corto, ...luzDeFaro(xs) };
  }).filter(Boolean);
  const total = conEstado.length;
  const dominadas = conEstado.filter((i) => i.estado === 'dominado').length;
  const pct = dominadas / total;
  const examenes = resumenExamenes(tests);
  const rescate = conEstado.some((i) => i.estado === 'dominado' && i.rescatable);
  const est = { ideas: conEstado, faros, total, dominadas, pct, examenes, rescate };
  est.rangoAhora = rangoPara(pct, examenes);
  est.ganadas = insigniasGanadas({ faros, dias, examenes, rescate });
  return est;
}

/** El rango que dan unas ideas dominadas (fracción) y unos exámenes, sin contar lo que ya se alcanzó antes. */
export function rangoPara(pct, examenes = {}) {
  let r = RANGOS[0];
  for (const x of RANGOS) if (pct + 1e-9 >= x.desde && (!x.exige || examenes[x.exige])) r = x;
  return r.id;
}

/** Ideas que hay que tener dominadas (de `total`) para un rango. */
export const ideasParaRango = (rango, total) => Math.ceil((rango.desde * total) - 1e-9);

/**
 * El rango del alumno (nunca baja: el máximo alcanzado) y cuánto le falta para el siguiente.
 * @returns {{ actual: object, siguiente: object|null, falta: number, exige: string|null, fraccion: number, texto: string }}
 */
export function progresoRango(est, maximo = null) {
  const alcanzado = Math.max(indiceRango(est.rangoAhora), indiceRango(maximo));
  const actual = RANGOS[Math.max(0, alcanzado)];
  const siguiente = RANGOS[alcanzado + 1] ?? null;
  if (!siguiente) return { actual, siguiente: null, falta: 0, exige: null, fraccion: 1, texto: 'Has llegado a puerto.' };
  const a = ideasParaRango(actual, est.total);
  const b = ideasParaRango(siguiente, est.total);
  const falta = Math.max(0, b - est.dominadas);
  const exige = siguiente.exige && !est.examenes[siguiente.exige] ? siguiente.exige : null;
  const fraccion = b > a ? Math.max(0, Math.min(1, (est.dominadas - a) / (b - a))) : 1;
  const ideas = cuenta(falta, 'idea dominada', 'ideas dominadas');
  const examen = exige === 'inedito' ? 'aprobar un examen con preguntas que no hayas visto' : 'aprobar un simulacro';
  let texto;
  if (falta && exige) texto = `Te faltan ${ideas} y ${examen} para ${siguiente.nombre}.`;
  else if (falta) texto = `Te faltan ${ideas} para ${siguiente.nombre}.`;
  else if (exige) texto = `Te falta ${examen} para ${siguiente.nombre}.`;
  else texto = `Ya cumples para ${siguiente.nombre}.`;
  return { actual, siguiente, falta, exige, fraccion, texto };
}

/** Texto de lo que pide un rango (para la escalera de rangos). */
export function requisitoRango(r) {
  const pct = `${Math.round(r.desde * 100)} % de las ideas dominadas`;
  if (!r.desde) return 'Desde la primera clase';
  if (r.exige === 'simulacro') return `${pct} y un simulacro aprobado`;
  if (r.exige === 'inedito') return `${pct} y un examen inédito aprobado`;
  return pct;
}

// --- la semana -----------------------------------------------------------------------------------------------------------

const LETRAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const NOMBRES_DIA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

/** Fecha 'AAAA-MM-DD' a mediodía local (para sumar días sin sorpresas de horario de verano). */
const aFecha = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const sumaDias = (iso, n) => { const f = aFecha(iso); f.setDate(f.getDate() + n); return diaISO(f.getTime()); };
/** Lunes de la semana de una fecha. */
const lunesDe = (iso) => { const f = aFecha(iso); return sumaDias(iso, -((f.getDay() + 6) % 7)); };

/** ¿Estudió ese día? Cuenta cualquier actividad registrada (logActividad: una clase, una tanda, un examen…), sin mínimo de minutos. */
const estudio = (dias, iso) => (dias?.[iso]?.act ?? 0) > 0;

/**
 * La semana en curso (de lunes a domingo). Qué días cuentan:
 *   - «estudio»: el día tiene alguna actividad (logActividad).
 *   - «descanso»: el primer día YA PASADO sin actividad después de empezar la semana a estudiar. Uno por semana; no rompe
 *     nada. Los demás días pasados sin actividad son «libre» (nadie los cuenta como fallo) y los anteriores al primer
 *     día de estudio de la semana también.
 *   - «hoy» (sin actividad todavía) y «futuro».
 * @returns {{ desde: string, dias: { fecha: string, letra: string, nombre: string, estado: string }[], estudiados: number, descanso: boolean, texto: string }}
 */
export function semanaDe(dias = {}, ahora = Date.now()) {
  const hoy = diaISO(ahora);
  const lunes = lunesDe(hoy);
  const fechas = Array.from({ length: 7 }, (_, i) => sumaDias(lunes, i));
  const primero = fechas.find((f) => estudio(dias, f)) ?? null;
  let descansoPuesto = false;
  const out = fechas.map((fecha, i) => {
    let estado;
    if (estudio(dias, fecha)) estado = 'estudio';
    else if (fecha > hoy) estado = 'futuro';
    else if (fecha === hoy) estado = 'hoy';
    else if (primero && fecha > primero && !descansoPuesto) { estado = 'descanso'; descansoPuesto = true; } else estado = 'libre';
    return { fecha, letra: LETRAS[i], nombre: NOMBRES_DIA[i], estado };
  });
  const estudiados = out.filter((d) => d.estado === 'estudio').length;
  const descanso = out.some((d) => d.estado === 'descanso');
  const dd = cuenta(estudiados, 'día');
  const texto = estudiados ? `${dd}${descanso ? ' · 1 de descanso' : ''}` : 'Aún sin estudiar esta semana';
  return { desde: lunes, dias: out, estudiados, descanso, texto };
}

/** ¿Hay alguna semana (lunes a domingo) con al menos DIAS_SEMANA días de estudio entre los días guardados? */
export function hayUnaSemana(dias = {}) {
  const porSemana = new Map();
  for (const f of Object.keys(dias ?? {})) {
    if (!estudio(dias, f)) continue;
    const l = lunesDe(f);
    porSemana.set(l, (porSemana.get(l) ?? 0) + 1);
  }
  return [...porSemana.values()].some((n) => n >= DIAS_SEMANA);
}

// --- las insignias -------------------------------------------------------------------------------------------------------

/**
 * Las insignias que dan los datos de hoy (sin la «Guardia de 5 minutos», que no sale de ningún dato: la apunta la
 * pantalla de «5 minutos» al terminar). Una «Bloque completo» por faro con TODAS sus ideas dominadas.
 */
export function insigniasGanadas({ faros = [], dias = {}, examenes = {}, rescate = false }) {
  const ids = [];
  if (hayUnaSemana(dias)) ids.push('semana');
  if (rescate) ids.push('rescate');
  if (examenes.simulacro) ids.push('simulacro');
  if (examenes.inedito) ids.push('inedito');
  for (const f of faros) if (f.completo) ids.push(idBloque(f.id));
  return ids;
}

/** El catálogo de insignias de un banco, en el orden de la rejilla: fijas, una por faro, y las de examen. */
export function catalogoInsignias(faros = []) {
  const fija = (id) => INSIGNIAS.find((x) => x.id === id);
  return [
    ...ORDEN_FIJAS.map(fija),
    ...faros.map((f) => ({ id: idBloque(f.id), nombre: `Bloque completo: ${f.corto}`, icono: 'ins-bloque',
      texto: `Domina todas las ideas de ${f.nombre.toLowerCase()}. Con el 80 % se enciende el faro; esta insignia pide todas.`,
      falta: `Vas por ${f.dominadas} de ${f.total} ideas.` })),
    ...ORDEN_FINAL.map(fija),
  ];
}

/** Lo que falta para una insignia que aún no se tiene, según el estado. */
export function faltaInsignia(ins, est) {
  if (ins.id.startsWith('bloque:')) {
    const f = est?.faros.find((x) => idBloque(x.id) === ins.id);
    return f ? `Vas por ${f.dominadas} de ${f.total} ideas.` : ins.falta;
  }
  if (ins.id === 'semana' && est?.semana) return `Esta semana llevas ${est.semana.estudiados} de ${cuenta(DIAS_SEMANA, 'día')}.`;
  return ins.falta;
}

// --- lo guardado (progress.travesia) -------------------------------------------------------------------------------------

/**
 * Une lo guardado con lo que dan los datos hoy: el rango nunca baja (el máximo) y las insignias, una vez ganadas, se
 * quedan con su fecha. `extra`: insignias que ya se saben ganadas por otro camino (p. ej. una idea rescatada en la sesión).
 * @returns {{ reg: { rango: string, insignias: Record<string, string> }, nuevas: string[], subeRango: boolean }}
 */
export function fusionar(guardado, est, { ahora = Date.now(), extra = [] } = {}) {
  const previo = { rango: guardado?.rango ?? null, insignias: { ...(guardado?.insignias ?? {}) } };
  const t = new Date(ahora).toISOString();
  const nuevas = [];
  for (const id of [...est.ganadas, ...extra]) {
    if (previo.insignias[id]) continue;
    previo.insignias[id] = t;
    nuevas.push(id);
  }
  const rango = RANGOS[Math.max(0, indiceRango(est.rangoAhora), indiceRango(previo.rango))].id;
  return { reg: { rango, insignias: previo.insignias }, nuevas, subeRango: indiceRango(rango) > indiceRango(previo.rango) && previo.rango != null };
}

// --- el parte de una sesión ----------------------------------------------------------------------------------------------

/**
 * Foto del estado al empezar una sesión (se guarda con ella): el estado de cada idea vista ('f' floja, 'e' en progreso,
 * 'd' dominada; las no vistas no aparecen), el rango y las insignias que ya tenía.
 */
export function fotoTravesia(est, reg) {
  const ideas = {};
  for (const i of est.ideas) if (COD[i.estado]) ideas[i.id] = COD[i.estado];
  return { v: VERSION_TRAVESIA, ideas, rango: reg?.rango ?? est.rangoAhora, insignias: Object.keys(reg?.insignias ?? {}) };
}

/**
 * El parte de travesía de una sesión: lo que cambió entre la foto del principio (`foto`) y el estado de ahora (`est`).
 *   nuevas      ideas que no habías visto nunca y has trabajado
 *   rescatadas  ideas que estaban flojas y ya no lo están
 *   flojas      ideas que has trabajado hoy y siguen flojas (`tocadas`: ids de las ideas que salieron en la sesión)
 *   faros       faros que se encienden: cruzan el 80 % de sus ideas dominadas en esta sesión
 *   insignias   insignias nuevas (las que no estaban en la foto)
 *   rango       { antes, ahora, sube }
 * `reg` y `nuevas` son el almacén ya fusionado (fusionar) para guardarlo; `extra` = ['rescate'] si hay rescatadas.
 * @returns {null | object}  null si no hay foto (una sesión de antes de la travesía): entonces no hay parte.
 */
export function parteSesion({ foto, est, guardado = null, tocadas = new Set(), ahora = Date.now() }) {
  if (!foto || !est) return null;
  const antes = foto.ideas ?? {};
  const nuevas = est.ideas.filter((i) => i.vistas > 0 && !antes[i.id]);
  const rescatadas = est.ideas.filter((i) => antes[i.id] === 'f' && i.estado !== 'flojo');
  const flojas = est.ideas.filter((i) => i.estado === 'flojo' && tocadas.has(i.id));
  const faros = est.faros.filter((f) => f.estado === 'on').map((f) => {
    const dom0 = f.ideas.filter((i) => antes[i.id] === 'd').length;
    return { id: f.id, nombre: f.nombre, antes: dom0 / f.total, ahora: f.pct };
  }).filter((f) => f.antes < FARO_ENCENDIDO);
  const { reg, nuevas: ganadas } = fusionar(guardado, est, { ahora, extra: rescatadas.length ? ['rescate'] : [] });
  const yaTenia = new Set(foto.insignias ?? []);
  const insignias = Object.keys(reg.insignias).filter((id) => !yaTenia.has(id));
  const rango = { antes: foto.rango ?? null, ahora: reg.rango, sube: indiceRango(reg.rango) > indiceRango(foto.rango) };
  return { nuevas, rescatadas, flojas, faros, insignias, rango, reg, ganadas, vacio: !nuevas.length && !rescatadas.length && !flojas.length && !faros.length };
}

/**
 * La idea que vuelve mañana (o la más cercana): de las que siguen flojas hoy, la que antes vuelve al repaso; si no hay,
 * de las demás ideas trabajadas. `vuelve`: Map idea → días hasta que vuelve (>= 1).
 * @returns {{ id: string, etiqueta: string, dias: number } | null}
 */
export function paraManana({ flojas = [], trabajadas = [], vuelve = new Map() }) {
  const mejor = (xs) => xs.filter((i) => vuelve.has(i.id)).sort((a, b) => vuelve.get(a.id) - vuelve.get(b.id) || a.etiqueta.localeCompare(b.etiqueta))[0];
  const i = mejor(flojas) ?? mejor(trabajadas);
  return i ? { id: i.id, etiqueta: i.etiqueta, dias: vuelve.get(i.id) } : null;
}

// --- la carta ------------------------------------------------------------------------------------------------------------

/** Puntos de la derrota en la carta (358 × 320) y la bandera del examen al final. Con seis faros, uno en cada punto. */
export const PUNTOS_DERROTA = [[52, 280], [150, 250], [274, 228], [188, 150], [110, 128], [180, 84]];
export const BANDERA = [290, 44];

/** Dónde va cada uno de `n` faros: con seis, en los puntos de la carta; con otro número, repartidos a lo largo de la derrota. */
export function posicionesDerrota(n) {
  const ult = PUNTOS_DERROTA.length - 1;
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? ult / 2 : (i * ult) / (n - 1);
    const lo = Math.min(ult, Math.floor(t));
    const hi = Math.min(ult, lo + 1);
    const f = t - lo;
    const [x0, y0] = PUNTOS_DERROTA[lo];
    const [x1, y1] = PUNTOS_DERROTA[hi];
    return [Math.round(x0 + (x1 - x0) * f), Math.round(y0 + (y1 - y0) * f)];
  });
}

/** El faro que se enseña al abrir la pantalla: el más cercano a encenderse; si todos están encendidos o ninguno empezado, el primero. */
export function faroInicial(faros) {
  const sin = faros.filter((f) => f.estado !== 'on' && f.vistas > 0);
  if (!sin.length) return (faros.find((f) => f.estado !== 'on') ?? faros[0])?.id ?? null;
  return sin.sort((a, b) => b.pct - a.pct)[0].id;
}

// La Travesía: el progreso del alumno contado como una derrota con faros, un rango y unas insignias (docs/TRAVESIA.md).
// Los faros de la carta general son TRAMOS: cada uno agrupa temas enteros del temario de la titulación (en la PER, cinco
// tramos para once temas; en el PY, un faro por tema) y su cuenta es la suma exacta de las de sus temas, que son las que
// enseña el Temario. Al acercarse a un faro (la «carta de aproximación») se ven sus temas, cada uno con su boya.
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
import { bloquesEnOrden } from '../theory/blocks.js';
import { pesoExamen, temaDeIdea } from './listo.js';
import { UMBRALES } from '../conceptos/conceptos.js';
import { diaISO, cuenta } from '../texto.js';

export const VERSION_TRAVESIA = 1;

/** Un faro (de tramo o de tema) se enciende con este porcentaje de sus ideas dominadas. */
export const FARO_ENCENDIDO = 0.8;

/** Días de estudio en una semana (lunes a domingo) para la insignia «Una semana de travesía». */
export const DIAS_SEMANA = 4;

/**
 * La unidad de la derrota son los TEMAS del temario de la titulación (estructura.bloques de src/theory/blocks.js), uno por
 * tema con ideas, en el orden del Temario (el de estudio, bloquesEnOrden); los faros de la carta general los agrupan en
 * tramos (estructura.tramos; farosDeTramos). Cada idea va al tema de la mayoría de sus
 * preguntas (temaDeIdea, el mismo reparto que «Mi progreso»). Una idea sin tema, o con un tema que la estructura no
 * tiene, va al faro «Otras ideas», que solo existe si hace falta (hoy en ningún banco: un test lo vigila).
 */
export const idFaroTema = (ut) => `t${ut}`;
const OTROS = { id: 'otras', ut: null, nombre: 'Otras ideas', corto: 'Otras' };

/**
 * Los seis faros de la primera versión de la derrota (agrupaban los bloques del catálogo). Ya no se dibujan: solo quedan
 * para dar nombre a las insignias «Bloque completo» (`bloque:<id>`) que alguien ganó con ellos y que se conservan.
 */
export const FAROS_ANTIGUOS = [
  { id: 'nomenclatura', nombre: 'Nomenclatura náutica', corto: 'Nomenclatura' },
  { id: 'maniobra', nombre: 'Maniobra y marinería', corto: 'Maniobra' },
  { id: 'seguridad', nombre: 'Seguridad y legislación', corto: 'Seguridad' },
  { id: 'balizamiento', nombre: 'Balizamiento y RIPA', corto: 'Balizamiento' },
  { id: 'meteorologia', nombre: 'Meteorología', corto: 'Meteorología' },
  { id: 'navegacion', nombre: 'Navegación y carta', corto: 'Carta' },
  { id: 'otras', nombre: 'Otras ideas', corto: 'Otras' },
];

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

/** Las insignias fijas (las de tema se generan, una por faro). `icono` = nombre en src/ui/iconos.js. */
export const INSIGNIAS = [
  { id: 'guardia', nombre: 'Guardia de 5 minutos', icono: 'ins-guardia', texto: 'Completaste una sesión de «5 minutos»: cinco preguntas seguidas, sin saltarte ninguna.', falta: 'Haz una sesión de «5 minutos» (desde Hoy, «Tengo 5 minutos»).' },
  { id: 'semana', nombre: 'Una semana de travesía', icono: 'ins-semana', texto: `Estudiaste al menos ${cuenta(DIAS_SEMANA, 'día')} de una misma semana (de lunes a domingo). No hace falta que sean seguidos: un día de descanso no rompe nada.`, falta: `Estudia ${cuenta(DIAS_SEMANA, 'día')} de una misma semana.` },
  { id: 'rescate', nombre: 'Idea rescatada', icono: 'ins-rescate', texto: 'Una idea que se te resistía ya no está floja: la rescataste repasándola.', falta: 'Te falta rescatar una idea floja.' },
  { id: 'simulacro', nombre: 'Primer simulacro aprobado', icono: 'ins-simulacro', texto: 'Aprobaste un simulacro completo con las reglas reales del examen.', falta: 'Aún sin simulacros aprobados.' },
  { id: 'inedito', nombre: 'Examen inédito aprobado', icono: 'ins-inedito', texto: 'Aprobaste un examen cuyas preguntas casi no habías visto. Es la prueba que más pesa.', falta: 'Se consigue al final de la ruta, con el examen final o con un examen de preguntas nuevas.' },
];
const ORDEN_FIJAS = ['guardia', 'semana', 'rescate'];
const ORDEN_FINAL = ['simulacro', 'inedito'];
/** Insignia «Tema completo» de un faro: `tema:<ut>`. Las antiguas, por bloque, eran `bloque:<faro antiguo>`. */
const idInsigniaTema = (f) => `tema:${f.ut ?? f.id}`;
const PREFIJO_ANTIGUA = 'bloque:';

// --- las ideas del banco -------------------------------------------------------------------------------------------------

/**
 * Las ideas del banco que se estudian: conceptos (no grupos) con alguna pregunta del ESTUDIO. Con su bloque del catálogo, su tema
 * (ut, temaDeIdea) y los ids de sus preguntas de estudio (solo para filtrar respuestas; nunca salen a la pantalla).
 * @returns {{ id: string, etiqueta: string, bloque: string, ut: number|null, qs: string[] }[]}
 */
export function ideasDelBanco(ic) {
  if (!ic) return [];
  const out = [];
  for (const c of ic.conceptosConPreguntas()) {
    if (c.tipo !== 'concepto') continue;
    const qs = ic.preguntasDe(c.id, { soloEstudio: true, conDescendientes: false });
    if (!qs.length) continue;
    out.push({ id: c.id, etiqueta: c.etiqueta, bloque: bloqueDe(ic.catalogo, c.id), ut: temaDeIdea(ic, c.id), qs: qs.map((q) => q.id) });
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
 * porcentaje y el estado 'on' (≥ FARO_ENCENDIDO dominadas) | 'parcial' (alguna vista) | 'off'. Es el único criterio: lo usa
 * farosDeTemas, de donde salen los faros de la carta y los del Temario.
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
 * Los faros: uno por TEMA del examen con ideas, en el orden del Temario. Es la ÚNICA función que reparte las ideas en
 * faros: de aquí salen los de la carta de la derrota (estadoTravesia().faros) y los del Temario (farosPorTema), así que no
 * pueden dar cuentas distintas.
 * @param {object[]} ideas  con su `ut` (temaDeIdea) y su estado (estadoIdea)
 * @param {object|null} estructura  la del examen de la titulación (título, nombre corto y orden de los temas); sin ella,
 *   los temas por número con «Tema n» (bancos de prueba)
 * @returns {object[]}  { id, ut, nombre, corto, …luzDeFaro }; el último, «Otras ideas» (ut null), solo si hace falta
 */
export function farosDeTemas(ideas, estructura = null) {
  const temas = estructura
    ? bloquesEnOrden(estructura).map((b) => ({ ut: b.ut, nombre: b.titulo, corto: b.corto ?? b.titulo }))
    : [...new Set(ideas.map((i) => i.ut).filter((ut) => ut != null))].sort((a, b) => a - b).map((ut) => ({ ut, nombre: `Tema ${ut}`, corto: `Tema ${ut}` }));
  const conocidos = new Set(temas.map((t) => t.ut));
  const faros = temas.map((t) => ({ id: idFaroTema(t.ut), ...t, xs: ideas.filter((i) => i.ut === t.ut) }));
  faros.push({ ...OTROS, xs: ideas.filter((i) => !conocidos.has(i.ut)) });
  return faros.filter((f) => f.xs.length).map(({ xs, ...f }) => ({ ...f, ...luzDeFaro(xs) }));
}

/**
 * Los faros de la carta general: los TRAMOS de la titulación (estructura.tramos), cada uno con sus temas (los de
 * farosDeTemas, tal cual) y con la luz de TODAS las ideas de esos temas: sus dominadas y su total son la suma exacta de los
 * de sus temas, así que nunca descuadra con el Temario. Sin tramos (el PY), un faro por tema. Un tema que no esté en
 * ningún tramo (o «Otras ideas») va solo, al final.
 * @param {object[]} temas  los de farosDeTemas
 * @returns {object[]}  { id, nombre, corto, uts, temas, …luzDeFaro }; con un solo tema y sin tramos, además su `ut`
 */
export function farosDeTramos(temas, estructura = null) {
  const sueltos = (fs) => fs.map((f) => ({ ...f, uts: f.ut == null ? [] : [f.ut], temas: [f] }));
  const tramos = estructura?.tramos;
  if (!tramos?.length) return sueltos(temas);
  const enTramo = new Set(tramos.flatMap((t) => t.uts));
  const faros = tramos.map((t) => {
    const fs = temas.filter((f) => t.uts.includes(f.ut));
    return fs.length ? { id: t.id, ut: fs.length === 1 ? fs[0].ut : null, nombre: t.nombre, corto: t.corto ?? t.nombre, uts: fs.map((f) => f.ut), temas: fs, ...luzDeFaro(fs.flatMap((f) => f.ideas)) } : null;
  }).filter(Boolean);
  return [...faros, ...sueltos(temas.filter((f) => !enTramo.has(f.ut)))];
}

/**
 * Los faros del Temario, por tema (ut): los mismos objetos que los temas de la travesía (est.temas, las boyas de la carta
 * de aproximación), sin «Otras ideas» (no es un tema). `est` = estadoTravesia(…) con la estructura de la titulación.
 * @returns {Map<number, object>}  vacío sin travesía (banco sin etiquetas)
 */
export function farosPorTema(est) {
  return new Map((est?.temas ?? []).filter((f) => f.ut != null).map((f) => [f.ut, f]));
}

/**
 * El estado de la travesía.
 * @param {{ ic: object|null, estructura?: object|null, respuestas?: object, tests?: object[], dias?: object, ahora?: number }} p
 *   `estructura`: la del examen de la titulación (TITULACIONES[tit].estructura): da nombre y orden a los faros;
 *   `tests`: los exámenes de ESTE banco (examenesDe); `dias`: progress.get().dias.
 * @returns {null | { ideas: object[], faros: object[], temas: object[], total: number, dominadas: number, pct: number,
 *   examenes: {simulacro: boolean, inedito: boolean}, rangoAhora: string, rescate: boolean, ganadas: string[] }}
 *   `faros`: los de la carta general (tramos, farosDeTramos); `temas`: uno por tema (farosDeTemas), los del Temario.
 *   null sin conceptos (banco sin etiquetas): entonces no hay travesía.
 */
export function estadoTravesia({ ic, estructura = null, respuestas = {}, tests = [], dias = {}, ahora = Date.now() }) {
  const ideas = ideasDelBanco(ic);
  if (!ideas.length) return null;
  // Cuarentena: solo las respuestas a preguntas del estudio de las ideas.
  const estudio = new Set(ideas.flatMap((i) => i.qs));
  const resp = {};
  for (const id of Object.keys(respuestas ?? {})) if (estudio.has(id)) resp[id] = respuestas[id];
  const dom = ic.dominio(resp);
  const conEstado = ideas.map((i) => {
    const d = dom[i.id];
    return { id: i.id, etiqueta: i.etiqueta, bloque: i.bloque, ut: i.ut, estado: estadoIdea(d, i.qs.length), tasa: d?.tasa ?? null, vistas: d?.vistas ?? 0,
      rescatable: i.qs.some((q) => resp[q]?.ok1 === false) };
  });
  const temas = farosDeTemas(conEstado, estructura);
  const faros = farosDeTramos(temas, estructura);
  for (const f of faros) for (const i of f.ideas) i.faro = f.id;
  const total = conEstado.length;
  const dominadas = conEstado.filter((i) => i.estado === 'dominado').length;
  const pct = dominadas / total;
  const examenes = resumenExamenes(tests);
  const rescate = conEstado.some((i) => i.estado === 'dominado' && i.rescatable);
  const est = { ideas: conEstado, faros, temas, total, dominadas, pct, examenes, rescate };
  est.rangoAhora = rangoPara(pct, examenes);
  est.ganadas = insigniasGanadas({ faros: temas, dias, examenes, rescate });
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
 * pantalla de «5 minutos» al terminar). Una «Tema completo» por tema con TODAS sus ideas dominadas (`faros` = est.temas:
 * las insignias van por tema, no por tramo).
 */
export function insigniasGanadas({ faros = [], dias = {}, examenes = {}, rescate = false }) {
  const ids = [];
  if (hayUnaSemana(dias)) ids.push('semana');
  if (rescate) ids.push('rescate');
  if (examenes.simulacro) ids.push('simulacro');
  if (examenes.inedito) ids.push('inedito');
  for (const f of faros) if (f.completo) ids.push(idInsigniaTema(f));
  return ids;
}

/**
 * El catálogo de insignias de un banco, en el orden de la rejilla: fijas, una por tema (`faros` = est.temas) y las de examen.
 * `ganadas` = las guardadas ({ id: ISO }): las «Bloque completo» de la derrota antigua (`bloque:<faro antiguo>`) que el
 * alumno ya tenía se conservan y se enseñan detrás de las de tema; las que no ganó ya no existen (no se pueden ganar).
 */
export function catalogoInsignias(faros = [], ganadas = {}) {
  const fija = (id) => INSIGNIAS.find((x) => x.id === id);
  const antiguas = Object.keys(ganadas ?? {}).filter((id) => id.startsWith(PREFIJO_ANTIGUA)).map((id) => {
    const f = FAROS_ANTIGUOS.find((x) => PREFIJO_ANTIGUA + x.id === id);
    return f ? { id, f } : null;
  }).filter(Boolean).sort((a, b) => FAROS_ANTIGUOS.indexOf(a.f) - FAROS_ANTIGUOS.indexOf(b.f));
  return [
    ...ORDEN_FIJAS.map(fija),
    ...faros.map((f) => ({ id: idInsigniaTema(f), nombre: `Tema completo: ${f.corto}`, icono: 'ins-bloque',
      texto: `Domina todas las ideas de ${f.ut == null ? f.nombre.toLowerCase() : `«${f.nombre}»`}. Con el 80 % se enciende el faro; esta insignia pide todas.`,
      falta: `Vas por ${f.dominadas} de ${f.total} ideas.` })),
    ...antiguas.map(({ id, f }) => ({ id, nombre: `Bloque completo: ${f.corto}`, icono: 'ins-bloque', antigua: true,
      texto: `Dominaste todas las ideas de ${f.nombre.toLowerCase()} cuando la derrota tenía un faro por bloque. Ahora hay un faro por tema del temario; esta insignia la conservas.`,
      falta: '' })),
    ...ORDEN_FINAL.map(fija),
  ];
}

/** Lo que falta para una insignia que aún no se tiene, según el estado. */
export function faltaInsignia(ins, est) {
  if (ins.id.startsWith('tema:')) {
    const f = (est?.temas ?? est?.faros ?? []).find((x) => idInsigniaTema(x) === ins.id);
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
const ANCHO_CARTA = 358;

/**
 * Con cuatro faros (los cuatro temas del PY) o cinco (los cinco tramos de la PER) repartir los puntos de la carta deja
 * faros pegados: van en estos.
 */
const PUNTOS_FIJOS = {
  4: [[58, 262], [222, 232], [130, 150], [210, 92]],
  5: [[58, 262], [170, 238], [282, 196], [100, 124], [208, 90]],
};

/** Dónde va cada uno de `n` faros (hasta seis): con seis, en los puntos de la carta; con menos, repartidos a lo largo de la derrota. */
export function posicionesDerrota(n) {
  if (PUNTOS_FIJOS[n]) return PUNTOS_FIJOS[n].map((p) => [...p]);
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

/**
 * Medidas de la carta «densa» (más de seis faros; hoy ninguna titulación: la PER agrupa sus once temas en cinco tramos), en unidades de la carta (358 de ancho; a
 * 360 px de pantalla, una unidad ≈ 0,9 px). Los faros van en filas que se recorren en zigzag, de abajo arriba, y la
 * bandera del examen ocupa el hueco siguiente al último faro.
 *   xs       el centro de cada columna (ningún nombre se sale de la carta a 360 px)
 *   paso     entre filas: caben el marcador «estás aquí», el faro y su nombre
 *   salto    las columnas impares van más arriba: los nombres de dos faros vecinos no quedan a la misma altura
 *   arriba / abajo   margen hasta la fila de arriba (con el marcador) y bajo la de abajo (con el nombre y, en la
 *            grande, la costa del sur con la rosa y la cartela)
 */
const DENSA = {
  grande: { xs: [62, 179, 296], paso: 112, salto: 14, arriba: 86, abajo: 108 },
  compacta: { xs: [58, 139, 219, 300], paso: 94, salto: 22, arriba: 84, abajo: 58 },
};

/**
 * El trazado de la carta de la derrota para `n` faros: dónde va cada faro y la bandera, y el alto de la carta.
 *   - Hasta seis faros (el PY tiene cuatro temas): la carta de siempre (358 × 320; en compacto, 358 × 232, con las capas
 *     HTML medidas sobre 360 de alto: las y se encogen, el dibujo no).
 *   - Con más (la PER, once): la carta densa, más alta cuantas más filas hagan falta.
 * @returns {{ densa: boolean, ancho: number, alto: number, altoCapas: number, pos: [number, number][], bandera: [number, number] }}
 *   `alto` = alto del SVG; `altoCapas` = alto de referencia de las posiciones (top = y / altoCapas).
 */
export function trazadoDerrota(n, { compacta = false } = {}) {
  if (n <= PUNTOS_DERROTA.length) return { densa: false, ancho: ANCHO_CARTA, alto: compacta ? 232 : 320, altoCapas: compacta ? 360 : 320, pos: posicionesDerrota(n), bandera: BANDERA };
  const { alto, huecos } = rejilla(n + 1, compacta ? DENSA.compacta : DENSA.grande);
  return { densa: true, ancho: ANCHO_CARTA, alto, altoCapas: alto, pos: huecos.slice(0, n), bandera: huecos[n] };
}

/** `k` huecos en filas recorridas en zigzag de abajo arriba, con las medidas `m` (xs, paso, salto, arriba, abajo). */
function rejilla(k, m) {
  const cols = m.xs.length;
  const filas = Math.ceil(k / cols);
  const alto = m.arriba + (filas - 1) * m.paso + m.abajo;
  const huecos = Array.from({ length: k }, (_, i) => {
    const fila = Math.floor(i / cols);
    const col = fila % 2 ? cols - 1 - (i % cols) : i % cols;
    return [m.xs[col], alto - m.abajo - fila * m.paso - (col % 2 ? m.salto : 0)];
  });
  return { alto, huecos };
}

/**
 * Medidas de la carta de aproximación (el zoom a un faro): una boya por tema del tramo (o por clase del tema), con dos
 * líneas debajo (el nombre y la cuenta), en una, dos o tres columnas. Más hueco entre filas que la carta densa.
 */
const APROX = { paso: 130, salto: 14, arriba: 86, abajo: 132, xs: { 1: [179], 2: [104, 254], 3: [62, 179, 296] } };

/**
 * El trazado de la carta de aproximación para `n` boyas: dónde va cada una y el alto de la carta (no hay bandera: la
 * derrota sigue en la carta general).
 * @returns {{ ancho: number, alto: number, pos: [number, number][] }}
 */
export function trazadoAproximacion(n) {
  const { alto, huecos } = rejilla(n, { ...APROX, xs: APROX.xs[Math.max(1, Math.min(3, n))] });
  return { ancho: ANCHO_CARTA, alto, pos: huecos };
}

// --- la carta de aproximación (el zoom a un faro) ---------------------------------------------------------------------------

/** La luz de la boya de una clase según su estado (estadoLeccion de src/course/engine.js) y cómo se dice. */
export const LUZ_CLASE = { nueva: 'off', empezada: 'parcial', saltada: 'parcial', vista: 'parcial', repasar: 'parcial', dominada: 'on' };
export const TEXTO_CLASE = { nueva: 'sin empezar', empezada: 'a medias', saltada: 'saltada', vista: 'vista', repasar: 'a repasar', dominada: 'aprendida' };

/**
 * Las boyas de la carta de aproximación de un faro (lo que se ve al acercarse):
 *   - un faro con varios temas (un tramo de la PER): una boya por TEMA, con la luz y la cuenta de ese tema, que son las del
 *     Temario (el mismo objeto de est.temas), y enlace a su tema;
 *   - un faro de un solo tema (los del PY; Meteorología en la PER): una boya por CLASE del tema, con el estado de la clase
 *     (sin empezar, a medias, vista, aprendida…: el de estadoLeccion, el mismo que enseña la página del tema) y enlace a
 *     la clase. No lleva cuenta de ideas: el reparto de ideas por clase usa otro criterio que el de los faros y no
 *     cuadraría con ellos. Si el tema no tiene clases, su única boya es el tema.
 * `aqui`: la boya de lo que toca (el tema de la sesión de hoy, o la siguiente clase de la ruta).
 * @param {object} faro  uno de est.faros
 * @param {{ clases?: { id: string, titulo: string, estado: string }[], utQueToca?: number|null, claseQueToca?: string|null }} [o]
 *   `clases`: las del tema del faro (solo hacen falta si tiene un único tema)
 * @returns {{ nivel: 'temas'|'clases', boyas: { id: string, corto: string, nombre: string, cuenta: string, texto: string, estado: string, ruta: string[]|null, aqui: boolean }[] }}
 */
export function boyasDeFaro(faro, { clases = [], utQueToca = null, claseQueToca = null } = {}) {
  if (faro.temas.length === 1 && clases.length) {
    return { nivel: 'clases', boyas: clases.map((c, i) => ({ id: c.id, corto: `Clase ${i + 1}`, nombre: c.titulo, cuenta: TEXTO_CLASE[c.estado] ?? TEXTO_CLASE.nueva,
      texto: TEXTO_CLASE[c.estado] ?? TEXTO_CLASE.nueva, estado: LUZ_CLASE[c.estado] ?? 'off', ruta: ['curso', c.id], aqui: c.id === claseQueToca })) };
  }
  return { nivel: 'temas', boyas: faro.temas.map((t) => ({ id: t.id, corto: t.corto, nombre: t.nombre, cuenta: `${t.dominadas}/${t.total}`,
    texto: `${t.dominadas} de ${cuenta(t.total, 'idea')} dominadas${t.estado === 'on' ? ', luz encendida' : ''}`, estado: t.estado,
    ruta: t.ut == null ? null : ['temario', String(t.ut)], aqui: t.ut != null && t.ut === utQueToca })) };
}

/** El faro que se enseña al abrir la pantalla: el más cercano a encenderse; si todos están encendidos o ninguno empezado, el primero. */
export function faroInicial(faros) {
  const sin = faros.filter((f) => f.estado !== 'on' && f.vistas > 0);
  if (!sin.length) return (faros.find((f) => f.estado !== 'on') ?? faros[0])?.id ?? null;
  return sin.sort((a, b) => b.pct - a.pct)[0].id;
}

import { cuenta } from '../texto.js';
// ¿Estoy listo? Probabilidad de aprobar el examen con las reglas reales (aciertos mínimos y fallos máximos por
// bloque), a partir de lo que el alumno acierta en cada tema. Funciones puras.
//
// Modelo: en cada tema, la probabilidad de acertar una pregunta es desconocida; con a aciertos y f fallos se toma
// la distribución Beta(1 + a, 1 + f) (pocos datos → mucha incertidumbre). Los fallos de un bloque de n preguntas
// siguen entonces una beta-binomial. Se combinan los bloques (independientes) y se suman las probabilidades de los
// repartos que aprueban: total de fallos ≤ n_total − mínimo de aciertos y, en cada bloque con límite, fallos ≤ límite.
//
// Para no ser optimista con preguntas repetidas: una pregunta respondida una sola vez cuenta entera; si la has
// respondido varias veces, cuenta mitad tu primer intento y mitad el último (acertarla tras verla no es lo mismo
// que saberla de entrada). Y los simulacros completos recientes corrigen el resultado: el modelo vale como
// PESO_MODELO simulacros y cada simulacro reciente suma su apto o no apto. Un examen de preguntas que el alumno no había
// visto dice más que acertar preguntas repetidas: el examen final pesa PESO_FINAL y un simulacro o examen real con al
// menos un INEDITO de preguntas nuevas, PESO_INEDITO (los demás, 1).

export const MIN_RESPUESTAS = 10; // preguntas respondidas por tema para opinar
export const LISTO = 0.8;
export const CASI = 0.5;
export const PESO_MODELO = 3; // el modelo cuenta como 3 simulacros
export const SIMULACROS = 5; // simulacros completos recientes que se tienen en cuenta
export const PESO_FINAL = 3; // el examen final (preguntas reservadas, nunca estudiadas)
export const PESO_INEDITO = 2; // simulacro o examen real con la mayoría de preguntas nuevas
export const INEDITO = 0.6; // fracción de preguntas nuevas para que un examen cuente como inédito

/** Peso de un examen completo en «¿Estás listo?». */
export function pesoExamen(t) {
  if (t.tipo === 'final') return PESO_FINAL;
  if (t.total && t.nuevas != null && t.nuevas / t.total >= INEDITO) return PESO_INEDITO;
  return 1;
}

/** log Γ(x) (aproximación de Lanczos), suficiente para las combinatorias de un examen. */
function lgamma(x) {
  const g = 7;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
const lbeta = (a, b) => lgamma(a) + lgamma(b) - lgamma(a + b);
const lcomb = (n, k) => lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1);

/** Probabilidades de cometer 0..n fallos en n preguntas, con aciertos/fallos observados. */
export function fallosBloque(n, aciertos, fallos) {
  const a = 1 + fallos; // la «probabilidad de fallar» sigue Beta(1 + f, 1 + a)
  const b = 1 + aciertos;
  const out = [];
  for (let k = 0; k <= n; k++) out.push(Math.exp(lcomb(n, k) + lbeta(k + a, n - k + b) - lbeta(a, b)));
  const s = out.reduce((x, y) => x + y, 0);
  return out.map((p) => p / s);
}

/** Probabilidad de aprobar dados los repartos de fallos de cada bloque. */
export function probAprobar(estructura, distribuciones) {
  const total = estructura.bloques.reduce((s, b) => s + b.n, 0);
  const maxFallos = total - estructura.minAciertos;
  let acc = [1]; // acc[e] = P(e fallos en total y ningún bloque por encima de su límite)
  estructura.bloques.forEach((b, i) => {
    const d = distribuciones[i];
    const lim = b.maxErrores ?? b.n;
    const next = new Array(acc.length + b.n).fill(0);
    for (let e = 0; e < acc.length; e++) for (let k = 0; k <= Math.min(lim, b.n); k++) next[e + k] += acc[e] * d[k];
    acc = next;
  });
  return acc.slice(0, maxFallos + 1).reduce((x, y) => x + y, 0);
}

/**
 * @param {object} estructura  PER o PY (bloques con n y maxErrores, minAciertos)
 * @param {Array} preguntas    banco (ut, anulada, correcta)
 * @param {Record<string,{ok:boolean}>} respuestas
 * @returns {{ estado: 'faltan-datos'|'listo'|'casi'|'aun-no', prob: number|null, temasSinDatos: object[],
 *   limitante: object|null, temas: { ut, titulo, hechas, aciertos, pct, maxErrores, pFallaLimite }[] }}
 */
/** Aciertos que cuenta una respuesta: entera si es la primera vez; si se repitió, mitad primer intento y mitad último. */
export function aciertoPonderado(r) {
  if (!r) return 0;
  const n = r.n ?? 1;
  if (n <= 1 || r.ok1 == null) return r.ok ? 1 : 0;
  return 0.5 * (r.ok1 ? 1 : 0) + 0.5 * (r.ok ? 1 : 0);
}

/** Simulacros completos (con apto/no apto) más recientes de una lista de tests. */
export function simulacrosRecientes(tests = [], max = SIMULACROS) {
  return tests.filter((t) => t.apto === true || t.apto === false).slice(-max);
}

export function estoyListo(estructura, preguntas, respuestas = {}, tests = []) {
  const temas = estructura.bloques.map((b) => {
    const qs = preguntas.filter((q) => q.ut === b.ut && !q.anulada && q.correcta && respuestas[q.id]);
    const hechas = qs.length;
    const aciertosReales = qs.filter((q) => respuestas[q.id].ok).length;
    const aciertos = qs.reduce((s, q) => s + aciertoPonderado(respuestas[q.id]), 0);
    const total = preguntas.filter((q) => q.ut === b.ut && !q.anulada && q.correcta).length;
    const dist = fallosBloque(b.n, aciertos, hechas - aciertos);
    const pFallaLimite = b.maxErrores == null ? null : dist.slice(b.maxErrores + 1).reduce((x, y) => x + y, 0);
    const necesarias = Math.min(MIN_RESPUESTAS, total);
    return { ut: b.ut, titulo: b.titulo, n: b.n, hechas, necesarias, aciertos, aciertosReales, pct: hechas ? Math.round((100 * aciertos) / hechas) : null, maxErrores: b.maxErrores ?? null, pFallaLimite, suficiente: hechas >= necesarias, dist };
  });
  const temasSinDatos = temas.filter((t) => !t.suficiente);
  const sims = simulacrosRecientes(tests);
  const simulacros = { hechos: sims.length, aprobados: sims.filter((t) => t.apto).length, ineditos: sims.filter((t) => pesoExamen(t) > 1).length,
    peso: sims.reduce((s, t) => s + pesoExamen(t), 0), pesoAprobados: sims.filter((t) => t.apto).reduce((s, t) => s + pesoExamen(t), 0) };
  if (temasSinDatos.length) return { estado: 'faltan-datos', prob: null, probModelo: null, simulacros, temasSinDatos, limitante: null, temas };
  const probModelo = probAprobar(estructura, temas.map((t) => t.dist));
  const prob = (PESO_MODELO * probModelo + simulacros.pesoAprobados) / (PESO_MODELO + simulacros.peso);
  // Lo que más te tumba: el tema que, si lo dominaras (95 % de acierto), más subiría tu probabilidad de aprobar.
  let limitante = null;
  let mejora = 0;
  temas.forEach((t, i) => {
    const d = temas.map((x, j) => (j === i ? fallosBloque(x.n, 95, 5) : x.dist));
    const delta = probAprobar(estructura, d) - probModelo;
    if (delta > mejora + 1e-9) { mejora = delta; limitante = { ...t, mejora: delta }; }
  });
  const estado = prob >= LISTO ? 'listo' : prob >= CASI ? 'casi' : 'aun-no';
  return { estado, prob, probModelo, simulacros, temasSinDatos, limitante: mejora >= 0.02 ? limitante : null, temas };
}

/** En palabras, para la pantalla Hoy. */
export function lineaListo(r) {
  if (r.estado === 'faltan-datos') {
    const nombres = r.temasSinDatos.map((t) => t.titulo);
    const lista = nombres.length > 3 ? `${nombres.slice(0, 3).join(', ')} y ${nombres.length - 3} más` : nombres.join(', ').replace(/, ([^,]*)$/, ' y $1');
    return `Para saber si estás listo necesito que respondas al menos ${cuenta(MIN_RESPUESTAS, 'pregunta')} de cada tema. Te faltan: ${lista}.`;
  }
  const de10 = Math.round(r.prob * 10);
  const base = r.estado === 'listo' ? '✅ Estás listo' : r.estado === 'casi' ? 'Casi' : 'Todavía no';
  let txt = `${base}: con lo que aciertas ahora aprobarías unas ${de10} de cada 10 veces.`;
  const s = r.simulacros;
  if (s?.hechos) txt += ` En tus últimos ${s.hechos === 1 ? 'simulacro' : `${cuenta(s.hechos, 'simulacro')}`} ${s.hechos === 1 ? (s.aprobados ? 'aprobaste' : 'no aprobaste') : `aprobaste ${s.aprobados}`}, y eso ya cuenta${s.ineditos ? ' (más los exámenes con preguntas que no habías visto)' : ''}.`;
  else txt += ' Haz un simulacro completo: es la mejor prueba.';
  if (r.limitante) {
    const t = r.limitante;
    txt += ` Lo que más te puede tumbar: ${t.titulo} (aciertas el ${t.pct} %${t.maxErrores != null ? `, y solo se pueden fallar ${t.maxErrores} de ${t.n}` : ''}).`;
  }
  return txt;
}

// ---------------------------------------------------------------------------------------------------------------
// Apoyo por concepto (docs/CONCEPTOS.md). NO cambia la probabilidad de arriba: es una vista de qué ideas faltan por
// dominar en cada tema. Sustituir el cálculo por uno por concepto exige calibrarlo con resultados reales de examen
// (cuántas ideas flojas se pueden tener y aprobar); mientras tanto, la probabilidad oficial sigue siendo la del tema.

/** Estado de una idea para el alumno: «sabida» (vista y no floja), «floja» o «sin-ver» (de dominio() del motor de conceptos). */
export const estadoIdea = (d) => (!d || !d.vistas ? 'sin-ver' : d.estado === 'flojo' ? 'floja' : 'sabida');

/**
 * Ideas de cada tema del examen y cómo las lleva el alumno. El tema de una idea es el de la mayoría de sus preguntas en
 * este banco. `ic` = índice de conceptos del banco (src/conceptos) o null (sin etiquetas → null).
 * @returns {{ ut, titulo, maxErrores, total, sabidas, flojas: object[], sinVer: object[] }[] | null}
 *   flojas y sinVer: { id, etiqueta, clases, tasa, vistas } (las flojas, la peor primero)
 */
export function conceptosPorTema(estructura, ic, respuestas = {}) {
  if (!ic) return null;
  const dom = ic.dominio(respuestas);
  const porUt = new Map(estructura.bloques.map((b) => [b.ut, { ut: b.ut, titulo: b.titulo, maxErrores: b.maxErrores ?? null, total: 0, sabidas: 0, flojas: [], sinVer: [] }]));
  for (const c of ic.conceptosConPreguntas()) {
    if (c.tipo !== 'concepto') continue;
    const qs = ic.preguntasDe(c.id, { soloEstudio: false, conDescendientes: false });
    if (!qs.length) continue;
    const n = new Map();
    for (const q of qs) n.set(q.ut, (n.get(q.ut) ?? 0) + 1);
    const ut = [...n].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
    const t = porUt.get(ut);
    if (!t) continue;
    const d = dom[c.id];
    const x = { id: c.id, etiqueta: c.etiqueta, clases: c.clases ?? [], tasa: d?.tasa ?? null, vistas: d?.vistas ?? 0 };
    t.total += 1;
    const e = estadoIdea(d);
    if (e === 'sabida') t.sabidas += 1;
    else if (e === 'floja') t.flojas.push(x);
    else t.sinVer.push(x);
  }
  for (const t of porUt.values()) t.flojas.sort((a, b) => a.tasa - b.tasa || a.etiqueta.localeCompare(b.etiqueta));
  return [...porUt.values()].filter((t) => t.total);
}

// ¿Estoy listo? Probabilidad de aprobar el examen con las reglas reales (aciertos mínimos y fallos máximos por
// bloque), a partir de lo que el alumno acierta en cada tema. Funciones puras.
//
// Modelo: en cada tema, la probabilidad de acertar una pregunta es desconocida; con a aciertos y f fallos se toma
// la distribución Beta(1 + a, 1 + f) (pocos datos → mucha incertidumbre). Los fallos de un bloque de n preguntas
// siguen entonces una beta-binomial. Se combinan los bloques (independientes) y se suman las probabilidades de los
// repartos que aprueban: total de fallos ≤ n_total − mínimo de aciertos y, en cada bloque con límite, fallos ≤ límite.

export const MIN_RESPUESTAS = 10; // preguntas respondidas por tema para opinar
export const LISTO = 0.8;
export const CASI = 0.5;

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
export function estoyListo(estructura, preguntas, respuestas = {}) {
  const temas = estructura.bloques.map((b) => {
    const qs = preguntas.filter((q) => q.ut === b.ut && !q.anulada && q.correcta && respuestas[q.id]);
    const aciertos = qs.filter((q) => respuestas[q.id].ok).length;
    const hechas = qs.length;
    const total = preguntas.filter((q) => q.ut === b.ut && !q.anulada && q.correcta).length;
    const dist = fallosBloque(b.n, aciertos, hechas - aciertos);
    const pFallaLimite = b.maxErrores == null ? null : dist.slice(b.maxErrores + 1).reduce((x, y) => x + y, 0);
    return { ut: b.ut, titulo: b.titulo, n: b.n, hechas, aciertos, pct: hechas ? Math.round((100 * aciertos) / hechas) : null, maxErrores: b.maxErrores ?? null, pFallaLimite, suficiente: hechas >= Math.min(MIN_RESPUESTAS, total), dist };
  });
  const temasSinDatos = temas.filter((t) => !t.suficiente);
  if (temasSinDatos.length) return { estado: 'faltan-datos', prob: null, temasSinDatos, limitante: null, temas };
  const prob = probAprobar(estructura, temas.map((t) => t.dist));
  // Lo que más te tumba: el tema que, si lo dominaras (95 % de acierto), más subiría tu probabilidad de aprobar.
  let limitante = null;
  let mejora = 0;
  temas.forEach((t, i) => {
    const d = temas.map((x, j) => (j === i ? fallosBloque(x.n, 95, 5) : x.dist));
    const delta = probAprobar(estructura, d) - prob;
    if (delta > mejora + 1e-9) { mejora = delta; limitante = { ...t, mejora: delta }; }
  });
  const estado = prob >= LISTO ? 'listo' : prob >= CASI ? 'casi' : 'aun-no';
  return { estado, prob, temasSinDatos, limitante: mejora >= 0.02 ? limitante : null, temas };
}

/** En palabras, para la pantalla Hoy. */
export function lineaListo(r) {
  if (r.estado === 'faltan-datos') {
    const nombres = r.temasSinDatos.map((t) => t.titulo);
    const lista = nombres.length > 3 ? `${nombres.slice(0, 3).join(', ')} y ${nombres.length - 3} más` : nombres.join(', ').replace(/, ([^,]*)$/, ' y $1');
    return `Para saber si estás listo necesito que respondas al menos ${MIN_RESPUESTAS} preguntas de cada tema. Te faltan: ${lista}.`;
  }
  const de10 = Math.round(r.prob * 10);
  const base = r.estado === 'listo' ? '✅ Estás listo' : r.estado === 'casi' ? 'Casi' : 'Todavía no';
  let txt = `${base}: con lo que aciertas ahora aprobarías unas ${de10} de cada 10 veces.`;
  if (r.limitante) {
    const t = r.limitante;
    txt += ` Lo que más te puede tumbar: ${t.titulo} (aciertas el ${t.pct} %${t.maxErrores != null ? `, y solo se pueden fallar ${t.maxErrores} de ${t.n}` : ''}).`;
  }
  return txt;
}

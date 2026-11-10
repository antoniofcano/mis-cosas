// Tu velocidad en carta (R-42): cuánto tardas en cada TIPO de problema de carta, de media y con su tendencia, frente
// al tiempo que te deja tu examen. Funciones puras (sin DOM):
//  - El tipo de problema de una pregunta real es el `ejercicio` de su solución programada (src/bancos/soluciones.js),
//    que coincide con el id del ejercicio generado del mismo tipo (src/exercises/types/*.js). Una de carta sin
//    solución programada es «carta» (otras de carta); una de cualquier otro tema, «teoria».
//  - Las muestras salen de dos sitios: de los exámenes (simulacros, convocatorias, examen final y ensayos con tiempo
//    por pregunta, guardados en el registro del test: `tq`, ver `tiemposDelTest`) y de la práctica (preguntas de carta
//    en las tandas y ejercicios de carta, guardados solo en el aparato: src/store/tiempos.js).
//  - El tiempo solo corre con la pestaña visible (el criterio de la vista del examen; ver `acumulador`).
// La decisión de dónde se guarda cada cosa está en docs/SYNC.md («Tiempo por pregunta»).

/** Nombres cortos de los tipos de problema (ids de ejercicio). */
export const NOMBRES_TIPO = {
  'situacion-dos-demoras': 'Situación por dos demoras',
  'situacion-demora-distancia': 'Situación por demora y distancia',
  'situacion-dos-distancias': 'Situación por dos distancias',
  'demoras-no-simultaneas': 'Demoras no simultáneas',
  'ct-enfilacion': 'Ct por enfilación u oposición',
  'distancia-faro': 'Distancia a un faro',
  'estima-directa': 'Situación de estima',
  'rumbo-distancia': 'Rumbo, distancia y hora',
  'rumbo-pasar-distancia': 'Rumbo para pasar a una distancia',
  'corriente-efectiva': 'Corriente: rumbo efectivo',
  'corriente-rumbo-a-dar': 'Corriente: rumbo a dar',
  'corriente-desconocida': 'Corriente desconocida',
  abatimiento: 'Viento y abatimiento',
  'viento-aparente': 'Viento aparente',
  'conversion-rumbos': 'Conversión de rumbos (Ct)',
  'estima-analitica': 'Estima analítica',
  'marea-sonda': 'Marea y sonda',
  hora: 'La hora a bordo',
  carta: 'Otras de carta',
  teoria: 'Teoría (cualquier tema)',
};
export const nombreTipo = (id) => NOMBRES_TIPO[id] ?? id;
export const esTipoCarta = (id) => !!id && id !== 'teoria';

/** Un problema de carta no cuenta más de esto (te dejaste la pregunta abierta y te fuiste a otra cosa). */
export const TOPE_PREGUNTA_S = 30 * 60;
/** Muestras de un tipo que se tienen en cuenta (las más recientes). */
export const MUESTRAS_TIPO = 12;
/** Mínimo de muestras para dar un consejo con un tipo; con menos, la tabla lo enseña pero no se aconseja con él. */
export const MIN_CONSEJO = 2;
/** Mínimo de muestras para hablar de tendencia (mitad antigua frente a mitad reciente). */
export const MIN_TENDENCIA = 4;

/**
 * Tipo de problema de una pregunta real.
 * @param {object} q  la pregunta ({ id, ut })
 * @param {object|undefined} sol  su solución programada (SOLUCIONES[q.id])
 * @param {{ cartaUt?: number, deCarta?: boolean }} o  cartaUt: el tema de carta de la titulación; deCarta: la pregunta
 *   se resuelve en la carta o con cuentas de carta (mareas, loxodrómica) aunque esté en otro tema
 */
export function tipoDePregunta(q, sol, { cartaUt = null, deCarta = false } = {}) {
  if (sol?.ejercicio) return sol.ejercicio;
  if (deCarta || (cartaUt != null && q?.ut === cartaUt)) return 'carta';
  return 'teoria';
}

/**
 * Acumulador de tiempo con la pestaña visible (el criterio de la vista del examen: solo cuenta mientras la pestaña está
 * visible y la vista activa). Se le avisa en cada cambio de visibilidad (`marca`): suma el tramo que acaba si durante
 * él la pestaña estaba visible, y apunta cómo está ahora para el tramo siguiente.
 * @param {{ ahora?: () => number, visible?: () => boolean, inicial?: number }} o
 */
export function acumulador({ ahora = () => Date.now(), visible = () => true, inicial = 0 } = {}) {
  let ultimo = ahora();
  let vis = visible();
  let total = inicial;
  return {
    /** Cierra el tramo actual (suma si estaba visible) y devuelve lo que ha sumado en él. */
    marca() {
      const t = ahora();
      const d = vis ? Math.max(0, t - ultimo) : 0;
      total += d;
      ultimo = t;
      vis = visible();
      return d;
    },
    ms() { this.marca(); return total; },
    /** Vuelve a empezar (desde 0 o desde `ms`). */
    reinicia(ms = 0) { ultimo = ahora(); vis = visible(); total = ms; },
  };
}

/**
 * Tiempo por pregunta de un examen para su registro (`recordTest`, campo `tq`): [[id, segundos, acierto 1|0, tipo]].
 * Solo las preguntas en las que se ha estado algo (≥ 1 s). Compacto a propósito: viaja en la operación «x» del registro
 * de sincronización (src/store/sync/operaciones.js; 64 KiB por operación como mucho).
 * @param {{ preguntas: object[], ms: Record<string, number>, detalle: {id, ok}[], tipoDe: (q) => string }} o
 */
export function tiemposDelTest({ preguntas, ms = {}, detalle = [], tipoDe }) {
  const ok = new Map(detalle.map((d) => [d.id, d.ok]));
  return preguntas.map((q) => [q.id, Math.min(TOPE_PREGUNTA_S, Math.round((ms[q.id] ?? 0) / 1000)), ok.get(q.id) ? 1 : 0, tipoDe(q)])
    .filter((x) => x[1] >= 1);
}

/** ¿Una entrada `tq` bien formada? (registros de otros aparatos o de versiones futuras: se ignora lo que no lo es) */
const filaValida = (x) => Array.isArray(x) && typeof x[0] === 'string' && Number.isFinite(x[1]) && x[1] > 0 && typeof x[3] === 'string';

/**
 * Muestras de tiempo de los exámenes y de la práctica, en una sola lista: { tipo, s, ok, t (ms), origen }.
 * @param {{ tests?: object[], practica?: {t, y, s, o}[] }} o
 */
export function muestras({ tests = [], practica = [] } = {}) {
  const out = [];
  for (const t of tests) {
    if (!Array.isArray(t?.tq)) continue;
    const ms = Date.parse(t.t ?? '') || 0;
    for (const x of t.tq) if (filaValida(x)) out.push({ tipo: x[3], s: Math.min(TOPE_PREGUNTA_S, x[1]), ok: x[2] === 1, t: ms, origen: 'examen' });
  }
  for (const e of practica) {
    if (!e || typeof e.y !== 'string' || !(e.s > 0)) continue;
    out.push({ tipo: e.y, s: Math.min(TOPE_PREGUNTA_S, e.s), ok: !!e.o, t: e.t ?? 0, origen: 'practica' });
  }
  return out.sort((a, b) => a.t - b.t);
}

const media = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);

/**
 * Tu tiempo por tipo de problema: media (segundos) de las MUESTRAS_TIPO más recientes, aciertos y tendencia (la mitad
 * reciente frente a la antigua: «baja» = vas más rápido, «sube» = más lento, «estable»; null con pocas muestras).
 * `disponible` (segundos): el tiempo que te deja el examen por pregunta de carta; `estado`: «cabe» (≤ 75 %), «justo» o
 * «se-pasa» (más que lo disponible). Ordenado por tipo de carta primero (de más lento a más rápido) y la teoría al final.
 */
export function velocidadPorTipo({ tests = [], practica = [], disponibleCartaS = null, disponibleTeoriaS = null, max = MUESTRAS_TIPO } = {}) {
  const porTipo = new Map();
  for (const m of muestras({ tests, practica })) {
    if (!porTipo.has(m.tipo)) porTipo.set(m.tipo, []);
    porTipo.get(m.tipo).push(m);
  }
  const filas = [...porTipo].map(([tipo, ms]) => {
    const recientes = ms.slice(-max);
    const s = recientes.map((x) => x.s);
    const m = media(s);
    let tendencia = null;
    if (recientes.length >= MIN_TENDENCIA) {
      const mitad = Math.floor(recientes.length / 2);
      const antes = media(s.slice(0, mitad));
      const ahora = media(s.slice(-mitad));
      const r = ahora / antes;
      tendencia = r <= 0.9 ? 'baja' : r >= 1.1 ? 'sube' : 'estable';
    }
    const disponible = tipo === 'teoria' ? disponibleTeoriaS : disponibleCartaS;
    const estado = disponible ? (m > disponible ? 'se-pasa' : m > 0.75 * disponible ? 'justo' : 'cabe') : null;
    return { tipo, nombre: nombreTipo(tipo), carta: esTipoCarta(tipo), n: recientes.length, total: ms.length, mediaS: m, aciertos: recientes.filter((x) => x.ok).length,
      examen: recientes.filter((x) => x.origen === 'examen').length, tendencia, disponibleS: disponible, estado };
  });
  return filas.sort((a, b) => (a.carta === b.carta ? b.mediaS - a.mediaS : a.carta ? -1 : 1));
}

/** «1 min 20 s», «45 s», «12 min». */
export function duracion(s) {
  const r = Math.round(s ?? 0);
  if (r < 60) return `${r} s`;
  const m = Math.floor(r / 60);
  const q = r % 60;
  return m >= 10 || !q ? `${m} min` : `${m} min ${q} s`;
}

/** «8:40» (minutos:segundos), para las tablas estrechas. */
export const mmssCorto = (s) => { const r = Math.round(s ?? 0); return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}`; };

/**
 * Por dónde empezar la carta, con tus tiempos: los tipos que te llevan más de lo disponible al final, y primero los que
 * haces rápido y bien. null sin datos suficientes (ningún tipo de carta con MIN_CONSEJO muestras).
 * @returns {{ texto: string, primero: string[], alFinal: string[] } | null}
 */
export function consejoVelocidad(filas, { disponibleCartaS = null } = {}) {
  const carta = filas.filter((f) => f.carta && f.n >= MIN_CONSEJO);
  if (!carta.length) return null;
  const nombres = (xs) => xs.map((f) => f.nombre.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' y $1');
  const lentos = carta.filter((f) => f.estado === 'se-pasa');
  // Primero: los rápidos que además aciertas (al menos la mitad).
  const rapidos = carta.filter((f) => f.estado !== 'se-pasa' && f.aciertos * 2 >= f.n).sort((a, b) => a.mediaS - b.mediaS).slice(0, 3);
  const disp = disponibleCartaS ? `unos ${duracion(disponibleCartaS)}` : null;
  let texto;
  if (lentos.length) {
    texto = `${rapidos.length ? `Empieza la carta por ${nombres(rapidos)}: los haces rápido y bien. ` : ''}Deja para el final ${nombres(lentos)}: te llevan de media ${lentos.map((f) => duracion(f.mediaS)).join(', ').replace(/, ([^,]*)$/, ' y $1')}${disp ? ` y tienes ${disp} por pregunta de carta` : ''}. Si se te acaba el tiempo, que sea en esas.`;
  } else if (rapidos.length) {
    texto = `Todos tus tipos de carta caben en el tiempo${disp ? ` (${disp} por pregunta)` : ''}. Empieza por ${nombres(rapidos)}, que los haces más rápido, para asegurar esos puntos, y sigue con el resto.`;
  } else {
    texto = `Tu tiempo cabe${disp ? ` (${disp} por pregunta de carta)` : ''}, pero aún fallas más de la mitad en ${nombres(carta)}: antes que la velocidad, el método. Repásalos con «Resolver paso a paso».`;
  }
  return { texto, primero: rapidos.map((f) => f.tipo), alFinal: lentos.map((f) => f.tipo) };
}

/**
 * El tiempo de UN examen por tipo (para su resultado): { tipo, nombre, n, mediaS, totalS, aciertos }, de carta
 * primero. Sale de su `tq`.
 */
export function tiempoDelExamen(tq = []) {
  return velocidadPorTipo({ tests: [{ t: '', tq }], max: Infinity }).map((f) => ({ ...f, totalS: f.mediaS * f.n }));
}

/** Resumen en texto (para `nautica.state()`): una línea por tipo. */
export function resumenVelocidad(filas, consejo) {
  if (!filas.length) return 'VELOCIDAD: sin datos (haz un simulacro o practica la carta)';
  return [`VELOCIDAD por tipo (media, n):`, ...filas.map((f) => `- ${f.nombre}: ${duracion(f.mediaS)} (${f.n})${f.disponibleS ? ` · disponible ${duracion(f.disponibleS)} · ${f.estado}` : ''}${f.tendencia ? ` · tendencia ${f.tendencia}` : ''}`),
    consejo ? `CONSEJO: ${consejo.texto}` : ''].filter(Boolean).join('\n');
}

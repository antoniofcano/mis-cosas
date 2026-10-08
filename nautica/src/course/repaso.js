import { diaISO } from '../texto.js';
// Repaso espaciado de fallos (B1). Funciones puras: el estado de cada pregunta va en su registro de respuesta
// (progress.exams[id].rep = { racha, prox } o null) y la fecha es la local 'YYYY-MM-DD'.
//
//   fallo                      → vuelve mañana y la racha se pone a 0 (también si ya estaba en la cola)
//   acierto el día que toca    → racha 1: a los 3 días; racha 2: a los 7; racha 3: sale de la cola
//   acierto antes de que toque → no cambia nada (no se adelanta el repaso)
//
// Las respuestas guardadas antes de existir la cola no tienen `rep`: si su última respuesta es un fallo, cuentan
// como pendientes desde hoy. Así no hace falta migrar nada y una copia de seguridad antigua se recupera igual.
//
// Repaso por concepto (docs/CONCEPTOS.md), solo si el banco tiene sus preguntas etiquetadas: lo que se repasa es la
// IDEA, no la letra. Las preguntas de la cola se agrupan por su concepto principal (una entrada por concepto) y, al
// tocar, se pregunta OTRA del mismo concepto y del mismo banco (planRepaso). El estado de cada concepto se guarda
// aparte (progress.repConceptos[<eje>/<tit>][concepto] = { racha, prox, t } o { fuera: true, t }), con los mismos
// intervalos; el de cada pregunta sigue en su registro como siempre. Mientras un concepto no tenga estado propio (o
// tenga un fallo posterior a él), su fecha sale de sus preguntas: así un progreso antiguo se lee sin migrar, y sin
// etiquetas todo funciona exactamente como antes (una entrada por pregunta).

export const INTERVALOS = [1, 3, 7]; // días hasta el siguiente repaso con 0, 1 y 2 aciertos seguidos
export const ACIERTOS_PARA_SALIR = 3;
export const MIN_POR_PREGUNTA = 0.8; // minutos estimados por pregunta de repaso (con su explicación)

export const diaLocal = diaISO;

/** 'YYYY-MM-DD' + n días. */
export function sumaDias(fecha, n) {
  const [y, m, d] = fecha.split('-').map(Number);
  const t = new Date(y, m - 1, d + n);
  return t.toLocaleDateString('sv-SE');
}

/** Estado de repaso de un registro, con las respuestas antiguas (sin `rep`) interpretadas. */
export function repasoDe(reg, hoy) {
  if (!reg) return null;
  if (reg.rep !== undefined) return reg.rep;
  return reg.ok === false ? { racha: 0, prox: hoy } : null;
}

/** Nuevo estado tras responder. `anterior` es el registro previo de la pregunta (o undefined). */
export function siguienteRepaso(anterior, ok, hoy) {
  const rep = repasoDe(anterior, hoy);
  if (!ok) return { racha: 0, prox: sumaDias(hoy, INTERVALOS[0]) };
  if (!rep) return null; // acierto fuera de la cola: no entra
  if (rep.prox > hoy) return rep; // aún no tocaba: se queda como estaba
  const racha = rep.racha + 1;
  return racha >= ACIERTOS_PARA_SALIR ? null : { racha, prox: sumaDias(hoy, INTERVALOS[racha]) };
}

/**
 * Entradas de la cola de repaso. Sin `conceptos`, una por pregunta. Con `conceptos` = { principalDe(id) → concepto|null,
 * estado: { [concepto]: { racha, prox, t } | { fuera: true, t } } }, las preguntas con concepto se agrupan en una
 * entrada por concepto (las que no tienen, una cada una).
 * @returns {{ concepto: string|null, q: object, preguntas: object[], rep: { racha: number, prox: string } }[]}
 *   q: la pregunta de origen (la fallada más reciente de ese concepto); preguntas: todas las de la cola de ese concepto
 */
export function itemsRepaso(preguntas, respuestas = {}, hoy = diaLocal(), conceptos = null) {
  const items = [];
  const grupos = new Map();
  for (const q of preguntas) {
    if (q.anulada || !q.correcta) continue;
    const rep = repasoDe(respuestas[q.id], hoy);
    if (!rep) continue;
    const c = conceptos?.principalDe?.(q.id) ?? null;
    if (!c) { items.push({ concepto: null, q, preguntas: [q], rep }); continue; }
    if (!grupos.has(c)) grupos.set(c, []);
    grupos.get(c).push({ q, rep, t: String(respuestas[q.id]?.t ?? ''), ok: respuestas[q.id]?.ok });
  }
  for (const [c, xs] of grupos) {
    const S = conceptos.estado?.[c] ?? null;
    const tS = String(S?.t ?? '');
    const tFallo = xs.filter((x) => x.ok === false).reduce((m, x) => (x.t > m ? x.t : m), '');
    let rep;
    if (S && tS >= tFallo) {
      if (S.fuera || !S.prox) continue; // la idea ya está repasada (y nada se ha fallado después)
      rep = { racha: S.racha ?? 0, prox: S.prox };
    } else {
      // Sin estado del concepto, o con un fallo posterior: manda lo de sus preguntas (las respondidas después).
      const vale = S ? xs.filter((x) => x.t > tS) : xs;
      rep = { racha: Math.min(...vale.map((x) => x.rep.racha)), prox: vale.map((x) => x.rep.prox).sort()[0] };
    }
    const orden = [...xs].sort((a, b) => (a.ok === false) - (b.ok === false) || a.t.localeCompare(b.t));
    items.push({ concepto: c, q: orden.at(-1).q, preguntas: xs.map((x) => x.q), rep });
  }
  return items;
}

/** Cuántas entradas de la cola tocan exactamente el día `fecha` (p. ej. mañana: las falladas hoy y las que vuelven). */
export function repasoDelDia(preguntas, respuestas = {}, fecha, hoy = diaLocal(), conceptos = null) {
  return itemsRepaso(preguntas, respuestas, hoy, conceptos).filter((x) => x.rep.prox === fecha).length;
}

/**
 * Cola de una titulación: las preguntas del banco que están en repaso (con `conceptos`, agrupadas por concepto: ver
 * itemsRepaso; sin él, exactamente como siempre).
 * @returns {{ hoy: object[], items: object[], total: number, porConcepto: boolean, minutosHoy: number, minutosPendientes: number }}
 *   hoy: las que tocan hoy o antes (las más atrasadas primero; con conceptos, la de origen de cada entrada)
 *   items: esas mismas entradas (itemsRepaso) · total: todas las entradas de la cola
 *   porConcepto: alguna entrada es de un concepto · minutosPendientes: lo que falta para vaciar la cola
 */
export function colaRepaso(preguntas, respuestas = {}, hoy = diaLocal(), conceptos = null) {
  const enCola = itemsRepaso(preguntas, respuestas, hoy, conceptos);
  const tocan = enCola.filter((x) => x.rep.prox <= hoy).sort((a, b) => a.rep.prox.localeCompare(b.rep.prox));
  const veces = enCola.reduce((s, x) => s + (ACIERTOS_PARA_SALIR - x.rep.racha), 0);
  return {
    hoy: tocan.map((x) => x.q),
    items: tocan,
    total: enCola.length,
    porConcepto: enCola.some((x) => x.concepto),
    minutosHoy: Math.ceil(tocan.length * MIN_POR_PREGUNTA),
    minutosPendientes: Math.ceil(veces * MIN_POR_PREGUNTA),
  };
}

/**
 * Nuevo estado de un concepto tras responder en el repaso. `rep` es el de su entrada en la cola; `t`, la hora (ISO)
 * de la respuesta (lo que se guarda va con ella para saber si un fallo posterior manda más).
 */
export function siguienteRepasoConcepto(rep, ok, hoy, t) {
  if (!ok) return { racha: 0, prox: sumaDias(hoy, INTERVALOS[0]), t };
  if (rep && rep.prox > hoy) return { racha: rep.racha, prox: rep.prox, t }; // aún no tocaba: no se adelanta
  const racha = (rep?.racha ?? 0) + 1;
  return racha >= ACIERTOS_PARA_SALIR ? { fuera: true, t } : { racha, prox: sumaDias(hoy, INTERVALOS[racha]), t };
}

/**
 * Qué se pregunta en cada entrada que toca hoy. En una entrada de concepto, otra pregunta del mismo concepto principal
 * y del mismo banco (indice.variante: solo del estudio, nunca reservadas para el examen final, anuladas ni retiradas):
 * primero una que no sea ninguna de las falladas de ese concepto ni otra ya elegida en la tanda; si no la hay, una que
 * no esté ya en la tanda; si tampoco, la misma de siempre. Una entrada sin concepto pregunta su pregunta.
 * `enEstudio` (Set de ids), de propina: una variante que no esté ahí no se usa nunca.
 * @returns {{ q: object, item: object, variante: boolean }[]}
 */
export function planRepaso(items, respuestas = {}, indice = null, { hoy = diaLocal(), enEstudio = null } = {}) {
  const usadas = new Set(items.map((x) => x.q.id));
  return items.map((item) => {
    let v = null;
    if (item.concepto && indice?.variante) {
      const vale = (q) => q.id !== item.q.id && !usadas.has(q.id) && (!enEstudio || enEstudio.has(q.id));
      // La mejor variante que valga (las que no, se descartan y se pide la siguiente).
      const intenta = (excluir) => {
        const fuera = new Set(excluir);
        for (;;) {
          const q = indice.variante(item.q.id, respuestas, { hoy, excluir: [...fuera] });
          if (!q || fuera.has(q.id)) return null;
          if (vale(q)) return q;
          fuera.add(q.id);
        }
      };
      v = intenta([...item.preguntas.map((q) => q.id), ...usadas]) ?? intenta(usadas);
    }
    if (v) usadas.add(v.id);
    return { q: v ?? item.q, item, variante: !!v };
  });
}

/**
 * Tanda de «5 minutos» (B8): primero lo que toca repasar, luego otros fallos, y si falta, preguntas sin hacer de
 * los temas ya empezados (o de cualquiera). `rng` es un generador de src/math/rng.js.
 */
export function tandaRapida(preguntas, respuestas = {}, rng, { n = 5, hoy = diaLocal() } = {}) {
  const validas = preguntas.filter((q) => !q.anulada && q.correcta);
  const baraja = (xs) => xs.map((x) => [rng.real(0, 1), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);
  const elegidas = [];
  const add = (xs) => { for (const q of xs) if (elegidas.length < n && !elegidas.includes(q)) elegidas.push(q); };
  add(colaRepaso(validas, respuestas, hoy).hoy);
  add(baraja(validas.filter((q) => respuestas[q.id]?.ok === false)));
  const empezados = new Set(validas.filter((q) => respuestas[q.id]).map((q) => q.ut));
  add(baraja(validas.filter((q) => !respuestas[q.id] && empezados.has(q.ut))));
  add(baraja(validas.filter((q) => !respuestas[q.id])));
  add(baraja(validas));
  return elegidas;
}

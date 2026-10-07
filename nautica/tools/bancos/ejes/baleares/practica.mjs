// Práctica de cada clase del curso nacional con las preguntas de Baleares (data/ejes/baleares/<tit>/practica.json) y
// sus resueltos (resueltos.json). Cada pregunta del estudio (sin las reservadas para el examen final —ni las que
// aparecen también en una convocatoria reservada—, sin anuladas ni retiradas por la norma) va a UNA clase, elegida en
// este orden:
//   1. concepto: la pregunta del otro banco cuya explicación se adaptó (`concepto` and-…) está en la práctica de una
//      clase de su mismo tema → esa clase (la misma decisión ya revisada allí);
//   2. carta: por el tipo de ejercicio de su solución programada (las reglas de resueltos.json del otro banco); las
//      mareas que necesitan anuario, a la clase de mareas; las de carta sin solución, a la clase de la carta;
//   3. contenido: la clase de su tema cuyo texto (título, objetivos, pasos, chuleta y términos) más se parece a la
//      pregunta, su respuesta y su explicación del profe (TF-IDF, coseno), sumando el voto de las 7 preguntas más
//      parecidas del otro banco que ya tienen clase. Medido sobre el otro banco (dejando cada pregunta fuera), acierta
//      su clase revisada en el 93 % (PER) y el 97 % (PY) de las preguntas; el método anterior, por palabras clave
//      sin la explicación, en el 83 % y el 86 %.
// Escribe tools/bancos/ejes/baleares/practica-informe.json (motivo y puntuación de cada asignación) para revisarla.
// Uso: node tools/bancos/ejes/baleares/practica.mjs
import { join } from 'node:path';
import { RAIZ, dirEje, escribirJSON, leerJSON } from '../../lib/comun.mjs';
import { clave } from '../../lib/texto.mjs';
import { textoDePaso } from '../../../../src/course/engine.js';
import { SOLUCIONES } from '../../../../src/bancos/soluciones.js';

const EJE = 'baleares';
const L = (r) => leerJSON(join(RAIZ, r), null);
const ficha = L(`data/ejes/${EJE}/eje.json`);
const VACIAS = new Set('a al el la los las lo un una unos unas de del en y o u e que se su sus por para con es son le les nos no mas muy ya esta este estos estas cual cuales cuando donde como si ser debe deben puede pueden hay sera seran todas todos ninguna correcta correctas anteriores respuestas respuesta otra otras'.split(' '));
const tok = (s) => clave(s).split(' ').filter((t) => t.length > 2 && !VACIAS.has(t)).map((t) => t.slice(0, 6));

// Clases de carta según el tipo de ejercicio de la solución (reglas de resueltos.json del otro banco, por titulación).
const CARTA = {
  per: { 'ct-enfilacion': 'per-11-2', 'rumbo-distancia': 'per-11-3', 'estima-directa': 'per-11-4', 'situacion-demora-distancia': 'per-11-5', 'distancia-faro': 'per-11-7', 'situacion-dos-demoras': 'per-11-6', 'rumbo-pasar-distancia': 'per-11-9', 'demoras-no-simultaneas': 'per-11-8', 'estima-analitica': 'per-11-4', abatimiento: 'per-11-4', 'corriente-efectiva': 'per-11-4', 'corriente-rumbo-a-dar': 'per-11-3', 'corriente-desconocida': 'per-11-4' },
  py: { 'ct-enfilacion': 'py-4-1', abatimiento: 'py-4-2', 'rumbo-pasar-distancia': 'py-4-3', 'demoras-no-simultaneas': 'py-4-4', 'situacion-dos-demoras': 'py-4-4', 'situacion-demora-distancia': 'py-4-4', 'corriente-efectiva': 'py-4-5', 'distancia-faro': 'py-4-6', 'corriente-rumbo-a-dar': 'py-4-7', 'corriente-desconocida': 'py-4-8', 'marea-sonda': 'py-4-9', 'estima-analitica': 'py-4-10', 'estima-directa': 'py-4-5', 'rumbo-distancia': 'py-4-7' },
};
const MAREAS = { per: 'per-10-8', py: 'py-4-9' };
const CARTA_GENERAL = { per: 'per-11-1', py: null };
// Resueltos de las clases de carta: tipos de ejercicio (como en el otro banco); se escriben como lista de ids del
// estudio, para que ninguna reservada salga en «Míralo resuelto en la carta».
const RESUELTOS = {
  per: { 'per-11-2': ['ct-enfilacion'], 'per-11-3': ['rumbo-distancia'], 'per-11-4': ['estima-directa'], 'per-11-5': ['situacion-demora-distancia', 'distancia-faro'], 'per-11-6': ['situacion-dos-demoras'], 'per-11-7': ['distancia-faro', 'ct-enfilacion'], 'per-11-9': ['rumbo-pasar-distancia'] },
  py: { 'py-4-1': ['ct-enfilacion'], 'py-4-2': ['abatimiento'], 'py-4-3': ['rumbo-pasar-distancia'], 'py-4-4': ['demoras-no-simultaneas', 'situacion-dos-demoras', 'situacion-demora-distancia'], 'py-4-5': ['corriente-efectiva'], 'py-4-7': ['corriente-rumbo-a-dar'], 'py-4-8': ['corriente-desconocida'], 'py-4-9': ['marea-sonda'], 'py-4-10': ['estima-analitica'] },
};
const MAX_RESUELTOS = 12;

/** Vectores TF-IDF normalizados sobre un corpus de listas de tokens. */
function tfidf(docs) {
  const df = new Map();
  for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1);
  const idf = (t) => Math.log((docs.length + 1) / ((df.get(t) ?? 0) + 1)) + 1;
  return (toks) => {
    const v = new Map();
    for (const t of toks) v.set(t, (v.get(t) ?? 0) + 1);
    let n = 0;
    for (const [t, c] of v) { const w = (1 + Math.log(c)) * idf(t); v.set(t, w); n += w * w; }
    n = Math.sqrt(n) || 1;
    for (const [t, w] of v) v.set(t, w / n);
    return v;
  };
}
const cos = (a, b) => { let s = 0; const [x, y] = a.size < b.size ? [a, b] : [b, a]; for (const [t, w] of x) { const z = y.get(t); if (z) s += w * z; } return s; };

const informe = {};
for (const tit of ['per', 'py']) {
  const curso = L(`data/curso/${tit}.json`);
  const lecciones = curso.modulos.flatMap((m) => m.lecciones).map((l) => {
    const visto = [l.titulo, ...(l.objetivos ?? []), ...l.pasos.map(textoDePaso), l.chuleta ? JSON.stringify(l.chuleta) : '', ...(l.terminos ?? []).map((t) => (typeof t === 'string' ? t : JSON.stringify(t)))].join(' ');
    return { id: l.id, ut: l.ut, toks: tok(visto) };
  });
  const porId = new Map(lecciones.map((l) => [l.id, l]));
  const qs = L(`data/ejes/${EJE}/${tit}/preguntas.json`).preguntas;
  const expl = L(`data/ejes/${EJE}/${tit}/explicaciones.json`) ?? {};
  const reservadas = new Set(ficha.reserva?.[tit] ?? []);
  const estudio = qs.filter((q) => !q.anulada && q.norma?.estado !== 'retirada' && !q.apareceEn.some((a) => reservadas.has(a.conv)));
  // El otro banco: id → clase, y sus preguntas con clase (para los vecinos).
  const claseAnd = new Map();
  for (const [lid, ids] of Object.entries(L(`data/ejes/andalucia/${tit}/practica.json`) ?? {})) for (const id of ids) claseAnd.set(id, lid);
  const explAnd = L(`data/ejes/andalucia/${tit}/explicaciones.json`) ?? {};
  const doc = (q, e) => tok([q.enunciado, ...(q.aceptadas ?? []).map((l) => q.opciones[l]), e?.explicacion ?? '', e?.clave ?? ''].join(' '));
  const andQs = L(`data/ejes/andalucia/${tit}/preguntas.json`).preguntas.filter((q) => claseAnd.has(q.id) && !q.requiere.includes('carta'))
    .map((q) => ({ id: q.id, lid: claseAnd.get(q.id), ut: porId.get(claseAnd.get(q.id))?.ut, toks: doc(q, explAnd[q.id]) }));
  const balDocs = estudio.map((q) => doc(q, expl[q.id]));
  const vec = tfidf([...andQs.map((a) => a.toks), ...lecciones.map((l) => l.toks), ...balDocs]);
  for (const a of andQs) a.v = vec(a.toks);
  for (const l of lecciones) l.v = vec(l.toks);

  const practica = Object.fromEntries(lecciones.map((l) => [l.id, []]));
  const motivo = {};
  estudio.forEach((q, i) => {
    const mismas = lecciones.filter((l) => l.ut === q.ut);
    let lid = null;
    let por = null;
    const cand = (id) => { const c = claseAnd.get(id); return c && porId.get(c)?.ut === q.ut ? c : null; };
    if (q.concepto && cand(q.concepto)) { lid = cand(q.concepto); por = `concepto ${q.concepto}`; }
    if (!lid && q.requiere.includes('anuario')) {
      // PER: la sonda en la pleamar o la bajamar es de la clase de la carta (per-11-1 la enseña); el resto, mareas.
      // PY: la sonda o la altura en un instante, a la clase del Anuario y la curva; la hora para una sonda, a la de carta.
      const enExtremo = /(en|de) la (primera |segunda |[uú]ltima )?(pleamar|bajamar)|(pleamar|bajamar) de la (primera|segunda)/i.test(q.enunciado);
      const pideHora = /qu[eé] hora|hora (TU|UTC|oficial)|flotar|zarpar|salir|entrar/i.test(q.enunciado);
      if (tit === 'per') lid = enExtremo && !pideHora ? 'per-11-1' : MAREAS.per;
      else lid = pideHora ? MAREAS.py : 'py-3-6';
      por = 'mareas con anuario';
    }
    if (!lid && q.requiere.includes('carta')) {
      const ej = SOLUCIONES[q.id]?.ejercicio;
      if (tit === 'per' && ej === 'rumbo-distancia' && !/desv|declinaci|variaci|corrección|\bct\b|aguja|\bra\b|viento|corriente/i.test(q.enunciado)) { lid = 'per-11-1'; por = 'carta: rumbo y distancia medidos en la carta'; }
      else if (tit === 'py' && ej && SOLUCIONES[q.id] && /trav[eé]s/i.test(q.enunciado)) { lid = 'py-4-6'; por = `carta: ${ej} con un faro por el través`; }
      else if (ej && CARTA[tit][ej]) { lid = CARTA[tit][ej]; por = `carta: ${ej}`; }
    }
    if (!lid && mismas.length) {
      const v = vec(balDocs[i]);
      const puntua = (ls, as) => {
        const sc = new Map(ls.map((l) => [l.id, 3 * cos(v, l.v)]));
        as.map((a) => ({ a, s: cos(v, a.v) })).sort((x, y) => y.s - x.s).slice(0, 7).forEach(({ a, s }) => sc.set(a.lid, (sc.get(a.lid) ?? 0) + s));
        return [...sc].sort((x, y) => y[1] - x[1])[0];
      };
      const [mejor, s] = puntua(mismas, andQs.filter((a) => a.ut === q.ut));
      // El tema sale de la posición en el examen, y el tribunal mezcla a veces (incendios entre las de seguridad):
      // si una clase de otro tema puntúa más del doble, la pregunta va a esa clase (sobre el otro banco, este cambio
      // casi no toca nada: allí el tema de cada pregunta está revisado).
      const [otra, s2] = puntua(lecciones, andQs);
      if (!q.requiere.includes('carta') && porId.get(otra).ut !== q.ut && s2 > 2 * s) { lid = otra; por = `contenido, de otro tema (${s2.toFixed(2)} frente a ${s.toFixed(2)})`; }
      else { lid = mejor; por = `contenido (${s.toFixed(2)})`; }
    }
    if (!lid && q.requiere.includes('carta') && CARTA_GENERAL[tit]) { lid = CARTA_GENERAL[tit]; por = 'carta sin solución'; }
    if (!lid) return;
    practica[lid].push(q.id);
    motivo[q.id] = `${lid} · ${por}`;
  });
  escribirJSON(join(RAIZ, 'data', 'ejes', EJE, tit, 'practica.json'), practica);
  // Resueltos: las de estudio con solución programada del tipo de la clase (las más recientes primero).
  const enEstudio = new Set(estudio.map((q) => q.id));
  const resueltos = {};
  for (const [lid, tipos] of Object.entries(RESUELTOS[tit])) {
    const ids = qs.filter((q) => enEstudio.has(q.id) && tipos.includes(SOLUCIONES[q.id]?.ejercicio) && !SOLUCIONES[q.id]?.sinCarta)
      .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? '')).slice(0, MAX_RESUELTOS).map((q) => q.id);
    if (ids.length) resueltos[lid] = { ids };
  }
  escribirJSON(join(RAIZ, 'data', 'ejes', EJE, tit, 'resueltos.json'), resueltos);
  const resumen = Object.fromEntries(Object.entries(practica).map(([l, ids]) => [l, ids.length]));
  informe[tit] = { estudio: estudio.length, asignadas: Object.keys(motivo).length, porClase: resumen, sinPractica: Object.keys(practica).filter((l) => !practica[l].length), motivos: Object.values(motivo).reduce((m, x) => { const k = x.split(' · ')[1].split(' ')[0].replace(':', ''); m[k] = (m[k] ?? 0) + 1; return m; }, {}), resueltos: Object.fromEntries(Object.entries(resueltos).map(([l, r]) => [l, r.ids.length])) };
  informe[`${tit}-detalle`] = motivo;
}
escribirJSON(join(dirEje(EJE), 'practica-informe.json'), informe);
for (const tit of ['per', 'py']) console.log(tit, JSON.stringify({ ...informe[tit], porClase: undefined }), '\n ', JSON.stringify(informe[tit].porClase));

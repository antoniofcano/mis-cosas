// Práctica de cada clase del curso nacional con las preguntas de Baleares (data/ejes/baleares/<tit>/practica.json) y
// sus resueltos (resueltos.json). Cada pregunta del estudio (sin las reservadas para el examen final, sin anuladas ni
// retiradas por la norma) va a UNA clase de su mismo tema (ut), elegida en este orden:
//   1. concepto: la pregunta de Andalucía cuya explicación se adaptó (`concepto` de la pregunta) está en la práctica de
//      una clase → esa clase (la misma decisión ya revisada en el otro banco);
//   2. vecina: la pregunta de Andalucía más parecida (enunciado y respuesta, ≥ 0,45) está en la práctica de una clase;
//   3. carta: por el tipo de ejercicio de su solución programada (las mismas reglas que resueltos.json de Andalucía);
//      las mareas que necesitan anuario, a la clase de mareas;
//   4. texto: la clase cuyas palabras clave cubren mejor el enunciado y la respuesta correcta (cubierta() del motor
//      del curso, src/course/engine.js, y, si ninguna la cubre, la de más palabras en común).
// Escribe también tools/bancos/ejes/baleares/practica-informe.json (motivo de cada asignación) para revisarla.
// Uso: node tools/bancos/ejes/baleares/practica.mjs
import { join } from 'node:path';
import { RAIZ, dirEje, escribirJSON, leerJSON } from '../../lib/comun.mjs';
import { clave } from '../../lib/texto.mjs';
import { cubierta, palabrasClave, textoDePaso } from '../../../../src/course/engine.js';

const EJE = 'baleares';
const L = (r) => leerJSON(join(RAIZ, r), null);
const ficha = L(`data/ejes/${EJE}/eje.json`);
const VACIAS = new Set('a al el la los las lo un una unos unas de del en y o u e que se su sus por para con es son le les nos no mas muy ya esta este estos estas cual cuales cuando donde como si'.split(' '));
const tok = (s) => new Set(clave(s).split(' ').filter((t) => t && t.length > 1 && !VACIAS.has(t)));
const jac = (A, B) => { let i = 0; for (const t of A) if (B.has(t)) i++; return i / Math.max(1, A.size + B.size - i); };

// Clases de carta según el tipo de ejercicio de la solución (reglas de resueltos.json de Andalucía, por titulación).
const CARTA = {
  per: { 'ct-enfilacion': 'per-11-2', 'rumbo-distancia': 'per-11-3', 'estima-directa': 'per-11-4', 'situacion-demora-distancia': 'per-11-5', 'distancia-faro': 'per-11-7', 'situacion-dos-demoras': 'per-11-6', 'rumbo-pasar-distancia': 'per-11-9', 'demoras-no-simultaneas': 'per-11-8', 'estima-analitica': 'per-11-4', abatimiento: 'per-11-4', 'corriente-efectiva': 'per-11-4', 'corriente-rumbo-a-dar': 'per-11-3', 'corriente-desconocida': 'per-11-4' },
  py: { 'ct-enfilacion': 'py-4-1', abatimiento: 'py-4-2', 'rumbo-pasar-distancia': 'py-4-3', 'demoras-no-simultaneas': 'py-4-4', 'situacion-dos-demoras': 'py-4-4', 'situacion-demora-distancia': 'py-4-4', 'corriente-efectiva': 'py-4-5', 'distancia-faro': 'py-4-6', 'corriente-rumbo-a-dar': 'py-4-7', 'corriente-desconocida': 'py-4-8', 'marea-sonda': 'py-4-9', 'estima-analitica': 'py-4-10', 'estima-directa': 'py-4-5', 'rumbo-distancia': 'py-4-7' },
};
const MAREAS = { per: 'per-10-8', py: 'py-4-9' };

const soluciones = {};
try {
  const { SOLUCIONES } = await import('../../../../src/bancos/soluciones.js');
  Object.assign(soluciones, SOLUCIONES);
} catch { /* sin soluciones registradas */ }

const informe = {};
for (const tit of ['per', 'py']) {
  const curso = L(`data/curso/${tit}.json`);
  const lecciones = curso.modulos.flatMap((m) => m.lecciones).map((l) => {
    const visto = [l.titulo, ...(l.objetivos ?? []), ...l.pasos.map(textoDePaso), l.chuleta ? JSON.stringify(l.chuleta) : '', ...(l.terminos ?? []).map((t) => (typeof t === 'string' ? t : JSON.stringify(t)))].join(' ');
    return { id: l.id, ut: l.ut, visto, claves: new Set(palabrasClave(visto)) };
  });
  const porId = new Map(lecciones.map((l) => [l.id, l]));
  const qs = L(`data/ejes/${EJE}/${tit}/preguntas.json`).preguntas;
  const expl = L(`data/ejes/${EJE}/${tit}/explicaciones.json`) ?? {};
  const reservadas = new Set(ficha.reserva?.[tit] ?? []);
  const estudio = qs.filter((q) => !q.anulada && q.norma?.estado !== 'retirada' && !q.apareceEn.some((a) => reservadas.has(a.conv)));
  // Práctica de Andalucía: id → clase; y sus preguntas para buscar la vecina.
  const claseAnd = new Map();
  const andQs = [];
  for (const t of ['per', 'py']) {
    const p = L(`data/ejes/andalucia/${t}/practica.json`) ?? {};
    for (const [lid, ids] of Object.entries(p)) for (const id of ids) if (lid.startsWith(`${tit}-`)) claseAnd.set(id, lid);
    if (t === tit) for (const q of L(`data/ejes/andalucia/${t}/preguntas.json`).preguntas) if (claseAnd.has(q.id)) andQs.push({ id: q.id, te: tok(q.enunciado), tc: tok((q.aceptadas ?? []).map((l) => q.opciones[l]).join(' ')) });
  }
  const practica = Object.fromEntries(lecciones.map((l) => [l.id, []]));
  const motivo = {};
  for (const q of estudio) {
    const mismas = lecciones.filter((l) => l.ut === q.ut);
    let lid = null;
    let por = null;
    const cand = (id) => { const c = claseAnd.get(id); return c && porId.get(c)?.ut === q.ut ? c : null; };
    if (q.concepto && cand(q.concepto)) { lid = cand(q.concepto); por = `concepto ${q.concepto}`; }
    const base = expl[q.id]?.base;
    if (!lid && base && cand(base)) { lid = cand(base); por = `base ${base}`; }
    if (!lid && !q.requiere.includes('carta')) {
      const te = tok(q.enunciado);
      const tc = tok((q.aceptadas ?? []).map((l) => q.opciones[l]).join(' '));
      let mejor = null;
      for (const a of andQs) {
        if (jac(te, a.te) < 0.3) continue;
        const s = 0.6 * jac(te, a.te) + 0.4 * jac(tc, a.tc);
        if (s >= 0.45 && (!mejor || s > mejor.s) && cand(a.id)) mejor = { s, id: a.id };
      }
      if (mejor) { lid = cand(mejor.id); por = `vecina ${mejor.id} (${mejor.s.toFixed(2)})`; }
    }
    if (!lid && q.requiere.includes('anuario')) { lid = MAREAS[tit]; por = 'mareas con anuario'; }
    if (!lid && q.requiere.includes('carta')) {
      const ej = soluciones[q.id]?.ejercicio;
      if (ej && CARTA[tit][ej]) { lid = CARTA[tit][ej]; por = `carta: ${ej}`; }
    }
    if (!lid && mismas.length) {
      const texto = `${q.enunciado} ${(q.aceptadas ?? []).map((l) => q.opciones[l]).join(' ')}`;
      const ws = palabrasClave(texto);
      const puntua = (l) => (ws.length ? ws.filter((w) => l.claves.has(w)).length / ws.length : 0) + (cubierta(q, l.visto) ? 1 : 0);
      const orden = mismas.map((l) => ({ l, s: puntua(l) })).sort((a, b) => b.s - a.s);
      lid = orden[0].l.id;
      por = `texto (${orden[0].s.toFixed(2)}${orden[0].s >= 1 ? ', cubierta' : ''})`;
    }
    if (!lid) continue;
    practica[lid].push(q.id);
    motivo[q.id] = `${lid} · ${por}`;
  }
  const ruta = join(RAIZ, 'data', 'ejes', EJE, tit, 'practica.json');
  escribirJSON(ruta, practica);
  const resumen = Object.fromEntries(Object.entries(practica).map(([l, ids]) => [l, ids.length]));
  informe[tit] = { estudio: estudio.length, asignadas: Object.keys(motivo).length, porClase: resumen, sinPractica: Object.keys(practica).filter((l) => !practica[l].length), motivos: Object.values(motivo).reduce((m, x) => { const k = x.split(' · ')[1].split(' ')[0]; m[k] = (m[k] ?? 0) + 1; return m; }, {}) };
  informe[`${tit}-detalle`] = motivo;
}
escribirJSON(join(dirEje(EJE), 'practica-informe.json'), informe);
for (const tit of ['per', 'py']) console.log(tit, JSON.stringify({ ...informe[tit], porClase: undefined }), '\n ', JSON.stringify(informe[tit].porClase));

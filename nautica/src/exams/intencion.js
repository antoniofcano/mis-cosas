// Carta gráfica «por intención» (R-54; docs/CARTA-MOVIL.md, función 1). Lógica sin DOM: la interfaz está en
// src/ui/intencion.js («Trázalo en la carta»).
//
// En el móvil no se traza a mano: el alumno elige QUÉ trazar y la app lo dibuja exacto. Así se entrena el orden y el qué
// (donde se falla) y la precisión del transportador se deja al papel. Cada trazo se decide en tres o cuatro elecciones
// cortas:
//   - la ACCIÓN (trazar una demora, un arco de distancia, unir dos faros, componer la corriente, la tangente…);
//   - el OBJETO (qué faro o qué punto);
//   - el VALOR (la demora verdadera ya corregida, el rumbo de superficie…), si hay un valor equivocado típico;
//   - el SENTIDO (desde el faro, la opuesta; la corriente, hacia donde va el agua; la banda de la tangente…).
//
// Nada de geometría propia: los trazos salen de la resolución por pasos de la pregunta (src/exams/kit.js). El kit apunta
// cada operación de primer nivel en `k.ops` (argumentos, lo que devuelve y los `items` que dibuja); aquí se reparte cada
// operación en trazos (TRAZOS) y se decide qué preguntar. Los valores equivocados salen del kit «con un error típico»
// (createKit(chart, { error }), src/exams/taxonomia.js): el argumento de esa misma operación cuando se resuelve con el
// error. Por eso cada opción equivocada tiene su error con nombre («Has usado el valor de aguja sin corregirlo con la
// Ct»). Las elecciones que no son un número tienen su error fijo: el faro equivocado, el trazo equivocado o fuera de
// orden (ERRORES_DE_TRAZADO), la demora sin la opuesta, la corriente al revés, la otra banda…
//
// Lo que se traza con una elección equivocada también lo dibuja el kit: se vuelve a resolver la pregunta cambiando solo
// esa operación (otro faro, otro valor o la variante del error) y se toman sus trazos (`resolverCon`). Al terminar, la
// pregunta se resuelve otra vez con las PRIMERAS elecciones del alumno y se compara su resultado (la situación, el rumbo)
// con el de la resolución (`compararFinal`).

import { createKit } from './kit.js';
import { VARIANTES, tipoDe, ERRORES } from './taxonomia.js';
import { AVISOS } from './avisos-pasos.js';
import { quantity } from '../analysis/quantities.js';
import { rhumbTo, rhumbDestination } from '../math/mercator.js';
import { norm360 } from '../math/angles.js';
import { fmtBearing, fmtMiles, fmtKnots, fmtPos } from '../math/format.js';

/** Las acciones que se pueden elegir: texto del botón y pregunta del objeto. */
export const ACCIONES = {
  demora: { texto: 'Trazar una demora desde un faro', objeto: '¿Desde qué faro?' },
  arco: { texto: 'Trazar un arco de distancia con el compás', objeto: '¿Con centro en qué faro?' },
  distancia: { texto: 'Llevar una distancia sobre la línea con el compás', objeto: null },
  'unir-faros': { texto: 'Unir dos faros (oposición o enfilación)', objeto: '¿Qué dos faros?' },
  rumbo: { texto: 'Trazar un rumbo desde un punto', objeto: '¿Desde dónde?' },
  unir: { texto: 'Unir dos puntos y medir rumbo y distancia', objeto: '¿Hasta dónde?' },
  corriente: { texto: 'Componer la corriente (triángulo de velocidades)', objeto: '¿Desde dónde?' },
  tangente: { texto: 'Trazar la tangente al arco de un faro', objeto: '¿A qué faro?' },
  'al-del-faro': { texto: 'Situarte a un rumbo y una distancia de un faro', objeto: '¿Desde qué faro?' },
  trasladar: { texto: 'Trasladar la primera línea lo navegado', objeto: null },
  'unir-situaciones': { texto: 'Unir la situación de estima con la observada', objeto: null },
};

/** Con qué se confunde cada acción (distractores de la elección de la acción, además del trazo que va después). */
const CONFUNDE = {
  demora: ['rumbo', 'arco'], arco: ['distancia', 'demora'], distancia: ['arco', 'rumbo'], 'unir-faros': ['demora', 'unir'],
  rumbo: ['demora', 'unir'], unir: ['rumbo', 'demora'], corriente: ['rumbo', 'unir'], tangente: ['rumbo', 'arco'],
  'al-del-faro': ['demora', 'rumbo'], trasladar: ['rumbo', 'demora'], 'unir-situaciones': ['corriente', 'unir'],
};

/** Operaciones del kit que son cuentas (sin trazo): sus pasos son la pista de los valores del trazo siguiente. */
const CUENTAS = new Set(['ct', 'rv', 'ra', 'dv', 'dvM', 'ctFrom', 'distFor', 'eta', 'abatimiento', 'rvConAbatimiento', 'porNombre', 'ctPolar', 'note']);

const ROSA = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
const rosa = (d) => ROSA[norm360(d)] ?? fmtBearing(d);
const fmt = (kind, v) => quantity(kind).format(v);
const esPos = (x) => !!x && typeof x === 'object' && Number.isFinite(x.lat) && Number.isFinite(x.lon);
const otraBanda = (b) => (b === 'babor' ? 'estribor' : 'babor');

// ---- Cómo se reparte cada operación del kit en trazos.
// Cada trazo: { accion, objeto?: { arg } | { par: [i, j] }, valores?: [{ arg, kind, nombre }], sentido?, items: índices de
// los `items` de la operación que dibuja, etiqueta?: (op, ctx) => texto del primer trazo sin rótulo }.
const V = (arg, kind, nombre) => ({ arg, kind, nombre });
const DV = (arg) => V(arg, 'bearing', 'demora verdadera (Dv)');
const DIST = (arg) => V(arg, 'distance', 'distancia');
const demora = (faro, v, items) => ({ accion: 'demora', objeto: { arg: faro }, valores: [DV(v)], sentido: { tipo: 'demora', arg: v }, items, etiqueta: (o, c) => `Dv ${fmtBearing(o.args[v])} ${c.corto(o.args[faro])}` });
const arco = (faro, d, items) => ({ accion: 'arco', objeto: { arg: faro }, valores: [DIST(d)], items, etiqueta: (o, c) => `${fmtMiles(o.args[d])} de ${c.corto(o.args[faro])}` });

export const TRAZOS = {
  fix2: () => [demora(0, 1, [0]), demora(2, 3, [1, 2])],
  fixDist: () => [demora(0, 1, [0]), { accion: 'distancia', valores: [DIST(2)], items: [1] }],
  fixBearingRange: () => [demora(0, 1, [0]), arco(2, 3, [1, 2])],
  fix2Ranges: () => [arco(0, 1, [0]), arco(2, 3, [1, 2])],
  lineAndBearing: () => [demora(2, 3, [0, 1])],
  oposicion: () => [{ accion: 'unir-faros', objeto: { par: [0, 1] }, sentido: { tipo: 'oposicion' }, items: [0], etiqueta: (o) => `Oposición · Dv ${fmtBearing(o.ret)}` }],
  enfilacion: () => [{ accion: 'unir-faros', objeto: { par: [0, 1] }, sentido: { tipo: 'enfilacion' }, items: [0], etiqueta: (o) => `Enfilación · Dv ${fmtBearing(o.ret)}` }],
  corteRumbo: () => [{ accion: 'rumbo', objeto: { arg: 0 }, valores: [V(1, 'bearing', 'rumbo')], items: [0], etiqueta: (o) => `Rumbo ${fmtBearing(o.args[1])}` }, demora(2, 3, [1, 2])],
  run: () => [{ accion: 'rumbo', objeto: { arg: 0 }, valores: [V(1, 'bearing', 'rumbo verdadero (Rv)'), DIST(2)], items: [0, 1], etiqueta: (o) => `Rv ${fmtBearing(o.args[1])} · ${fmtMiles(o.args[2])}` }],
  estimaEfectiva: () => [{ accion: 'rumbo', objeto: { arg: 0 }, valores: [V(1, 'bearing', 'rumbo efectivo (Ref)'), V(2, 'speed', 'velocidad efectiva (Vef)')], items: [0, 1], etiqueta: (o) => `Ref ${fmtBearing(o.args[1])}` }],
  efectivo: () => [{ accion: 'corriente', objeto: { arg: 4 }, valores: [V(0, 'bearing', 'rumbo de superficie (Rs)')], sentido: { tipo: 'corriente', arg: 2, sinCorriente: true }, items: [0, 1, 2] }],
  rumboConCorriente: (o) => (typeof o.args[1] === 'number'
    ? [{ accion: 'corriente', objeto: { arg: 0 }, valores: [V(1, 'bearing', 'rumbo efectivo (Ref)')], sentido: { tipo: 'corriente', arg: 3, sinCorriente: true }, items: [0, 1, 2] }]
    : [{ accion: 'unir', objeto: { arg: 1 }, items: [0], etiqueta: (op) => `Ref ${fmtBearing(op.ret.ref)} · ${fmtMiles(op.ret.dist)}` },
      { accion: 'corriente', sentido: { tipo: 'corriente', arg: 3, sinCorriente: true }, items: [1, 2] }]),
  rumboYVelocidad: () => [{ accion: 'unir', objeto: { arg: 1 }, items: [0], etiqueta: (o) => `Ref ${fmtBearing(o.ret.ref)}` },
    { accion: 'corriente', sentido: { tipo: 'corriente', arg: 3 }, items: [1, 2] }],
  corrienteDesconocida: () => [{ accion: 'unir-situaciones', sentido: { tipo: 'corriente-desconocida' }, items: [0], etiqueta: (o) => `Corriente ${fmtBearing(o.ret.rc)} · ${fmtKnots(o.ret.ic)}` }],
  tangent: () => [{ accion: 'tangente', objeto: { arg: 1 }, valores: [DIST(2)], sentido: { tipo: 'tangente', arg: 3 }, items: [0, 1],
    rotulos: (o, c) => ({ 0: `${fmtMiles(o.args[2])} de ${c.corto(o.args[1])}`, 1: `Rv ${fmtBearing(o.ret)}` }) }],
  rhumb: () => [{ accion: 'unir', objeto: { arg: 1 }, items: [0], etiqueta: (o) => `Rv ${fmtBearing(o.ret.rv)} · ${fmtMiles(o.ret.dist)}` }],
  bearingTo: () => [{ accion: 'unir', objeto: { arg: 1 }, items: [0], etiqueta: (o) => `Dv ${fmtBearing(o.ret.dv)} · ${fmtMiles(o.ret.dist)}` }],
  distanceBetween: () => [{ accion: 'unir', objeto: { arg: 1 }, items: [0], etiqueta: (o) => fmtMiles(o.ret) }],
  fromMark: () => [{ accion: 'al-del-faro', objeto: { arg: 0 }, valores: [DIST(2)], sentido: { tipo: 'al-del-faro', arg: 1 }, items: [0, 1], etiqueta: (o) => `${fmtBearing(o.args[1])} · ${fmtMiles(o.args[2])}` }],
  cardinal2: () => [{ accion: 'al-del-faro', objeto: { arg: 0 }, sentido: { tipo: 'al-del-faro', arg: 1 }, items: [0], etiqueta: (o) => `Al ${rosa(o.args[1])}` },
    { accion: 'al-del-faro', objeto: { arg: 2 }, sentido: { tipo: 'al-del-faro', arg: 3 }, items: [1, 2], etiqueta: (o) => `Al ${rosa(o.args[3])}` }],
  traslado: () => [demora(0, 1, [0]),
    { accion: 'trasladar', sentido: { tipo: 'traslado' }, valores: [V(4, 'bearing', 'rumbo navegado'), V(5, 'distance', 'distancia navegada')], items: [1, 2], primeroSentido: true, etiqueta: (o) => `${fmtBearing(o.args[4])} · ${fmtMiles(o.args[5])}` },
    demora(2, 3, [3, 4])],
};

// ---- Resolver con cambios en algunas operaciones
/**
 * Resuelve la pregunta cambiando solo algunas operaciones del kit: `cambios[j] = { args: { i: valor | { suma } }, error }`
 * (j = índice de la operación de primer nivel, como en `k.ops`). Un argumento cambiado se sustituye (o se le suma un
 * ángulo); `error` resuelve esa operación con la variante del error típico. Lo demás sigue igual, con los datos que
 * salen de lo cambiado (el kit encadena: la situación equivocada es la salida del rumbo siguiente).
 * @returns {{ values: object[]|null, items: object[]|null, ret: any, roto: boolean }}  `items` y `ret`: los de la
 *   operación `capturar` (lo que dibuja y lo que da con esos cambios).
 */
export function resolverCon({ sol, q, chart, cambios = {}, capturar = null }) {
  const base = createKit(chart);
  const kits = new Map();
  const kitDe = (e) => { if (!kits.has(e)) kits.set(e, createKit(chart, { error: e })); return kits.get(e); };
  let j = -1; let items = null; let ret;
  const kp = new Proxy(base, {
    get(t, nombre) {
      const f = t[nombre];
      if (typeof f !== 'function' || nombre === 'P') return f;
      return (...args) => {
        j += 1;
        const c = cambios[j];
        const a = [...args];
        for (const [i, v] of Object.entries(c?.args ?? {})) a[i] = v && typeof v === 'object' && 'suma' in v ? norm360(a[i] + v.suma) : v;
        const kk = c?.error ? kitDe(c.error) : base;
        const i0 = kk.items.length;
        const r = kk[nombre](...a);
        if (j === capturar) { items = kk.items.slice(i0); ret = r; }
        return r;
      };
    },
  });
  try { return { values: sol.solve(kp, q), items, ret, roto: false }; } catch { return { values: null, items, ret, roto: true }; }
}

// ---- Valores equivocados típicos: el argumento de la operación cuando se resuelve con un error
function resolverVariantesOps(sol, q, chart) {
  const out = [];
  for (const variante of VARIANTES) {
    const k = createKit(chart, { error: variante });
    try { sol.solve(k, q); } catch { /* lo resuelto hasta romperse vale */ }
    out.push({ variante, tipo: tipoDe(variante), ops: k.ops });
  }
  return out;
}

/** Distractores de un argumento: [{ valor, tipos }] (valores fuera de la tolerancia del bueno; uno o dos errores). */
function distractoresArg(variantes, j, op, arg, kind) {
  const q = quantity(kind);
  const bueno = op.args[arg];
  const grupos = [];
  for (const v of variantes) {
    const o = v.ops[j];
    if (!o || o.op !== op.op) continue;
    const x = o.args[arg];
    if (!Number.isFinite(x) || q.error(x, bueno) <= q.tolerance * 1.5) continue;
    const g = grupos.find((y) => q.error(y.valor, x) <= q.tolerance);
    if (g) { if (!g.tipos.includes(v.tipo)) g.tipos.push(v.tipo); } else grupos.push({ valor: x, tipos: [v.tipo] });
  }
  return grupos.filter((g) => g.tipos.length <= 2).slice(0, 3);
}

/** ¿Cambia la variante lo que da alguna operación con trazo anterior a la `j`? */
function cambiaAntes(v, j, ops) {
  const igual = (a, b) => {
    if (typeof a === 'number') return typeof b === 'number' && Math.abs(a - b) < 1e-6;
    if (a && typeof a === 'object') return !!b && typeof b === 'object' && Object.keys(a).every((x) => typeof a[x] !== 'number' || igual(a[x], b[x]));
    return a === b;
  };
  for (let i = 0; i < j; i++) {
    if (ops[i].items[1] <= ops[i].items[0]) continue;
    if (!v.ops[i] || !igual(ops[i].ret, v.ops[i].ret)) return true;
  }
  return false;
}

// ---- Barajar de forma estable (las opciones no cambian de sitio al volver a la pregunta)
function semilla(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function barajar(lista, clave) {
  let x = semilla(clave) || 1;
  const r = () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; };
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) { const k = Math.floor(r() * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; }
  return a;
}

/** Puntos que encuadran unos trazos (para el zoom al trazo). */
export function puntosDe(items) {
  const pts = [];
  for (const it of items) {
    for (const p of [it.from, it.to, it.at, it.center, it.through]) if (esPos(p)) pts.push(p);
    if ((it.t === 'ray' || it.t === 'vec') && esPos(it.from)) pts.push(rhumbDestination(it.from, it.bearing, it.length));
    if (it.t === 'line' && esPos(it.through)) { pts.push(rhumbDestination(it.through, it.bearing, it.length / 2)); pts.push(rhumbDestination(it.through, norm360(it.bearing + 180), it.length / 2)); }
    if (it.t === 'arc' && esPos(it.center)) for (const d of [-it.span / 2, 0, it.span / 2]) pts.push(rhumbDestination(it.center, norm360(it.around + d), it.radius));
  }
  return pts;
}

/**
 * El plan de la carta por intención de una pregunta, o null si no se puede (sin resolución, sin trazos, o con una
 * construcción que aún no tiene trazo por intención: distancias no simultáneas con arcos).
 * @returns {{ trazos: object[], values: object[], finales: {title, text}[], focus: object[], inicio: object[] } | null}
 */
export function planIntencion({ sol, q, chart }) {
  if (!sol || !chart) return null;
  const k = createKit(chart);
  let values;
  try { values = sol.solve(k, q); } catch { return null; }
  const graficas = k.ops.map((o, j) => ({ o, j })).filter(({ o }) => o.items[1] > o.items[0] && o.op !== 'pos');
  if (!graficas.length) return null;
  if (graficas.some(({ o }) => !TRAZOS[o.op])) return null;

  // Rótulos de las situaciones que salen de cada operación (para «¿desde dónde?»).
  const etiquetas = new Map();
  for (const o of k.ops) {
    if (!esPos(o.ret)) continue;
    const pos = k.items.slice(...o.items).find((it) => it.t === 'pos' && it.at === o.ret);
    etiquetas.set(o.ret, pos?.label ?? k.steps[o.pasos[1] - 1]?.title ?? 'el punto');
  }
  const marcas = new Set(chart.points().map((p) => p.id));
  const nombre = (id) => (typeof id === 'string' ? (marcas.has(id) ? chart.point(id).name : id) : etiquetas.get(id) ?? 'el punto');
  const corto = (id) => nombre(id).replace(/^Faro (de |del |de la )?/i, '');
  const ctx = { corto, nombre, marcas };
  const idsDelProblema = [...new Set(k.ops.flatMap((o) => o.args.filter((a) => typeof a === 'string' && marcas.has(a))))];

  const variantes = resolverVariantesOps(sol, q, chart);
  const trazos = [];
  let pendientes = []; // pasos de cuentas y datos desde el último trazo
  let antes = []; // trazos de datos (la situación de salida) que se dibujan al llegar al trazo siguiente
  for (const [j, o] of k.ops.entries()) {
    const its = k.items.slice(...o.items);
    const pasos = k.steps.slice(...o.pasos);
    const grafica = its.length && o.op !== 'pos' && !(o.op === 'efectivo' && !its.length);
    if (!grafica) {
      if (its.length) antes.push(...its.map((it) => ({ ...it, step: 0 })));
      pendientes.push(...pasos);
      continue;
    }
    const specs = TRAZOS[o.op](o);
    specs.forEach((s, si) => {
      const items = s.items.filter((i) => its[i]).map((i) => ({ ...its[i], step: 0 }));
      const en = items.findIndex((it) => it.t !== 'pos' && !it.label);
      if (s.etiqueta && items[en]) items[en] = { ...items[en], label: s.etiqueta(o, ctx) };
      for (const [i, r] of Object.entries(s.rotulos?.(o, ctx) ?? {})) if (items[i]) items[i] = { ...items[i], label: r };
      trazos.push({
        j, op: o.op, accion: s.accion, spec: s, items, antes, focus: puntosDe([...items, ...antes]),
        titulo: tituloTrazo(s, o, ctx),
        asi: pasos.find((p) => p.plantea)?.plantea ?? null,
        pista: [...new Set(pendientes.filter((p) => p.plantea && (p.pide || p.title)).map((p) => `${p.title}: ${p.plantea}`))],
        ultimoDeOp: si === specs.length - 1,
      });
      antes = []; pendientes = [];
    });
  }
  const finales = pendientes.filter((p) => p.title).map((p) => ({ title: p.title, text: p.text }));
  // Decisiones de cada trazo (ahora que se sabe qué acciones vienen después). Los errores que ya se han elegido (o no) en
  // un trazo anterior no vuelven como valor equivocado de los siguientes: el rumbo efectivo que sale de la tangente no
  // pregunta otra vez por la banda; solo por lo que se cuenta entre medias.
  const vistos = new Set();
  trazos.forEach((t, n) => {
    t.n = n + 1;
    t.decisiones = decisiones(t, n, trazos, k.ops[t.j], { variantes, ctx, idsDelProblema, chart, q, vistos, ops: k.ops });
    for (const d of t.decisiones) if (d.id !== 'accion' && d.id !== 'objeto') for (const o of d.opciones) for (const e of o.errores ?? []) vistos.add(e);
  });
  // El nombre de cada resultado, el del paso que lo pide (Rc, Ihc, Ra…), para la comparación final.
  const nombres = values.map((v) => {
    const c = k.steps.flatMap((p) => p.pide?.campos ?? []).filter((x) => x.kind === v.kind && Math.abs(x.value - v.value) < 1e-9).at(-1);
    return c?.label ?? null;
  });
  return { trazos, values, nombres, finales, focus: k.focus, inicio: trazos[0]?.antes ?? [], total: trazos.length };
}

function tituloTrazo(s, o, { corto }) {
  const a = o.args;
  switch (s.accion) {
    case 'demora': return `Demora de ${corto(a[s.objeto.arg])}`;
    case 'arco': return `Distancia a ${corto(a[s.objeto.arg])}`;
    case 'distancia': return 'Distancia sobre la demora';
    case 'unir-faros': return `${o.op === 'oposicion' ? 'Oposición' : 'Enfilación'} de ${corto(a[0])} y ${corto(a[1])}`;
    case 'rumbo': return o.op === 'corteRumbo' ? 'Tu rumbo' : o.op === 'estimaEfectiva' ? 'Estima con el efectivo' : 'Estima: rumbo y distancia';
    case 'unir': return `Hasta ${corto(a[s.objeto.arg])}`;
    case 'corriente': return 'Triángulo de velocidades';
    case 'tangente': return `Tangente a ${corto(a[1])}`;
    case 'al-del-faro': return `Al ${rosa(a[s.sentido.arg])} de ${corto(a[s.objeto.arg])}`;
    case 'trasladar': return 'Traslado de la primera línea';
    case 'unir-situaciones': return 'La corriente: de la estima a la observada';
    default: return ACCIONES[s.accion]?.texto ?? 'Trazo';
  }
}

/** Las elecciones de un trazo, en orden: acción, objeto, valores y sentido (o sentido antes de los valores). */
function decisiones(t, n, trazos, o, { variantes, ctx, idsDelProblema, chart, q, vistos, ops }) {
  const s = t.spec;
  const clave = `${q.id}:${n}`;
  const out = [];
  // Acción: la buena, la del trazo siguiente (si es otra: error de orden) y las que se confunden con ella.
  const despues = trazos.slice(n + 1).map((x) => x.accion).filter((a) => a !== s.accion);
  const otras = [...new Set([...despues.slice(0, 1), ...CONFUNDE[s.accion], ...despues.slice(1)])].filter((a) => a !== s.accion).slice(0, 3);
  out.push({ id: 'accion', pregunta: n === 0 ? '¿Qué trazas primero?' : '¿Qué trazas ahora?',
    opciones: barajar([{ id: s.accion, texto: ACCIONES[s.accion].texto, ok: true },
      ...otras.map((a) => ({ id: a, texto: ACCIONES[a].texto, ok: false, errores: [despues.includes(a) ? 'orden-trazado' : 'trazo-equivocado'] }))], `${clave}:a`) });
  // Objeto.
  const obj = objeto(s, o, { ctx, idsDelProblema, chart, clave, trazos, n });
  if (obj) out.push(obj);
  const sen = s.sentido ? sentido(s.sentido, o, ctx, clave) : null;
  const propios = new Set(sen?.opciones.flatMap((x) => x.errores ?? []) ?? []);
  // Un error que ya se ofreció en un trazo anterior y que cambia lo trazado antes no vuelve aquí (el rumbo efectivo que
  // sale de la tangente no pregunta otra vez por la banda); uno que solo cambia la cuenta de este trazo, sí (la Ct de la
  // segunda demora).
  const vale = (v) => !propios.has(v.tipo) && !(vistos.has(v.tipo) && cambiaAntes(v, t.j, ops));
  const vals = (s.valores ?? []).map((v) => valor(v, o, t.j, variantes.filter(vale), clave)).filter(Boolean);
  if (s.primeroSentido) out.push(...[sen, ...vals].filter(Boolean)); else out.push(...[...vals, sen].filter(Boolean));
  return out;
}

function objeto(s, o, { ctx, idsDelProblema, chart, clave, trazos, n }) {
  if (!s.objeto || !ACCIONES[s.accion].objeto) return null;
  const { marcas } = ctx;
  const pregunta = ACCIONES[s.accion].objeto;
  const cerca = (id) => (!marcas.has(id) ? [] : chart.marks()).filter((p) => p.id !== id && p.type === 'faro')
    .sort((x, y) => rhumbTo(chart.point(id), x).distance - rhumbTo(chart.point(id), y).distance).map((p) => p.id);
  if (s.objeto.par) {
    const [i, k] = s.objeto.par; const a = o.args[i]; const b = o.args[k];
    if (!marcas.has(a) || !marcas.has(b)) return null;
    const alt = [...idsDelProblema, ...cerca(b)].filter((x) => x !== a && x !== b);
    const pares = [[a, b], [a, alt[0]], [alt[1] ?? alt[0], b]].filter(([x, y]) => x && y && x !== y);
    const vistos = new Set();
    const opciones = pares.filter(([x, y]) => { const c = [x, y].sort().join('|'); if (vistos.has(c)) return false; vistos.add(c); return true; })
      .map(([x, y], m) => ({ id: `${x}|${y}`, texto: `${ctx.corto(x)} y ${ctx.corto(y)}`, ok: m === 0, ...(m ? { errores: ['faro-equivocado'], cambio: { args: { [i]: x, [k]: y } } } : {}) }));
    return opciones.length > 1 ? { id: 'objeto', pregunta, opciones: barajar(opciones, `${clave}:o`) } : null;
  }
  const arg = s.objeto.arg; const bueno = o.args[arg];
  if (typeof bueno === 'string') {
    if (!marcas.has(bueno)) return null;
    const alt = [...new Set([...idsDelProblema, ...cerca(bueno)])].filter((x) => x !== bueno && marcas.has(x)).slice(0, 2);
    const opciones = [{ id: bueno, texto: ctx.nombre(bueno), ok: true },
      ...alt.map((x) => ({ id: x, texto: ctx.nombre(x), ok: false, errores: ['faro-equivocado'], cambio: { args: { [arg]: x } } }))];
    return opciones.length > 1 ? { id: 'objeto', pregunta, opciones: barajar(opciones, `${clave}:o`) } : null;
  }
  if (!esPos(bueno)) return null;
  // Desde (o hasta) una situación: las situaciones que ya tienes en la carta.
  const conocidas = [];
  for (const t of trazos.slice(0, n)) for (const it of [...t.antes, ...t.items]) if (it.t === 'pos' && esPos(it.at) && it.label && !conocidas.some((c) => c.at === it.at)) conocidas.push(it);
  for (const it of trazos[n].antes) if (it.t === 'pos' && it.label && !conocidas.some((c) => c.at === it.at)) conocidas.push(it);
  const buena = conocidas.find((c) => c.at === bueno || (Math.abs(c.at.lat - bueno.lat) < 1e-9 && Math.abs(c.at.lon - bueno.lon) < 1e-9));
  if (!buena) return null;
  const otras = conocidas.filter((c) => c !== buena && c.label !== buena.label).slice(-2);
  if (!otras.length) return null;
  const opciones = [{ id: 'p0', texto: buena.label, ok: true },
    ...otras.map((c, m) => ({ id: `p${m + 1}`, texto: c.label, ok: false, errores: ['faro-equivocado'], cambio: { args: { [arg]: c.at } } }))];
  return { id: 'objeto', pregunta, opciones: barajar(opciones, `${clave}:o`) };
}

function valor(v, o, j, variantes, clave) {
  const bueno = o.args[v.arg];
  if (!Number.isFinite(bueno)) return null;
  const malos = distractoresArg(variantes, j, o, v.arg, v.kind);
  if (!malos.length) return null;
  const opciones = [{ id: 'v0', texto: fmt(v.kind, bueno), ok: true, valor: bueno },
    ...malos.map((m, i) => ({ id: `v${i + 1}`, texto: fmt(v.kind, m.valor), ok: false, valor: m.valor, errores: m.tipos, cambio: { args: { [v.arg]: m.valor } } }))];
  return { id: `valor-${v.arg}`, pregunta: `¿Qué ${v.nombre}?`, opciones: barajar(opciones, `${clave}:v${v.arg}`) };
}

function sentido(se, o, { corto }, clave) {
  const a = o.args;
  const op = (id, texto, ok, extra = {}) => ({ id, texto, ok, ...extra });
  let pregunta; let opciones;
  switch (se.tipo) {
    case 'demora': {
      const dv = a[se.arg];
      pregunta = 'Desde el faro, ¿qué rumbo trazas?';
      opciones = [op('opuesta', `${fmtBearing(dv + 180)}: la opuesta de la demora (Dv ± 180°)`, true),
        op('tal-cual', `${fmtBearing(dv)}: la demora tal cual`, false, { errores: ['demora-sin-opuesta'], cambio: { args: { [se.arg]: { suma: 180 } } } })];
      break;
    }
    case 'al-del-faro': {
      const d = a[se.arg];
      pregunta = `«Al ${rosa(d)} del faro»: desde el faro, ¿qué rumbo trazas?`;
      opciones = [op('tal-cual', `${fmtBearing(d)}: hacia el ${rosa(d)}`, true),
        op('opuesta', `${fmtBearing(d + 180)}: la opuesta`, false, { errores: ['lado-del-faro'], cambio: { args: { [se.arg]: { suma: 180 } } } })];
      break;
    }
    case 'oposicion': {
      pregunta = `¿Qué demora tiene ${corto(a[1])} desde el barco?`;
      opciones = [op('bien', `${fmtBearing(o.ret)}: la recta de ${corto(a[0])} hacia ${corto(a[1])}`, true),
        op('reves', `${fmtBearing(o.ret + 180)}: la recta de ${corto(a[1])} hacia ${corto(a[0])}`, false, { errores: ['sentido-recta'], cambio: { error: 'sentido-recta' } })];
      break;
    }
    case 'enfilacion': {
      pregunta = '¿En qué sentido mides la enfilación?';
      opciones = [op('bien', `${fmtBearing(o.ret)}: desde el barco hacia los faros`, true),
        op('reves', `${fmtBearing(o.ret + 180)}: desde los faros hacia el barco`, false, { errores: ['sentido-recta'], cambio: { error: 'sentido-recta' } })];
      break;
    }
    case 'corriente': {
      const rc = a[se.arg];
      pregunta = '¿Hacia dónde va el vector de la corriente?';
      opciones = [op('va', `${fmtBearing(rc)}: hacia donde va el agua`, true),
        op('viene', `${fmtBearing(rc + 180)}: de donde viene el agua`, false, { errores: ['corriente-invertida'], cambio: { args: { [se.arg]: { suma: 180 } } } })];
      if (se.sinCorriente) opciones.push(op('sin', 'No la compongo: el rumbo efectivo es el de superficie', false, { errores: ['sin-corriente'], cambio: { error: 'sin-corriente' } }));
      break;
    }
    case 'corriente-desconocida':
      pregunta = '¿En qué sentido mides la corriente?';
      opciones = [op('bien', 'De la situación de estima hacia la observada', true),
        op('reves', 'De la situación observada hacia la de estima', false, { errores: ['corriente-invertida'], cambio: { error: 'corriente-invertida' } })];
      break;
    case 'tangente': {
      const lado = a[se.arg];
      pregunta = '¿Cómo trazas el rumbo?';
      opciones = [op('banda', `Tangente al arco, dejando el faro por ${lado}`, true),
        op('otra', `Tangente al arco, dejando el faro por ${otraBanda(lado)}`, false, { errores: ['banda'], cambio: { error: 'banda' } }),
        op('directo', 'Directo al faro', false, { errores: ['directo'], cambio: { error: 'directo' } })];
      break;
    }
    case 'traslado':
      pregunta = 'Las demoras no son simultáneas: ¿qué haces con la primera línea?';
      opciones = [op('trasladar', 'La traslado lo navegado entre las dos (mismo rumbo y distancia)', true),
        op('tal-cual', 'La corto tal cual con la segunda', false, { errores: ['sin-traslado'], cambio: { error: 'sin-traslado' } })];
      break;
    default: return null;
  }
  return { id: 'sentido', pregunta, opciones: barajar(opciones, `${clave}:s`) };
}

// ---- Elegir: el diagnóstico de una elección
/**
 * Qué pasa al elegir una opción de una decisión.
 * @returns {{ ok: boolean, error: string|null, posibles: string[]|null, frase: string|null, regla: string|null }}
 *   `error`: el error con nombre si es uno solo (el que va al cuaderno); `posibles`: si dos errores dan lo mismo.
 */
export function elegir(decision, opcionId) {
  const o = decision.opciones.find((x) => x.id === opcionId);
  if (!o) throw new Error(`Opción desconocida: ${opcionId}`);
  if (o.ok) return { ok: true, error: null, posibles: null, frase: null, regla: null };
  const errores = (o.errores ?? []).filter((e) => ERRORES[e]);
  if (errores.length === 1) return { ok: false, error: errores[0], posibles: null, frase: `${AVISOS[errores[0]].has}.`, regla: AVISOS[errores[0]].no };
  if (errores.length === 2) return { ok: false, error: null, posibles: errores, frase: `Puede ser «${ERRORES[errores[0]].nombre}» o «${ERRORES[errores[1]].nombre}».`, regla: null };
  return { ok: false, error: null, posibles: null, frase: 'No es esa.', regla: null };
}

/** Lo que dibuja la app con una elección equivocada: los trazos del kit con ese cambio (o [] si no se puede dibujar). */
export function intento({ sol, q, chart, plan, t, opcion }) {
  const tr = plan.trazos[t];
  if (!opcion?.cambio) return [];
  const r = resolverCon({ sol, q, chart, cambios: { [tr.j]: opcion.cambio }, capturar: tr.j });
  if (!r.items) return [];
  const sel = tr.spec.items.map((i) => r.items[i]).filter((it) => it && it.t !== 'pos');
  return sel.map((it, m) => ({ ...it, step: 0, style: 'intento', label: m === 0 ? `Tu trazo: ${opcion.texto.split(':')[0]}` : undefined }));
}

/** Los cambios que suponen las primeras elecciones del alumno, por operación. `primeras[n][decisionId] = opcionId`. */
export function cambiosDe(plan, primeras) {
  const cambios = {};
  plan.trazos.forEach((t, n) => {
    for (const d of t.decisiones) {
      const o = d.opciones.find((x) => x.id === primeras?.[n]?.[d.id]);
      if (!o?.cambio) continue;
      const c = (cambios[t.j] ??= { args: {} });
      Object.assign(c.args, o.cambio.args ?? {});
      if (o.cambio.error && !c.error) c.error = o.cambio.error;
    }
  });
  return cambios;
}

/**
 * Compara el resultado que sale con las primeras elecciones del alumno con el de la resolución.
 * @returns {{ igual: boolean, roto: boolean, lineas: { que, tuyo, bueno, dif, ok }[], millas: number|null }}
 */
export function compararFinal({ sol, q, chart, plan, primeras }) {
  const cambios = cambiosDe(plan, primeras);
  const r = Object.keys(cambios).length ? resolverCon({ sol, q, chart, cambios }) : { values: plan.values, roto: false };
  if (r.roto || !r.values) return { igual: false, roto: true, lineas: [], millas: null };
  const lineas = []; let millas = null;
  const vb = plan.values; const vt = r.values;
  for (let i = 0; i < vb.length; i++) {
    const b = vb[i]; const t = vt[i];
    if (!t) continue;
    if (b.kind === 'lat' && vb[i + 1]?.kind === 'lon') {
      const pb = { lat: b.value, lon: vb[i + 1].value }; const pt = { lat: t.value, lon: vt[i + 1].value };
      millas = rhumbTo(pb, pt).distance;
      lineas.push({ que: 'Situación', tuyo: fmtPos(pt), bueno: fmtPos(pb), dif: `a ${fmtMiles(millas)}`, ok: millas <= 1 });
      i += 1; continue;
    }
    const qn = quantity(b.kind);
    const e = qn.error(t.value, b.value);
    const unidad = { kn: ' nudos', M: ' millas' }[qn.errorUnit.trim()] ?? qn.errorUnit;
    lineas.push({ que: plan.nombres?.[i] ?? NOMBRE_KIND[b.kind] ?? 'Resultado', tuyo: qn.format(t.value), bueno: qn.format(b.value), dif: `${e.toFixed(1).replace('.', ',')}${unidad} de diferencia`, ok: e <= qn.tolerance });
  }
  return { igual: lineas.every((l) => l.ok), roto: false, lineas, millas };
}
const NOMBRE_KIND = { bearing: 'Rumbo o demora', speed: 'Velocidad', distance: 'Distancia', signed: 'Corrección total', clock: 'Hora', lat: 'Latitud', lon: 'Longitud', duration: 'Tiempo', meters: 'Altura' };

/** ¿Se puede trazar por intención esta pregunta? */
export const intencionPosible = (sol, q, chart) => !!planIntencion({ sol, q, chart });

/** Resumen en texto para `nautica.state()`. */
export function textoIntencion(plan, { t = 0, hechos = 0, fallos = [] } = {}) {
  const lineas = [`CARTA POR INTENCIÓN: ${hechos} de ${plan.total} trazos hechos${t < plan.total ? `; ahora el ${t + 1}` : ''}.`];
  plan.trazos.slice(0, hechos).forEach((x) => lineas.push(`  ${x.n}. ${x.titulo}`));
  if (fallos.length) lineas.push(`  Errores al elegir: ${fallos.map((e) => ERRORES[e]?.nombre ?? e).join(', ')}`);
  return lineas.join('\n');
}

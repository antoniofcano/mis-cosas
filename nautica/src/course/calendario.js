// Calendario hasta el examen (plan de estudio con fecha) y seguimiento. Funciones puras: el progreso entra como datos.
//
// Unidades del plan, en el orden de estudio recomendado (el mismo que sigue «Hoy»): por cada tema, sus clases sin
// terminar y después las tandas de preguntas que le faltan para estar al día; al final, los simulacros.
//
// - Plan base: al poner la fecha (o al rehacerlo) se reparte todo lo pendiente día a día y se guarda. Sirve de
//   referencia: lo que tocaba un día ya pasado y sigue sin hacer es «para recuperar».
// - Lo que queda (de hoy al examen) se recalcula siempre con lo hecho de verdad: primero lo atrasado, y si no cabe
//   en los minutos al día se dice cuántos hacen falta.

import { estadoLeccion } from './engine.js';
import { bloquesEnOrden } from '../theory/blocks.js';
import { diasHasta, estadoTema, OBJETIVO_TEMA, TANDA, MIN_TANDA, SIMULACROS_RECOMENDADOS } from './plan.js';

const DIA = 864e5;
const diaLocal = (ms) => new Date(ms).toLocaleDateString('sv-SE');
/** 'YYYY-MM-DD' + n días (sin líos de horario de verano: se trabaja a mediodía). */
export function sumaDiasISO(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return diaLocal(new Date(y, m - 1, d, 12).getTime() + n * DIA);
}

const clasesDe = (curso, ut) => (curso?.modulos ?? []).filter((m) => m.ut === ut).flatMap((m) => m.lecciones.map((l) => ({ ...l, ut: l.ut ?? m.ut })));
const sinTerminar = (e) => e === 'nueva' || e === 'empezada';

/**
 * Todas las unidades del camino (hechas o no), cada una con una función `hecha()` según el progreso actual.
 * @returns {{ id, tipo: 'clase'|'tanda'|'simulacro', titulo, minutos, ut: number|null, ruta: string[], hecha: boolean }[]}
 */
export function unidades({ estructura, curso, preguntas = [], regs = {}, respuestas = {}, tests = [], ahora = Date.now() }) {
  const out = [];
  for (const b of bloquesEnOrden(estructura)) {
    for (const l of clasesDe(curso, b.ut)) {
      out.push({ id: `clase:${l.id}`, tipo: 'clase', titulo: l.titulo, minutos: l.minutos ?? 10, ut: b.ut, ruta: ['curso', l.id],
        hecha: !sinTerminar(estadoLeccion(l, regs[l.id], respuestas, ahora).estado) });
    }
    const est = estadoTema(b, curso, preguntas, regs, respuestas, ahora);
    const obj = Math.min(est.total, OBJETIVO_TEMA);
    const n = Math.ceil(obj / TANDA);
    for (let k = 1; k <= n; k++) {
      out.push({ id: `tanda:${b.ut}:${k}`, tipo: 'tanda', titulo: `${TANDA} preguntas de ${b.titulo}${n > 1 ? ` (${k} de ${n})` : ''}`, minutos: MIN_TANDA, ut: b.ut, ruta: ['teoria', 'ut', String(b.ut)],
        hecha: est.hechas >= Math.min(obj, k * TANDA) });
    }
  }
  const simulacros = tests.filter((t) => t.tipo === 'simulacro' || t.tipo === 'real').length;
  for (let k = 1; k <= SIMULACROS_RECOMENDADOS; k++) {
    out.push({ id: `simulacro:${k}`, tipo: 'simulacro', titulo: `Simulacro de examen ${k}`, minutos: estructura.duracionMin, ut: null, ruta: ['test', 'simulacro'], hecha: simulacros >= k });
  }
  return out;
}

/** Reparto voraz en orden: cada día hasta `cap` minutos (una unidad más larga que `cap` ocupa un día ella sola). */
function llenar(us, cap) {
  const dias = [];
  let dia = null;
  for (const u of us) {
    if (!dia || (dia.minutos && dia.minutos + u.minutos > cap)) { dia = { unidades: [], minutos: 0 }; dias.push(dia); }
    dia.unidades.push(u);
    dia.minutos += u.minutos;
  }
  return dias;
}

/**
 * Reparte las unidades pendientes entre `desde` y la víspera del examen (`dias` días). Los simulacros van uno por día
 * al final; el resto, en orden, con `minutosDia` al día. Si no cabe, se calcula el mínimo al día que hace falta
 * (múltiplo de 5) y se reparte con él.
 * @returns {{ dias: { fecha, unidades, minutos }[], llega: boolean, minutosNecesarios: number }}
 */
export function repartir(pendientes, { desde, dias, minutosDia }) {
  const md = Math.max(5, minutosDia);
  const sim = pendientes.filter((u) => u.tipo === 'simulacro');
  const resto = pendientes.filter((u) => u.tipo !== 'simulacro');
  const n = Math.max(1, dias);
  // Días para los simulacros al final, dejando al menos uno para el resto si hay resto.
  const nSim = Math.min(sim.length, resto.length ? n - 1 : n);
  const nResto = n - nSim;
  let cap = md;
  if (resto.length && llenar(resto, cap).length > nResto) {
    const total = resto.reduce((s, u) => s + u.minutos, 0);
    cap = Math.ceil(total / nResto / 5) * 5;
    while (llenar(resto, cap).length > nResto) cap += 5;
  }
  const llega = cap === md && sim.length <= nSim;
  const bloques = [...llenar(resto, cap)];
  while (bloques.length < nResto) bloques.push({ unidades: [], minutos: 0 });
  // Simulacros: uno por día; si hay más simulacros que días, los que sobran se juntan en el último.
  const simDias = Array.from({ length: nSim }, () => ({ unidades: [], minutos: 0 }));
  sim.forEach((u, i) => { const d = simDias[Math.min(i, nSim - 1)] ?? bloques[bloques.length - 1]; d.unidades.push(u); d.minutos += u.minutos; });
  const todos = [...bloques, ...simDias];
  return { dias: todos.map((d, i) => ({ fecha: sumaDiasISO(desde, i), ...d })), llega, minutosNecesarios: cap };
}

/** Días de estudio que quedan: de hoy a la víspera del examen (null sin fecha o con el examen pasado). */
export function diasDeEstudio(fechaExamen, ahora = Date.now()) {
  const d = fechaExamen ? diasHasta(fechaExamen, ahora) : null;
  return d == null || d < 1 ? null : d;
}

/** Plan base que se guarda en el progreso: qué unidades tocan cada día (con título y minutos, para pintarlo luego). */
export function crearPlan(datos, { fechaExamen, minutosDia, ahora = Date.now() }) {
  const n = diasDeEstudio(fechaExamen, ahora);
  if (!n) return null;
  const hoy = diaLocal(ahora);
  const r = repartir(unidades({ ...datos, ahora }).filter((u) => !u.hecha), { desde: hoy, dias: n, minutosDia });
  return {
    creado: hoy, fechaExamen, minutosDia,
    dias: Object.fromEntries(r.dias.filter((d) => d.unidades.length).map((d) => [d.fecha, d.unidades.map(({ id, titulo, minutos }) => ({ id, titulo, minutos }))])),
  };
}

/** ¿Hay que (re)hacer el plan base? Sin plan, o si cambió la fecha del examen o los minutos al día. */
export const planCaducado = (plan, fechaExamen, minutosDia) => !plan || plan.fechaExamen !== fechaExamen || plan.minutosDia !== minutosDia;

/**
 * Seguimiento: lo atrasado según el plan base, lo de hoy y el reparto actualizado de aquí al examen.
 * @returns {{ atrasadas, hoy, futuro: ReturnType<typeof repartir>, hechasDelPlan: number, totalDelPlan: number,
 *   estado: 'al-dia'|'atrasado'|'no-llega'|'terminado' }}
 */
export function seguimiento(plan, datos, { ahora = Date.now() } = {}) {
  const hoy = diaLocal(ahora);
  const us = unidades({ ...datos, ahora });
  const porId = new Map(us.map((u) => [u.id, u]));
  const hecha = (id) => porId.get(id)?.hecha ?? true; // una unidad que ya no existe no se reclama
  const delPlan = Object.entries(plan.dias).flatMap(([fecha, xs]) => xs.map((x) => ({ ...x, fecha })));
  const atrasadas = delPlan.filter((x) => x.fecha < hoy && !hecha(x.id)).map((x) => ({ ...porId.get(x.id), fecha: x.fecha }));
  const pendientes = us.filter((u) => !u.hecha);
  // Lo atrasado va primero; después, el resto en su orden.
  const ids = new Set(atrasadas.map((u) => u.id));
  const orden = [...atrasadas.map((u) => porId.get(u.id)), ...pendientes.filter((u) => !ids.has(u.id))];
  const n = diasDeEstudio(plan.fechaExamen, ahora);
  const futuro = n ? repartir(orden, { desde: hoy, dias: n, minutosDia: plan.minutosDia }) : { dias: [], llega: !pendientes.length, minutosNecesarios: plan.minutosDia };
  const estado = !pendientes.length ? 'terminado' : !futuro.llega ? 'no-llega' : atrasadas.length ? 'atrasado' : 'al-dia';
  return {
    atrasadas,
    hoy: futuro.dias[0]?.fecha === hoy ? futuro.dias[0].unidades : [],
    futuro,
    hechasDelPlan: delPlan.filter((x) => hecha(x.id)).length,
    totalDelPlan: delPlan.length,
    estado,
  };
}

/** El seguimiento en una frase, para «Hoy». */
export function lineaSeguimiento(s) {
  const n = s.atrasadas.length;
  const clases = s.atrasadas.filter((u) => u.tipo === 'clase').length;
  const que = clases === n ? (n === 1 ? '1 clase' : `${n} clases`) : (n === 1 ? '1 cosa' : `${n} cosas`);
  const hoyMin = s.hoy.reduce((t, u) => t + u.minutos, 0);
  const deHoy = s.hoy.length ? ` Hoy te tocan ${s.hoy.length} (unos ${hoyMin} minutos).` : '';
  if (s.estado === 'terminado') return 'Has terminado tu plan: ahora, simulacros y repasar tus fallos.';
  if (s.estado === 'no-llega') return `${n ? `Te has saltado ${que} del plan y` : 'Con lo que te queda'} no llegas con tus minutos: para llegar al examen necesitas unos ${s.futuro.minutosNecesarios} minutos al día.`;
  if (s.estado === 'atrasado') return `Te has saltado ${que} del plan: hoy toca recuperar${n === 1 ? 'la' : 'las'} para que te dé tiempo.${deHoy}`;
  return `Vas al día con tu plan.${deHoy}`;
}

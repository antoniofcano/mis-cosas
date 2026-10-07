// Calendario hasta el examen (plan de estudio con fecha) y seguimiento. Funciones puras: el progreso entra como datos.
//
// Unidades del plan, en el orden de la ruta del curso (el mismo que sigue «Hoy», course/ruta.js): las clases en el
// orden de la ruta, que intercala temas, y tras la última clase de cada tema, las tandas de preguntas que le faltan
// para estar al día; al final, los simulacros.
//
// - Plan base: al poner la fecha (o al rehacerlo) se reparte todo lo pendiente día a día y se guarda. Sirve de
//   referencia: lo que tocaba un día ya pasado y sigue sin hacer es «para recuperar».
// - Lo que queda (de hoy al examen) se recalcula siempre con lo hecho de verdad: primero lo atrasado, y si no cabe
//   en los minutos al día se dice cuántos hacen falta.

import { estadoLeccion, minutosClase, SEG_TARJETA } from './engine.js';
import { diasHasta, estadoTema, OBJETIVO_TEMA, TANDA, MIN_TANDA, SIMULACROS_RECOMENDADOS } from './plan.js';
import { cuenta, diaISO } from '../texto.js';
import { pasosRuta } from './ruta.js';

const DIA = 864e5;
const diaLocal = diaISO;
/** 'YYYY-MM-DD' + n días (sin líos de horario de verano: se trabaja a mediodía). */
export function sumaDiasISO(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return diaLocal(new Date(y, m - 1, d, 12).getTime() + n * DIA);
}

const clasesDe = (curso, ut) => (curso?.modulos ?? []).filter((m) => m.ut === ut).flatMap((m) => m.lecciones.map((l) => ({ ...l, ut: l.ut ?? m.ut })));
const sinTerminar = (e) => e === 'nueva' || e === 'empezada';

/** Minutos estimados para leer la chuleta de una clase. */
export const MIN_CHULETA = 3;

/**
 * Temas de poco peso: valen 3 preguntas o menos y no tienen límite de fallos. En el plan esencial sus clases se
 * cambian por la chuleta del tema (y sus preguntas de examen). En el PY no hay ninguno: todos valen 10.
 */
export const temasDePocoPeso = (estructura) => estructura.bloques.filter((b) => b.maxErrores == null && b.n <= 3).map((b) => b.ut);

/**
 * Todas las unidades del camino (hechas o no), cada una marcada `hecha` según el progreso actual.
 * Con `esencial`, las clases de los temas de poco peso se cambian por una unidad «chuleta del tema», hecha cuando se
 * marca como leída (`chuletasLeidas`: UTs) o cuando ya están terminadas todas sus clases.
 * @returns {{ id, tipo: 'clase'|'chuleta'|'tanda'|'simulacro', titulo, minutos, ut: number|null, ruta: string[], hecha: boolean }[]}
 */
export function unidades({ estructura, curso, preguntas = [], regs = {}, respuestas = {}, tests = [], esencial = false, chuletasLeidas = [], segTarjeta = SEG_TARJETA, ahora = Date.now() }) {
  const out = [];
  const pocoPeso = new Set(esencial ? temasDePocoPeso(estructura) : []);
  const bloques = new Map(estructura.bloques.map((b) => [b.ut, b]));
  for (const p of pasosRuta(estructura, curso)) {
    const b = bloques.get(p.ut);
    if (!b) continue;
    if (p.tipo === 'clase') {
      if (!pocoPeso.has(b.ut)) {
        out.push({ id: `clase:${p.l.id}`, tipo: 'clase', titulo: p.l.titulo, minutos: minutosClase(p.l, segTarjeta), ut: b.ut, ruta: ['curso', p.l.id],
          hecha: !sinTerminar(estadoLeccion(p.l, regs[p.l.id], respuestas, ahora).estado) });
      } else if (!out.some((u) => u.id === `chuleta:${b.ut}`)) {
        // Plan esencial: el tema de poco peso se cambia por su chuleta, donde la ruta pone su primera clase.
        const cls = clasesDe(curso, b.ut);
        const terminadas = cls.every((l) => !sinTerminar(estadoLeccion(l, regs[l.id], respuestas, ahora).estado));
        out.push({ id: `chuleta:${b.ut}`, tipo: 'chuleta', titulo: `Chuleta de ${b.titulo}`, minutos: MIN_CHULETA * cls.length, ut: b.ut, ruta: ['temario', String(b.ut), 'chuleta'],
          hecha: terminadas || chuletasLeidas.includes(b.ut) });
      }
      continue;
    }
    const est = estadoTema(b, curso, preguntas, regs, respuestas, ahora);
    const obj = Math.min(est.total, OBJETIVO_TEMA);
    const n = Math.ceil(obj / TANDA);
    for (let k = 1; k <= n; k++) {
      out.push({ id: `tanda:${b.ut}:${k}`, tipo: 'tanda', titulo: `${cuenta(TANDA, 'pregunta')} de ${b.titulo}${n > 1 ? ` (${k} de ${n})` : ''}`, minutos: MIN_TANDA, ut: b.ut, ruta: ['teoria', 'ut', String(b.ut)],
        hecha: est.hechas >= Math.min(obj, k * TANDA) });
    }
  }
  const simulacros = tests.filter((t) => t.tipo === 'simulacro' || t.tipo === 'real' || t.tipo === 'final').length;
  for (let k = 1; k <= SIMULACROS_RECOMENDADOS; k++) {
    out.push({ id: `simulacro:${k}`, tipo: 'simulacro', titulo: `Simulacro de examen ${k}`, minutos: estructura.duracionMin, ut: null, ruta: ['test', 'simulacro'], hecha: simulacros >= k });
  }
  return out;
}

/**
 * El avance del camino (el mismo número en Hoy, Progreso y Plan): los pasos del camino ponderados por sus minutos,
 * con lo hecho de las clases a medias (tramos terminados / tramos). Se mueve con cada tramo o tanda.
 * @returns {{ fraccion: number, hechos: number, total: number }}  hechos/total = pasos enteros terminados
 */
export function avanceCamino(datos) {
  const us = unidades(datos);
  const regs = datos.regs ?? {};
  const parte = (u) => {
    if (u.hecha) return 1;
    const r = u.tipo === 'clase' ? regs[u.ruta[1]] : null;
    return r?.tramos > 1 ? Math.min(1, (r.tramo ?? 0) / r.tramos) : 0;
  };
  const total = us.reduce((s, u) => s + u.minutos, 0);
  return { fraccion: total ? us.reduce((s, u) => s + u.minutos * parte(u), 0) / total : 0, hechos: us.filter((u) => u.hecha).length, total: us.length };
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
 * Reparte las unidades pendientes entre `desde` y la víspera del examen (`dias` días), siempre con `minutosDia` al
 * día. Los simulacros van uno por día al final; el resto, en orden. Lo que no cabe se devuelve en `fuera` (no se
 * estira el día por su cuenta) y `minutosNecesarios` dice con cuántos minutos al día cabría todo (múltiplo de 5).
 * @returns {{ dias: { fecha, unidades, minutos }[], fuera: object[], llega: boolean, minutosNecesarios: number }}
 */
export function repartir(pendientes, { desde, dias, minutosDia, fechas = null }) {
  const md = Math.max(5, minutosDia);
  if (fechas && !fechas.length) return { dias: [], fuera: [...pendientes], llega: !pendientes.length, minutosNecesarios: md };
  const sim = pendientes.filter((u) => u.tipo === 'simulacro');
  const resto = pendientes.filter((u) => u.tipo !== 'simulacro');
  const n = fechas ? fechas.length : Math.max(1, dias);
  const posSim = diasDeSimulacro(sim.length, n, resto.length > 0);
  const nResto = n - posSim.length;
  // Minutos al día con los que cabría todo.
  let necesarios = md;
  if (resto.length && llenar(resto, necesarios).length > nResto) {
    const total = resto.reduce((s, u) => s + u.minutos, 0);
    necesarios = Math.ceil(total / Math.max(1, nResto) / 5) * 5;
    while (llenar(resto, necesarios).length > nResto) necesarios += 5;
  }
  const llenos = llenar(resto, md);
  const contenido = llenos.slice(0, nResto);
  const fuera = llenos.slice(nResto).flatMap((d) => d.unidades);
  // Los días de simulacro son solo para el simulacro; el resto de días, en orden, para lo demás.
  const todos = [];
  let c = 0;
  for (let i = 0; i < n; i++) {
    const k = posSim.indexOf(i);
    if (k >= 0) todos.push({ unidades: [sim[k]], minutos: sim[k].minutos });
    else todos.push(contenido[c++] ?? { unidades: [], minutos: 0 });
  }
  fuera.push(...sim.slice(posSim.length));
  return { dias: todos.map((d, i) => ({ fecha: fechas ? fechas[i] : sumaDiasISO(desde, i), ...d })), fuera, llega: !fuera.length, minutosNecesarios: necesarios };
}

/**
 * Días (índices desde hoy) para los simulacros: repartidos por las dos últimas semanas, el último dos días antes del
 * examen (la víspera, descanso) y separados para que dé tiempo a repasar lo que salga flojo. Con pocos días, lo que
 * quepa, dejando al menos uno para lo demás si hay algo más.
 */
export function diasDeSimulacro(s, n, hayResto = true) {
  const libres = hayResto ? n - 1 : n;
  const k = Math.max(0, Math.min(s, libres));
  if (!k) return [];
  const ultimo = n >= 3 ? n - 2 : n - 1; // la víspera (n − 1) queda libre si se puede
  const ventana = Math.min(14, ultimo + 1); // de ultimo − ventana + 1 a ultimo
  const primero = ultimo - ventana + 1;
  const pos = k === 1 ? [ultimo] : Array.from({ length: k }, (_, i) => Math.round(primero + ((ventana - 1) * (i + 1)) / k));
  // Sin repetir día y sin pasarse de `ultimo`.
  const out = [];
  for (const p of pos) { let q = Math.min(p, ultimo); while (out.includes(q) && q > 0) q -= 1; out.push(q); }
  return out.sort((a, b) => a - b);
}

/** «3 clases y 2 tandas de preguntas»: qué hay en una lista de unidades, en palabras. */
export function describir(us) {
  const n = (t) => us.filter((u) => u.tipo === t).length;
  const partes = [[n('clase'), 'clase', 'clases'], [n('chuleta'), 'chuleta', 'chuletas'], [n('tanda'), 'tanda de preguntas', 'tandas de preguntas'], [n('simulacro'), 'simulacro', 'simulacros']]
    .filter(([k]) => k).map(([k, uno, varios]) => cuenta(k, uno, varios));
  return partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes.at(-1)}` : (partes[0] ?? 'nada');
}

/** Minutos → «unos 80 minutos» o «unas 4,5 horas». */
export function duracion(min) {
  if (min < 90) return `unos ${cuenta(Math.round(min / 5) * 5, 'minuto')}`;
  return `unas ${cuenta(Math.round(min / 6) / 10, 'hora')}`;
}

/** Días de estudio que quedan: de hoy a la víspera del examen (null sin fecha o con el examen pasado). */
export function diasDeEstudio(fechaExamen, ahora = Date.now()) {
  const d = fechaExamen ? diasHasta(fechaExamen, ahora) : null;
  return d == null || d < 1 ? null : d;
}

/** Días que se estudia: 'todos' o 'lv' (de lunes a viernes). */
export const DIAS_ESTUDIO = { todos: 'todos los días', lv: 'de lunes a viernes' };
const estudia = (iso, diasEstudio) => {
  if (diasEstudio !== 'lv') return true;
  const [y, m, d] = iso.split('-').map(Number);
  const dow = new Date(y, m - 1, d, 12).getDay();
  return dow !== 0 && dow !== 6;
};
/** Fechas de estudio de los `n` días que empiezan en `desde`, quitando los de descanso. */
export function fechasDeEstudio(desde, n, diasEstudio = 'todos') {
  return Array.from({ length: n }, (_, i) => sumaDiasISO(desde, i)).filter((f) => estudia(f, diasEstudio));
}

/** Plan base que se guarda en el progreso: qué unidades tocan cada día (con título y minutos, para pintarlo luego). */
export function crearPlan(datos, { fechaExamen, minutosDia, diasEstudio = 'todos', ahora = Date.now() }) {
  // datos.esencial: plan esencial (se guarda en el plan para saber si hay que rehacerlo)
  const n = diasDeEstudio(fechaExamen, ahora);
  if (!n) return null;
  const hoy = diaLocal(ahora);
  const r = repartir(unidades({ ...datos, ahora }).filter((u) => !u.hecha), { desde: hoy, dias: n, minutosDia, fechas: fechasDeEstudio(hoy, n, diasEstudio) });
  return {
    creado: hoy, fechaExamen, minutosDia, diasEstudio, esencial: !!datos.esencial,
    dias: Object.fromEntries(r.dias.filter((d) => d.unidades.length).map((d) => [d.fecha, d.unidades.map(({ id, titulo, minutos }) => ({ id, titulo, minutos }))])),
  };
}

/** ¿Hay que (re)hacer el plan base? Sin plan, o si cambió la fecha del examen, los minutos o los días que se estudia. */
export const planCaducado = (plan, fechaExamen, minutosDia, diasEstudio = 'todos', esencial = false) => !plan || plan.fechaExamen !== fechaExamen
  || plan.minutosDia !== minutosDia || (plan.diasEstudio ?? 'todos') !== diasEstudio || !!plan.esencial !== !!esencial;

/**
 * ¿Con el plan esencial se llegaría? Para ofrecerlo cuando el completo no cabe.
 * @returns {{ llega: boolean, minutosNecesarios: number, ahorro: number } | null} null si la titulación no tiene temas de poco peso
 */
export function alternativaEsencial(datos, { fechaExamen, minutosDia, diasEstudio = 'todos', ahora = Date.now() }) {
  if (!temasDePocoPeso(datos.estructura).length) return null;
  const n = diasDeEstudio(fechaExamen, ahora);
  if (!n) return null;
  const hoy = diaLocal(ahora);
  const pend = (esencial) => unidades({ ...datos, esencial, ahora }).filter((u) => !u.hecha);
  const completo = pend(false);
  const esencialU = pend(true);
  const r = repartir(esencialU, { desde: hoy, dias: n, minutosDia, fechas: fechasDeEstudio(hoy, n, diasEstudio) });
  const total = (us) => us.reduce((t, u) => t + u.minutos, 0);
  return { llega: r.llega, minutosNecesarios: r.minutosNecesarios, ahorro: total(completo) - total(esencialU) };
}

/**
 * Seguimiento: lo atrasado según el plan base, lo de hoy y el reparto actualizado de aquí al examen.
 * @returns {{ atrasadas, hoy, futuro: ReturnType<typeof repartir>, hechasDelPlan: number, totalDelPlan: number,
 *   estado: 'al-dia'|'atrasado'|'no-llega'|'terminado' }}
 */
export function seguimiento(plan, datos, { ahora = Date.now() } = {}) {
  const hoy = diaLocal(ahora);
  const us = unidades({ ...datos, esencial: !!plan.esencial, ahora });
  const porId = new Map(us.map((u) => [u.id, u]));
  const hecha = (id) => porId.get(id)?.hecha ?? true; // una unidad que ya no existe no se reclama
  const delPlan = Object.entries(plan.dias).flatMap(([fecha, xs]) => xs.map((x) => ({ ...x, fecha })));
  const atrasadas = delPlan.filter((x) => x.fecha < hoy && !hecha(x.id)).map((x) => ({ ...porId.get(x.id), fecha: x.fecha }));
  const pendientes = us.filter((u) => !u.hecha);
  // Lo atrasado va primero; después, el resto en su orden.
  const ids = new Set(atrasadas.map((u) => u.id));
  const orden = [...atrasadas.map((u) => porId.get(u.id)), ...pendientes.filter((u) => !ids.has(u.id))];
  const n = diasDeEstudio(plan.fechaExamen, ahora);
  const futuro = n ? repartir(orden, { desde: hoy, dias: n, minutosDia: plan.minutosDia, fechas: fechasDeEstudio(hoy, n, plan.diasEstudio) }) : { dias: [], fuera: pendientes, llega: !pendientes.length, minutosNecesarios: plan.minutosDia };
  const estado = !pendientes.length ? 'terminado' : !futuro.llega ? 'no-llega' : atrasadas.length ? 'atrasado' : 'al-dia';
  return {
    atrasadas,
    minutosAtraso: atrasadas.reduce((t, u) => t + u.minutos, 0),
    hoy: futuro.dias[0]?.fecha === hoy ? futuro.dias[0].unidades : [],
    descansoHoy: !estudia(hoy, plan.diasEstudio),
    futuro,
    hechasDelPlan: delPlan.filter((x) => hecha(x.id)).length,
    totalDelPlan: delPlan.length,
    estado,
  };
}

/**
 * El seguimiento en una frase, para «Hoy». Si no da tiempo no se habla de culpas («te has saltado»): se dice cuánto
 * falta y con cuántos minutos al día se llega; el retraso se cuenta en tiempo, no en «cosas».
 */
export function lineaSeguimiento(s, minutosDia) {
  const hoyMin = s.hoy.reduce((t, u) => t + u.minutos, 0);
  const deHoy = s.hoy.length ? ` Hoy toca: ${describir(s.hoy)} (${duracion(hoyMin)}).` : '';
  if (s.estado === 'terminado') return 'Has terminado tu plan: ahora, simulacros y repasar tus fallos.';
  if (s.estado === 'no-llega') {
    const falta = s.futuro.fuera.reduce((t, u) => t + u.minutos, 0);
    return `Con ${cuenta(minutosDia, 'minuto')} al día no te da tiempo: se quedarían fuera ${describir(s.futuro.fuera)} (${duracion(falta)}). Para llegar, unos ${cuenta(s.futuro.minutosNecesarios, 'minuto')} al día.`;
  }
  if (s.estado === 'atrasado') return `Tienes ${describir(s.atrasadas)} por recuperar (${duracion(s.minutosAtraso)}): empieza por ahí y llegas a tiempo.${deHoy}`;
  return `Vas al día con tu plan.${s.descansoHoy ? ' Hoy es día de descanso.' : deHoy}`;
}

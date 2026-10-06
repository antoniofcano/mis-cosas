// Motor de tests: arma simulacros y exámenes reales y los corrige con las reglas oficiales.
// Las preguntas de todos los bancos comparten formato: { id, ut, enunciado, opciones, correcta, anulada, ... }.

import { totalPreguntas } from './blocks.js';
import { cuenta } from '../texto.js';

/** Simulacro: tantas preguntas de cada bloque como en el examen, al azar (semilla reproducible). */
export function buildSimulacro(estructura, banco, rng) {
  const preguntas = [];
  const faltan = [];
  for (const b of estructura.bloques) {
    const pool = banco.filter((q) => q.ut === b.ut && !q.anulada && q.correcta);
    const elegidas = rng.shuffle(pool).slice(0, b.n);
    if (elegidas.length < b.n) faltan.push({ ut: b.ut, faltan: b.n - elegidas.length });
    preguntas.push(...elegidas);
  }
  return { tipo: 'simulacro', titulo: 'Simulacro de examen', preguntas, faltan };
}

/** Examen real: todas las preguntas de una convocatoria en su orden (PY: genérico y luego navegación). */
export function buildReal(banco, convocatoriaKey) {
  const preguntas = banco.filter((q) => sittingKey(q.id) === convocatoriaKey).sort((a, b) => (a.orden ?? a.numero) - (b.orden ?? b.numero));
  return { tipo: 'real', titulo: preguntas[0]?.convocatoria ?? convocatoriaKey, preguntas, faltan: [] };
}

/**
 * Práctica de un tema: sus preguntas barajadas (opcionalmente solo las falladas). Con `respuestas`, primero las
 * no respondidas, después las falladas y al final las acertadas (orden estable; barajadas dentro de cada grupo).
 * `limite` recorta la tanda; `pendientes` = preguntas sin responder o falladas que quedan fuera de ella.
 */
export function buildPractica(banco, ut, rng, { soloFalladas = null, respuestas = {}, limite = Infinity } = {}) {
  let pool = banco.filter((q) => q.ut === ut && !q.anulada && q.correcta);
  if (soloFalladas) pool = pool.filter((q) => soloFalladas.has(q.id));
  const prioridad = (q) => (!respuestas[q.id] ? 0 : respuestas[q.id].ok ? 2 : 1);
  const ordenadas = rng.shuffle(pool).map((q, i) => ({ q, i, p: prioridad(q) })).sort((a, b) => a.p - b.p || a.i - b.i).map((x) => x.q);
  const preguntas = ordenadas.slice(0, limite);
  const pendientes = ordenadas.slice(preguntas.length).filter((q) => prioridad(q) < 2).length;
  return { tipo: 'practica', ut, preguntas, pendientes };
}

/**
 * Repaso mezclado: preguntas de varios temas a la vez (los ya empezados), repartidas por turnos entre temas para que
 * no salgan seguidas las de uno mismo. Dentro de cada tema pesan más las falladas, las que hace más días que no
 * ves y las de temas con límite de fallos; las no vistas, poco (el repaso es de lo estudiado).
 * @param {number[]} uts temas que entran
 * @param {Set<number>} conLimite temas con límite de fallos
 */
export function buildMezcla(banco, uts, rng, { respuestas = {}, conLimite = new Set(), limite = 10, ahora = Date.now() } = {}) {
  const peso = (q) => {
    const r = respuestas[q.id];
    const dias = r?.t ? Math.max(0, (ahora - new Date(r.t).getTime()) / 864e5) : 0;
    const base = !r ? 0.5 : r.ok ? 0.5 + Math.min(dias, 30) / 10 : 4;
    return base * (conLimite.has(q.ut) ? 1.5 : 1);
  };
  const grupos = uts.map((ut) => banco.filter((q) => q.ut === ut && !q.anulada && q.correcta).map((q) => ({ q, w: peso(q) }))).filter((g) => g.length);
  const elegir = (g) => {
    const total = g.reduce((s, x) => s + x.w, 0);
    let r = rng.next() * total;
    const i = Math.max(0, g.findIndex((x) => (r -= x.w) < 0));
    return g.splice(i, 1)[0].q;
  };
  const orden = rng.shuffle(grupos.map((_, i) => i));
  const preguntas = [];
  for (let vuelta = 0; preguntas.length < limite && grupos.some((g) => g.length); vuelta++) {
    for (const i of orden) if (grupos[i].length && preguntas.length < limite) preguntas.push(elegir(grupos[i]));
  }
  return { tipo: 'mezcla', uts, preguntas };
}

/** "and-2023-c1-t07" / "and-2023-c1-q42" → "and-2023-c1"; PY: "and-py-2023-c1-g07" / "-n15" → "and-py-2023-c1" */
export const sittingKey = (id) => id.replace(/-[tqgn]\d+$/, '');

/** Convocatorias disponibles en el banco (completas: con las preguntas de todos los bloques). */
export function convocatorias(estructura, banco) {
  const map = new Map();
  for (const q of banco) {
    const k = sittingKey(q.id);
    if (!map.has(k)) map.set(k, { key: k, titulo: q.convocatoria, fecha: q.fecha, n: 0 });
    map.get(k).n += 1;
  }
  const total = totalPreguntas(estructura);
  return [...map.values()].map((c) => ({ ...c, completa: c.n >= total })).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
}

/**
 * Corrige un test con las reglas oficiales.
 * - Apto: aciertos ≥ minAciertos y ningún bloque con más errores que su límite.
 * - Las preguntas en blanco no son aciertos y cuentan como fallo para los límites por bloque.
 * - Las anuladas por el tribunal se dan por correctas (sea cual sea la respuesta).
 * @param {Record<string,string>} respuestas  id → letra
 */
export function grade(estructura, test, respuestas) {
  const porBloque = new Map(estructura.bloques.map((b) => [b.ut, { ...b, aciertos: 0, errores: 0, blancos: 0, total: 0 }]));
  const detalle = test.preguntas.map((q) => {
    const r = respuestas[q.id] ?? null;
    const ok = q.anulada ? true : r != null && r === q.correcta;
    const b = porBloque.get(q.ut);
    if (b) {
      b.total += 1;
      if (ok) b.aciertos += 1;
      else { b.errores += 1; if (r == null) b.blancos += 1; }
    }
    return { id: q.id, ut: q.ut, respuesta: r, correcta: q.correcta, ok, anulada: !!q.anulada };
  });
  const aciertos = detalle.filter((d) => d.ok).length;
  const bloques = [...porBloque.values()].filter((b) => b.total);
  const motivos = [];
  if (test.preguntas.length === totalPreguntas(estructura) && aciertos < estructura.minAciertos) {
    motivos.push(`Necesitas ${cuenta(estructura.minAciertos, 'acierto')} y tienes ${aciertos}.`);
  }
  for (const b of bloques) {
    if (b.maxErrores != null && b.errores > b.maxErrores) motivos.push(`${b.titulo}: ${cuenta(b.errores, 'error')} (máximo ${b.maxErrores}).`);
  }
  const completo = test.preguntas.length === totalPreguntas(estructura);
  return { aciertos, errores: detalle.length - aciertos, total: detalle.length, bloques, detalle, apto: completo ? motivos.length === 0 : null, motivos };
}

// Motor de tests: arma simulacros y exámenes reales y los corrige con las reglas oficiales.
// Las preguntas de todos los bancos comparten formato (docs/BANCOS.md): { id, conv, ut, enunciado, opciones, correcta, anulada, ... }.

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

/**
 * Clave de examen real: `<conv>` o, si la convocatoria tuvo varios juegos de preguntas distintos (DGMM: Test 01 y
 * Test 02, cada uno con su permutación), `<conv>@<modelo>` con el modelo que representa al juego.
 */
const partirClave = (key) => {
  const i = String(key).indexOf('@');
  return i < 0 ? [key, null] : [key.slice(0, i), key.slice(i + 1)];
};
export const convDeClave = (key) => partirClave(key)[0];

/**
 * Posición de una pregunta en el examen de una convocatoria (o de un juego `<conv>@<modelo>`), o null si no salió en
 * él. Una pregunta que se repite en varias convocatorias lleva la primera en `conv` y todas en `apareceEn`: en las demás
 * ocupa el número con que salió (el de su primer modelo en esa convocatoria).
 */
export function ordenEn(q, key) {
  const [conv, modelo] = partirClave(key);
  if (modelo) return (q.apareceEn ?? []).find((a) => a.conv === conv && a.modelo === modelo)?.numero ?? null;
  if (q.conv === conv) return q.orden ?? q.numero;
  const a = (q.apareceEn ?? []).find((x) => x.conv === conv);
  return a ? a.numero : null;
}

/** Examen real: todas las preguntas de una convocatoria (o de uno de sus juegos) en su orden (PY: genérico y luego navegación). */
export function buildReal(banco, convocatoriaKey) {
  const preguntas = banco.map((q) => ({ q, o: ordenEn(q, convocatoriaKey) })).filter((x) => x.o != null).sort((a, b) => a.o - b.o).map((x) => x.q);
  const conv = convDeClave(convocatoriaKey);
  const propia = preguntas.find((q) => q.conv === conv) ?? preguntas[0];
  const [, modelo] = partirClave(convocatoriaKey);
  const titulo = propia?.convocatoria ?? conv;
  return { tipo: 'real', titulo: modelo ? `${titulo} · ${nombreModelo(modelo)}` : titulo, preguntas, faltan: [] };
}

/** «T02» → «Test 02»; otros nombres de modelo, tal cual. */
const nombreModelo = (m) => (/^T\d+$/.test(m) ? `Test ${m.slice(1)}` : `Modelo ${m}`);

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

/**
 * Test guardado a medias rehecho con sus preguntas en el orden en que salieron (ids guardados). null si alguna ya
 * no está en el banco (entonces se rehace con la semilla o la convocatoria).
 */
export function testDesdeIds(tipo, ids, porId, conv = null) {
  const preguntas = (ids ?? []).map((id) => porId.get(id));
  if (!preguntas.length || preguntas.some((q) => !q)) return null;
  const propia = preguntas.find((q) => q.conv === conv) ?? preguntas[0];
  return { tipo, titulo: tipo === 'real' ? propia.convocatoria : 'Simulacro de examen', preguntas, faltan: [] };
}

/**
 * Convocatorias disponibles en el banco, por su clave `conv` (completas: con las preguntas de todos los bloques).
 * Si una convocatoria tuvo varios juegos de preguntas (modelos que no son permutaciones uno del otro: comparten menos
 * de la mitad de sus preguntas), cada juego es un examen: clave `<conv>@<modelo>` y título «… · Test NN».
 */
export function convocatorias(estructura, banco) {
  const info = new Map();
  for (const q of banco) {
    if (!info.has(q.conv)) info.set(q.conv, { key: q.conv, titulo: q.convocatoria, fecha: q.fecha, modelos: new Map() });
  }
  for (const q of banco) {
    const vistos = new Set();
    for (const a of q.apareceEn?.length ? q.apareceEn : [{ conv: q.conv, modelo: null }]) {
      const c = info.get(a.conv);
      const k = `${a.conv}|${a.modelo ?? ''}`;
      if (!c || vistos.has(k)) continue;
      vistos.add(k);
      if (!c.modelos.has(a.modelo ?? '')) c.modelos.set(a.modelo ?? '', new Set());
      c.modelos.get(a.modelo ?? '').add(q.id);
    }
  }
  const total = totalPreguntas(estructura);
  const out = [];
  for (const c of info.values()) {
    // Juegos: se agrupan los modelos que comparten al menos la mitad de sus preguntas (modelos A y B, o Test 01 y Test 03 barajados).
    const juegos = [];
    for (const [m, ids] of [...c.modelos].sort(([a], [b]) => a.localeCompare(b))) {
      const j = juegos.find((g) => { let comunes = 0; for (const id of ids) if (g.ids.has(id)) comunes++; return comunes >= 0.5 * Math.min(ids.size, g.ids.size); });
      if (j) for (const id of ids) j.ids.add(id);
      else juegos.push({ modelo: m, ids: new Set(ids) });
    }
    const base = { titulo: c.titulo, fecha: c.fecha };
    if (juegos.length <= 1) {
      const n = juegos[0]?.ids.size ?? 0;
      out.push({ key: c.key, ...base, n, completa: n >= total });
    } else {
      for (const j of juegos) {
        const n = [...c.modelos.get(j.modelo)].length;
        out.push({ key: `${c.key}@${j.modelo}`, ...base, titulo: `${c.titulo} · ${nombreModelo(j.modelo)}`, n, completa: n >= total });
      }
    }
  }
  return out.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)) || a.key.localeCompare(b.key));
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

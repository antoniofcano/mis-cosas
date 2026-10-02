// Cómo describe un enunciado una situación conocida (salida, destino...), en los formatos de examen:
//   { modo: 'coords', lat, lon }                         "situación 36º 05,0′ N, 006º 10,0′ W"
//   { modo: 'demora', markId, dv, dist }                 "en la demora verdadera 038º del faro X, a 5 millas"
//   { modo: 'rumbo-desde', markId, dir, dist }           "a 4 millas al Sur verdadero del faro X"
//   { modo: 'dos-rumbos', a:{markId,dir}, b:{markId,dir}} "al Sur verdadero del faro A y al Oeste verdadero del faro B"

import { rhumbDestination, rhumbTo } from '../math/mercator.js';
import { fixTwoBearings } from '../nautical/positioning.js';
import { norm360, round } from '../math/angles.js';
import { fmtBearing, fmtMiles, fmtPos, fmtLat, fmtLon } from '../math/format.js';

export const DIRS = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };
const DIR_NAME = { N: 'Norte', NE: 'Nordeste (NE)', E: 'Este', SE: 'Sudeste (SE)', S: 'Sur', SW: 'Sudoeste (SW)', W: 'Oeste', NW: 'Noroeste (NW)' };

const nameOf = (chart, id) => chart.point(id).name.replace(/^Faro de /, 'faro de ');

export function resolvePosition(chart, d) {
  switch (d.modo) {
    case 'coords': return { lat: d.lat, lon: d.lon };
    case 'demora': return rhumbDestination(chart.point(d.markId), norm360(d.dv + 180), d.dist);
    case 'rumbo-desde': return rhumbDestination(chart.point(d.markId), DIRS[d.dir], d.dist);
    case 'dos-rumbos': {
      // Estar "al S del faro A" = ver el faro A al N (demora DIRS+180).
      const p = fixTwoBearings(chart.point(d.a.markId), norm360(DIRS[d.a.dir] + 180), chart.point(d.b.markId), norm360(DIRS[d.b.dir] + 180));
      if (!p) throw new Error('Las líneas no se cortan');
      return p;
    }
    default: throw new Error(d.modo);
  }
}

export function positionText(chart, d) {
  switch (d.modo) {
    case 'coords': return `en situación ${fmtLat(d.lat)}, ${fmtLon(d.lon)}`;
    case 'demora': return `observando el ${nameOf(chart, d.markId)} en demora verdadera ${fmtBearing(d.dv)} y a ${fmtMiles(d.dist)} de distancia`;
    case 'rumbo-desde': return `a ${fmtMiles(d.dist)} al ${DIR_NAME[d.dir]} verdadero del ${nameOf(chart, d.markId)}`;
    case 'dos-rumbos': return `al ${DIR_NAME[d.a.dir]} verdadero del ${nameOf(chart, d.a.markId)} y al ${DIR_NAME[d.b.dir]} verdadero del ${nameOf(chart, d.b.markId)}`;
    default: throw new Error(d.modo);
  }
}

/** Explicación de cómo se sitúa ese punto en la carta. */
export function positionExplain(chart, d, label = 'el punto') {
  const p = resolvePosition(chart, d);
  switch (d.modo) {
    case 'coords': return `Situamos ${label} con la regla en sus coordenadas: ${fmtPos(p)}.`;
    case 'demora': return `Desde el ${nameOf(chart, d.markId)} trazamos la demora opuesta ${fmtBearing(d.dv + 180)} (Dv + 180°) y medimos ${fmtMiles(d.dist)}: ${fmtPos(p)}.`;
    case 'rumbo-desde': return `Desde el ${nameOf(chart, d.markId)} trazamos la dirección ${fmtBearing(DIRS[d.dir])} y medimos ${fmtMiles(d.dist)} en la escala de latitudes: ${fmtPos(p)}.`;
    case 'dos-rumbos': return `Desde el ${nameOf(chart, d.a.markId)} trazamos ${fmtBearing(DIRS[d.a.dir])} y desde el ${nameOf(chart, d.b.markId)} trazamos ${fmtBearing(DIRS[d.b.dir])}; se cortan en ${fmtPos(p)}.`;
    default: throw new Error(d.modo);
  }
}

/** Primitivas de dibujo para situar el punto. */
export function positionDrawing(chart, d, step, label) {
  const p = resolvePosition(chart, d);
  const items = [];
  if (d.modo === 'demora' || d.modo === 'rumbo-desde') {
    const m = chart.point(d.markId);
    items.push({ t: 'ray', from: m, bearing: rhumbTo(m, p).bearing, length: d.dist, style: 'construction', step });
  } else if (d.modo === 'dos-rumbos') {
    for (const s of [d.a, d.b]) {
      const m = chart.point(s.markId);
      items.push({ t: 'ray', from: m, bearing: DIRS[s.dir], length: rhumbTo(m, p).distance + 1, style: 'construction', step });
    }
  }
  items.push({ t: 'pos', at: p, label, style: 'start', step });
  return items;
}

/**
 * Genera una situación aleatoria navegable descrita en uno de los modos indicados.
 * @returns {{ desc, pos } | null}
 */
export function randomPosition(chart, rng, { modos = ['coords', 'demora', 'rumbo-desde', 'dos-rumbos'], box = chart.bounds, clearance = 1 } = {}) {
  const modo = rng.pick(modos);
  const marks = chart.marks();
  let desc;
  if (modo === 'coords') {
    const p = chart.randomSeaPoint(rng, box, clearance);
    // coordenadas "redondas" como en los exámenes (minutos enteros)
    desc = { modo, lat: Math.round(p.lat * 60) / 60, lon: Math.round(p.lon * 60) / 60 };
  } else if (modo === 'demora') {
    const p = chart.randomSeaPoint(rng, box, clearance);
    const vis = chart.visibleMarks(p, 10).filter((o) => o.distance >= 1.5);
    if (!vis.length) return null;
    const o = rng.pick(vis);
    desc = { modo, markId: o.mark.id, dv: Math.round(o.bearing), dist: round(o.distance * 2, 0) / 2 };
  } else if (modo === 'rumbo-desde') {
    desc = { modo, markId: rng.pick(marks).id, dir: rng.pick(Object.keys(DIRS)), dist: rng.step(2, 10, 0.5) };
  } else {
    const [a, b] = rng.shuffle(marks);
    const dirs = Object.keys(DIRS);
    desc = { modo, a: { markId: a.id, dir: rng.pick(dirs) }, b: { markId: b.id, dir: rng.pick(dirs) } };
    const cut = Math.abs(((DIRS[desc.a.dir] - DIRS[desc.b.dir] + 540) % 360) - 180);
    if (cut < 45 || cut > 135) return null;
  }
  let pos;
  try { pos = resolvePosition(chart, desc); } catch { return null; }
  if (!chart.isNavigable(pos, clearance === 0 ? 0 : 0.5)) return null;
  if (desc.modo !== 'coords') {
    const ids = desc.modo === 'dos-rumbos' ? [desc.a.markId, desc.b.markId] : [desc.markId];
    if (ids.some((id) => rhumbTo(pos, chart.point(id)).distance > 14)) return null;
    if (desc.modo === 'rumbo-desde' && !chart.isVisible(pos, chart.point(desc.markId), 14)) return null;
  }
  return { desc, pos };
}

/** Para el diagnóstico: el mismo punto si se trazara la demora sin invertir. */
export function flipPositionBearing(d) {
  if (d.modo === 'demora') return { ...d, dv: norm360(d.dv + 180) };
  if (d.modo === 'rumbo-desde') {
    const opp = Object.entries(DIRS).find(([, v]) => v === norm360(DIRS[d.dir] + 180))[0];
    return { ...d, dir: opp };
  }
  return d;
}

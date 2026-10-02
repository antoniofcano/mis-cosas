import { defineExercise } from '../define.js';
import { deadReckoning } from '../../nautical/sailing.js';
import { fmtBearing, fmtLat, fmtLon, fmtMiles, fmtKnots, fmtClock } from '../helpers.js';

const n1 = (v) => `${v >= 0 ? '' : '−'}${Math.abs(v).toFixed(1).replace('.', ',')}`;

export default defineExercise({
  id: 'estima-analitica',
  title: 'Estima analítica (varios rumbos)',
  category: 'estima',
  levels: ['PY'],
  difficulty: 3,
  concepts: ['estima', 'distancia'],
  summary: 'Sin carta: diferencia de latitud, apartamiento y diferencia de longitud por latitud media.',
  method: [
    'Para cada tramo: d = V · t; Δl = d · cos R (N +, S −) y A = d · sen R (E +, W −).',
    'Suma los Δl y los A de todos los tramos.',
    'Latitud de llegada = l salida + Δl total. Latitud media lm = l salida + Δl / 2.',
    'Δλ = A / cos lm. Longitud de llegada = L salida + Δλ (E +, W −).',
    'Rumbo directo = arctg(A / Δl) en su cuadrante; distancia directa = √(Δl² + A²).',
  ],

  generate(rng) {
    const start = { lat: rng.int(34 * 60, 37 * 60) / 60, lon: -rng.int(4 * 60, 10 * 60) / 60 };
    const n = rng.int(2, 3);
    let t = rng.step(6 * 60, 12 * 60, 15);
    const legs = [];
    for (let i = 0; i < n; i++) {
      const minutes = rng.step(60, 240, 15);
      legs.push({ rv: rng.int(0, 359), v: rng.step(5, 9, 0.5), t0: t, t1: t + minutes });
      t += minutes;
    }
    return { start, legs };
  },

  statement(p) {
    const legs = p.legs.map((l, i) => `${i ? 'después, ' : ''}de ${fmtClock(l.t0)} a ${fmtClock(l.t1)} navegamos al Rv ${fmtBearing(l.rv)} a ${fmtKnots(l.v)}`).join('; ');
    return `A HRB = ${fmtClock(p.legs[0].t0)} salimos de la situación ${fmtLat(p.start.lat)}, ${fmtLon(p.start.lon)}: ${legs}. ` +
      'Calcula por estima analítica la situación de llegada y el rumbo y la distancia directos.';
  },

  answers: [
    { key: 'lat', label: 'Latitud', kind: 'lat', tolerance: 0.5 },
    { key: 'lon', label: 'Longitud', kind: 'lon', tolerance: 0.5 },
    { key: 'rd', label: 'Rumbo directo', kind: 'bearing' },
    { key: 'dd', label: 'Distancia directa', kind: 'distance' },
  ],

  solve(p) {
    const legs = p.legs.map((l) => ({ rv: l.rv, dist: (l.v * (l.t1 - l.t0)) / 60 }));
    const r = deadReckoning(p.start, legs);
    const rows = r.comps.map((c, i) => `Tramo ${i + 1}: d = ${fmtKnots(p.legs[i].v)} × ${p.legs[i].t1 - p.legs[i].t0} min = ${fmtMiles(c.dist, 2)}; Δl = d·cos ${Math.round(c.rv)}° = ${n1(c.dLat)}′; A = d·sen ${Math.round(c.rv)}° = ${n1(c.dep)} M`);
    return {
      results: { lat: r.end.lat, lon: r.end.lon, rd: r.course, dd: r.distance },
      steps: [
        { title: 'Tramos', text: rows.join('. ') + '.' },
        { title: 'Totales', text: `Δl = ${n1(r.dLat)}′ (${r.dLat >= 0 ? 'N' : 'S'}); A = ${n1(r.dep)} M (${r.dep >= 0 ? 'E' : 'W'}).` },
        { title: 'Latitud de llegada', text: `${fmtLat(p.start.lat)} ${r.dLat >= 0 ? '+' : '−'} ${Math.abs(r.dLat).toFixed(1).replace('.', ',')}′ = ${fmtLat(r.end.lat)}.` },
        { title: 'Diferencia de longitud', text: `lm = ${fmtLat(r.lm)}; Δλ = A / cos lm = ${n1(r.dep)} / ${Math.cos((r.lm * Math.PI) / 180).toFixed(4).replace('.', ',')} = ${n1(r.dLon)}′ (${r.dLon >= 0 ? 'E' : 'W'}).` },
        { title: 'Longitud de llegada', text: `${fmtLon(p.start.lon)} ${r.dLon >= 0 ? '+' : '−'} ${Math.abs(r.dLon).toFixed(1).replace('.', ',')}′ = ${fmtLon(r.end.lon)}.` },
        { title: 'Rumbo y distancia directos', text: `R = arctg(${n1(r.dep)} / ${n1(r.dLat)}) → ${fmtBearing(r.course)}; D = √(${n1(r.dLat)}² + ${n1(r.dep)}²) = ${fmtMiles(r.distance)}.` },
      ],
    };
  },

  mistakes: [
    { id: 'sin-cos-lm', explain: 'Has tomado el apartamiento como diferencia de longitud. Hay que dividir por cos lm: Δλ = A / cos lm.', results: (p, ctx, ok) => {
      const legs = p.legs.map((l) => ({ rv: l.rv, dist: (l.v * (l.t1 - l.t0)) / 60 }));
      const r = deadReckoning(p.start, legs);
      return { lat: ok.lat, lon: p.start.lon + r.dep / 60 };
    } },
    { id: 'seno-coseno', explain: 'Has cambiado seno y coseno: Δl = d · cos R y A = d · sen R.', mutate: (p) => ({ ...p, legs: p.legs.map((l) => ({ ...l, rv: (450 - l.rv) % 360 })) }) },
  ],
});

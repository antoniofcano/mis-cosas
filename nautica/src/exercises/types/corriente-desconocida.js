import { defineExercise } from '../define.js';
import { correccionTotal, rvFromRa, raFromRv } from '../../nautical/compass.js';
import { effectiveCourse, currentFromDrift } from '../../nautical/kinematics.js';
import { fixTwoBearings } from '../../nautical/positioning.js';
import { angleDist } from '../../math/angles.js';
import {
  fmtBearing, fmtSignedNum, fmtClock, fmtKnots, fmtMiles, fmtPos, signedText,
  randomCompass, randomClock, describeByMark, byMarkText, retry, rhumbDestination, rhumbTo, norm360,
} from '../helpers.js';

export default defineExercise({
  id: 'corriente-desconocida',
  title: 'Calcular la corriente (rumbo e intensidad)',
  category: 'corrientes',
  levels: ['PY'],
  difficulty: 3,
  concepts: ['corriente', 'estima', 'demora'],
  summary: 'La situación observada no coincide con la de estima: la diferencia es la corriente.',
  method: [
    'Calcula la situación de estima (sin corriente) a la hora de la observación.',
    'Calcula la situación verdadera u observada (por demoras).',
    'Une estima → observada: ese es el rumbo de la corriente; su longitud dividida por el tiempo es la intensidad horaria.',
  ],

  generate(rng, ctx) {
    const { chart } = ctx;
    return retry(() => {
      const by = describeByMark(chart, rng, chart.randomSeaPoint(rng, chart.bounds, 1.5), 8);
      if (!by || !chart.isNavigable(by.pos, 0.5)) return null;
      const { dm, desvio } = randomCompass(rng, chart);
      const ct = correccionTotal(dm, desvio);
      const rv = rng.int(0, 359);
      const vb = rng.step(4, 9, 0.5);
      const rc = rng.step(0, 355, 5);
      const ic = rng.step(1, 3, 0.5);
      const minutes = rng.step(60, 120, 10);
      const { ref, vef } = effectiveCourse(rv, vb, rc, ic);
      const real = rhumbDestination(by.pos, ref, (vef * minutes) / 60);
      if (!chart.isNavigable(real, 1) || !chart.isClearPath(by.pos, real)) return null;
      const vis = chart.visibleMarks(real, 14).filter((o) => o.distance > 1.5);
      if (vis.length < 2) return null;
      const [a, b] = rng.shuffle(vis);
      if (angleDist(a.bearing, b.bearing) < 35 || angleDist(a.bearing, b.bearing) > 145) return null;
      const t0 = randomClock(rng);
      return {
        start: { markId: by.mark.id, dv: by.dv, dist: by.dist }, dm, desvio, ra: raFromRv(rv, ct), vb, t0, t1: t0 + minutes,
        obs: [a, b].map((o) => ({ markId: o.mark.id, dv: Math.round(o.bearing) })),
      };
    });
  },

  statement(p, { chart }) {
    const mark = chart.point(p.start.markId);
    const [A, B] = p.obs.map((o) => chart.point(o.markId));
    return `A las ${fmtClock(p.t0)} nos encontramos ${byMarkText({ mark, ...p.start })} y damos Ra = ${fmtBearing(p.ra)} con velocidad ${fmtKnots(p.vb)} (dm = ${signedText(p.dm)}, Δ = ${fmtSignedNum(p.desvio)}). ` +
      `A las ${fmtClock(p.t1)} tomamos simultáneamente demora verdadera del ${A.name} Dv = ${fmtBearing(p.obs[0].dv)} y del ${B.name} Dv = ${fmtBearing(p.obs[1].dv)}. ` +
      `Calcula el rumbo y la intensidad horaria de la corriente.`;
  },

  answers: [
    { key: 'rc', label: 'Rumbo corriente', kind: 'bearing', tolerance: 5 },
    { key: 'ic', label: 'Intensidad horaria', kind: 'speed', tolerance: 0.3 },
  ],

  solve(p, { chart }) {
    const mark = chart.point(p.start.markId);
    const start = rhumbDestination(mark, norm360(p.start.dv + 180), p.start.dist);
    const ct = correccionTotal(p.dm, p.desvio);
    const rv = rvFromRa(p.ra, ct);
    const hours = (p.t1 - p.t0) / 60;
    const est = rhumbDestination(start, rv, p.vb * hours);
    const [A, B] = p.obs.map((o) => chart.point(o.markId));
    const obs = fixTwoBearings(A, p.obs[0].dv, B, p.obs[1].dv);
    if (!obs) throw new Error('Demoras sin corte');
    const drift = rhumbTo(est, obs);
    const { rc, ic } = currentFromDrift(drift.bearing, drift.distance, hours);
    return {
      results: { rc, ic },
      steps: [
        { title: 'Salida y Rv', text: `Salida: ${fmtPos(start)}. Ct = ${fmtSignedNum(ct)}; Rv = ${fmtBearing(p.ra)} + (${fmtSignedNum(ct)}) = ${fmtBearing(rv)}.` },
        { title: 'Situación de estima', text: `En ${p.t1 - p.t0} min navegamos ${fmtMiles(p.vb * hours, 2)} al Rv: Se = ${fmtPos(est)}.` },
        { title: 'Situación observada', text: `Desde ${A.name} trazamos ${fmtBearing(p.obs[0].dv + 180)} y desde ${B.name} ${fmtBearing(p.obs[1].dv + 180)}: So = ${fmtPos(obs)}.` },
        { title: 'Corriente', text: `De Se a So: rumbo ${fmtBearing(rc)} y ${fmtMiles(drift.distance, 2)} en ${p.t1 - p.t0} min → intensidad horaria ${fmtKnots(ic)}.` },
      ],
      drawing: {
        focus: [start, est, obs, A, B],
        items: [
          { t: 'pos', at: start, label: 'Salida', style: 'start', step: 1 },
          { t: 'vec', from: start, bearing: rv, length: p.vb * hours, label: `Rv ${fmtBearing(rv)}`, style: 'boat', step: 2 },
          { t: 'pos', at: est, label: 'Se', style: 'estima', step: 2 },
          { t: 'ray', from: A, bearing: norm360(p.obs[0].dv + 180), length: rhumbTo(A, obs).distance + 1.5, style: 'lop', step: 3 },
          { t: 'ray', from: B, bearing: norm360(p.obs[1].dv + 180), length: rhumbTo(B, obs).distance + 1.5, style: 'lop', step: 3 },
          { t: 'pos', at: obs, label: 'So', style: 'fix', step: 3 },
          { t: 'seg', from: est, to: obs, label: 'Corriente', style: 'current', arrow: true, step: 4 },
        ],
      },
    };
  },

  mistakes: [
    {
      id: 'corriente-invertida',
      explain: 'Has medido la corriente al revés. La corriente va de la situación de estima (Se) a la observada (So).',
      results: (p, ctx, ok) => ({ rc: norm360(ok.rc + 180), ic: ok.ic }),
    },
    {
      id: 'intensidad-total',
      explain: 'Has dado la distancia total de deriva en lugar de la intensidad horaria: divide entre las horas transcurridas.',
      results: (p, ctx, ok) => ({ rc: ok.rc, ic: (ok.ic * (p.t1 - p.t0)) / 60 }),
    },
    { id: 'signo-ct', explain: 'La estima está mal: revisa el signo de la Ct al pasar de Ra a Rv.', mutate: (p) => ({ ...p, dm: -p.dm, desvio: -p.desvio }) },
  ],
});

import { defineExercise } from '../define.js';
import { correccionTotal, raFromRv } from '../../nautical/compass.js';
import {
  fmtBearing, fmtSignedNum, fmtClock, fmtKnots, fmtMiles, fmtPos, signedText,
  randomCompass, randomClock, describeByMark, byMarkText, retry, rhumbDestination, rhumbTo, round,
} from '../helpers.js';

export default defineExercise({
  id: 'rumbo-distancia',
  title: 'Rumbo y distancia entre dos puntos',
  category: 'estima',
  levels: ['PER', 'PY'],
  difficulty: 1,
  concepts: ['Rv', 'Ra', 'Ct', 'distancia', 'ETA'],
  summary: 'Qué rumbo de aguja dar para ir de A a B, cuántas millas son y a qué hora llegamos.',
  method: [
    'Sitúa en la carta el punto de salida y el de llegada.',
    'Une ambos con la regla y mide el rumbo verdadero con el transportador.',
    'Mide la distancia con el compás en la escala de latitudes.',
    'Ra = Rv − Ct. Tiempo = distancia / velocidad; súmalo a la hora de salida.',
  ],

  generate(rng, ctx) {
    const { chart } = ctx;
    return retry(() => {
      const a = describeByMark(chart, rng, chart.randomSeaPoint(rng, chart.bounds, 1.5), 8);
      const b = describeByMark(chart, rng, chart.randomSeaPoint(rng, chart.bounds, 1.5), 8);
      if (!a || !b || a.mark.id === b.mark.id) return null;
      if (!chart.isNavigable(a.pos, 0.5) || !chart.isNavigable(b.pos, 0.5)) return null;
      const { distance } = rhumbTo(a.pos, b.pos);
      if (distance < 4 || distance > 18 || !chart.isClearPath(a.pos, b.pos)) return null;
      const { dm, desvio } = randomCompass(rng, chart);
      return {
        from: { markId: a.mark.id, dv: a.dv, dist: a.dist },
        to: { markId: b.mark.id, dv: b.dv, dist: b.dist },
        dm, desvio, vb: rng.step(4, 10, 0.5), t0: randomClock(rng),
      };
    });
  },

  statement(p, { chart }) {
    const A = chart.point(p.from.markId);
    const B = chart.point(p.to.markId);
    return `A las ${fmtClock(p.t0)} nos encontramos ${byMarkText({ mark: A, ...p.from })}. ` +
      `Queremos dirigirnos a un punto situado ${byMarkText({ mark: B, ...p.to })}, navegando a ${fmtKnots(p.vb)}. ` +
      `dm = ${signedText(p.dm)}, Δ = ${fmtSignedNum(p.desvio)}. Calcula el rumbo verdadero, el rumbo de aguja, la distancia y la hora de llegada.`;
  },

  answers: [
    { key: 'rv', label: 'Rv', kind: 'bearing' },
    { key: 'ra', label: 'Ra', kind: 'bearing' },
    { key: 'dist', label: 'Distancia', kind: 'distance' },
    { key: 'eta', label: 'Hora de llegada', kind: 'clock', tolerance: 4 },
  ],

  solve(p, { chart }) {
    const A = chart.point(p.from.markId);
    const B = chart.point(p.to.markId);
    const start = rhumbDestination(A, (p.from.dv + 180) % 360, p.from.dist);
    const end = rhumbDestination(B, (p.to.dv + 180) % 360, p.to.dist);
    const { bearing: rv, distance: dist } = rhumbTo(start, end);
    const ct = correccionTotal(p.dm, p.desvio);
    const ra = raFromRv(rv, ct);
    const hours = dist / p.vb;
    const eta = p.t0 + hours * 60;
    return {
      results: { rv, ra, dist, eta },
      steps: [
        { title: 'Punto de salida', text: `Desde ${A.name}, demora opuesta ${fmtBearing(p.from.dv + 180)} y ${fmtMiles(p.from.dist)}: ${fmtPos(start)}.` },
        { title: 'Punto de llegada', text: `Desde ${B.name}, demora opuesta ${fmtBearing(p.to.dv + 180)} y ${fmtMiles(p.to.dist)}: ${fmtPos(end)}.` },
        { title: 'Rumbo verdadero y distancia', text: `Uniendo ambos puntos: Rv = ${fmtBearing(rv)} y distancia = ${fmtMiles(dist)}.` },
        { title: 'Rumbo de aguja', text: `Ct = (${fmtSignedNum(p.dm)}) + (${fmtSignedNum(p.desvio)}) = ${fmtSignedNum(ct)}. Ra = Rv − Ct = ${fmtBearing(rv)} − (${fmtSignedNum(ct)}) = ${fmtBearing(ra)}.` },
        { title: 'Hora de llegada', text: `t = d / V = ${fmtMiles(dist)} / ${fmtKnots(p.vb)} = ${round(hours * 60, 0)} min. Llegada: ${fmtClock(p.t0)} + ${round(hours * 60, 0)} min = ${fmtClock(eta)}.` },
      ],
      drawing: {
        focus: [start, end, A, B],
        items: [
          { t: 'ray', from: A, bearing: (p.from.dv + 180) % 360, length: p.from.dist, style: 'construction', step: 1 },
          { t: 'pos', at: start, label: 'Salida', style: 'start', step: 1 },
          { t: 'ray', from: B, bearing: (p.to.dv + 180) % 360, length: p.to.dist, style: 'construction', step: 2 },
          { t: 'pos', at: end, label: 'Destino', style: 'fix', step: 2 },
          { t: 'vec', from: start, bearing: rv, length: dist, label: `Rv ${fmtBearing(rv)} · ${fmtMiles(dist)}`, style: 'boat', step: 3 },
        ],
      },
    };
  },

  mistakes: [
    { id: 'signo-ct', explain: 'El Ra tiene la Ct aplicada al revés: Ra = Rv − Ct.', mutate: (p) => ({ ...p, dm: -p.dm, desvio: -p.desvio }) },
    {
      id: 'demora-sin-opuesta',
      explain: 'Algún punto está mal situado: desde la marca hay que trazar la demora opuesta (Dv ± 180°).',
      mutate: (p) => ({ ...p, from: { ...p.from, dv: (p.from.dv + 180) % 360 }, to: { ...p.to, dv: (p.to.dv + 180) % 360 } }),
    },
  ],
});

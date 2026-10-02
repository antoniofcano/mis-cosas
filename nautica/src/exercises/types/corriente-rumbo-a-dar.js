import { defineExercise } from '../define.js';
import { correccionTotal, raFromRv } from '../../nautical/compass.js';
import { courseToSteer } from '../../nautical/kinematics.js';
import {
  fmtBearing, fmtSignedNum, fmtClock, fmtKnots, fmtMiles, fmtPos, signedText,
  randomCompass, randomClock, describeByMark, byMarkText, retry, rhumbDestination, rhumbTo, norm360, round,
} from '../helpers.js';

export default defineExercise({
  id: 'corriente-rumbo-a-dar',
  title: 'Rumbo a dar para contrarrestar la corriente',
  category: 'corrientes',
  levels: ['PY'],
  difficulty: 3,
  concepts: ['corriente', 'Ref', 'Vef', 'Ct', 'ETA'],
  summary: 'Queremos llegar a un punto con corriente: ¿qué rumbo damos y cuándo llegamos?',
  method: [
    'Sitúa la salida y el destino; únelos: es el rumbo efectivo que queremos (Ref).',
    'Desde la salida traza el vector corriente (rumbo e intensidad de 1 hora).',
    'Con centro en el extremo de la corriente y radio = Vb (millas de 1 hora), corta la línea del Ref.',
    'Del extremo de la corriente a ese corte: Rv a dar. De la salida al corte: Vef.',
    'Ra = Rv − Ct. Tiempo = distancia / Vef.',
  ],

  generate(rng, ctx) {
    const { chart } = ctx;
    return retry(() => {
      const a = describeByMark(chart, rng, chart.randomSeaPoint(rng, chart.bounds, 1.5), 8);
      const b = describeByMark(chart, rng, chart.randomSeaPoint(rng, chart.bounds, 1.5), 8);
      if (!a || !b || a.mark.id === b.mark.id || !chart.isNavigable(a.pos, 0.5) || !chart.isNavigable(b.pos, 0.5)) return null;
      const { distance } = rhumbTo(a.pos, b.pos);
      if (distance < 4 || distance > 16 || !chart.isClearPath(a.pos, b.pos)) return null;
      const vb = rng.step(5, 10, 0.5);
      const rc = rng.step(0, 355, 5);
      const ic = rng.step(1, 3, 0.5);
      const { dm, desvio } = randomCompass(rng, chart);
      return {
        from: { markId: a.mark.id, dv: a.dv, dist: a.dist },
        to: { markId: b.mark.id, dv: b.dv, dist: b.dist },
        dm, desvio, vb, rc, ic, t0: randomClock(rng),
      };
    });
  },

  statement(p, { chart }) {
    const A = chart.point(p.from.markId);
    const B = chart.point(p.to.markId);
    return `A las ${fmtClock(p.t0)} nos encontramos ${byMarkText({ mark: A, ...p.from })}. Queremos ir a un punto situado ${byMarkText({ mark: B, ...p.to })}. ` +
      `En la zona hay una corriente de rumbo ${fmtBearing(p.rc)} e intensidad horaria ${fmtKnots(p.ic)}. Nuestra velocidad es ${fmtKnots(p.vb)}; dm = ${signedText(p.dm)}, Δ = ${fmtSignedNum(p.desvio)}. ` +
      `Calcula el rumbo de aguja a dar, la velocidad efectiva y la hora de llegada.`;
  },

  answers: [
    { key: 'ra', label: 'Ra a dar', kind: 'bearing', tolerance: 2 },
    { key: 'vef', label: 'Vef', kind: 'speed' },
    { key: 'eta', label: 'Hora de llegada', kind: 'clock', tolerance: 5 },
  ],

  solve(p, { chart }) {
    const A = chart.point(p.from.markId);
    const B = chart.point(p.to.markId);
    const start = rhumbDestination(A, norm360(p.from.dv + 180), p.from.dist);
    const end = rhumbDestination(B, norm360(p.to.dv + 180), p.to.dist);
    const { bearing: ref, distance } = rhumbTo(start, end);
    const sol = courseToSteer(ref, p.vb, p.rc, p.ic);
    if (!sol) throw new Error('Corriente demasiado fuerte');
    const { rs: rv, vef } = sol;
    const ct = correccionTotal(p.dm, p.desvio);
    const ra = raFromRv(rv, ct);
    const hours = distance / vef;
    const eta = p.t0 + hours * 60;
    const cTip = rhumbDestination(start, p.rc, p.ic);
    return {
      results: { ra, vef, eta, rv },
      steps: [
        { title: 'Salida y destino', text: `Salida: ${fmtPos(start)}. Destino: ${fmtPos(end)}.` },
        { title: 'Rumbo efectivo deseado', text: `Uniendo ambos: Ref = ${fmtBearing(ref)}, distancia ${fmtMiles(distance)}.` },
        { title: 'Vector corriente', text: `Desde la salida trazamos la corriente: ${fmtBearing(p.rc)} y ${fmtMiles(p.ic)} (1 hora).` },
        { title: 'Rumbo verdadero a dar', text: `Con centro en el extremo de la corriente y radio ${fmtMiles(p.vb)} cortamos el Ref. Del extremo de la corriente al corte: Rv = ${fmtBearing(rv)}. Desde la salida al corte: Vef = ${fmtKnots(vef)}.` },
        { title: 'Rumbo de aguja', text: `Ct = (${fmtSignedNum(p.dm)}) + (${fmtSignedNum(p.desvio)}) = ${fmtSignedNum(ct)}. Ra = Rv − Ct = ${fmtBearing(rv)} − (${fmtSignedNum(ct)}) = ${fmtBearing(ra)}.` },
        { title: 'Hora de llegada', text: `t = ${fmtMiles(distance)} / ${fmtKnots(vef)} = ${round(hours * 60, 0)} min → llegada a las ${fmtClock(eta)}.` },
      ],
      drawing: {
        focus: [start, end],
        items: [
          { t: 'pos', at: start, label: 'Salida', style: 'start', step: 1 },
          { t: 'pos', at: end, label: 'Destino', style: 'fix', step: 1 },
          { t: 'seg', from: start, to: end, label: `Ref ${fmtBearing(ref)}`, style: 'effective', step: 2 },
          { t: 'vec', from: start, bearing: p.rc, length: p.ic, label: 'Corriente', style: 'current', step: 3 },
          { t: 'arc', center: cTip, radius: p.vb, around: rv, span: 40, style: 'construction', step: 4 },
          { t: 'vec', from: cTip, bearing: rv, length: p.vb, label: `Rv ${fmtBearing(rv)}`, style: 'boat', step: 4 },
        ],
      },
    };
  },

  mistakes: [
    { id: 'ignora-corriente', explain: 'Has dado directamente el rumbo al destino, sin compensar la corriente.', mutate: (p) => ({ ...p, ic: 0.0001 }) },
    { id: 'corriente-invertida', explain: 'Has trazado la corriente al revés: su rumbo indica hacia dónde va.', mutate: (p) => ({ ...p, rc: norm360(p.rc + 180) }) },
    { id: 'signo-ct', explain: 'El Ra tiene la Ct aplicada al revés: Ra = Rv − Ct.', mutate: (p) => ({ ...p, dm: -p.dm, desvio: -p.desvio }) },
  ],
});

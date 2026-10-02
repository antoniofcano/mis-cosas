import { defineExercise } from '../define.js';
import { raFromRv } from '../../nautical/compass.js';
import { closestApproach } from '../../nautical/positioning.js';
import { toDeg } from '../../math/angles.js';
import { ctOf, compassText, compassSteps, randomCompassData, flipCt } from '../compass-data.js';
import { randomPosition, resolvePosition, positionText, positionExplain, positionDrawing } from '../position-data.js';
import { fmtBearing, fmtSignedNum, fmtMiles, fmtClock, randomClock, retry, norm360, rhumbTo, rhumbDestination } from '../helpers.js';

const nm = (chart, id) => chart.point(id).name.replace(/^Faro de /, 'faro de ');

/** Rumbo verdadero tangente al círculo de radio d alrededor del faro. */
function tangentCourse(from, mark, d, side) {
  const r = rhumbTo(from, mark);
  const alpha = toDeg(Math.asin(Math.min(1, d / r.distance)));
  return { rv: norm360(side === 'estribor' ? r.bearing - alpha : r.bearing + alpha), alpha, ...r };
}

export default defineExercise({
  id: 'rumbo-pasar-distancia',
  title: 'Rumbo para pasar a una distancia de un faro',
  category: 'estima',
  levels: ['PER', 'PY'],
  difficulty: 2,
  concepts: ['Rv', 'Ra', 'Ct', 'distancia'],
  summary: 'Desde la situación, ¿qué rumbo damos para pasar a X millas de un faro dejándolo por una banda?',
  method: [
    'Sitúa el barco en la carta.',
    'Con centro en el faro traza con el compás una circunferencia de radio la distancia de paso.',
    'Desde la situación traza la tangente a esa circunferencia por el lado correcto: si el faro debe quedar por estribor, la tangente pasa por la izquierda (babor) del faro, y al revés.',
    'Mide el Rv de la tangente y pásalo a aguja: Ra = Rv − Ct.',
  ],

  generate(rng, { chart }) {
    const lights = chart.marks().filter((m) => m.light);
    return retry(() => {
      const s = randomPosition(chart, rng);
      if (!s) return null;
      const mark = rng.pick(lights);
      const d = rng.pick([1, 1.5, 2, 2.5, 3, 4, 5]);
      const r = rhumbTo(s.pos, mark);
      if (r.distance < d + 3 || r.distance > 18) return null;
      const side = rng.pick(['babor', 'estribor']);
      const t = tangentCourse(s.pos, mark, d, side);
      const ca = closestApproach(s.pos, t.rv, mark);
      if (!chart.isClearPath(s.pos, ca.point, 0.3)) return null;
      return { salida: s.desc, markId: mark.id, d, side, aguja: randomCompassData(rng), t0: randomClock(rng) };
    });
  },

  statement(p, { chart }) {
    return `A HRB = ${fmtClock(p.t0)} nos encontramos ${positionText(chart, p.salida)}. Calcula el rumbo de aguja para pasar a ${fmtMiles(p.d)} del ${nm(chart, p.markId)}, dejándolo por ${p.side}, sabiendo que ${compassText(p.aguja)}.`;
  },

  answers: [
    { key: 'rv', label: 'Rv', kind: 'bearing', tolerance: 1.5 },
    { key: 'ra', label: 'Ra', kind: 'bearing', tolerance: 1.5 },
  ],

  solve(p, { chart }) {
    const start = resolvePosition(chart, p.salida);
    const mark = chart.point(p.markId);
    const t = tangentCourse(start, mark, p.d, p.side);
    const ct = ctOf(p.aguja);
    const ra = raFromRv(t.rv, ct);
    const ca = closestApproach(start, t.rv, mark);
    const cs = compassSteps(p.aguja);
    return {
      results: { rv: t.rv, ra },
      steps: [
        { title: 'Situación', text: positionExplain(chart, p.salida, 'el barco') },
        { title: 'Demora y distancia al faro', text: `Desde la situación, el ${nm(chart, p.markId)} demora ${fmtBearing(t.bearing)} a ${fmtMiles(t.distance)}.` },
        { title: 'Tangente', text: `Arco de ${fmtMiles(p.d)} con centro en el faro. Para dejarlo por ${p.side}, la tangente va ${p.side === 'estribor' ? 'a la izquierda' : 'a la derecha'} de la demora. Ángulo = arcsen(${p.d} / ${t.distance.toFixed(1).replace('.', ',')}) = ${t.alpha.toFixed(1).replace('.', ',')}° → Rv = ${fmtBearing(t.bearing)} ${p.side === 'estribor' ? '−' : '+'} ${t.alpha.toFixed(1).replace('.', ',')}° = ${fmtBearing(t.rv)}.` },
        ...cs,
        { title: 'Rumbo de aguja', text: `Ra = Rv − Ct = ${fmtBearing(t.rv)} − (${fmtSignedNum(ct)}) = ${fmtBearing(ra)}.` },
      ],
      drawing: {
        focus: [start, mark, ca.point],
        items: [
          ...positionDrawing(chart, p.salida, 1, 'Situación'),
          { t: 'seg', from: start, to: mark, style: 'construction', step: 2 },
          { t: 'arc', center: mark, radius: p.d, around: rhumbTo(mark, ca.point).bearing, span: 120, style: 'lop', step: 3 },
          { t: 'vec', from: start, bearing: t.rv, length: ca.along + 2, label: `Rv ${fmtBearing(t.rv)}`, style: 'boat', step: 3 },
        ],
      },
    };
  },

  mistakes: [
    { id: 'banda', explain: 'La tangente está trazada por el lado equivocado: dejar el faro por estribor significa que el barco pasa por su izquierda (el faro a nuestra derecha).', mutate: (p) => ({ ...p, side: p.side === 'babor' ? 'estribor' : 'babor' }) },
    { id: 'directo', explain: 'Has dado rumbo directo al faro, sin apartarte la distancia de paso.', mutate: (p) => ({ ...p, d: 0 }) },
    { id: 'signo-ct', explain: 'El Ra tiene la Ct aplicada al revés: Ra = Rv − Ct.', mutate: (p) => ({ ...p, aguja: flipCt(p.aguja) }) },
  ],
});

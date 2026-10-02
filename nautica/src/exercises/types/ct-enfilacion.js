import { defineExercise } from '../define.js';
import { ctFrom, desvioFrom } from '../../nautical/compass.js';
import {
  fmtBearing, fmtSignedNum, signedText, randomCompass, retry, norm360, rhumbTo, rhumbDestination,
} from '../helpers.js';

export default defineExercise({
  id: 'ct-enfilacion',
  title: 'Corrección total y desvío por enfilación',
  category: 'aguja',
  levels: ['PER', 'PY'],
  difficulty: 2,
  concepts: ['enfilacion', 'Ct', 'desvio', 'demora'],
  summary: 'Al cruzar la enfilación de dos puntos se compara su demora de aguja con la verdadera de la carta.',
  method: [
    'Une en la carta los dos puntos de la enfilación y mide su demora verdadera (desde el barco: del punto cercano al lejano).',
    'Ct = Dv − Da (demora verdadera de la carta menos la observada con la aguja).',
    'Δ = Ct − dm.',
  ],

  generate(rng, ctx) {
    const { chart } = ctx;
    const marks = chart.marks();
    return retry(() => {
      const [near, far] = rng.shuffle(marks).slice(0, 2);
      const { bearing, distance } = rhumbTo(near, far);
      if (distance < 1 || distance > 20) return null;
      const obs = rhumbDestination(near, norm360(bearing + 180), rng.real(1.5, 6));
      if (!chart.isNavigable(obs, 0.5) || !chart.isVisible(obs, near, 20)) return null;
      const { dm, desvio } = randomCompass(rng, chart);
      const dv = Math.round(bearing);
      return { nearId: near.id, farId: far.id, dm, da: norm360(dv - (dm + desvio)), ra: rng.int(0, 359) };
    });
  },

  statement(p, { chart }) {
    const near = chart.point(p.nearId);
    const far = chart.point(p.farId);
    return `Navegando al Ra = ${fmtBearing(p.ra)} cruzamos la enfilación ${near.name} – ${far.name}, y en ese momento la aguja da una demora de aguja Da = ${fmtBearing(p.da)} de la enfilación. ` +
      `Si dm = ${signedText(p.dm)}, calcula la corrección total y el desvío de la aguja para ese rumbo.`;
  },

  answers: [
    { key: 'ct', label: 'Ct', kind: 'signed', tolerance: 1 },
    { key: 'desvio', label: 'Desvío Δ', kind: 'signed', tolerance: 1 },
  ],

  solve(p, { chart }) {
    const near = chart.point(p.nearId);
    const far = chart.point(p.farId);
    const dv = rhumbTo(near, far).bearing;
    const ct = ctFrom(dv, p.da);
    const d = desvioFrom(ct, p.dm);
    return {
      results: { ct, desvio: d },
      steps: [
        { title: 'Demora verdadera de la enfilación', text: `Uniendo ${near.name} con ${far.name} en la carta medimos Dv = ${fmtBearing(dv, 1)} (≈ ${fmtBearing(dv)}).` },
        { title: 'Corrección total', text: `Ct = Dv − Da = ${fmtBearing(dv)} − ${fmtBearing(p.da)} = ${fmtSignedNum(ct, 1)}` },
        { title: 'Desvío', text: `Δ = Ct − dm = (${fmtSignedNum(ct, 1)}) − (${fmtSignedNum(p.dm)}) = ${fmtSignedNum(d, 1)}` },
      ],
      drawing: {
        focus: [near, far],
        items: [
          { t: 'line', through: near, bearing: dv, length: rhumbTo(near, far).distance * 2 + 8, label: `Enfilación ${fmtBearing(dv)}`, style: 'lop', step: 1 },
        ],
      },
    };
  },

  mistakes: [
    { id: 'resta-al-reves', explain: 'Has restado al revés: Ct = Dv − Da (verdadera menos aguja).', mutate: (p, { chart }) => ({ ...p, da: norm360(2 * rhumbTo(chart.point(p.nearId), chart.point(p.farId)).bearing - p.da) }) },
    { id: 'desvio-signo-dm', explain: 'Revisa el desvío: Δ = Ct − dm, con la dm W negativa.', mutate: (p) => ({ ...p, dm: -p.dm }) },
    { id: 'enfilacion-al-reves', explain: 'La demora de la enfilación se mide desde el barco: del punto más cercano hacia el más lejano.', mutate: (p) => ({ ...p, nearId: p.farId, farId: p.nearId }) },
  ],
});

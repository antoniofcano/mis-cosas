import { defineExercise } from '../define.js';
import { correccionTotal, raFromRv } from '../../nautical/compass.js';
import { fixBearingDistance } from '../../nautical/positioning.js';
import {
  fmtBearing, fmtSignedNum, fmtClock, fmtMiles, fmtPos, signedText,
  randomCompass, randomClock, retry, norm360, round,
} from '../helpers.js';

export default defineExercise({
  id: 'situacion-demora-distancia',
  title: 'Situación por demora y distancia',
  category: 'situacion',
  levels: ['PER', 'PY'],
  difficulty: 1,
  concepts: ['demora', 'Ct', 'distancia', 'linea-posicion'],
  summary: 'Demora de aguja a un faro y distancia (radar) al mismo faro.',
  method: [
    'Ct = dm + Δ y Dv = Da + Ct.',
    'Desde el faro traza la demora opuesta (Dv ± 180°).',
    'Sobre esa línea mide la distancia con el compás (escala de latitudes): ahí está el barco.',
  ],

  generate(rng, ctx) {
    const { chart } = ctx;
    return retry(() => {
      const pos = chart.randomSeaPoint(rng, chart.bounds, 1);
      const vis = chart.visibleMarks(pos, 12).filter((o) => o.distance > 1.5);
      if (!vis.length) return null;
      const o = rng.pick(vis);
      const { dm, desvio } = randomCompass(rng, chart);
      const ct = correccionTotal(dm, desvio);
      return {
        markId: o.mark.id, dm, desvio, ra: rng.int(0, 359), t: randomClock(rng),
        da: Math.round(norm360(o.bearing - ct)), dist: round(o.distance * 2, 0) / 2,
      };
    });
  },

  statement(p, { chart }) {
    const m = chart.point(p.markId);
    return `A las ${fmtClock(p.t)}, navegando al Ra = ${fmtBearing(p.ra)} (dm = ${signedText(p.dm)}, Δ = ${fmtSignedNum(p.desvio)}), ` +
      `tomamos demora de aguja del ${m.name} Da = ${fmtBearing(p.da)} y, simultáneamente, distancia radar al mismo faro de ${fmtMiles(p.dist)}. Calcula la situación.`;
  },

  answers: [
    { key: 'lat', label: 'Latitud', kind: 'lat' },
    { key: 'lon', label: 'Longitud', kind: 'lon' },
  ],

  solve(p, { chart }) {
    const m = chart.point(p.markId);
    const ct = correccionTotal(p.dm, p.desvio);
    const dv = norm360(p.da + ct);
    const fix = fixBearingDistance(m, dv, p.dist);
    return {
      results: { lat: fix.lat, lon: fix.lon },
      steps: [
        { title: 'Corrección total', text: `Ct = (${fmtSignedNum(p.dm)}) + (${fmtSignedNum(p.desvio)}) = ${fmtSignedNum(ct)}. Fíjate en que el rumbo solo sirve para saber qué desvío aplicar.` },
        { title: 'Demora verdadera', text: `Dv = Da + Ct = ${fmtBearing(p.da)} + (${fmtSignedNum(ct)}) = ${fmtBearing(dv)}` },
        { title: 'Línea de posición', text: `Desde ${m.name} trazamos la opuesta: ${fmtBearing(dv + 180)}.` },
        { title: 'Situación', text: `Midiendo ${fmtMiles(p.dist)} sobre esa línea: ${fmtPos(fix)}.` },
      ],
      drawing: {
        focus: [fix, m],
        items: [
          { t: 'ray', from: m, bearing: norm360(dv + 180), length: p.dist + 1.5, label: `Dv ${fmtBearing(dv)}`, style: 'lop', step: 3 },
          { t: 'arc', center: m, radius: p.dist, around: norm360(dv + 180), span: 30, style: 'lop', step: 4 },
          { t: 'pos', at: fix, label: `So ${fmtClock(p.t)}`, style: 'fix', step: 4 },
        ],
      },
    };
  },

  mistakes: [
    { id: 'signo-ct', explain: 'La Ct está aplicada al revés: Dv = Da + Ct (E +, W −).', mutate: (p) => ({ ...p, dm: -p.dm, desvio: -p.desvio }) },
    { id: 'sin-ct', explain: 'Has trazado la demora de aguja sin corregir.', mutate: (p) => ({ ...p, dm: 0, desvio: 0 }) },
    { id: 'demora-sin-opuesta', explain: 'Has trazado la demora desde el faro sin invertirla: desde el faro va la opuesta (Dv ± 180°).', mutate: (p) => ({ ...p, da: norm360(p.da + 180) }) },
  ],
});

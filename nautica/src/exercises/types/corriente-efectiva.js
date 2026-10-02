import { defineExercise } from '../define.js';
import { correccionTotal, rvFromRa, raFromRv } from '../../nautical/compass.js';
import { effectiveCourse } from '../../nautical/kinematics.js';
import {
  fmtBearing, fmtSignedNum, fmtClock, fmtKnots, fmtMiles, fmtPos, signedText,
  randomCompass, randomClock, describeByMark, byMarkText, retry, rhumbDestination, norm360,
} from '../helpers.js';

export default defineExercise({
  id: 'corriente-efectiva',
  title: 'Rumbo y velocidad efectivos con corriente',
  category: 'corrientes',
  levels: ['PY'],
  difficulty: 2,
  concepts: ['corriente', 'Ref', 'Vef', 'Ct'],
  summary: 'Conocida la corriente, ¿por dónde avanzamos realmente y dónde estaremos?',
  method: [
    'Pasa el Ra a Rv.',
    'Desde la salida traza el vector del barco: Rv y la distancia que navega en 1 hora (Vb).',
    'Desde el extremo traza el vector corriente: su rumbo (hacia donde va) e intensidad (1 hora).',
    'Une la salida con el extremo final: es el rumbo efectivo (Ref) y su longitud la velocidad efectiva (Vef).',
    'Situación a la hora pedida: sobre el Ref, distancia = Vef · t.',
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
      const minutes = rng.step(30, 120, 10);
      const { ref, vef } = effectiveCourse(rv, vb, rc, ic);
      const end = rhumbDestination(by.pos, ref, (vef * minutes) / 60);
      if (!chart.isNavigable(end, 0.5) || !chart.isClearPath(by.pos, end)) return null;
      const t0 = randomClock(rng);
      return { start: { markId: by.mark.id, dv: by.dv, dist: by.dist }, dm, desvio, ra: raFromRv(rv, ct), vb, rc, ic, t0, t1: t0 + minutes };
    });
  },

  statement(p, { chart }) {
    const mark = chart.point(p.start.markId);
    return `A las ${fmtClock(p.t0)} nos encontramos ${byMarkText({ mark, ...p.start })}. Damos Ra = ${fmtBearing(p.ra)} con velocidad ${fmtKnots(p.vb)} ` +
      `(dm = ${signedText(p.dm)}, Δ = ${fmtSignedNum(p.desvio)}) en una zona de corriente de rumbo ${fmtBearing(p.rc)} e intensidad horaria ${fmtKnots(p.ic)}. ` +
      `Calcula el rumbo efectivo, la velocidad efectiva y la situación a las ${fmtClock(p.t1)}.`;
  },

  answers: [
    { key: 'ref', label: 'Ref', kind: 'bearing', tolerance: 2 },
    { key: 'vef', label: 'Vef', kind: 'speed' },
    { key: 'lat', label: 'Latitud', kind: 'lat' },
    { key: 'lon', label: 'Longitud', kind: 'lon' },
  ],

  solve(p, { chart }) {
    const mark = chart.point(p.start.markId);
    const start = rhumbDestination(mark, norm360(p.start.dv + 180), p.start.dist);
    const ct = correccionTotal(p.dm, p.desvio);
    const rv = rvFromRa(p.ra, ct);
    const { ref, vef } = effectiveCourse(rv, p.vb, p.rc, p.ic);
    const hours = (p.t1 - p.t0) / 60;
    const end = rhumbDestination(start, ref, vef * hours);
    const tip = rhumbDestination(start, rv, p.vb);
    return {
      results: { ref, vef, lat: end.lat, lon: end.lon },
      steps: [
        { title: 'Situación de salida', text: `Desde ${mark.name}, opuesta ${fmtBearing(p.start.dv + 180)} y ${fmtMiles(p.start.dist)}: ${fmtPos(start)}.` },
        { title: 'Rumbo verdadero', text: `Ct = (${fmtSignedNum(p.dm)}) + (${fmtSignedNum(p.desvio)}) = ${fmtSignedNum(ct)}. Rv = ${fmtBearing(p.ra)} + (${fmtSignedNum(ct)}) = ${fmtBearing(rv)}.` },
        { title: 'Triángulo de velocidades', text: `Vector barco: ${fmtBearing(rv)} y ${fmtMiles(p.vb)} (1 h). A continuación, vector corriente: ${fmtBearing(p.rc)} y ${fmtMiles(p.ic)}.` },
        { title: 'Rumbo y velocidad efectivos', text: `La resultante desde la salida da Ref = ${fmtBearing(ref)} y Vef = ${fmtKnots(vef)}.` },
        { title: 'Situación', text: `En ${p.t1 - p.t0} min recorremos ${fmtMiles(vef * hours, 2)} sobre el Ref: ${fmtPos(end)}.` },
      ],
      drawing: {
        focus: [start, end, tip],
        items: [
          { t: 'pos', at: start, label: `Salida ${fmtClock(p.t0)}`, style: 'start', step: 1 },
          { t: 'vec', from: start, bearing: rv, length: p.vb, label: `Rv ${fmtBearing(rv)}`, style: 'boat', step: 3 },
          { t: 'vec', from: tip, bearing: p.rc, length: p.ic, label: `Corriente`, style: 'current', step: 3 },
          { t: 'vec', from: start, bearing: ref, length: Math.max(vef, vef * hours), label: `Ref ${fmtBearing(ref)}`, style: 'effective', step: 4 },
          { t: 'pos', at: end, label: `Se ${fmtClock(p.t1)}`, style: 'estima', step: 5 },
        ],
      },
    };
  },

  mistakes: [
    { id: 'corriente-invertida', explain: 'Has aplicado la corriente en sentido contrario. El rumbo de la corriente indica HACIA dónde va el agua.', mutate: (p) => ({ ...p, rc: norm360(p.rc + 180) }) },
    { id: 'sin-corriente', explain: 'No has tenido en cuenta la corriente: la situación sale por estima pura.', mutate: (p) => ({ ...p, ic: 0 }) },
    { id: 'signo-ct', explain: 'La Ct está aplicada al revés al pasar de Ra a Rv.', mutate: (p) => ({ ...p, dm: -p.dm, desvio: -p.desvio }) },
  ],
});

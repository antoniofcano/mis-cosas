import { defineExercise } from '../define.js';
import { correccionTotal, rvFromRa, raFromRv } from '../../nautical/compass.js';
import {
  fmtBearing, fmtSignedNum, fmtClock, fmtKnots, fmtMiles, fmtPos, signedText,
  randomCompass, randomClock, describeByMark, byMarkText, retry, rhumbDestination, round,
} from '../helpers.js';

export default defineExercise({
  id: 'estima-directa',
  title: 'Situación de estima',
  category: 'estima',
  levels: ['PER', 'PY'],
  difficulty: 1,
  concepts: ['estima', 'Ct', 'Rv', 'distancia'],
  summary: 'Desde una situación conocida, navegar a un rumbo y velocidad durante un tiempo: ¿dónde estamos?',
  method: [
    'Pasa el rumbo de aguja a verdadero (Rv = Ra + Ct).',
    'Calcula el tiempo navegado y la distancia: d = V · t.',
    'Desde la situación de salida traza el Rv y mide la distancia en la escala de latitudes (1 minuto = 1 milla) a la altura de la zona.',
    'Lee la latitud y longitud del punto obtenido.',
  ],

  generate(rng, ctx) {
    const { chart } = ctx;
    return retry(() => {
      const start0 = chart.randomSeaPoint(rng, chart.bounds, 1.5);
      const by = describeByMark(chart, rng, start0, 8);
      if (!by) return null;
      const start = by.pos;
      if (!chart.isNavigable(start, 0.5)) return null;
      const { dm, desvio } = randomCompass(rng, chart);
      const ct = correccionTotal(dm, desvio);
      const rv = rng.int(0, 359);
      const vb = rng.step(4, 9, 0.5);
      const minutes = rng.step(30, 120, 5);
      const dist = (vb * minutes) / 60;
      const end = rhumbDestination(start, rv, dist);
      if (!chart.isNavigable(end, 0.5) || !chart.isClearPath(start, end)) return null;
      const t0 = randomClock(rng);
      return {
        start: { markId: by.mark.id, dv: by.dv, dist: by.dist },
        dm, desvio, ra: raFromRv(rv, ct), vb, t0, t1: t0 + minutes,
      };
    });
  },

  statement(p, { chart }) {
    const mark = chart.point(p.start.markId);
    return `A las ${fmtClock(p.t0)} nos encontramos ${byMarkText({ mark, ...p.start })}. ` +
      `Damos rumbo de aguja Ra = ${fmtBearing(p.ra)} con una velocidad de ${fmtKnots(p.vb)}. ` +
      `dm = ${signedText(p.dm)}, Δ = ${fmtSignedNum(p.desvio)}. ¿Cuál será nuestra situación de estima a las ${fmtClock(p.t1)}?`;
  },

  answers: [
    { key: 'lat', label: 'Latitud', kind: 'lat' },
    { key: 'lon', label: 'Longitud', kind: 'lon' },
  ],

  solve(p, { chart }) {
    const mark = chart.point(p.start.markId);
    const start = rhumbDestination(mark, (p.start.dv + 180) % 360, p.start.dist);
    const ct = correccionTotal(p.dm, p.desvio);
    const rv = rvFromRa(p.ra, ct);
    const hours = (p.t1 - p.t0) / 60;
    const dist = p.vb * hours;
    const end = rhumbDestination(start, rv, dist);
    return {
      results: { lat: end.lat, lon: end.lon },
      steps: [
        {
          title: 'Situación de salida',
          text: `Desde el ${mark.name} trazamos la demora opuesta ${fmtBearing(p.start.dv + 180)} (Dv + 180°) y medimos ${fmtMiles(p.start.dist)}: salida en ${fmtPos(start)}.`,
        },
        { title: 'Corrección total', text: `Ct = dm + Δ = (${fmtSignedNum(p.dm)}) + (${fmtSignedNum(p.desvio)}) = ${fmtSignedNum(ct)}` },
        { title: 'Rumbo verdadero', text: `Rv = Ra + Ct = ${fmtBearing(p.ra)} + (${fmtSignedNum(ct)}) = ${fmtBearing(rv)}` },
        {
          title: 'Distancia navegada',
          text: `De ${fmtClock(p.t0)} a ${fmtClock(p.t1)} hay ${p.t1 - p.t0} min = ${round(hours, 3).toString().replace('.', ',')} h. d = V · t = ${fmtKnots(p.vb)} × ${round(hours, 3).toString().replace('.', ',')} h = ${fmtMiles(dist, 2)}.`,
        },
        { title: 'Situación de estima', text: `Trazando el Rv ${fmtBearing(rv)} desde la salida y midiendo ${fmtMiles(dist, 2)} llegamos a ${fmtPos(end)}.` },
      ],
      drawing: {
        focus: [start, end, mark],
        items: [
          { t: 'ray', from: mark, bearing: (p.start.dv + 180) % 360, length: p.start.dist, style: 'construction', step: 1 },
          { t: 'pos', at: start, label: `Salida ${fmtClock(p.t0)}`, style: 'start', step: 1 },
          { t: 'vec', from: start, bearing: rv, length: dist, label: `Rv ${fmtBearing(rv)}`, style: 'boat', step: 3 },
          { t: 'pos', at: end, label: `Se ${fmtClock(p.t1)}`, style: 'estima', step: 5 },
        ],
      },
    };
  },

  mistakes: [
    { id: 'signo-ct', explain: 'Has aplicado la Ct con el signo cambiado (Rv = Ra + Ct; E +, W −).', mutate: (p) => ({ ...p, dm: -p.dm, desvio: -p.desvio }) },
    { id: 'sin-ct', explain: 'Has trazado el rumbo de aguja en la carta sin corregirlo. En la carta solo se trazan rumbos verdaderos.', mutate: (p) => ({ ...p, dm: 0, desvio: 0 }) },
    { id: 'demora-sin-opuesta', explain: 'La salida está mal: desde el faro hay que trazar la demora OPUESTA (Dv ± 180°), porque la demora se mide desde el barco hacia el faro.', mutate: (p) => ({ ...p, start: { ...p.start, dv: (p.start.dv + 180) % 360 } }) },
  ],
});

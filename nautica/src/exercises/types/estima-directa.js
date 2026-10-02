import { defineExercise } from '../define.js';
import { rvFromRa, raFromRv } from '../../nautical/compass.js';
import { ctOf, compassText, compassSteps, randomCompassData, flipCt, noCt } from '../compass-data.js';
import { randomPosition, resolvePosition, positionText, positionExplain, positionDrawing, flipPositionBearing } from '../position-data.js';
import { fmtBearing, fmtSignedNum, fmtClock, fmtKnots, fmtMiles, fmtPos, randomClock, retry, rhumbDestination, round } from '../helpers.js';

export default defineExercise({
  id: 'estima-directa',
  title: 'Situación de estima',
  category: 'estima',
  levels: ['PER', 'PY'],
  difficulty: 1,
  concepts: ['estima', 'Ct', 'Rv', 'distancia'],
  summary: 'Desde una situación conocida, navegar a un rumbo y velocidad durante un tiempo: ¿dónde estamos?',
  method: [
    'Sitúa en la carta el punto de salida.',
    'Pasa el rumbo de aguja a verdadero (Rv = Ra + Ct).',
    'Calcula el tiempo navegado y la distancia: d = V · t.',
    'Desde la salida traza el Rv y mide la distancia en la escala de latitudes (1′ = 1 milla) a la altura de la zona.',
    'Lee la latitud y longitud del punto obtenido.',
  ],

  generate(rng, { chart }) {
    return retry(() => {
      const s = randomPosition(chart, rng);
      if (!s) return null;
      const aguja = randomCompassData(rng);
      const rv = rng.int(0, 359);
      const vb = rng.step(4, 9, 0.5);
      const minutes = rng.step(30, 150, 5);
      const end = rhumbDestination(s.pos, rv, (vb * minutes) / 60);
      if (!chart.isNavigable(end, 0.5) || !chart.isClearPath(s.pos, end)) return null;
      const t0 = randomClock(rng);
      return { salida: s.desc, aguja, ra: Math.round(raFromRv(rv, ctOf(aguja))) % 360, vb, t0, t1: t0 + minutes };
    });
  },

  statement(p, { chart }) {
    return `A HRB = ${fmtClock(p.t0)} nos encontramos ${positionText(chart, p.salida)}. Navegamos a ${fmtKnots(p.vb)} al rumbo de aguja ${fmtBearing(p.ra)}, en ausencia de viento y corriente. ` +
      `Calcula la situación de estima a HRB = ${fmtClock(p.t1)}, sabiendo que ${compassText(p.aguja)}.`;
  },

  answers: [
    { key: 'lat', label: 'Latitud', kind: 'lat' },
    { key: 'lon', label: 'Longitud', kind: 'lon' },
  ],

  solve(p, { chart }) {
    const start = resolvePosition(chart, p.salida);
    const ct = ctOf(p.aguja);
    const rv = rvFromRa(p.ra, ct);
    const hours = (p.t1 - p.t0) / 60;
    const dist = p.vb * hours;
    const end = rhumbDestination(start, rv, dist);
    const cs = compassSteps(p.aguja);
    return {
      results: { lat: end.lat, lon: end.lon },
      steps: [
        { title: 'Situación de salida', text: positionExplain(chart, p.salida, 'la salida') },
        ...cs,
        { title: 'Rumbo verdadero', text: `Rv = Ra + Ct = ${fmtBearing(p.ra)} + (${fmtSignedNum(ct)}) = ${fmtBearing(rv)}` },
        { title: 'Distancia navegada', text: `De ${fmtClock(p.t0)} a ${fmtClock(p.t1)} hay ${p.t1 - p.t0} min = ${String(round(hours, 3)).replace('.', ',')} h. d = V · t = ${fmtKnots(p.vb)} × ${String(round(hours, 3)).replace('.', ',')} h = ${fmtMiles(dist, 2)}.` },
        { title: 'Situación de estima', text: `Trazando el Rv ${fmtBearing(rv)} desde la salida y midiendo ${fmtMiles(dist, 2)}: ${fmtPos(end)}.` },
      ],
      drawing: {
        focus: [start, end],
        items: [
          ...positionDrawing(chart, p.salida, 1, `Salida ${fmtClock(p.t0)}`),
          { t: 'vec', from: start, bearing: rv, length: dist, label: `Rv ${fmtBearing(rv)}`, style: 'boat', step: 2 + cs.length },
          { t: 'pos', at: end, label: `Se ${fmtClock(p.t1)}`, style: 'estima', step: 4 + cs.length },
        ],
      },
    };
  },

  mistakes: [
    { id: 'signo-ct', explain: 'Has aplicado la Ct con el signo cambiado (Rv = Ra + Ct; E/NE +, W/NW −).', mutate: (p) => ({ ...p, aguja: flipCt(p.aguja) }) },
    { id: 'sin-ct', explain: 'Has trazado el rumbo de aguja en la carta sin corregirlo. En la carta solo se trazan rumbos verdaderos.', mutate: (p) => ({ ...p, aguja: noCt() }) },
    { id: 'salida-invertida', explain: 'La salida está mal situada: revisa hacia qué lado del faro está el barco.', mutate: (p) => ({ ...p, salida: flipPositionBearing(p.salida) }) },
  ],
});

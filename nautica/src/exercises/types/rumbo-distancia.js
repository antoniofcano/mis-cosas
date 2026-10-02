import { defineExercise } from '../define.js';
import { raFromRv } from '../../nautical/compass.js';
import { ctOf, compassText, compassSteps, randomCompassData, flipCt } from '../compass-data.js';
import { randomPosition, resolvePosition, positionText, positionExplain, positionDrawing, flipPositionBearing } from '../position-data.js';
import { fmtBearing, fmtSignedNum, fmtClock, fmtKnots, fmtMiles, randomClock, retry, rhumbTo, round } from '../helpers.js';

export default defineExercise({
  id: 'rumbo-distancia',
  title: 'Rumbo de aguja, distancia y hora de llegada',
  category: 'estima',
  levels: ['PER', 'PY'],
  difficulty: 1,
  concepts: ['Rv', 'Ra', 'Ct', 'distancia', 'ETA'],
  summary: 'Qué rumbo de aguja dar para ir a un puerto o punto, cuántas millas son y a qué hora llegamos.',
  method: [
    'Sitúa en la carta el punto de salida y el de llegada.',
    'Une ambos con la regla y mide el rumbo verdadero con el transportador.',
    'Mide la distancia con el compás en la escala de latitudes.',
    'Ra = Rv − Ct. Tiempo = distancia / velocidad; súmalo a la HRB de salida.',
  ],

  generate(rng, { chart }) {
    const ports = chart.points().filter((p) => p.port);
    return retry(() => {
      const a = randomPosition(chart, rng);
      if (!a) return null;
      let destino;
      let end;
      if (ports.length && rng.bool(0.5)) {
        const port = rng.pick(ports);
        destino = { puerto: port.id };
        end = port;
      } else {
        const b = randomPosition(chart, rng, { modos: ['coords', 'rumbo-desde', 'demora'] });
        if (!b) return null;
        destino = { punto: b.desc };
        end = b.pos;
      }
      const { distance } = rhumbTo(a.pos, end);
      if (distance < 4 || distance > 20 || !chart.isClearPath(a.pos, end, destino.puerto ? 0 : 0.2)) return null;
      return { salida: a.desc, destino, aguja: randomCompassData(rng), vb: rng.step(4, 10, 0.5), t0: randomClock(rng) };
    });
  },

  statement(p, { chart }) {
    const dest = p.destino.puerto
      ? `damos rumbo al puerto de ${chart.point(p.destino.puerto).portName ?? chart.point(p.destino.puerto).name} (${chart.point(p.destino.puerto).portLight ?? 'luz de la bocana'})`
      : `damos rumbo a un punto situado ${positionText(chart, p.destino.punto)}`;
    return `A HRB = ${fmtClock(p.t0)} nos encontramos ${positionText(chart, p.salida)}. Situados, ${dest} con velocidad ${fmtKnots(p.vb)}, en ausencia de viento y corriente. ` +
      `Calcula el rumbo de aguja, la distancia y la HRB de llegada, sabiendo que ${compassText(p.aguja)}.`;
  },

  answers: [
    { key: 'ra', label: 'Ra', kind: 'bearing' },
    { key: 'dist', label: 'Distancia', kind: 'distance' },
    { key: 'eta', label: 'HRB de llegada', kind: 'clock', tolerance: 4 },
  ],

  solve(p, { chart }) {
    const start = resolvePosition(chart, p.salida);
    const end = p.destino.puerto ? chart.point(p.destino.puerto) : resolvePosition(chart, p.destino.punto);
    const { bearing: rv, distance: dist } = rhumbTo(start, end);
    const ct = ctOf(p.aguja);
    const ra = raFromRv(rv, ct);
    const hours = dist / p.vb;
    const eta = p.t0 + hours * 60;
    const cs = compassSteps(p.aguja);
    return {
      results: { rv, ra, dist, eta },
      steps: [
        { title: 'Punto de salida', text: positionExplain(chart, p.salida, 'la salida') },
        { title: 'Punto de llegada', text: p.destino.puerto ? `El punto de llegada es la luz del puerto: ${chart.point(p.destino.puerto).name}.` : positionExplain(chart, p.destino.punto, 'el destino') },
        { title: 'Rumbo verdadero y distancia', text: `Uniendo ambos puntos: Rv = ${fmtBearing(rv)} y distancia = ${fmtMiles(dist)}.` },
        ...cs,
        { title: 'Rumbo de aguja', text: `Ra = Rv − Ct = ${fmtBearing(rv)} − (${fmtSignedNum(ct)}) = ${fmtBearing(ra)}.` },
        { title: 'HRB de llegada', text: `t = d / V = ${fmtMiles(dist)} / ${fmtKnots(p.vb)} = ${round(hours * 60, 0)} min. Llegada: ${fmtClock(p.t0)} + ${round(hours * 60, 0)} min = ${fmtClock(eta)}.` },
      ],
      drawing: {
        focus: [start, end],
        items: [
          ...positionDrawing(chart, p.salida, 1, 'Salida'),
          ...(p.destino.puerto ? [{ t: 'pos', at: end, label: 'Llegada', style: 'fix', step: 2 }] : positionDrawing(chart, p.destino.punto, 2, 'Destino')),
          { t: 'vec', from: start, bearing: rv, length: dist, label: `Rv ${fmtBearing(rv)} · ${fmtMiles(dist)}`, style: 'boat', step: 3 },
        ],
      },
    };
  },

  mistakes: [
    { id: 'signo-ct', explain: 'El Ra tiene la Ct aplicada al revés: Ra = Rv − Ct.', mutate: (p) => ({ ...p, aguja: flipCt(p.aguja) }) },
    { id: 'salida-invertida', explain: 'La salida está mal situada: revisa hacia qué lado del faro está el barco.', mutate: (p) => ({ ...p, salida: flipPositionBearing(p.salida) }) },
  ],
});

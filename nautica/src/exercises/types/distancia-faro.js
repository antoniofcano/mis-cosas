import { defineExercise } from '../define.js';
import { fixTwoBearings } from '../../nautical/positioning.js';
import { angleDist } from '../../math/angles.js';
import { fmtBearing, fmtMiles, fmtPos, retry, norm360, rhumbTo, rhumbDestination } from '../helpers.js';

const nm = (chart, id) => chart.point(id).name.replace(/^Faro de /, 'faro de ');

export default defineExercise({
  id: 'distancia-faro',
  title: 'Situación por oposición o enfilación y demora: distancia a un faro',
  category: 'situacion',
  levels: ['PER', 'PY'],
  difficulty: 2,
  concepts: ['oposicion', 'enfilacion', 'demora', 'linea-posicion', 'distancia'],
  summary: 'Una oposición/enfilación y una demora verdadera nos sitúan; luego medimos la distancia a otro faro.',
  method: [
    'Primera línea de posición: la recta que une los dos faros de la oposición o enfilación (no hace falta Ct: se traza en la carta).',
    'Segunda línea: desde el otro faro, la demora verdadera opuesta (Dv ± 180°).',
    'El corte es la situación. Mide con el compás la distancia al faro pedido, en la escala de latitudes.',
  ],

  generate(rng, { chart }) {
    const lights = chart.marks().filter((m) => m.light);
    return retry(() => {
      const [a, b, c, d] = rng.shuffle(lights);
      const ab = rhumbTo(a, b);
      if (ab.distance < 3 || ab.distance > 25) return null;
      const tipo = rng.bool(0.6) ? 'oposicion' : 'enfilacion';
      const pos = tipo === 'oposicion'
        ? rhumbDestination(a, ab.bearing, ab.distance * rng.real(0.25, 0.75))
        : rhumbDestination(a, norm360(ab.bearing + 180), rng.real(1.5, 6));
      if (!chart.isNavigable(pos, 0.5)) return null;
      const toC = rhumbTo(pos, c);
      if (toC.distance > 14 || toC.distance < 1.5 || !chart.isVisible(pos, c, 14)) return null;
      if (angleDist(toC.bearing, ab.bearing) < 30 || angleDist(toC.bearing, ab.bearing) > 150) return null;
      const target = rng.bool(0.5) ? d : rng.pick([a, b]);
      if (rhumbTo(pos, target).distance > 25) return null;
      return { tipo, a: a.id, b: b.id, c: c.id, dvC: Math.round(toC.bearing) % 360, target: target.id };
    });
  },

  statement(p, { chart }) {
    const linea = p.tipo === 'oposicion' ? 'la oposición' : 'la enfilación';
    return `Al cruzar ${linea} de los faros de ${nm(chart, p.a).replace('faro de ', '')} y ${nm(chart, p.b).replace('faro de ', '')}, marcamos el ${nm(chart, p.c)} en demora verdadera ${fmtBearing(p.dvC)}. ` +
      `Calcula a qué distancia nos encontramos del ${nm(chart, p.target)}.`;
  },

  answers: [
    { key: 'dist', label: 'Distancia', kind: 'distance', tolerance: 0.4 },
    { key: 'lat', label: 'Latitud (situación)', kind: 'lat', tolerance: 1 },
    { key: 'lon', label: 'Longitud (situación)', kind: 'lon', tolerance: 1 },
  ],

  solve(p, { chart }) {
    const A = chart.point(p.a);
    const B = chart.point(p.b);
    const C = chart.point(p.c);
    const T = chart.point(p.target);
    const ab = rhumbTo(A, B).bearing;
    // La línea A-B: el barco está sobre ella; la cortamos con la demora a C.
    const fix = fixTwoBearings(A, p.tipo === 'oposicion' ? norm360(ab + 180) : ab, C, p.dvC)
      ?? fixTwoBearings(A, ab, C, p.dvC) ?? fixTwoBearings(A, norm360(ab + 180), C, p.dvC);
    if (!fix) throw new Error('Sin corte');
    const dist = rhumbTo(fix, T).distance;
    return {
      results: { dist, lat: fix.lat, lon: fix.lon },
      steps: [
        { title: `Línea de la ${p.tipo === 'oposicion' ? 'oposición' : 'enfilación'}`, text: `Unimos en la carta ${nm(chart, p.a)} y ${nm(chart, p.b)} (dirección ${fmtBearing(ab)}): el barco está sobre esa recta${p.tipo === 'oposicion' ? ', entre los dos faros' : ', en su prolongación'}.` },
        { title: 'Demora', text: `Desde el ${nm(chart, p.c)} trazamos la opuesta de la demora: ${fmtBearing(p.dvC + 180)}.` },
        { title: 'Situación', text: `El corte da ${fmtPos(fix)}.` },
        { title: 'Distancia', text: `Medimos con el compás desde la situación al ${nm(chart, p.target)}: ${fmtMiles(dist)}.` },
      ],
      drawing: {
        focus: [fix, A, B, C, T],
        items: [
          p.tipo === 'oposicion'
            ? { t: 'seg', from: A, to: B, style: 'lop', step: 1 }
            : { t: 'line', through: A, bearing: ab, length: rhumbTo(A, B).distance * 2 + 12, style: 'lop', step: 1 },
          { t: 'ray', from: C, bearing: norm360(p.dvC + 180), length: rhumbTo(C, fix).distance + 1.5, label: `Dv ${fmtBearing(p.dvC)}`, style: 'lop', step: 2 },
          { t: 'pos', at: fix, label: 'So', style: 'fix', step: 3 },
          { t: 'seg', from: fix, to: T, label: fmtMiles(dist), style: 'construction', step: 4 },
        ],
      },
    };
  },

  mistakes: [],
});

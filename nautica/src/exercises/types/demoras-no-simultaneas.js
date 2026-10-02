import { defineExercise } from '../define.js';
import { correccionTotal, rvFromRa, raFromRv } from '../../nautical/compass.js';
import { fixRunning } from '../../nautical/positioning.js';
import { angleDist } from '../../math/angles.js';
import {
  fmtBearing, fmtSignedNum, fmtClock, fmtKnots, fmtMiles, fmtPos, signedText,
  randomCompass, randomClock, retry, norm360, rhumbDestination, rhumbTo, round,
} from '../helpers.js';

export default defineExercise({
  id: 'demoras-no-simultaneas',
  title: 'Situación por demoras no simultáneas',
  category: 'situacion',
  levels: ['PER', 'PY'],
  difficulty: 3,
  concepts: ['demora', 'Ct', 'linea-posicion', 'traslado'],
  summary: 'Dos demoras tomadas en momentos distintos: trasladar la primera línea de posición.',
  method: [
    'Corrige ambas demoras: Dv = Da + Ct.',
    'Calcula la distancia navegada entre las dos observaciones: d = V · t, y el Rv.',
    'Traza la primera línea de posición. Desde cualquier punto de ella traza el Rv y mide d: por el extremo traza una paralela (línea trasladada).',
    'El corte de la línea trasladada con la segunda línea de posición es la situación a la hora de la 2ª demora.',
  ],

  generate(rng, ctx) {
    const { chart } = ctx;
    return retry(() => {
      const p1 = chart.randomSeaPoint(rng, chart.bounds, 1.5);
      const { dm, desvio } = randomCompass(rng, chart);
      const ct = correccionTotal(dm, desvio);
      const rv = rng.int(0, 359);
      const vb = rng.step(4, 9, 0.5);
      const minutes = rng.step(30, 90, 5);
      const p2 = rhumbDestination(p1, rv, (vb * minutes) / 60);
      if (!chart.isNavigable(p2, 1) || !chart.isClearPath(p1, p2)) return null;
      const v1 = chart.visibleMarks(p1, 14).filter((o) => o.distance > 2);
      const v2 = chart.visibleMarks(p2, 14).filter((o) => o.distance > 2);
      if (!v1.length || !v2.length) return null;
      const a = rng.pick(v1);
      const b = rng.pick(v2);
      if (angleDist(a.bearing, rhumbTo(p2, a.mark).bearing) < 5 && a.mark.id === b.mark.id) return null;
      if (angleDist(a.bearing, b.bearing) < 35 || angleDist(a.bearing, b.bearing) > 145) return null;
      const t0 = randomClock(rng);
      return {
        dm, desvio, ra: raFromRv(rv, ct), vb, t0, t1: t0 + minutes,
        obs: [
          { markId: a.mark.id, da: Math.round(norm360(a.bearing - ct)) },
          { markId: b.mark.id, da: Math.round(norm360(b.bearing - ct)) },
        ],
      };
    });
  },

  statement(p, { chart }) {
    const [A, B] = p.obs.map((o) => chart.point(o.markId));
    return `Navegamos al Ra = ${fmtBearing(p.ra)} con velocidad ${fmtKnots(p.vb)}; dm = ${signedText(p.dm)}, Δ = ${fmtSignedNum(p.desvio)}. ` +
      `A las ${fmtClock(p.t0)} tomamos demora de aguja del ${A.name} Da = ${fmtBearing(p.obs[0].da)}. ` +
      `Continuamos navegando y a las ${fmtClock(p.t1)} tomamos demora de aguja del ${B.name} Da = ${fmtBearing(p.obs[1].da)}. Calcula la situación a las ${fmtClock(p.t1)}.`;
  },

  answers: [
    { key: 'lat', label: 'Latitud', kind: 'lat', tolerance: 1.5 },
    { key: 'lon', label: 'Longitud', kind: 'lon', tolerance: 1.5 },
  ],

  solve(p, { chart }) {
    const ct = correccionTotal(p.dm, p.desvio);
    const rv = rvFromRa(p.ra, ct);
    const [A, B] = p.obs.map((o) => chart.point(o.markId));
    const [dv1, dv2] = p.obs.map((o) => norm360(o.da + ct));
    const minutes = p.t1 - p.t0;
    const run = (p.vb * minutes) / 60;
    const r = fixRunning(A, dv1, B, dv2, rv, run);
    if (!r) throw new Error('Las líneas no se cortan');
    const { fix, first } = r;
    // Punto de apoyo para dibujar el traslado: el propio punto de la 1ª línea donde estaba el barco.
    return {
      results: { lat: fix.lat, lon: fix.lon },
      steps: [
        { title: 'Ct y Rv', text: `Ct = (${fmtSignedNum(p.dm)}) + (${fmtSignedNum(p.desvio)}) = ${fmtSignedNum(ct)}; Rv = ${fmtBearing(p.ra)} + (${fmtSignedNum(ct)}) = ${fmtBearing(rv)}.` },
        { title: 'Demoras verdaderas', text: `Dv ${A.name} = ${fmtBearing(p.obs[0].da)} + (${fmtSignedNum(ct)}) = ${fmtBearing(dv1)}. Dv ${B.name} = ${fmtBearing(p.obs[1].da)} + (${fmtSignedNum(ct)}) = ${fmtBearing(dv2)}.` },
        { title: 'Distancia navegada', text: `Entre ${fmtClock(p.t0)} y ${fmtClock(p.t1)} hay ${minutes} min: d = ${fmtKnots(p.vb)} × ${round(minutes / 60, 3).toString().replace('.', ',')} h = ${fmtMiles(run, 2)}.` },
        { title: 'Traslado de la 1ª línea', text: `Trazamos desde ${A.name} la línea ${fmtBearing(dv1 + 180)}. Desde un punto cualquiera de ella llevamos el Rv ${fmtBearing(rv)} y ${fmtMiles(run, 2)}, y por ahí trazamos una paralela a la primera línea.` },
        { title: 'Segunda línea y situación', text: `Desde ${B.name} trazamos ${fmtBearing(dv2 + 180)}. El corte con la línea trasladada da la situación a las ${fmtClock(p.t1)}: ${fmtPos(fix)}. (A las ${fmtClock(p.t0)} el barco estaba en ${fmtPos(first)}.)` },
      ],
      drawing: {
        focus: [fix, first, A, B],
        items: [
          { t: 'ray', from: A, bearing: norm360(dv1 + 180), length: rhumbTo(A, first).distance + 2, label: `1ª Dv ${fmtBearing(dv1)}`, style: 'lop', step: 4 },
          { t: 'vec', from: first, bearing: rv, length: run, label: `${fmtMiles(run, 1)}`, style: 'boat', step: 4 },
          { t: 'line', through: fix, bearing: dv1, length: 6, label: 'trasladada', style: 'lop2', step: 4 },
          { t: 'ray', from: B, bearing: norm360(dv2 + 180), length: rhumbTo(B, fix).distance + 2, label: `2ª Dv ${fmtBearing(dv2)}`, style: 'lop', step: 5 },
          { t: 'pos', at: fix, label: `So ${fmtClock(p.t1)}`, style: 'fix', step: 5 },
        ],
      },
    };
  },

  mistakes: [
    { id: 'signo-ct', explain: 'La Ct está aplicada al revés en las demoras o en el rumbo.', mutate: (p) => ({ ...p, dm: -p.dm, desvio: -p.desvio }) },
    { id: 'sin-traslado', explain: 'Has cruzado las dos demoras como si fueran simultáneas. La primera línea debe trasladarse lo navegado entre ambas horas.', mutate: (p) => ({ ...p, vb: 0.0001 }) },
  ],
});

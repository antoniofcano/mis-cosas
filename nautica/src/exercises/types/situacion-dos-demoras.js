import { defineExercise } from '../define.js';
import { correccionTotal, rvFromRa, raFromRv } from '../../nautical/compass.js';
import { fixTwoBearings } from '../../nautical/positioning.js';
import { angleDist, norm180 } from '../../math/angles.js';
import {
  fmtBearing, fmtSignedNum, fmtClock, fmtPos, signedText,
  randomCompass, randomClock, retry, norm360, round,
} from '../helpers.js';

const marcText = (m) => `${Math.abs(m)}° por ${m >= 0 ? 'estribor' : 'babor'}`;

export default defineExercise({
  id: 'situacion-dos-demoras',
  title: 'Situación por dos demoras simultáneas',
  category: 'situacion',
  levels: ['PER', 'PY'],
  difficulty: 2,
  concepts: ['demora', 'marcacion', 'Ct', 'linea-posicion'],
  summary: 'Demoras de aguja (o marcaciones) a dos faros tomadas a la vez: corregirlas y cruzarlas.',
  method: [
    'Calcula la Ct del rumbo que llevas (Ct = dm + Δ).',
    'Convierte cada demora de aguja en verdadera: Dv = Da + Ct. Si te dan marcaciones: Dv = Rv + M (estribor +, babor −).',
    'Desde cada faro traza la demora OPUESTA (Dv ± 180°): es la línea de posición.',
    'El barco está donde se cortan las dos líneas. Lee latitud y longitud.',
  ],

  generate(rng, ctx) {
    const { chart } = ctx;
    return retry(() => {
      const pos = chart.randomSeaPoint(rng, chart.bounds, 1.5);
      const vis = chart.visibleMarks(pos, 14).filter((o) => o.distance > 1.5);
      if (vis.length < 2) return null;
      const [a, b] = rng.shuffle(vis);
      const cut = angleDist(a.bearing, b.bearing);
      if (cut < 35 || cut > 145) return null;
      const { dm, desvio } = randomCompass(rng, chart);
      const ct = correccionTotal(dm, desvio);
      const rv = rng.int(0, 359);
      const variant = rng.bool(0.3) ? 'marcaciones' : 'demoras';
      const da = (o) => Math.round(norm360(o.bearing - ct));
      const marc = (o) => Math.round(norm180(o.bearing - rv));
      return {
        variant, dm, desvio, ra: raFromRv(rv, ct), t: randomClock(rng),
        obs: [a, b].map((o) => ({ markId: o.mark.id, da: da(o), m: marc(o) })),
      };
    });
  },

  statement(p, { chart }) {
    const [A, B] = p.obs.map((o) => chart.point(o.markId));
    const base = `Navegando al Ra = ${fmtBearing(p.ra)}, con dm = ${signedText(p.dm)} y Δ = ${fmtSignedNum(p.desvio)}, a las ${fmtClock(p.t)} tomamos simultáneamente `;
    if (p.variant === 'marcaciones') {
      return base + `marcación del ${A.name} ${marcText(p.obs[0].m)} y marcación del ${B.name} ${marcText(p.obs[1].m)}. Calcula la situación.`;
    }
    return base + `demora de aguja del ${A.name} Da = ${fmtBearing(p.obs[0].da)} y demora de aguja del ${B.name} Da = ${fmtBearing(p.obs[1].da)}. Calcula la situación.`;
  },

  answers: [
    { key: 'lat', label: 'Latitud', kind: 'lat' },
    { key: 'lon', label: 'Longitud', kind: 'lon' },
  ],

  solve(p, { chart }) {
    const ct = correccionTotal(p.dm, p.desvio);
    const rv = rvFromRa(p.ra, ct);
    const marks = p.obs.map((o) => chart.point(o.markId));
    const dvs = p.obs.map((o) => (p.variant === 'marcaciones' ? norm360(rv + o.m) : norm360(o.da + ct)));
    const fix = fixTwoBearings(marks[0], dvs[0], marks[1], dvs[1]);
    if (!fix) throw new Error('Las demoras no se cortan');
    const steps = [{ title: 'Corrección total', text: `Ct = dm + Δ = (${fmtSignedNum(p.dm)}) + (${fmtSignedNum(p.desvio)}) = ${fmtSignedNum(ct)}` }];
    if (p.variant === 'marcaciones') {
      steps.push({ title: 'Rumbo verdadero', text: `Rv = Ra + Ct = ${fmtBearing(p.ra)} + (${fmtSignedNum(ct)}) = ${fmtBearing(rv)}` });
      steps.push({
        title: 'Demoras verdaderas',
        text: p.obs.map((o, i) => `Dv ${marks[i].name} = Rv + M = ${fmtBearing(rv)} + (${o.m >= 0 ? '+' : '−'}${Math.abs(o.m)}°) = ${fmtBearing(dvs[i])}`).join('. '),
      });
    } else {
      steps.push({
        title: 'Demoras verdaderas',
        text: p.obs.map((o, i) => `Dv ${marks[i].name} = Da + Ct = ${fmtBearing(o.da)} + (${fmtSignedNum(ct)}) = ${fmtBearing(dvs[i])}`).join('. '),
      });
    }
    steps.push({
      title: 'Líneas de posición',
      text: p.obs.map((o, i) => `Desde ${marks[i].name} se traza ${fmtBearing(dvs[i] + 180)} (Dv + 180°)`).join('; ') + '.',
    });
    steps.push({ title: 'Situación', text: `El corte de ambas líneas da: ${fmtPos(fix)} (hora ${fmtClock(p.t)}).` });
    const lineSteps = p.variant === 'marcaciones' ? 4 : 3;
    return {
      results: { lat: fix.lat, lon: fix.lon },
      steps,
      drawing: {
        focus: [fix, ...marks],
        items: [
          ...marks.map((m, i) => ({ t: 'ray', from: m, bearing: norm360(dvs[i] + 180), length: chartDist(m, fix) + 1.5, label: `Dv ${fmtBearing(dvs[i])}`, style: 'lop', step: lineSteps })),
          { t: 'pos', at: fix, label: `So ${fmtClock(p.t)}`, style: 'fix', step: lineSteps + 1 },
        ],
      },
    };
  },

  mistakes: [
    { id: 'signo-ct', explain: 'Has corregido las demoras con la Ct cambiada de signo (Dv = Da + Ct).', mutate: (p) => ({ ...p, dm: -p.dm, desvio: -p.desvio }) },
    { id: 'sin-ct', explain: 'Has trazado las demoras de aguja sin corregirlas. En la carta solo se trazan demoras verdaderas.', mutate: (p) => ({ ...p, dm: 0, desvio: 0 }) },
    {
      id: 'banda-marcacion',
      explain: 'Revisa el signo de las marcaciones: estribor suma (+) y babor resta (−).',
      mutate: (p) => ({ ...p, obs: p.obs.map((o) => ({ ...o, m: -o.m })) }),
    },
  ],
});

function chartDist(a, b) {
  const dLat = (a.lat - b.lat) * 60;
  const dLon = (a.lon - b.lon) * 60 * Math.cos((a.lat * Math.PI) / 180);
  return round(Math.hypot(dLat, dLon), 1);
}

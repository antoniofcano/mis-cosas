import { defineExercise } from '../define.js';
import { rvFromRa, raFromRv } from '../../nautical/compass.js';
import { fixTwoBearings } from '../../nautical/positioning.js';
import { angleDist, norm180 } from '../../math/angles.js';
import { ctOf, compassText, compassSteps, randomCompassData, flipCt, noCt } from '../compass-data.js';
import { fmtBearing, fmtSignedNum, fmtClock, fmtPos, randomClock, retry, norm360, rhumbTo } from '../helpers.js';

const VARIANTS = ['marcaciones-rv', 'marcaciones-ra', 'demoras-aguja', 'mixta'];
const marcText = (m) => `${String(Math.abs(m)).padStart(3, '0')}º ${m >= 0 ? 'Estribor (ER)' : 'Babor (BR)'}`;
const nm = (chart, id) => chart.point(id).name.replace(/^Faro de /, 'faro de ');

export default defineExercise({
  id: 'situacion-dos-demoras',
  title: 'Situación por dos demoras o marcaciones simultáneas',
  category: 'situacion',
  levels: ['PER', 'PY'],
  difficulty: 2,
  concepts: ['demora', 'marcacion', 'Ct', 'linea-posicion'],
  summary: 'Demoras de aguja o marcaciones a dos faros tomadas a la vez: pasarlas a verdaderas y cruzarlas.',
  method: [
    'Si hay rumbo o demoras de aguja, calcula la Ct (Ct = dm + Δ) y el Rv.',
    'Demora de aguja → Dv = Da + Ct. Marcación → Dv = Rv + M (estribor +, babor −).',
    'Desde cada faro traza la demora OPUESTA (Dv ± 180°): es la línea de posición.',
    'El barco está donde se cortan las dos líneas. Lee latitud y longitud.',
  ],

  generate(rng, { chart }) {
    return retry(() => {
      const pos = chart.randomSeaPoint(rng, chart.bounds, 1.5);
      const vis = chart.visibleMarks(pos, 14).filter((o) => o.distance > 1.5);
      if (vis.length < 2) return null;
      const [a, b] = rng.shuffle(vis);
      const cut = angleDist(a.bearing, b.bearing);
      if (cut < 35 || cut > 145) return null;
      const variant = rng.pick(VARIANTS);
      const aguja = variant === 'marcaciones-rv' ? null : randomCompassData(rng, { allowCt: false });
      const ct = aguja ? ctOf(aguja) : 0;
      const rv = rng.int(0, 359);
      const obs = [a, b].map((o, i) => {
        const tipo = variant === 'demoras-aguja' || (variant === 'mixta' && i === 0) ? 'da' : 'marcacion';
        const v = tipo === 'da' ? Math.round(norm360(o.bearing - ct)) % 360 : Math.round(norm180(o.bearing - rv));
        return { tipo, markId: o.mark.id, v };
      });
      return { variant, aguja, rumbo: aguja ? Math.round(raFromRv(rv, ct)) % 360 : rv, t: randomClock(rng), obs };
    });
  },

  statement(p, { chart }) {
    const rumbo = p.aguja ? `al rumbo de aguja ${fmtBearing(p.rumbo)}` : `al rumbo verdadero ${fmtBearing(p.rumbo)}`;
    const obs = p.obs.map((o) => (o.tipo === 'da'
      ? `demora de aguja al ${nm(chart, o.markId)} ${fmtBearing(o.v)}`
      : `marcación al ${nm(chart, o.markId)} ${marcText(o.v)}`)).join(' y ');
    return `A HRB = ${fmtClock(p.t)}, navegando ${rumbo}, obtenemos simultáneamente ${obs}. Calcula la situación${p.aguja ? `, sabiendo que ${compassText(p.aguja)}` : ''}.`;
  },

  answers: [
    { key: 'lat', label: 'Latitud', kind: 'lat' },
    { key: 'lon', label: 'Longitud', kind: 'lon' },
  ],

  solve(p, { chart }) {
    const ct = p.aguja ? ctOf(p.aguja) : 0;
    const rv = p.aguja ? rvFromRa(p.rumbo, ct) : p.rumbo;
    const marks = p.obs.map((o) => chart.point(o.markId));
    const dvs = p.obs.map((o) => (o.tipo === 'da' ? norm360(o.v + ct) : norm360(rv + o.v)));
    const fix = fixTwoBearings(marks[0], dvs[0], marks[1], dvs[1]);
    if (!fix) throw new Error('Las demoras no se cortan');
    const steps = [];
    if (p.aguja) {
      steps.push(...compassSteps(p.aguja));
      if (p.obs.some((o) => o.tipo === 'marcacion')) steps.push({ title: 'Rumbo verdadero', text: `Rv = Ra + Ct = ${fmtBearing(p.rumbo)} + (${fmtSignedNum(ct)}) = ${fmtBearing(rv)}` });
    }
    steps.push({
      title: 'Demoras verdaderas',
      text: p.obs.map((o, i) => (o.tipo === 'da'
        ? `Dv ${nm(chart, o.markId)} = Da + Ct = ${fmtBearing(o.v)} + (${fmtSignedNum(ct)}) = ${fmtBearing(dvs[i])}`
        : `Dv ${nm(chart, o.markId)} = Rv + M = ${fmtBearing(rv)} + (${fmtSignedNum(o.v)}) = ${fmtBearing(dvs[i])}`)).join('. ') + '.',
    });
    steps.push({ title: 'Líneas de posición', text: p.obs.map((o, i) => `desde el ${nm(chart, o.markId)} se traza ${fmtBearing(dvs[i] + 180)}`).join('; ') + ' (Dv + 180°).' });
    steps.push({ title: 'Situación', text: `El corte de ambas líneas da: ${fmtPos(fix)} (HRB ${fmtClock(p.t)}).` });
    const n = steps.length;
    return {
      results: { lat: fix.lat, lon: fix.lon },
      steps,
      drawing: {
        focus: [fix, ...marks],
        items: [
          ...marks.map((m, i) => ({ t: 'ray', from: m, bearing: norm360(dvs[i] + 180), length: rhumbTo(m, fix).distance + 1.5, label: `Dv ${fmtBearing(dvs[i])}`, style: 'lop', step: n - 1 })),
          { t: 'pos', at: fix, label: `So ${fmtClock(p.t)}`, style: 'fix', step: n },
        ],
      },
    };
  },

  mistakes: [
    { id: 'signo-ct', explain: 'Has corregido con la Ct cambiada de signo (Dv = Da + Ct, Rv = Ra + Ct).', mutate: (p) => (p.aguja ? { ...p, aguja: flipCt(p.aguja) } : p) },
    { id: 'sin-ct', explain: 'Has trazado demoras o rumbos de aguja sin corregir. En la carta solo se trazan valores verdaderos.', mutate: (p) => (p.aguja ? { ...p, aguja: noCt() } : p) },
    { id: 'banda-marcacion', explain: 'Revisa el signo de las marcaciones: estribor suma (+) y babor resta (−).', mutate: (p) => ({ ...p, obs: p.obs.map((o) => (o.tipo === 'marcacion' ? { ...o, v: -o.v } : o)) }) },
  ],
});

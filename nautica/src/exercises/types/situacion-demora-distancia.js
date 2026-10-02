import { defineExercise } from '../define.js';
import { rvFromRa } from '../../nautical/compass.js';
import { fixBearingDistance, fixBearingAndRange } from '../../nautical/positioning.js';
import { norm180, angleDist } from '../../math/angles.js';
import { ctOf, compassText, compassSteps, randomCompassData, flipCt, noCt } from '../compass-data.js';
import { fmtBearing, fmtSignedNum, fmtClock, fmtMiles, fmtPos, randomClock, retry, norm360, round, rhumbTo } from '../helpers.js';

const nm = (chart, id) => chart.point(id).name.replace(/^Faro de /, 'faro de ');
const marcText = (m) => `${String(Math.abs(m)).padStart(3, '0')}º ${m >= 0 ? 'Estribor (ER)' : 'Babor (BR)'}`;
// Variantes de examen:
//   'da-mismo'   demora de aguja y distancia al MISMO faro
//   'dv-mismo'   demora verdadera y distancia al mismo faro (sin aguja)
//   'marc-otro'  marcación a un faro y distancia (radar) a OTRO faro
const VARIANTS = ['da-mismo', 'dv-mismo', 'marc-otro'];

export default defineExercise({
  id: 'situacion-demora-distancia',
  title: 'Situación por demora (o marcación) y distancia',
  category: 'situacion',
  levels: ['PER', 'PY'],
  difficulty: 1,
  concepts: ['demora', 'marcacion', 'Ct', 'distancia', 'linea-posicion'],
  summary: 'Una demora o marcación y una distancia (radar o compás), al mismo faro o a otro.',
  method: [
    'Pasa la observación a demora verdadera: Dv = Da + Ct, o Dv = Rv + M (estribor +, babor −).',
    'Desde el faro observado traza la demora opuesta (Dv ± 180°).',
    'Mismo faro: mide la distancia sobre esa línea. Otro faro: traza con el compás un arco con centro en él y radio la distancia; el corte con la línea es la situación.',
  ],

  generate(rng, { chart }) {
    return retry(() => {
      const pos = chart.randomSeaPoint(rng, chart.bounds, 1);
      const vis = chart.visibleMarks(pos, 12).filter((o) => o.distance > 1.5);
      if (!vis.length) return null;
      const variant = rng.pick(VARIANTS);
      const o = rng.pick(vis);
      const aguja = variant === 'dv-mismo' ? null : randomCompassData(rng, { allowCt: variant === 'da-mismo' });
      const ct = aguja ? ctOf(aguja) : 0;
      const rv = rng.int(0, 359);
      const base = { variant, aguja, t: randomClock(rng), markId: o.mark.id };
      if (variant === 'da-mismo') return { ...base, ra: Math.round(norm360(rv - ct)) % 360, obs: Math.round(norm360(o.bearing - ct)) % 360, dist: round(o.distance * 2, 0) / 2 };
      if (variant === 'dv-mismo') return { ...base, obs: Math.round(o.bearing) % 360, dist: round(o.distance * 2, 0) / 2 };
      // marcación a o + distancia a otro faro r, con buen ángulo de corte
      const others = vis.filter((x) => x.mark.id !== o.mark.id && x.distance > 2 && x.distance < 10);
      if (!others.length) return null;
      const r = rng.pick(others);
      const cut = angleDist(o.bearing, r.bearing);
      if (cut < 40 || cut > 140) return null;
      const m = Math.round(norm180(o.bearing - rv));
      const dist = round(r.distance * 10, 0) / 10;
      // la solución "buena" debe ser la más próxima al faro de la marcación y única en el lado visible
      const sols = fixBearingAndRange(o.mark, norm360(rv + m), r.mark, dist);
      if (!sols.length || rhumbTo(sols[0], pos).distance > 0.5) return null;
      return { ...base, ra: Math.round(norm360(rv - ct)) % 360, obs: m, rangeId: r.mark.id, dist };
    });
  },

  statement(p, { chart }) {
    const t = `A HRB = ${fmtClock(p.t)}`;
    if (p.variant === 'dv-mismo') {
      return `${t} observamos el ${nm(chart, p.markId)} en demora verdadera ${fmtBearing(p.obs)} y a una distancia de ${fmtMiles(p.dist)}. ¿Cuál es nuestra situación?`;
    }
    if (p.variant === 'da-mismo') {
      return `${t}, navegando al rumbo de aguja ${fmtBearing(p.ra)}, tomamos demora de aguja del ${nm(chart, p.markId)} ${fmtBearing(p.obs)} y, simultáneamente, distancia radar al mismo faro de ${fmtMiles(p.dist)}. Calcula la situación sabiendo que ${compassText(p.aguja)}.`;
    }
    return `${t}, navegando al rumbo de aguja ${fmtBearing(p.ra)}, obtenemos simultáneamente marcación al ${nm(chart, p.markId)} ${marcText(p.obs)} y distancia al ${nm(chart, p.rangeId)} de ${fmtMiles(p.dist)}. Calcula la situación sabiendo que ${compassText(p.aguja)}.`;
  },

  answers: [
    { key: 'lat', label: 'Latitud', kind: 'lat' },
    { key: 'lon', label: 'Longitud', kind: 'lon' },
  ],

  solve(p, { chart }) {
    const m = chart.point(p.markId);
    const steps = p.aguja ? [...compassSteps(p.aguja)] : [];
    const ct = p.aguja ? ctOf(p.aguja) : 0;
    let dv;
    if (p.variant === 'dv-mismo') {
      dv = p.obs;
      steps.push({ title: 'Demora verdadera', text: `Nos la dan directamente: Dv = ${fmtBearing(dv)}.` });
    } else if (p.variant === 'da-mismo') {
      dv = norm360(p.obs + ct);
      steps.push({ title: 'Demora verdadera', text: `Dv = Da + Ct = ${fmtBearing(p.obs)} + (${fmtSignedNum(ct)}) = ${fmtBearing(dv)}. (El rumbo solo indica qué desvío aplicar.)` });
    } else {
      const rv = rvFromRa(p.ra, ct);
      dv = norm360(rv + p.obs);
      steps.push({ title: 'Rumbo verdadero', text: `Rv = Ra + Ct = ${fmtBearing(p.ra)} + (${fmtSignedNum(ct)}) = ${fmtBearing(rv)}.` });
      steps.push({ title: 'Demora verdadera', text: `Dv = Rv + M = ${fmtBearing(rv)} + (${fmtSignedNum(p.obs)}) = ${fmtBearing(dv)}.` });
    }
    steps.push({ title: 'Línea de posición', text: `Desde el ${nm(chart, p.markId)} trazamos la opuesta: ${fmtBearing(dv + 180)}.` });
    let fix;
    const n = steps.length + 1;
    const items = [{ t: 'ray', from: m, bearing: norm360(dv + 180), length: 1, label: `Dv ${fmtBearing(dv)}`, style: 'lop', step: n - 1 }];
    if (p.variant === 'marc-otro') {
      const r = chart.point(p.rangeId);
      const sols = fixBearingAndRange(m, dv, r, p.dist);
      if (!sols.length) throw new Error('Sin corte');
      fix = sols[0];
      steps.push({ title: 'Arco de distancia y situación', text: `Con centro en el ${nm(chart, p.rangeId)} y radio ${fmtMiles(p.dist)} (escala de latitudes) cortamos la línea${sols.length > 1 ? ' (de los dos cortes, el compatible con la marcación tomada desde el mar es el más próximo al faro marcado)' : ''}: ${fmtPos(fix)}.` });
      items.push({ t: 'arc', center: r, radius: p.dist, around: rhumbTo(r, fix).bearing, span: 50, style: 'lop', step: n });
    } else {
      fix = fixBearingDistance(m, dv, p.dist);
      steps.push({ title: 'Situación', text: `Midiendo ${fmtMiles(p.dist)} sobre la línea: ${fmtPos(fix)} (HRB ${fmtClock(p.t)}).` });
      items.push({ t: 'arc', center: m, radius: p.dist, around: norm360(dv + 180), span: 30, style: 'lop', step: n });
    }
    items[0].length = rhumbTo(m, fix).distance + 1.5;
    items.push({ t: 'pos', at: fix, label: `So ${fmtClock(p.t)}`, style: 'fix', step: n });
    return { results: { lat: fix.lat, lon: fix.lon }, steps, drawing: { focus: [fix, m, ...(p.rangeId ? [chart.point(p.rangeId)] : [])], items } };
  },

  mistakes: [
    { id: 'signo-ct', explain: 'La Ct está aplicada al revés: Dv = Da + Ct, Rv = Ra + Ct (NE +, NW −).', mutate: (p) => (p.aguja ? { ...p, aguja: flipCt(p.aguja) } : p) },
    { id: 'sin-ct', explain: 'Has trazado valores de aguja sin corregir.', mutate: (p) => (p.aguja ? { ...p, aguja: noCt() } : p) },
    { id: 'demora-sin-opuesta', explain: 'Has trazado la demora desde el faro sin invertirla: desde el faro va la opuesta (Dv ± 180°).', mutate: (p) => (p.variant !== 'marc-otro' ? { ...p, obs: norm360(p.obs + 180) } : p) },
    { id: 'banda-marcacion', explain: 'Revisa el signo de la marcación: estribor suma, babor resta.', mutate: (p) => (p.variant === 'marc-otro' ? { ...p, obs: -p.obs } : p) },
  ],
});

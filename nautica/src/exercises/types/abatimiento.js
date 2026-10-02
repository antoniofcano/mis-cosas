import { defineExercise } from '../define.js';
import { correccionTotal, rvFromRa, raFromRv } from '../../nautical/compass.js';
import { windSide, abatimientoSigned, rsFromRv, rvFromRs } from '../../nautical/kinematics.js';
import { fmtBearing, fmtSignedNum, signedText, randomCompass, norm360 } from '../helpers.js';

const WINDS = [
  ['N', 0], ['NNE', 22.5], ['NE', 45], ['ENE', 67.5], ['E', 90], ['ESE', 112.5], ['SE', 135], ['SSE', 157.5],
  ['S', 180], ['SSW', 202.5], ['SW', 225], ['WSW', 247.5], ['W', 270], ['WNW', 292.5], ['NW', 315], ['NNW', 337.5],
];

export default defineExercise({
  id: 'abatimiento',
  title: 'Viento y abatimiento',
  category: 'viento',
  levels: ['PY'],
  difficulty: 2,
  concepts: ['abatimiento', 'Rs', 'Ct', 'viento'],
  summary: 'El viento nos desplaza: rumbo de superficie o rumbo a dar para compensarlo.',
  method: [
    'El viento se nombra por de dónde viene. Mira por qué banda entra.',
    'El barco abate hacia sotavento: viento por babor → Ab + (cae a estribor); viento por estribor → Ab −.',
    'Rs = Rv + Ab. Para compensar: Rv = Rs − Ab.',
  ],

  generate(rng, ctx) {
    const { dm, desvio } = randomCompass(rng, ctx.chart);
    const ct = correccionTotal(dm, desvio);
    for (;;) {
      const rv = rng.int(0, 359);
      const [windName, windFrom] = rng.pick(WINDS);
      const side = windSide(windFrom, rv);
      if (side === 'proa/popa') continue;
      const rel = Math.abs(((windFrom - rv + 540) % 360) - 180);
      if (rel < 30 || rel > 150) continue; // viento claramente por una banda
      const ab = rng.int(3, 10);
      const variant = rng.bool() ? 'rs' : 'rumbo-a-dar';
      const rs = rsFromRv(rv, abatimientoSigned(ab, side));
      return { variant, dm, desvio, ra: raFromRv(rv, ct), rsTarget: Math.round(rs), windName, windFrom, ab };
    }
  },

  statement(p) {
    if (p.variant === 'rs') {
      return `Navegamos al Ra = ${fmtBearing(p.ra)} con viento del ${p.windName} que nos produce un abatimiento de ${p.ab}°. dm = ${signedText(p.dm)}, Δ = ${fmtSignedNum(p.desvio)}. Calcula el rumbo de superficie (Rs).`;
    }
    return `Queremos hacer un rumbo de superficie Rs = ${fmtBearing(p.rsTarget)} con viento del ${p.windName} que produce ${p.ab}° de abatimiento. dm = ${signedText(p.dm)}, Δ = ${fmtSignedNum(p.desvio)}. ¿Qué rumbo verdadero y de aguja debemos dar?`;
  },

  answers(p) {
    return p.variant === 'rs'
      ? [{ key: 'rv', label: 'Rv', kind: 'bearing' }, { key: 'rs', label: 'Rs', kind: 'bearing' }]
      : [{ key: 'rv', label: 'Rv a dar', kind: 'bearing' }, { key: 'ra', label: 'Ra a dar', kind: 'bearing' }];
  },

  solve(p) {
    const ct = correccionTotal(p.dm, p.desvio);
    const ctStep = { title: 'Corrección total', text: `Ct = (${fmtSignedNum(p.dm)}) + (${fmtSignedNum(p.desvio)}) = ${fmtSignedNum(ct)}` };
    if (p.variant === 'rs') {
      const rv = rvFromRa(p.ra, ct);
      const side = windSide(p.windFrom, rv);
      const ab = abatimientoSigned(p.ab, side);
      const rs = rsFromRv(rv, ab);
      return {
        results: { rv, rs },
        steps: [
          ctStep,
          { title: 'Rumbo verdadero', text: `Rv = Ra + Ct = ${fmtBearing(p.ra)} + (${fmtSignedNum(ct)}) = ${fmtBearing(rv)}` },
          { title: 'Signo del abatimiento', text: `Viento del ${p.windName} (${fmtBearing(p.windFrom, 1)}) con proa ${fmtBearing(rv)}: entra por ${side}, así que abatimos hacia ${side === 'babor' ? 'estribor' : 'babor'} → Ab = ${fmtSignedNum(ab)}.` },
          { title: 'Rumbo de superficie', text: `Rs = Rv + Ab = ${fmtBearing(rv)} + (${fmtSignedNum(ab)}) = ${fmtBearing(rs)}` },
        ],
      };
    }
    // Rumbo a dar: el viento entra por la misma banda (aprox.) respecto a la proa que daremos.
    const side = windSide(p.windFrom, p.rsTarget);
    const ab = abatimientoSigned(p.ab, side);
    const rv = rvFromRs(p.rsTarget, ab);
    const ra = raFromRv(rv, ct);
    return {
      results: { rv, ra },
      steps: [
        { title: 'Signo del abatimiento', text: `Viento del ${p.windName} con rumbo ≈ ${fmtBearing(p.rsTarget)}: entra por ${side} → Ab = ${fmtSignedNum(ab)}.` },
        { title: 'Rumbo verdadero a dar', text: `Para compensar orzamos hacia el viento: Rv = Rs − Ab = ${fmtBearing(p.rsTarget)} − (${fmtSignedNum(ab)}) = ${fmtBearing(rv)}` },
        ctStep,
        { title: 'Rumbo de aguja', text: `Ra = Rv − Ct = ${fmtBearing(rv)} − (${fmtSignedNum(ct)}) = ${fmtBearing(ra)}` },
      ],
    };
  },

  mistakes: [
    { id: 'signo-abatimiento', explain: 'El abatimiento está aplicado hacia el lado equivocado: el barco cae a sotavento (alejándose del viento).', mutate: (p) => ({ ...p, windFrom: norm360(p.windFrom + 180), windName: p.windName }) },
    { id: 'signo-ct', explain: 'La Ct está aplicada al revés.', mutate: (p) => ({ ...p, dm: -p.dm, desvio: -p.desvio }) },
  ],
});

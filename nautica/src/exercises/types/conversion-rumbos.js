import { defineExercise } from '../define.js';
import { correccionTotal, rvFromRa, raFromRv, ctFrom, desvioFrom } from '../../nautical/compass.js';
import { fmtBearing, fmtSignedNum, randomCompass, norm360 } from '../helpers.js';
import { fmtDmExam } from '../compass-data.js';

const signedText = fmtDmExam;

const VARIANTS = ['ra-rv', 'rv-ra', 'desvio', 'demora'];

export default defineExercise({
  id: 'conversion-rumbos',
  title: 'Conversión de rumbos y corrección total',
  category: 'aguja',
  levels: ['PER', 'PY'],
  difficulty: 1,
  concepts: ['Rv', 'Ra', 'Rm', 'dm', 'desvio', 'Ct', 'demora'],
  summary: 'Pasar de rumbo de aguja a verdadero y viceversa, calcular Ct y desvío.',
  method: [
    'Escribe cada valor con su signo: E (+), W (−).',
    'Ct = dm + Δ.',
    'Rv = Ra + Ct  ·  Ra = Rv − Ct.  Las demoras igual: Dv = Da + Ct.',
    'Si el resultado sale negativo suma 360°; si pasa de 360°, réstalos.',
  ],

  generate(rng, ctx) {
    const { dm, desvio } = randomCompass(rng, ctx.chart);
    const variant = rng.pick(VARIANTS);
    const rv = rng.int(0, 359);
    // Se guardan todos los datos "del enunciado"; solve() solo calcula las incógnitas de la variante.
    const ra = raFromRv(rv, correccionTotal(dm, desvio));
    return { variant, dm, desvio, rv, ra, da: rng.int(0, 359) };
  },

  statement(p) {
    const { ra } = p;
    switch (p.variant) {
      case 'ra-rv':
        return `Navegamos al rumbo de aguja Ra = ${fmtBearing(ra)}. La declinación magnética es dm = ${signedText(p.dm)} y el desvío para ese rumbo es Δ = ${fmtSignedNum(p.desvio)}. Calcula la corrección total y el rumbo verdadero.`;
      case 'rv-ra':
        return `Queremos navegar al rumbo verdadero Rv = ${fmtBearing(p.rv)}. Con dm = ${signedText(p.dm)} y desvío Δ = ${fmtSignedNum(p.desvio)}, ¿qué Ct tenemos y qué rumbo de aguja debe gobernar el timonel?`;
      case 'desvio':
        return `Navegando al Ra = ${fmtBearing(ra)} comprobamos en la carta que el rumbo verdadero es Rv = ${fmtBearing(p.rv)}. Si dm = ${signedText(p.dm)}, calcula la corrección total y el desvío de la aguja para ese rumbo.`;
      case 'demora':
        return `Navegando al Ra = ${fmtBearing(ra)} (dm = ${signedText(p.dm)}, Δ = ${fmtSignedNum(p.desvio)}) tomamos con la aguja una demora de aguja Da = ${fmtBearing(p.da)} a un faro. Calcula la Ct y la demora verdadera.`;
      default:
        throw new Error(p.variant);
    }
  },

  answers(p) {
    const ct = { key: 'ct', label: 'Ct', kind: 'signed' };
    return {
      'ra-rv': [ct, { key: 'rv', label: 'Rv', kind: 'bearing' }],
      'rv-ra': [ct, { key: 'ra', label: 'Ra', kind: 'bearing' }],
      desvio: [ct, { key: 'desvio', label: 'Desvío Δ', kind: 'signed' }],
      demora: [ct, { key: 'dv', label: 'Dv', kind: 'bearing' }],
    }[p.variant];
  },

  solve(p) {
    const ct = correccionTotal(p.dm, p.desvio);
    const ra = p.variant === 'rv-ra' ? raFromRv(p.rv, ct) : p.ra;
    const ctStep = {
      title: 'Corrección total',
      text: `Ct = dm + Δ = (${fmtSignedNum(p.dm)}) + (${fmtSignedNum(p.desvio)}) = ${fmtSignedNum(ct)}`,
    };
    switch (p.variant) {
      case 'ra-rv':
        return {
          results: { ct, rv: rvFromRa(ra, ct) },
          steps: [ctStep, { title: 'Rumbo verdadero', text: `Rv = Ra + Ct = ${fmtBearing(ra)} + (${fmtSignedNum(ct)}) = ${fmtBearing(rvFromRa(ra, ct))}` }],
        };
      case 'rv-ra':
        return {
          results: { ct, ra },
          steps: [ctStep, { title: 'Rumbo de aguja', text: `Ra = Rv − Ct = ${fmtBearing(p.rv)} − (${fmtSignedNum(ct)}) = ${fmtBearing(ra)}` }],
        };
      case 'desvio': {
        const ct2 = ctFrom(p.rv, ra);
        const d = desvioFrom(ct2, p.dm);
        return {
          results: { ct: ct2, desvio: d },
          steps: [
            { title: 'Corrección total', text: `Ct = Rv − Ra = ${fmtBearing(p.rv)} − ${fmtBearing(ra)} = ${fmtSignedNum(ct2)}` },
            { title: 'Desvío', text: `Δ = Ct − dm = (${fmtSignedNum(ct2)}) − (${fmtSignedNum(p.dm)}) = ${fmtSignedNum(d)}` },
          ],
        };
      }
      case 'demora': {
        const dv = norm360(p.da + ct);
        return {
          results: { ct, dv },
          steps: [
            ctStep,
            { title: 'Demora verdadera', text: `La demora se corrige con la Ct del rumbo que llevamos: Dv = Da + Ct = ${fmtBearing(p.da)} + (${fmtSignedNum(ct)}) = ${fmtBearing(dv)}` },
          ],
        };
      }
      default:
        throw new Error(p.variant);
    }
  },

  mistakes: [
    {
      id: 'signo-ct',
      explain: 'Has aplicado la Ct con el signo cambiado. Rv = Ra + Ct y Ra = Rv − Ct; recuerda que E es + y W es −.',
      mutate: (p) => (p.variant === 'desvio' ? { ...p, ra: p.rv, rv: p.ra } : { ...p, dm: -p.dm, desvio: -p.desvio }),
    },
    {
      id: 'olvida-desvio',
      explain: 'Parece que has usado solo la declinación (Ct = dm). La Ct es dm + Δ: no olvides el desvío.',
      mutate: (p) => ({ ...p, desvio: 0 }),
    },
    {
      id: 'signo-dm',
      explain: 'Revisa el signo de la declinación: una dm W es negativa.',
      mutate: (p) => ({ ...p, dm: -p.dm }),
    },
  ],
});

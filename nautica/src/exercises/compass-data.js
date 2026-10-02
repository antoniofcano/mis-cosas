// Datos de aguja de un enunciado (cómo se da la corrección), en los tres formatos que usan los exámenes:
//   { modo: 'dm',    dm, desvio }                                   "dm = 4º NW, desvío = +2º (más)"
//   { modo: 'carta', dmBase, anyoBase, varAnual, anyo, desvio }    "dm de la carta 5º 20′ W 2010 (5′ E)"
//   { modo: 'ct',    ct }                                           "Ct = +10º"
// Signos: E = +, W = −. varAnual en grados/año (5′ E = +5/60).

import { fmtSignedNum } from '../math/format.js';
import { round, toDegMin } from '../math/angles.js';

/** "4º NW", "3º 40′ NE" (notación de los exámenes de Andalucía para la declinación). */
export function fmtDmExam(v) {
  const { sign, deg, min } = toDegMin(v, 0);
  if (!deg && !min) return '0º';
  return `${deg}º${min ? ` ${String(min).padStart(2, '0')}′` : ''} ${sign < 0 ? 'NW' : 'NE'}`;
}

/** "5º 20′ W" (notación de la leyenda de la carta). */
function fmtDmChart(v) {
  const { sign, deg, min } = toDegMin(v, 0);
  return `${deg}º ${String(min).padStart(2, '0')}′ ${sign < 0 ? 'W' : 'E'}`;
}

const fmtDesvio = (d) => `${fmtSignedNum(d)} (${d >= 0 ? 'más' : 'menos'})`;

export function dmOf(a) {
  if (a.modo === 'dm') return a.dm;
  if (a.modo === 'carta') return a.dmBase + a.varAnual * (a.anyo - a.anyoBase);
  return null;
}

/** Corrección total del enunciado. En modo carta la dm se redondea al grado, como piden los exámenes. */
export function ctOf(a) {
  if (a.modo === 'ct') return a.ct;
  const dm = a.modo === 'carta' ? Math.round(dmOf(a)) : a.dm;
  return dm + a.desvio;
}

export function compassText(a) {
  switch (a.modo) {
    case 'dm': return `la declinación magnética es ${fmtDmExam(a.dm)} y el desvío ${fmtDesvio(a.desvio)}`;
    case 'carta': {
      const v = Math.abs(a.varAnual * 60);
      return `la declinación magnética de la carta es ${fmtDmChart(a.dmBase)} ${a.anyoBase} (${round(v, 0)}′ ${a.varAnual >= 0 ? 'E' : 'W'}) y el desvío ${fmtDesvio(a.desvio)} (año ${a.anyo}; redondea la dm al grado)`;
    }
    case 'ct': return `la corrección total es ${fmtSignedNum(a.ct)}`;
    default: throw new Error(a.modo);
  }
}

/** Pasos de solución para obtener la Ct. */
export function compassSteps(a) {
  const ct = ctOf(a);
  if (a.modo === 'ct') return [{ title: 'Corrección total', text: `Nos la dan directamente: Ct = ${fmtSignedNum(ct)}.` }];
  const steps = [];
  let dm = a.dm;
  if (a.modo === 'carta') {
    const years = a.anyo - a.anyoBase;
    const exact = dmOf(a);
    dm = Math.round(exact);
    steps.push({
      title: 'Declinación actualizada',
      text: `Han pasado ${years} años desde ${a.anyoBase}: ${years} × ${round(Math.abs(a.varAnual * 60), 0)}′ ${a.varAnual >= 0 ? 'E' : 'W'} = ${round(Math.abs(a.varAnual * years * 60), 0)}′ ${a.varAnual >= 0 ? 'E' : 'W'}. ` +
        `dm ${a.anyo} = ${fmtDmChart(a.dmBase)} ${a.varAnual * years >= 0 ? '+' : '−'} ${round(Math.abs(a.varAnual * years * 60), 0)}′ = ${fmtDmChart(exact)} ≈ ${fmtSignedNum(dm)}.`,
    });
  }
  steps.push({ title: 'Corrección total', text: `Ct = dm + Δ = (${fmtSignedNum(dm)}) + (${fmtSignedNum(a.desvio)}) = ${fmtSignedNum(ct)}. Recuerda: E (NE) es +, W (NW) es −.` });
  return steps;
}

/** Genera unos datos de aguja al estilo de examen. */
export function randomCompassData(rng, { allowCarta = true, allowCt = true } = {}) {
  let desvio = rng.int(-9, 9);
  if (desvio === 0) desvio = rng.sign() * rng.int(2, 6);
  const r = rng.next();
  if (allowCt && r < 0.1) return { modo: 'ct', ct: rng.int(-10, 10) || 3 };
  if (allowCarta && r < 0.35) {
    const anyoBase = rng.pick([2005, 2010, 2013, 2014, 2018]);
    const dmBase = rng.sign() * (rng.int(2, 5) + rng.pick([0, 10, 20, 40, 45, 50]) / 60);
    const vMin = rng.int(5, 9);
    // la variación anual suele ir en sentido contrario a la dm (la dm "disminuye")
    const varAnual = (dmBase < 0 ? 1 : -1) * vMin / 60;
    return { modo: 'carta', dmBase, anyoBase, varAnual, anyo: rng.int(2024, 2027), desvio };
  }
  return { modo: 'dm', dm: rng.sign() * rng.int(1, 9), desvio };
}

// --- Transformaciones para el diagnóstico de errores típicos
export const flipCt = (a) => (a.modo === 'ct' ? { ...a, ct: -a.ct }
  : a.modo === 'dm' ? { ...a, dm: -a.dm, desvio: -a.desvio }
    : { ...a, dmBase: -a.dmBase, varAnual: -a.varAnual, desvio: -a.desvio });
export const noCt = () => ({ modo: 'ct', ct: 0 });
export const flipDm = (a) => (a.modo === 'dm' ? { ...a, dm: -a.dm } : a.modo === 'carta' ? { ...a, dmBase: -a.dmBase, varAnual: -a.varAnual } : a);
export const noUpdate = (a) => (a.modo === 'carta' ? { ...a, anyo: a.anyoBase } : a);

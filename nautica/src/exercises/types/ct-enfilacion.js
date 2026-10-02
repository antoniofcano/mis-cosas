import { defineExercise } from '../define.js';
import { ctFrom, desvioFrom } from '../../nautical/compass.js';
import { fmtDmExam } from '../compass-data.js';
import { fmtBearing, fmtSignedNum, retry, norm360, rhumbTo, rhumbDestination } from '../helpers.js';

const nm = (chart, id) => chart.point(id).name.replace(/^Faro de /, 'faro de ');

export default defineExercise({
  id: 'ct-enfilacion',
  title: 'Corrección total por enfilación u oposición',
  category: 'aguja',
  levels: ['PER', 'PY'],
  difficulty: 2,
  concepts: ['enfilacion', 'oposicion', 'Ct', 'desvio', 'demora'],
  summary: 'Al cruzar la enfilación u oposición de dos faros se compara la demora de aguja con la verdadera de la carta.',
  method: [
    'Une en la carta los dos faros y mide la dirección de la recta con el transportador.',
    'Enfilación (los vemos uno detrás de otro): la Dv va del faro cercano al lejano. Oposición (estamos entre ambos): la Dv al faro marcado es la de la recta desde el otro faro hacia él.',
    'Ct = Dv − Da.',
    'Si te dan la dm: Δ = Ct − dm.',
  ],

  generate(rng, { chart }) {
    const marks = chart.marks().filter((m) => m.light);
    return retry(() => {
      const [a, b] = rng.shuffle(marks).slice(0, 2);
      const { bearing, distance } = rhumbTo(a, b);
      if (distance < 3 || distance > 25) return null;
      const tipo = rng.bool(0.6) ? 'oposicion' : 'enfilacion';
      let obs;
      if (tipo === 'oposicion') {
        // barco entre a y b, en el agua
        obs = rhumbDestination(a, bearing, distance * rng.real(0.25, 0.75));
        if (!chart.isNavigable(obs, 0.5) || !chart.isClearPath(obs, a, 0) || !chart.isClearPath(obs, b, 0)) return null;
      } else {
        obs = rhumbDestination(a, norm360(bearing + 180), rng.real(1.5, 6)); // a cerca, b lejos
        if (!chart.isNavigable(obs, 0.5) || !chart.isVisible(obs, a, 20)) return null;
      }
      const marked = tipo === 'oposicion' ? rng.pick([a, b]) : b;
      const dv = rhumbTo(obs, marked).bearing;
      const ct = rng.int(-10, 10) || 4;
      const conDm = rng.bool(0.4);
      return { tipo, a: a.id, b: b.id, marcado: marked.id, da: Math.round(norm360(dv - ct)) % 360, dm: conDm ? rng.sign() * rng.int(1, 6) : null, ra: rng.int(0, 359) };
    });
  },

  statement(p, { chart }) {
    const linea = p.tipo === 'oposicion' ? 'la oposición' : 'la enfilación';
    return `Navegamos al rumbo de aguja ${fmtBearing(p.ra)}. Al cruzar ${linea} de los faros de ${nm(chart, p.a).replace('faro de ', '')} y ${nm(chart, p.b).replace('faro de ', '')}, marcamos el ${nm(chart, p.marcado)} en demora de aguja ${fmtBearing(p.da)}. ` +
      `Calcula la corrección total${p.dm != null ? ` y el desvío, sabiendo que la declinación magnética es ${fmtDmExam(p.dm)}` : ''}.`;
  },

  answers(p) {
    const r = [{ key: 'ct', label: 'Ct', kind: 'signed', tolerance: 1 }];
    if (p.dm != null) r.push({ key: 'desvio', label: 'Desvío Δ', kind: 'signed', tolerance: 1 });
    return r;
  },

  solve(p, { chart }) {
    const A = chart.point(p.a);
    const B = chart.point(p.b);
    const other = p.marcado === p.a ? B : A;
    const marked = chart.point(p.marcado);
    const dv = p.tipo === 'oposicion' ? rhumbTo(other, marked).bearing : rhumbTo(A, B).bearing;
    const ct = ctFrom(dv, p.da);
    const steps = [
      p.tipo === 'oposicion'
        ? { title: 'Demora verdadera (oposición)', text: `Estamos entre los dos faros. La visual al ${nm(chart, p.marcado)} tiene la misma dirección que la recta ${nm(chart, other.id)} → ${nm(chart, p.marcado)}: Dv = ${fmtBearing(dv, 1)}.` }
        : { title: 'Demora verdadera (enfilación)', text: `Vemos ${nm(chart, p.a)} delante de ${nm(chart, p.b)}. Uniendo ambos en la carta, del cercano al lejano: Dv = ${fmtBearing(dv, 1)}.` },
      { title: 'Corrección total', text: `Ct = Dv − Da = ${fmtBearing(dv, 1)} − ${fmtBearing(p.da)} = ${fmtSignedNum(ct, 1)}. El rumbo que llevamos no interviene (solo indica a qué desvío corresponde).` },
    ];
    const results = { ct };
    if (p.dm != null) {
      results.desvio = desvioFrom(ct, p.dm);
      steps.push({ title: 'Desvío', text: `Δ = Ct − dm = (${fmtSignedNum(ct, 1)}) − (${fmtSignedNum(p.dm)}) = ${fmtSignedNum(results.desvio, 1)}` });
    }
    return {
      results,
      steps,
      drawing: {
        focus: [A, B],
        items: [p.tipo === 'oposicion'
          ? { t: 'seg', from: A, to: B, label: `Oposición`, style: 'lop', step: 1 }
          : { t: 'line', through: A, bearing: dv, length: rhumbTo(A, B).distance * 2 + 10, label: 'Enfilación', style: 'lop', step: 1 }],
      },
    };
  },

  mistakes: [
    { id: 'resta-al-reves', explain: 'Has restado al revés: Ct = Dv − Da (verdadera menos aguja).', results: (p, ctx, ok) => ({ ct: -ok.ct, desvio: ok.desvio != null ? -ok.ct - p.dm : undefined }) },
    { id: 'sentido-recta', explain: 'Has tomado la recta en sentido contrario (180° de diferencia): la demora va desde el barco hacia el faro marcado.', results: (p, ctx, ok) => ({ ct: ((ok.ct + 360) % 360) - 180, desvio: ok.desvio != null ? ((ok.ct + 360) % 360) - 180 - p.dm : undefined }) },
    { id: 'desvio-signo-dm', explain: 'Revisa el desvío: Δ = Ct − dm, con la dm NW negativa.', results: (p, ctx, ok) => (p.dm != null ? { ct: ok.ct, desvio: ok.ct + p.dm } : null) },
  ],
});

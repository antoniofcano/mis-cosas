import { defineExercise } from '../define.js';
import { tideHeight, timeForHeight, twelfthsFraction } from '../../nautical/tides.js';
import { fmtClock } from '../helpers.js';

const PORTS = [
  { name: 'Cádiz', hb: [0.3, 1.0], hp: [2.4, 3.4] },
  { name: 'Barbate', hb: [0.3, 0.9], hp: [1.8, 2.6] },
  { name: 'Tarifa', hb: [0.3, 0.7], hp: [1.1, 1.8] },
  { name: 'Algeciras', hb: [0.1, 0.4], hp: [0.8, 1.1] },
  { name: 'Ceuta', hb: [0.1, 0.4], hp: [0.8, 1.2] },
  { name: 'Tánger', hb: [0.3, 0.8], hp: [1.8, 2.6] },
];
const m2 = (v) => `${v.toFixed(2).replace('.', ',')} m`;
const r2 = (v) => Math.round(v * 100) / 100;

export default defineExercise({
  id: 'marea-sonda',
  title: 'Mareas: altura, sonda y hora para pasar un bajo',
  category: 'mareas',
  levels: ['PY'],
  difficulty: 2,
  concepts: ['marea', 'sonda'],
  summary: 'Con la PM y BM del Anuario, calcular la sonda en un momento o la hora a la que habrá agua suficiente.',
  method: [
    'Pasa las horas del Anuario (UT) a hora legal: HRB = UT + adelanto.',
    'Duración D = tiempo entre BM y PM; amplitud A = Hp − Hb.',
    'Altura en un momento: h = Hb + A · (1 − cos(180° · t / D)) / 2, con t el tiempo desde la BM (si baja, desde la PM y al revés). A mano: regla de los doceavos (1, 2, 3, 3, 2, 1).',
    'Sonda en el momento = sonda de la carta + altura de la marea. Agua bajo la quilla = sonda − calado.',
    'Para la hora: altura necesaria = calado + resguardo − sonda de la carta; se despeja t de la fórmula.',
  ],

  generate(rng) {
    const port = rng.pick(PORTS);
    const hb = r2(rng.real(...port.hb));
    const hp = r2(rng.real(...port.hp));
    const tBm = rng.step(0, 17 * 60, 5);
    const D = rng.step(350, 395, 5);
    const subiendo = rng.bool();
    const adelanto = rng.pick([1, 2]);
    const variant = rng.pick(['altura', 'hora']);
    const sondaCarta = r2(rng.real(0.8, 3));
    const base = { port: port.name, hb, hp, tBm, D, subiendo, adelanto, variant, sondaCarta };
    if (variant === 'altura') {
      const frac = rng.real(0.1, 0.9);
      return { ...base, tPreg: Math.round((tBm + adelanto * 60 + frac * D) / 5) * 5, calado: r2(rng.real(1.2, 2.2)) };
    }
    // hora: la altura necesaria debe estar entre Hb y Hp
    for (;;) {
      const calado = r2(rng.real(1.4, 2.4));
      const resguardo = rng.pick([0.3, 0.4, 0.5]);
      const need = calado + resguardo - base.sondaCarta;
      if (need > hb + 0.1 * (hp - hb) && need < hp - 0.1 * (hp - hb)) return { ...base, calado, resguardo };
      base.sondaCarta = r2(rng.real(0.8, 3));
    }
  },

  statement(p) {
    const ext = p.subiendo
      ? `una bajamar a las ${fmtClock(p.tBm)} UT con ${m2(p.hb)} y la pleamar siguiente a las ${fmtClock(p.tBm + p.D)} UT con ${m2(p.hp)}`
      : `una pleamar a las ${fmtClock(p.tBm)} UT con ${m2(p.hp)} y la bajamar siguiente a las ${fmtClock(p.tBm + p.D)} UT con ${m2(p.hb)}`;
    const head = `Según el Anuario de Mareas, en ${p.port} hay ${ext}. La hora legal es UT + ${p.adelanto} h. `;
    if (p.variant === 'altura') {
      return head + `Calcula la altura de la marea y la sonda a HRB = ${fmtClock(p.tPreg)} en un punto con sonda en la carta de ${m2(p.sondaCarta)}, y el agua bajo la quilla si el calado es ${m2(p.calado)}.`;
    }
    return head + `Queremos pasar por un bajo de ${m2(p.sondaCarta)} de sonda en la carta con un calado de ${m2(p.calado)} y ${m2(p.resguardo)} de resguardo. ` +
      (p.subiendo ? '¿A partir de qué HRB podremos pasar?' : '¿Hasta qué HRB podremos pasar?');
  },

  answers(p) {
    return p.variant === 'altura'
      ? [{ key: 'h', label: 'Altura de marea', kind: 'meters' }, { key: 'sonda', label: 'Sonda', kind: 'meters' }, { key: 'quilla', label: 'Agua bajo la quilla', kind: 'meters' }]
      : [{ key: 'hora', label: 'HRB', kind: 'clock', tolerance: 6 }];
  },

  solve(p) {
    const a = { t: p.tBm, h: p.subiendo ? p.hb : p.hp };
    const b = { t: p.tBm + p.D, h: p.subiendo ? p.hp : p.hb };
    const A = r2(p.hp - p.hb);
    const toLegal = (t) => t + p.adelanto * 60;
    const steps = [
      { title: 'Horas legales', text: `${p.subiendo ? 'BM' : 'PM'} ${fmtClock(toLegal(a.t))} y ${p.subiendo ? 'PM' : 'BM'} ${fmtClock(toLegal(b.t))} (UT + ${p.adelanto} h).` },
      { title: 'Duración y amplitud', text: `D = ${Math.floor(p.D / 60)} h ${p.D % 60} min (${p.D} min). Amplitud = ${m2(p.hp)} − ${m2(p.hb)} = ${m2(A)}.` },
    ];
    if (p.variant === 'altura') {
      const tUt = p.tPreg - p.adelanto * 60;
      const h = tideHeight(a, b, tUt);
      const t = tUt - a.t;
      const fromBm = p.subiendo;
      const doc = twelfthsFraction((t / p.D) * 6);
      steps.push({
        title: 'Altura de la marea',
        text: `Desde la ${fromBm ? 'BM' : 'PM'} han pasado t = ${Math.round(t)} min. h = ${m2(a.h)} ${fromBm ? '+' : '−'} ${m2(A)} · (1 − cos(180° · ${Math.round(t)} / ${p.D})) / 2 = ${m2(h)}. ` +
          `(Con la regla de los doceavos: ${(doc * 12).toFixed(1).replace('.', ',')}/12 de la amplitud → ${m2(a.h + (fromBm ? 1 : -1) * doc * A)}.)`,
      });
      const sonda = p.sondaCarta + h;
      steps.push({ title: 'Sonda', text: `Sonda = sonda de la carta + altura = ${m2(p.sondaCarta)} + ${m2(h)} = ${m2(sonda)}.` });
      steps.push({ title: 'Agua bajo la quilla', text: `${m2(sonda)} − ${m2(p.calado)} = ${m2(sonda - p.calado)}${sonda - p.calado < 0 ? ' (¡varamos!)' : ''}.` });
      return { results: { h, sonda, quilla: sonda - p.calado }, steps };
    }
    const need = p.calado + p.resguardo - p.sondaCarta;
    const tUt = timeForHeight(a, b, need);
    steps.push({ title: 'Altura necesaria', text: `h = calado + resguardo − sonda de la carta = ${m2(p.calado)} + ${m2(p.resguardo)} − ${m2(p.sondaCarta)} = ${m2(need)}.` });
    const frac = (need - a.h) / (b.h - a.h);
    steps.push({
      title: 'Hora',
      text: `De h = ${m2(a.h)} + (${m2(b.h)} − ${m2(a.h)}) · (1 − cos θ)/2 → cos θ = 1 − 2·${frac.toFixed(3).replace('.', ',')} → θ = ${(Math.acos(1 - 2 * frac) * 180 / Math.PI).toFixed(1).replace('.', ',')}°. ` +
        `t = D · θ/180° = ${Math.round(tUt - a.t)} min desde la ${p.subiendo ? 'BM' : 'PM'}: ${fmtClock(tUt)} UT = HRB ${fmtClock(toLegal(tUt))}. ` +
        (p.subiendo ? 'A partir de esa hora la marea sigue subiendo: podemos pasar.' : 'Después la marea sigue bajando: hay que pasar antes.'),
    });
    return { results: { hora: toLegal(tUt) }, steps };
  },

  mistakes: [
    { id: 'sin-adelanto', explain: 'Has olvidado pasar las horas del Anuario (UT) a hora legal, o lo has hecho al revés.', mutate: (p) => ({ ...p, adelanto: 0 }) },
    { id: 'lineal', explain: 'Has interpolado linealmente. La marea no sube a ritmo constante: usa la fórmula del coseno o la regla de los doceavos.', results: (p, ctx, ok) => {
      if (p.variant !== 'altura') return null;
      const a = p.subiendo ? p.hb : p.hp;
      const b = p.subiendo ? p.hp : p.hb;
      const t = p.tPreg - p.adelanto * 60 - p.tBm;
      const h = a + (b - a) * (t / p.D);
      return { h, sonda: p.sondaCarta + h, quilla: p.sondaCarta + h - p.calado };
    } },
  ],
});

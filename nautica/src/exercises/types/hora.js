import { defineExercise } from '../define.js';
import { husoDe, horaLegal, horaCivilLugar, horaOficial, tuDesdeOficial } from '../../nautical/hora.js';
import { fmtClock } from '../helpers.js';

const coma = (n, d = 1) => (+n).toFixed(d).replace('.', ',');
const lonTxt = (L) => { const a = Math.abs(L); const g = Math.floor(a + 1e-9); const m = Math.round((a - g) * 60); return `${String(g).padStart(3, '0')}° ${String(m).padStart(2, '0')}′ ${L >= 0 ? 'E' : 'W'}`; };
const husoTxt = (h) => (h === 0 ? 'huso 0' : `huso ${Math.abs(h)} ${h > 0 ? 'E' : 'W'}`);
/** Hora con décimas de minuto, como en la lección (15:07,7). */
const hmd = (min) => { const m = ((min % 1440) + 1440) % 1440; const h = Math.floor(m / 60); const r = m - h * 60; return `${String(h).padStart(2, '0')}:${Math.abs(r - Math.round(r)) < 0.05 ? String(Math.round(r)).padStart(2, '0') : coma(r).padStart(4, '0')}`; };
const tiempo = (lon) => { const t = Math.abs(lon) * 4; return `${Math.floor(t / 60)} h ${coma(t % 60)} min`; };

const ESTACION = { invierno: 1, verano: 2 };
/** Si la cuenta pasa de medianoche, se dice: el día cambia. */
const dia = (min) => (min < 0 ? ' (del día anterior)' : min >= 1440 ? ' (del día siguiente)' : '');

export default defineExercise({
  id: 'hora',
  title: 'La hora a bordo: TU, legal, civil del lugar y oficial',
  category: 'hora',
  levels: ['PY'],
  difficulty: 2,
  concepts: [],
  summary: 'Con la longitud y la hora, calcular el huso, la hora legal, la civil del lugar o el TU a partir de la oficial.',
  method: [
    'Huso = longitud / 15, redondeado (E +, W −). Hora legal: Hz = TU + huso (al E se suma, al W se resta).',
    'Hora civil del lugar: HcL = TU + longitud en tiempo (1° = 4 min; E +, W −).',
    'Hora oficial = TU + adelanto (en la península: +1 h en invierno y +2 h en verano). TU = hora oficial − adelanto.',
  ],

  generate(rng) {
    const caso = rng.int(0, 1) ? 'lugar' : 'oficial';
    // Longitud a más de 1° del límite de un huso (sin dudas al redondear) y con minutos redondos.
    let lon;
    do { lon = (rng.int(1, 175 * 60) / 60) * (rng.int(0, 1) ? 1 : -1); } while (Math.abs((Math.abs(lon) / 15) % 1 - 0.5) < 1 / 15);
    lon = Math.round(lon * 60) / 60;
    if (caso === 'lugar') return { caso, lon, tu: rng.step(0, 23 * 60 + 55, 5) };
    const estacion = rng.int(0, 1) ? 'verano' : 'invierno';
    return { caso, lon, estacion, ho: rng.step(6 * 60, 22 * 60, 5) };
  },

  statement(p) {
    if (p.caso === 'lugar') return `Navegamos en longitud ${lonTxt(p.lon)}. Son las ${fmtClock(p.tu)} TU. Calcula la hora legal (del huso) y la hora civil del lugar.`;
    return `En la península, en ${p.estacion} (adelanto ${ESTACION[p.estacion] > 0 ? '+' : ''}${ESTACION[p.estacion]} h), la hora oficial es ${fmtClock(p.ho)}. Calcula el TU y la hora civil del lugar para un barco en longitud ${lonTxt(p.lon)}.`;
  },

  answers: (p) => (p.caso === 'lugar'
    ? [{ key: 'hz', label: 'Hora legal (Hz)', kind: 'clock', tolerance: 1 }, { key: 'hcl', label: 'Hora civil del lugar (HcL)', kind: 'clock', tolerance: 1 }]
    : [{ key: 'tu', label: 'TU', kind: 'clock', tolerance: 1 }, { key: 'hcl', label: 'Hora civil del lugar (HcL)', kind: 'clock', tolerance: 1 }]),

  solve(p) {
    const huso = husoDe(p.lon);
    const tu = p.caso === 'lugar' ? p.tu : tuDesdeOficial(p.ho, ESTACION[p.estacion]);
    const hz = horaLegal(tu, p.lon);
    const hcl = horaCivilLugar(tu, p.lon);
    const sg = p.lon >= 0 ? '+' : '−';
    const pasos = [];
    if (p.caso === 'oficial') pasos.push({ title: 'TU', text: `TU = hora oficial − adelanto = ${fmtClock(p.ho)} − ${ESTACION[p.estacion]} h = ${fmtClock(tu)}${dia(tu)}.` });
    else pasos.push({ title: 'Huso', text: `${coma(Math.abs(p.lon), 2)} / 15 = ${coma(Math.abs(p.lon) / 15, 2)} → ${husoTxt(huso)}.` },
      { title: 'Hora legal', text: `Hz = TU ${huso >= 0 ? '+' : '−'} ${Math.abs(huso)} h = ${fmtClock(tu)} ${huso >= 0 ? '+' : '−'} ${Math.abs(huso)} h = ${fmtClock(hz)}${dia(hz)}.` });
    pasos.push({ title: 'Hora civil del lugar', text: `Longitud en tiempo: ${coma(Math.abs(p.lon), 2)}° × 4 min = ${tiempo(p.lon)}. HcL = TU ${sg} ${tiempo(p.lon)} = ${hmd(hcl)}${hmd(hcl).includes(',') ? ` (≈ ${fmtClock(hcl)})` : ''}${dia(hcl)}.` });
    return { results: p.caso === 'lugar' ? { hz, hcl } : { tu, hcl }, steps: pasos };
  },

  mistakes: [
    { id: 'signo-longitud', explain: 'Has sumado donde había que restar: al E la hora va adelantada (se suma) y al W atrasada (se resta).', mutate: (p) => ({ ...p, lon: -p.lon }) },
    { id: 'adelanto', explain: 'Para pasar de hora oficial a TU se RESTA el adelanto.', results: (p, ctx, ok) => (p.caso === 'oficial' ? { ...ok, tu: p.ho + ESTACION[p.estacion] * 60 } : ok) },
  ],
});

// Dosis de 2 minutos (R-56; docs/CARTA-MOVIL.md, función 2): micro-tarjetas sobre SOLO el paso de un fallo, con
// números generados al azar (semilla), para entrenar el gesto que falla y ganar soltura con reloj.
//
// Cada tarjeta: { error, familia, enunciado, pide, modo: 'opciones'|'teclear', opciones: [{ txt, ok?, error? }],
//   correcta (texto), kind/valor/trampas (al teclear), cuenta (la cuenta buena, para enseñarla al contestar) }.
// Las trampas son EXACTAS: el valor que sale al cometer ese error con los mismos números, con las mismas fórmulas que el
// kit de resolución (src/exams/kit.js) y los motores náuticos; tests/dosis.test.js lo comprueba en cada familia.
// Toda tarjeta de la dosis de un error lleva ese error entre sus opciones falsas (o entre sus trampas al teclear).
// Las reglas que se enseñan son las del catálogo (src/exams/avisos-pasos.js, AVISOS): aquí no se inventa ninguna.
// Lógica pura (sin DOM); la pantalla está en src/ui/views/fallos.js.

import { fmtClock, fmtBearing } from '../math/format.js';
import { norm360, angleDist } from '../math/angles.js';
import { correccionTabla } from '../nautical/tides.js';
import { effectiveCourse, windSide, abatimientoSigned } from '../nautical/kinematics.js';
import { quantity } from '../analysis/quantities.js';
import { errorComun } from '../exams/taxonomia.js';

/** Tarjetas por dosis y tiempo orientativo (segundos). */
export const TARJETAS_DOSIS = 5;
export const OBJETIVO_DOSIS_S = 120;

const coma = (x, d = 2) => x.toFixed(d).replace('.', ',');
const m2 = (x) => `${coma(x)} m`;
const hm = (min) => { const r = Math.round(Math.abs(min)); return `${Math.floor(r / 60)} h ${String(r % 60).padStart(2, '0')} min`; };
/** Ángulo con signo en grados enteros como en la hoja: «3° E», «5° W», «0°». */
const ew = (g) => (g === 0 ? '0°' : `${Math.abs(g)}° ${g < 0 ? 'W' : 'E'}`);
/** Minutos de arco con signo → «2° 10′ W». */
const gm = (min) => { const a = Math.abs(Math.round(min)); const s = `${Math.floor(a / 60)}° ${String(a % 60).padStart(2, '0')}′`; return a === 0 ? '0° 00′' : `${s} ${min < 0 ? 'W' : 'E'}`; };
const NOMBRE_RUMBO = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };

/** Opciones sin repetir el texto (la primera gana) y barajadas con la semilla. */
function opciones(rng, lista) {
  const vistos = new Set();
  const unicas = lista.filter((o) => o && !vistos.has(o.txt) && vistos.add(o.txt));
  return rng.shuffle(unicas);
}

function tarjeta(base) {
  const correcta = base.opciones?.find((o) => o.ok)?.txt ?? base.correcta;
  return { modo: 'opciones', ...base, correcta };
}

// ---------------------------------------------------------------------------
// Familias

/** Hora oficial ↔ UT (adelanto-signo, sin-adelanto). `sentido`: 'a-ut' | 'a-oficial'. */
function hora(rng, { sentido = rng.pick(['a-ut', 'a-oficial']), teclear = false } = {}) {
  const a = rng.pick([1, 2]);
  const t = rng.step(0, 1435, 5);
  const est = a === 2 ? 'horario de verano (adelanto 2 h)' : 'horario de invierno (adelanto 1 h)';
  const otra = 3 - a;
  const aUt = sentido === 'a-ut';
  const bien = aUt ? t - a * 60 : t + a * 60;
  const signo = aUt ? t + a * 60 : t - a * 60;
  const sin = t;
  const otraEst = aUt ? t - otra * 60 : t + otra * 60;
  const enunciado = aUt
    ? `Tu hora oficial es las ${fmtClock(t)}, en ${est}. Para entrar en el Anuario, ¿qué hora UT es?`
    : `El Anuario da la pleamar a las ${fmtClock(t)} UT. Estás en ${est}. ¿A qué hora oficial es?`;
  const cuenta = aUt ? `UT = ${fmtClock(t)} − ${a} h = ${fmtClock(bien)}` : `Hora oficial = ${fmtClock(t)} UT + ${a} h = ${fmtClock(bien)}`;
  const base = { familia: 'hora', enunciado, pide: aUt ? 'Hora UT' : 'Hora oficial', cuenta, valores: { bien, signo, sin, otraEst } };
  if (teclear) return tarjeta({ ...base, modo: 'teclear', kind: 'clock', valor: bien, correcta: fmtClock(bien), trampas: [{ valor: signo, error: 'adelanto-signo' }, { valor: sin, error: 'sin-adelanto' }] });
  return tarjeta({ ...base, opciones: opciones(rng, [
    { txt: fmtClock(bien), ok: true }, { txt: fmtClock(signo), error: 'adelanto-signo' }, { txt: fmtClock(sin), error: 'sin-adelanto' }, { txt: fmtClock(otraEst) }]) });
}

/** Un tramo de marea (horas UT, sin cruzar la medianoche): { a, b, bm, pm, D, sube }. */
function tramo(rng, D = rng.step(350, 400, 5)) {
  const sube = rng.bool();
  const t0 = rng.step(0, 1435 - D, 5);
  const hb = rng.step(20, 100, 5) / 100;
  const hp = Math.round((hb + rng.step(100, 300, 5) / 100) * 100) / 100;
  const a = { t: t0, h: sube ? hb : hp };
  const b = { t: t0 + D, h: sube ? hp : hb };
  return { a, b, bm: sube ? a : b, pm: sube ? b : a, D, sube, A: Math.round((hp - hb) * 100) / 100 };
}
const fraseTramo = (tr) => `${tr.sube ? 'Bajamar' : 'Pleamar'} a las ${fmtClock(tr.a.t)} UT (${m2(tr.a.h)}) y ${tr.sube ? 'pleamar' : 'bajamar'} a las ${fmtClock(tr.b.t)} UT (${m2(tr.b.h)})`;

/** Intervalo desde la bajamar (pleamar-bajamar). */
function intervalo(rng) {
  for (;;) {
    const tr = tramo(rng);
    const t = rng.step(tr.a.t + 30, tr.b.t - 30, 5);
    const I = Math.abs(t - tr.bm.t);
    const desdePm = Math.abs(t - tr.pm.t);
    if (Math.abs(I - desdePm) < 30) continue;
    return tarjeta({ familia: 'intervalo', enunciado: `${fraseTramo(tr)}. ¿Cuánto vale el intervalo I para las ${fmtClock(t)} UT?`, pide: 'Intervalo I',
      cuenta: `I = tiempo entre la bajamar (${fmtClock(tr.bm.t)}) y las ${fmtClock(t)} = ${hm(I)}`, valores: { I, desdePm, D: tr.D },
      opciones: opciones(rng, [{ txt: hm(I), ok: true }, { txt: hm(desdePm), error: 'pleamar-bajamar' }, { txt: hm(tr.D) }]) });
  }
}

/** Corrección de altura C = A · sen²(90° · I / D) (lineal, pleamar-bajamar). I es un sexto exacto de D. */
function correccion(rng) {
  const D = rng.pick([360, 372, 384]);
  const k = rng.pick([1, 2, 4, 5]);
  const tr = tramo(rng, D);
  const I = (k * D) / 6;
  const t = tr.sube ? tr.bm.t + I : tr.bm.t - I;
  const C = correccionTabla(tr.A, I, D);
  const lineal = (tr.A * I) / D;
  const desdePm = correccionTabla(tr.A, D - I, D); // contando el intervalo desde la pleamar
  return tarjeta({ familia: 'correccion', enunciado: `${fraseTramo(tr)}. ¿Cuánto ha subido la marea sobre la bajamar (C) a las ${fmtClock(t)} UT?`, pide: 'Corrección C',
    cuenta: `I = ${hm(I)}, D = ${hm(D)}: C = ${coma(tr.A)} × sen²(90° × ${k}/6) = ${m2(C)}`, valores: { C, lineal, desdePm, A: tr.A, I, D },
    opciones: opciones(rng, [{ txt: m2(C), ok: true }, { txt: m2(lineal), error: 'lineal' }, { txt: m2(desdePm), error: 'pleamar-bajamar' }]) });
}

/** Sonda de la carta (sonda-carta-olvidada, sonda-carta-signo). */
function sonda(rng, { variante = rng.pick(['momento', 'necesaria']) } = {}) {
  if (variante === 'momento') {
    const sc = rng.step(50, 250, 10) / 100;
    const alt = Math.round((sc + rng.step(30, 200, 5) / 100) * 100) / 100;
    const bien = sc + alt; const olvidada = alt; const signo = alt - sc;
    return tarjeta({ familia: 'sonda', enunciado: `Sonda de la carta ${m2(sc)}. La marea tiene ahora ${m2(alt)} de altura. ¿Qué sonda hay?`, pide: 'Sonda',
      cuenta: `Sonda = ${m2(sc)} + ${m2(alt)} = ${m2(bien)}`, valores: { bien, olvidada, signo },
      opciones: opciones(rng, [{ txt: m2(bien), ok: true }, { txt: m2(olvidada), error: 'sonda-carta-olvidada' }, { txt: m2(signo), error: 'sonda-carta-signo' }]) });
  }
  const S = rng.step(200, 450, 10) / 100;
  const sc = rng.step(50, Math.round(S * 100) - 60, 10) / 100;
  const bien = S - sc; const olvidada = S; const signo = S + sc;
  return tarjeta({ familia: 'sonda', enunciado: `Necesitas ${m2(S)} de sonda para pasar un bajo con ${m2(sc)} de sonda en la carta. ¿Qué altura de marea hace falta?`, pide: 'Altura de la marea',
    cuenta: `Altura = ${m2(S)} − ${m2(sc)} = ${m2(bien)}`, valores: { bien, olvidada, signo },
    opciones: opciones(rng, [{ txt: m2(bien), ok: true }, { txt: m2(olvidada), error: 'sonda-carta-olvidada' }, { txt: m2(signo), error: 'sonda-carta-signo' }]) });
}

/** Ct = dm + Δ (signo-ct, olvida-desvio, signo-dm, signo-desvio). `foco`: el error que no puede faltar. */
function ct(rng, { foco = 'signo-ct' } = {}) {
  for (;;) {
    const dm = rng.sign() * rng.int(1, 6);
    const dz = rng.sign() * rng.int(1, 6);
    const c = dm + dz;
    const trampas = { 'signo-ct': -c, 'olvida-desvio': dm, 'signo-dm': -dm + dz, 'signo-desvio': dm - dz };
    const vals = [c, ...Object.values(trampas)];
    if (c === 0 || new Set(vals).size !== vals.length) continue;
    // La correcta, la del foco y dos más (las otras, en orden fijo para que la semilla decida solo la posición).
    const otras = Object.keys(trampas).filter((e) => e !== foco).slice(0, 2);
    return tarjeta({ familia: 'ct', enunciado: `Declinación magnética ${ew(dm)} y desvío ${ew(dz)}. ¿Cuánto vale la Ct?`, pide: 'Ct',
      cuenta: `Ct = dm + Δ = (${dm > 0 ? '+' : '−'}${Math.abs(dm)}) + (${dz > 0 ? '+' : '−'}${Math.abs(dz)}) = ${ew(c)}`, valores: { c, ...trampas },
      opciones: opciones(rng, [{ txt: ew(c), ok: true }, ...[foco, ...otras].map((e) => ({ txt: ew(trampas[e]), error: e }))]) });
  }
}

/** Aplicar la Ct (signo-ct, sin-ct): de aguja a verdadero y al revés. */
function aplicar(rng, { teclear = false } = {}) {
  const c = rng.sign() * rng.int(2, 9);
  const r = rng.int(0, 359);
  const aVerdadero = rng.bool();
  const que = rng.pick(['rumbo', 'demora']);
  const [de, a] = que === 'rumbo' ? (aVerdadero ? ['Ra', 'Rv'] : ['Rv', 'Ra']) : (aVerdadero ? ['Da', 'Dv'] : ['Dv', 'Da']);
  const bien = norm360(aVerdadero ? r + c : r - c);
  const signo = norm360(aVerdadero ? r - c : r + c);
  const enunciado = `${de} ${fmtBearing(r)} y Ct ${ew(c)}. ¿${a}?`;
  const cuenta = `${a} = ${de} ${aVerdadero ? '+' : '−'} Ct = ${fmtBearing(r)} ${aVerdadero ? '+' : '−'} (${c > 0 ? '+' : '−'}${Math.abs(c)}) = ${fmtBearing(bien)}`;
  const base = { familia: 'aplicar', enunciado, pide: a, cuenta, valores: { bien, signo, sin: r } };
  if (teclear) return tarjeta({ ...base, modo: 'teclear', kind: 'bearing', valor: bien, correcta: fmtBearing(bien), trampas: [{ valor: signo, error: 'signo-ct' }, { valor: r, error: 'sin-ct' }] });
  return tarjeta({ ...base, opciones: opciones(rng, [{ txt: fmtBearing(bien), ok: true }, { txt: fmtBearing(signo), error: 'signo-ct' }, { txt: fmtBearing(r), error: 'sin-ct' }]) });
}

/** Declinación del año (variacion-signo, dm-sin-actualizar). En minutos de arco, con signo (E +, W −). */
function variacion(rng) {
  for (;;) {
    const base = rng.sign() * (rng.int(0, 4) * 60 + rng.step(0, 50, 10));
    const year = rng.int(2005, 2018);
    const anyo = rng.pick([2026, 2027]);
    const v = rng.sign() * rng.int(4, 12);
    const n = anyo - year;
    const bien = base + n * v; const signo = base - n * v; const sinAct = base; const unAno = base + v;
    const vals = [bien, signo, sinAct, unAno].map(gm);
    if (base === 0 || new Set(vals).size !== vals.length) continue;
    return tarjeta({ familia: 'variacion', enunciado: `La carta da dm ${gm(base)} en ${year}, con variación anual ${Math.abs(v)}′ ${v < 0 ? 'W' : 'E'}. ¿Cuánto vale la dm en ${anyo}?`, pide: `dm ${anyo}`,
      cuenta: `${n} años × (${v < 0 ? '−' : '+'}${Math.abs(v)}′) = ${n * v < 0 ? '−' : '+'}${Math.abs(n * v)}′; dm = ${gm(base)} ${n * v < 0 ? '−' : '+'} ${Math.abs(n * v)}′ = ${gm(bien)}`,
      valores: { bien, signo, sinAct, unAno },
      opciones: opciones(rng, [{ txt: gm(bien), ok: true }, { txt: gm(signo), error: 'variacion-signo' }, { txt: gm(sinAct), error: 'dm-sin-actualizar' }, { txt: gm(unAno) }]) });
  }
}

/** Abatimiento (signo-abatimiento, sin-abatimiento): Rs = Rv + Ab, o Rv = Rs − Ab. */
function abatimiento(rng) {
  const r = rng.step(0, 355, 5);
  const grados = rng.int(3, 10);
  const banda = rng.pick(['babor', 'estribor']);
  const rel = rng.step(40, 140, 10);
  const viento = norm360(banda === 'estribor' ? r + rel : r - rel);
  const ab = abatimientoSigned(grados, windSide(viento, r));
  const haciaRs = rng.bool();
  const bien = norm360(haciaRs ? r + ab : r - ab);
  const signo = norm360(haciaRs ? r - ab : r + ab);
  const enunciado = haciaRs
    ? `Rv ${fmtBearing(r)}, viento del ${fmtBearing(viento)} y ${grados}° de abatimiento. ¿Qué rumbo de superficie (Rs) haces?`
    : `Quieres hacer Rs ${fmtBearing(r)} con viento del ${fmtBearing(viento)} y ${grados}° de abatimiento. ¿Qué Rv das?`;
  return tarjeta({ familia: 'abatimiento', enunciado, pide: haciaRs ? 'Rs' : 'Rv',
    cuenta: `El viento entra por ${banda}: Ab = ${ab > 0 ? '+' : '−'}${grados}°. ${haciaRs ? `Rs = Rv + Ab = ${fmtBearing(bien)}` : `Rv = Rs − Ab = ${fmtBearing(bien)}`}`, valores: { bien, signo, sin: r, ab },
    opciones: opciones(rng, [{ txt: fmtBearing(bien), ok: true }, { txt: fmtBearing(signo), error: 'signo-abatimiento' }, { txt: fmtBearing(r), error: 'sin-abatimiento' }]) });
}

/** Rumbo efectivo con corriente (corriente-invertida, sin-corriente). */
function corriente(rng) {
  for (;;) {
    const rs = rng.step(0, 355, 5);
    const vb = rng.int(5, 8);
    const rc = norm360(rs + rng.sign() * rng.step(60, 120, 10));
    const ic = rng.pick([1.5, 2, 2.5, 3]);
    const bien = Math.round(norm360(effectiveCourse(rs, vb, rc, ic).ref)) % 360;
    const inv = Math.round(norm360(effectiveCourse(rs, vb, norm360(rc + 180), ic).ref)) % 360;
    if (angleDist(bien, rs) < 5 || angleDist(inv, rs) < 5 || angleDist(bien, inv) < 5) continue;
    return tarjeta({ familia: 'corriente', enunciado: `Rs ${fmtBearing(rs)} a ${vb} nudos. Corriente: Rc ${fmtBearing(rc)}, ${coma(ic, 1)} nudos. ¿Rumbo efectivo (Ref)?`, pide: 'Ref',
      cuenta: `Vector barco ${fmtBearing(rs)}, ${vb} millas; a continuación, la corriente hacia ${fmtBearing(rc)}, ${coma(ic, 1)} millas: Ref = ${fmtBearing(bien)}`, valores: { bien, inv, sin: rs },
      opciones: opciones(rng, [{ txt: fmtBearing(bien), ok: true }, { txt: fmtBearing(inv), error: 'corriente-invertida' }, { txt: fmtBearing(rs), error: 'sin-corriente' }]) });
  }
}

/** Hacia dónde empuja la corriente (corriente-invertida). */
function sentidoCorriente(rng) {
  const rc = rng.pick([0, 45, 90, 135, 180, 225, 270, 315]);
  const lado = norm360(rc + rng.pick([90, 270]));
  return tarjeta({ familia: 'sentido-corriente', enunciado: `La corriente tiene Rc ${fmtBearing(rc)}. ¿Hacia dónde lleva al barco?`, pide: 'Hacia',
    cuenta: `El Rc dice hacia dónde va el agua: hacia el ${NOMBRE_RUMBO[rc]}`, valores: { bien: rc },
    opciones: opciones(rng, [{ txt: `Hacia el ${NOMBRE_RUMBO[rc]}`, ok: true }, { txt: `Hacia el ${NOMBRE_RUMBO[norm360(rc + 180)]}`, error: 'corriente-invertida' }, { txt: `Hacia el ${NOMBRE_RUMBO[lado]}` }]) });
}

/** Demora por marcación (banda-marcacion, marcacion-como-demora): Dv = Rv + M (estribor +, babor −). */
function marcacion(rng) {
  for (;;) {
    const rv = rng.step(0, 355, 5);
    const m = rng.step(20, 160, 5);
    const banda = rng.pick(['estribor', 'babor']);
    const s = banda === 'estribor' ? m : -m;
    const bien = norm360(rv + s); const cambiada = norm360(rv - s);
    if (bien === m || cambiada === m) continue;
    return tarjeta({ familia: 'marcacion', enunciado: `Rv ${fmtBearing(rv)}. El faro se marca a ${m}° por ${banda}. ¿Demora verdadera (Dv)?`, pide: 'Dv',
      cuenta: `Dv = Rv + M = ${fmtBearing(rv)} ${s > 0 ? '+' : '−'} ${m}° = ${fmtBearing(bien)}`, valores: { bien, cambiada, comoDemora: m },
      opciones: opciones(rng, [{ txt: fmtBearing(bien), ok: true }, { txt: fmtBearing(cambiada), error: 'banda-marcacion' }, { txt: fmtBearing(m), error: 'marcacion-como-demora' }]) });
  }
}

/** Trazar desde el faro (demora-sin-opuesta): la opuesta de la demora. */
function opuesta(rng) {
  const dv = rng.int(0, 359);
  const bien = norm360(dv + 180);
  return tarjeta({ familia: 'opuesta', enunciado: `Tomas el faro en Dv ${fmtBearing(dv)}. ¿Con qué rumbo trazas la línea desde el faro?`, pide: 'Desde el faro',
    cuenta: `Desde el faro va la opuesta: ${fmtBearing(dv)} ± 180° = ${fmtBearing(bien)}`, valores: { bien, sin: dv },
    opciones: opciones(rng, [{ txt: fmtBearing(bien), ok: true }, { txt: fmtBearing(dv), error: 'demora-sin-opuesta' }, { txt: fmtBearing(norm360(dv + 90)) }]) });
}

/** Minutos y décimas de hora (horas-decimales): d = V · t con t en horas. */
function horasDecimales(rng) {
  for (;;) {
    const h = rng.int(0, 2);
    const min = rng.pick([6, 12, 18, 24, 30, 36, 42, 48, 54]);
    const v = rng.int(4, 9);
    const bien = v * (h + min / 60);
    const mal = v * (h + min / 100);
    if (Math.abs(bien - mal) < 0.2) continue;
    const f1 = (x) => `${coma(x, 1)} millas`;
    return tarjeta({ familia: 'horas-decimales', enunciado: `Navegas ${h ? `${h} h ` : ''}${min} min a ${v} nudos. ¿Qué distancia recorres?`, pide: 'Distancia',
      cuenta: `t = ${h} + ${min}/60 = ${coma(h + min / 60, 1)} h; d = ${v} × ${coma(h + min / 60, 1)} = ${f1(bien)}`, valores: { bien, mal },
      opciones: opciones(rng, [{ txt: f1(bien), ok: true }, { txt: f1(mal), error: 'horas-decimales' }, { txt: f1(v * (h + min / 60) + v * 0.5) }]) });
  }
}

/**
 * Familias de cada error. Una lista: las tarjetas de la dosis van alternando. Las de hora mezclan opciones y teclear.
 * @type {Record<string, ((rng, i: number) => object)[]>}
 */
const FAMILIAS = {
  'adelanto-signo': [(r, i) => hora(r, { sentido: 'a-ut', teclear: i >= 3 }), (r, i) => hora(r, { sentido: 'a-oficial', teclear: i >= 3 })],
  'sin-adelanto': [(r, i) => hora(r, { sentido: 'a-oficial', teclear: i >= 3 }), (r, i) => hora(r, { sentido: 'a-ut', teclear: i >= 3 })],
  'pleamar-bajamar': [(r) => intervalo(r), (r) => correccion(r)],
  lineal: [(r) => correccion(r)],
  'sonda-carta-olvidada': [(r) => sonda(r)],
  'sonda-carta-signo': [(r) => sonda(r)],
  'signo-ct': [(r) => ct(r, { foco: 'signo-ct' }), (r, i) => aplicar(r, { teclear: i >= 3 })],
  'olvida-desvio': [(r) => ct(r, { foco: 'olvida-desvio' })],
  'signo-dm': [(r) => ct(r, { foco: 'signo-dm' })],
  'signo-desvio': [(r) => ct(r, { foco: 'signo-desvio' })],
  'sin-ct': [(r, i) => aplicar(r, { teclear: i >= 3 })],
  'variacion-signo': [(r) => variacion(r)],
  'dm-sin-actualizar': [(r) => variacion(r)],
  'signo-abatimiento': [(r) => abatimiento(r)],
  'sin-abatimiento': [(r) => abatimiento(r)],
  'corriente-invertida': [(r) => corriente(r), (r) => sentidoCorriente(r)],
  'sin-corriente': [(r) => corriente(r)],
  'banda-marcacion': [(r) => marcacion(r)],
  'marcacion-como-demora': [(r) => marcacion(r)],
  'demora-sin-opuesta': [(r) => opuesta(r)],
  'horas-decimales': [(r) => horasDecimales(r)],
};

/** Errores con micro-tarjetas. */
export const ERRORES_CON_TARJETAS = Object.keys(FAMILIAS);
export const tieneTarjetas = (error) => Object.hasOwn(FAMILIAS, error);

/**
 * La dosis de un error: TARJETAS_DOSIS tarjetas con números al azar (rng con semilla). [] si el error no tiene tarjetas.
 */
export function dosisDe(error, rng, n = TARJETAS_DOSIS) {
  const fs = FAMILIAS[error];
  if (!fs) return [];
  return Array.from({ length: n }, (_, i) => ({ ...fs[i % fs.length](rng, i), error }));
}

/**
 * Corrige una tarjeta. `resp`: índice de la opción tocada, o el texto tecleado.
 * @returns {{ ok: boolean, error: string|null, ilegible?: boolean }}  `error`: el error típico de esa respuesta, si lo es
 */
export function corregirTarjeta(t, resp) {
  if (t.modo === 'teclear') {
    const q = quantity(t.kind);
    const v = q.parse(String(resp ?? ''));
    if (!Number.isFinite(v)) return { ok: false, error: null, ilegible: true };
    if (q.error(v, t.valor) <= q.tolerance) return { ok: true, error: null };
    const tr = t.trampas.find((x) => q.error(v, x.valor) <= q.tolerance);
    return { ok: false, error: tr?.error ?? null };
  }
  const o = t.opciones[resp];
  return { ok: !!o?.ok, error: o?.ok ? null : o?.error ?? null };
}

/** Resumen de una dosis: { aciertos, total, cayo } (`cayo`: veces que la respuesta fue justo el error de la dosis). */
export function resumenDosis(respuestas, error) {
  return { aciertos: respuestas.filter((r) => r.ok).length, total: respuestas.length, cayo: respuestas.filter((r) => r.error === error).length };
}

// ---------------------------------------------------------------------------
// Sin micro-tarjetas, y para la comprobación: preguntas reales cuya trampa es ese error, o un ejercicio generado.
// Las preguntas salen SIEMPRE de lo que el alumno practica (banco.practica: nunca las reservadas para su examen final,
// docs/CUARENTENA.md) y del índice de distractores del banco (data/ejes/<eje>/<tit>/distractores.json, R-43).

const vale = (q) => q && !q.anulada && q.correcta && q.norma?.estado !== 'retirada';
const reconoce = (ex, error) => (ex.mistakes ?? []).some((m) => errorComun(m.id) === error);

/**
 * Ejercicio generado para un fallo: el de su tipo si reconoce ese error, si no otro que lo reconozca, y si no el de su
 * tipo. @param {{ id, mistakes? }[]} ejercicios  (src/exercises/registry.js, EXERCISES) @returns {string|null}
 */
export function ejercicioParaFallo(error, tipo, ejercicios) {
  return ejercicios.find((ex) => ex.id === tipo && reconoce(ex, error))?.id
    ?? ejercicios.find((ex) => reconoce(ex, error))?.id
    ?? ejercicios.find((ex) => ex.id === tipo)?.id
    ?? null;
}

/**
 * Preguntas del estudio cuya opción falsa es ese error (índice de distractores), primero las de su tipo, sin las usadas;
 * dentro de cada grupo, primero las no respondidas, después las falladas y al final las acertadas (barajadas con rng).
 * @param {{ error, tipo, indice, practica, respuestas?, usadas?: Set<string>, tipoDe?: (q) => string, rng }} o
 */
export function preguntasConTrampa({ error, tipo = null, indice, practica, respuestas = {}, usadas = new Set(), tipoDe = () => null, rng }) {
  const qs = (practica ?? []).filter((q) => vale(q) && !usadas.has(q.id) && Object.values(indice?.[q.id] ?? {}).includes(error));
  const nivel = (q) => (tipo && tipoDe(q) === tipo ? 0 : 3) + (!respuestas[q.id] ? 0 : respuestas[q.id].ok ? 2 : 1);
  return rng.shuffle(qs).sort((a, b) => nivel(a) - nivel(b));
}

/**
 * Qué problema completo sirve para comprobar un fallo, sin pistas: una pregunta real de su tipo cuya trampa es ese
 * error; si no hay, un ejercicio generado de su tipo; si no, una pregunta real de otro tipo con esa trampa; si no, un
 * ejercicio que reconozca el error. null si no hay nada (entonces no se puede comprobar en la app).
 * @returns {{ modo: 'pregunta', q } | { modo: 'ejercicio', id: string, seed: number } | null}
 */
export function elegirComprobacion({ error, tipo, indice, practica, respuestas = {}, usadas = new Set(), tipoDe = () => null, ejercicios = [], rng }) {
  const qs = preguntasConTrampa({ error, tipo, indice, practica, respuestas, usadas, tipoDe, rng });
  const seed = rng.int(1, 1e9);
  if (qs[0] && tipoDe(qs[0]) === tipo) return { modo: 'pregunta', q: qs[0] };
  const delTipo = ejercicios.find((ex) => ex.id === tipo);
  if (delTipo) return { modo: 'ejercicio', id: delTipo.id, seed };
  if (qs[0]) return { modo: 'pregunta', q: qs[0] };
  const otro = ejercicios.find((ex) => reconoce(ex, error));
  return otro ? { modo: 'ejercicio', id: otro.id, seed } : null;
}

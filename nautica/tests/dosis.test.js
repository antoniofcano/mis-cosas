// Dosis de 2 minutos (R-56): las micro-tarjetas dicen la respuesta correcta exacta y cada trampa es exactamente lo que
// sale con su error, con los mismos números y las mismas fórmulas que el kit de resolución; cada tarjeta de la dosis de
// un error lleva ese error; corregir reconoce el error de la respuesta (tocando o tecleando); y la semilla reproduce.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dosisDe, corregirTarjeta, resumenDosis, tieneTarjetas, ERRORES_CON_TARJETAS, TARJETAS_DOSIS } from '../src/course/dosis.js';
import { ERRORES } from '../src/exams/taxonomia.js';
import { AVISOS } from '../src/exams/avisos-pasos.js';
import { createRng } from '../src/math/rng.js';
import { fmtClock, fmtBearing, parseClock } from '../src/math/format.js';
import { norm360 } from '../src/math/angles.js';
import { correccionTabla } from '../src/nautical/tides.js';
import { effectiveCourse } from '../src/nautical/kinematics.js';
import { ejercicioParaFallo, preguntasConTrampa, elegirComprobacion } from '../src/course/dosis.js';
import { EXERCISES } from '../src/exercises/registry.js';
import { SOLUCIONES } from '../src/bancos/soluciones.js';
import { todosLosIndices } from '../tools/indice-errores.mjs';
import { bancosNode } from '../tools/bancos/leer.mjs';

const SEMILLAS = Array.from({ length: 60 }, (_, i) => 1000 + i * 7919);
const todas = (error) => SEMILLAS.flatMap((s) => dosisDe(error, createRng(s)));
const num = (txt) => Number(String(txt).replace(/[^\d,.-]/g, '').replace(',', '.'));
const opt = (t, pred) => t.opciones.find(pred);

test('hay micro-tarjetas para los fallos de mareas, corrección total y abatimiento/corriente', () => {
  for (const e of ['adelanto-signo', 'sin-adelanto', 'pleamar-bajamar', 'lineal', 'sonda-carta-olvidada', 'sonda-carta-signo',
    'signo-ct', 'signo-dm', 'olvida-desvio', 'variacion-signo', 'signo-abatimiento', 'corriente-invertida']) assert.ok(tieneTarjetas(e), e);
  for (const e of ERRORES_CON_TARJETAS) { assert.ok(ERRORES[e], e); assert.ok(AVISOS[e], e); }
  assert.equal(tieneTarjetas('seno-coseno'), false);
  assert.deepEqual(dosisDe('seno-coseno', createRng(1)), []);
});

test('cada dosis: 5 tarjetas, el error de la dosis siempre entre las trampas, una sola correcta y sin opciones repetidas', () => {
  for (const e of ERRORES_CON_TARJETAS) {
    for (const t of todas(e)) {
      assert.equal(t.error, e);
      if (t.modo === 'teclear') {
        assert.ok(t.trampas.some((x) => x.error === e), `${e}: trampa al teclear`);
        continue;
      }
      assert.equal(t.opciones.filter((o) => o.ok).length, 1, `${e}: una correcta`);
      assert.ok(t.opciones.some((o) => o.error === e), `${e}: ${t.enunciado}`);
      assert.equal(new Set(t.opciones.map((o) => o.txt)).size, t.opciones.length, `${e}: repetidas en ${t.enunciado}`);
      assert.equal(opt(t, (o) => o.ok).txt, t.correcta);
    }
    assert.equal(dosisDe(e, createRng(5)).length, TARJETAS_DOSIS);
  }
});

test('la semilla reproduce la dosis', () => {
  assert.deepEqual(dosisDe('adelanto-signo', createRng(42)), dosisDe('adelanto-signo', createRng(42)));
});

test('hora oficial ↔ UT: correcta y trampas exactas (adelanto al revés, sin adelanto)', () => {
  for (const t of [...todas('adelanto-signo'), ...todas('sin-adelanto')]) {
    const a = /adelanto (\d) h/.exec(t.enunciado)[1] * 1;
    const h0 = parseClock(/(\d\d:\d\d)/.exec(t.enunciado)[1]);
    const aUt = t.pide === 'Hora UT';
    assert.equal(a === 2, /verano/.test(t.enunciado));
    const bien = aUt ? h0 - a * 60 : h0 + a * 60;
    const signo = aUt ? h0 + a * 60 : h0 - a * 60;
    assert.equal(t.correcta, fmtClock(bien));
    if (t.modo === 'teclear') {
      assert.equal(t.trampas.find((x) => x.error === 'adelanto-signo').valor, signo);
      assert.equal(t.trampas.find((x) => x.error === 'sin-adelanto').valor, h0);
    } else {
      assert.equal(opt(t, (o) => o.error === 'adelanto-signo').txt, fmtClock(signo));
      assert.equal(opt(t, (o) => o.error === 'sin-adelanto').txt, fmtClock(h0));
    }
  }
});

test('intervalo y corrección de la marea: sen² frente a la regla de tres y al intervalo desde la pleamar', () => {
  for (const t of todas('pleamar-bajamar').concat(todas('lineal'))) {
    const v = t.valores;
    if (t.familia === 'intervalo') {
      assert.equal(v.I + v.desdePm, v.D);
      assert.notEqual(opt(t, (o) => o.ok).txt, opt(t, (o) => o.error === 'pleamar-bajamar').txt);
    } else {
      assert.equal(t.familia, 'correccion');
      assert.ok(Math.abs(v.C - correccionTabla(v.A, v.I, v.D)) < 1e-12);
      assert.ok(Math.abs(v.lineal - (v.A * v.I) / v.D) < 1e-12);
      assert.ok(Math.abs(v.desdePm - correccionTabla(v.A, v.D - v.I, v.D)) < 1e-12);
      assert.ok(Math.abs(num(t.correcta) - v.C) <= 0.005 + 1e-9);
      assert.ok(Math.abs(num(opt(t, (o) => o.error === 'lineal').txt) - v.lineal) <= 0.005 + 1e-9);
    }
  }
});

test('sonda de la carta: sonda = carta + altura; altura = sonda − carta; trampas olvidada y signo', () => {
  for (const t of todas('sonda-carta-signo')) {
    const [a, b] = [...t.enunciado.matchAll(/(\d+,\d\d) m/g)].map((m) => num(m[1]));
    const bien = /Qué sonda/.test(t.enunciado) ? a + b : a - b;
    assert.ok(Math.abs(num(t.correcta) - bien) < 0.006, t.enunciado);
    const olv = num(opt(t, (o) => o.error === 'sonda-carta-olvidada').txt);
    const sig = num(opt(t, (o) => o.error === 'sonda-carta-signo').txt);
    if (/Qué sonda/.test(t.enunciado)) { assert.ok(Math.abs(olv - b) < 0.006); assert.ok(Math.abs(sig - (b - a)) < 0.006); assert.ok(sig > 0); } else { assert.ok(Math.abs(olv - a) < 0.006); assert.ok(Math.abs(sig - (a + b)) < 0.006); }
  }
});

test('Ct = dm + Δ y aplicarla: correcta y trampas exactas', () => {
  const g = (txt) => (txt === '0°' ? 0 : num(txt) * (/W/.test(txt) ? -1 : 1));
  for (const e of ['signo-ct', 'signo-dm', 'olvida-desvio', 'signo-desvio']) {
    for (const t of todas(e).filter((x) => x.familia === 'ct')) {
      const [, dm, dz] = /dm?.*?(\d° [EW]).*?(\d° [EW])/.exec(t.enunciado.replace('Declinación magnética', 'dm'));
      const d = g(dm); const z = g(dz);
      assert.equal(g(t.correcta), d + z);
      const tr = Object.fromEntries(t.opciones.filter((o) => o.error).map((o) => [o.error, g(o.txt)]));
      if ('signo-ct' in tr) assert.equal(tr['signo-ct'], -(d + z));
      if ('olvida-desvio' in tr) assert.equal(tr['olvida-desvio'], d);
      if ('signo-dm' in tr) assert.equal(tr['signo-dm'], -d + z);
      if ('signo-desvio' in tr) assert.equal(tr['signo-desvio'], d - z);
    }
  }
  for (const t of todas('signo-ct').concat(todas('sin-ct')).filter((x) => x.familia === 'aplicar')) {
    const [, de, r, ct] = /^(Ra|Rv|Da|Dv) (\d{3})° y Ct (\d+° [EW])/.exec(t.enunciado);
    const c = g(ct);
    const aVerdadero = de === 'Ra' || de === 'Da';
    assert.equal(t.correcta, fmtBearing(norm360(Number(r) + (aVerdadero ? c : -c))));
    const signo = fmtBearing(norm360(Number(r) + (aVerdadero ? -c : c)));
    if (t.modo === 'teclear') assert.equal(fmtBearing(t.trampas.find((x) => x.error === 'signo-ct').valor), signo);
    else { assert.equal(opt(t, (o) => o.error === 'signo-ct').txt, signo); assert.equal(opt(t, (o) => o.error === 'sin-ct').txt, fmtBearing(Number(r))); }
  }
});

test('declinación del año: variación con su signo; trampas al revés y sin actualizar', () => {
  const gm = (txt) => { const m = /(\d+)° (\d\d)′(?: ([EW]))?/.exec(txt); return (Number(m[1]) * 60 + Number(m[2])) * (m[3] === 'W' ? -1 : 1); };
  for (const t of todas('variacion-signo')) {
    const [, base, y0, v, vl, y1] = /dm (.+?) en (\d{4}), con variación anual (\d+)′ ([EW])\. .* en (\d{4})\?/.exec(t.enunciado);
    const b = gm(base); const vv = Number(v) * (vl === 'W' ? -1 : 1); const n = Number(y1) - Number(y0);
    assert.equal(gm(t.correcta), b + n * vv);
    assert.equal(gm(opt(t, (o) => o.error === 'variacion-signo').txt), b - n * vv);
    assert.equal(gm(opt(t, (o) => o.error === 'dm-sin-actualizar').txt), b);
  }
});

test('abatimiento y corriente: correcta y trampas exactas con los motores náuticos', () => {
  for (const t of todas('signo-abatimiento')) {
    const v = t.valores;
    assert.equal(opt(t, (o) => o.error === 'signo-abatimiento').txt, fmtBearing(v.signo));
    assert.equal(opt(t, (o) => o.error === 'sin-abatimiento').txt, fmtBearing(v.sin));
    // El viento por babor abate a estribor (Ab +): Rs = Rv + Ab; para dar Rv, Rv = Rs − Ab.
    assert.equal(/babor/.test(t.cuenta), v.ab > 0);
    assert.equal(t.correcta, fmtBearing(t.pide === 'Rs' ? norm360(v.sin + v.ab) : norm360(v.sin - v.ab)));
  }
  for (const t of todas('corriente-invertida').filter((x) => x.familia === 'corriente')) {
    const [, rs, vb, rc, ic] = /Rs (\d{3})° a (\d) nudos\. Corriente: Rc (\d{3})°, (\d,\d) nudos/.exec(t.enunciado);
    const ref = effectiveCourse(Number(rs), Number(vb), Number(rc), num(ic)).ref;
    const inv = effectiveCourse(Number(rs), Number(vb), norm360(Number(rc) + 180), num(ic)).ref;
    assert.equal(t.correcta, fmtBearing(ref));
    assert.equal(opt(t, (o) => o.error === 'corriente-invertida').txt, fmtBearing(inv));
    assert.equal(opt(t, (o) => o.error === 'sin-corriente').txt, fmtBearing(Number(rs)));
  }
});

test('corregir: tocando, la opción del error dice su nombre; tecleando, se reconoce la trampa', () => {
  const ds = dosisDe('adelanto-signo', createRng(7));
  const t0 = ds.find((t) => t.modo === 'opciones');
  const iOk = t0.opciones.findIndex((o) => o.ok);
  const iMal = t0.opciones.findIndex((o) => o.error === 'adelanto-signo');
  assert.deepEqual(corregirTarjeta(t0, iOk), { ok: true, error: null });
  assert.deepEqual(corregirTarjeta(t0, iMal), { ok: false, error: 'adelanto-signo' });
  const tk = ds.find((t) => t.modo === 'teclear');
  assert.ok(tk, 'la dosis de hora lleva tarjetas de teclear');
  assert.equal(corregirTarjeta(tk, fmtClock(tk.valor)).ok, true);
  assert.equal(corregirTarjeta(tk, fmtClock(tk.trampas[0].valor)).error, 'adelanto-signo');
  assert.equal(corregirTarjeta(tk, 'patata').ilegible, true);
  const r = resumenDosis([{ ok: true }, { ok: false, error: 'adelanto-signo' }, { ok: true }], 'adelanto-signo');
  assert.deepEqual(r, { aciertos: 2, total: 3, cayo: 1 });
});

// ---------------------------------------------------------------------------
// Sin micro-tarjetas y comprobación: preguntas del estudio con esa trampa (nunca reservadas) o un ejercicio generado.

test('ejercicio para un fallo: el de su tipo si reconoce el error; si no, otro que lo reconozca', () => {
  assert.equal(ejercicioParaFallo('adelanto-signo', 'hora', EXERCISES), 'hora');
  assert.equal(ejercicioParaFallo('signo-ct', 'conversion-rumbos', EXERCISES), 'conversion-rumbos');
  assert.equal(ejercicioParaFallo('corriente-invertida', 'carta', EXERCISES), 'corriente-efectiva');
  assert.equal(ejercicioParaFallo('adelanto-signo', 'marea-sonda', EXERCISES), 'marea-sonda');
  assert.equal(ejercicioParaFallo('lado-del-faro', 'carta', EXERCISES), null);
});

test('comprobación y dosis con preguntas reales: solo de la práctica, con esa trampa y nunca reservadas', async () => {
  const B = bancosNode();
  const indices = await todosLosIndices();
  const x = indices.find((i) => i.tit === 'py' && i.eje === 'andalucia');
  const banco = await B.cargarBanco(x.eje, x.tit);
  const tipoDe = (q) => SOLUCIONES[q.id]?.ejercicio ?? 'carta';
  for (const error of ['adelanto-signo', 'signo-ct', 'lineal', 'corriente-invertida']) {
    const qs = preguntasConTrampa({ error, tipo: 'marea-sonda', indice: x.indice.preguntas, practica: banco.practica, tipoDe, rng: createRng(3) });
    for (const q of qs) {
      assert.ok(!banco.reservadas.has(q.id), `${q.id} reservada`);
      assert.ok(Object.values(x.indice.preguntas[q.id]).includes(error));
    }
    const c = elegirComprobacion({ error, tipo: error === 'signo-ct' ? 'conversion-rumbos' : 'marea-sonda', indice: x.indice.preguntas, practica: banco.practica, tipoDe, ejercicios: EXERCISES, rng: createRng(9) });
    assert.ok(c, error);
    if (c.modo === 'pregunta') assert.ok(!banco.reservadas.has(c.q.id));
  }
  // Una pregunta de su tipo con esa trampa va antes que el ejercicio generado; usadas todas, el ejercicio.
  const ade = preguntasConTrampa({ error: 'adelanto-signo', tipo: 'marea-sonda', indice: x.indice.preguntas, practica: banco.practica, tipoDe, rng: createRng(1) });
  if (ade.length && tipoDe(ade[0]) === 'marea-sonda') {
    const c1 = elegirComprobacion({ error: 'adelanto-signo', tipo: 'marea-sonda', indice: x.indice.preguntas, practica: banco.practica, tipoDe, ejercicios: EXERCISES, rng: createRng(1) });
    assert.equal(c1.modo, 'pregunta');
    const usadas = new Set(ade.filter((q) => tipoDe(q) === 'marea-sonda').map((q) => q.id));
    const c2 = elegirComprobacion({ error: 'adelanto-signo', tipo: 'marea-sonda', indice: x.indice.preguntas, practica: banco.practica, usadas, tipoDe, ejercicios: EXERCISES, rng: createRng(1) });
    assert.deepEqual([c2.modo, c2.id], ['ejercicio', 'marea-sonda']);
  }
  assert.equal(elegirComprobacion({ error: 'lado-del-faro', tipo: 'carta', indice: {}, practica: [], ejercicios: EXERCISES, rng: createRng(1) }), null);
});

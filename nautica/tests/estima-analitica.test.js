// Estima analítica generada como la pone el tribunal (R-53): corriente como una fila más, cruce del meridiano 180°,
// hemisferio sur y cambio de hemisferio. Se comprueba contra un cálculo independiente (latitud media, como el curso:
// data/comun/formulas.json, estima-tramo, estima-directa y meridiano-180) y contra latitudes aumentadas (Mercator), los
// casos límite, muchas semillas sin valores absurdos, el paso a paso con el kit y los errores típicos nuevos del catálogo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ex, { calcular, filasEstima, horasTotales, horasCorriente } from '../src/exercises/types/estima-analitica.js';
import { answersFor } from '../src/exercises/define.js';
import { check } from '../src/analysis/checker.js';
import { quantity } from '../src/analysis/quantities.js';
import { createRng } from '../src/math/rng.js';
import { createKit } from '../src/exams/kit.js';
import { chooseOption } from '../src/exams/options.js';
import { pasosGuiados } from '../src/exams/guiado.js';
import { diagnosticarPaso, AVISOS } from '../src/exams/avisos-pasos.js';
import { ERRORES, VARIANTES, errorComun } from '../src/exams/taxonomia.js';
import { corregirPapel } from '../src/exams/papel.js';
import { guiadoDeEjercicio, resolverEstima, CARTA_NUMEROS, VARIANTES_OPCIONES } from '../src/exams/ejercicios.js';
import { idFallo, falloValido, falloVacio, nombreFallo } from '../src/course/cuaderno.js';
import { ejercicioParaFallo } from '../src/course/dosis.js';
import { EXERCISES } from '../src/exercises/registry.js';
import { ctx } from './helpers.js';

const R = Math.PI / 180;
const cerca = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} ≠ ${b} (±${tol})`);
/** Longitud en (−180°, 180°]. */
const n180 = (x) => { const y = ((x + 180) % 360 + 360) % 360 - 180; return y === -180 ? 180 : y; };
const dLon = (a, b) => Math.abs(n180(a - b)) * 60;

/** Cálculo independiente por latitud media, como el curso (sin el código de la app). */
function independiente(p) {
  const filas = p.legs.map((l) => [l.rv, p.v * l.h]);
  if (p.corriente) {
    const total = p.legs.reduce((s, l) => s + l.h, 0);
    filas.push([p.corriente.rc, p.corriente.ihc * (total - p.corriente.desde)]);
  }
  let dl = 0; let A = 0;
  for (const [rv, d] of filas) { dl += d * Math.cos(rv * R); A += d * Math.sin(rv * R); }
  const lat = p.start.lat + dl / 60;
  const lm = (p.start.lat + lat) / 2;
  const lon = n180(p.start.lon + A / Math.cos(lm * R) / 60);
  return { lat, lon, dl, A, filas };
}

/** Latitudes aumentadas (Mercator esférica), tramo a tramo: otro método, para el orden de magnitud. */
function mercator(p) {
  const mp = (lat) => (10800 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * R) / 2));
  let { lat, lon } = p.start;
  for (const [rv, d] of independiente(p).filas) {
    const lat2 = lat + (d * Math.cos(rv * R)) / 60;
    lon += Math.abs(Math.cos(rv * R)) > 1e-9 ? ((mp(lat2) - mp(lat)) * Math.tan(rv * R)) / 60 : (d * Math.sin(rv * R)) / Math.cos(lat * R) / 60;
    lat = lat2;
  }
  return { lat, lon: n180(lon) };
}

const kitValores = (p, error = null) => resolverEstima(createKit(CARTA_NUMEROS, error ? { error } : {}), p);
const params = (o) => ({ zona: 'sur', hora: 600, v: 10, corriente: null, directo: false, ...o });

test('las resoluciones generadas cuadran con la latitud media del curso, con el kit y con Mercator', () => {
  let maxMerc = 0;
  for (let seed = 1; seed <= 600; seed++) {
    const p = ex.generate(createRng(seed), ctx);
    const sol = ex.solve(p, ctx);
    const ind = independiente(p);
    cerca(sol.results.lat, ind.lat, 1e-9, `semilla ${seed} lat`);
    assert.ok(dLon(sol.results.lon, ind.lon) < 1e-7, `semilla ${seed} lon ${sol.results.lon} ≠ ${ind.lon}`);
    // El kit (paso a paso guiado) llega a lo mismo.
    const k = kitValores(p);
    cerca(k[0].value, ind.lat, 1e-9, `semilla ${seed} kit lat`);
    assert.ok(dLon(k[1].value, ind.lon) < 1e-7, `semilla ${seed} kit lon`);
    if (p.directo) {
      cerca(k[2].value, sol.results.rd, 1e-6, `semilla ${seed} rumbo directo`);
      cerca(k[3].value, sol.results.dd, 1e-6, `semilla ${seed} distancia directa`);
      cerca(sol.results.dd, Math.hypot(ind.dl, n180(ind.lon - p.start.lon) * 60 * Math.cos(((p.start.lat + ind.lat) / 2) * R)), 1e-6);
    }
    // Latitud media frente a latitudes aumentadas: dentro de la tolerancia de examen (1′) para estas distancias.
    const m = mercator(p);
    cerca(m.lat, ind.lat, 1e-9);
    maxMerc = Math.max(maxMerc, dLon(m.lon, ind.lon));
  }
  assert.ok(maxMerc < 1, `latitud media y Mercator se separan ${maxMerc.toFixed(2)}′`);
});

test('caso límite: cruzar el meridiano 180° hacia el E y hacia el W', () => {
  // 10° N 179° 50′ E, 090° durante 2 h a 10 nudos: A = 20 millas, ΔL = 20 / cos lm (lm = 10°) = 20,31′ → 180° 10,31′ E.
  const e = params({ start: { lat: 10, lon: 179 + 50 / 60 }, legs: [{ rv: 90, h: 2 }] });
  const r = ex.solve(e).results;
  const dL = 20 / Math.cos(10 * R);
  cerca(r.lat, 10, 1e-12);
  cerca(r.lon, -(180 - (dL - 10) / 60), 1e-9, 'sale W');
  assert.ok(r.lon < 0, 'la llegada es W');
  assert.equal(calcular(e).cruza180, true);
  // Con el error típico: 360° − L, pero con la letra de la salida (E).
  cerca(calcular(e, 'antimeridiano').lon, -r.lon, 1e-12);
  cerca(kitValores(e, 'antimeridiano:letra')[1].value, -r.lon, 1e-9);
  // Hacia el W desde una longitud W, en el hemisferio S.
  const w = params({ start: { lat: -30, lon: -(179 + 40 / 60) }, legs: [{ rv: 270, h: 3 }] });
  const rw = ex.solve(w).results;
  cerca(rw.lat, -30, 1e-12);
  cerca(rw.lon, 180 - (30 / Math.cos(30 * R) - 20) / 60, 1e-9, 'sale E');
  // La inversa por el camino corto: de 179° 50′ E a la llegada W hay unos 20′, no 359°.
  const d = calcular({ ...e, directo: true });
  cerca(d.rd, 90, 1e-9); cerca(d.dd, 20, 1e-9);
  const kd = kitValores({ ...e, directo: true }, 'antimeridiano:resta');
  assert.ok(Math.abs(kd[2].value - 270) < 1e-6 && kd[3].value > 10000, 'restando tal cual sale al W y miles de millas');
});

test('caso límite: cruzar el ecuador (y la latitud media con su signo)', () => {
  // 0° 20′ N, 180° durante 3 h a 10 nudos: Δl = −30′ → 0° 10′ S; lm = 0° 05′ N.
  const p = params({ zona: 'ecuador', start: { lat: 20 / 60, lon: -25 }, legs: [{ rv: 180, h: 3 }] });
  const r = calcular(p);
  cerca(r.lat, -10 / 60, 1e-12); cerca(r.lm, 5 / 60, 1e-12);
  assert.equal(r.cruzaEcuador, true);
  // Sin el signo: 0° 20′ − 30′ «se queda» en el N con 0° 10′.
  cerca(calcular(p, 'lm-hemisferios').lat, 10 / 60, 1e-12);
  cerca(kitValores(p, 'lm-hemisferios:llegada')[0].value, 10 / 60, 1e-12);
  // Hemisferio S hacia el S: 25° S − 60′ = 26° S; sin signo sale 24° S.
  const s = params({ start: { lat: -25, lon: 100 }, legs: [{ rv: 180, h: 6 }] });
  cerca(calcular(s).lat, -26, 1e-12);
  cerca(calcular(s, 'lm-hemisferios').lat, -24, 1e-12);
  cerca(kitValores(s, 'lm-hemisferios:llegada')[0].value, -24, 1e-12);
  // La media con hemisferios distintos sumando sin signo (variante del kit): 2° N y 3° S → 2,5° en vez de −0,5°.
  const k = createKit(CARTA_NUMEROS, { error: 'lm-hemisferios:media' });
  const ok = createKit(CARTA_NUMEROS).rumboDirecto({ lat: 2, lon: 10 }, { lat: -3, lon: 13 });
  const mal = k.rumboDirecto({ lat: 2, lon: 10 }, { lat: -3, lon: 13 });
  cerca(ok.dist, Math.hypot(300, 180 * Math.cos(0.5 * R)), 1e-9);
  cerca(mal.dist, Math.hypot(300, 180 * Math.cos(2.5 * R)), 1e-9);
});

test('casos límite: rumbos 000, 090, 180 y 270', () => {
  for (const [rv, dl, A] of [[0, 30, 0], [90, 0, 30], [180, -30, 0], [270, 0, -30]]) {
    const p = params({ start: { lat: 40, lon: 5 }, legs: [{ rv, h: 3 }] });
    const r = calcular(p);
    cerca(r.dl, dl, 1e-12, `${rv} Δl`); cerca(r.ap, A, 1e-12, `${rv} A`);
    cerca(r.lat, 40 + dl / 60, 1e-12);
    cerca(r.lon, 5 + A / Math.cos(((40 + 40 + dl / 60) / 2) * R) / 60, 1e-12);
  }
});

test('la corriente es una fila más: Ihc × horas que actúa, sumada como un tramo (y al revés, restada)', () => {
  // 4 h al 090° a 6 nudos; corriente N de 2 nudos desde la 2.ª hora hasta el final: 3 h × 2 = 6 millas al N.
  const p = params({ start: { lat: 36, lon: -7 }, v: 6, legs: [{ rv: 90, h: 4 }], corriente: { rc: 0, nombre: true, ihc: 2, desde: 1 } });
  assert.equal(horasTotales(p), 4); assert.equal(horasCorriente(p), 3);
  assert.deepEqual(filasEstima(p), [{ rumbo: 90, millas: 24 }, { rumbo: 0, millas: 6, nombre: 'Corriente N' }]);
  const r = calcular(p);
  cerca(r.dl, 6, 1e-12); cerca(r.ap, 24, 1e-12);
  const mal = calcular(p, 'corriente-al-reves');
  cerca(mal.dl, -6, 1e-12); cerca(mal.ap, 24, 1e-12);
  cerca(kitValores(p, 'corriente-al-reves')[0].value, mal.lat, 1e-12);
  assert.match(ex.statement(p), /A partir de HRB = 11:00 .*Rc = N .*Ihc = 2 nudos/);
  assert.match(ex.statement({ ...p, corriente: { ...p.corriente, desde: 0 } }), /Durante toda la navegación/);
});

test('muchas semillas: datos realistas, sin NaN ni valores absurdos, y cada zona hace lo suyo', () => {
  const zonas = {}; let conCorriente = 0; const tramos = new Set(); let cardinales = 0;
  for (let seed = 1; seed <= 3000; seed++) {
    const p = ex.generate(createRng(seed), ctx);
    zonas[p.zona] = (zonas[p.zona] ?? 0) + 1;
    tramos.add(p.legs.length);
    assert.ok(p.legs.length >= 2 && p.legs.length <= 5, `${seed}: ${p.legs.length} tramos`);
    assert.ok(p.v >= 5 && p.v <= 10, `${seed}: ${p.v} nudos`);
    assert.ok(p.legs.every((l) => l.h >= 1 && l.h <= 4 && Number.isInteger(l.rv) && l.rv >= 0 && l.rv < 360), `${seed}: tramos`);
    cardinales += p.legs.filter((l) => l.rv % 90 === 0).length;
    if (p.corriente) {
      conCorriente++;
      assert.ok(p.corriente.ihc >= 1 && p.corriente.ihc <= 4 && p.corriente.desde >= 0 && p.corriente.desde < horasTotales(p), `${seed}: corriente`);
    }
    const r = calcular(p);
    for (const v of [r.lat, r.lon, r.lm, r.dL, r.dl, r.ap]) assert.ok(Number.isFinite(v), `${seed}: ${JSON.stringify(r)}`);
    assert.ok(Math.abs(p.start.lat) <= 55 && Math.abs(r.lat) < 60, `${seed}: latitud ${r.lat}`);
    assert.ok(Math.abs(r.lon) <= 180, `${seed}: longitud ${r.lon}`);
    const millas = filasEstima(p).reduce((s, f) => s + f.millas, 0);
    assert.ok(millas >= 5 && millas <= 260, `${seed}: ${millas} millas`);
    if (p.zona === 'antimeridiano') assert.ok(r.cruza180, `${seed}: no cruza el 180°`);
    if (p.zona === 'ecuador') assert.ok(r.cruzaEcuador, `${seed}: no cruza el ecuador`);
    if (p.zona === 'sur') assert.ok(p.start.lat < 0 && r.lat < 0, `${seed}: no es del S`);
    const txt = ex.statement(p);
    assert.doesNotMatch(txt, /undefined|NaN|null/, txt);
    for (const s of ex.solve(p).steps) assert.doesNotMatch(s.text, /undefined|NaN|null/, s.text);
    assert.deepEqual(ex.generate(createRng(seed), ctx), p, `${seed}: no es reproducible`);
  }
  assert.deepEqual(Object.keys(zonas).sort(), ['antimeridiano', 'ecuador', 'estrecho', 'sur']);
  assert.ok(Object.values(zonas).every((n) => n > 300), JSON.stringify(zonas));
  assert.deepEqual([...tramos].sort(), [2, 3, 4, 5]);
  assert.ok(conCorriente > 2000 && conCorriente < 2800, `con corriente: ${conCorriente}`);
  assert.ok(cardinales > 500, `rumbos 000/090/180/270: ${cardinales}`);
});

test('dosis y comprobación: el ejercicio pone a prueba el error del cuaderno', () => {
  for (let seed = 1; seed <= 60; seed++) {
    assert.ok(calcular(ex.generate(createRng(seed), { foco: 'antimeridiano' })).cruza180, `${seed}: 180°`);
    const p = ex.generate(createRng(seed), { foco: 'lm-hemisferios' });
    const r = calcular(p);
    assert.ok(p.start.lat < 0 || r.lat < 0, `${seed}: hemisferio S`);
    assert.ok(ex.generate(createRng(seed), { foco: 'corriente-al-reves' }).corriente, `${seed}: corriente`);
  }
  for (const e of ['antimeridiano', 'corriente-al-reves', 'lm-hemisferios']) assert.equal(ejercicioParaFallo(e, 'estima-analitica', EXERCISES), 'estima-analitica', e);
});

test('errores típicos nuevos: en la taxonomía, con aviso, variantes del kit y el mismo efecto en el ejercicio', () => {
  for (const id of ['antimeridiano', 'corriente-al-reves', 'lm-hemisferios']) {
    assert.equal(ERRORES[id].paso, 'loxodromica', id);
    assert.ok(AVISOS[id], id);
    assert.equal(errorComun(id), id);
    assert.ok(ex.mistakes.some((m) => m.id === id), `${id}: no es un error del ejercicio`);
    // El cuaderno de fallos los guarda con su formato de siempre.
    const f = { ...falloVacio(id, 'estima-analitica'), n: 1 };
    assert.ok(falloValido(f), id);
    assert.equal(idFallo(id, 'estima-analitica'), `${id}.estima-analitica`);
    assert.ok(nombreFallo(f).titulo, id);
  }
  for (const v of ['antimeridiano:letra', 'antimeridiano:resta', 'corriente-al-reves', 'lm-hemisferios:llegada', 'lm-hemisferios:media']) assert.ok(VARIANTES.includes(v), v);
  // Cada error del ejercicio calcula lo mismo que su variante del kit (situación y, si se piden, rumbo y distancia).
  const VARIANTE = { antimeridiano: 'antimeridiano:letra', 'lm-hemisferios': 'lm-hemisferios:llegada' };
  for (let seed = 1; seed <= 300; seed++) {
    const p = ex.generate(createRng(seed), ctx);
    for (const m of ex.mistakes) {
      const a = m.results(p, ctx, null);
      if (!a) continue;
      const k = kitValores(p, VARIANTE[m.id] ?? m.id);
      cerca(k[0].value, a.lat, 1e-9, `${seed} ${m.id} lat`);
      assert.ok(dLon(k[1].value, a.lon) < 1e-6, `${seed} ${m.id} lon`);
      if (p.directo) { assert.ok(Math.abs(n180(k[2].value - a.rd)) < 1e-6, `${seed} ${m.id} rd`); cerca(k[3].value, a.dd, 1e-6, `${seed} ${m.id} dd`); }
    }
  }
});

test('el diagnóstico del ejercicio reconoce los errores nuevos', () => {
  const vistos = {};
  for (let seed = 1; seed <= 400; seed++) {
    const p = ex.generate(createRng(seed), ctx);
    const sol = ex.solve(p, ctx);
    for (const id of ['antimeridiano', 'corriente-al-reves', 'lm-hemisferios']) {
      const alt = ex.mistakes.find((m) => m.id === id).results(p, ctx, sol.results);
      if (!alt) continue;
      const inputs = Object.fromEntries(answersFor(ex, p).map((a) => [a.key, quantity(a.kind).format(alt[a.key])]));
      const r = check(ex, p, sol, inputs, ctx);
      if (r.allOk) continue;
      vistos[id] ??= [0, 0];
      vistos[id][1]++;
      if (r.diagnoses.some((d) => d.id === id)) vistos[id][0]++;
    }
  }
  for (const id of ['antimeridiano', 'corriente-al-reves', 'lm-hemisferios']) {
    const [ok, n] = vistos[id] ?? [0, 0];
    assert.ok(n > 30 && ok === n, `${id}: ${ok}/${n}`);
  }
});

test('paso a paso: hoja de examen, cuatro opciones, avisos y el error con nombre en su paso', () => {
  const porError = { antimeridiano: 0, 'corriente-al-reves': 0, 'lm-hemisferios': 0 };
  for (let seed = 1; seed <= 200; seed++) {
    const p = ex.generate(createRng(seed), ctx);
    const { q, sol } = guiadoDeEjercicio(ex.id, p, seed, ex.statement(p));
    // Cuatro opciones distintas; la buena es la que elige el lector de opciones del examen.
    assert.deepEqual(Object.keys(q.opciones), ['a', 'b', 'c', 'd']);
    assert.equal(new Set(Object.values(q.opciones)).size, 4);
    const k = createKit(CARTA_NUMEROS);
    const values = sol.solve(k, q);
    assert.equal(chooseOption(q.opciones, values.slice(0, 2)).choice, q.correcta, `${seed}: ${JSON.stringify(q.opciones)}`);
    assert.deepEqual(guiadoDeEjercicio(ex.id, p, seed).q.opciones, q.opciones, 'reproducible');
    const pasos = pasosGuiados(k.steps);
    for (const s of pasos.filter((x) => x.pide)) {
      assert.ok(s.plantea && s.lineas?.length, `${seed}: «${s.title}» sin hoja`);
      const cuenta = s.lineas.join('\n');
      for (const c of s.pide.campos) assert.ok(cuenta.includes(quantity(c.kind).format(c.value)) || c.kind === 'bearing', `${seed}: «${s.title}» no llega a ${quantity(c.kind).format(c.value)}\n${cuenta}`);
      assert.doesNotMatch(cuenta, /undefined|NaN/);
    }
    const r = calcular(p);
    const errDe = (t) => pasos.find((x) => x.title === t)?.errores ?? [];
    if (r.cruza180) assert.ok(errDe('Situación de llegada').includes('antimeridiano'), `${seed}: Ojo del 180°`);
    else assert.ok(!errDe('Situación de llegada').includes('antimeridiano'), `${seed}: sin cruce no se avisa del 180°`);
    if (p.corriente) assert.ok(errDe('La corriente: Δl y apartamiento').includes('corriente-al-reves'), `${seed}: Ojo de la corriente`);
    if (p.start.lat < 0 || r.lat < 0) assert.ok(errDe('Latitud de llegada').includes('lm-hemisferios'), `${seed}: Ojo del signo`);
    else assert.deepEqual(errDe('Latitud de llegada'), []);
    // El error con nombre: lo que sale con cada variante, escrito en su paso, se reconoce (paso a paso y hoja en papel).
    for (const [id, variante, titulo] of [['antimeridiano', 'antimeridiano:letra', 'Situación de llegada'], ['corriente-al-reves', 'corriente-al-reves', 'La corriente: Δl y apartamiento'], ['lm-hemisferios', 'lm-hemisferios:llegada', 'Latitud de llegada']]) {
      const paso = pasos.find((x) => x.title === titulo && x.pide);
      if (!paso || !paso.errores.includes(id)) continue;
      const km = createKit(CARTA_NUMEROS, { error: variante });
      sol.solve(km, q);
      const campos = km.steps[paso.i].pide.campos;
      const valores = campos.map((c) => c.value);
      const igual = (cs) => cs.every((c, j) => quantity(c.kind).error(c.value, campos[j].value) <= quantity(c.kind).tolerance);
      if (igual(paso.pide.campos)) continue; // con estos datos el error no cambia el paso
      // Si otro error del paso da lo mismo (seno y coseno cambiados con la corriente al SE o al NW), no hay nombre único.
      const otro = VARIANTES.filter((v) => v.split(':')[0] !== id && paso.errores.includes(v.split(':')[0])).some((v) => {
        const ko = createKit(CARTA_NUMEROS, { error: v }); sol.solve(ko, q); return igual(ko.steps[paso.i].pide.campos);
      });
      if (otro) continue;
      assert.equal(diagnosticarPaso({ sol, q, chart: CARTA_NUMEROS, i: paso.i, errores: paso.errores, pide: paso.pide, valores }), id, `${seed}: ${id} en «${titulo}»`);
      // En la hoja: los pasos anteriores bien escritos y en este, lo que sale con el error.
      const escrito = (cs) => cs.map((c) => quantity(c.kind).format(c.value));
      const entradas = Object.fromEntries(pasos.filter((x) => x.pide && x.i < paso.i).map((x) => [x.i, escrito(x.pide.campos)]));
      const papel = corregirPapel({ sol, q, chart: CARTA_NUMEROS, entradas: { ...entradas, [paso.i]: escrito(campos) } });
      assert.equal(papel.fallo?.error, id, `${seed}: ${id} en la hoja en papel`);
      porError[id]++;
    }
  }
  for (const [id, n] of Object.entries(porError)) assert.ok(n > 10, `${id}: solo ${n} casos`);
  assert.ok(VARIANTES_OPCIONES.every((v) => VARIANTES.includes(v)));
});

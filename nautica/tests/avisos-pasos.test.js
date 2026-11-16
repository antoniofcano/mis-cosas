// Avisos «Ojo / No olvides / Así se hace» de los pasos del modo guiado (R-65): catálogo completo, errores por paso en el
// kit (sin cambiar resultados), aviso previo y diagnóstico a nivel de paso.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createKit } from '../src/exams/kit.js';
import { SOLUCIONES } from '../src/bancos/soluciones.js';
import { ERRORES, VARIANTES, tipoDe } from '../src/exams/taxonomia.js';
import { pasosGuiados } from '../src/exams/guiado.js';
import { AVISOS, IDS_AVISOS, erroresDelPaso, avisoPrevio, erroresDelTribunal, diagnosticarPaso } from '../src/exams/avisos-pasos.js';
import { chart } from './helpers.js';
import { todasLasPreguntas } from '../tools/bancos/leer.mjs';

const kitFuente = readFileSync(new URL('../src/exams/kit.js', import.meta.url), 'utf8');
const idsDelKit = [...new Set([...kitFuente.matchAll(/\bE\('([a-zA-Z-]+)(?::[a-zA-Z-]+)?'\)/g)].map((m) => m[1]))];

test('catálogo: un aviso por cada error típico de la taxonomía y por cada E(...) del kit', () => {
  assert.ok(idsDelKit.length >= 30, `solo he encontrado ${idsDelKit.length} E(...) en kit.js`);
  for (const id of idsDelKit) assert.ok(AVISOS[id], `falta el aviso de E('${id}')`);
  for (const id of Object.keys(ERRORES)) assert.ok(AVISOS[id], `falta el aviso del error ${id}`);
  for (const v of VARIANTES) assert.ok(AVISOS[tipoDe(v)], `falta el aviso de la variante ${v}`);
  for (const id of IDS_AVISOS) assert.ok(ERRORES[id], `el aviso ${id} no es un error de la taxonomía`);
});

test('catálogo: textos cortos, concretos y sin academias', () => {
  for (const [id, a] of Object.entries(AVISOS)) {
    for (const campo of ['ojo', 'no', 'asi', 'has']) {
      const t = a[campo];
      assert.ok(typeof t === 'string' && t.trim().length > 10, `${id}.${campo} vacío`);
      assert.ok(t.length <= 190, `${id}.${campo} demasiado largo (${t.length})`);
      assert.ok(!/academia|autoescuela|escuela|curso de pago|\bgratis\b|suscr/i.test(t), `${id}.${campo} habla de academias o ventas`);
      assert.ok(!/\s{2,}|\.\.|[!¡]/.test(t), `${id}.${campo} tiene espacios dobles, puntos suspensivos o exclamaciones`);
      if (campo !== 'has') assert.ok(/[.)]$/.test(t), `${id}.${campo} no acaba en punto`);
    }
    assert.ok(/^(Has|Te has|No has|Te)\b/.test(a.has), `${id}.has no es «Has …»: ${a.has}`);
    assert.ok(!a.has.endsWith('.'), `${id}.has no lleva punto final (lo pone la interfaz)`);
  }
});

test('catálogo: las reglas de signos son las del temario', () => {
  assert.match(AVISOS['signo-ct'].no, /Ct = dm \+ Δ/);
  assert.match(AVISOS['signo-ct'].no, /Rv = Ra \+ Ct/);
  assert.match(AVISOS['signo-ct'].no, /Ra = Rv − Ct/);
  assert.match(AVISOS['signo-dm'].no, /E.*\+.*W.*−/);
  assert.match(AVISOS['banda-marcacion'].no, /Dv = Rv \+ M/);
  assert.match(AVISOS['sin-adelanto'].no, /UT = hora oficial − adelanto/);
  assert.match(AVISOS['adelanto-signo'].no, /Hora oficial = UT \+ adelanto/);
  assert.match(AVISOS['sin-cos-lm'].no, /ΔL = A \/ cos lm/);
  assert.match(AVISOS['seno-coseno'].no, /Δl = d · cos R/);
  assert.match(AVISOS['pleamar-bajamar'].no, /desde la bajamar/);
  assert.match(AVISOS.lineal.no, /sen²/);
  assert.match(AVISOS['corriente-invertida'].ojo, /hacia dónde va el agua/);
});

test('kit: cada paso preguntable lleva los errores que se evalúan en él, y solo catalogados', () => {
  let pasos = 0; let conErrores = 0; let preguntas = 0;
  for (const q of todasLasPreguntas()) {
    const sol = SOLUCIONES[q.id];
    if (!sol) continue;
    const k = createKit(chart);
    try { sol.solve(k, q); } catch { continue; }
    preguntas++;
    for (const s of k.steps) {
      if (!s.pide) { assert.equal(s.errores, undefined, `${q.id}: un paso sin pregunta lleva errores`); continue; }
      pasos++;
      if (!s.errores) continue;
      conErrores++;
      assert.ok(Array.isArray(s.errores) && s.errores.length > 0, `${q.id}: errores vacío en «${s.title}»`);
      assert.equal(new Set(s.errores).size, s.errores.length, `${q.id}: errores repetidos en «${s.title}»`);
      for (const id of s.errores) assert.ok(AVISOS[id], `${q.id}: «${s.title}» → ${id} sin aviso`);
    }
  }
  assert.ok(preguntas > 500 && conErrores > pasos / 2, `${preguntas} preguntas, ${conErrores}/${pasos} pasos con errores`);
});

test('kit: los errores de un paso no cambian lo que se calcula', () => {
  const k = createKit(chart);
  const t = k.horaUT(14 * 60, 2);
  const paso = k.steps.at(-1);
  assert.equal(t, 12 * 60);
  assert.deepEqual(paso.errores, ['sin-adelanto', 'adelanto-signo']);
  assert.equal(paso.pide.campos[0].value, 12 * 60);
  // con un error típico, el kit calcula igual que antes y los pasos llevan los mismos errores
  const e = createKit(chart, { error: 'adelanto-signo' });
  assert.equal(e.horaUT(14 * 60, 2), 16 * 60);
  assert.deepEqual(e.steps.at(-1).errores, ['sin-adelanto', 'adelanto-signo']);
});

test('kit: cada paso se queda con sus errores (Ct, Rv, declinación, marea, ΔL)', () => {
  const k = createKit(chart);
  k.ct({ carta: [-3, 2005, 7], anyo: 2015, desvio: 1 });
  assert.deepEqual(k.steps[0].errores, ['dm-sin-actualizar', 'variacion-signo']);
  assert.deepEqual(k.steps[1].errores, ['signo-dm', 'signo-desvio', 'olvida-desvio', 'signo-ct']);
  const k2 = createKit(chart);
  k2.rv(100, -2);
  assert.deepEqual(k2.steps[0].errores, ['sin-ct', 'signo-ct']);
  const k3 = createKit(chart);
  const tr = k3.tramoMarea([{ hora: '04:00', altura_m: 0.5 }, { hora: '10:00', altura_m: 3.5 }, { hora: '16:00', altura_m: 0.7 }], { desde: 0 });
  assert.equal(k3.steps[0].errores, undefined, 'duración y amplitud no llevan errores');
  k3.sondaA(tr, 7 * 60, 2);
  const por = Object.fromEntries(k3.steps.slice(1).map((s) => [s.title, s.errores]));
  assert.deepEqual(por['Intervalo desde la bajamar'], ['pleamar-bajamar']);
  assert.deepEqual(por['Corrección de altura'], ['lineal']);
  assert.equal(por['Altura de la marea'], undefined);
  assert.deepEqual(por.Sonda, ['sonda-carta-olvidada', 'sonda-carta-signo']);
});

test('erroresDelPaso: filtra por paso y por título', () => {
  assert.deepEqual(erroresDelPaso(['signo-ct:valor', 'signo-ct:aplicacion', 'sin-ct'], { paso: 'aguja', title: 'Rumbo verdadero' }), ['signo-ct', 'sin-ct']);
  assert.deepEqual(erroresDelPaso(['dm-sin-actualizar', 'signo-dm'], { paso: 'declinacion', title: 'dm' }), ['dm-sin-actualizar']);
  assert.deepEqual(erroresDelPaso(['lineal', 'pleamar-bajamar'], { paso: 'marea', title: 'Intervalo desde la bajamar', text: 'sen²(90° · I / D) = C / A' }), ['lineal']);
  assert.deepEqual(erroresDelPaso(['seno-coseno', 'signo-dL', 'lm-salida'], { paso: 'loxodromica', title: 'Tramo 1: Δl y apartamiento' }), ['seno-coseno']);
  assert.deepEqual(erroresDelPaso(['seno-coseno', 'signo-dL'], { paso: 'loxodromica', title: 'Latitud de llegada' }), []);
});

test('pasosGuiados pasa los errores al paso', () => {
  const k = createKit(chart);
  k.horaUT(14 * 60, 2);
  k.note('Nota', 'x');
  const p = pasosGuiados(k.steps);
  assert.deepEqual(p[0].errores, ['sin-adelanto', 'adelanto-signo']);
  assert.deepEqual(p[1].errores, []);
});

test('avisoPrevio: el del alumno, o el del tribunal si no hay datos', () => {
  const errores = ['sin-adelanto', 'adelanto-signo'];
  const tribunal = [{ id: 'adelanto-signo', n: 20 }, { id: 'sin-adelanto', n: 30 }, { id: 'signo-ct', n: 99 }];
  assert.deepEqual(avisoPrevio(errores, { erroresAlumno: [{ id: 'adelanto-signo', n: 2 }, { id: 'sin-adelanto', n: 1 }], erroresTribunal: tribunal }), { id: 'adelanto-signo', motivo: 'tuyo' });
  assert.deepEqual(avisoPrevio(errores, { erroresAlumno: [], erroresTribunal: tribunal }), { id: 'sin-adelanto', motivo: 'tribunal' });
  assert.equal(avisoPrevio(errores, { erroresAlumno: [{ id: 'signo-ct', n: 3 }], erroresTribunal: tribunal }), null, 'con datos propios que no son de este paso, no se avisa');
  assert.equal(avisoPrevio(errores, { erroresAlumno: [], erroresTribunal: [] }), null);
  assert.equal(avisoPrevio([], { erroresAlumno: [], erroresTribunal: tribunal }), null);
});

test('erroresDelTribunal: suma los bancos (o los de una titulación)', () => {
  const d = { 'andalucia/per': [{ id: 'signo-ct', n: 5 }], 'andalucia/py': [{ id: 'signo-ct', n: 3 }, { id: 'lineal', n: 4 }], 'dgmm/per': [{ id: 'sin-ct', n: 9 }] };
  assert.deepEqual(erroresDelTribunal(d), [{ id: 'sin-ct', n: 9 }, { id: 'signo-ct', n: 8 }, { id: 'lineal', n: 4 }]);
  assert.deepEqual(erroresDelTribunal(d, 'py'), [{ id: 'signo-ct', n: 3 }, { id: 'lineal', n: 4 }].sort((a, b) => b.n - a.n));
  assert.deepEqual(erroresDelTribunal(null), []);
});

test('diagnosticarPaso: reconoce el error con nombre en un paso', () => {
  const q = { id: 'prueba' };
  // Hora oficial → UT: 14:00 con adelanto de 2 h son las 12:00 UT; sumar el adelanto da las 16:00.
  const sol = { solve: (k) => [{ kind: 'clock', value: k.horaUT(14 * 60, 2) }] };
  const k = createKit(chart);
  sol.solve(k, q);
  const p = pasosGuiados(k.steps)[0];
  const diag = (min) => diagnosticarPaso({ sol, q, chart, i: 0, errores: p.errores, pide: p.pide, valores: [min] });
  assert.equal(diag(16 * 60), 'adelanto-signo');
  assert.equal(diag(14 * 60), 'sin-adelanto');
  assert.equal(diag(12 * 60), null, 'lo correcto no es un error');
  assert.equal(diag(9 * 60 + 17), null, 'un valor que no sale de ningún error típico no se explica');
  assert.equal(diagnosticarPaso({ sol, q, chart, i: 0, errores: [], pide: p.pide, valores: [16 * 60] }), null);
  assert.equal(diagnosticarPaso({ sol, q, chart, i: 0, errores: p.errores, pide: p.pide, valores: [NaN] }), null);
  // Rv = Ra + Ct: Ra 100°, Ct −2° → 098°; con la Ct restada, 102°; sin corregir, 100°.
  const sol2 = { solve: (k2) => [{ kind: 'bearing', value: k2.rv(100, -2) }] };
  const k2 = createKit(chart);
  sol2.solve(k2, q);
  const p2 = pasosGuiados(k2.steps)[0];
  const diag2 = (g) => diagnosticarPaso({ sol: sol2, q, chart, i: 0, errores: p2.errores, pide: p2.pide, valores: [g] });
  assert.equal(diag2(102), 'signo-ct');
  assert.equal(diag2(100), 'sin-ct');
  assert.equal(diag2(98), null);
});

// Sincronización, el pliegue (src/store/sync/plegar.js) y la migración: el almacén nuevo da EXACTAMENTE el mismo
// progress.get() que el de antes (tests/fixtures/progress-antiguo.js) con las mismas llamadas; un progreso antiguo
// se convierte en una base sin cambiar nada; el pliegue es determinista y no depende del orden de llegada.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProgressStore } from '../src/store/progress.js';
import { createProgressStore as almacenAntiguo } from './fixtures/progress-antiguo.js';
import { plegar, compararOps, ORDEN_RANGOS, basesDe } from '../src/store/sync/plegar.js';
import { crearBase, separar, unirOps } from '../src/store/sync/fusion.js';
import { validarOperacion, esAjusteCompartido, MAX_OP } from '../src/store/sync/operaciones.js';
import { RANGOS } from '../src/course/travesia.js';
import { CLAVE_SYNC } from '../src/store/sync/registro.js';
import { conReloj, memoria, azar, escrituraAlAzar } from './sync-reloj.js';

const KEY = 'nautica.progress.v1';
const T0 = Date.UTC(2026, 4, 10, 8);

test('el orden de los rangos del pliegue es el de la travesía', () => {
  assert.deepEqual(ORDEN_RANGOS, RANGOS.map((r) => r.id));
});

test('equivalencia: con las mismas llamadas, el almacén nuevo da el mismo progress.get() que el antiguo (200 secuencias al azar)', async () => {
  for (let s = 1; s <= 200; s += 1) {
    await conReloj(T0, async (reloj) => {
      const r1 = azar(s);
      const r2 = azar(s);
      const memA = memoria();
      const memN = memoria();
      const viejo = almacenAntiguo(memA);
      const nuevo = createProgressStore(memN);
      const pasos = 5 + r1.int(60);
      r2.int(60);
      for (let i = 0; i < pasos; i += 1) {
        // El mismo azar y el mismo instante para los dos almacenes.
        const antes = reloj.ahora();
        escrituraAlAzar(viejo, r1, reloj);
        const despues = reloj.ahora();
        reloj.avanza(antes - despues);
        escrituraAlAzar(nuevo, r2, reloj);
      }
      assert.deepEqual(nuevo.get(), viejo.get(), `semilla ${s}: en memoria`);
      // Y al volver a abrir la app (el antiguo relee su JSON; el nuevo vuelve a plegar su registro).
      assert.deepEqual(createProgressStore(memN).get(), almacenAntiguo(memA).get(), `semilla ${s}: al recargar`);
      assert.deepEqual(JSON.parse(memN.m.get(KEY)), JSON.parse(memA.m.get(KEY)), `semilla ${s}: lo guardado en ${KEY}`);
    });
  }
});

test('migración: un progreso antiguo se convierte en una base y progress.get() no cambia', async () => {
  for (let s = 1; s <= 60; s += 1) {
    await conReloj(T0, async (reloj) => {
      const r = azar(1000 + s);
      const memA = memoria();
      const viejo = almacenAntiguo(memA);
      for (let i = 0; i < 10 + r.int(80); i += 1) escrituraAlAzar(viejo, r, reloj);
      const guardado = memA.m.get(KEY);
      // Primer arranque de la versión con sincronización sobre ese progreso.
      const mem = memoria({ [KEY]: guardado });
      reloj.avanza(3600e3);
      const p = createProgressStore(mem);
      assert.deepEqual(p.get(), almacenAntiguo(memoria({ [KEY]: guardado })).get(), `semilla ${s}`);
      const st = JSON.parse(mem.m.get(CLAVE_SYNC));
      assert.ok(st.ops.length >= 1 && st.ops.every((o) => o.k === 'b'), 'solo operaciones base');
      assert.equal(st.pend.length, st.ops.length, 'pendientes de subir');
      assert.ok(st.ops.every((o) => validarOperacion(o, reloj.ahora()) === null), 'todas válidas');
      // La parte del aparato no viaja.
      for (const o of st.ops) for (const k of Object.keys(o.p.settings ?? {})) assert.ok(esAjusteCompartido(k), k);
      assert.equal(JSON.stringify(st.ops).includes('"testEnCurso"'), false);
      // Una segunda vez no vuelve a migrar.
      const p2 = createProgressStore(mem);
      assert.equal(JSON.parse(mem.m.get(CLAVE_SYNC)).ops.length, st.ops.length);
      assert.deepEqual(p2.get(), p.get());
      // Y se sigue estudiando encima de la base como siempre.
      const a = almacenAntiguo(memoria({ [KEY]: guardado }));
      const r1 = azar(5000 + s);
      const r2 = azar(5000 + s);
      for (let i = 0; i < 20; i += 1) {
        const antes = reloj.ahora();
        escrituraAlAzar(a, r1, reloj);
        reloj.avanza(antes - reloj.ahora());
        escrituraAlAzar(p2, r2, reloj);
      }
      assert.deepEqual(p2.get(), a.get(), `semilla ${s}: después de la base`);
    });
  }
});

test('migración de progresos de versiones antiguas (sin campos nuevos) y de uno corrupto', () => {
  const casos = [
    { version: 1, exercises: {}, exams: { 'and-2024-c1-t01': { choice: 'a', ok: true, t: '2025-01-01T00:00:00Z' } }, settings: { level: 'PY', toleranceFactor: 1 }, tests: [] },
    { version: 1, exercises: { rumbo: { attempts: 3, correct: 2, streak: 1, mistakes: { signo: 1 }, last: '2025-02-01T00:00:00.000Z', history: [] } }, exams: {}, settings: { level: 'PER', toleranceFactor: 1 } },
    { version: 1, exercises: {}, exams: {}, settings: { level: 'PER', toleranceFactor: 1, letra: 'grande', minutosDia: 30 }, testEnCurso: { tit: 'per', tipo: 'real', conv: 'x', seed: null, respuestas: {}, i: 0, consumidoMs: 0, guardado: 1 } },
    { version: 1, exercises: {}, exams: {}, settings: { level: 'PER', toleranceFactor: 1 }, travesia: { v: 1, bancos: { 'and/per': { rango: 'timonel', insignias: { semana: '2026-01-01T00:00:00Z' } } } }, dias: { '2026-05-01': { min: 20, act: 3 } } },
  ];
  for (const c of casos) {
    const raw = JSON.stringify(c);
    assert.deepEqual(createProgressStore(memoria({ [KEY]: raw })).get(), almacenAntiguo(memoria({ [KEY]: raw })).get(), raw.slice(0, 80));
  }
  const corrupto = createProgressStore(memoria({ [KEY]: '{no es json' }));
  assert.deepEqual(corrupto.get(), almacenAntiguo(memoria({ [KEY]: '{no es json' })).get());
});

test('una base grande se trocea en operaciones de menos de 64 KB que se vuelven a unir igual', () => {
  const exams = {};
  for (let i = 0; i < 3000; i += 1) exams[`and-2024-c1-t${i}`] = { choice: 'a', ok: i % 3 > 0, t: new Date(T0 - i * 6e4).toISOString(), n: 1 + (i % 4), ok1: i % 2 === 0, rep: i % 5 ? null : { racha: 0, prox: '2026-05-11' } };
  const prog = { version: 1, exercises: {}, exams, settings: { level: 'PER', toleranceFactor: 1, minutosDia: 20 }, tests: Array.from({ length: 50 }, (_, i) => ({ tit: 'per', t: new Date(T0 - i * 864e5).toISOString(), aciertos: i })) };
  let n = 0;
  const ops = crearBase(separar(prog).compartido, { siguienteId: () => `aaaaaaaaaa.${(++n).toString(36)}.x`, t: T0 });
  assert.ok(ops.length > 5, `${ops.length} trozos`);
  for (const o of ops) {
    assert.ok(JSON.stringify(o).length < MAX_OP, 'cada trozo cabe');
    assert.equal(validarOperacion(o, T0), null);
  }
  const de = plegar(ops.reverse(), {});
  assert.deepEqual(de.exams, exams);
  assert.deepEqual(de.tests, prog.tests, 'las listas, en su orden');
  assert.equal(de.settings.minutosDia, 20);
});

test('pliegue determinista: el mismo conjunto de operaciones, en cualquier orden y con duplicados, da lo mismo', async () => {
  await conReloj(T0, async (reloj) => {
    const r = azar(77);
    const mem = memoria();
    const p = createProgressStore(mem);
    for (let i = 0; i < 300; i += 1) escrituraAlAzar(p, r, reloj);
    const ops = JSON.parse(mem.m.get(CLAVE_SYNC)).ops;
    const ref = JSON.stringify(plegar(ops, {}));
    for (let k = 0; k < 20; k += 1) {
      const barajadas = [...ops, ...ops.slice(0, r.int(ops.length))].map((o) => [r(), o]).sort((a, b) => a[0] - b[0]).map(([, o]) => o);
      assert.equal(JSON.stringify(plegar(barajadas, {})), ref);
    }
  });
});

test('compararOps: instante, aparato y contador numérico (no alfabético)', () => {
  const a = { t: 5, i: 'aaaa.z.x' };
  const b = { t: 5, i: 'aaaa.10.x' }; // 36 > 35
  assert.ok(compararOps(a, b) < 0);
  assert.ok(compararOps({ t: 4, i: 'zzzz.1.x' }, a) < 0);
  assert.ok(compararOps({ t: 5, i: 'aaab.1.x' }, a) > 0);
  assert.equal(unirOps([a, b], [b, a]).length, 2);
});

test('fusión de bases de dos aparatos con historial propio: n máximo, la respuesta más reciente, ok1 del más antiguo', () => {
  const opB = (dev, p, h) => ({ i: `${dev}.1.x`, k: 'b', t: T0, g: `${dev}.1.x`, c: 0, h, p });
  const a = opB('aaaaaaaaaa', {
    exams: { q1: { choice: 'a', ok: false, t: '2026-03-01T10:00:00.000Z', n: 3, ok1: false, rep: { racha: 0, prox: '2026-03-02' } } },
    exercises: { rumbo: { attempts: 10, correct: 7, streak: 2, mistakes: { signo: 3 }, last: '2026-03-01T10:00:00.000Z', history: [{ t: '2026-03-01T10:00:00.000Z', ok: true, seed: 1 }] } },
    dias: { '2026-03-01': { min: 30, act: 2 } },
    lecciones: { l1: { visto: true, caja: 1 } },
    settings: { minutosDia: 20 },
    travesia: { v: 1, bancos: { 'and/per': { rango: 'timonel', insignias: { semana: '2026-02-01' } } } },
    tests: [{ t: '2026-02-10T00:00:00.000Z', tit: 'per', aciertos: 30 }],
  }, Date.parse('2026-03-01T10:00:00Z'));
  const b = opB('bbbbbbbbbb', {
    exams: { q1: { choice: 'b', ok: true, t: '2026-04-01T10:00:00.000Z', n: 2, ok1: true, rep: null } },
    exercises: { rumbo: { attempts: 4, correct: 4, streak: 4, mistakes: { signo: 1, unidades: 2 }, last: '2026-04-01T10:00:00.000Z', history: [{ t: '2026-04-01T10:00:00.000Z', ok: true, seed: 2 }] } },
    dias: { '2026-03-01': { min: 10, act: 1 }, '2026-04-01': { min: 5, act: 1 } },
    lecciones: { l1: { visto: true, caja: 3 } },
    settings: { minutosDia: 40 },
    travesia: { v: 1, bancos: { 'and/per': { rango: 'marinero', insignias: { semana: '2026-01-15', rescate: '2026-03-03' } } } },
    tests: [{ t: '2026-02-10T00:00:00.000Z', tit: 'per', aciertos: 30 }, { t: '2026-03-20T00:00:00.000Z', tit: 'per', aciertos: 40 }],
  }, Date.parse('2026-04-01T10:00:00Z'));
  for (const ops of [[a, b], [b, a]]) {
    const p = plegar(ops, {});
    assert.deepEqual(p.exams.q1, { choice: 'b', ok: true, t: '2026-04-01T10:00:00.000Z', n: 3, ok1: false, rep: null });
    assert.equal(p.exercises.rumbo.attempts, 10);
    assert.equal(p.exercises.rumbo.correct, 7);
    assert.equal(p.exercises.rumbo.streak, 4, 'la racha, del más reciente');
    assert.deepEqual(p.exercises.rumbo.mistakes, { signo: 3, unidades: 2 });
    assert.equal(p.exercises.rumbo.history.length, 2);
    assert.deepEqual(p.dias, { '2026-03-01': { min: 40, act: 3 }, '2026-04-01': { min: 5, act: 1 } }, 'suma entre aparatos');
    assert.equal(p.lecciones.l1.caja, 3, 'la de la base con datos más recientes');
    assert.equal(p.settings.minutosDia, 40);
    assert.deepEqual(p.travesia.bancos['and/per'], { rango: 'timonel', insignias: { semana: '2026-01-15', rescate: '2026-03-03' } });
    assert.equal(p.tests.length, 2, 'tests unidos sin duplicar');
  }
  // Dos bases del mismo aparato (la migración y, p. ej., una copia recuperada): los minutos de un día, el máximo.
  const a2 = { ...a, i: 'aaaaaaaaaa.2.x', g: 'aaaaaaaaaa.2.x', h: a.h + 1, p: { dias: { '2026-03-01': { min: 25, act: 2 } } } };
  assert.deepEqual(plegar([a, a2], {}).dias['2026-03-01'], { min: 30, act: 2 });
  assert.equal(basesDe([a, a2, b]).length, 3);
});

test('reserva del examen final: entre aparatos gana el PRIMER valor, no el último', () => {
  const v = (dev, t, val) => ({ i: `${dev}.1.x`, k: 'v', t, c: 'settings', p: ['reserva_andalucia_per'], v: val });
  const m = (dev, t, val) => ({ i: `${dev}.2.x`, k: 'v', t, c: 'settings', p: ['minutosDia'], v: val });
  const ops = [v('aaaaaaaaaa', T0, 'A'), v('bbbbbbbbbb', T0 + 1, 'B'), m('aaaaaaaaaa', T0, 10), m('bbbbbbbbbb', T0 + 1, 20)];
  for (const o of [ops, [...ops].reverse()]) {
    assert.equal(plegar(o, {}).settings.reserva_andalucia_per, 'A');
    assert.equal(plegar(o, {}).settings.minutosDia, 20);
  }
});

test('ajustes: los de estudio se comparten (operación) y los del aparato no salen de él', async () => {
  await conReloj(T0, async () => {
    const mem = memoria();
    const p = createProgressStore(mem);
    p.setSetting('minutosDia', 25);
    p.setSetting('examen_per', '2026-12-01');
    p.setSetting('letra', 'grande');
    p.setSetting('sonidos', true);
    p.setSetting('ultimaCopia', 123);
    p.saveTestEnCurso({ tit: 'per', tipo: 'simulacro', seed: 1, respuestas: {}, i: 0, consumidoMs: 0 });
    const st = JSON.parse(mem.m.get(CLAVE_SYNC));
    const claves = st.ops.map((o) => o.p?.[0]);
    assert.deepEqual(claves.sort(), ['examen_per', 'minutosDia']);
    assert.deepEqual(st.local.settings, { letra: 'grande', sonidos: true, ultimaCopia: 123 });
    assert.equal(st.local.testEnCurso.tit, 'per');
    const q = createProgressStore(mem);
    assert.equal(q.settings().letra, 'grande');
    assert.equal(q.settings().minutosDia, 25);
    assert.equal(q.testEnCurso().seed, 1);
    for (const k of ['sonidos', 'vibracion', 'letra', 'voz', 'vozNombre', 'vozVelocidad', 'podcastVel', 'avisoCopiaHasta', 'ultimaCopia', 'persistente', 'capa', 'sesion_per', 'nivelEnCurso_andalucia_per', 'borradorProfe']) assert.ok(!esAjusteCompartido(k), k);
    for (const k of ['level', 'minutosDia', 'diasEstudio', 'eje', 'onboarded', 'examen_per', 'examenOrientativo_py', 'reserva_andalucia_per', 'planEsencial_per']) assert.ok(esAjusteCompartido(k), k);
  });
});

test('import suma (no sustituye) y reset deja este aparato vacío y sin código', async () => {
  await conReloj(T0, async (reloj) => {
    const mem = memoria();
    const p = createProgressStore(mem);
    p.recordExam('q1', { choice: 'a', ok: true });
    reloj.avanza(1000);
    const otro = createProgressStore(memoria());
    otro.recordExam('q2', { choice: 'b', ok: false });
    p.import(otro.export());
    assert.deepEqual(Object.keys(p.get().exams).sort(), ['q1', 'q2']);
    assert.throws(() => p.import(JSON.stringify({ version: 2 })), /Formato/);
    p.registro.ponerCodigoNuevo('HTRTFQA7GHCZ');
    p.reset();
    assert.deepEqual(p.get().exams, {});
    assert.equal(p.registro.codigo, null);
    assert.equal(p.registro.pendientes(), 0);
    assert.deepEqual(createProgressStore(mem).get().exams, {});
  });
});

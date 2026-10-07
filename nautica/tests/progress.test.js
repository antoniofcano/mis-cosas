// Almacén de progreso: campos nuevos (minutos por día, racha, examen a medias) y compatibilidad.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProgressStore } from '../src/store/progress.js';

const KEY = 'nautica.progress.v1';
const DIA = 864e5;
const AHORA = new Date(2026, 4, 10, 18, 0).getTime();

function memoria(inicial = {}) {
  const m = new Map(Object.entries(inicial));
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m };
}

test('16. logActividad acumula en el mismo día y minutosHoy lo devuelve', () => {
  const p = createProgressStore(memoria());
  assert.equal(p.minutosHoy(AHORA), 0);
  p.logActividad(8, AHORA);
  p.logActividad(10, AHORA + 3600e3);
  assert.equal(p.minutosHoy(AHORA), 18);
  assert.equal(p.get().dias[new Date(AHORA).toLocaleDateString('sv-SE')].act, 2);
  // se conservan solo los últimos 60 días
  p.logActividad(5, AHORA - 90 * DIA);
  p.logActividad(5, AHORA);
  assert.equal(Object.keys(p.get().dias).length, 1);
});

test('17. racha: hoy y ayer → 2; con un día de hueco → 1', () => {
  const p = createProgressStore(memoria());
  p.logActividad(8, AHORA - DIA);
  p.logActividad(8, AHORA);
  assert.equal(p.racha(AHORA), 2);
  const q = createProgressStore(memoria());
  q.logActividad(8, AHORA - 2 * DIA);
  q.logActividad(8, AHORA);
  assert.equal(q.racha(AHORA), 1);
  // si hoy aún no ha estudiado, cuenta desde ayer
  const r = createProgressStore(memoria());
  r.logActividad(8, AHORA - 2 * DIA);
  r.logActividad(8, AHORA - DIA);
  assert.equal(r.racha(AHORA), 2);
  assert.equal(createProgressStore(memoria()).racha(AHORA), 0);
});

test('18. un progreso antiguo carga sin error, se da por presentado y no tiene examen a medias', () => {
  const antiguo = { version: 1, exercises: {}, exams: { 'and-2024-c1-t01': { choice: 'a', ok: true, t: '2025-01-01T00:00:00Z' } }, settings: { level: 'PY', toleranceFactor: 1 }, tests: [] };
  const p = createProgressStore(memoria({ [KEY]: JSON.stringify(antiguo) }));
  assert.equal(p.testEnCurso(), null);
  assert.equal(p.settings().onboarded, true);
  assert.equal(p.settings().level, 'PY');
  assert.equal(p.minutosHoy(AHORA), 0);
  assert.equal(p.racha(AHORA), 0);
  assert.equal(p.get().exams['and-2024-c1-t01'].ok, true);
  // sin progreso previo, no
  assert.equal(createProgressStore(memoria()).settings().onboarded, undefined);
});

test('19. saveTestEnCurso guarda y con null lo borra', () => {
  const mem = memoria();
  const p = createProgressStore(mem);
  p.saveTestEnCurso({ tit: 'per', tipo: 'simulacro', conv: null, seed: 3, respuestas: { a: 'b' }, i: 2, consumidoMs: 5000 });
  assert.equal(createProgressStore(mem).testEnCurso().respuestas.a, 'b');
  p.saveTestEnCurso(null);
  assert.equal(p.testEnCurso(), null);
  assert.equal(createProgressStore(mem).testEnCurso(), null);
});

test('eje: un progreso de antes de los ejes es del eje por defecto (ajustes, tests y examen a medias)', async () => {
  const { EJE_POR_DEFECTO } = await import('../src/bancos/registro.js');
  const tc = { tit: 'per', tipo: 'real', conv: 'and-2023-c1', seed: null, respuestas: { 'and-2023-c1-t01': 'a' }, i: 3, consumidoMs: 6e5, guardado: 1 };
  const antiguo = { version: 1, exercises: {}, exams: {}, settings: { level: 'PER', toleranceFactor: 1 }, tests: [{ tit: 'per', conv: 'and-2023-c2', tipo: 'real', aciertos: 40, total: 45 }], testEnCurso: tc };
  const p = createProgressStore(memoria({ [KEY]: JSON.stringify(antiguo) }));
  assert.equal(p.settings().eje, EJE_POR_DEFECTO);
  assert.equal(p.tests()[0].eje, EJE_POR_DEFECTO);
  assert.equal(p.tests()[0].conv, 'and-2023-c2');
  assert.deepEqual(p.testEnCurso(), { ...tc, eje: EJE_POR_DEFECTO }); // sin ids: se rehace con la convocatoria o la semilla
  // Una copia de seguridad antigua se importa igual; un eje ya elegido se respeta.
  const q = createProgressStore(memoria());
  q.import(JSON.stringify(antiguo));
  assert.equal(q.settings().eje, EJE_POR_DEFECTO);
  assert.equal(q.testEnCurso().eje, EJE_POR_DEFECTO);
  const r = createProgressStore(memoria({ [KEY]: JSON.stringify({ ...antiguo, settings: { eje: 'otro' }, tests: [{ eje: 'otro', conv: 'x' }] }) }));
  assert.equal(r.settings().eje, 'otro');
  assert.equal(r.tests()[0].eje, 'otro');
  // Las tarjetas guardadas entre las respuestas no se tocan.
  const s = createProgressStore(memoria({ [KEY]: JSON.stringify({ ...antiguo, exams: { 'tarjeta:x': { caja: 2 } } }) }));
  assert.deepEqual(s.get().exams['tarjeta:x'], { caja: 2 });
});

test('examen a medias: guarda las preguntas (ids) en su orden', () => {
  const mem = memoria();
  const p = createProgressStore(mem);
  p.saveTestEnCurso({ tit: 'py', eje: 'andalucia', tipo: 'simulacro', conv: null, seed: 7, ids: ['b', 'a', 'c'], respuestas: {}, i: 0, consumidoMs: 0 });
  assert.deepEqual(createProgressStore(mem).testEnCurso().ids, ['b', 'a', 'c']);
});

test('recordExam acepta choice null («No la sé») y diasConActividadDesde', () => {
  const p = createProgressStore(memoria());
  p.recordExam('x', { choice: null, ok: false });
  assert.deepEqual([p.get().exams.x.choice, p.get().exams.x.ok], [null, false]);
  for (let i = 0; i < 8; i++) p.logActividad(5, AHORA - i * DIA);
  assert.equal(p.diasConActividadDesde(undefined), 8);
  assert.equal(p.diasConActividadDesde(AHORA - 3 * DIA), 3);
});

test('recordExam guarda cuántas veces y si se acertó a la primera (también con datos antiguos)', () => {
  const mem = memoria();
  const p = createProgressStore(mem);
  p.recordExam('q', { choice: 'b', ok: false });
  p.recordExam('q', { choice: 'a', ok: true });
  assert.deepEqual([p.get().exams.q.n, p.get().exams.q.ok1, p.get().exams.q.ok], [2, false, true]);
  // Un registro de antes de este cambio (sin n ni ok1): su respuesta guardada cuenta como la primera.
  p.get().exams.viejo = { choice: 'a', ok: true, t: '2026-01-01T00:00:00Z' };
  p.recordExam('viejo', { choice: 'c', ok: false });
  assert.deepEqual([p.get().exams.viejo.n, p.get().exams.viejo.ok1], [2, true]);
});

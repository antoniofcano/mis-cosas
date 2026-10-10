// Rendimiento del registro: con el progreso de un alumno que ha estudiado mucho (20 000 operaciones), abrir la app
// (plegar todo) y responder una pregunta (apuntar, aplicar y guardar) siguen siendo rápidos, y el registro cabe en el
// almacenamiento del navegador (unos 5 MB).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProgressStore } from '../src/store/progress.js';
import { CLAVE_SYNC } from '../src/store/sync/registro.js';
import { memoria } from './sync-reloj.js';

test('20 000 operaciones: abrir en < 1,5 s, responder en < 60 ms de media y el registro en < 3 MB', () => {
  const mem = memoria();
  const p = createProgressStore(mem);
  const N = 20000;
  const t0 = Date.now();
  // Se rellena directamente el registro (más rápido que 20 000 escrituras) con operaciones como las reales.
  const ops = [];
  for (let i = 0; i < N; i += 1) {
    const t = t0 - (N - i) * 60e3;
    ops.push(i % 10 === 0
      ? { i: `aaaaaaaaaa.${(i + 1).toString(36)}.x1`, k: 'a', t, d: new Date(t).toLocaleDateString('sv-SE'), m: 3 }
      : { i: `aaaaaaaaaa.${(i + 1).toString(36)}.x1`, k: 'r', t, q: `and-20${20 + (i % 6)}-c${1 + (i % 2)}-t${String(i % 45).padStart(2, '0')}`, c: 'abcd'[i % 4], o: i % 3 > 0, d: new Date(t).toLocaleDateString('sv-SE') });
  }
  const st = JSON.parse(mem.m.get(CLAVE_SYNC));
  st.ops = ops;
  st.n = N;
  mem.m.set(CLAVE_SYNC, JSON.stringify(st));
  const bytes = mem.m.get(CLAVE_SYNC).length;
  assert.ok(bytes < 3e6, `${(bytes / 1e6).toFixed(2)} MB`);
  const a = performance.now();
  const q = createProgressStore(mem);
  const abrir = performance.now() - a;
  assert.ok(Object.keys(q.get().exams).length > 50);
  const b = performance.now();
  for (let i = 0; i < 20; i += 1) q.recordExam('and-2026-c1-t01', { choice: 'a', ok: true });
  const responder = (performance.now() - b) / 20;
  assert.ok(abrir < 1500, `abrir: ${abrir.toFixed(0)} ms`);
  assert.ok(responder < 60, `responder: ${responder.toFixed(1)} ms`);
  void p;
});

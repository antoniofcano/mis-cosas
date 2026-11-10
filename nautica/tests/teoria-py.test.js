// Integridad del banco de teoría del Patrón de Yate y de su estructura de examen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { PY, TITULACIONES, totalPreguntas, estructuraModulo } from '../src/theory/blocks.js';
import { convocatorias, buildReal, buildSimulacro, grade } from '../src/theory/engine.js';
import { createRng } from '../src/math/rng.js';

const dir = new URL('../data/ejes/andalucia/', import.meta.url);
const bank = JSON.parse(readFileSync(new URL('py/preguntas.json', dir))).preguntas;

test('estructura PY: 40 preguntas, 28 aciertos, límites en navegación y carta', () => {
  assert.equal(totalPreguntas(PY), 40);
  assert.equal(PY.minAciertos, 28);
  assert.equal(PY.bloques.find((b) => b.ut === 3).maxErrores, 5);
  assert.equal(PY.bloques.find((b) => b.ut === 4).maxErrores, 3);
  assert.equal(TITULACIONES.py.estructura, PY);
});

test('banco PY: 34 convocatorias completas de 40 preguntas (2020–2026: 180 por bloque)', () => {
  const antiguas = bank.filter((q) => !/^and-py-201[5-9]-/.test(q.id));
  assert.equal(antiguas.length, 720);
  assert.equal(bank.length, 720 + 609); // 2015–2019 (fase F5): las que repiten una publicada van en su apareceEn
  for (const b of PY.bloques) assert.equal(antiguas.filter((q) => q.ut === b.ut).length, b.n * 18, `UT${b.ut}`);
  const convs = convocatorias(PY, bank);
  assert.equal(convs.length, 34);
  assert.ok(convs.every((c) => c.completa && c.n === 40));
  for (const c of convs) {
    const t = buildReal(bank, c.key);
    for (const b of PY.bloques) assert.equal(t.preguntas.filter((q) => q.ut === b.ut).length, b.n, `${c.key} UT${b.ut}`);
  }
});

test('cada pregunta PY: 4 opciones, respuesta válida o anulada, figuras existentes', () => {
  for (const q of bank) {
    assert.deepEqual(Object.keys(q.opciones).sort(), ['a', 'b', 'c', 'd'], q.id);
    if (q.anulada) assert.equal(q.correcta, null, q.id);
    else assert.ok(['a', 'b', 'c', 'd'].includes(q.correcta), q.id);
    for (const f of q.figuras ?? []) assert.ok(existsSync(new URL(f, dir)), `${q.id}: ${f}`);
  }
});

test('examen real PY: genérico (1–20) y luego navegación (21–40); corrección con las reglas del PY', () => {
  const t = buildReal(bank, 'and-py-2025-c1');
  assert.equal(t.preguntas.length, 40);
  assert.deepEqual(t.preguntas.slice(0, 20).map((q) => q.modulo), Array(20).fill('generico'));
  assert.deepEqual(t.preguntas.slice(20).map((q) => q.modulo), Array(20).fill('navegacion'));
  const todas = Object.fromEntries(t.preguntas.map((q) => [q.id, q.correcta ?? 'a']));
  assert.equal(grade(PY, t, todas).apto, true);
  // 4 fallos en carta (máx. 3) → no apto aunque haya 36 aciertos
  const carta = t.preguntas.filter((q) => q.ut === 4 && !q.anulada).slice(0, 4);
  const mal = { ...todas, ...Object.fromEntries(carta.map((q) => [q.id, q.correcta === 'a' ? 'b' : 'a'])) };
  const g = grade(PY, t, mal);
  assert.equal(g.apto, false);
  assert.ok(g.motivos.some((m) => /Carta/.test(m)));
});

test('simulacro PY: 10 preguntas de cada bloque', () => {
  const s = buildSimulacro(PY, bank, createRng(1));
  assert.equal(s.preguntas.length, 40);
  assert.equal(s.faltan.length, 0);
});

test('el profe tiene explicación para todas las preguntas del PY (también las de carta), con ilustraciones dibujables', async () => {
  const { narrateTheory } = await import('../src/teacher/theory.js');
  const { validSpec } = await import('../src/illustrations/index.js');
  const expl = JSON.parse(readFileSync(new URL('py/explicaciones.json', dir)));
  for (const q of bank) {
    const e = expl[q.id];
    assert.ok(e?.explicacion && e.clave, `sin explicación: ${q.id}`);
    for (const s of e.ilustraciones ?? []) assert.ok(validSpec(s), `${q.id}: ${JSON.stringify(s)}`);
    const n = narrateTheory(q, e, 'a');
    assert.ok(n.speech.length > 40 && !/undefined/.test(n.speech), q.id);
  }
});

test('simulacro por módulos del PY: genérico y navegación, con su tiempo, su proporción de aciertos y sus límites', () => {
  const gen = estructuraModulo(PY, 'generico');
  const nav = estructuraModulo(PY, 'navegacion');
  assert.equal(estructuraModulo(PY, 'otro'), null);
  assert.deepEqual(gen.bloques.map((b) => b.ut), [1, 2]);
  assert.deepEqual(nav.bloques.map((b) => b.ut), [3, 4]);
  assert.equal(totalPreguntas(gen), 20);
  // Aprobado por módulos (RD 875/2014, anexo II): por materias, sin nota global.
  assert.deepEqual(gen.bloques.map((b) => b.maxErrores), [5, 5]);
  assert.deepEqual(nav.bloques.map((b) => b.maxErrores), [5, 3]);
  assert.equal(gen.minAciertos, 10);
  assert.equal(nav.minAciertos, 12);
  assert.equal(gen.duracionMin, 45);
  assert.equal(nav.duracionMin, 75);
  const s = buildSimulacro(nav, bank, createRng(3));
  assert.equal(s.preguntas.length, 20);
  assert.ok(s.preguntas.every((q) => q.ut === 3 || q.ut === 4));
  assert.equal(s.modulo, 'navegacion');
  assert.match(s.titulo, /módulo de navegación/);
  // Genérico: 5 fallos en cada materia aprueba (10 de 20); 6 en una, no.
  const sg = buildSimulacro(gen, bank, createRng(5));
  const falla = (qs, n, base) => { const r = { ...base }; for (const q of qs.filter((x) => !x.anulada).slice(0, n)) r[q.id] = q.correcta === 'a' ? 'b' : 'a'; return r; };
  const bien = Object.fromEntries(sg.preguntas.map((q) => [q.id, q.correcta]));
  const cinco = falla(sg.preguntas.filter((q) => q.ut === 2), 5, falla(sg.preguntas.filter((q) => q.ut === 1), 5, bien));
  assert.equal(grade(gen, sg, cinco).apto, true);
  assert.equal(grade(gen, sg, falla(sg.preguntas.filter((q) => q.ut === 1), 6, bien)).apto, false);
  // Todo bien salvo 4 fallos en carta (máximo 3): no apto aunque tenga 16 aciertos.
  const resp = Object.fromEntries(s.preguntas.map((q) => [q.id, q.correcta]));
  for (const q of s.preguntas.filter((x) => x.ut === 4 && !x.anulada).slice(0, 4)) resp[q.id] = q.correcta === 'a' ? 'b' : 'a';
  const g = grade(nav, s, resp);
  assert.equal(g.apto, false);
  assert.ok(g.motivos.some((m) => /Carta/.test(m)));
  assert.equal(grade(nav, s, Object.fromEntries(s.preguntas.map((q) => [q.id, q.correcta]))).apto, true);
  // El PER no tiene módulos.
  assert.equal(estructuraModulo(TITULACIONES.per.estructura, 'generico'), null);
});

// Integridad del banco de teoría PER: respuestas válidas, bloques, figuras y explicaciones del profe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { PER } from '../src/theory/blocks.js';
import { narrateTheory } from '../src/teacher/theory.js';
import { validSpec } from '../src/illustrations/index.js';

const dir = new URL('../data/ejes/andalucia/', import.meta.url);
// Teoría del PER: las preguntas 1–41 (las de carta, 42–45, se resuelven sobre la carta: tests/exams.test.js).
const bank = JSON.parse(readFileSync(new URL('per/preguntas.json', dir))).preguntas.filter((q) => !q.requiere.includes('carta'));
const expl = JSON.parse(readFileSync(new URL('per/explicaciones.json', dir)));

test('banco de teoría PER: 34 convocatorias × 41 preguntas con bloques del RD', () => {
  // 2020–2026: 18 convocatorias, 738 preguntas. 2015–2019 (fase F5): 16 más, con 625 preguntas propias; las que repiten
  // una ya publicada van en su apareceEn.
  const antiguas = bank.filter((q) => !/^and-201[5-9]-/.test(q.id));
  assert.equal(antiguas.length, 738);
  assert.equal(bank.length, 738 + 625);
  const per = new Map(PER.bloques.map((b) => [b.ut, 0]));
  for (const q of antiguas) per.set(q.ut, per.get(q.ut) + 1);
  for (const b of PER.bloques.filter((x) => x.ut <= 10)) assert.equal(per.get(b.ut), b.n * 18, `UT${b.ut}`);
  // Cada convocatoria, con sus preguntas y las unidas: el reparto del RD en cada tema.
  const convs = new Set(bank.map((q) => q.conv));
  assert.equal(convs.size, 34);
  for (const c of convs) {
    for (const b of PER.bloques.filter((x) => x.ut <= 10)) {
      assert.equal(bank.filter((q) => q.ut === b.ut && (q.conv === c || q.apareceEn.some((a) => a.conv === c))).length, b.n, `${c} UT${b.ut}`);
    }
  }
});

test('cada pregunta: 4 opciones, respuesta válida o anulada, figuras existentes', () => {
  for (const q of bank) {
    assert.deepEqual(Object.keys(q.opciones).sort(), ['a', 'b', 'c', 'd'], q.id);
    if (q.anulada) assert.equal(q.correcta, null, q.id);
    else assert.ok(['a', 'b', 'c', 'd'].includes(q.correcta), q.id);
    for (const f of q.figuras ?? []) assert.ok(existsSync(new URL(f, dir)), `${q.id}: ${f}`);
  }
});

test('el profe tiene explicación para todas las preguntas', () => {
  for (const q of bank) {
    assert.ok(expl[q.id]?.explicacion, `sin explicación: ${q.id}`);
    const n = narrateTheory(q, expl[q.id], 'a');
    assert.ok(n.speech.length > 40 && !/undefined/.test(n.speech), q.id);
  }
});

test('las ilustraciones asignadas a las preguntas son dibujables', () => {
  for (const [id, e] of Object.entries(expl)) {
    for (const s of e.ilustraciones ?? []) assert.ok(validSpec(s), `${id}: ${JSON.stringify(s)}`);
  }
});

test('reglas nemotécnicas: asignadas a preguntas que existen', () => {
  const m = JSON.parse(readFileSync(new URL('../../comun/mnemotecnias.json', dir)));
  const py = JSON.parse(readFileSync(new URL('py/preguntas.json', dir))).preguntas;
  const ids = new Set([...bank, ...py].map((q) => q.id));
  for (const r of m.reglas) {
    assert.ok(r.regla && r.significado, r.id);
    for (const id of r.preguntas ?? []) assert.ok(ids.has(id), `${r.id}: ${id}`);
  }
});

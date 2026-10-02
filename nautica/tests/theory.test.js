import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PER, totalPreguntas } from '../src/theory/blocks.js';
import { buildSimulacro, buildReal, grade, convocatorias } from '../src/theory/engine.js';
import { createRng } from '../src/math/rng.js';

// Banco sintético: 3 convocatorias completas
const banco = [];
for (const conv of ['and-2024-c1', 'and-2024-c2', 'and-2025-c1']) {
  let n = 1;
  for (const b of PER.bloques) {
    for (let i = 0; i < b.n; i++, n++) {
      banco.push({ id: `${conv}-${b.ut === 11 ? 'q' : 't'}${String(n).padStart(2, '0')}`, ut: b.ut, numero: n, convocatoria: conv, fecha: conv, correcta: 'a', opciones: { a: 'x', b: 'y' } });
    }
  }
}

test('estructura oficial PER: 45 preguntas', () => assert.equal(totalPreguntas(PER), 45));

test('simulacro respeta el reparto por bloques y es reproducible', () => {
  const s = buildSimulacro(PER, banco, createRng(3));
  assert.equal(s.preguntas.length, 45);
  for (const b of PER.bloques) assert.equal(s.preguntas.filter((q) => q.ut === b.ut).length, b.n);
  assert.deepEqual(buildSimulacro(PER, banco, createRng(3)).preguntas.map((q) => q.id), s.preguntas.map((q) => q.id));
});

test('examen real: convocatoria completa en orden', () => {
  const r = buildReal(banco, 'and-2024-c2');
  assert.equal(r.preguntas.length, 45);
  assert.deepEqual(r.preguntas.map((q) => q.numero), [...Array(45)].map((_, i) => i + 1));
  assert.equal(convocatorias(PER, banco).filter((c) => c.completa).length, 3);
});

test('corrección con reglas oficiales', () => {
  const r = buildReal(banco, 'and-2024-c1');
  const todas = Object.fromEntries(r.preguntas.map((q) => [q.id, 'a']));
  assert.equal(grade(PER, r, todas).apto, true);
  // 13 errores repartidos sin superar límites → apto (32 aciertos)
  const r13 = { ...todas };
  r.preguntas.filter((q) => [1, 3, 9, 10].includes(q.ut)).slice(0, 13).forEach((q) => { r13[q.id] = 'b'; });
  const g13 = grade(PER, r, r13);
  assert.equal(g13.aciertos, 32);
  assert.equal(g13.apto, true);
  // 3 errores de balizamiento → no apto aunque haya 42 aciertos
  const rb = { ...todas };
  r.preguntas.filter((q) => q.ut === 5).slice(0, 3).forEach((q) => { rb[q.id] = 'b'; });
  const gb = grade(PER, r, rb);
  assert.equal(gb.apto, false);
  assert.match(gb.motivos.join(' '), /Balizamiento/);
  // en blanco = fallo; anulada = acierto
  const rv = { ...todas };
  delete rv[r.preguntas[0].id];
  assert.equal(grade(PER, r, rv).aciertos, 44);
  const anul = { ...r, preguntas: r.preguntas.map((q, i) => (i === 0 ? { ...q, anulada: true, correcta: null } : q)) };
  assert.equal(grade(PER, anul, rv).aciertos, 45);
});

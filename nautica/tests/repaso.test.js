// B1: repaso espaciado de fallos (1, 3 y 7 días; tres aciertos seguidos y sale) y B8: tanda de 5 minutos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { siguienteRepaso, colaRepaso, repasoDe, sumaDias, tandaRapida } from '../src/course/repaso.js';
import { createRng } from '../src/math/rng.js';
import { createProgressStore } from '../src/store/progress.js';

const HOY = '2026-10-03';

test('el ciclo completo: fallo → mañana → 3 días → 7 días → fuera', () => {
  let reg;
  const responde = (ok, dia) => { reg = { ok, rep: siguienteRepaso(reg, ok, dia) }; return reg.rep; };
  assert.deepEqual(responde(false, HOY), { racha: 0, prox: '2026-10-04' });
  assert.deepEqual(responde(true, '2026-10-04'), { racha: 1, prox: '2026-10-07' });
  assert.deepEqual(responde(true, '2026-10-07'), { racha: 2, prox: '2026-10-14' });
  assert.equal(responde(true, '2026-10-14'), null); // tres aciertos seguidos: sale
});

test('fallar otra vez empieza de nuevo, y acertar antes de tiempo no adelanta', () => {
  const enCola = { ok: true, rep: { racha: 2, prox: '2026-10-10' } };
  assert.deepEqual(siguienteRepaso(enCola, false, HOY), { racha: 0, prox: '2026-10-04' });
  assert.deepEqual(siguienteRepaso(enCola, true, HOY), enCola.rep);
  assert.equal(siguienteRepaso(undefined, true, HOY), null); // acertar una nueva no la mete en la cola
});

test('respuestas antiguas (sin rep): un fallo cuenta como pendiente desde hoy; un acierto, no', () => {
  assert.deepEqual(repasoDe({ ok: false, choice: 'b' }, HOY), { racha: 0, prox: HOY });
  assert.equal(repasoDe({ ok: true }, HOY), null);
  assert.equal(repasoDe({ ok: false, rep: null }, HOY), null);
  assert.equal(sumaDias('2026-12-30', 3), '2027-01-02');
});

test('cola: las que tocan hoy (más atrasadas primero), el total y los minutos', () => {
  const qs = ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, ut: 1, correcta: 'a' }));
  const r = {
    a: { ok: false, rep: { racha: 0, prox: '2026-10-02' } },
    b: { ok: true, rep: { racha: 1, prox: HOY } },
    c: { ok: true, rep: { racha: 2, prox: '2026-10-09' } }, // aún no toca
    d: { ok: false }, // antigua
    e: { ok: true, rep: null },
  };
  const c = colaRepaso(qs, r, HOY);
  assert.deepEqual(c.hoy.map((q) => q.id), ['a', 'b', 'd']);
  assert.equal(c.total, 4);
  assert.equal(c.minutosPendientes, Math.ceil((3 + 2 + 1 + 3) * 0.8));
});

test('el almacén guarda el repaso al responder, sin romper un progreso antiguo', () => {
  const datos = new Map();
  const mem = { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v), removeItem: (k) => datos.delete(k) };
  const p = createProgressStore(mem);
  p.recordExam('x', { choice: 'b', ok: false });
  assert.equal(p.get().exams.x.rep.racha, 0);
  // copia antigua: un registro sin rep sigue leyéndose y entra en la cola
  p.get().exams.viejo = { choice: 'c', ok: false, t: '2026-01-01T00:00:00Z' };
  assert.deepEqual(colaRepaso([{ id: 'viejo', correcta: 'a' }], p.get().exams, HOY).hoy.map((q) => q.id), ['viejo']);
});

test('tanda de 5 minutos: primero lo que toca repasar, luego fallos y luego nuevas de temas empezados', () => {
  const qs = [...Array(12)].map((_, i) => ({ id: `q${i}`, ut: i < 8 ? 1 : 2, correcta: 'a' }));
  const r = { q0: { ok: false, rep: { racha: 0, prox: HOY } }, q1: { ok: false, rep: { racha: 0, prox: '2026-10-20' } }, q2: { ok: true } };
  const t = tandaRapida(qs, r, createRng(7), { hoy: HOY });
  assert.equal(t.length, 5);
  assert.equal(t[0].id, 'q0');
  assert.equal(t[1].id, 'q1');
  assert.ok(t.slice(2).every((q) => q.ut === 1 && !r[q.id]), 'las nuevas, del tema ya empezado');
});

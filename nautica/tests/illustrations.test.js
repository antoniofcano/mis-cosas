import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGO, renderIllustration, validSpec } from '../src/illustrations/index.js';
import { BUOYS } from '../src/illustrations/buoys.js';
import { SHIPS } from '../src/illustrations/ships.js';
import { SENALES } from '../src/illustrations/situations.js';
import { parseRhythm } from '../src/illustrations/lights.js';

test('ritmos de luz: periodos y número de destellos', () => {
  const on = (r) => r.steps.filter((s) => s.on).length;
  assert.equal(on(parseRhythm('Fl(2) 5s')), 2); assert.equal(parseRhythm('Fl(2) 5s').period, 5);
  assert.equal(on(parseRhythm('Q(3) 10s')), 3);
  assert.equal(on(parseRhythm('Q(6)+LFl 15s')), 7);
  assert.equal(on(parseRhythm('Q(9) 15s')), 9);
  assert.equal(on(parseRhythm('Fl(2+1) R 10s')), 3);
  assert.equal(parseRhythm('Q').period, 1);
  for (const t of ['Fl R 4s', 'Iso 4s', 'Oc 6s', 'Oc(2) 8s', 'LFl 10s', 'Mo(A) 6s', 'Al.Bu/Y 3s', 'VQ(6)+LFl 10s', 'F']) {
    const r = parseRhythm(t);
    const total = r.steps.reduce((a, s) => a + s.d, 0);
    assert.ok(Math.abs(total - r.period) < 1e-6 && r.steps.every((s) => s.d >= 0), t);
  }
});

test('todo el catálogo se dibuja', () => {
  const specs = [
    ...Object.values(CATALOGO).map((c) => c.ejemplo),
    ...Object.keys(BUOYS).map((clase) => ({ tipo: 'boya', clase })),
    ...Object.keys(SHIPS).flatMap((clase) => ['proa', 'babor', 'estribor', 'popa', 'todas'].map((vista) => ({ tipo: 'buque', clase, vista, dia: true }))),
    ...Object.keys(SENALES).map((senal) => ({ tipo: 'sonido', senal })),
  ];
  for (const s of specs) {
    const r = renderIllustration(s);
    assert.ok(r?.svg?.startsWith('<svg') && !/NaN|undefined/.test(r.svg), JSON.stringify(s));
  }
  assert.equal(validSpec({ tipo: 'boya', clase: 'inventada' }), false);
});

test('ritmo de la cardinal Sur muy rápida: VQ(6)+LFl conserva el destello largo', async () => {
  const { parseRhythm } = await import('../src/illustrations/lights.js');
  const r = parseRhythm('VQ(6)+LFl 10s');
  assert.equal(r.period, 10);
  assert.equal(r.steps.filter((s) => s.on).length, 7);
  assert.equal(Math.max(...r.steps.filter((s) => s.on).map((s) => s.d)), 2);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS } from '../src/illustrations/lecciones/costa.js';

const variantes = (tipo, def) => {
  const specs = [def.ejemplo, { tipo }];
  for (const [k, v] of Object.entries(def.params)) if (Array.isArray(v)) for (const x of v) specs.push({ tipo, [k]: x });
  return specs;
};

for (const [tipo, def] of Object.entries(LAMINAS)) {
  test(`lámina ${tipo}: todas las variantes se dibujan`, () => {
    assert.equal(def.ejemplo.tipo, tipo);
    for (const s of variantes(tipo, def)) {
      const r = def.fn(s);
      assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), JSON.stringify(s));
      assert.ok(!/NaN|undefined/.test(r.svg), JSON.stringify(s));
      assert.ok(typeof r.caption === 'string' && r.caption.trim().length > 0, JSON.stringify(s));
    }
  });
}

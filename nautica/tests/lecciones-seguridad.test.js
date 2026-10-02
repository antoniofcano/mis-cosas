import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS } from '../src/illustrations/lecciones/seguridad.js';

const ok = (r, s) => {
  assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), JSON.stringify(s));
  assert.ok(!/NaN|undefined/.test(r.svg), JSON.stringify(s));
  assert.ok(typeof r.caption === 'string' && r.caption.trim().length > 0, JSON.stringify(s));
};

test('láminas de seguridad: ejemplo y todas las variantes', () => {
  for (const [tipo, { fn, params, ejemplo }] of Object.entries(LAMINAS)) {
    assert.equal(ejemplo.tipo, tipo);
    ok(fn(ejemplo), ejemplo);
    for (const [p, vals] of Object.entries(params)) {
      if (!Array.isArray(vals)) continue;
      for (const v of vals) {
        const s = { ...ejemplo, [p]: v };
        ok(fn(s), s);
      }
    }
  }
});

test('resaltar admite una parte o una lista', () => {
  const { fn } = LAMINAS.balsa;
  ok(fn({ tipo: 'balsa', vista: 'zafa', resaltar: ['zafa', 'boza'] }), 'lista');
  for (const v of ['luz', 'silbato']) ok(LAMINAS.arnes.fn({ tipo: 'arnes', vista: 'chaleco', resaltar: v }), v);
  for (const v of ['linea-vida', 'amarre', 'pecho']) ok(LAMINAS.arnes.fn({ tipo: 'arnes', vista: 'arnes', resaltar: v }), v);
});

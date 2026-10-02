import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS, VARIANTES } from '../src/illustrations/lecciones/fondeo.js';

const ok = (r, etiqueta) => {
  assert.ok(r && typeof r.svg === 'string', etiqueta);
  assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), etiqueta);
  assert.ok(typeof r.caption === 'string' && r.caption.trim().length > 0, etiqueta);
};

test('cada lámina dibuja su ejemplo', () => {
  for (const [tipo, l] of Object.entries(LAMINAS)) {
    assert.equal(l.ejemplo.tipo, tipo);
    ok(l.fn(l.ejemplo), tipo);
  }
});

test('cada variante de parámetros se dibuja', () => {
  for (const [tipo, l] of Object.entries(LAMINAS)) {
    for (const [p, vals] of Object.entries(l.params)) {
      if (!Array.isArray(vals)) continue;
      for (const v of vals) ok(l.fn({ ...l.ejemplo, [p]: v }), `${tipo} ${p}=${v}`);
    }
  }
  for (const s of VARIANTES) ok(LAMINAS[s.tipo].fn(s), JSON.stringify(s));
});

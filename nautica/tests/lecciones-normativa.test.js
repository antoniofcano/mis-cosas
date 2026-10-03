import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS } from '../src/illustrations/lecciones/normativa.js';
import { CATALOGO } from '../src/illustrations/index.js';
import { LAMINAS_LECCIONES } from '../src/illustrations/lecciones/index.js';

const ok = (r, s) => {
  assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), JSON.stringify(s));
  assert.ok(!/NaN|undefined/.test(r.svg), JSON.stringify(s));
  assert.ok(typeof r.caption === 'string' && r.caption.trim().length > 0, JSON.stringify(s));
};

test('láminas de normativa: ejemplo y todas las variantes', () => {
  for (const [tipo, { fn, params, ejemplo }] of Object.entries(LAMINAS)) {
    assert.equal(ejemplo.tipo, tipo);
    ok(fn(ejemplo), ejemplo);
    const vistas = params.vista ?? [ejemplo.vista];
    for (const vista of vistas) {
      ok(fn({ ...ejemplo, vista }), vista);
      for (const r of params.resaltar ?? []) ok(fn({ ...ejemplo, vista, resaltar: r }), { vista, r });
    }
  }
});

test('resaltar admite una lista', () => {
  ok(LAMINAS['revision-salida'].fn({ tipo: 'revision-salida', vista: 'motor', resaltar: ['aceite', 'correa'] }), 'lista');
});

test('los tipos no chocan con los ya existentes', () => {
  for (const tipo of Object.keys(LAMINAS)) {
    assert.ok(!(tipo in CATALOGO), tipo);
    assert.ok(!(tipo in LAMINAS_LECCIONES), tipo);
  }
});

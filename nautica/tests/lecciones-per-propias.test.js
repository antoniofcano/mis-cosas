import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS } from '../src/illustrations/lecciones/per-propias.js';
import { CATALOGO } from '../src/illustrations/index.js';
import { LAMINAS_LECCIONES } from '../src/illustrations/lecciones/index.js';

const ok = (r, s) => {
  assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), JSON.stringify(s));
  assert.ok(!/NaN|undefined/.test(r.svg), JSON.stringify(s));
  assert.ok(typeof r.caption === 'string' && r.caption.trim().length > 0, JSON.stringify(s));
};

test('láminas per-propias: ejemplo y todas las variantes', () => {
  for (const [tipo, { fn, params, ejemplo }] of Object.entries(LAMINAS)) {
    assert.equal(ejemplo.tipo, tipo);
    ok(fn(ejemplo), ejemplo);
    for (const vista of params.vista ?? [ejemplo.vista]) {
      ok(fn({ ...ejemplo, vista }), vista);
      for (const r of params.resaltar ?? []) ok(fn({ ...ejemplo, vista, resaltar: r }), { vista, r });
      ok(fn({ ...ejemplo, vista, resaltar: params.resaltar ?? [] }), { vista, todas: true });
    }
  }
});

test('sin spec ni vista, dibuja la vista por defecto', () => {
  for (const [tipo, { fn }] of Object.entries(LAMINAS)) ok(fn({ tipo }), tipo);
});

test('los tipos no chocan con los ya existentes', () => {
  for (const tipo of Object.keys(LAMINAS)) {
    assert.ok(!(tipo in CATALOGO) || CATALOGO[tipo].ejemplo === LAMINAS[tipo].ejemplo, tipo);
    assert.ok(!(tipo in LAMINAS_LECCIONES) || LAMINAS_LECCIONES[tipo] === LAMINAS[tipo], tipo);
  }
});

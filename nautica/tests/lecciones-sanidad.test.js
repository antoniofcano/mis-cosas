import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS } from '../src/illustrations/lecciones/sanidad.js';

const ok = (r, s) => {
  assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), JSON.stringify(s));
  assert.ok(!/NaN|undefined/.test(r.svg), JSON.stringify(s));
  assert.ok(typeof r.caption === 'string' && r.caption.trim().length > 0, JSON.stringify(s));
};

test('láminas de sanidad: ejemplo y todas las variantes', () => {
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

test('resaltar por vista admite una parte o una lista', () => {
  const { hemorragia, quemadura } = LAMINAS;
  for (const v of ['arterial', 'venosa', 'capilar']) ok(hemorragia.fn({ tipo: 'hemorragia', vista: 'tipos', resaltar: v }), v);
  for (const v of ['presion', 'elevar', 'vendaje', 'torniquete']) ok(hemorragia.fn({ tipo: 'hemorragia', vista: 'parar', resaltar: v }), v);
  ok(hemorragia.fn({ tipo: 'hemorragia', vista: 'parar', resaltar: ['presion', 'elevar'] }), 'lista');
  for (const v of ['primero', 'segundo', 'tercero']) ok(quemadura.fn({ tipo: 'quemadura', vista: 'grados', resaltar: v }), v);
  for (const v of ['termica', 'quimica']) ok(quemadura.fn({ tipo: 'quemadura', vista: 'enfriar', resaltar: v }), v);
});

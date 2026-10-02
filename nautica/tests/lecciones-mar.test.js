import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS } from '../src/illustrations/lecciones/mar.js';

const variantes = (tipo, { params, ejemplo }) => {
  const specs = [ejemplo];
  const vistas = params.vista ?? [undefined];
  for (const vista of vistas) {
    specs.push({ tipo, vista });
    for (const r of params.resaltar ?? []) specs.push({ tipo, vista, resaltar: r });
  }
  return specs;
};

test('láminas del grupo mar: todas las variantes se dibujan', () => {
  for (const [tipo, def] of Object.entries(LAMINAS)) {
    for (const s of variantes(tipo, def)) {
      const r = def.fn(s);
      // resaltar solo vale en algunas vistas: si no aplica, la vista se dibuja igual o devuelve null de forma explícita
      if (!r) { assert.ok(s.resaltar, `${JSON.stringify(s)} no se dibuja`); continue; }
      assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), JSON.stringify(s));
      assert.ok(!/NaN|undefined/.test(r.svg), `NaN/undefined en ${JSON.stringify(s)}`);
      assert.ok(typeof r.caption === 'string' && r.caption.trim().length > 0, JSON.stringify(s));
    }
    assert.ok(def.fn(def.ejemplo), `${tipo}: el ejemplo se dibuja`);
  }
});

test('valores no válidos devuelven null', () => {
  assert.equal(LAMINAS.ola.fn({ tipo: 'ola', vista: 'otra' }), null);
  assert.equal(LAMINAS.nubes.fn({ tipo: 'nubes', resaltar: 'inventada' }), null);
  assert.equal(LAMINAS['vientos-regionales'].fn({ tipo: 'vientos-regionales', vista: 'x' }), null);
});

// Galería: cada lámina una sola vez, enlazada desde cada tema, e incluidas las láminas de las clases.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PER, PY } from '../src/theory/blocks.js';
import { catalogoLaminas, claveLamina, idLamina } from '../src/illustrations/catalogo-laminas.js';

const curso = (t) => JSON.parse(readFileSync(new URL(`../data/curso/${t}.json`, import.meta.url)));

for (const [tit, E] of [['per', PER], ['py', PY]]) {
  test(`galería ${tit}: una ficha por lámina, temas sin repetidos y todas las láminas de las clases`, () => {
    const c = curso(tit);
    const { temas, porId } = catalogoLaminas(tit, E, c);
    // ids distintos para claves distintas (sin colisiones del hash)
    const claves = new Map();
    for (const l of porId.values()) {
      const k = claveLamina(l.spec);
      assert.ok(!claves.has(l.id) || claves.get(l.id) === k, `colisión de id ${l.id}`);
      claves.set(l.id, k);
      assert.ok(l.titulo.length > 2, `${l.id} sin título`);
    }
    for (const t of temas) assert.equal(new Set(t.ids).size, t.ids.length, `UT${t.ut} repite una lámina`);
    for (const m of c.modulos) for (const l of m.lecciones) for (const p of l.pasos) {
      if (p.tipo !== 'ilustracion') continue;
      const lam = porId.get(idLamina(p.spec));
      assert.ok(lam, `${l.id}: su lámina ${p.spec.tipo} no está en la galería`);
      assert.ok(lam.clases.some((x) => x.id === l.id), `${l.id} no figura en la ficha de su lámina`);
    }
  });
}

test('galería: una lámina de varios temas es la misma ficha (marea · sonda en el PY)', () => {
  const { temas, porId } = catalogoLaminas('py', PY, curso('py'));
  const id = idLamina({ tipo: 'marea', modo: 'sonda' });
  const en = temas.filter((t) => t.ids.includes(id)).map((t) => t.ut);
  assert.ok(en.length >= 2, 'la marea con sonda debería estar en dos temas');
  assert.deepEqual(porId.get(id).temas.sort(), en.sort());
  // Lo resaltado o las cifras de una clase no crean otra lámina
  assert.equal(idLamina({ tipo: 'barco', resaltar: ['proa'] }), idLamina({ tipo: 'barco' }));
  assert.notEqual(idLamina({ tipo: 'marea', modo: 'curva' }), id);
});

// Funciones puras que usan las láminas interactivas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { correccionTotal, signoCt, ewTexto, marcacionBanda } from '../src/nautical/compass.js';

test('signo de la corrección total en las cuatro combinaciones E/W', () => {
  // dm W, Δ E: gana el mayor
  assert.equal(signoCt(correccionTotal(-4, 2)), 'negativa');
  assert.equal(signoCt(correccionTotal(-2, 3)), 'positiva');
  // dm E, Δ W
  assert.equal(signoCt(correccionTotal(3, -5)), 'negativa');
  assert.equal(signoCt(correccionTotal(3, -2)), 'positiva');
  // los dos E / los dos W
  assert.equal(signoCt(correccionTotal(3, 2)), 'positiva');
  assert.equal(signoCt(correccionTotal(-3, -2)), 'negativa');
  // se anulan
  assert.equal(signoCt(correccionTotal(-3, 3)), 'cero');
  assert.equal(ewTexto(-4), '4° W');
  assert.equal(ewTexto(2), '2° E');
  assert.equal(ewTexto(0), '0°');
});

test('marcación por banda', () => {
  assert.deepEqual(marcacionBanda(120, 30), { grados: 90, banda: 'estribor' });
  assert.deepEqual(marcacionBanda(50, 110), { grados: 60, banda: 'babor' });
  assert.deepEqual(marcacionBanda(83, 135), { grados: 52, banda: 'babor' });
  assert.deepEqual(marcacionBanda(10, 350), { grados: 20, banda: 'estribor' }); // cruza el norte
  assert.deepEqual(marcacionBanda(30, 30), { grados: 0, banda: 'proa' });
  assert.deepEqual(marcacionBanda(210, 30), { grados: 180, banda: 'popa' });
});

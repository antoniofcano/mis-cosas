import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS } from '../src/illustrations/lecciones/py-segunda-a.js';
import { CATALOGO } from '../src/illustrations/index.js';

/** Todas las variantes: el ejemplo y cada valor de cada parámetro con lista. */
function variantes() {
  const out = [];
  for (const [, { params, ejemplo }] of Object.entries(LAMINAS)) {
    out.push(ejemplo);
    for (const [k, vals] of Object.entries(params)) if (Array.isArray(vals)) for (const v of vals) out.push({ ...ejemplo, [k]: v });
  }
  out.push({ tipo: 'extintor', vista: 'co2', resaltar: ['boquilla', 'manometro'] }, { tipo: 'extintor', vista: 'uso', resaltar: 'base' });
  out.push({ tipo: 'superficies-libres', resaltar: ['lleno', 'vacio'] });
  return out;
}

test('láminas py-segunda-a: todas las variantes se dibujan', () => {
  for (const s of variantes()) {
    const r = LAMINAS[s.tipo].fn(s);
    assert.ok(r, JSON.stringify(s));
    assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), JSON.stringify(s));
    assert.ok(!/NaN|undefined|null/.test(r.svg), JSON.stringify(s));
    assert.ok(r.caption && r.caption.length > 10, JSON.stringify(s));
  }
});

test('parámetros inválidos devuelven null', () => {
  assert.equal(LAMINAS.extintor.fn({ tipo: 'extintor', vista: 'co2', resaltar: 'viento' }), null);
  assert.equal(LAMINAS.extintor.fn({ tipo: 'extintor', vista: 'otra' }), null);
  assert.equal(LAMINAS['modelos-viento'].fn({ tipo: 'modelos-viento', modelo: 'euler' }), null);
  assert.equal(LAMINAS.psicrometro.fn({ tipo: 'psicrometro', caso: 'x' }), null);
  assert.equal(LAMINAS['nubes-pisos'].fn({ tipo: 'nubes-pisos', resaltar: 'cirros' }), null);
  assert.equal(LAMINAS['superficies-libres'].fn({ tipo: 'superficies-libres', resaltar: 'x' }), null);
});

test('los tipos son nuevos', async () => {
  const { LAMINAS_LECCIONES } = await import('../src/illustrations/lecciones/index.js');
  for (const k of Object.keys(LAMINAS)) {
    // Una vez registrados, los de CATALOGO y LAMINAS_LECCIONES tienen que ser estos mismos.
    assert.ok(!(k in CATALOGO) || CATALOGO[k].ejemplo === LAMINAS[k].ejemplo, k);
    assert.ok(!(k in LAMINAS_LECCIONES) || LAMINAS_LECCIONES[k] === LAMINAS[k], k);
  }
});

test('cifras de las lecciones', () => {
  const psi = LAMINAS.psicrometro.fn({ tipo: 'psicrometro' }).svg;
  assert.match(psi, /seco 18 °C/);
  assert.match(psi, /húmedo 15 °C/);
  assert.match(psi, /algo más del 70 %/);
  assert.match(psi, /unos 13 °C/);
  const nub = LAMINAS['nubes-pisos'].fn({ tipo: 'nubes-pisos' }).svg;
  for (const ab of ['Ci', 'Cc', 'Cs', 'Ac', 'As', 'St', 'Sc', 'Ns', 'Cu', 'Cb']) assert.match(nub, new RegExp(`>${ab}<`));
  assert.match(nub, /más de unos 6000 m/);
  assert.match(nub, /2000 a 6000 m/);
  assert.match(nub, /menos de 2000 m/);
  const mv = LAMINAS['modelos-viento'].fn({ tipo: 'modelos-viento' }).svg;
  assert.match(mv, /10–20°/);
  assert.match(mv, /centrífuga/);
  assert.match(mv, /rozamiento/);
  assert.match(LAMINAS.extintor.fn({ tipo: 'extintor', vista: 'co2' }).svg, /Sin manómetro/);
});

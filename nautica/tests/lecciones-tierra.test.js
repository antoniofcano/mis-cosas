import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS } from '../src/illustrations/lecciones/tierra.js';

const VARIANTES = {
  coordenadas: [
    {}, { vista: 'esfera' }, ...['eje', 'ecuador', 'paralelos', 'meridianos', 'greenwich', 'maximos', 'tropicos'].map((r) => ({ vista: 'esfera', resaltar: r })),
    { vista: 'esfera', resaltar: ['ecuador', 'greenwich'] },
    { vista: 'latitud' }, { vista: 'latitud', lat: -30, lon: -60 }, { vista: 'longitud' }, { vista: 'longitud', lon: 40, lat: 20 },
    { vista: 'lugar' }, { vista: 'lugar', lon: 60 }, { vista: 'diferencias' },
  ],
  milla: [{}, { vista: 'carta' }, { vista: 'minuto' }, { vista: 'definicion' }],
  veriles: [{}, { vista: 'carta' }, { vista: 'carta', resaltar: 'sondas' }, { vista: 'carta', resaltar: 'veriles' }, { vista: 'carta', resaltar: 'fondo' }, { vista: 'fondos' }, { vista: 'fondos', resaltar: ['G', 'St'] }],
  husos: [{}, { vista: 'husos' }, { vista: 'husos', tu: '08:00' }, { vista: 'calculo', ejemplo: 'e' }, { vista: 'calculo', ejemplo: 'w' }, { vista: 'calculo', lon: -45, tu: '14:00' }, { vista: 'oficial' }],
};

for (const [tipo, def] of Object.entries(LAMINAS)) {
  test(`lámina ${tipo}: ejemplo y variantes`, () => {
    assert.equal(def.ejemplo.tipo, tipo);
    assert.ok(def.params && typeof def.params === 'object');
    for (const v of [def.ejemplo, ...VARIANTES[tipo].map((s) => ({ tipo, ...s }))]) {
      const r = def.fn(v);
      assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), `${tipo} ${JSON.stringify(v)}`);
      assert.ok(r.caption && r.caption.length > 10, `${tipo} caption`);
      assert.ok(!/NaN|undefined/.test(r.svg), `${tipo} ${JSON.stringify(v)} sin NaN`);
    }
  });
}

test('husos: cuentas de la lección', () => {
  const e = LAMINAS.husos.fn({ tipo: 'husos', vista: 'calculo', ejemplo: 'e' }).svg;
  assert.match(e, /Hz = 10:30 \+ 5 h = 15:30/);
  assert.match(e, /= 15:07,7/);
  const w = LAMINAS.husos.fn({ tipo: 'husos', vista: 'calculo', ejemplo: 'w' }).svg;
  assert.match(w, /Hz = 08:00 − 5 h = 03:00/);
  assert.match(w, /HcL = 08:00 − 5 h = 03:00/);
  const c = LAMINAS.husos.fn({ tipo: 'husos', vista: 'calculo', lon: -45, tu: '14:00' }).svg;
  assert.match(c, /= 11:00/);
});

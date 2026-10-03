import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS } from '../src/illustrations/lecciones/py-navegacion.js';
import { CATALOGO } from '../src/illustrations/index.js';

/** Todas las variantes: el ejemplo, cada valor de cada parámetro con lista y algunos casos numéricos. */
function variantes() {
  const out = [];
  for (const [, { params, ejemplo }] of Object.entries(LAMINAS)) {
    out.push(ejemplo);
    for (const [k, vals] of Object.entries(params)) if (Array.isArray(vals)) for (const v of vals) out.push({ ...ejemplo, [k]: v });
  }
  out.push({ tipo: 'radar-pantalla', presentacion: 'proa-arriba', rumbo: 80, marcacion: 310 }, { tipo: 'radar-pantalla', rumbo: 210, marcacion: 90, resaltar: ['ebl', 'calculo'] });
  out.push({ tipo: 'radar-respondedores', sart: 'cerca', resaltar: 'sart' });
  out.push({ tipo: 'tangente-viento', banda: 'babor', dv: 250, D: 10, d: 5, viento: 315, ab: 12 }, { tipo: 'tangente-viento', resaltar: ['tangente', 'rv'] });
  out.push({ tipo: 'traves-derrota', banda: 'estribor', rv: 205, viento: 270, ab: 12, trampa: false }, { tipo: 'traves-derrota', resaltar: 'trampa' });
  return out;
}

test('láminas py-navegacion: todas las variantes se dibujan', () => {
  for (const s of variantes()) {
    const r = LAMINAS[s.tipo].fn(s);
    assert.ok(r, JSON.stringify(s));
    assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), JSON.stringify(s));
    assert.ok(!/NaN|undefined|null/.test(r.svg), JSON.stringify(s));
    assert.ok(r.caption && r.caption.length > 10, JSON.stringify(s));
  }
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
  const radar = LAMINAS['radar-pantalla'].fn({ tipo: 'radar-pantalla' }).svg;
  assert.match(radar, /EBL 320°/);
  assert.match(radar, /EBL 170°/);
  assert.match(LAMINAS['radar-pantalla'].fn({ tipo: 'radar-pantalla', rumbo: 80, marcacion: 310 }).svg, /50° por babor: 080° − 50° = 030°/);
  assert.match(LAMINAS['radar-pantalla'].fn({ tipo: 'radar-pantalla', marcacion: 90 }).svg, /= 300°/);
  const tv = LAMINAS['tangente-viento'].fn({ tipo: 'tangente-viento' }).svg;
  assert.match(tv, /α ≈ 21,5°/);
  assert.match(tv, /Rs = Dv \+ α ≈ 111°/);
  assert.match(tv, /Rv = Rs − Ab = 111° \+ 10° = 121°/);
  assert.match(tv, /= 116°/);
  // check de la lección: Dv 250, D 10, d 5, por babor → Rs 280
  assert.match(LAMINAS['tangente-viento'].fn({ tipo: 'tangente-viento', dv: 250, D: 10, d: 5, viento: 180 }).svg, /Rs = Dv \+ α ≈ 280°/);
  const td = LAMINAS['traves-derrota'].fn({ tipo: 'traves-derrota' }).svg;
  assert.match(td, /Rs 160°/);
  assert.match(td, /Dv = Rv − 90° = 080°/);
  assert.match(td, /desde el faro: 260°/);
  assert.match(td, /1 h 03 min → HRB 11:03/);
  assert.match(td, /070°/);
  // check: Rv 205 con viento del W, través de estribor → 295
  assert.match(LAMINAS['traves-derrota'].fn({ tipo: 'traves-derrota', rv: 205, ab: 12, banda: 'estribor' }).svg, /Dv = Rv \+ 90° = 295°/);
  assert.equal(LAMINAS['tangente-viento'].fn({ tipo: 'tangente-viento', D: 2, d: 3 }), null);
  assert.equal(LAMINAS['radar-pantalla'].fn({ tipo: 'radar-pantalla', resaltar: 'inventada' }), null);
});

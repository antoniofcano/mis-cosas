import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS } from '../src/illustrations/lecciones/py-segunda-b.js';
import { CATALOGO } from '../src/illustrations/index.js';

/** Todas las variantes: el ejemplo, cada valor de cada parámetro con lista y algunos casos numéricos. */
function variantes() {
  const out = [];
  for (const [, { params, ejemplo }] of Object.entries(LAMINAS)) {
    out.push(ejemplo);
    for (const [k, vals] of Object.entries(params)) if (Array.isArray(vals)) for (const v of vals) out.push({ ...ejemplo, [k]: v });
  }
  out.push({ tipo: 'loxo-orto', resaltar: ['loxo', 'orto'] });
  out.push({ tipo: 'gnss-calculos', xte: 0.2, banda: 'L', dtg: 13, sog: 5.2, hora: '09:45', angulo: 35 }, { tipo: 'gnss-calculos', angulo: 0, dtg: 60, sog: 5 }, { tipo: 'gnss-calculos', resaltar: ['xte', 'eta'] });
  out.push({ tipo: 'carta-raster-vectorial', resaltar: ['raster', 'vectorial'] });
  return out;
}

test('láminas py-segunda-b: todas las variantes se dibujan', () => {
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
  const g = LAMINAS['gnss-calculos'].fn({ tipo: 'gnss-calculos' }).svg;
  assert.match(g, /XTE 0,05 R/);
  assert.match(g, /medio cable ≈ 93 m/);
  assert.match(g, /VMG 5,6 kn/);
  assert.match(g, /= 3 h/);
  assert.match(g, /ETA = 10:20 \+ 3 h = 13:20/);
  // check de la lección: XTE 0,2 L → a babor
  const l = LAMINAS['gnss-calculos'].fn({ tipo: 'gnss-calculos', xte: 0.2, banda: 'L' });
  assert.match(l.svg, /XTE 0,2 L/);
  assert.match(l.caption, /izquierda \(babor\)/);
  const c = LAMINAS['carta-raster-vectorial'].fn({ tipo: 'carta-raster-vectorial' }).svg;
  for (const s of ['Raster \\(RNC\\)', 'Vectorial \\(ENC\\)', 'S-57', 'ECDIS']) assert.match(c, new RegExp(s));
  assert.equal(LAMINAS['loxo-orto'].fn({ tipo: 'loxo-orto', resaltar: 'inventada' }), null);
  assert.equal(LAMINAS['gnss-calculos'].fn({ tipo: 'gnss-calculos', banda: 'X' }), null);
  assert.equal(LAMINAS['carta-raster-vectorial'].fn({ tipo: 'carta-raster-vectorial', resaltar: 'ais' }), null);
});

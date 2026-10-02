import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS } from '../src/illustrations/lecciones/carta.js';

/** Todas las variantes: el ejemplo, cada valor de cada parámetro con lista y algunos casos numéricos. */
export function variantes() {
  const out = [];
  for (const [tipo, { params, ejemplo }] of Object.entries(LAMINAS)) {
    out.push(ejemplo);
    for (const [k, vals] of Object.entries(params)) if (Array.isArray(vals)) for (const v of vals) out.push({ ...ejemplo, [k]: v });
  }
  out.push({ tipo: 'estima', rv: 110, v: 7.2, hi: '08:00', hf: '10:30' });
  out.push({ tipo: 'estima', ra: 45, ct: 4, v: 5, hi: '23:30', hf: '01:12' });
  out.push({ tipo: 'tangente', banda: 'ambas' }, { tipo: 'tangente', banda: 'estribor', dv: 300, D: 8, d: 3 });
  out.push({ tipo: 'gnss', resaltar: ['xte', 'brg'] });
  out.push({ tipo: 'traslado-demora', caso: 'simultaneas', resaltar: 'distancia' });
  return out;
}

test('láminas de carta: todas las variantes se dibujan', () => {
  for (const s of variantes()) {
    const r = LAMINAS[s.tipo].fn(s);
    assert.ok(r, JSON.stringify(s));
    assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), JSON.stringify(s));
    assert.ok(!/NaN|undefined|null/.test(r.svg), JSON.stringify(s));
    assert.ok(r.caption && r.caption.length > 10, JSON.stringify(s));
  }
});

test('cifras de las lecciones', () => {
  assert.match(LAMINAS.estima.fn({ tipo: 'estima' }).svg, /13,5 millas/);
  assert.match(LAMINAS.estima.fn({ tipo: 'estima' }).svg, /294°/);
  assert.match(LAMINAS.estima.fn({ tipo: 'estima', rv: 110, v: 7.2, hi: '08:00', hf: '10:30' }).svg, /18,0 millas/);
  assert.match(LAMINAS['traslado-demora'].fn({ tipo: 'traslado-demora' }).svg, /4 M/);
  assert.match(LAMINAS.tangente.fn({ tipo: 'tangente', banda: 'babor' }).svg, /14,5°.*019°/);
  assert.match(LAMINAS.gnss.fn({ tipo: 'gnss' }).svg, /13:20/);
  assert.equal(LAMINAS.tangente.fn({ tipo: 'tangente', D: 2, d: 3 }), null);
  assert.equal(LAMINAS.gnss.fn({ tipo: 'gnss', resaltar: 'inventada' }), null);
});

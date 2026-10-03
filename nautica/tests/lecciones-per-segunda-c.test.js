import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS, cuadrantalACircular } from '../src/illustrations/lecciones/per-segunda-c.js';
import { CATALOGO } from '../src/illustrations/index.js';

/** Todas las variantes: el ejemplo y cada valor de cada parámetro con lista, más algunos casos límite. */
function variantes() {
  const out = [];
  for (const [, { params, ejemplo }] of Object.entries(LAMINAS)) {
    out.push(ejemplo);
    for (const [k, vals] of Object.entries(params)) if (Array.isArray(vals)) for (const v of vals) out.push({ ...ejemplo, [k]: v });
  }
  out.push({ tipo: 'mar-crece', resaltar: ['intensidad', 'fetch'] }, { tipo: 'mar-crece', vista: 'viento-fondo' });
  out.push({ tipo: 'declinacion-anual', dm: 60, anio: 2015, variacion: 5, actual: 2026 }, { tipo: 'declinacion-anual', dm: -30, anio: 2006, variacion: 6, actual: 2026 }, { tipo: 'declinacion-anual', dm: -150, anio: 2026, variacion: 9, actual: 2026 }, { tipo: 'declinacion-anual', dm: 0, anio: 2020, variacion: -7, actual: 2026 });
  out.push({ tipo: 'rumbo-cuadrantal', rumbo: 'S76W' }, { tipo: 'rumbo-cuadrantal', rumbo: 'N0E' }, { tipo: 'rumbo-cuadrantal', rumbo: 'S90E' });
  for (const [r, m] of [[200, 120], [130, -90], [300, 70], [10, 30], [0, 180], [359, -180]]) out.push({ tipo: 'demora-marcacion', rumbo: r, marcacion: m });
  out.push({ tipo: 'calidad-corte', angulo: 10 }, { tipo: 'calidad-corte', angulo: 45, resaltar: ['buena', 'mala'] });
  return out;
}

test('láminas per-segunda-c: todas las variantes se dibujan', () => {
  for (const s of variantes()) {
    const r = LAMINAS[s.tipo].fn(s);
    assert.ok(r, JSON.stringify(s));
    assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), JSON.stringify(s));
    assert.ok(!/NaN|undefined|null|Infinity/.test(r.svg), JSON.stringify(s));
    assert.ok(r.caption && r.caption.length > 10, JSON.stringify(s));
  }
});

test('parámetros inválidos devuelven null', () => {
  assert.equal(LAMINAS['mar-crece'].fn({ tipo: 'mar-crece', resaltar: 'altura' }), null);
  assert.equal(LAMINAS['mar-crece'].fn({ tipo: 'mar-crece', vista: 'otra' }), null);
  assert.equal(LAMINAS['declinacion-anual'].fn({ tipo: 'declinacion-anual', anio: 2026, actual: 2016 }), null);
  assert.equal(LAMINAS['declinacion-anual'].fn({ tipo: 'declinacion-anual', dm: 1.5 }), null);
  assert.equal(LAMINAS['rumbo-cuadrantal'].fn({ tipo: 'rumbo-cuadrantal', rumbo: 'E45N' }), null);
  assert.equal(LAMINAS['rumbo-cuadrantal'].fn({ tipo: 'rumbo-cuadrantal', rumbo: 'N95E' }), null);
  assert.equal(LAMINAS['demora-marcacion'].fn({ tipo: 'demora-marcacion', rumbo: 400, marcacion: 20 }), null);
  assert.equal(LAMINAS['demora-marcacion'].fn({ tipo: 'demora-marcacion', rumbo: 40, marcacion: 200 }), null);
  assert.equal(LAMINAS['demora-marcacion'].fn({ tipo: 'demora-marcacion', resaltar: 'rumbo' }), null);
  assert.equal(LAMINAS['calidad-corte'].fn({ tipo: 'calidad-corte', angulo: 80 }), null);
  assert.equal(LAMINAS['calidad-corte'].fn({ tipo: 'calidad-corte', resaltar: 'regular' }), null);
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
  // per-9-6
  const mc = LAMINAS['mar-crece'].fn({ tipo: 'mar-crece' }).svg;
  assert.match(mc, /= fuerza del viento/);
  assert.match(mc, /= tiempo soplando igual/);
  assert.match(mc, /extensión \(espacio\) de mar/);
  assert.match(mc, /totalmente desarrollada/);
  const vf = LAMINAS['mar-crece'].fn({ tipo: 'mar-crece', vista: 'viento-fondo' }).svg;
  assert.match(vf, /cresta puntiaguda/);
  assert.match(vf, /cresta redondeada/);
  assert.match(vf, /mar de leva/);
  // per-10-5: 2° 30′ W en 2016, 9′ E anual → 1° W en 2026.
  const da = LAMINAS['declinacion-anual'].fn(LAMINAS['declinacion-anual'].ejemplo);
  assert.match(da.svg, /2026 − 2016 = 10/);
  assert.match(da.svg, /10 × 9′ E = 90′ = 1° 30′ E/);
  assert.match(da.svg, /−2° 30′ \+ 1° 30′ = −1°/);
  assert.match(da.svg, />1° W</);
  // per-10-6
  for (const [q, c] of [['S65E', 115], ['S45W', 225], ['N64W', 296], ['N20E', 20], ['N70W', 290], ['S76W', 256]]) assert.equal(cuadrantalACircular(q).circ, c, q);
  assert.match(LAMINAS['rumbo-cuadrantal'].fn({ tipo: 'rumbo-cuadrantal', rumbo: 'N64W' }).svg, /360° − 64° = 296°/);
  // per-11-5
  assert.match(LAMINAS['demora-marcacion'].fn({ tipo: 'demora-marcacion', rumbo: 70, marcacion: -100 }).svg, /−30° → 330°/);
  assert.match(LAMINAS['demora-marcacion'].fn({ tipo: 'demora-marcacion', rumbo: 200, marcacion: 120 }).svg, /= 320°/);
  assert.match(LAMINAS['demora-marcacion'].fn({ tipo: 'demora-marcacion', rumbo: 130, marcacion: -90 }).svg, /= 040°/);
  // per-11-6
  assert.match(LAMINAS['calidad-corte'].fn({ tipo: 'calidad-corte' }).svg, /corte cerca de 90°/);
});

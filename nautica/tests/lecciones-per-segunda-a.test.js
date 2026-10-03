import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS } from '../src/illustrations/lecciones/per-segunda-a.js';
import { CATALOGO } from '../src/illustrations/index.js';

/** Todas las variantes: el ejemplo y cada valor de cada parámetro con lista. */
function variantes() {
  const out = [];
  for (const [, { params, ejemplo }] of Object.entries(LAMINAS)) {
    out.push(ejemplo);
    for (const [k, vals] of Object.entries(params)) if (Array.isArray(vals)) for (const v of vals) out.push({ ...ejemplo, [k]: v });
  }
  out.push({ tipo: 'muerto-boya', resaltar: ['muerto', 'cadena', 'boya'] }, { tipo: 'muerto-boya', resaltar: ['chicote', 'firme', 'seno', 'gaza'] });
  out.push({ tipo: 'reflector-tormenta', vista: 'tormenta' });
  out.push({ tipo: 'dotacion-zonas', resaltar: ['chaleco', 'aro'], zona: 4 });
  for (const p of ['inodoro', 'tanque', 'conexion', 'valvula', 'bomba']) out.push({ tipo: 'tanque-retencion', vista: 'puerto', resaltar: p });
  out.push({ tipo: 'tanque-retencion', vista: 'puerto', resaltar: ['tanque', 'conexion'] }, { tipo: 'tanque-retencion', vista: 'mar' });
  return out;
}

test('láminas per-segunda-a: todas las variantes se dibujan', () => {
  for (const s of variantes()) {
    const r = LAMINAS[s.tipo].fn(s);
    assert.ok(r, JSON.stringify(s));
    assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), JSON.stringify(s));
    assert.ok(!/NaN|undefined|null/.test(r.svg), JSON.stringify(s));
    assert.ok(r.caption && r.caption.length > 10, JSON.stringify(s));
  }
});

test('parámetros inválidos devuelven null', () => {
  assert.equal(LAMINAS['muerto-boya'].fn({ tipo: 'muerto-boya', resaltar: 'ancla' }), null);
  assert.equal(LAMINAS['reflector-tormenta'].fn({ tipo: 'reflector-tormenta', vista: 'x' }), null);
  assert.equal(LAMINAS['dotacion-zonas'].fn({ tipo: 'dotacion-zonas', zona: 8 }), null);
  assert.equal(LAMINAS['dotacion-zonas'].fn({ tipo: 'dotacion-zonas', resaltar: 'bengala' }), null);
  assert.equal(LAMINAS['tanque-retencion'].fn({ tipo: 'tanque-retencion', vista: 'rio' }), null);
  assert.equal(LAMINAS['tanque-retencion'].fn({ tipo: 'tanque-retencion', vista: 'mar', resaltar: 'tanque' }), null);
  assert.equal(LAMINAS['marpol-basuras'].fn({ tipo: 'marpol-basuras', zona: 'baltico' }), null);
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
  const dz = LAMINAS['dotacion-zonas'].fn({ tipo: 'dotacion-zonas' }).svg;
  for (const n of ['275 N', '150 N', '100 N', '2 aros', '1 aro', 'y rabiza', 'para todos']) assert.match(dz, new RegExp(n));
  const tm = LAMINAS['tanque-retencion'].fn({ tipo: 'tanque-retencion', vista: 'mar' }).svg;
  for (const n of ['&gt; 3 mn|> 3 mn', '&gt; 12 mn|> 12 mn', '4 nudos', 'línea de base']) assert.match(tm, new RegExp(n));
  assert.match(LAMINAS['tanque-retencion'].fn({ tipo: 'tanque-retencion' }).svg, /conexión universal/);
  const mb = LAMINAS['marpol-basuras'].fn({ tipo: 'marpol-basuras' }).svg;
  for (const n of ["5° 36' W", 'a más de 3 mn', 'a más de 12 mn', '25 mm', 'Trafalgar', 'Málaga']) assert.match(mb, new RegExp(n));
  const mu = LAMINAS['muerto-boya'].fn({ tipo: 'muerto-boya' }).svg;
  for (const n of ['muerto', 'cadena', 'boya', 'gaza', 'firme', 'seno', 'chicote']) assert.match(mu, new RegExp(`>${n}<`));
  assert.match(LAMINAS['reflector-tormenta'].fn({ tipo: 'reflector-tormenta' }).svg, /RD 339\/2021/);
  assert.match(LAMINAS['reflector-tormenta'].fn({ tipo: 'reflector-tormenta', vista: 'tormenta' }).svg, /desvío anómalo/);
});

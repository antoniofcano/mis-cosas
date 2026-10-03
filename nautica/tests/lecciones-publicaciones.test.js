import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS } from '../src/illustrations/lecciones/publicaciones.js';

/** Todas las variantes: el ejemplo, cada valor de cada lista y los casos que combinan vista y resaltar. */
export function variantes() {
  const out = [];
  for (const { params, ejemplo } of Object.values(LAMINAS)) {
    out.push(ejemplo);
    for (const [k, vals] of Object.entries(params)) if (Array.isArray(vals) && k !== 'resaltar') for (const v of vals) out.push({ ...ejemplo, [k]: v });
  }
  for (const r of ['latitud', 'longitud', 'divisiones']) out.push({ tipo: 'carta-margenes', resaltar: r });
  out.push({ tipo: 'transportador', caso: 'rumbo', rv: 230 }, { tipo: 'transportador', caso: 'rumbo', rv: 0 }, { tipo: 'transportador', caso: 'rumbo', rv: 140 }, { tipo: 'transportador', caso: 'rumbo', rv: 315 });
  out.push({ tipo: 'transportador', caso: 'faro', dv: 45 }, { tipo: 'transportador', caso: 'faro', dv: 180 });
  for (const r of ['permanentes', 'temporales', 'preliminares', 'generales', 'margen']) out.push({ tipo: 'avisos-navegantes', vista: 'correccion', resaltar: r });
  for (const r of ['navarea', 'navtex', 'vhf']) out.push({ tipo: 'avisos-navegantes', vista: 'radioavisos', resaltar: r });
  out.push({ tipo: 'avisos-navegantes', vista: 'correccion', resaltar: ['temporales', 'preliminares'] });
  return out;
}

test('láminas de publicaciones: todas las variantes se dibujan', () => {
  for (const s of variantes()) {
    const r = LAMINAS[s.tipo].fn(s);
    assert.ok(r, JSON.stringify(s));
    assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), JSON.stringify(s));
    assert.ok(!/NaN|undefined|null/.test(r.svg), JSON.stringify(s));
    assert.ok(r.caption && r.caption.length > 10, JSON.stringify(s));
  }
});

test('cifras de las lecciones', () => {
  const cm = LAMINAS['carta-margenes'].fn({ tipo: 'carta-margenes' });
  assert.match(cm.svg, /36° 07,3′ N/);
  assert.match(cm.svg, /005° 58,6′ W/);
  assert.match(cm.svg, /0,2′/);
  const f = LAMINAS.transportador.fn({ tipo: 'transportador', caso: 'faro' });
  assert.match(f.svg, /310°/);
  assert.match(f.svg, /130°/);
  assert.match(LAMINAS.transportador.fn({ tipo: 'transportador', rv: 75 }).svg, /075°/);
  const rd = LAMINAS['avisos-navegantes'].fn({ tipo: 'avisos-navegantes', vista: 'radioavisos' }).svg;
  for (const x of ['518 kHz', '490 kHz', 'III', '21 zonas', 'SÉCURITÉ']) assert.ok(rd.includes(x), x);
  const co = LAMINAS['avisos-navegantes'].fn({ tipo: 'avisos-navegantes', vista: 'correccion' }).svg;
  for (const x of ['tinta indeleble', 'A lápiz', 'No corrigen', 'margen inferior']) assert.ok(co.includes(x), x);
  assert.equal(LAMINAS['carta-margenes'].fn({ tipo: 'carta-margenes', resaltar: 'inventada' }), null);
  assert.equal(LAMINAS.transportador.fn({ tipo: 'transportador', caso: 'otro' }), null);
  assert.equal(LAMINAS['avisos-navegantes'].fn({ tipo: 'avisos-navegantes', vista: 'correccion', resaltar: 'navtex' }), null);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS } from '../src/illustrations/lecciones/per-segunda-b.js';
import { CATALOGO } from '../src/illustrations/index.js';

/** Todas las variantes válidas: el ejemplo, cada vista y cada parte resaltable dentro de la vista que la admite. */
function variantes() {
  const out = [];
  for (const [, { params, ejemplo }] of Object.entries(LAMINAS)) {
    out.push(ejemplo);
    for (const [k, vals] of Object.entries(params)) if (Array.isArray(vals) && k !== 'resaltar') for (const v of vals) out.push({ ...ejemplo, [k]: v });
  }
  for (const r of LAMINAS['pabellon-obligatorio'].params.resaltar) out.push({ tipo: 'pabellon-obligatorio', resaltar: r });
  out.push({ tipo: 'pabellon-obligatorio', resaltar: ['guerra', 'puerto'] });
  for (const r of ['gobierno', 'arrancada']) out.push({ tipo: 'gobierno-rabeo', vista: 'gobierno', resaltar: r });
  for (const b of ['er', 'br']) for (const r of ['exterior', 'interior', 'ciaboga']) out.push({ tipo: 'ciaboga-dos-helices', banda: b, resaltar: r });
  for (const r of LAMINAS['achique-sentina'].params.resaltar) out.push({ tipo: 'achique-sentina', resaltar: r });
  for (const r of ['mercurio', 'aneroide']) out.push({ tipo: 'barometro-tendencia', vista: 'instrumentos', resaltar: r });
  for (const r of ['subida', 'bajada-lenta', 'bajada-rapida', 'estable']) out.push({ tipo: 'barometro-tendencia', vista: 'tendencia', resaltar: r });
  return out;
}

test('láminas per-segunda-b: todas las variantes se dibujan', () => {
  for (const s of variantes()) {
    const r = LAMINAS[s.tipo].fn(s);
    assert.ok(r, JSON.stringify(s));
    assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), JSON.stringify(s));
    assert.ok(!/NaN|undefined|null/.test(r.svg), JSON.stringify(s));
    assert.ok(r.caption && r.caption.length > 10, JSON.stringify(s));
  }
});

test('specs inválidas devuelven null', () => {
  assert.equal(LAMINAS['pabellon-obligatorio'].fn({ tipo: 'pabellon-obligatorio', resaltar: 'popa' }), null);
  assert.equal(LAMINAS['gobierno-rabeo'].fn({ tipo: 'gobierno-rabeo', vista: 'curva' }), null);
  assert.equal(LAMINAS['ciaboga-dos-helices'].fn({ tipo: 'ciaboga-dos-helices', banda: 'proa' }), null);
  assert.equal(LAMINAS['achique-sentina'].fn({ tipo: 'achique-sentina', resaltar: 'helice' }), null);
  assert.equal(LAMINAS['barometro-tendencia'].fn({ tipo: 'barometro-tendencia', vista: 'instrumentos', resaltar: 'subida' }), null);
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
  const p = LAMINAS['pabellon-obligatorio'].fn({ tipo: 'pabellon-obligatorio' }).svg;
  for (const s of ['buque de guerra', 'entrar y salir', 'de sol a sol', 'autoridad', '1/3 de su área']) assert.match(p, new RegExp(s));
  const c = LAMINAS['ciaboga-dos-helices'].fn({ tipo: 'ciaboga-dos-helices', banda: 'br' }).svg;
  assert.match(c, /babor atrás/);
  assert.match(c, /estribor avante/);
  const a = LAMINAS['achique-sentina'].fn({ tipo: 'achique-sentina' }).svg;
  for (const s of ['RD 339/2021', 'bomba de motor \\+ manual \\+ 2 baldes', 'bomba manual o eléctrica \\+ 1 balde', '5 litros']) assert.match(a, new RegExp(s));
  const b = LAMINAS['barometro-tendencia'].fn({ tipo: 'barometro-tendencia' }).svg;
  for (const s of ['760', '1013,25 hPa', 'elásticas', 'con vacío', 'capilar']) assert.match(b, new RegExp(s));
  // la bajada rápida, sin umbral en hPa: no hay fuente oficial a mano que lo fije (cierre del PER)
  assert.match(LAMINAS['barometro-tendencia'].fn({ tipo: 'barometro-tendencia', vista: 'tendencia' }).svg, />Bajada rápida</);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fitAffine } from '../src/graphics/georef.js';

const cal = JSON.parse(readFileSync(new URL('../data/carta-l105-calibracion.json', import.meta.url)));

test('calibración del escaneo L105: residuo < 10 px (≈ 0,1′)', () => {
  const g = fitAffine(cal.controlPoints);
  assert.ok(g.residual < 10, `residuo ${g.residual}`);
  // Ida y vuelta
  const p = { lat: 36.0013, lon: -5.6083 };
  const q = g.toGeo(g.toPixel(p));
  assert.ok(Math.abs(q.lat - p.lat) < 1e-9 && Math.abs(q.lon - p.lon) < 1e-9);
  // ~89 px por minuto de longitud
  const a = g.toPixel({ lat: 36, lon: -6 });
  const b = g.toPixel({ lat: 36, lon: -6 + 1 / 60 });
  assert.ok(Math.abs(b.x - a.x - 88.75) < 0.5);
});

import { extractJpegFromPdf, adaptCalibration } from '../src/store/user-chart.js';

test('extrae el JPEG incrustado de un PDF', async () => {
  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]);
  const head = new TextEncoder().encode('%PDF-1.4\n4 0 obj\n<< /Filter /DCTDecode /Length 9 >>\nstream\n');
  const tail = new TextEncoder().encode('\nendstream\nendobj\n%%EOF');
  const pdf = new Uint8Array([...head, ...jpeg, ...tail]);
  const blob = extractJpegFromPdf(pdf);
  assert.deepEqual([...new Uint8Array(await blob.arrayBuffer())], [...jpeg]);
});

test('adapta la calibración a otra resolución del mismo escaneo', () => {
  const half = adaptCalibration(cal, cal.image.width / 2, cal.image.height / 2);
  assert.equal(half[0].px, cal.controlPoints[0].px / 2);
  assert.equal(adaptCalibration(cal, 1000, 1000), null);
});

import { rasterMatrix } from '../src/graphics/georef.js';
import { toWorld, S } from '../src/graphics/chart-renderer.js';

test('la matriz del escaneo lleva el píxel de un punto a su coordenada mundo', () => {
  const g = fitAffine(cal.controlPoints);
  const [A, B, C, D, E, F] = rasterMatrix(g, S);
  const geo = { lat: 35.9, lon: -5.3 };
  const px = g.toPixel(geo);
  const w = toWorld(geo);
  assert.ok(Math.abs(A * px.x + C * px.y + E - w.x) < 1e-6);
  assert.ok(Math.abs(B * px.x + D * px.y + F - w.y) < 1e-6);
});

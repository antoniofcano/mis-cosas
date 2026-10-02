import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tideHeight, timeForHeight, twelfthsFraction } from '../src/nautical/tides.js';
import { deadReckoning } from '../src/nautical/sailing.js';
import { rhumbDestination } from '../src/math/mercator.js';

const near = (a, b, e = 1e-6) => assert.ok(Math.abs(a - b) < e, `${a} ≉ ${b}`);

test('mareas: curva cosenoidal y su inversa', () => {
  const bm = { t: 0, h: 0.5 };
  const pm = { t: 360, h: 2.9 };
  near(tideHeight(bm, pm, 0), 0.5);
  near(tideHeight(bm, pm, 180), 1.7);
  near(tideHeight(bm, pm, 360), 2.9);
  near(timeForHeight(bm, pm, tideHeight(bm, pm, 97)), 97);
  near(timeForHeight(pm, { t: 730, h: 0.4 }, tideHeight(pm, { t: 730, h: 0.4 }, 500)), 500);
  assert.equal(timeForHeight(bm, pm, 3.5), null);
  near(twelfthsFraction(3), 0.5);
  near(twelfthsFraction(6), 1);
});

test('estima analítica ≈ loxodrómica exacta en distancias cortas', () => {
  const start = { lat: 36, lon: -6 };
  const r = deadReckoning(start, [{ rv: 70, dist: 20 }, { rv: 150, dist: 12 }]);
  const exact = rhumbDestination(rhumbDestination(start, 70, 20), 150, 12);
  near(r.end.lat, exact.lat, 0.05 / 60);
  near(r.end.lon, exact.lon, 0.1 / 60);
});

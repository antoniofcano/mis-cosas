import { test } from 'node:test';
import assert from 'node:assert/strict';
import { norm360, norm180, angleDiff } from '../src/math/angles.js';
import { rhumbTo, rhumbDestination } from '../src/math/mercator.js';
import { parseAngle, fmtLat, fmtLon, fmtBearing, parseClock, parseDuration } from '../src/math/format.js';
import { effectiveCourse, courseToSteer } from '../src/nautical/kinematics.js';
import { correccionTotal, rvFromRa, raFromRv, signedAnnualChange } from '../src/nautical/compass.js';
import { fixTwoBearings, fixRunning } from '../src/nautical/positioning.js';

const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

test('normalización de ángulos', () => {
  assert.equal(norm360(-10), 350);
  assert.equal(norm360(370), 10);
  assert.equal(norm180(270), -90);
  assert.equal(angleDiff(10, 350), 20);
});

test('loxodrómica ida y vuelta', () => {
  const a = { lat: 36, lon: -5.6 };
  const b = rhumbDestination(a, 123, 10);
  const r = rhumbTo(a, b);
  near(r.bearing, 123, 1e-6);
  near(r.distance, 10, 1e-6);
  const c = rhumbDestination(a, 0, 6);
  near((c.lat - a.lat) * 60, 6);
  const e = rhumbDestination(a, 90, 6);
  near(rhumbTo(a, e).distance, 6, 1e-6);
});

test('lectura y formato de coordenadas', () => {
  near(parseAngle("36° 05,5' N"), 36 + 5.5 / 60);
  near(parseAngle('5 36,5 W'), -(5 + 36.5 / 60));
  near(parseAngle('-3'), -3);
  near(parseAngle('3 W'), -3);
  near(parseAngle('2,5 E'), 2.5);
  assert.ok(Number.isNaN(parseAngle('abc')));
  assert.equal(fmtLat(36 + 5.55 / 60), "36° 05,6' N");
  assert.equal(fmtLon(-(5 + 36.04 / 60)), "005° 36,0' W");
  assert.equal(fmtBearing(359.7), '000°');
  assert.equal(parseClock('14:35'), 875);
  near(parseDuration('1h25'), 1 + 25 / 60);
  near(parseDuration('85 min'), 85 / 60);
});

test('aguja: Ct, Rv, Ra', () => {
  const ct = correccionTotal(-3, 5); // 3W, +5
  assert.equal(ct, 2);
  assert.equal(rvFromRa(359, ct), 1);
  assert.equal(raFromRv(1, ct), 359);
  near(signedAnnualChange(-3, 7, 'disminuye'), 7 / 60);
  near(signedAnnualChange(-3, 7, 'aumenta'), -7 / 60);
});

test('corrientes: triángulo de velocidades coherente', () => {
  const { ref, vef } = effectiveCourse(90, 6, 180, 2);
  near(ref, 90 + (Math.atan2(2, 6) * 180) / Math.PI, 1e-9);
  near(vef, Math.hypot(6, 2), 1e-9);
  const s = courseToSteer(ref, 6, 180, 2);
  near(s.rs, 90, 1e-9);
  near(s.vef, vef, 1e-9);
  assert.equal(courseToSteer(0, 1, 180, 3), null);
});

test('situación por dos demoras y no simultáneas', () => {
  const ship = { lat: 35.95, lon: -5.55 };
  const A = { lat: 36.0013, lon: -5.6083 };
  const B = { lat: 35.9117, lon: -5.4817 };
  const fix = fixTwoBearings(A, rhumbTo(ship, A).bearing, B, rhumbTo(ship, B).bearing);
  near(fix.lat, ship.lat, 1e-9);
  near(fix.lon, ship.lon, 1e-9);
  const ship2 = rhumbDestination(ship, 70, 4);
  const r = fixRunning(A, rhumbTo(ship, A).bearing, B, rhumbTo(ship2, B).bearing, 70, 4);
  near(r.fix.lat, ship2.lat, 1e-4);
  near(r.fix.lon, ship2.lon, 1e-4);
});

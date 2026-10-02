// Funciones puras que usan las láminas interactivas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { correccionTotal, signoCt, ewTexto, marcacionBanda } from '../src/nautical/compass.js';

test('signo de la corrección total en las cuatro combinaciones E/W', () => {
  // dm W, Δ E: gana el mayor
  assert.equal(signoCt(correccionTotal(-4, 2)), 'negativa');
  assert.equal(signoCt(correccionTotal(-2, 3)), 'positiva');
  // dm E, Δ W
  assert.equal(signoCt(correccionTotal(3, -5)), 'negativa');
  assert.equal(signoCt(correccionTotal(3, -2)), 'positiva');
  // los dos E / los dos W
  assert.equal(signoCt(correccionTotal(3, 2)), 'positiva');
  assert.equal(signoCt(correccionTotal(-3, -2)), 'negativa');
  // se anulan
  assert.equal(signoCt(correccionTotal(-3, 3)), 'cero');
  assert.equal(ewTexto(-4), '4° W');
  assert.equal(ewTexto(2), '2° E');
  assert.equal(ewTexto(0), '0°');
});

test('marcación por banda', () => {
  assert.deepEqual(marcacionBanda(120, 30), { grados: 90, banda: 'estribor' });
  assert.deepEqual(marcacionBanda(50, 110), { grados: 60, banda: 'babor' });
  assert.deepEqual(marcacionBanda(83, 135), { grados: 52, banda: 'babor' });
  assert.deepEqual(marcacionBanda(10, 350), { grados: 20, banda: 'estribor' }); // cruza el norte
  assert.deepEqual(marcacionBanda(30, 30), { grados: 0, banda: 'proa' });
  assert.deepEqual(marcacionBanda(210, 30), { grados: 180, banda: 'popa' });
});

import { cadenaDirecta, cadenaInversa, ladoDe } from '../src/nautical/kinematics.js';

test('cadena verdadero → superficie → efectivo y su inversa', () => {
  // solo viento: Rs = Rv + Ab (babor +, estribor −)
  assert.deepEqual(cadenaDirecta({ rv: 40, vb: 6, ab: 10 }), { rv: 40, rs: 50, ref: 50, vef: 6 });
  assert.equal(cadenaDirecta({ rv: 40, vb: 6, ab: -10 }).rs, 30);
  assert.equal(cadenaDirecta({ rv: 355, vb: 6, ab: 10 }).rs, 5); // cruza el norte
  // corriente de proa a popa: no cambia el rumbo, resta velocidad
  const contra = cadenaDirecta({ rv: 90, vb: 6, rc: 270, ic: 2 });
  assert.ok(Math.abs(contra.ref - 90) < 1e-9 && Math.abs(contra.vef - 4) < 1e-9);
  // corriente por el través de estribor: el efectivo cae a estribor
  const traves = cadenaDirecta({ rv: 0, vb: 6, rc: 90, ic: 2 });
  assert.ok(Math.abs(traves.ref - (Math.atan2(2, 6) * 180) / Math.PI) < 1e-9);
  assert.equal(ladoDe(traves.ref, traves.rs), 'estribor');
  // viento y corriente a la vez, ida y vuelta: la inversa devuelve el Rv de partida
  for (const p of [{ rv: 40, ab: 10, rc: 120, ic: 2.5 }, { rv: 200, ab: -7, rc: 10, ic: 3 }, { rv: 359, ab: 5, rc: 270, ic: 1.5 }]) {
    const d = cadenaDirecta({ ...p, vb: 6 });
    const i = cadenaInversa({ ref: d.ref, vb: 6, ab: p.ab, rc: p.rc, ic: p.ic });
    assert.ok(Math.abs(((i.rv - p.rv + 540) % 360) - 180) < 1e-6, JSON.stringify(p));
    assert.ok(Math.abs(i.vef - d.vef) < 1e-6);
  }
  // inversa sin corriente: el rumbo a dar es el del destino menos el abatimiento
  assert.deepEqual(cadenaInversa({ ref: 50, vb: 6, ab: 10 }), { rv: 40, rs: 50, ref: 50, vef: 6 });
  // corriente más fuerte que el barco y en contra: imposible
  assert.equal(cadenaInversa({ ref: 0, vb: 3, rc: 180, ic: 5 }), null);
  assert.equal(ladoDe(10, 10), 'igual');
});

import { lucesVisibles, situacionPorLuces } from '../src/nautical/luces.js';
test('sectores de las luces (Regla 21), con los límites a 112,5° y 247,5°', () => {
  const v = (a) => Object.entries(lucesVisibles(a)).filter(([, x]) => x).map(([k]) => k).join('+');
  assert.equal(v(0), 'tope+verde+roja'); // de proa: las dos de costado
  assert.equal(v(2), 'tope+verde+roja'); // solape práctico de hasta 3° (Anexo I)
  assert.equal(v(10), 'tope+verde');
  assert.equal(v(112.5), 'tope+verde'); // aún no alcanza: Regla 13 b) pide más de 22,5° a popa del través
  assert.equal(v(112.6), 'alcance');
  assert.equal(v(180), 'alcance');
  assert.equal(v(247.4), 'alcance');
  assert.equal(v(247.5), 'tope+roja');
  assert.equal(v(350), 'tope+roja');
  assert.equal(v(-10), 'tope+roja'); // −10 = 350
});

test('situación por las luces que ves: quién maniobra', () => {
  const s = (a) => situacionPorLuces(lucesVisibles(a));
  assert.deepEqual([s(0).situacion, s(0).maniobra], ['vuelta-encontrada', 'los-dos']);
  assert.deepEqual([s(180).situacion, s(180).maniobra], ['alcance', 'tu']);
  assert.deepEqual([s(60).situacion, s(60).maniobra], ['cruce', 'el']); // ves su verde
  assert.deepEqual([s(300).situacion, s(300).maniobra], ['cruce', 'tu']); // ves su roja
});

import { estabilidad, BARCO } from '../src/nautical/estabilidad.js';
test('estabilidad: subir peso reduce GM; con GM ≤ 0 deja de adrizar; trasladar a la banda alta ayuda', () => {
  const bajo = estabilidad({ altura: 0.5 });
  const alto = estabilidad({ altura: 3 });
  assert.ok(alto.KG > bajo.KG && alto.GM < bajo.GM && alto.GZ < bajo.GZ);
  // cambio de adrizar a volcar justo en la altura crítica (GM = 0)
  const h = estabilidad({ altura: 0 }).alturaCritica;
  assert.ok(Math.abs(estabilidad({ altura: h }).GM) < 1e-12);
  assert.equal(estabilidad({ altura: h - 0.01 }).adriza, true);
  assert.equal(estabilidad({ altura: h + 0.01 }).adriza, false);
  assert.equal(estabilidad({ altura: h + 0.01 }).estable, false);
  // escorado a estribor: el peso a babor (banda alta) aumenta el brazo; a estribor lo reduce
  const centro = estabilidad({ altura: 1.5 });
  assert.ok(estabilidad({ altura: 1.5, traslado: -2 }).GZ > centro.GZ);
  assert.ok(estabilidad({ altura: 1.5, traslado: 2 }).GZ < centro.GZ);
  // GG' = w·d / D
  assert.ok(Math.abs(estabilidad({ altura: 1.5, traslado: 2 }).GGt - (BARCO.w * 2) / BARCO.D) < 1e-12);
});

import { caidaPopa } from '../src/nautical/helice.js';
test('caída de la popa en las ocho combinaciones de marcha, giro y timón (y con el timón a la vía)', () => {
  const c = (marcha, sentido, timon) => caidaPopa({ marcha, sentido, timon }).popa;
  // timón a la vía: solo la hélice (dextrógira avante → Er; atrás → Br; levógira al revés)
  assert.equal(c('avante', 'dextrogira', 'via'), 'estribor');
  assert.equal(c('atras', 'dextrogira', 'via'), 'babor');
  assert.equal(c('avante', 'levogira', 'via'), 'babor');
  assert.equal(c('atras', 'levogira', 'via'), 'estribor');
  // avante: manda el timón (timón a Er → popa a Br)
  assert.equal(c('avante', 'dextrogira', 'er'), 'babor');
  assert.equal(c('avante', 'dextrogira', 'br'), 'estribor');
  assert.equal(c('avante', 'levogira', 'er'), 'babor');
  assert.equal(c('avante', 'levogira', 'br'), 'estribor');
  // atrás: la popa va a la banda del timón; si se opone, manda la hélice
  assert.equal(c('atras', 'dextrogira', 'br'), 'babor'); // se suman
  assert.equal(c('atras', 'dextrogira', 'er'), 'babor'); // se oponen: hélice
  assert.equal(c('atras', 'levogira', 'er'), 'estribor'); // se suman
  assert.equal(c('atras', 'levogira', 'br'), 'estribor'); // se oponen: hélice
  assert.equal(caidaPopa({ marcha: 'atras', sentido: 'dextrogira', timon: 'br' }).dominante, 'ambos');
  assert.equal(caidaPopa({ marcha: 'avante', sentido: 'dextrogira', timon: 'er' }).dominante, 'timon');
  assert.equal(caidaPopa({ marcha: 'atras', sentido: 'dextrogira', timon: 'er' }).proa, 'estribor');
});

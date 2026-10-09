// Ejercicios de carta resueltos paso a paso (src/course/carta-pasos.js y su dibujo src/illustrations/carta-pasos-c.js):
// cada cifra del ejemplo coincide con los motores de la app y con la geometría (la situación cumple las demoras y las
// distancias del enunciado), los pasos están completos y los dibujos cumplen el estilo C.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createChart } from '../src/chart/chart.js';
import { tiposCarta, tipoCarta, tiposDeTit, TIPO_DE_CONCEPTO, TIPO_DE_EJERCICIO, TITULO_TIPO, CATEGORIAS_PASOS } from '../src/course/carta-pasos.js';
import { figuraPaso, altPaso } from '../src/illustrations/carta-pasos-c.js';
import { rhumbTo, rhumbDestination } from '../src/math/mercator.js';
import { angleDist, norm360, toDeg } from '../src/math/angles.js';
import { fmtBearing, fmtLat, fmtLon } from '../src/math/format.js';
import { fixTwoBearings, fixTwoRanges, closestApproach, fixRunning } from '../src/nautical/positioning.js';
import { effectiveCourse, courseToSteer, cadenaInversa, windSide } from '../src/nautical/kinematics.js';
import { deadReckoning } from '../src/nautical/sailing.js';
import { updateDeclination, correccionTotal } from '../src/nautical/compass.js';
import { getExercise } from '../src/exercises/registry.js';

const CSS = readFileSync(new URL('../styles/laminas.css', import.meta.url), 'utf8');
const vars = (desde) => { const i = CSS.indexOf(desde); return Object.fromEntries([...CSS.slice(i, CSS.indexOf('}', i)).matchAll(/--(lc-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])); };
const CLARO = vars(':root {');
const OSCURO = { ...CLARO, ...vars(':root:not([data-theme="light"]) {') };
const chart = createChart(JSON.parse(readFileSync(new URL('../data/chart-105.json', import.meta.url), 'utf8')));
const T = (id) => tipoCarta(chart, id);
const P = (id) => chart.point(id);
/** Todo el texto que ve el alumno en un tipo. */
const textoDe = (t) => [t.enunciado, ...t.pasos.flatMap((p) => [p.titulo, p.regla, p.texto, ...(p.cuenta ?? [])]), ...t.resultado.flatMap((r) => [r.cifra, r.texto]), ...t.datos.flatMap((d) => [d.cifra, d.texto]), ...t.convenios, ...t.trampas.flatMap((x) => [x.error, x.porque])].join('\n');
const cuentas = (t) => t.pasos.flatMap((p) => p.cuenta ?? []).join('\n');
const cerca = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} frente a ${b}`);
const millas = (a, b) => rhumbTo(a, b).distance;

test('carta resuelta: están los tipos del PY y del PER, cada uno con 4–8 pasos completos', () => {
  const ids = tiposCarta(chart).map((t) => t.id);
  for (const id of ['dos-demoras', 'demora-distancia', 'enfilacion', 'estima', 'rumbo-distancia', 'pasar-distancia', 'no-simultaneas', 'corriente-efectiva', 'corriente-rumbo-a-dar', 'corriente-desconocida', 'viento', 'dos-distancias', 'ct-dm-desvio', 'estima-analitica']) assert.ok(ids.includes(id), id);
  assert.equal(new Set(ids).size, ids.length);
  const PICTO = /\p{Extended_Pictographic}/u;
  for (const t of tiposCarta(chart)) {
    assert.ok(t.pasos.length >= 4 && t.pasos.length <= 8, `${t.id}: ${t.pasos.length} pasos`);
    assert.ok(CATEGORIAS_PASOS.some((c) => c.id === t.categoria), t.id);
    assert.equal(TITULO_TIPO[t.id], t.titulo, `${t.id}: TITULO_TIPO al día`);
    for (const p of t.pasos) {
      assert.ok(p.titulo && p.regla && p.texto && p.cuenta?.length, `${t.id}: paso «${p.titulo}» incompleto`);
      assert.ok(p.cuenta.every((c) => c.length <= 60), `${t.id}: cuenta larga en «${p.titulo}»`);
    }
    assert.ok(t.trampas.length >= 2 && t.convenios.length >= 2 && t.resultado.length >= 1, t.id);
    const txt = textoDe(t);
    assert.ok(!/NaN|undefined|null|Infinity/.test(txt), `${t.id}: ${txt.match(/.*(NaN|undefined|null|Infinity).*/)?.[0]}`);
    assert.ok(!PICTO.test(txt), `${t.id}: sin emojis`);
    for (const e of t.ejercicios) assert.ok(getExercise(e), `${t.id}: ejercicio ${e}`);
  }
  // el PER tiene los suyos (sin corrientes, viento ni estima analítica)
  const per = tiposDeTit(chart, 'per').map((t) => t.id);
  assert.ok(per.includes('dos-demoras') && per.includes('ct-dm-desvio') && !per.includes('corriente-efectiva') && !per.includes('estima-analitica'));
});

test('carta resuelta: los enlaces (conceptos y ejercicios) llevan a tipos que existen; los conceptos, a ideas del catálogo', () => {
  const cat = JSON.parse(readFileSync(new URL('../data/conceptos/navegacion.json', import.meta.url), 'utf8'));
  const ids = new Set((Array.isArray(cat) ? cat : cat.conceptos).map((c) => c.id));
  for (const [c, t] of Object.entries(TIPO_DE_CONCEPTO)) { assert.ok(ids.has(c), `concepto ${c}`); assert.ok(T(t), `tipo ${t}`); }
  for (const [e, t] of Object.entries(TIPO_DE_EJERCICIO)) assert.ok(T(t), `${e} → ${t}`);
  // todos los tipos de ejercicio de carta de las soluciones programadas tienen su resuelto (salvo las mareas)
  for (const e of ['situacion-dos-demoras', 'ct-enfilacion', 'estima-directa', 'rumbo-distancia', 'rumbo-pasar-distancia', 'situacion-demora-distancia', 'demoras-no-simultaneas',
    'corriente-efectiva', 'corriente-rumbo-a-dar', 'corriente-desconocida', 'abatimiento', 'situacion-dos-distancias', 'estima-analitica', 'distancia-faro']) assert.ok(TIPO_DE_EJERCICIO[e], e);
  for (const t of tiposCarta(chart)) for (const c of t.conceptos) assert.ok(ids.has(c), `${t.id}: concepto ${c}`);
});

// ---------------------------------------------------------------------------
// Las cifras, contra el motor (y contra la geometría, que no depende de cómo se calcularon)

test('cifras: dos demoras simultáneas', () => {
  const t = T('dos-demoras');
  assert.equal(t.valores.ct, -1);
  assert.deepEqual([t.valores.dvA, t.valores.dvB], [22, 89]);
  const S = fixTwoBearings(P('punta-paloma'), 22, P('isla-tarifa'), 89);
  cerca(rhumbTo(S, P('punta-paloma')).bearing, 22, 1e-6, 'demora a Paloma desde la situación');
  cerca(rhumbTo(S, P('isla-tarifa')).bearing, 89, 1e-6, 'demora a Tarifa desde la situación');
  assert.ok(cuentas(t).includes(fmtLat(S.lat)) && cuentas(t).includes(fmtLon(S.lon)));
  assert.equal(t.resultado[0].cifra, '36° 00,0\' N');
  assert.equal(t.resultado[1].cifra, '005° 45,1\' W');
  assert.ok(cuentas(t).includes('ángulo = 089° − 022° = 67°'));
  assert.ok(chart.isNavigable(S, 0.5));
});

test('cifras: demora y distancia', () => {
  const t = T('demora-distancia');
  assert.equal(t.valores.ct, -3);
  assert.equal(t.valores.dv, 47);
  const S = t.valores.fix;
  cerca(rhumbTo(S, P('cabo-trafalgar')).bearing, 47, 1e-6, 'demora');
  cerca(millas(S, P('cabo-trafalgar')), 6, 1e-6, 'distancia');
  assert.deepEqual(t.resultado.map((r) => r.cifra), ['36° 06,9\' N', '006° 07,5\' W']);
});

test('cifras: enfilación, corrección total, desvío y situación', () => {
  const t = T('enfilacion');
  const v = t.valores;
  cerca(v.dvEnf, rhumbTo(P('punta-europa'), P('punta-carnero')).bearing, 0.05, 'Dv de la enfilación medida en la carta');
  assert.equal(v.dvEnf, 243.5);
  assert.equal(v.ct, -3.5);
  assert.equal(v.desvio, -1.5);
  assert.equal(v.dvA, 181.5);
  // la situación está sobre la enfilación (ve los dos faros en la misma demora) y sobre la demora de Almina
  cerca(rhumbTo(v.fix, P('punta-europa')).bearing, 243.5, 1e-6, 'enfilación: Europa');
  cerca(rhumbTo(v.fix, P('punta-carnero')).bearing, 243.5, 0.06, 'enfilación: Carnero');
  cerca(rhumbTo(v.fix, P('punta-almina')).bearing, 181.5, 1e-6, 'demora a Almina');
  assert.ok(cuentas(t).includes('Ct = 243,5° − 247° = −3,5°') && cuentas(t).includes('Δ = −3,5° − (−2°) = −1,5°'));
  assert.ok(cuentas(t).includes(`d = ${String(Math.round(millas(v.fix, P('punta-europa')) * 10) / 10).replace('.', ',')} M`));
  assert.equal(t.resultado[2].cifra, '3,9 M');
});

test('cifras: corrección total con la declinación de la carta y el desvío', () => {
  const t = T('ct-dm-desvio');
  const dm = updateDeclination(-(2 + 50 / 60), 2005, 7 / 60, 2015);
  cerca(t.valores.dm, dm, 1e-9, 'dm 2015');
  cerca(t.valores.dm * 60, -100, 1e-9, 'dm 2015 en minutos (1° 40′ W)');
  cerca(t.valores.ct, correccionTotal(dm, 3), 1e-9, 'Ct');
  cerca(t.valores.ct * 60, 80, 1e-9, 'Ct en minutos (1° 20′ E)');
  cerca(t.valores.rv, 75 + 80 / 60, 1e-9, 'Rv');
  cerca(t.valores.rv2, t.valores.rv, 1e-9, 'por el magnético sale lo mismo');
  assert.ok(cuentas(t).includes('dm = (−2° 50′) + (+1° 10′) = −1° 40′'));
  assert.ok(cuentas(t).includes('Ct = (−1° 40′) + (+3° 00′) = +1° 20′'));
  assert.ok(cuentas(t).includes('Rv = 075° + 1° 20′ = 076° 20′'));
  assert.ok(cuentas(t).includes('Rv = 078° + (−1° 40′) = 076° 20′'));
});

test('cifras: estima directa', () => {
  const t = T('estima');
  assert.equal(t.valores.rv, 138);
  assert.equal(t.valores.d, 9);
  const se = rhumbDestination({ lat: 36 + 8 / 60, lon: -(6 + 12 / 60) }, 138, 9);
  cerca(millas(t.valores.se, se), 0, 1e-9, 'Se');
  assert.deepEqual(t.resultado.map((r) => r.cifra), [fmtLat(se.lat), fmtLon(se.lon)]);
  assert.ok(chart.isClearPath({ lat: 36 + 8 / 60, lon: -(6 + 12 / 60) }, se));
});

test('cifras: rumbo, distancia y hora de llegada', () => {
  const t = T('rumbo-distancia');
  const m = rhumbTo({ lat: 35 + 53 / 60, lon: -(5 + 34 / 60) }, P('tarifa-espigon'));
  assert.equal(t.valores.rv, Math.round(m.bearing));
  cerca(t.valores.d, m.distance, 0.05, 'distancia medida');
  assert.equal(t.valores.rv, 347);
  assert.equal(t.valores.ra, 350);
  assert.equal(t.valores.d, 7.7);
  assert.deepEqual(t.resultado.map((r) => r.cifra), ['350°', '7,7 M', '09:32']);
  assert.ok(chart.isClearPath({ lat: 35 + 53 / 60, lon: -(5 + 34 / 60) }, P('tarifa-espigon'), 0));
});

test('cifras: rumbo para pasar a una distancia de un faro (y se pasa a esa distancia)', () => {
  const t = T('pasar-distancia');
  const v = t.valores;
  assert.equal(v.dv, 27);
  assert.equal(v.D, 12.4);
  cerca(v.alfa, toDeg(Math.asin(3 / 12.4)), 1e-9, 'α');
  assert.equal(v.rv, 13);
  assert.equal(v.ra, 11);
  assert.equal(v.traves, 103);
  // navegando a ese rumbo el faro queda por estribor a unas 3 millas en el punto más próximo, en su través
  const ca = closestApproach({ lat: 36, lon: -(6 + 9 / 60) }, v.rv, P('cabo-trafalgar'));
  cerca(ca.distance, 3, 0.1, 'distancia mínima al faro');
  cerca(angleDist(ca.bearing, v.traves), 0, 0.5, 'en el punto más próximo el faro está por el través');
  assert.equal(windSide(ca.bearing, v.rv), 'estribor', 'el faro queda por estribor');
});

test('cifras: demoras no simultáneas (traslado)', () => {
  const t = T('no-simultaneas');
  const v = t.valores;
  assert.equal(v.ct, 1);
  assert.equal(v.rv, 95);
  assert.equal(v.d, 5);
  const r = fixRunning(P('punta-paloma'), v.dv1, P('isla-tarifa'), v.dv2, 95, 5);
  cerca(millas(r.fix, v.fix), 0, 1e-9, 'situación a la 2ª hora');
  // a la 2ª hora la situación cumple la 2ª demora, y la de la 1ª hora cumple la 1ª
  cerca(rhumbTo(v.fix, P('isla-tarifa')).bearing, v.dv2, 1e-6, '2ª demora');
  cerca(rhumbTo(v.first, P('punta-paloma')).bearing, v.dv1, 0.05, '1ª demora');
  cerca(millas(v.first, v.fix), 5, 0.02, 'lo navegado entre las dos');
  assert.ok(cuentas(t).includes(fmtLat(v.fix.lat)));
});

test('cifras: dos distancias', () => {
  const t = T('dos-distancias');
  const v = t.valores;
  cerca(millas(v.fix, P('punta-almina')), 4.6, 0.02, 'distancia a Almina');
  cerca(millas(v.fix, P('punta-europa')), 10.7, 0.02, 'distancia a Europa');
  assert.equal(fixTwoRanges(P('punta-almina'), 4.6, P('punta-europa'), 10.7).length, 2);
  assert.ok(chart.isNavigable(v.fix, 0.5));
  assert.ok(millas(v.fix, { lat: 35 + 56 / 60, lon: -(5 + 22 / 60) }) < millas(v.otro, { lat: 35 + 56 / 60, lon: -(5 + 22 / 60) }), 'se elige el corte junto a la estima');
  assert.deepEqual(t.resultado.map((r) => r.cifra), [fmtLat(v.fix.lat), fmtLon(v.fix.lon)]);
});

test('cifras: corriente, rumbo y velocidad efectivos', () => {
  const t = T('corriente-efectiva');
  const ef = effectiveCourse(10, 6, 80, 2);
  assert.equal(t.valores.rv, 10);
  assert.equal(t.valores.ref, Math.round(ef.ref));
  assert.equal(t.valores.ref, 26);
  assert.equal(t.valores.vef, 6.9);
  cerca(ef.vef, 6.9, 0.05, 'Vef');
  assert.ok(cuentas(t).includes('Ref = 026°') && cuentas(t).includes('Vef = 6,9 nudos'));
  // la situación a las 10:15 es la salida movida 1,25 h de barco más 1,25 h de corriente (con el redondeo de Ref y Vef)
  const exacta = rhumbDestination(rhumbDestination({ lat: 35 + 52 / 60, lon: -(5 + 40 / 60) }, 10, 6 * 1.25), 80, 2 * 1.25);
  cerca(millas(t.valores.se, exacta), 0, 0.15, 'situación');
});

test('cifras: corriente, rumbo a dar', () => {
  const t = T('corriente-rumbo-a-dar');
  const v = t.valores;
  const s = courseToSteer(v.ref, 6, 90, 2);
  assert.equal(v.ref, 39);
  assert.equal(v.rs, Math.round(s.rs));
  assert.equal(v.rs, 24);
  assert.equal(v.vef, 7.1);
  assert.equal(v.ra, 27);
  // comprobación: con ese rumbo de superficie y la corriente, el efectivo es el Ref
  const ef = effectiveCourse(s.rs, 6, 90, 2);
  cerca(ef.ref, v.ref, 1e-6, 'el efectivo resultante');
  assert.deepEqual(cadenaInversa({ ref: v.ref, vb: 6, rc: 90, ic: 2 }).rs, s.rs);
  assert.deepEqual(t.resultado.map((r) => r.cifra), ['027°', '7,1 nudos', '10:27']);
});

test('cifras: corriente desconocida', () => {
  const t = T('corriente-desconocida');
  const v = t.valores;
  assert.equal(v.rv, 93);
  assert.equal(v.d, 12);
  const so = fixTwoBearings(P('isla-tarifa'), 314, P('punta-cires'), 128);
  cerca(millas(so, v.so), 0, 1e-9, 'situación observada');
  const c = rhumbTo(v.se, so);
  assert.equal(v.rc, Math.round(c.bearing));
  assert.equal(v.rc, 67);
  assert.equal(v.dc, 2.9);
  assert.equal(v.ic, 1.5);
  assert.deepEqual(t.resultado.map((r) => r.cifra), ['067°', '1,5 nudos']);
});

test('cifras: viento y abatimiento', () => {
  const t = T('viento');
  const v = t.valores;
  assert.equal(v.rs, 58);
  assert.equal(v.banda, 'babor');
  assert.equal(v.ab, 8);
  assert.equal(v.rv, 50);
  assert.equal(windSide(0, v.rv), 'babor', 'con la proa al Rv el viento sigue por babor');
  assert.equal(norm360(v.rv + v.ab), v.rs, 'Rs = Rv + Ab');
  assert.equal(v.ra, 53);
  assert.deepEqual(t.resultado.map((r) => r.cifra), ['050°', '053°', '10:10']);
});

test('cifras: estima analítica', () => {
  const t = T('estima-analitica');
  const r = deadReckoning({ lat: 36.1, lon: -(6 + 14 / 60) }, [{ rv: 160, dist: 12 }, { rv: 100, dist: 10 }]);
  cerca(t.valores.r.dLat, r.dLat, 1e-9, 'Δl');
  assert.ok(cuentas(t).includes('Δl1 = 12 · cos 160° = −11,28′') && cuentas(t).includes('A1 = 12 · sen 160° = +4,10 M'));
  assert.ok(cuentas(t).includes('Δl = −13,01′ (S)') && cuentas(t).includes('A = +13,95 M (E)'));
  assert.ok(cuentas(t).includes(`= ${fmtLon(r.end.lon)}`));
  assert.equal(fmtBearing(r.course), '133°');
  assert.deepEqual(t.resultado.map((x) => x.cifra), [fmtLat(r.end.lat), fmtLon(r.end.lon), '133° · 19,1 M']);
  // la estima por latitud media llega (casi) al mismo punto que la loxodrómica de la carta, tramo a tramo
  const lox = rhumbDestination(rhumbDestination({ lat: 36.1, lon: -(6 + 14 / 60) }, 160, 12), 100, 10);
  cerca(millas(lox, r.end), 0, 0.05, 'latitud media frente a la carta');
});

// ---------------------------------------------------------------------------
// Dibujos en estilo C

test('dibujos: cada paso tiene su figura, con texto ≥ 10,5 px efectivos, solo colores --lc-* y texto alternativo', () => {
  for (const t of tiposCarta(chart)) {
    t.pasos.forEach((p, j) => {
      const i = j + 1;
      const svg = figuraPaso(chart, t, i);
      assert.ok(svg?.startsWith('<svg'), `${t.id} paso ${i}: sin figura`);
      assert.ok(!/NaN|undefined/.test(svg), `${t.id} paso ${i}: NaN`);
      const [w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
      const escala = Math.min(328 / w, 430 / h);
      for (const tx of svg.match(/<text\b[^>]*>/g) ?? []) {
        const fs = Number(tx.match(/font-size="([\d.]+)"/)?.[1]);
        assert.ok(fs * escala >= 10.5, `${t.id} paso ${i}: ${tx} → ${(fs * escala).toFixed(1)} px`);
      }
      const sinUrl = svg.replace(/url\(#[^)]*\)/g, 'var(--lc-url)');
      const fijo = sinUrl.match(/(?:fill|stroke|stop-color|color)="(?!none"|var\(--lc-)[^"]*"/);
      assert.ok(!fijo, `${t.id} paso ${i}: color fijo ${fijo?.[0]}`);
      for (const v of new Set(svg.match(/var\(--[a-z0-9-]+\)/g))) assert.ok(v.slice(6, -1) in CLARO && v.slice(6, -1) in OSCURO, `${v} sin definir`);
      const alt = svg.match(/aria-label="([^"]*)"/)?.[1] ?? '';
      assert.ok(alt.length >= 60 && alt.includes(p.titulo), `${t.id} paso ${i}: texto alternativo pobre`);
      assert.equal(altPaso(t, i).length > 0, true);
      // en la carta, lo nuevo del paso está dibujado (en magenta) y nombrado en el texto alternativo
      if (!p.figura) {
        const nuevos = t.carta.elementos.filter((e) => e.paso === i);
        assert.ok(nuevos.length, `${t.id} paso ${i}: el paso no dibuja nada nuevo`);
        assert.ok(alt.includes('Nuevo en este paso'), `${t.id} paso ${i}: el alt no dice qué es nuevo`);
        if (nuevos.some((e) => e.tipo !== 'faro')) assert.ok(svg.includes('var(--lc-magenta)'), `${t.id} paso ${i}: nada resaltado`);
      }
    });
  }
});

test('dibujos: el extracto no cambia de escala entre pasos y no usa la carta escaneada', () => {
  for (const t of tiposCarta(chart).filter((x) => x.carta)) {
    const cajas = new Set(t.pasos.map((_, j) => figuraPaso(chart, t, j + 1)).filter((s) => !s.includes('ángulos ×')).map((s) => s.match(/viewBox="([^"]*)"/)[1]));
    assert.equal(cajas.size, 1, `${t.id}: ${[...cajas].join(' / ')}`);
    for (let i = 1; i <= t.pasos.length; i++) assert.ok(!/<image\b|\.(png|jpe?g|webp)\b/i.test(figuraPaso(chart, t, i)), `${t.id}: sin imágenes`);
  }
});

test('posición por dos distancias (motor): los dos cortes están a las distancias pedidas', () => {
  const A = P('punta-almina');
  const B = P('punta-europa');
  for (const c of fixTwoRanges(A, 4.6, B, 10.7)) { cerca(millas(c, A), 4.6, 0.03, 'A'); cerca(millas(c, B), 10.7, 0.03, 'B'); }
  assert.deepEqual(fixTwoRanges(A, 1, B, 1), [], 'arcos que no se tocan');
  const q = { lat: 35 + 57 / 60, lon: -(5 + 13 / 60) };
  const [c0, c1] = fixTwoRanges(A, 4.6, B, 10.7, q);
  assert.ok(millas(c0, q) <= millas(c1, q), 'ordenados de más cerca a más lejos del punto dado');
});

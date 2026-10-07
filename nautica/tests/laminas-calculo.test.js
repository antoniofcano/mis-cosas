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

import { desatraque } from '../src/nautical/desatraque.js';
test('desatraque: viento, esprín que trabaja y máquina', () => {
  const r = (viento, esprin, maquina) => desatraque({ viento, esprin, maquina }).resultado;
  for (const v of ['calma', 'tierra', 'mar']) assert.equal(r(v, 'proa', 'avante'), 'abre-popa');
  assert.equal(r('calma', 'popa', 'atras'), 'abre-proa');
  assert.equal(r('tierra', 'popa', 'atras'), 'abre-proa');
  assert.equal(r('mar', 'popa', 'atras'), 'se-queda'); // con viento de fuera se abre la popa
  assert.equal(r('calma', 'proa', 'atras'), 'se-queda'); // el esprín no trabaja
  assert.equal(r('mar', 'popa', 'avante'), 'se-queda');
  assert.equal(r('tierra', 'popa', 'avante'), 'se-separa');
  // reutiliza la hélice: avante con timón al muelle (babor) la popa va a estribor, fuera del muelle
  assert.equal(desatraque({ viento: 'calma', esprin: 'proa', maquina: 'avante' }).helice.popa, 'estribor');
  assert.equal(desatraque({ viento: 'calma', esprin: 'popa', maquina: 'atras' }).helice.popa, 'babor');
});

import { vientoEnPunto, intensidad, rumboNombre } from '../src/nautical/meteo.js';
test('viento alrededor de una borrasca y de un anticiclón (HN) y ley de Buys-Ballot', () => {
  // al norte de una borrasca el viento sopla del este (algo del nordeste): gira antihorario y entra hacia el centro
  assert.equal(rumboNombre(vientoEnPunto({ centro: 'B', posicion: 0 }).desde), 'nordeste');
  assert.equal(rumboNombre(vientoEnPunto({ centro: 'B', posicion: 180 }).desde), 'suroeste');
  // al norte de un anticiclón gira horario y sale hacia fuera: del oeste-suroeste
  assert.equal(rumboNombre(vientoEnPunto({ centro: 'A', posicion: 0 }).desde), 'suroeste');
  // de espaldas al viento, la borrasca siempre a la izquierda y el anticiclón a la derecha
  for (let p = 0; p < 360; p += 15) {
    assert.equal(vientoEnPunto({ centro: 'B', posicion: p }).lado, 'izquierda', `B ${p}`);
    assert.equal(vientoEnPunto({ centro: 'A', posicion: p }).lado, 'derecha', `A ${p}`);
  }
  // isobaras más juntas, más viento
  assert.ok(intensidad(14).t > intensidad(26).t && intensidad(26).t > intensidad(34).t);
  assert.equal(intensidad(14).texto, 'fuerte');
});

import { humedadRelativa, hayNiebla } from '../src/nautical/meteo.js';
test('humedad relativa y punto de rocío: al enfriar sin añadir agua la humedad sube hasta saturar', () => {
  const td = 12;
  assert.ok(humedadRelativa(18, td) < humedadRelativa(15, td));
  assert.ok(humedadRelativa(15, td) < humedadRelativa(13, td));
  assert.equal(humedadRelativa(12, td), 100);
  assert.equal(humedadRelativa(10, td), 100);
  // valor conocido: 20 °C con rocío a 12 °C ≈ 60 %
  assert.ok(Math.abs(humedadRelativa(20, 12) - 60) < 1.5, String(humedadRelativa(20, 12)));
  assert.equal(hayNiebla(13, td), false);
  assert.equal(hayNiebla(12, td), true);
});

import { tideHeight, correccionTabla, aguaBajoQuilla, twelfthsFraction } from '../src/nautical/tides.js';
test('mareas: la curva coincide con la fórmula de la tabla oficial y con los duodécimos', () => {
  const bm = { t: 0, h: 0.6 };
  const pm = { t: 360, h: 3.4 };
  for (let m = 0; m <= 360; m += 15) assert.ok(Math.abs(tideHeight(bm, pm, m) - (0.6 + correccionTabla(2.8, m, 360))) < 1e-9);
  assert.ok(Math.abs(correccionTabla(2.8, 180, 360) - 1.4) < 1e-9); // a mitad de la creciente, la mitad de la amplitud
  for (let hh = 1; hh <= 6; hh++) assert.ok(Math.abs(correccionTabla(1, hh * 60, 360) - twelfthsFraction(hh)) < 0.03, `hora ${hh}`);
  assert.deepEqual(aguaBajoQuilla({ sondaCarta: 2, altura: 0.6, calado: 1.8 }), { sonda: 2.6, bajoQuilla: 2.6 - 1.8 });
  assert.ok(aguaBajoQuilla({ sondaCarta: 1, altura: 0.6, calado: 1.8 }).bajoQuilla < 0);
});

// ── Láminas de abatimiento y corriente de las explicaciones de PY: abren con las cifras de su pregunta ──────────
// Cada explicación con cifras está en CIFRAS, que dice qué pide la pregunta y lo que hace falta de la carta (salida,
// destino, faros). El test recalcula con kinematics lo que se pregunta a partir de la spec real y lo compara con la
// opción correcta de la plantilla: lo que muestra la lámina a ±1° y ±0,1 nudos; lo que además sale de medir en la
// carta (rumbo al destino, situaciones, corriente), con la holgura del trazado a mano (±2°, ±0,2 nudos, ±1 milla).
import { readFileSync } from 'node:fs';
import { abatimientoSigned } from '../src/nautical/kinematics.js';
import { chartData } from './helpers.js';

const leeJSON = (ruta) => JSON.parse(readFileSync(new URL(ruta, import.meta.url)));
const PY_EXPL = leeJSON('../data/ejes/andalucia/py/explicaciones.json');
const PY_PREG = Object.fromEntries(leeJSON('../data/ejes/andalucia/py/preguntas.json').preguntas.map((q) => [q.id, q]));

// Geometría plana en millas (la zona del Estrecho cabe de sobra: 1′ de latitud = 1 milla).
const FARO = Object.fromEntries(chartData.points.map((p) => [p.id, p]));
const COSL = Math.cos((36 * Math.PI) / 180);
const xy = (lat, lon) => [lon * 60 * COSL, lat * 60];
const pos = (lg, lm, Lg, Lm) => xy(lg + lm / 60, -(Lg + Lm / 60)); // N y W, como en los enunciados
const enDir = (d) => [Math.sin((d * Math.PI) / 180), Math.cos((d * Math.PI) / 180)];
const mas = (a, d, m) => [a[0] + enDir(d)[0] * m, a[1] + enDir(d)[1] * m];
const demora = (a, b) => (((Math.atan2(b[0] - a[0], b[1] - a[1]) * 180) / Math.PI) + 360) % 360;
const millas = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const difAng = (a, b) => Math.abs(((a - b) % 360 + 540) % 360 - 180);
function corte(p, d, q, e) {
  const [u, v] = [enDir(d), enDir(e)];
  const t = ((q[0] - p[0]) * v[1] - (q[1] - p[1]) * v[0]) / (u[0] * v[1] - u[1] * v[0]);
  return mas(p, d, t);
}
const faro = (id) => xy(FARO[id].lat, FARO[id].lon);
/** Un lugar: id de faro, [x, y], { de, dv, millas } (a tantas millas del faro, en esa dirección desde él),
 *  { lat, lon } (paralelo de un faro y meridiano de otro) o { corte: [[faro, dirección | '>faro'], …] }. */
function lugar(l) {
  if (typeof l === 'string') return faro(l);
  if (Array.isArray(l)) return l;
  if (l.de) return mas(faro(l.de), l.dv, l.millas);
  if (l.lat) return [faro(l.lon)[0], faro(l.lat)[1]];
  const [[a, da], [b, db]] = l.corte;
  const dir = (f, d) => (typeof d === 'string' ? demora(faro(f), faro(d.slice(1))) : d);
  return corte(faro(a), dir(a, da), faro(b), dir(b, db));
}
/** Rumbo para pasar a `m` millas de un faro dejándolo por esa banda (tangente a su círculo). */
function tangente(desde, [id, m, banda]) {
  const d = millas(desde, faro(id));
  const a = (Math.asin(m / d) * 180) / Math.PI;
  return (demora(desde, faro(id)) + (banda === 'estribor' ? -a : a) + 360) % 360;
}
const cifras = (t) => (t.match(/\d+(?:,\d+)?/g) ?? []).map((n) => Number(n.replace(',', '.')));
const enPos = ([lg, lm, Lg, Lm]) => pos(lg, lm, Lg, Lm);

/** Estado de la lámina a partir de la spec real (los mismos valores por defecto que sus definiciones). */
function lamina(s) {
  const vb = Number(s.vb ?? 6);
  if (s.tipo === 'abatimiento') return { vb, ab: abatimientoSigned(Number(s.ab), s.banda), rc: 0, ic: 0, rv: Number(s.rv) };
  return { vb, ab: Number(s.ab ?? 0), rc: Number(s.rc), ic: Number(s.ic), rumbo: Number(s.rumbo), inversa: s.caso === 'rumbo-a-dar' };
}

const T = 'abatimiento';
const C = 'corriente';
// ct: corrección total; ra: rumbo de aguja del enunciado; horas: tiempo navegado o disponible; hora: HRB de salida.
const CIFRAS = {
  // Abatimiento: rumbo de superficie a partir del de aguja
  'and-py-2020-c3-n16': { t: T, pide: 'rs', ra: 197, ct: 13 },
  'and-py-2022-c1-n16': { t: T, pide: 'rs', ra: 315, ct: -5 },
  'and-py-2024-c3-n16': { t: T, pide: 'rs', ra: 138, ct: -12 },
  'and-py-2025-c1-n16': { t: T, pide: 'rs', ra: 350, ct: 15 },
  'and-py-2026-c2-n15': { t: T, pide: 'rs', ra: 228, ct: 12 },
  // Abatimiento: rumbo de aguja para ir a un sitio o pasar a tantas millas de un faro
  'and-py-2020-c1-n12': { t: T, pide: 'ra', ct: -9, salida: pos(36, 17, 6, 20), pasar: ['cabo-trafalgar', 5, 'babor'] },
  'and-py-2020-c3-n12': { t: T, pide: 'ra', ct: 5, salida: { corte: [['isla-tarifa', '>punta-alcazar'], ['punta-cires', 90]] }, pasar: ['punta-almina', 5, 'estribor'] },
  'and-py-2021-c1-n13': { t: T, pide: 'ra-hrb', ct: -8, salida: pos(36, 11, 5, 13), destino: 'ceuta-bocana', hora: 18 + 24 / 60 },
  'and-py-2022-c1-n12': { t: T, pide: 'ra', ct: -12, salida: { corte: [['isla-tarifa', '>punta-cires'], ['punta-alcazar', 0]] }, pasar: ['punta-gracia', 4, 'estribor'] },
  'and-py-2022-c2-n12': { t: T, pide: 'ra', ct: -8, salida: pos(35, 45, 6, 10), pasar: ['cabo-espartel', 4, 'estribor'] },
  'and-py-2022-c2-n13': { t: T, pide: 'ra', ct: 5, salida: pos(36, 10, 5, 10), destino: 'ceuta-bocana' },
  'and-py-2022-c3-n12': { t: T, pide: 'ra', ct: -5, salida: pos(36, 10, 5, 10), pasar: ['punta-carnero', 4, 'estribor'] },
  'and-py-2022-c3-n14': { t: T, pide: 'ra', ct: 10, salida: pos(36, 0, 5, 40), destino: 'tanger-espigon' },
  'and-py-2023-c1-n12': { t: T, pide: 'ra', ct: -10, salida: pos(36, 10, 6, 10), pasar: ['punta-gracia', 3, 'babor'] },
  'and-py-2023-c2-n11': { t: T, pide: 'ra', ct: -15, salida: pos(35, 45, 6, 15), pasar: ['cabo-espartel', 5, 'estribor'] },
  'and-py-2023-c3-n13': { t: T, pide: 'ra', ct: 11, salida: 'ceuta-roja', pasar: ['punta-europa', 5, 'babor'] },
  'and-py-2024-c1-n14': { t: T, pide: 'ra', ct: 4, salida: 'tanger-espigon', pasar: ['cabo-espartel', 4, 'babor'] },
  'and-py-2024-c2-n12': { t: T, pide: 'ra', ct: 6, salida: 'barbate-espigon', pasar: ['punta-paloma', 5, 'babor'] },
  'and-py-2024-c2-n16': { t: T, pide: 'ra', ct: -10, salida: pos(35, 50, 5, 10), destino: 'algeciras-espigon' },
  'and-py-2024-c3-n12': { t: T, pide: 'ra', ct: -11, salida: pos(35, 50, 6, 10), pasar: ['cabo-espartel', 7, 'estribor'] },
  'and-py-2025-c1-n12': { t: T, pide: 'ra', ct: -10, salida: pos(36, 0, 5, 40), pasar: ['cabo-trafalgar', 5, 'estribor'] },
  'and-py-2025-c2-n11': { t: T, pide: 'ra', ct: 0, salida: { corte: [['punta-paloma', 340], ['punta-cires', 120]] }, destino: 'tanger-espigon' },
  'and-py-2025-c3-n12': { t: T, pide: 'ra', ct: -12, salida: { corte: [['punta-gracia', 340], ['punta-paloma', 45]] }, destino: 'barbate-faro' },
  'and-py-2026-c1-n12': { t: T, pide: 'ra', ct: 0, salida: { de: 'punta-paloma', dv: 225, millas: 5 }, pasar: ['cabo-trafalgar', 5, 'estribor'] },
  'and-py-2026-c2-n12': { t: T, pide: 'ra', ct: -10.5, salida: pos(36, 5, 5, 20), pasar: ['punta-almina', 3, 'estribor'] },
  // Abatimiento: situación al tener un faro por el través, hora a la que se avista un faro
  'and-py-2023-c3-n16': { t: T, pide: 'avistar', salida: { de: 'cabo-roche', dv: 225, millas: 6 }, alcance: ['punta-gracia', 9], hora: 3 },
  'and-py-2024-c1-n13': { t: T, pide: 'situacion', salida: pos(36, 15, 6, 15), traves: ['cabo-trafalgar', 'babor'] },
  'and-py-2025-c2-n14': { t: T, pide: 'situacion', ra: 173, ct: 11, salida: pos(36, 15, 5, 15), traves: ['punta-europa', 'estribor'] },
  'and-py-2025-c3-n14': { t: T, pide: 'situacion', ra: 100, ct: 10, salida: { lat: 'isla-tarifa', lon: 'punta-carnero' }, traves: ['punta-almina', 'estribor'] },
  'and-py-2026-c1-n14': { t: T, pide: 'situacion', ra: 268, ct: -10, salida: { de: 'punta-alcazar', dv: 315, millas: 5 }, traves: ['punta-malabata', 'babor'] },
  // Corriente, problema directo: rumbo efectivo
  'and-py-2023-c1-n16': { t: C, pide: 'ref' },
  'and-py-2023-c2-n17': { t: C, pide: 'ref', ra: 270, ct: 14 },
  'and-py-2026-c1-n15': { t: C, pide: 'ref', ra: 45, ct: 4 },
  // Corriente, problema directo: situación de estima (a una hora o al tener un faro por el través), distancia, demora
  'and-py-2024-c2-n14': { t: C, pide: 'situacion', salida: pos(36, 17, 6, 10), traves: ['cabo-trafalgar', 'babor'] },
  'and-py-2024-c3-n14': { t: C, pide: 'situacion', salida: pos(36, 10, 5, 15), traves: ['punta-carnero', 'estribor'] },
  'and-py-2024-c3-n17': { t: C, pide: 'situacion', salida: { de: 'punta-alcazar', dv: 0, millas: 5 }, horas: 100 / 60 },
  'and-py-2025-c1-n17': { t: C, pide: 'situacion', salida: pos(36, 5, 6, 10), horas: 2.5 },
  'and-py-2025-c2-n16': { t: C, pide: 'situacion', ra: 119, ct: 11, salida: pos(36, 5, 6, 10), horas: 1.2 },
  'and-py-2026-c2-n14': { t: C, pide: 'situacion', salida: { corte: [['cabo-roche', 90], ['cabo-trafalgar', 119]] }, traves: ['cabo-trafalgar', 'babor'] },
  'and-py-2023-c3-n15': { t: C, pide: 'distancia', salida: { lat: 'punta-paloma', lon: 'punta-gracia' }, horas: 1, a: 'punta-malabata' },
  'and-py-2024-c1-n16': { t: C, pide: 'demora', salida: { lat: 'isla-tarifa', lon: 'punta-paloma' }, horas: 1.5, a: 'cabo-trafalgar' },
  // Corriente desconocida: de la estima a la situación observada
  'and-py-2020-c1-n14': { t: C, pide: 'corriente', salida: pos(35, 50, 6, 20), horas: 2.5, observada: { corte: [['cabo-espartel', 191], ['punta-malabata', 100]] } },
  'and-py-2022-c1-n17': { t: C, pide: 'corriente', salida: pos(36, 10, 5, 15), horas: 1, observada: { lat: 'punta-carnero', lon: 'punta-almina' } },
  'and-py-2022-c2-n16': { t: C, pide: 'corriente', ra: 166, ct: 10, salida: pos(36, 5, 6, 15), horas: 1.5, observada: { de: 'cabo-espartel', dv: 310, millas: 12 } },
  'and-py-2022-c3-n16': { t: C, pide: 'corriente', salida: pos(35, 45, 6, 20), horas: 2.5, observada: { corte: [['cabo-espartel', 147], ['punta-malabata', 117]] } },
  'and-py-2024-c1-n17': { t: C, pide: 'corriente', salida: { corte: [['isla-tarifa', '>punta-cires'], ['punta-alcazar', 0]] }, horas: 91 / 60, observada: { corte: [['punta-gracia', 343], ['punta-cires', 91]] } },
  'and-py-2024-c2-n17': { t: C, pide: 'corriente', salida: pos(36, 0, 5, 50), horas: 2.5, observada: { lat: 'punta-gracia', lon: 'cabo-trafalgar' } },
  'and-py-2025-c1-n15': { t: C, pide: 'corriente', salida: pos(35, 44.2, 6, 4.7), horas: 1.5, observada: { lat: 'punta-malabata', lon: 'cabo-espartel' } },
  'and-py-2025-c3-n16': { t: C, pide: 'corriente', salida: pos(36, 17, 5, 15), horas: 2, observada: { lat: 'punta-europa', lon: 'punta-almina' } },
  'and-py-2026-c2-n16': { t: C, pide: 'corriente', salida: { de: 'punta-carnero', dv: 160, millas: 6 }, horas: 1.5, observada: { de: 'punta-almina', dv: 3, millas: 5.2 } },
  // Corriente, problema inverso: rumbo a dar (y velocidad, hora de llegada o velocidad efectiva)
  'and-py-2020-c1-n16': { t: C, pide: 'ra', ct: -8, salida: pos(36, 0, 5, 15), destino: 'algeciras-espigon' },
  'and-py-2020-c1-n17': { t: C, pide: 'ra-vb', ct: 0, salida: { lat: 'punta-paloma', lon: 'punta-gracia' }, destino: 'tanger-espigon', horas: 3 },
  'and-py-2020-c3-n14': { t: C, pide: 'ra', ct: -8, salida: { de: 'punta-almina', dv: 90, millas: 3 }, destino: 'algeciras-espigon', horas: 4 },
  'and-py-2020-c3-n17': { t: C, pide: 'ra', ct: 12, salida: { corte: [['punta-gracia', 0], ['isla-tarifa', 70]] }, destino: 'barbate-faro' },
  'and-py-2021-c1-n14': { t: C, pide: 'ra', ct: -6, salida: { de: 'punta-alcazar', dv: 0, millas: 5 }, pasar: ['cabo-espartel', 5, 'babor'] },
  'and-py-2021-c1-n15': { t: C, pide: 'ra-vb', ct: 1, salida: { lat: 'punta-cires', lon: 'tanger-espigon' }, destino: { de: 'tanger-espigon', dv: 0, millas: 2 }, horas: 0.5 },
  'and-py-2022-c1-n14': { t: C, pide: 'ra', ct: -11, salida: pos(36, 0, 5, 52), destino: 'tanger-espigon', horas: 2 },
  'and-py-2022-c2-n14': { t: C, pide: 'ra', ct: 8, salida: pos(36, 0, 5, 40), destino: 'tanger-espigon', horas: 3.5 },
  'and-py-2022-c3-n13': { t: C, pide: 'ra', ct: 8, salida: pos(36, 5, 6, 10), destino: 'barbate-espigon', horas: 2.5 },
  'and-py-2023-c1-n13': { t: C, pide: 'ra-vb', ct: -6, salida: pos(35, 59, 5, 45), destino: 'barbate-faro', horas: 2 },
  'and-py-2023-c2-n14': { t: C, pide: 'vef', salida: pos(36, 12, 5, 12), destino: 'ceuta-bocana' },
  'and-py-2024-c1-n12': { t: C, pide: 'ra', ct: 12, salida: { de: 'punta-almina', dv: 90, millas: 3 }, destino: 'algeciras-espigon' },
  'and-py-2024-c1-n15': { t: C, pide: 'ra', ct: -11, salida: pos(35, 50, 6, 10), pasar: ['cabo-espartel', 4, 'estribor'] },
  'and-py-2024-c2-n13': { t: C, pide: 'ra-vb', ct: 9, salida: pos(36, 0, 6, 0), destino: 'tanger-espigon', horas: 2.25 },
  'and-py-2024-c3-n13': { t: C, pide: 'ra-vb', ct: -9, salida: pos(35, 57, 5, 50), destino: 'barbate-faro', horas: 3 },
  'and-py-2025-c1-n13': { t: C, pide: 'ra', ct: 8, salida: pos(35, 58, 5, 45), destino: 'tanger-espigon' },
  'and-py-2025-c2-n13': { t: C, pide: 'ra-hrb', ct: -6, salida: { lat: 'punta-carnero', lon: 'punta-europa' }, destino: 'ceuta-bocana', hora: 12 + 12 / 60 },
  'and-py-2025-c2-n17': { t: C, pide: 'ra-vb', ct: -10, salida: pos(35, 55, 5, 50), destino: 'barbate-faro', horas: 2.8 },
  'and-py-2025-c3-n11': { t: C, pide: 'ra-hrb', ct: 9, salida: { lat: 'punta-paloma', lon: 'cabo-trafalgar' }, destino: 'tanger-espigon', hora: 11.7 },
  'and-py-2025-c3-n17': { t: C, pide: 'ra-vb', ct: 5, salida: pos(36, 0, 5, 20), destino: 'algeciras-espigon', horas: 2.5 },
  'and-py-2026-c1-n11': { t: C, pide: 'ra-hrb', ct: -12, salida: pos(36, 0, 5, 10), destino: pos(35, 45.2, 5, 20.2), hora: 10 },
  'and-py-2026-c1-n17': { t: C, pide: 'ra-vb', ct: 7, salida: pos(36, 0, 6, 5), destino: 'tanger-espigon', horas: 2.5 },
};

// Con cifras en el enunciado pero sin casar con la plantilla dentro del redondeo: su lámina se queda sin cifras.
const SIN_CASAR = {
  // Rv 340º (Ra 350º, Ct −10º), 8 nudos, corriente al N de 3 nudos, 1 h desde la farola de Tánger: la estima cae a
  // 1,2 millas de la opción b (la explicación ya lo marca como discrepancia: verificada = false).
  'and-py-2021-c2-n16': 'la estima queda a 1,2 millas de la situación de la plantilla',
};

/** Comprueba una explicación contra la opción correcta (lanza con el detalle si no casa). */
function compruebaCifras(id, spec, k) {
  const q = PY_PREG[id];
  const op = cifras(q.opciones[q.correcta]);
  const e = lamina(spec);
  const casi = (a, b, tol, que) => assert.ok(Math.abs(a - b) <= tol + 1e-9, `${id} ${que}: ${a.toFixed(2)} frente a ${b} (±${tol})`);
  const casiAng = (a, b, tol, que) => assert.ok(difAng(a, b) <= tol + 1e-9, `${id} ${que}: ${a.toFixed(1)}° frente a ${b}° (±${tol}°)`);
  const hrb = (h) => Math.round(h * 60); // en minutos
  if (k.ra !== undefined) casiAng(e.rv ?? e.rumbo, k.ra + k.ct, 0, 'Rv = Ra + Ct'); // la lámina parte del Rv del enunciado
  const salida = k.salida && lugar(k.salida);

  if (k.t === T) {
    const r = cadenaDirecta({ rv: e.rv, vb: e.vb, ab: e.ab });
    if (k.pide === 'rs') return casiAng(r.rs, op[0], 1, 'Rs');
    if (k.pide.startsWith('ra')) {
      casiAng(e.rv - k.ct, op[0], 1, 'Ra de la lámina');
      // en la carta: rumbo de superficie al destino → (quitando el abatimiento) Rv → Ra
      const rs = k.pasar ? tangente(salida, k.pasar) : demora(salida, lugar(k.destino));
      const inv = cadenaInversa({ ref: rs, vb: e.vb, ab: e.ab });
      casiAng(inv.rv, e.rv, 2, 'Rv de la carta frente al de la lámina');
      casiAng(inv.rv - k.ct, op[0], 2, 'Ra de la carta');
      if (k.pide === 'ra-hrb') casi(hrb(k.hora + millas(salida, lugar(k.destino)) / inv.vef), op[1] * 60 + op[2], 3, 'HRB (min)');
      return;
    }
    if (k.pide === 'avistar') {
      // entra en el círculo del alcance navegando por el Rs a la Vb
      const [cx, cy] = faro(k.alcance[0]);
      const [ux, uy] = enDir(r.rs);
      const [dx, dy] = [salida[0] - cx, salida[1] - cy];
      const b = ux * dx + uy * dy;
      const t = (-b - Math.sqrt(b * b - (dx * dx + dy * dy - k.alcance[1] ** 2))) / r.vef;
      return casi(hrb(k.hora + t), op[0] * 60 + op[1], 3, 'HRB (min)');
    }
    return compruebaSituacion(id, q, salida, r, e, k);
  }

  // corriente
  if (e.inversa) {
    const r = cadenaInversa({ ref: e.rumbo, vb: e.vb, ab: e.ab, rc: e.rc, ic: e.ic });
    assert.ok(r, `${id}: la corriente no deja llegar`);
    const ref = k.pasar ? tangente(salida, k.pasar) : demora(salida, lugar(k.destino));
    casiAng(e.rumbo, ref, 1.5, 'rumbo al destino de la lámina frente a la carta');
    const enCarta = cadenaInversa({ ref, vb: e.vb, ab: e.ab, rc: e.rc, ic: e.ic });
    if (k.pide === 'vef') {
      casi(r.vef, op[0], 0.1, 'Vef');
      return casi(enCarta.vef, op[0], 0.2, 'Vef de la carta');
    }
    casiAng(r.rv - k.ct, op[0], 1, 'Ra de la lámina');
    casiAng(enCarta.rv - k.ct, op[0], 2, 'Ra de la carta');
    if (k.pide === 'ra-vb') casi(e.vb, op[1], 0.1, 'Vb de la lámina');
    if (k.horas) casi(r.vef, millas(salida, lugar(k.destino)) / k.horas, 0.2, 'Vef = distancia / tiempo');
    if (k.pide === 'ra-hrb') casi(hrb(k.hora + millas(salida, lugar(k.destino)) / r.vef), op[1] * 60 + op[2], 3, 'HRB (min)');
    return;
  }
  assert.equal(spec.caso, 'efectivo', id);
  const r = cadenaDirecta({ rv: e.rumbo, vb: e.vb, ab: e.ab, rc: e.rc, ic: e.ic });
  if (k.pide === 'ref') return casiAng(r.ref, op[0], 1, 'Ref');
  if (k.pide === 'corriente') {
    // la lámina enseña la corriente de la plantilla…
    casiAng(e.rc, op[0], 1, 'Rc de la lámina');
    casi(e.ic, op[1], 0.1, 'Ihc de la lámina');
    // …y es la que lleva de la estima (sin corriente) a la situación observada
    const sinC = cadenaDirecta({ rv: e.rumbo, vb: e.vb, ab: e.ab });
    const estima = mas(salida, sinC.ref, sinC.vef * k.horas);
    const obs = lugar(k.observada);
    casiAng(demora(estima, obs), op[0], 5, 'Rc de la carta');
    casi(millas(estima, obs) / k.horas, op[1], 0.35, 'Ihc de la carta');
    // y la estima con esa corriente cae en la situación observada
    return casi(millas(mas(salida, r.ref, r.vef * k.horas), obs), 0, 1, 'estima con la corriente frente a la observada (millas)');
  }
  return compruebaSituacion(id, q, salida, r, { rv: e.rumbo }, k);
}

/** Situación de estima (a una hora o al tener un faro por el través) y lo que se mide desde ella. */
function compruebaSituacion(id, q, salida, r, e, k) {
  const llegada = k.traves
    ? corte(salida, r.ref, faro(k.traves[0]), e.rv + (k.traves[1] === 'estribor' ? 90 : -90))
    : mas(salida, r.ref, r.vef * k.horas);
  const op = cifras(q.opciones[q.correcta]);
  if (k.pide === 'distancia') return assert.ok(Math.abs(millas(llegada, faro(k.a)) - op[0]) <= 0.5, `${id}: distancia ${millas(llegada, faro(k.a)).toFixed(2)} frente a ${op[0]}`);
  if (k.pide === 'demora') return assert.ok(difAng(demora(llegada, faro(k.a)), op[0]) <= 2, `${id}: demora ${demora(llegada, faro(k.a)).toFixed(1)} frente a ${op[0]}`);
  // la opción correcta es la más cercana a la estima y está a menos de una milla
  const dist = Object.fromEntries(Object.entries(q.opciones).map(([o, t]) => [o, millas(llegada, enPos(cifras(t)))]));
  const cerca = Object.keys(dist).sort((a, b) => dist[a] - dist[b])[0];
  assert.equal(cerca, q.correcta, `${id}: la estima cae más cerca de ${cerca} (${JSON.stringify(dist)})`);
  assert.ok(dist[q.correcta] <= 1, `${id}: la estima queda a ${dist[q.correcta].toFixed(2)} millas de la opción correcta`);
}

test('láminas de abatimiento y corriente de PY: abren con las cifras de su pregunta y dan la respuesta de la plantilla', () => {
  let conCifras = 0;
  const fallos = [];
  for (const [id, ex] of Object.entries(PY_EXPL)) {
    for (const spec of ex.ilustraciones ?? []) {
      if (spec.tipo !== 'abatimiento' && spec.tipo !== 'corriente') continue;
      const tiene = ['rv', 'rumbo', 'ab', 'rc', 'ic', 'vb'].some((p) => p in spec);
      const k = CIFRAS[id];
      if (SIN_CASAR[id]) assert.ok(!tiene && !k, `${id}: ${SIN_CASAR[id]}; su lámina no lleva cifras`);
      assert.equal(tiene, !!k, `${id}: ${tiene ? 'tiene cifras pero no está en la tabla' : 'está en la tabla y la spec no tiene cifras'}`);
      if (!k) continue;
      assert.equal(spec.tipo, k.t, id);
      try { compruebaCifras(id, spec, k); } catch (err) { fallos.push(err.message); }
      conCifras++;
    }
  }
  assert.deepEqual(fallos, []);
  assert.equal(conCifras, Object.keys(CIFRAS).length);
});

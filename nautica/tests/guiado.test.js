// Modo guiado (R-35) y diagnóstico por tipo de error (R-36): el kit expone el valor preguntable de cada paso, el modo
// guiado corrige con las tolerancias de examen y cada error típico del kit da el resultado esperado en un caso hecho a mano.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createKit, hrb } from '../src/exams/kit.js';
import { SOLUCIONES } from '../src/bancos/soluciones.js';
import { QUANTITIES } from '../src/analysis/quantities.js';
import { corregirPaso, toleranciaCampo, tienePasosPreguntables, resumenGuiado, ESTADO } from '../src/exams/guiado.js';
import { diagnosticar, resolverVariantes, variantesQueLlevanA } from '../src/exams/diagnostico.js';
import { PASOS, ERRORES, VARIANTES, tipoDe, errorComun, fraseError } from '../src/exams/taxonomia.js';
import { estadoVacio, anotaError, anotaPaso, resumen, leerEstado, crearAlmacenErrores } from '../src/store/errores.js';
import { rhumbTo } from '../src/math/mercator.js';
import { norm360 } from '../src/math/angles.js';
import { chart } from './helpers.js';
import { todasLasPreguntas } from '../tools/bancos/leer.mjs';

const byId = new Map(todasLasPreguntas().map((q) => [q.id, q]));
const cerca = (a, b, tol = 1e-6, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} ≠ ${b}`);
const ang = (a, b, tol = 1e-6, msg) => assert.ok(Math.abs(((a - b + 540) % 360) - 180) <= tol, `${msg ?? ''} ${a} ≠ ${b}`);
const ultimo = (k) => k.steps.at(-1);
const TABLA = [{ hora: '04:00', altura_m: 0.5 }, { hora: '10:00', altura_m: 3.5 }, { hora: '16:00', altura_m: 0.7 }];
const S0 = { lat: 36, lon: -5.75 };

/** Todas las operaciones del kit con datos de prueba; `pide` = lo que deben preguntar sus pasos (kinds por paso, null = nota). */
const OPERACIONES = {
  pos: { run: (k) => k.pos('36 00,0 N', '5 45,0 W'), pide: [null] },
  note: { run: (k) => k.note('Nota', 'Texto.'), pide: [null] },
  ctDato: { run: (k) => k.ct({ ct: -3 }), pide: [null] },
  ct: { run: (k) => k.ct({ dm: -3, desvio: 1 }), pide: [['signed']] },
  ctCarta: { run: (k) => k.ct({ carta: [-3, 2005, 7], anyo: 2015, desvio: 1 }), pide: [['signed'], ['signed']] },
  rv: { run: (k) => k.rv(100, -2), pide: [['bearing']] },
  ra: { run: (k) => k.ra(100, -2), pide: [['bearing']] },
  dv: { run: (k) => k.dv(40, -2, 'punta-carnero'), pide: [['bearing']] },
  dvM: { run: (k) => k.dvM(100, 30, 'punta-carnero'), pide: [['bearing']] },
  ctFrom: { run: (k) => k.ctFrom(80, 77), pide: [['signed']] },
  ctPolar: { run: (k) => k.ctPolar(3), pide: [['signed']] },
  oposicion: { run: (k) => k.oposicion('cabo-espartel', 'punta-malabata'), pide: [['bearing']] },
  enfilacion: { run: (k) => k.enfilacion('punta-carnero', 'punta-europa', 258), pide: [['bearing']] },
  fix2: { run: (k) => k.fix2('cabo-espartel', 180, 'punta-malabata', 220), pide: [['lat', 'lon']] },
  fixDist: { run: (k) => k.fixDist('cabo-espartel', 123, 4), pide: [['lat', 'lon']] },
  fixBearingRange: { run: (k) => k.fixBearingRange('cabo-espartel', 180, 'punta-malabata', 10), pide: [['lat', 'lon']] },
  fix2Ranges: { run: (k) => k.fix2Ranges('cabo-espartel', 6, 'punta-malabata', 8, S0), pide: [['lat', 'lon']] },
  fromMark: { run: (k) => k.fromMark('punta-malabata', 0, 5), pide: [['lat', 'lon']] },
  cardinal2: { run: (k) => k.cardinal2('cabo-espartel', 0, 'punta-malabata', 315), pide: [['lat', 'lon']] },
  lineAndBearing: { run: (k) => k.lineAndBearing('punta-carnero', 200, 'punta-malabata', 160), pide: [['lat', 'lon']] },
  run: { run: (k) => k.run(S0, 90, 6), pide: [['lat', 'lon']] },
  distFor: { run: (k) => k.distFor(6, 90), pide: [['distance']] },
  rhumb: { run: (k) => k.rhumb(S0, 'punta-carnero'), pide: [['bearing', 'distance']] },
  bearingTo: { run: (k) => k.bearingTo(S0, 'punta-carnero'), pide: [['bearing', 'distance']] },
  tangent: { run: (k) => k.tangent(S0, 'cabo-trafalgar', 3, 'estribor'), pide: [['bearing']] },
  eta: { run: (k) => k.eta(hrb(10), 9, 6), pide: [['clock']] },
  distanceBetween: { run: (k) => k.distanceBetween(S0, 'punta-carnero'), pide: [['distance']] },
  abatimiento: { run: (k) => k.abatimiento(90, 10, 0), pide: [['bearing']] },
  rvConAbatimiento: { run: (k) => k.rvConAbatimiento(90, 10, 0), pide: [['bearing']] },
  efectivo: { run: (k) => k.efectivo(90, 6, 0, 2, S0), pide: [['bearing', 'speed']] },
  estimaEfectiva: { run: (k) => k.estimaEfectiva(S0, 90, 6, 90), pide: [['lat', 'lon']] },
  rumboYVelocidad: { run: (k) => k.rumboYVelocidad(S0, 'punta-carnero', 120, 90, 2), pide: [['bearing', 'speed'], ['bearing', 'speed']] },
  corteRumbo: { run: (k) => k.corteRumbo(S0, 90, 'punta-carnero', 0), pide: [['lat', 'lon']] },
  traslado: { run: (k) => k.traslado('punta-cires', 160, 'punta-cires', 225, 70, 4), pide: [null, ['lat', 'lon']] },
  trasladoArco: { run: (k) => k.trasladoArco('punta-cires', 160, 'punta-cires', 5, 70, 4, (c) => c[0]), pide: [null, ['lat', 'lon']] },
  trasladoDosArcos: { run: (k) => k.trasladoDosArcos('punta-cires', 5, 'punta-malabata', 6, 70, 2, (c) => c[0]), pide: [null, ['lat', 'lon']] },
  tramos: { run: (k) => k.tramos({ lat: 36.1, lon: -6.2333 }, [{ rumbo: 160, millas: 12 }, { rumbo: 100, millas: 10 }]), pide: [['minutos', 'minutos'], ['minutos', 'minutos'], ['minutos', 'minutos'], ['lat'], ['minutos'], ['lat', 'lon']] },
  corrienteDesconocida: { run: (k) => k.corrienteDesconocida(S0, { lat: 36.02, lon: -5.72 }, 90), pide: [['bearing', 'speed']] },
  rumboConCorriente: { run: (k) => k.rumboConCorriente(S0, 'punta-carnero', 6, 90, 2), pide: [['bearing', 'distance'], ['bearing', 'speed']] },
  rumboConCorrienteRef: { run: (k) => k.rumboConCorriente(S0, 45, 6, 90, 2), pide: [['bearing', 'speed']] },
  porNombre: { run: (k) => k.porNombre(130), pide: [null] },
  rumboDirecto: { run: (k) => k.rumboDirecto({ lat: 36.1, lon: -6.2 }, { lat: 35.9, lon: -5.9 }), pide: [['minutos'], ['minutos'], ['minutos'], ['bearing', 'distance']] },
  tramoMarea: { run: (k) => k.tramoMarea(TABLA, { desde: 0 }), pide: [['duration', 'meters']] },
  horaUT: { run: (k) => k.horaUT(hrb(9), 2), pide: [['clock']] },
  sondaA: { run: (k) => k.sondaA(k.tramoMarea(TABLA, { desde: 0 }), hrb(6), 1.2), pide: [['duration', 'meters'], ['duration'], ['meters'], ['meters'], ['meters']] },
  horaParaSonda: { run: (k) => k.horaParaSonda(k.tramoMarea(TABLA, { desde: 0 }), 3, 1, 2), pide: [['duration', 'meters'], ['meters'], ['meters'], ['duration'], ['clock'], ['clock']] },
};

test('cada operación del kit expone el valor preguntable de sus pasos (o ninguno si es una nota)', () => {
  const kitOps = Object.keys(createKit(chart)).filter((x) => typeof createKit(chart)[x] === 'function' && x !== 'P');
  const probadas = new Set(Object.keys(OPERACIONES).map((x) => x.replace(/(Dato|Carta|Ref)$/, '')));
  for (const op of kitOps) assert.ok(probadas.has(op), `falta probar la operación ${op}`);
  for (const [nombre, { run, pide }] of Object.entries(OPERACIONES)) {
    const k = createKit(chart);
    run(k);
    assert.equal(k.steps.length, pide.length, `${nombre}: pasos`);
    k.steps.forEach((s, i) => {
      if (pide[i] == null) { assert.equal(s.pide, undefined, `${nombre} paso ${i + 1} no se pregunta`); return; }
      assert.ok(s.pide, `${nombre} paso ${i + 1} sin pide`);
      assert.ok(PASOS[s.pide.paso], `${nombre}: paso desconocido ${s.pide.paso}`);
      assert.ok(s.pide.pregunta.length > 10);
      assert.deepEqual(s.pide.campos.map((c) => c.kind), pide[i], `${nombre} paso ${i + 1}`);
      for (const c of s.pide.campos) { assert.ok(QUANTITIES[c.kind]); assert.ok(Number.isFinite(c.value), `${nombre}: ${c.label}`); assert.ok(c.label); }
    });
  }
});

test('el valor preguntable es el que calcula la operación', () => {
  const k = createKit(chart);
  const ct = k.ct({ dm: -3, desvio: 1 });
  assert.equal(ultimo(k).pide.campos[0].value, ct);
  const rv = k.rv(100, ct);
  assert.equal(ultimo(k).pide.campos[0].value, rv);
  const p = k.fixDist('cabo-espartel', 123, 4);
  assert.deepEqual(ultimo(k).pide.campos.map((c) => c.value), [p.lat, p.lon]);
  assert.ok(ultimo(k).pide.campos.every((c) => c.medido), 'la situación se mide en la carta');
  const { rv: r, dist } = k.rhumb(S0, 'punta-carnero');
  assert.deepEqual(ultimo(k).pide.campos.map((c) => c.value), [r, dist]);
});

test('las soluciones reales siguen llegando a lo mismo y casi todas tienen pasos que preguntar', () => {
  let con = 0; let total = 0;
  for (const [id, sol] of Object.entries(SOLUCIONES)) {
    const q = byId.get(id);
    const k = createKit(chart);
    sol.solve(k, q);
    total += 1;
    if (tienePasosPreguntables(k.steps)) con += 1;
    for (const s of k.steps) for (const c of s.pide?.campos ?? []) assert.ok(Number.isFinite(c.value), `${id}: ${s.title}`);
  }
  assert.ok(con / total > 0.9, `con pasos preguntables: ${con}/${total}`);
});

test('el modo guiado corrige con la tolerancia de examen (el doble en lo medido en la carta)', () => {
  const ct = { campos: [{ kind: 'signed', value: -3, label: 'Ct' }] };
  assert.equal(corregirPaso(ct, ['3 W']).estado, ESTADO.OK);
  assert.equal(corregirPaso(ct, ['-3,4']).estado, ESTADO.OK); // 0,5° de tolerancia
  assert.equal(corregirPaso(ct, ['−3,8']).estado, ESTADO.CASI);
  assert.equal(corregirPaso(ct, ['3 E']).estado, ESTADO.MAL); // el signo cuenta
  assert.equal(corregirPaso(ct, ['+3']).estado, ESTADO.MAL);
  assert.equal(corregirPaso(ct, ['']).estado, ESTADO.VACIO);
  assert.equal(corregirPaso(ct, ['tres']).estado, ESTADO.ILEGIBLE);
  // Factor de exigencia de Ajustes.
  assert.equal(corregirPaso(ct, ['-3,8'], { factor: 2 }).estado, ESTADO.OK);
  // Rumbo: 1° (al pasar por 000° también).
  const rv = { campos: [{ kind: 'bearing', value: 359.6, label: 'Rv' }] };
  assert.equal(corregirPaso(rv, ['000']).estado, ESTADO.OK);
  assert.equal(corregirPaso(rv, ['001']).estado, ESTADO.CASI);
  // Medido en la carta: 2°.
  const med = { campos: [{ kind: 'bearing', value: 80, label: 'Dv', medido: true }] };
  assert.equal(toleranciaCampo(med.campos[0]), 2);
  assert.equal(corregirPaso(med, ['078']).estado, ESTADO.OK);
  assert.equal(corregirPaso(med, ['085']).estado, ESTADO.MAL);
  // Situación: latitud y longitud (sin E/W se entiende W), 1′ ×2 por medirse en la carta.
  const sit = { campos: [{ kind: 'lat', value: 36 + 5.2 / 60, label: 'Latitud', medido: true }, { kind: 'lon', value: -(5 + 40 / 60), label: 'Longitud', medido: true }] };
  assert.equal(corregirPaso(sit, ['36 05,2 N', '5 41,5']).estado, ESTADO.OK);
  assert.equal(corregirPaso(sit, ['36 05,2 N', '5 45 W']).estado, ESTADO.MAL);
  assert.equal(corregirPaso(sit, ['36 05,2 N', '']).estado, ESTADO.VACIO);
  // Horas y metros.
  assert.equal(corregirPaso({ campos: [{ kind: 'clock', value: hrb(14, 35), label: 'HRB' }] }, ['14:37']).estado, ESTADO.OK);
  assert.equal(corregirPaso({ campos: [{ kind: 'clock', value: hrb(14, 35), label: 'HRB' }] }, ['14:45']).estado, ESTADO.MAL);
  assert.equal(corregirPaso({ campos: [{ kind: 'meters', value: 2.35, label: 'Sonda' }] }, ['2,4 m']).estado, ESTADO.OK);
  assert.equal(corregirPaso({ campos: [{ kind: 'duration', value: 6.2, label: 'D' }] }, ['6h 12m']).estado, ESTADO.OK);
  assert.deepEqual(resumenGuiado([{ resultado: 'ok' }, { resultado: 'mal' }, { resultado: 'dimelo' }]), { total: 3, aciertos: 1, dichos: 1, fallos: 1 });
});

test('taxonomía: cada variante es de un error conocido y cada error tiene variante y paso', () => {
  for (const v of VARIANTES) assert.ok(ERRORES[tipoDe(v)], v);
  for (const [id, e] of Object.entries(ERRORES)) {
    assert.ok(VARIANTES.some((v) => tipoDe(v) === id), `${id} sin variante`);
    assert.ok(PASOS[e.paso], `${id}: paso ${e.paso}`);
  }
  assert.equal(errorComun('resta-al-reves'), 'signo-ct'); // los ids de los ejercicios generados
  assert.equal(errorComun('corriente-invertida'), 'corriente-invertida');
  assert.equal(errorComun('no-existe'), null);
  assert.match(fraseError(['signo-ct']), /^Es lo que sale si aplicas la Ct/);
  assert.match(fraseError(['signo-ct', 'signo-dm']), /^Puede salir de dos errores/);
});

// ---- Cada variante, en un caso hecho a mano
const con = (error) => createKit(chart, { error });

test('errores de la Ct: signo, sentido, declinación y desvío', () => {
  assert.equal(con(null).ct({ dm: -3, desvio: 1 }), -2);
  assert.equal(con('signo-ct:valor').ct({ dm: -3, desvio: 1 }), 2);
  assert.equal(con('signo-dm').ct({ dm: -3, desvio: 1 }), 4);
  assert.equal(con('signo-desvio').ct({ dm: -3, desvio: 1 }), -4);
  assert.equal(con('olvida-desvio').ct({ dm: -3, desvio: 1 }), -3);
  assert.equal(con('signo-ct:valor').ct({ ct: -3 }), -3, 'una Ct dato no se toca');
  // Carta 3° W 2005 (7′ E) en 2015: dm = −3 + 70′ = −1° 50′.
  cerca(con(null).ct({ carta: [-3, 2005, 7], anyo: 2015 }), -110 / 60);
  cerca(con('dm-sin-actualizar').ct({ carta: [-3, 2005, 7], anyo: 2015 }), -3);
  cerca(con('variacion-signo').ct({ carta: [-3, 2005, 7], anyo: 2015 }), -250 / 60);
  // Conversiones con Ct = −2.
  assert.equal(con(null).rv(100, -2), 98);
  assert.equal(con('signo-ct:aplicacion').rv(100, -2), 102);
  assert.equal(con('signo-ct:aplicacion').ra(98, -2), 96);
  assert.equal(con('signo-ct:suma-siempre').rv(100, -2), 98);
  assert.equal(con('signo-ct:suma-siempre').ra(98, -2), 96);
  assert.equal(con('signo-ct:resta-siempre').ra(98, -2), 100);
  assert.equal(con('signo-ct:resta-siempre').dv(40, -2, 'punta-carnero'), 42);
  assert.equal(con('sin-ct').rv(100, -2), 100);
  assert.equal(con('sin-ct').dv(40, -2, 'punta-carnero'), 40);
  cerca(con('signo-ct:valor').ctFrom(80, 77), -3);
  cerca(con('signo-ct:valor').ctPolar(3), 3);
});

test('errores de marcación, líneas de posición y situación', () => {
  assert.equal(con(null).dvM(100, -30, 'punta-carnero'), 70);
  assert.equal(con('banda-marcacion').dvM(100, -30, 'punta-carnero'), 130);
  assert.equal(con('marcacion-como-demora').dvM(100, -30, 'punta-carnero'), 330);
  ang(con('sentido-recta').oposicion('cabo-espartel', 'punta-malabata'), con(null).oposicion('cabo-espartel', 'punta-malabata') + 180);
  ang(con('sentido-recta').enfilacion('punta-carnero', 'punta-europa', 258), con(null).enfilacion('punta-carnero', 'punta-europa', 258) + 180);
  // Demora sin la opuesta: el punto queda al otro lado del faro, a la misma distancia.
  const k = con('demora-sin-opuesta'); const p = k.fixDist('cabo-espartel', 123, 4);
  const r = rhumbTo(k.P('cabo-espartel'), p);
  ang(r.bearing, 123, 0.01); cerca(r.distance, 4, 0.01);
  const m = con('lado-del-faro'); const q = m.fromMark('punta-malabata', 0, 5);
  ang(rhumbTo(m.P('punta-malabata'), q).bearing, 180, 0.01);
  // Tangente: rumbo directo y por la otra banda.
  const d = rhumbTo(S0, chart.point('cabo-trafalgar')).bearing;
  ang(con('directo').tangent(S0, 'cabo-trafalgar', 3, 'estribor'), d, 1e-6);
  const est = con(null).tangent(S0, 'cabo-trafalgar', 3, 'estribor');
  ang(con('banda').tangent(S0, 'cabo-trafalgar', 3, 'estribor'), 2 * d - est, 1e-6);
});

test('errores de viento, corriente y traslado', () => {
  // Viento del N con rumbo 090: entra por babor, abate a estribor (+10).
  assert.equal(con(null).abatimiento(90, 10, 0), 100);
  assert.equal(con('signo-abatimiento').abatimiento(90, 10, 0), 80);
  assert.equal(con('sin-abatimiento').abatimiento(90, 10, 0), 90);
  assert.equal(con(null).rvConAbatimiento(90, 10, 0), 80);
  assert.equal(con('signo-abatimiento').rvConAbatimiento(90, 10, 0), 100);
  // Barco 090 a 6 nudos, corriente hacia el N a 2 nudos.
  const ok = con(null).efectivo(90, 6, 0, 2);
  ang(ok.ref, 90 - (Math.atan2(2, 6) * 180) / Math.PI, 1e-6); cerca(ok.vef, Math.hypot(6, 2));
  const inv = con('corriente-invertida').efectivo(90, 6, 0, 2);
  ang(inv.ref, 90 + (Math.atan2(2, 6) * 180) / Math.PI, 1e-6);
  assert.deepEqual(con('sin-corriente').efectivo(90, 6, 0, 2), { ref: 90, vef: 6 });
  cerca(con('corriente-sumada').efectivo(90, 6, 0, 2).vef, 8);
  ang(con('sin-corriente').rumboConCorriente(S0, 45, 6, 90, 2).rs, 45);
  cerca(con('corriente-sumada').rumboConCorriente(S0, 45, 6, 90, 2).vef, 8);
  const ry = con('sin-corriente').rumboYVelocidad(S0, 'punta-carnero', 120, 90, 2);
  ang(ry.rs, ry.ref); cerca(ry.vb, ry.vef);
  const cd = con(null).corrienteDesconocida(S0, { lat: 36.02, lon: -5.72 }, 90);
  ang(con('corriente-invertida').corrienteDesconocida(S0, { lat: 36.02, lon: -5.72 }, 90).rc, cd.rc + 180, 1e-6);
  // Sin trasladar: el corte de las dos demoras como si fueran simultáneas.
  const sin = con('sin-traslado').traslado('cabo-espartel', 180, 'punta-malabata', 220, 70, 4);
  const sim = con(null).fix2('cabo-espartel', 180, 'punta-malabata', 220);
  cerca(sin.lat, sim.lat, 1e-9); cerca(sin.lon, sim.lon, 1e-9);
});

test('errores de tiempo: minutos por décimas de hora', () => {
  assert.equal(con(null).distFor(6, 90), 9);
  cerca(con('horas-decimales').distFor(6, 90), 7.8); // 1 h 30 min leído como 1,30 h
  assert.equal(con('horas-decimales').distFor(6, 120), 12, 'sin minutos sueltos no cambia');
  assert.equal(con(null).eta(hrb(10), 9, 6), hrb(11, 30));
  assert.equal(con('horas-decimales').eta(hrb(10), 9, 6), hrb(11, 50)); // 1,5 h leído como 1 h 50 min
});

test('errores de la estima analítica (loxodrómica)', () => {
  const a = { lat: 36, lon: -6 };
  const lista = [{ rumbo: 90, millas: 30 }];
  const ok = con(null).tramos(a, lista);
  cerca(ok.lon, -6 + 30 / Math.cos((36 * Math.PI) / 180) / 60, 1e-9);
  cerca(con('signo-dL').tramos(a, lista).lon, -6 - 30 / Math.cos((36 * Math.PI) / 180) / 60, 1e-9);
  cerca(con('sin-cos-lm').tramos(a, lista).lon, -5.5, 1e-9);
  cerca(con('cos-lm-multiplica').tramos(a, lista).lon, -6 + (30 * Math.cos((36 * Math.PI) / 180)) / 60, 1e-9);
  const sc = con('seno-coseno').tramos(a, lista); // 30 millas al N en vez de al E
  cerca(sc.lat, 36.5, 1e-9); cerca(sc.lon, -6, 1e-9);
  const norte = [{ rumbo: 45, millas: 60 }];
  const lm = con('lm-salida').tramos(a, norte);
  cerca(lm.lon, -6 + (60 * Math.SQRT1_2) / Math.cos((36 * Math.PI) / 180) / 60, 1e-9);
  const b = { lat: 36.5, lon: -5.5 };
  const rd = con(null).rumboDirecto(a, b);
  ang(con('signo-dL').rumboDirecto(a, b).rumbo, 360 - rd.rumbo, 1e-9);
  ang(con('seno-coseno').rumboDirecto(a, b).rumbo, 90 - rd.rumbo, 1e-9);
  cerca(con('sin-cos-lm').rumboDirecto(a, b).rumbo, 45, 1e-9);
  assert.ok(con('lm-salida').rumboDirecto(a, b).rumbo > rd.rumbo, 'con la latitud de salida (menor) el cos lm crece y el rumbo se abre al E');
});

test('errores de mareas: sonda de la carta, pleamar/bajamar, interpolación y hora oficial', () => {
  const tr = (k) => k.tramoMarea(TABLA, { desde: 0 }); // BM 04:00 0,5 m · PM 10:00 3,5 m
  // A las 07:00 UT (la mitad del tramo): altura 0,5 + 3 · sen²45° = 2,0 m; sonda carta 1,2 → 3,2 m.
  const k0 = con(null); cerca(k0.sondaA(tr(k0), hrb(7), 1.2), 3.2, 1e-9);
  const k1 = con('sonda-carta-olvidada'); cerca(k1.sondaA(tr(k1), hrb(7), 1.2), 2, 1e-9);
  const k2 = con('sonda-carta-signo'); cerca(k2.sondaA(tr(k2), hrb(7), 1.2), 0.8, 1e-9);
  // A las 05:00 (1 h desde la BM): bien 0,5 + 3 · sen²15°; desde la PM (5 h): 0,5 + 3 · sen²75°.
  const k3 = con(null); cerca(k3.sondaA(tr(k3), hrb(5), 0), 0.5 + 3 * Math.sin(Math.PI / 12) ** 2, 1e-9);
  const k4 = con('pleamar-bajamar'); cerca(k4.sondaA(tr(k4), hrb(5), 0), 0.5 + 3 * Math.sin((5 * Math.PI) / 12) ** 2, 1e-9);
  const k5 = con('lineal'); cerca(k5.sondaA(tr(k5), hrb(5), 0), 1, 1e-9);
  // Hora para 3,0 m de sonda con 1,0 m en la carta → altura 2,0 m (la mitad) a las 07:00 UT → 09:00 oficiales (+2 h).
  const h0 = con(null); cerca(h0.horaParaSonda(tr(h0), 3, 1, 2), hrb(9), 1e-6);
  const h1 = con('sin-adelanto'); cerca(h1.horaParaSonda(tr(h1), 3, 1, 2), hrb(7), 1e-6);
  const h2 = con('adelanto-signo'); cerca(h2.horaParaSonda(tr(h2), 3, 1, 2), hrb(5), 1e-6);
  const h3 = con('sonda-carta-olvidada'); // altura 3,0 m: sen² = 2,5/3
  cerca(h3.horaParaSonda(tr(h3), 3, 1, 2), hrb(4) + (360 * 2 * Math.asin(Math.sqrt(2.5 / 3))) / Math.PI + 120, 1e-6);
  const h4 = con('lineal'); // 1,5 / 3 de 6 h = 3 h tras la BM: 07:00 UT, igual que la buena en el punto medio
  cerca(h4.horaParaSonda(tr(h4), 3, 1, 2), hrb(9), 1e-6);
  const h5 = con('pleamar-bajamar'); // 3 h contadas desde la PM (10:00) hacia la BM: 07:00 UT
  cerca(h5.horaParaSonda(tr(h5), 3, 1, 2), hrb(9), 1e-6);
  const h6 = con('pleamar-bajamar'); // altura 1,25 m: 2 h desde la BM (06:00 UT); desde la PM, 08:00 UT
  cerca(h6.horaParaSonda(tr(h6), 2.25, 1, 2), hrb(10), 1e-6);
  const u = con(null); assert.equal(u.horaUT(hrb(9), 2), hrb(7));
  assert.equal(con('sin-adelanto').horaUT(hrb(9), 2), hrb(9));
  assert.equal(con('adelanto-signo').horaUT(hrb(9), 2), hrb(11));
});

test('diagnóstico: Ct por oposición (and-py-2016-c3-n12): la a) es la Ct con el signo cambiado', () => {
  const q = byId.get('and-py-2016-c3-n12');
  const sol = SOLUCIONES[q.id];
  const d = diagnosticar(q, 'a', { sol, chart });
  assert.equal(d.estado, 'unico');
  assert.deepEqual(d.tipos, ['signo-ct']);
  assert.equal(diagnosticar(q, q.correcta, { sol, chart }).estado, 'acierto');
});

test('diagnóstico: nunca explica la opción oficial ni la que sale sin error; solo afirma con un error único', () => {
  let n = 0;
  for (const [id, sol] of Object.entries(SOLUCIONES)) {
    if (n++ % 7) continue; // una de cada siete (el recorrido completo está en tools/diagnostico-cobertura.mjs)
    const q = byId.get(id);
    if (q.anulada || !q.correcta) continue;
    const r = resolverVariantes(q, sol, chart);
    assert.deepEqual(variantesQueLlevanA(q, r, q.correcta), [], id);
    for (const x of Object.keys(q.opciones)) {
      const d = diagnosticar(q, x, { sol, chart });
      if (d.estado === 'unico') {
        assert.notEqual(x, q.correcta);
        assert.notEqual(x, r.base.pick.choice);
        assert.equal(d.tipos.length, 1);
      }
    }
  }
});

test('errores del alumno: se apuntan por pregunta y día, y se resumen por error y por paso', () => {
  const dia = 864e5; const t0 = 100 * dia;
  let e = estadoVacio();
  e = anotaError(e, { q: 'q1', id: 'signo-ct' }, t0);
  e = anotaError(e, { q: 'q1', id: 'signo-ct' }, t0 + 1000); // misma pregunta y día: una vez
  e = anotaError(e, { q: 'q2', id: 'resta-al-reves' }, t0); // alias de los ejercicios
  e = anotaError(e, { q: 'q3', id: 'inventado' }, t0); // fuera de la taxonomía: no se apunta
  e = anotaPaso(e, { q: 'q4', paso: 'ct', ok: false }, t0);
  e = anotaPaso(e, { q: 'q4', paso: 'aguja', ok: true }, t0);
  const r = resumen(e);
  assert.deepEqual(r.errores.map((x) => [x.id, x.n]), [['signo-ct', 2]]);
  assert.equal(r.peorPaso.id, 'ct');
  assert.equal(r.peorPaso.fallos, 3);
  assert.deepEqual(leerEstado(JSON.stringify(e)), e);
  assert.deepEqual(leerEstado('roto'), estadoVacio());
  // Almacén en memoria.
  const mem = new Map();
  const a = crearAlmacenErrores({ almacen: { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) }, ahora: () => t0 });
  a.error('q1', 'signo-abatimiento'); a.paso('q1', 'abatimiento', false);
  assert.equal(a.resumen().errores[0].id, 'signo-abatimiento');
  // Caducan a los 180 días.
  const viejo = anotaError(e, { q: 'q9', id: 'lineal' }, t0 + 200 * dia);
  assert.deepEqual(viejo.ev.map((x) => x.id), ['lineal']);
  assert.equal(norm360(-1), 359);
});

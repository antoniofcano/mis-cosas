// Estrategia de examen (#/<tit>/estrategia): cifras sacadas de la estructura oficial, presupuesto de tiempo, textos por
// titulación y tribunal (cada norma con su fuente), «Tu estrategia» con los datos del alumno, y que nunca se ve ni se
// enlaza con un examen en marcha.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TITULACIONES, PER, PY, totalPreguntas } from '../src/theory/blocks.js';
import { cifrasExamen, presupuestoTiempo, textosEstrategia, tuEstrategia, estrategiaPermitida, examenesCompletos, resumenEstrategia } from '../src/course/estrategia.js';

const leer = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const D = JSON.parse(leer('data/comun/estrategia.json'));
const ficha = (eje) => JSON.parse(leer(`data/ejes/${eje}/eje.json`));
const EJES = JSON.parse(leer('data/ejes/index.json')).ejes.map((e) => e.id);

test('cifras: salen de la estructura oficial (PER 45/90/32, PY 40/120/28) y de la ficha del eje', () => {
  const p = cifrasExamen(TITULACIONES.per, ficha('andalucia'));
  assert.equal(p.preguntas, 45); assert.equal(p.duracionMin, 90); assert.equal(p.minAciertos, 32); assert.equal(p.colchon, 13);
  assert.equal(p.minPorPregunta, 2);
  assert.deepEqual(p.limites.map((l) => [l.ut, l.maxErrores, l.minBien]), [[5, 2, 3], [6, 5, 5], [11, 2, 2]]);
  assert.equal(p.enLimites, 9); assert.equal(p.colchonLibre, 4);
  assert.equal(p.calculadora.permitida, true); assert.match(p.calculadora.fuente.corto, /BOJA.*base quinta 5$/); assert.match(p.calculadora.fuente.url, /^https:/);
  assert.equal(cifrasExamen(TITULACIONES.per, ficha('dgmm')).calculadora.permitida, false);
  const y = cifrasExamen(TITULACIONES.py, ficha('dgmm'));
  assert.equal(y.preguntas, 40); assert.equal(y.colchon, 12); assert.equal(y.colchonLibre, 4);
  assert.deepEqual(y.modulos.map((m) => [m.id, m.duracionMin, m.preguntas]), [['generico', 45, 20], ['navegacion', 75, 20]]);
  assert.deepEqual(y.modulos[1].limites, ['Teoría de navegación', 'Carta de navegación']);
  assert.ok(y.reglasTribunal.some((r) => /dos horas/.test(r)));
});

test('presupuesto de tiempo: cuadra con la duración, la carta se lleva lo que no es teoría ni repaso', () => {
  for (const T of Object.values(TITULACIONES)) {
    for (const t of presupuestoTiempo(T, D.tiempo)) {
      assert.equal(t.filas.reduce((s, f) => s + f.minutos, 0), t.duracionMin, `${T.id} ${t.id}`);
      assert.ok(t.hito > 0 && t.hito < t.repasoDesde && t.repasoDesde <= t.duracionMin);
      for (const f of t.filas) assert.ok(f.minutos >= 0);
    }
  }
  const [per] = presupuestoTiempo(TITULACIONES.per, D.tiempo);
  const carta = per.filas.find((f) => f.parte === 'carta');
  assert.equal(carta.preguntas, 4);
  assert.equal(per.filas.find((f) => f.parte === 'teoria').preguntas, 41);
  // La carta lleva dibujo y cuenta: más tiempo por pregunta que la teoría.
  assert.ok(carta.porPregunta > per.filas[0].porPregunta * 3);
  const py = presupuestoTiempo(TITULACIONES.py, D.tiempo);
  assert.deepEqual(py.map((t) => t.id), ['generico', 'navegacion']);
  assert.ok(py[0].filas.some((f) => f.parte === 'margen'), 'el genérico no tiene carta: margen para las dudosas');
  assert.equal(py[1].filas.find((f) => f.parte === 'carta').preguntas, 10);
});

test('datos: cada norma cita una fuente que existe; las oficiales llevan URL; sin nombres de academias', () => {
  const F = D.fuentes;
  const todas = [];
  const recorre = (x) => { if (Array.isArray(x)) x.forEach(recorre); else if (x && typeof x === 'object') { if (x.texto && x.tipo) todas.push(x); Object.values(x).forEach(recorre); } };
  recorre(D);
  assert.ok(todas.length > 30);
  for (const x of todas) {
    assert.ok(['norma', 'consejo'].includes(x.tipo), x.texto);
    if (x.tipo === 'norma') assert.ok(F[x.fuente], `norma sin fuente: ${x.texto}`);
  }
  for (const id of ['rd875', 'boja2025', 'boe2026']) assert.match(F[id].url, /^https:\/\/www\.(boe\.es|juntadeandalucia\.es)\//);
  assert.doesNotMatch(JSON.stringify(D), /academia|escuela náutica/i);
  // Todos los tribunales publicados tienen su ficha de estrategia.
  for (const e of EJES) assert.ok(D.tribunales[e], e);
});

test('rigor: «en blanco = fallo, contestar no perjudica» solo donde está comprobado; si no, queda pendiente', () => {
  for (const e of EJES) {
    for (const tit of ['per', 'py']) {
      const tx = textosEstrategia(D, { tit, eje: e, calculadora: true });
      const dice = tx.noSabes.some((x) => /nunca te perjudica|lo mismo que una fallada/.test(x.texto));
      assert.equal(dice, tx.correccion.verificado, `${e} ${tit}`);
      if (tx.correccion.verificado) assert.ok(tx.correccion.base.fuente?.url, `${e}: la corrección comprobada cita su convocatoria`);
      else assert.ok(tx.correccion.pendiente && tx.correccion.normas.length === 0, e);
    }
  }
  // Baleares: sin convocatoria revisada, no se afirma.
  assert.equal(textosEstrategia(D, { tit: 'per', eje: 'baleares', calculadora: true }).correccion.verificado, false);
  // Un tribunal sin ficha de estrategia: nada afirmado y un pendiente que lo dice.
  const otro = textosEstrategia(D, { tit: 'per', eje: 'nuevo', calculadora: false });
  assert.equal(otro.correccion.verificado, false);
  assert.ok(otro.pendientes.length >= 1);
});

test('textos: cada titulación ve lo suyo (material, módulos, calculadora)', () => {
  const per = textosEstrategia(D, { tit: 'per', eje: 'andalucia', calculadora: true });
  const py = textosEstrategia(D, { tit: 'py', eje: 'andalucia', calculadora: true });
  assert.ok(per.tribunal.dia.some((x) => /en el PER/.test(x.texto)));
  assert.ok(!per.tribunal.dia.some((x) => /módulo de navegación del PY/.test(x.texto)));
  assert.ok(py.tribunal.dia.some((x) => /módulo de navegación del PY/.test(x.texto)));
  assert.equal(per.py, null);
  assert.ok(py.py.modulos.length && py.py.consejos.length);
  assert.ok(per.pendientes.every((p) => !/módulo/i.test(p)), 'los pendientes de módulos no salen en el PER');
  // El reloj único del PY solo se afirma donde la ficha lo dice (Madrid).
  assert.equal(textosEstrategia(D, { tit: 'py', eje: 'dgmm', calculadora: true }).py.reloj.comprobado, true);
  assert.equal(py.py.reloj.comprobado, false);
  assert.match(textosEstrategia(D, { tit: 'per', eje: 'dgmm', calculadora: false }).calculadora, /Sin calculadora/);
  for (const x of per.tribunal.dia) assert.equal(x.tipo, 'norma');
  for (const x of [...per.orden, ...per.leer, ...per.repaso, ...per.diaAntes, ...per.diaExamen]) assert.equal(x.tipo, 'consejo', x.texto);
});

// --- Capa 2: tu estrategia
const T0 = Date.UTC(2026, 9, 1);
const sim = (aciertos, minutos, porTema, extra = {}) => ({ tit: 'per', eje: 'andalucia', tipo: 'simulacro', total: 45, aciertos, minutos, apto: aciertos >= 32, porTema, t: new Date(T0).toISOString(), ...extra });
const temasPER = (fallos) => PER.bloques.map((b) => ({ ut: b.ut, total: b.n, aciertos: b.n - (fallos[b.ut] ?? 0) }));

test('tu estrategia sin datos: lo dice e invita a un simulacro', () => {
  const r = tuEstrategia({ estructura: PER, tests: [], listo: null });
  assert.equal(r.suficiente, false); assert.equal(r.simulacros, 0);
  assert.equal(r.consejos.length, 0);
  assert.match(r.aviso, /simulacro/);
  // Los simulacros de un solo módulo (apto null) no cuentan como examen completo.
  const mod = tuEstrategia({ estructura: PY, tests: [{ tipo: 'modulo', total: 20, aciertos: 15, minutos: 40, apto: null, porTema: [] }] });
  assert.equal(mod.simulacros, 0); assert.equal(mod.suficiente, false);
});

test('tu estrategia: el tema con límite más justo, el tiempo y el colchón', () => {
  // RIPA: 4, 5 y 6 fallos (máximo 5): se pasó una vez. Balizamiento y carta, con margen.
  const tests = [sim(36, 85, temasPER({ 6: 4, 5: 0, 11: 1 })), sim(35, 88, temasPER({ 6: 5, 5: 1, 11: 0 })), sim(30, 90, temasPER({ 6: 6, 5: 1, 11: 1 }))];
  const r = tuEstrategia({ estructura: PER, tests });
  assert.equal(r.simulacros, 3);
  assert.equal(r.masCerca.ut, 6);
  assert.equal(r.masCerca.media, 5); assert.equal(r.masCerca.peor, 6); assert.equal(r.masCerca.pasado, 1);
  assert.equal(r.tiempo.estado, 'justo'); assert.equal(r.tiempo.agotados, 1);
  assert.ok(Math.abs(r.colchon.media - (9 + 10 + 15) / 3) < 1e-9);
  assert.ok(r.consejos.length >= 2 && r.consejos.length <= 3);
  assert.match(r.consejos[0].texto, /Reglamento \(RIPA\) es tu límite más justo/);
  assert.equal(r.consejos[0].ut, 6);
  assert.match(r.consejos[1].texto, /Vas justo de tiempo/);
  assert.doesNotMatch(r.consejos.map((k) => k.texto).join(' '), /undefined|NaN|null/);
});

test('tu estrategia: holgado de tiempo y con colchón; un solo simulacro es una pista', () => {
  const r = tuEstrategia({ estructura: PER, tests: [sim(42, 40, temasPER({ 6: 1 }))] });
  assert.equal(r.tiempo.estado, 'holgado');
  assert.match(r.consejos.map((k) => k.texto).join(' '), /Te sobra tiempo/);
  assert.match(r.consejos.map((k) => k.texto).join(' '), /colchón/);
  assert.match(r.aviso, /un solo simulacro/);
});

test('tu estrategia: con «¿Estás listo?» y sin simulacros, el límite sale del modelo y falta el tiempo', () => {
  const listo = { temas: [{ ut: 5, suficiente: true, pFallaLimite: 0.05 }, { ut: 6, suficiente: true, pFallaLimite: 0.1 }, { ut: 11, suficiente: true, pFallaLimite: 0.4 }] };
  const r = tuEstrategia({ estructura: PER, tests: [], listo });
  assert.equal(r.suficiente, true); assert.equal(r.tiempo, null);
  assert.equal(r.masCerca.ut, 11);
  assert.match(r.consejos[0].texto, /Carta de navegación es tu límite más justo: .* 40 de cada 100/);
  assert.match(r.aviso, /falta tu tiempo/);
  // Temas sin datos suficientes en el modelo no opinan.
  assert.equal(tuEstrategia({ estructura: PER, listo: { temas: [{ ut: 6, suficiente: false, pFallaLimite: 0.9 }] } }).masCerca, null);
});

test('solo cuentan los exámenes completos más recientes', () => {
  const ts = Array.from({ length: 8 }, (_, i) => sim(40, 60 + i, temasPER({})));
  assert.equal(examenesCompletos(ts).length, 5);
  assert.deepEqual(examenesCompletos(ts).map((t) => t.minutos), [63, 64, 65, 66, 67]);
});

test('resumen para asistentes: sin iconos y con las cifras', () => {
  const c = cifrasExamen(TITULACIONES.per, ficha('andalucia'));
  const s = resumenEstrategia(c, presupuestoTiempo(TITULACIONES.per, D.tiempo), tuEstrategia({ estructura: PER }));
  assert.match(s, /45 preguntas, 90 min/);
  assert.match(s, /TU ESTRATEGIA: Aún no hay datos/);
  assert.equal(totalPreguntas(PY), 40);
});

// --- Nunca durante un examen en marcha
test('la estrategia no se enseña con un examen en marcha ni en una dirección de examen', () => {
  assert.equal(estrategiaPermitida({ modo: null, hash: '#/per/estrategia' }), true);
  for (const modo of ['examen', 'final']) assert.equal(estrategiaPermitida({ modo, hash: '#/per/estrategia' }), false, modo);
  for (const hash of ['#/per/test/simulacro?s=1', '#/py/test/real/and-py-2024-c1', '#/per/test/final']) assert.equal(estrategiaPermitida({ hash }), false, hash);
});

test('el examen en marcha no enlaza la estrategia (solo la pantalla de inicio, antes del reloj)', () => {
  const src = leer('src/ui/views/theory.js');
  const i = src.indexOf('export function testView');
  const cuerpo = src.slice(i);
  const ini = cuerpo.indexOf('function inicio(');
  const corre = cuerpo.indexOf('function correr(');
  const res = cuerpo.indexOf('function resultados(');
  assert.ok(ini > 0 && corre > ini && res > corre);
  assert.match(cuerpo.slice(ini, corre), /\['estrategia'\]/, 'la pantalla de inicio la enlaza');
  assert.doesNotMatch(cuerpo.slice(corre, res), /estrategia/, 'el examen en marcha no');
  // La vista se protege sola (segunda barrera) y la pantalla Examen y la Biblioteca la enlazan.
  assert.match(leer('src/ui/views/estrategia.js'), /estrategiaPermitida\(\{ modo: modoExamen\(\)/);
  assert.match(src.slice(src.indexOf('export function examenesView'), i), /\['estrategia'\]/);
  assert.match(leer('src/ui/views/biblioteca.js'), /\['estrategia'\]/);
  // Ninguna pieza que se pinta durante el examen (barra, modo examen, calculadora, bloc) la nombra.
  for (const f of ['src/ui/actividad.js', 'src/ui/modo-examen.js', 'src/ui/calculadora.js', 'src/ui/bloc.js']) assert.doesNotMatch(leer(f), /estrategia/, f);
});

test('la ruta está registrada y cuenta como pestaña Examen', () => {
  const app = leer('src/ui/app.js');
  assert.match(app, /estrategia: estrategiaView/);
  assert.match(app, /b === 'estrategia'\) return 'examen'/);
});

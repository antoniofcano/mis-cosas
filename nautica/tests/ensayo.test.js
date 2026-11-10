// Ensayo general en papel (R-41): partes y tiempos (sin inventar normas), preguntas como un simulacro, corrección de la
// hoja de respuestas con las reglas reales, la cuenta de ensayos para la estrategia y la semana, y que durante el ensayo
// la app no ofrece ninguna ayuda (solo enunciados y reloj).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TITULACIONES, totalPreguntas } from '../src/theory/blocks.js';
import { partesEnsayo, parteValida, estructuraEnsayo, buildEnsayo, leerHoja, corregirHoja, cuentaEnsayos, ensayosHechos, SIN_AYUDAS, ENSAYOS_RECOMENDADOS, tituloEnsayo } from '../src/theory/ensayo.js';
import { recordatorioEnsayos } from '../src/course/semana.js';
import { estrategiaPermitida } from '../src/course/estrategia.js';
import { planHoy } from '../src/course/plan.js';
import { createRng } from '../src/math/rng.js';

const leer = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const D = JSON.parse(leer('data/comun/estrategia.json'));
const { per: PER, py: PY } = TITULACIONES;

test('partes: el módulo de navegación del PY (oficial, 75 min) y la navegación y carta del PER (tiempo orientativo)', () => {
  assert.deepEqual(partesEnsayo(PY).map((p) => p.id), ['navegacion', 'completo']);
  assert.deepEqual(partesEnsayo(PER).map((p) => p.id), ['carta', 'completo']);
  assert.equal(parteValida(PY, 'carta'), 'navegacion', 'una parte que no existe en esa titulación: la recomendada');
  assert.equal(parteValida(PER, 'completo'), 'completo');
  const nav = estructuraEnsayo(PY, 'navegacion', D.tiempo);
  assert.equal(nav.duracionMin, 75); assert.equal(nav.oficial, true); assert.equal(totalPreguntas(nav), 20);
  assert.deepEqual(nav.bloques.map((b) => [b.ut, b.maxErrores]), [[3, 5], [4, 3]]);
  const carta = estructuraEnsayo(PER, 'carta', D.tiempo);
  // 4 de carta con los 32 min que les deja el presupuesto + 5 de teoría de navegación a 1,2 min.
  assert.equal(carta.duracionMin, 38); assert.equal(carta.oficial, false); assert.equal(carta.modulo, 'carta');
  assert.deepEqual(carta.bloques.map((b) => [b.ut, b.n, b.maxErrores ?? null]), [[10, 5, null], [11, 4, 2]]);
  const todo = estructuraEnsayo(PER, 'completo');
  assert.equal(todo.duracionMin, 90); assert.equal(todo.oficial, true); assert.equal(totalPreguntas(todo), 45);
  assert.match(partesEnsayo(PER)[0].sub, /orientativo/);
  assert.equal(tituloEnsayo(nav), 'Ensayo en papel · módulo de navegación');
});

/** Banco de juguete: n preguntas por tema, con la correcta en «a». */
const banco = (E, n = 12) => E.bloques.flatMap((b) => Array.from({ length: n }, (_, i) => ({ id: `t${b.ut}-${i}`, ut: b.ut, correcta: 'a', opciones: { a: 'uno', b: 'dos', c: 'tres', d: 'cuatro' } })));

test('preguntas: como un simulacro de esa parte, reproducibles con la semilla', () => {
  const E1 = estructuraEnsayo(PY, 'navegacion', D.tiempo);
  const t = buildEnsayo(E1, banco(PY.estructura), createRng(7));
  assert.equal(t.tipo, 'ensayo'); assert.equal(t.parte, 'navegacion'); assert.equal(t.preguntas.length, 20);
  assert.deepEqual(t.preguntas.map((q) => q.ut).filter((u, i, a) => a.indexOf(u) === i), [3, 4]);
  assert.deepEqual(buildEnsayo(E1, banco(PY.estructura), createRng(7)).preguntas.map((q) => q.id), t.preguntas.map((q) => q.id));
});

test('hoja de respuestas: por número, en blanco lo vacío y lo que no es una letra de la pregunta', () => {
  const E1 = estructuraEnsayo(PER, 'carta', D.tiempo);
  const t = buildEnsayo(E1, banco(PER.estructura), createRng(3));
  const { respuestas, marcadas, enBlanco } = leerHoja(t, { 1: 'a', 2: 'B', 3: 'z', 4: '', 5: null, 6: 'c' });
  assert.equal(marcadas, 3);
  assert.deepEqual(enBlanco, [3, 4, 5, 7, 8, 9]);
  assert.equal(respuestas[t.preguntas[1].id], 'b', 'mayúsculas valen');
});

test('corrección con las reglas reales: límite de Carta (2) en la parte del PER, aprobado completo en el examen entero', () => {
  const E1 = estructuraEnsayo(PER, 'carta', D.tiempo);
  const t = buildEnsayo(E1, banco(PER.estructura), createRng(3));
  const idx = (ut) => t.preguntas.map((q, i) => (q.ut === ut ? i + 1 : null)).filter(Boolean);
  // Todo bien salvo 3 de carta (una en blanco): suspende por el límite de Carta aunque acierte 6 de 9.
  const hoja = Object.fromEntries(t.preguntas.map((_, i) => [i + 1, 'a']));
  const carta = idx(11);
  hoja[carta[0]] = 'b'; hoja[carta[1]] = 'c'; delete hoja[carta[2]];
  const g = corregirHoja(E1, t, hoja);
  assert.equal(g.aciertos, 6); assert.equal(g.apto, false);
  assert.deepEqual(g.motivos, ['Carta de navegación: 3 errores (máximo 2).']);
  assert.deepEqual(g.enBlanco, [carta[2]]);
  hoja[carta[2]] = 'a';
  assert.equal(corregirHoja(E1, t, hoja).apto, true, 'con dos fallos de carta, dentro del límite');
  // Examen completo: la nota global (32 de 45) cuenta.
  const EC = estructuraEnsayo(PER, 'completo');
  const tc = buildEnsayo(EC, banco(PER.estructura), createRng(4));
  const casi = Object.fromEntries(tc.preguntas.map((q, i) => [i + 1, i < 31 ? 'a' : 'b']));
  const gc = corregirHoja(EC, tc, casi);
  assert.equal(gc.aciertos, 31); assert.equal(gc.apto, false); assert.match(gc.motivos[0], /Necesitas 32 aciertos/);
});

test('cuenta de ensayos para la estrategia y la semana: al menos dos', () => {
  assert.equal(ENSAYOS_RECOMENDADOS, 2);
  const tests = [{ tipo: 'simulacro' }, { tipo: 'ensayo', parte: 'carta' }];
  assert.equal(ensayosHechos(tests).length, 1);
  const c = cuentaEnsayos(tests);
  assert.equal(c.hechos, 1); assert.equal(c.faltan, 1); assert.match(c.texto, /Llevas 1 de 2 ensayos en papel\. Haz otro/);
  assert.match(cuentaEnsayos([]).texto, /al menos 2 ensayos en papel/);
  assert.equal(cuentaEnsayos([...tests, { tipo: 'ensayo' }]).faltan, 0);
  const r = recordatorioEnsayos(tests, { dias: 5 });
  assert.equal(r.proponer, true); assert.match(r.texto, /haz otro con la carta de papel/);
  assert.equal(recordatorioEnsayos(tests, { dias: 1 }).proponer, false, 'la víspera, no se propone');
  assert.match(recordatorioEnsayos([{ tipo: 'ensayo' }, { tipo: 'ensayo' }], { dias: 5 }).texto, /Llevas 2 ensayos/);
});

test('un ensayo a medias se retoma en su dirección, con su parte', () => {
  const tc = { tit: 'py', eje: 'andalucia', tipo: 'ensayo', parte: 'navegacion', seed: 12, consumidoMs: 15 * 60000, duracionMin: 75 };
  const p = planHoy({ estructura: PY.estructura, testEnCurso: tc });
  const a = p.find((x) => x.tipo === 'examen-en-curso');
  assert.deepEqual(a.ruta, ['test', 'ensayo']); assert.deepEqual(a.query, { s: '12', p: 'navegacion' });
  assert.equal(a.minutos, 60); assert.equal(a.titulo, 'Ensayo en papel a medias');
});

test('durante el ensayo, nada de la práctica: ni mesa de cartas, ni bloc, ni calculadora de la app, ni fórmulas, ni paso a paso', () => {
  assert.ok(Object.values(SIN_AYUDAS).every((v) => v === false));
  const ui = leer('src/ui/ensayo.js');
  const imports = [...ui.matchAll(/^import .* from '([^']+)';$/gm)].map((m) => m[1]);
  assert.deepEqual(imports.sort(), ['../bancos/index.js', '../texto.js', '../theory/ensayo.js', './actividad.js', './dom.js', './iconos.js'].sort());
  assert.doesNotMatch(ui, /openWorkspace|botonCarta|botonBloc|botonCalculadora|crearAyudas|guiadoPanel|glosar|formulas/);
  // La vista del examen arranca el ensayo en modo examen y sin calculadora de la app, sin carta ni bloc.
  const src = leer('src/ui/views/theory.js');
  const papel = src.slice(src.indexOf('function correrPapel('), src.indexOf('function resultados('));
  assert.match(papel, /fijarModoExamen\('examen', \{ calculadora: false \}\)/);
  assert.match(papel, /bloquearCalculadora\(el\)/);
  assert.doesNotMatch(papel, /botonCarta|cartaDeExamen|botonBloc|botonCalculadora|guiado|questionCard|estrategia/);
  // Es una dirección de examen: la estrategia (y con ella todo lo que solo se ve fuera de un examen) no se abre.
  assert.equal(estrategiaPermitida({ hash: '#/py/test/ensayo?p=navegacion&s=3' }), false);
  // La preparación y el cuadernillo no son el examen: ahí sí se enlaza el material y la estrategia.
  assert.match(leer('src/ui/app.js'), /ensayo: ensayoView/);
});

test('la preparación lista el material del tribunal (normas con fuente) y avisa de que la carta la pone el alumno', () => {
  const v = leer('src/ui/views/ensayo.js');
  assert.match(v, /\.\.\.tx\.tribunal\.dia/, 'el material sale de la estrategia (por tribunal y titulación), no se inventa');
  assert.match(v, /Instituto Hidrográfico de la Marina y tiene derechos/);
  assert.match(v, /window\.print\(\)/);
  // Andalucía, PER: lápiz, goma, bolígrafo, transportador, compás; la carta la da el tribunal.
  const dia = D.tribunales.andalucia.dia.filter((x) => !x.tit || x.tit === 'per').map((x) => x.texto).join(' ');
  assert.match(dia, /transportador de ángulos y compás/); assert.match(dia, /carta del Estrecho te la da el tribunal/);
});

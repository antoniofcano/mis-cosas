// Chuleta de la práctica: datos (data/comun/chuletario.json), selección por tema y ejercicio, y la regla de oro:
// nunca en simulacros, exámenes reales ni en el examen final.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { MODOS_PRACTICA, MODOS_EXAMEN, chuletaPermitida, esRutaDeExamen, fichasPara, chuletasDeClases } from '../src/course/chuletario.js';
import { EXERCISES } from '../src/exercises/registry.js';
import { PER, PY } from '../src/theory/blocks.js';

const leer = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const C = JSON.parse(leer('data/comun/chuletario.json'));
const curso = { per: JSON.parse(leer('data/curso/per.json')), py: JSON.parse(leer('data/curso/py.json')) };

test('la chuleta solo se permite en los modos de práctica', () => {
  for (const m of MODOS_PRACTICA) assert.equal(chuletaPermitida(m), true, m);
  for (const m of [...MODOS_EXAMEN, 'examen', 'examen-final', undefined, null, '', 'otro-modo-nuevo']) assert.equal(chuletaPermitida(m), false, String(m));
  for (const m of ['simulacro', 'real', 'final']) assert.ok(MODOS_EXAMEN.includes(m), m);
  assert.equal(MODOS_PRACTICA.filter((m) => MODOS_EXAMEN.includes(m)).length, 0);
});

test('las direcciones de examen se reconocen (segunda barrera)', () => {
  for (const r of ['#/per/test/simulacro?s=123', '#/py/test/real/2024-1', '#/per/test/final', '#/py/examen-final', '#/per/final', '#/py/examenfinal', '#/test/simulacro']) assert.equal(esRutaDeExamen(r), true, r);
  for (const r of ['#/ej/conversion-rumbos?s=1', '#/per/teoria/ut/5?s=9', '#/py/teoria/mezcla?s=1', '#/per/teoria/repaso', '#/py/teoria/rapido?s=4',
    '#/per/curso/per-11-2', '#/py/curso/py-4-9?practica=1', '#/q/and-py-2021-c2-n31', '#/per/examenes']) assert.equal(esRutaDeExamen(r), false, r);
});

const fuentesUi = () => {
  const dir = (d) => readdirSync(new URL(`../${d}`, import.meta.url)).filter((f) => f.endsWith('.js')).map((f) => `${d}/${f}`);
  return ['src/ui', 'src/ui/views', 'src/ui/chart'].flatMap(dir);
};

/** Los contextos de la chuleta que pide la interfaz (`crearAyudas({ modo… })` o `enTema = { modo… }`), con su modo. */
function llamadas() {
  return fuentesUi().flatMap((f) => [...leer(f).matchAll(/(?:crearAyudas\(\{\s*|enTema = \{\s*)modo:\s*([^,}]+)/g)].map((m) => ({ f, modo: m[1] })));
}

test('ninguna pantalla pide la chuleta con un modo de examen: todos los modos son de práctica', () => {
  const ls = llamadas();
  assert.ok(ls.length >= 7, `solo ${ls.length} llamadas`);
  // Toda llamada a crearAyudas lleva su modo a la vista (literal o en `enTema`), o hereda el de la vista (mesa de cartas).
  for (const f of fuentesUi()) {
    for (const m of leer(f).matchAll(/crearAyudas\(([^)]*)\)/g)) assert.match(m[1], /^\{\s*modo:|^enTema$|^\{ \.\.\.o\.ayudas, flotante: true \}$|^ctx$/, `${f}: ${m[0]}`);
  }
  for (const { f, modo } of ls) {
    const literales = [...modo.matchAll(/'([^']+)'/g)].map((m) => m[1]);
    assert.ok(literales.length, `${f}: el modo de la chuleta debe ser un texto fijo (${modo})`);
    for (const l of literales) assert.ok(chuletaPermitida(l), `${f}: modo «${l}» no es de práctica`);
  }
});

test('el examen (simulacro, real y el futuro examen final) no usa la chuleta ni la pasa a la carta', () => {
  const src = leer('src/ui/views/theory.js');
  const i = src.indexOf('export function testView');
  assert.ok(i > 0);
  const resto = src.slice(i + 10);
  const cuerpo = resto.slice(0, resto.search(/\nexport |$/));
  assert.doesNotMatch(cuerpo, /crearAyudas|ayudas|chuleta/i);
  // «Abrir la carta» en el examen: sin el contexto de práctica (tercer argumento) no hay chuleta en la mesa.
  for (const m of cuerpo.matchAll(/botonCarta\(([^)]*)\)/g)) assert.equal(m[1].split(',').length, 2, m[0]);
  // Y ningún fichero de examen futuro la importa.
  for (const f of readdirSync(new URL('../src/ui/views/', import.meta.url))) {
    if (/final|examen|simulacro/i.test(f)) assert.doesNotMatch(leer(`src/ui/views/${f}`), /ayudas\.js|crearAyudas/, f);
  }
});

test('datos: cada ficha citada existe, con título y líneas; todos los ejercicios de carta tienen su chuleta', () => {
  for (const [id, f] of Object.entries(C.fichas)) {
    assert.ok(f.titulo && f.lineas?.length, id);
    for (const l of f.lineas) {
      assert.equal((l.match(/\*\*/g) ?? []).length % 2, 0, `${id}: negrita sin cerrar en «${l}»`);
      // El signo menos es «−» (como en las clases), no un guion entre símbolos.
      assert.doesNotMatch(l, /[\p{L}\d)′°]\s-\s[\p{L}\d(]/u, `${id}: «-» en vez de «−» en «${l}»`);
      assert.doesNotMatch(l, /sirocodiez|academia|escuela/i);
    }
  }
  const usadas = new Set();
  for (const [tit, temas] of Object.entries(C.temas)) {
    const E = { per: PER, py: PY }[tit];
    assert.ok(E, tit);
    for (const [ut, ids] of Object.entries(temas)) {
      assert.ok(E.bloques.some((b) => String(b.ut) === ut), `${tit} UT ${ut}`);
      for (const id of ids) { assert.ok(C.fichas[id], `${tit}-${ut}: ${id}`); usadas.add(id); }
    }
  }
  for (const [e, ids] of Object.entries(C.ejercicios)) {
    assert.ok(EXERCISES.some((x) => x.id === e), `ejercicio desconocido ${e}`);
    for (const id of ids) { assert.ok(C.fichas[id], `${e}: ${id}`); usadas.add(id); }
  }
  for (const x of EXERCISES) assert.ok(C.ejercicios[x.id]?.length, `el ejercicio ${x.id} no tiene chuleta`);
  assert.deepEqual(Object.keys(C.fichas).filter((id) => !usadas.has(id)), [], 'fichas que nadie cita');
});

test('datos: las fórmulas usan la misma notación que las clases', () => {
  const texto = JSON.stringify(C.fichas);
  const clases = [curso.per, curso.py].flatMap((c) => c.modulos.flatMap((m) => m.lecciones.flatMap((l) => l.chuleta ?? []))).join('\n');
  for (const f of ['Ct = dm + Δ', 'Rv = Ra + Ct', 'Ra = Rv − Ct', 'Dv = Da + Ct', 'Dv = Rv + M', 'Ct = Dv − Da', 'Δ = Ct − dm', 'Rs = Rv + Ab', 'Rv = Rs − Ab',
    'Δl = D · cos R', 'A = D · sen R', 'lm = l salida + Δl / 2', 'ΔL = A / cos lm', 'D = √(Δl² + A²)', 'HcL = TU + L', 'GM = KM − KG', 'GZ = GM · sen θ']) {
    assert.ok(texto.includes(f), `chuletario sin «${f}»`);
    assert.ok(clases.includes(f), `las clases no escriben «${f}»: revisa la notación`);
  }
  // Signos: E y NE positivos, W y NW negativos; abatimiento con viento por babor positivo.
  assert.match(texto, /E o NE \(\+\)\*\* · \*\*W o NW \(−\)/);
  assert.match(texto, /babor: Ab \(\+\)\*\* · por \*\*estribor: Ab \(−\)/);
});

test('datos: los ejemplos numéricos son correctos', () => {
  const t = JSON.stringify(C.fichas);
  const coma = (x, d) => x.toFixed(d).replace('.', ',');
  assert.ok(t.includes(`36 + 7,3 / 60 = ${coma(36 + 7.3 / 60, 4)}°`));
  assert.ok(t.includes(`18 / 60 = ${coma(18 / 60, 1)}′`));
  assert.ok(t.includes(`0,977 × 60 = ${coma(0.977 * 60, 1)}′`));
  assert.ok(t.includes(`40 / 60 = ${coma(40 / 60, 2)} h`) && t.includes(`1 h 40 min = ${coma(1 + 40 / 60, 2)} h`));
  assert.ok(t.includes(`0,35 h × 60 = ${Math.round(0.35 * 60)} min`));
  assert.ok(t.includes(`= ${coma(2 + 15 / 60 + 36 / 3600, 2)} h`));
  assert.ok(t.includes(`d = 6 × 0,67 = ${6 * 40 / 60} millas`));
  assert.ok(t.includes(`S 40° W = 180° + 40° = ${180 + 40}°`));
  assert.ok(t.includes(`Za 357° → Ct = +${360 - 357}°`));
  // Duodécimos: 1 + 2 + 3 + 3 + 2 + 1 = 12 doceavos (toda la amplitud) y coinciden con la fórmula del coseno.
  const C6 = (k) => (1 - Math.cos(Math.PI * k / 6)) / 2;
  const doceavos = [1, 2, 3, 3, 2, 1];
  assert.equal(doceavos.reduce((a, b) => a + b), 12);
  doceavos.reduce((acum, d, k) => { assert.ok(Math.abs((acum + d) / 12 - C6(k + 1)) < 0.04, `sexto ${k + 1}`); return acum + d; }, 0);
  // C = A · sen²(90° · I / D) es la misma curva que A · (1 − cos(180° · I / D)) / 2 (la de los ejercicios).
  for (const f of [0, 0.2, 0.5, 0.9, 1]) assert.ok(Math.abs(Math.sin(Math.PI / 2 * f) ** 2 - (1 - Math.cos(Math.PI * f)) / 2) < 1e-12);
});

test('selección: primero lo del ejercicio, después lo del tema; y las chuletas de las clases que vienen a cuento', () => {
  const ej = fichasPara(C, { tit: 'per', ut: 11, ejercicios: ['conversion-rumbos'] }).map((f) => f.id);
  assert.deepEqual(ej, C.ejercicios['conversion-rumbos']);
  const tema = fichasPara(C, { tit: 'py', ut: 4 }).map((f) => f.id);
  assert.deepEqual(tema, C.temas.py['4']);
  assert.deepEqual(fichasPara(C, { tit: 'per', ut: 1 }), []);
  assert.deepEqual(fichasPara(null, { tit: 'per', ut: 11 }), []);
  assert.equal(new Set(fichasPara(C, { tit: 'py', ut: 3, ejercicios: ['marea-sonda', 'hora'] }).map((f) => f.id)).size, fichasPara(C, { tit: 'py', ut: 3, ejercicios: ['marea-sonda', 'hora'] }).length);

  const una = chuletasDeClases(curso.per, { leccion: 'per-11-2', ut: 11 });
  assert.deepEqual(una.map((c) => c.id), ['per-11-2']);
  assert.ok(una[0].lineas.length);
  const deEj = chuletasDeClases(curso.per, { ejercicios: ['conversion-rumbos'], ut: 11 }).map((c) => c.id);
  assert.ok(deEj.includes('per-11-2') && deEj.includes('per-10-5'), deEj.join());
  const delTema = chuletasDeClases(curso.py, { ut: 2 });
  assert.equal(delTema.length, curso.py.modulos.find((m) => m.ut === 2).lecciones.filter((l) => l.chuleta?.length).length);
});

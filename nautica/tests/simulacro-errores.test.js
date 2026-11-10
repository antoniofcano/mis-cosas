// Simulacro de tus errores (R-43): el índice estático de distractores está al día, coincide con el diagnóstico en vivo
// y no trae reservadas; la selección respeta el estudio, prioriza y reparte; la corrección dice «has vuelto a…» y los
// aciertos bajan el contador del error.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { todosLosIndices, porError } from '../tools/indice-errores.mjs';
import { RAIZ, bancosNode } from '../tools/bancos/leer.mjs';
import { SOLUCIONES } from '../src/bancos/soluciones.js';
import { diagnosticar } from '../src/exams/diagnostico.js';
import { ERRORES, fraseOtraVez } from '../src/exams/taxonomia.js';
import { armarSimulacroErrores, elegirErrores, preguntasPorError, corregirErrores, minutosSimulacro, estructuraErrores, textoMotivo, OBJETIVO, MINIMO } from '../src/course/simulacro-errores.js';
import { estadoVacio, anotaError, anotaSuperado, resumen, leerEstado } from '../src/store/errores.js';
import { grade, testDesdeIds } from '../src/theory/engine.js';
import { TITULACIONES } from '../src/theory/blocks.js';
import { createRng } from '../src/math/rng.js';
import { chart } from './helpers.js';

const indices = await todosLosIndices();
const B = bancosNode();

test('índice de distractores: uno por banco, al día (node tools/indice-errores.mjs) y en el precaché', () => {
  const lista = readFileSync(join(RAIZ, 'sw-lista.js'), 'utf8');
  for (const x of indices) {
    const f = join(RAIZ, x.ruta);
    assert.ok(existsSync(f), `${x.ruta}: falta (node tools/indice-errores.mjs)`);
    assert.equal(readFileSync(f, 'utf8'), x.texto, `${x.ruta}: no está al día (node tools/indice-errores.mjs)`);
    assert.ok(lista.includes(`"${x.ruta}"`), `${x.ruta}: no está en el precaché (npm run precache)`);
    assert.ok(Object.keys(x.indice.preguntas).length > 0, `${x.ruta}: vacío`);
  }
});

test('índice de distractores: solo preguntas del estudio (nunca reservadas, retiradas ni anuladas)', async () => {
  for (const x of indices) {
    const banco = await B.cargarBanco(x.eje, x.tit);
    const estudio = new Set(banco.estudio.map((q) => q.id));
    for (const [id, d] of Object.entries(x.indice.preguntas)) {
      assert.ok(!banco.reservadas.has(id), `${x.ruta}: ${id} es reservada`);
      assert.ok(estudio.has(id), `${x.ruta}: ${id} no es del estudio`);
      const q = banco.porId.get(id);
      assert.ok(!q.anulada && q.correcta && q.norma?.estado !== 'retirada', `${x.ruta}: ${id}`);
      for (const [letra, e] of Object.entries(d)) {
        assert.ok(ERRORES[e], `${id}: error ${e}`);
        assert.ok(q.opciones[letra] && letra !== q.correcta && !(q.aceptadas ?? []).includes(letra), `${id}: opción ${letra}`);
      }
    }
  }
});

test('índice de distractores: coincide con el diagnóstico en vivo en una muestra', async () => {
  let n = 0;
  for (const x of indices) {
    const banco = await B.cargarBanco(x.eje, x.tit);
    // Una de cada cuatro preguntas con resolución del estudio (estén o no en el índice).
    const candidatas = banco.estudio.filter((q) => SOLUCIONES[q.id] && !q.anulada && q.correcta);
    for (const q of candidatas.filter((_, i) => i % 4 === 0)) {
      const d = x.indice.preguntas[q.id] ?? {};
      for (const letra of Object.keys(q.opciones)) {
        const vivo = diagnosticar(q, letra, { sol: SOLUCIONES[q.id], chart });
        const esperado = vivo.estado === 'unico' ? vivo.tipos[0] : undefined;
        assert.equal(d[letra], esperado, `${q.id} ${letra}): índice ${d[letra]} · en vivo ${vivo.estado} ${vivo.tipos.join('/')}`);
        n += 1;
      }
    }
  }
  assert.ok(n > 500, `muestra corta: ${n}`);
});

// --- Selección (con un banco de verdad: Andalucía PER y PY)

const and = await B.cargarBanco('andalucia', 'per');
const indAnd = indices.find((x) => x.eje === 'andalucia' && x.tit === 'per').indice.preguntas;
const andPy = await B.cargarBanco('andalucia', 'py');
const indAndPy = indices.find((x) => x.eje === 'andalucia' && x.tit === 'py').indice.preguntas;
const res = (pares) => ({ errores: pares.map(([id, n]) => ({ id, n })), superados: [] });

test('selección: tus errores, del estudio, sin repetir, repartidos y con lo no visto primero', () => {
  const r = res([['signo-ct', 5], ['signo-desvio', 2], ['horas-decimales', 1]]);
  const vistas = Object.fromEntries(Object.keys(indAnd).slice(0, 30).map((id, i) => [id, { ok: i % 2 === 0 }]));
  const s = armarSimulacroErrores({ indice: indAnd, estudio: and.estudio, resumen: r, respuestas: vistas, rng: createRng(7) });
  assert.equal(s.modo, 'tuyos');
  assert.equal(s.motivo, null);
  assert.equal(s.preguntas.length, OBJETIVO);
  assert.equal(new Set(s.preguntas.map((q) => q.id)).size, s.preguntas.length, 'sin repetir');
  const estudio = new Set(and.estudio.map((q) => q.id));
  for (const q of s.preguntas) {
    assert.ok(estudio.has(q.id) && !and.reservadas.has(q.id), q.id);
    assert.ok(s.objetivos[q.id].length >= 1, `${q.id}: sin objetivo`);
    for (const e of s.objetivos[q.id]) assert.ok(['signo-ct', 'signo-desvio', 'horas-decimales'].includes(e));
  }
  // Cada error tiene al menos una pregunta y el que más repites, más que los otros.
  const puestas = Object.fromEntries(s.errores.map((e) => [e.id, e.puestas]));
  assert.ok(puestas['signo-ct'] > puestas['signo-desvio'] && puestas['signo-desvio'] >= 1 && puestas['horas-decimales'] >= 1, JSON.stringify(puestas));
  // Hay de sobra sin ver: ninguna vista.
  assert.ok(s.preguntas.every((q) => !vistas[q.id]), 'primero las no vistas');
  assert.equal(s.nuevas, s.preguntas.length);
  // Reproducible con la misma semilla.
  assert.deepEqual(armarSimulacroErrores({ indice: indAnd, estudio: and.estudio, resumen: r, respuestas: vistas, rng: createRng(7) }).preguntas.map((q) => q.id), s.preguntas.map((q) => q.id));
});

test('selección: si todas están vistas, primero las falladas', () => {
  const pool = preguntasPorError(indAnd, and.estudio).get('horas-decimales');
  const respuestas = Object.fromEntries(pool.map((q, i) => [q.id, { ok: i !== 2 }]));
  const s = armarSimulacroErrores({ indice: indAnd, estudio: and.estudio, resumen: res([['horas-decimales', 4]]), respuestas, rng: createRng(1), objetivo: 1 });
  // horas-decimales solo tiene pocas preguntas: no llega al mínimo y se arma con las del tribunal.
  if (pool.length >= MINIMO) assert.equal(s.preguntas[0].id, pool[2].id);
  else assert.equal(s.modo, 'tribunal');
});

test('selección: nunca una pregunta que no esté en el estudio del alumno (reserva propia, anuladas, retiradas)', () => {
  const ids = Object.keys(indAnd);
  const fuera = new Set(ids.slice(0, 20));
  const estudio = and.estudio.filter((q) => !fuera.has(q.id)).map((q) => (q.id === ids[25] ? { ...q, anulada: true } : q.id === ids[26] ? { ...q, norma: { estado: 'retirada' } } : q));
  for (let seed = 1; seed <= 10; seed++) {
    const s = armarSimulacroErrores({ indice: indAnd, estudio, resumen: res([['signo-ct', 9], ['signo-dm', 3]]), rng: createRng(seed) });
    for (const q of s.preguntas) assert.ok(!fuera.has(q.id) && q.id !== ids[25] && q.id !== ids[26], q.id);
  }
});

test('selección: sin errores suficientes, se dice por qué y se arma con los que más ponen los tribunales', () => {
  const pe = preguntasPorError(indAndPy, andPy.estudio);
  const casos = [
    [{ errores: [], superados: [] }, 'sin-errores'],
    [{ errores: [], superados: [{ id: 'signo-ct' }] }, 'superados'],
    [res([['signo-ct', 1]]), 'pocos'],
    [res([['lm-salida', 3], ['banda', 2]]), 'sin-preguntas'], // errores que no salen (o casi) en este banco
  ];
  for (const [r, motivo] of casos) {
    const sel = elegirErrores(pe, r);
    assert.equal(sel.modo, 'tribunal', motivo);
    assert.equal(sel.motivo, motivo);
    assert.ok(textoMotivo(motivo, { n: 1 }));
    // Los del tribunal: los que más preguntas tienen como distractor en el banco.
    const top = [...pe].sort((a, b) => b[1].length - a[1].length)[0][0];
    assert.equal(sel.errores[0].id, top);
    const s = armarSimulacroErrores({ indice: indAndPy, estudio: andPy.estudio, resumen: r, rng: createRng(3) });
    assert.equal(s.preguntas.length, OBJETIVO);
    assert.ok(s.errores.length >= 3 && s.errores.every((e) => e.puestas >= 1), JSON.stringify(s.errores));
  }
  assert.equal(textoMotivo(null), null);
});

test('selección: con pocas preguntas para tus errores, las que haya (sin pasar del mínimo hacia abajo)', () => {
  const pe = preguntasPorError(indAnd, and.estudio);
  const [id, qs] = [...pe].find(([, q]) => q.length >= MINIMO && q.length < OBJETIVO) ?? [];
  if (!id) return; // el banco no tiene un error así
  const s = armarSimulacroErrores({ indice: indAnd, estudio: and.estudio, resumen: res([[id, 3]]), rng: createRng(2) });
  assert.equal(s.modo, 'tuyos');
  assert.equal(s.preguntas.length, qs.length);
});

test('tiempo: el presupuesto de la estrategia (carta a su ritmo, el resto al ritmo medio)', () => {
  const per = TITULACIONES.per;
  const carta = { ut: per.cartaUt };
  const otra = { ut: 10 };
  assert.equal(minutosSimulacro([carta, carta], per), 16); // 8 min por pregunta de carta en el PER
  assert.equal(minutosSimulacro([otra, otra, otra], per), 6); // 90 / 45
  assert.equal(minutosSimulacro([{ ut: 3 }, { ut: 3 }, { ut: 4 }, { ut: 4 }], TITULACIONES.py), Math.ceil(2 * 75 / 20 + 2 * 5.5));
  assert.equal(minutosSimulacro([], per), 5);
});

test('no es un examen con el reparto oficial: sin apto, sin límites por tema', () => {
  const E = estructuraErrores(TITULACIONES.per.estructura, 40);
  assert.equal(E.duracionMin, 40);
  assert.ok(E.sinApto && E.bloques.every((b) => b.maxErrores == null));
  const preguntas = Object.keys(indAnd).slice(0, 10).map((id) => and.porId.get(id));
  const g = grade(E, { preguntas }, {});
  assert.equal(g.apto, null);
  assert.deepEqual(g.motivos, []);
  const t = testDesdeIds('errores', preguntas.map((q) => q.id), and.porId);
  assert.equal(t.titulo, 'Simulacro de tus errores');
});

test('corrección: «has vuelto a…» si caes en tu error; al acertar, el error se esquiva', () => {
  const ids = Object.entries(indAnd).filter(([, d]) => Object.values(d).includes('signo-ct')).slice(0, 3).map(([id]) => id);
  const preguntas = ids.map((id) => and.porId.get(id));
  const [a, b, c] = preguntas;
  const letraCt = (q) => Object.entries(indAnd[q.id]).find(([, e]) => e === 'signo-ct')[0];
  const otraMala = (q) => Object.keys(q.opciones).find((x) => x !== q.correcta && !indAnd[q.id][x]);
  const respuestas = { [a.id]: letraCt(a), [b.id]: b.correcta };
  if (otraMala(c)) respuestas[c.id] = otraMala(c);
  const objetivos = Object.fromEntries(ids.map((id) => [id, ['signo-ct']]));
  const r = corregirErrores({ preguntas, respuestas, indice: indAnd, objetivos, tuyos: ['signo-ct'] });
  assert.deepEqual(r.porPregunta[a.id], { ok: false, marcada: letraCt(a), cayo: 'signo-ct', otraVez: true, esquivados: [] });
  assert.deepEqual(r.porPregunta[b.id].esquivados, ['signo-ct']);
  assert.equal(r.porPregunta[c.id].cayo, null);
  assert.deepEqual(r.balance, [{ id: 'signo-ct', puestas: 3, esquivadas: 1, caidas: 1 }]);
  // Sin ser tuyo (simulacro de los tribunales): cae, pero no «otra vez».
  assert.equal(corregirErrores({ preguntas, respuestas, indice: indAnd, objetivos, tuyos: [] }).porPregunta[a.id].otraVez, false);
  assert.equal(fraseOtraVez('signo-ct'), 'Has vuelto a aplicar la Ct con el signo cambiado.');
  for (const [id, e] of Object.entries(ERRORES)) assert.ok(e.otraVez && !/\.$/.test(e.otraVez), id);
});

test('errores del alumno: acertar la trampa baja la cuenta (nunca por debajo de cero) y lo deja superado', () => {
  const dia = 864e5; const t0 = 300 * dia;
  let e = estadoVacio();
  e = anotaSuperado(e, { q: 'q0', id: 'signo-ct' }, t0); // antes de cometerlo: no da crédito
  e = anotaError(e, { q: 'q1', id: 'signo-ct' }, t0 + 1);
  e = anotaError(e, { q: 'q2', id: 'signo-ct' }, t0 + 2);
  e = anotaError(e, { q: 'q3', id: 'signo-dm' }, t0 + 3);
  e = anotaSuperado(e, { q: 'q4', id: 'signo-ct' }, t0 + 4);
  e = anotaSuperado(e, { q: 'q4', id: 'signo-ct' }, t0 + 5); // misma pregunta y día: una vez
  let r = resumen(e);
  assert.deepEqual(r.errores.map((x) => [x.id, x.n]), [['signo-ct', 1], ['signo-dm', 1]]);
  e = anotaSuperado(e, { q: 'q5', id: 'signo-ct' }, t0 + 6);
  e = anotaSuperado(e, { q: 'q6', id: 'signo-ct' }, t0 + 7); // ya a cero
  r = resumen(e);
  assert.deepEqual(r.errores.map((x) => x.id), ['signo-dm']);
  assert.deepEqual(r.superados.map((x) => [x.id, x.veces]), [['signo-ct', 2]]);
  // Volver a cometerlo lo devuelve a la lista.
  e = anotaError(e, { q: 'q7', id: 'signo-ct' }, t0 + 8);
  r = resumen(e);
  assert.deepEqual(r.errores.find((x) => x.id === 'signo-ct')?.n, 1);
  assert.equal(r.superados.length, 0);
  // Se guarda y se lee (los `sup` sobreviven a leerEstado).
  assert.deepEqual(leerEstado(JSON.stringify(e)), e);
});

test('índice: cifras por banco (para la documentación)', () => {
  for (const x of indices) {
    const n = porError(x.indice);
    assert.ok(Object.values(n).every((k) => k > 0), x.ruta);
  }
});

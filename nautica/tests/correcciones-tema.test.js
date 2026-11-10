// Correcciones de tema del alumno («¿No es de este tema?», docs/BANCOS.md y docs/SYNC.md):
//   - la operación del registro, su pliegue y su fusión (dos aparatos que corrigen la misma pregunta, deshacer, bases);
//   - de punta a punta por el servidor de sync-worker/ (que no cambia: la operación es un valor con nombre de siempre);
//   - el banco del alumno: la corrección cambia su estudio sin tocar los datos originales ni los exámenes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProgressStore } from '../src/store/progress.js';
import { plegar } from '../src/store/sync/plegar.js';
import { validarOperacion, claveCorreccion, esClaveCorreccion, preguntaDeCorreccion, correccionValida, COLECCIONES, esAjusteCompartido } from '../src/store/sync/operaciones.js';
import { crearMotor } from '../src/store/sync/motor.js';
import { manejar } from '../../sync-worker/src/servidor.js';
import { d1Memoria } from '../../sync-worker/tests/d1-node.js';
import { crearBancos } from '../src/bancos/index.js';
import { correccionesValidas, aplicarCorrecciones, temasDeClases, textoCorrecciones, firmaCorrecciones } from '../src/bancos/correcciones.js';
import { TITULACIONES } from '../src/theory/blocks.js';
import { buildPractica, buildSimulacro } from '../src/theory/engine.js';
import { createRng } from '../src/math/rng.js';
import { leerJSON, todasLasPreguntas } from '../tools/bancos/leer.mjs';
import { conReloj, memoria, azar } from './sync-reloj.js';

const T0 = Date.UTC(2026, 4, 10, 8);
const Q = 'and-2022-c2-t05';
const op = (i, t, q, v) => ({ i, k: 'v', t, c: 'settings', p: [claveCorreccion(q)], ...(v === undefined ? {} : { v }) });

test('la operación de una corrección es un valor con nombre de siempre (el servidor desplegado ya la acepta)', () => {
  const o = op('aaaaaaaaaa.1.x1', T0, Q, { ut: 3, clase: 'per-3-2', de: 2, t: new Date(T0).toISOString() });
  assert.equal(validarOperacion(o, T0), null);
  // Lo que valida el servidor sin cambios: tipo `v`, colección conocida, una clave con los símbolos de siempre.
  assert.equal(o.k, 'v');
  assert.equal(COLECCIONES[o.c], 1);
  assert.deepEqual(Object.keys(o).sort(), ['c', 'i', 'k', 'p', 't', 'v']);
  assert.match(o.p[0], /^[\w\-./:]{1,120}$/u);
  assert.equal(validarOperacion(op('aaaaaaaaaa.2.x1', T0, Q), T0), null, 'deshacer: la misma clave sin valor');
  // Una corrección mal formada no entra en el registro.
  for (const v of [{ ut: 0 }, { ut: '3' }, { ut: 3, clase: 'con espacio' }, { ut: 3, otra: 1 }, 'x', null, { ut: 3, de: 'a' }]) {
    assert.equal(validarOperacion(op('aaaaaaaaaa.3.x1', T0, Q, v), T0), 'correccion', JSON.stringify(v));
  }
  assert.equal(correccionValida({ ut: 3 }), true);
  assert.equal(esClaveCorreccion(claveCorreccion(Q)), true);
  assert.equal(preguntaDeCorreccion(claveCorreccion(Q)), Q);
  assert.equal(esAjusteCompartido(claveCorreccion(Q)), false, 'no es un ajuste: no se mezcla con los ajustes');
  // La clave de cualquier pregunta de cualquier banco cabe en la ruta de una operación.
  for (const q of todasLasPreguntas()) assert.match(claveCorreccion(q.id), /^[\w\-./:]{1,120}$/u, q.id);
});

test('pliegue: dos aparatos corrigen la misma pregunta y gana la última, llegue en el orden que llegue; deshacer también', () => {
  const a = op('aaaaaaaaaa.1.x1', T0 + 1000, Q, { ut: 3, de: 2 });
  const b = op('bbbbbbbbbb.1.y1', T0 + 2000, Q, { ut: 7, clase: 'per-7-1', de: 2 });
  const otra = op('aaaaaaaaaa.2.x1', T0 + 1500, 'and-2022-c2-t06', { ut: 1, de: 2 });
  for (const ops of [[a, b, otra], [b, a, otra], [otra, b, a, a, b]]) {
    const p = plegar(ops);
    assert.deepEqual(p.correcciones, { [Q]: { ut: 7, clase: 'per-7-1', de: 2 }, 'and-2022-c2-t06': { ut: 1, de: 2 } });
    assert.equal(Object.keys(p.settings).some(esClaveCorreccion), false, 'no se cuelan en los ajustes');
  }
  // Mismo instante en los dos aparatos: desempata el id, igual en cualquier orden.
  const a2 = op('aaaaaaaaaa.1.x1', T0, Q, { ut: 3 });
  const b2 = op('bbbbbbbbbb.1.y1', T0, Q, { ut: 7 });
  assert.deepEqual(plegar([a2, b2]).correcciones, plegar([b2, a2]).correcciones);
  assert.equal(plegar([a2, b2]).correcciones[Q].ut, 7);
  // Deshacer (sin valor) es una operación más: gana si es la última y pierde si llega una corrección posterior.
  const quita = op('aaaaaaaaaa.3.x1', T0 + 3000, Q);
  assert.equal(Q in plegar([a, b, quita]).correcciones, false);
  assert.equal(Q in plegar([quita, b, a]).correcciones, false);
  const despues = op('bbbbbbbbbb.2.y1', T0 + 4000, Q, { ut: 5 });
  assert.deepEqual(plegar([despues, quita, a, b]).correcciones[Q], { ut: 5 });
  // Una corrección vieja que llega tarde (aparato que estaba sin conexión) no pisa la nueva.
  const tarde = op('cccccccccc.1.z1', T0 + 500, Q, { ut: 9 });
  assert.equal(plegar([a, b, tarde]).correcciones[Q].ut, 7);
  // Un valor que no vale (de una versión rara) se trata como borrar, no rompe nada.
  assert.equal(Q in plegar([a, { ...quita, v: { ut: 'x' } }]).correcciones, false);
  // Sin correcciones, el progreso no lleva el campo (la forma de siempre).
  assert.equal('correcciones' in plegar([]), false);
});

test('almacén: corregir, cambiar y deshacer; va en la copia y se suma al recuperarla; no toca nada más', async () => {
  await conReloj(T0, async (reloj) => {
    const mem = memoria();
    const p = createProgressStore(mem);
    p.recordExam(Q, { choice: 'a', ok: false });
    const antes = JSON.stringify(p.get().exams);
    assert.deepEqual(p.correcciones(), {});
    reloj.avanza(1000);
    p.corregirTema(Q, { ut: 3, de: 2 });
    assert.deepEqual(p.correccionDe(Q), { ut: 3, de: 2, t: new Date(T0 + 1000).toISOString() });
    reloj.avanza(1000);
    p.corregirTema(Q, { ut: 7, clase: 'per-7-1', de: 2 });
    assert.equal(p.correccionDe(Q).ut, 7);
    assert.equal(p.correccionDe(Q).clase, 'per-7-1');
    assert.equal(JSON.stringify(p.get().exams), antes, 'las respuestas no cambian');
    assert.throws(() => p.corregirTema(Q, { ut: 0 }));
    // Al volver a abrir la app (se pliega el registro entero) sigue ahí.
    assert.equal(createProgressStore(mem).correccionDe(Q).ut, 7);
    // La copia de seguridad la lleva y, recuperada en otro aparato, entra.
    reloj.avanza(1000);
    const otro = createProgressStore(memoria());
    otro.import(p.export());
    assert.equal(otro.correccionDe(Q).ut, 7);
    // Deshacer.
    reloj.avanza(1000);
    p.quitarCorreccion(Q);
    assert.equal(p.correccionDe(Q), null);
    assert.equal(createProgressStore(mem).correccionDe(Q), null);
    p.quitarCorreccion(Q); // deshacer lo que no está no apunta nada
    assert.equal(p.registro.ops.filter((o) => o.k === 'v' && esClaveCorreccion(o.p?.[0])).length, 3);
    // Una corrección posterior a la de una copia recuperada gana a la de la copia; una anterior, no.
    reloj.avanza(1000);
    otro.corregirTema(Q, { ut: 4, de: 2 });
    assert.equal(otro.correccionDe(Q).ut, 4);
  });
});

test('de punta a punta por el servidor: dos aparatos corrigen la misma pregunta sin conexión y convergen; deshacer llega al otro', async () => {
  await conReloj(T0, async (reloj) => {
    const env = { DB: d1Memoria(), PEPPER: 'pepper-de-pruebas-0123456789' };
    const rechazadas = [];
    const fetch = async (url, init) => {
      const res = await manejar(new Request(url, { ...init, headers: { ...init.headers, origin: 'http://localhost:4800', 'cf-connecting-ip': '10.0.0.1' } }), env, { ahora: Date.now() });
      const copia = res.clone();
      try { rechazadas.push(...((await copia.json()).rechazadas ?? [])); } catch { /* no era JSON */ }
      return res;
    };
    const relojQuieto = { setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {} };
    const aparato = () => {
      const mem = memoria();
      const progress = createProgressStore(mem);
      return { progress, mem, motor: crearMotor({ registro: progress.registro, storage: mem, fetch, url: 'https://sync.prueba', reloj: relojQuieto, enLinea: () => true, azar: () => 0.5, locks: null }) };
    };
    const A = aparato();
    const B = aparato();
    A.progress.recordExam(Q, { choice: 'a', ok: true });
    await A.motor.sincronizar();
    assert.equal((await B.motor.vincular(A.progress.registro.codigo)).ok, true);
    // Sin conexión, cada uno corrige la misma pregunta a un tema distinto; B, más tarde.
    reloj.avanza(60000);
    A.progress.corregirTema(Q, { ut: 3, de: 2 });
    reloj.avanza(60000);
    B.progress.corregirTema(Q, { ut: 7, clase: 'per-7-1', de: 2 });
    B.progress.corregirTema('and-2022-c2-t06', { ut: 1, de: 2 });
    await A.motor.sincronizar();
    await B.motor.sincronizar();
    await A.motor.sincronizar();
    assert.deepEqual(rechazadas, [], 'el servidor no rechaza ninguna operación');
    assert.deepEqual(A.progress.correcciones(), B.progress.correcciones());
    assert.equal(A.progress.correccionDe(Q).ut, 7, 'gana la última');
    assert.equal(A.progress.correccionDe('and-2022-c2-t06').ut, 1);
    // A la deshace; B se entera.
    reloj.avanza(60000);
    A.progress.quitarCorreccion(Q);
    await A.motor.sincronizar();
    await B.motor.sincronizar();
    assert.equal(B.progress.correccionDe(Q), null);
    assert.deepEqual(A.progress.correcciones(), B.progress.correcciones());
    assert.deepEqual(rechazadas, []);
    // Idempotente: sincronizar otra vez no cambia nada.
    const antes = JSON.stringify(B.progress.get());
    await B.motor.sincronizar();
    await A.motor.sincronizar();
    assert.equal(JSON.stringify(B.progress.get()), antes);
  });
});

test('pliegue al azar: con correcciones mezcladas con el resto de escrituras, el resultado no depende del orden', () => {
  for (let s = 1; s <= 30; s += 1) {
    const r = azar(s);
    const ops = [];
    const ids = [Q, 'and-2022-c2-t06', 'dgmm-per-2019-06-01'];
    for (let i = 0; i < 40; i += 1) {
      const dev = r.de(['aaaaaaaaaa', 'bbbbbbbbbb', 'cccccccccc']);
      const t = T0 + r.int(50) * 1000;
      const id = `${dev}.${(i + 1).toString(36)}.z${r.int(9)}`;
      if (r() < 0.25) ops.push({ i: id, k: 'r', t, q: r.de(ids), c: 'a', o: r() < 0.5, d: '2026-05-10' });
      else if (r() < 0.3) ops.push(op(id, t, r.de(ids)));
      else ops.push(op(id, t, r.de(ids), { ut: 1 + r.int(11) }));
    }
    const base = JSON.stringify(plegar(ops));
    const barajadas = [...ops].sort(() => r() - 0.5);
    assert.equal(JSON.stringify(plegar([...barajadas, ...ops.slice(0, 7)])), base, `semilla ${s}`);
  }
});

// ---------------------------------------------------------------------------
// El banco del alumno

/** Motor de bancos sobre el disco que cuenta las lecturas y permite poner las correcciones del alumno. */
function motor() {
  let correcciones = null;
  const b = crearBancos(async (ruta) => leerJSON(ruta));
  b.fijarCorreccionesAlumno(() => correcciones);
  return { b, pon: (c) => { correcciones = c; } };
}

test('el banco del alumno aplica la corrección a su estudio sin tocar los datos originales ni los exámenes', async () => {
  const { b, pon } = motor();
  const base = await b.cargarBanco('andalucia', 'per');
  const E = TITULACIONES.per.estructura;
  // Una pregunta del tema 2 que está en la práctica de alguna clase de su tema.
  const curso0 = await b.cargarCurso('per', 'andalucia');
  const clasesT2 = curso0.modulos.filter((m) => m.ut === 2).flatMap((m) => m.lecciones);
  const claseOrigen = clasesT2.find((l) => l.practica.some((id) => base.porId.get(id)?.ut === 2));
  const q = base.porId.get(claseOrigen.practica.find((id) => base.porId.get(id).ut === 2));
  const huella = JSON.stringify(base.todas);
  const enTema = (banco, ut) => buildPractica(banco.practica, ut, createRng(1), {}).preguntas.map((x) => x.id);
  assert.ok(enTema(base, 2).includes(q.id));
  assert.equal(enTema(base, 7).includes(q.id), false);
  assert.equal(base.correccionDe(q.id), null);

  pon({ [q.id]: { ut: 7, de: 2 }, 'no-existe-en-ningun-banco': { ut: 3 }, [base.todas[0].id]: { ut: 99 } });
  const mio = await b.cargarBanco('andalucia', 'per');
  assert.notEqual(mio, base, 'es una vista, no el banco compartido');
  assert.equal(await b.cargarBanco('andalucia', 'per'), mio, 'la misma vista mientras no cambien las correcciones');
  // En su estudio: sale en el tema elegido y ya no en el equivocado.
  assert.equal(enTema(mio, 2).includes(q.id), false);
  assert.ok(enTema(mio, 7).includes(q.id));
  const copia = mio.porId.get(q.id);
  assert.equal(copia.ut, 7);
  assert.equal(copia.utBanco, 2);
  assert.equal(copia.ut_titulo, base.todas.find((x) => x.ut === 7).ut_titulo);
  assert.equal(mio.practica.find((x) => x.id === q.id), copia);
  assert.equal(mio.estudio.find((x) => x.id === q.id), copia);
  assert.deepEqual(mio.correccionDe(q.id), { ut: 7, clase: null, de: 2, t: null });
  assert.equal(mio.correcciones.size, 1, 'las que no valen (pregunta o tema que no existen) se ignoran');
  assert.equal(mio.estudio.length, base.estudio.length);
  // Sale de la práctica de su clase de antes (de otro tema) y, sin clase elegida, no entra en ninguna.
  const curso = await b.cargarCurso('per', 'andalucia');
  const todasLasClases = curso.modulos.flatMap((m) => m.lecciones);
  assert.equal(todasLasClases.some((l) => l.practica.includes(q.id)), false);
  assert.ok(curso0.modulos.flatMap((m) => m.lecciones).find((l) => l.id === claseOrigen.id).practica.includes(q.id), 'el curso de antes no cambia');
  // Los datos originales, intactos: el banco compartido, sus preguntas y el objeto de la pregunta.
  assert.equal(JSON.stringify(base.todas), huella);
  assert.equal(q.ut, 2);
  assert.equal(base.porId.get(q.id), q);
  assert.equal(mio.todas, base.todas);
  assert.equal(mio.examenes, base.examenes);
  assert.equal(mio.final, base.final);
  assert.equal(mio.listas, base.listas);
  assert.equal(mio.oficial.estudio, base.estudio);
  assert.equal(mio.oficial.porId.get(q.id), q);
  assert.equal(enTema(base, 2).includes(q.id), true, 'quien pida el banco sin correcciones lo ve como siempre');
  // Los exámenes no cambian: la convocatoria la lleva con su tema oficial y el simulacro reparte por el tema oficial.
  assert.equal(mio.examenes.find((x) => x.id === q.id).ut, 2);
  const sim = buildSimulacro(E, mio.oficial.estudio, createRng(7));
  const simBase = buildSimulacro(E, base.estudio, createRng(7));
  assert.deepEqual(sim.preguntas.map((x) => [x.id, x.ut]), simBase.preguntas.map((x) => [x.id, x.ut]));
  for (const bl of E.bloques) assert.equal(sim.preguntas.filter((x) => x.ut === bl.ut).length, bl.n);
  // pregunta(id): la del banco (tema oficial) y el banco del alumno (con su corrección).
  const r = await b.pregunta(q.id);
  assert.equal(r.q, q);
  assert.equal(r.banco.correccionDe(q.id).ut, 7);

  // Con clase: entra en la práctica de la clase elegida (y solo en esa).
  const destino = curso.modulos.find((m) => m.ut === 7).lecciones[0];
  pon({ [q.id]: { ut: 7, clase: destino.id, de: 2 } });
  const conClase = await b.cargarCurso('per', 'andalucia');
  const donde = conClase.modulos.flatMap((m) => m.lecciones).filter((l) => l.practica.includes(q.id)).map((l) => l.id);
  assert.deepEqual(donde, [destino.id]);
  // Una clase que no es del tema elegido se ignora (queda solo el tema).
  pon({ [q.id]: { ut: 7, clase: claseOrigen.id, de: 2 } });
  assert.equal((await b.cargarBanco('andalucia', 'per')).correccionDe(q.id).clase, null);
  // Solo la clase, dentro del mismo tema: no cambia el tema; cambia de práctica.
  const otraClase = clasesT2.find((l) => l.id !== claseOrigen.id);
  pon({ [q.id]: { ut: 2, clase: otraClase.id, de: 2 } });
  const soloClase = await b.cargarBanco('andalucia', 'per');
  assert.equal(soloClase.porId.get(q.id), q, 'sin cambio de tema no hace falta copia');
  assert.equal(soloClase.practicaDe(claseOrigen.id).includes(q.id), false);
  assert.ok(soloClase.practicaDe(otraClase.id).includes(q.id));

  // Deshacer: vuelve el banco de siempre, que nunca cambió. Y corregirla al tema que ya tiene no es una corrección.
  pon({});
  assert.equal(await b.cargarBanco('andalucia', 'per'), base);
  pon({ [q.id]: { ut: 2 } });
  assert.equal(await b.cargarBanco('andalucia', 'per'), base);
  pon(null);
  assert.equal(await b.cargarBanco('andalucia', 'per'), base);
  assert.equal(JSON.stringify(base.todas), huella);
});

test('las correcciones de un banco no afectan a otro eje ni a otra titulación', async () => {
  const { b, pon } = motor();
  const per = await b.cargarBanco('andalucia', 'per');
  const py = await b.cargarBanco('andalucia', 'py');
  const dgmm = await b.cargarBanco('dgmm', 'per');
  const q = per.practica.find((x) => x.ut === 1);
  pon({ [q.id]: { ut: 3 } });
  assert.notEqual(await b.cargarBanco('andalucia', 'per'), per);
  assert.equal(await b.cargarBanco('andalucia', 'py'), py);
  assert.equal(await b.cargarBanco('dgmm', 'per'), dgmm);
});

test('correcciones: funciones puras (válidas, firma, vista y texto para el autor)', () => {
  const mk = (id, ut) => ({ id, ut, ut_titulo: `T${ut}`, tit: 'per', eje: 'x' });
  const todas = [mk('a', 1), mk('b', 1), mk('c', 2)];
  const banco = { tit: 'per', todas, estudio: todas, practica: todas, porId: new Map(todas.map((q) => [q.id, q])), practicaDe: (l) => ({ 'c1-1': ['a', 'b'], 'c2-1': ['c'] }[l] ?? []) };
  const estructura = { bloques: [{ ut: 1, titulo: 'Uno' }, { ut: 2, titulo: 'Dos' }, { ut: 3, titulo: 'Tres' }] };
  const clases = temasDeClases({ modulos: [{ ut: 1, lecciones: [{ id: 'c1-1' }] }, { ut: 2, lecciones: [{ id: 'c2-1' }, { id: 'c2-2' }] }] });
  assert.equal(clases.get('c2-2'), 2);
  const v = correccionesValidas({ a: { ut: 2, clase: 'c2-2' }, b: { ut: 1 }, c: { ut: 9 }, z: { ut: 2 }, x: null }, banco, estructura, clases);
  assert.deepEqual([...v], [['a', { ut: 2, clase: 'c2-2', de: 1, t: null }]]);
  assert.equal(firmaCorrecciones(v), 'a>2@c2-2');
  assert.equal(aplicarCorrecciones(banco, new Map(), { estructura, clases }), banco);
  const vista = aplicarCorrecciones(banco, v, { estructura, clases });
  assert.deepEqual(vista.estudio.map((q) => [q.id, q.ut, q.ut_titulo]), [['a', 2, 'T2'], ['b', 1, 'T1'], ['c', 2, 'T2']]);
  assert.deepEqual(vista.practicaDe('c1-1'), ['b']);
  assert.deepEqual(vista.practicaDe('c2-1'), ['c']);
  assert.deepEqual(vista.practicaDe('c2-2'), ['a']);
  assert.equal(todas[0].ut, 1, 'la pregunta original no cambia');
  assert.equal(vista.oficial.porId.get('a'), todas[0]);
  // Volver a aplicar sobre una vista no pierde el tema del banco.
  assert.equal(correccionesValidas({ a: { ut: 3 } }, vista, estructura, clases).get('a').de, 1);
  const texto = textoCorrecciones([{ id: 'a', eje: 'x', tit: 'per', de: 1, ut: 2, clase: 'c2-2' }, { id: 'b', tit: 'per', de: 1, ut: 1, clase: 'c1-1' }],
    { titulo: (tit, ut) => estructura.bloques.find((x) => x.ut === ut).titulo, tituloClase: (id) => `Clase ${id}` });
  assert.equal(texto, '- `a` (x · PER): tema actual 1 (Uno) → propuesto 2 (Dos) · clase propuesta: c2-2 (Clase c2-2)\n- `b` (PER): sigue en el tema 1 (Uno) · clase propuesta: c1-1 (Clase c1-1)');
});

test('la acción no existe durante un examen: las vistas la pintan solo en el panel del profe y en la vista de la pregunta', async () => {
  const { readFileSync } = await import('node:fs');
  const lee = (f) => readFileSync(new URL(`../src/ui/${f}`, import.meta.url), 'utf8');
  const tema = lee('tema-pregunta.js');
  // accionTema y el diálogo se niegan con el modo examen puesto.
  assert.match(tema, /export function accionTema\(q\) \{\s*\n\s*if \(!progreso \|\| !q\?\.id \|\| modoExamen\(\)/);
  assert.match(tema, /export function abrirDialogoTema[^\n]*\n\s*if \(!progreso \|\| modoExamen\(\)/);
  // En theory.js solo la usa profePanel (tras responder o al revisar un examen terminado), nunca la tarjeta del examen.
  const theory = lee('views/theory.js');
  assert.equal(theory.split('accionTema(').length - 1, 1);
  const panel = theory.slice(theory.indexOf('export function profePanel'), theory.indexOf('function enlacePasos'));
  assert.ok(panel.includes('accionTema(q)'));
  const enCurso = theory.slice(theory.indexOf('function correr(guardado)'), theory.indexOf('function resultados('));
  assert.equal(enCurso.includes('profePanel('), false, 'el examen en curso no pinta el panel del profe');
  assert.equal(enCurso.includes('accionTema'), false);
});

// Ruta del curso: dependencias entre clases (`requiere`), rutas por defecto que intercalan temas y motor que las sigue
// (Hoy, plan con fecha y calendario), sin perder el progreso de quien ya estudiaba tema a tema.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PER, PY, TITULACIONES } from '../src/theory/blocks.js';
import { ordenRuta, tramosDe, pasosRuta, requisitos, requisitosPendientes, problemasGrafo, violacionesRuta, siguienteEnRuta, generarRuta, idsRuta } from '../src/course/ruta.js';
import { planHoy, pendientesRuta } from '../src/course/plan.js';
import { unidades } from '../src/course/calendario.js';
import { hoyToca, leccionesDe } from '../src/course/engine.js';
import { estadoAlumno } from '../src/course/motor.js';
import { cursoDe, bancosNode, EJE_POR_DEFECTO } from '../tools/bancos/leer.mjs';

const leer = (f) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));
const CURSOS = { per: cursoDe('per'), py: cursoDe('py') };
const EST = { per: PER, py: PY };
const AHORA = new Date(2026, 9, 7, 12).getTime();
const visto = { visto: true, paso: 0 };
const idsDe = (curso) => leccionesDe(curso).map((l) => l.id);

for (const tit of ['per', 'py']) {
  const curso = CURSOS[tit];
  const E = EST[tit];

  test(`${tit}: «requiere» en todas las clases, con ids del mismo curso y sin ciclos`, () => {
    for (const l of leccionesDe(curso)) assert.ok(Array.isArray(l.requiere), `${l.id} sin «requiere»`);
    assert.deepEqual(problemasGrafo(curso), []);
    for (const l of leccionesDe(curso)) for (const r of l.requiere) assert.ok(r.startsWith(`${tit}-`), `${l.id} requiere ${r}, de otro curso (eso va en «refresco»)`);
  });

  test(`${tit}: la ruta por defecto tiene todas las clases una vez y cada una después de las que requiere`, () => {
    const datos = leer(`data/curso/ruta-${tit}.json`);
    const ids = idsRuta(datos.tramos);
    assert.deepEqual([...ids].sort(), [...idsDe(curso)].sort());
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(violacionesRuta(ids, curso), []);
    // Cada requisito va antes en la ruta (lo mismo, dicho clase a clase).
    const pos = new Map(ids.map((id, i) => [id, i]));
    for (const l of leccionesDe(curso)) for (const r of l.requiere) assert.ok(pos.get(r) < pos.get(l.id), `${r} tiene que ir antes que ${l.id}`);
    // Cada tramo es de un solo tema.
    for (const t of datos.tramos) for (const id of t.lecciones) assert.ok(id.startsWith(`${tit}-${t.ut}-`), `${id} en un tramo de ${t.ut}`);
    // El curso cargado lleva la ruta y ordenRuta la sigue.
    assert.deepEqual(ordenRuta(curso, E).map((l) => l.id), ids);
  });

  test(`${tit}: la ruta intercala temas y pone pronto los temas con límite de fallos`, () => {
    const tramos = tramosDe(ordenRuta(curso, E));
    const ids = ordenRuta(curso, E).map((l) => l.id);
    // Los temas eliminatorios empiezan en la primera mitad de la ruta y nunca más tarde que tema a tema.
    const antes = ordenRuta({ ...curso, ruta: null }, E).map((l) => l.id);
    for (const b of E.bloques.filter((x) => x.maxErrores != null)) {
      const empieza = (xs) => xs.findIndex((id) => id.startsWith(`${tit}-${b.ut}-`));
      assert.ok(empieza(ids) < ids.length / 2, `${b.titulo} empieza tarde (clase ${empieza(ids) + 1} de ${ids.length})`);
      assert.ok(empieza(ids) <= empieza(antes), `${b.titulo} empieza más tarde que tema a tema`);
    }
    // Nadie pasa más de 7 clases seguidas en un tema, y hay más tramos que temas (se alterna).
    assert.ok(tramos.length > E.bloques.length + 5);
    for (const t of tramos) assert.ok(t.lecciones.length <= 7, `tramo de ${t.lecciones.length} clases del tema ${t.ut}`);
  });

  test(`${tit}: el generador respeta «requiere» con cualquier ritmo`, () => {
    for (const ritmo of [1, 2, 3, 4]) {
      for (const ventana of [1, 2, 4]) {
        const ids = idsRuta(generarRuta(curso, E, { ritmo, ventana }));
        assert.deepEqual([...ids].sort(), [...idsDe(curso)].sort());
        assert.deepEqual(violacionesRuta(ids, curso), [], `ritmo ${ritmo}, ventana ${ventana}`);
      }
    }
  });
}

test('PY: alterna Seguridad, Meteorología, Teoría y Carta en tramos de 2 o 3 clases, empezando por navegación', () => {
  const tramos = tramosDe(ordenRuta(CURSOS.py, PY));
  assert.deepEqual(tramos.slice(0, 2).map((t) => t.ut), [3, 4]);
  assert.deepEqual(new Set(tramos.slice(0, 4).map((t) => t.ut)), new Set([1, 2, 3, 4]));
  for (const t of tramos) assert.ok(t.lecciones.length >= 1 && t.lecciones.length <= 3, `tramo de ${t.lecciones.length}`);
  for (let i = 1; i < tramos.length; i++) assert.notEqual(tramos[i].ut, tramos[i - 1].ut);
});

test('dependencias de ejemplo: carta sobre teoría, mareas sobre la marea básica, luces del RIPA sobre sus definiciones', () => {
  const req = (tit, id) => leccionesDe(CURSOS[tit]).find((l) => l.id === id).requiere;
  assert.ok(req('py', 'py-4-1').includes('py-3-2'));
  assert.ok(req('py', 'py-4-9').includes('py-3-6'));
  assert.ok(req('py', 'py-4-10').includes('py-3-4'));
  assert.ok(req('per', 'per-6-7').includes('per-6-1'));
  assert.ok(req('per', 'per-11-2').includes('per-10-6'));
});

test('violacionesRuta y problemasGrafo detectan órdenes y grafos imposibles', () => {
  const curso = { modulos: [{ ut: 1, titulo: 'T', lecciones: [{ id: 'a', requiere: [] }, { id: 'b', requiere: ['a'] }, { id: 'c', requiere: ['b', 'x'] }] }] };
  assert.deepEqual(violacionesRuta(['b', 'a', 'c'], curso), [{ id: 'b', faltan: ['a'] }]);
  assert.deepEqual(violacionesRuta(['a', 'b', 'c'], curso), []);
  assert.ok(problemasGrafo(curso).some((m) => m.includes('x')));
  const ciclo = { modulos: [{ ut: 1, titulo: 'T', lecciones: [{ id: 'a', requiere: ['b'] }, { id: 'b', requiere: ['a'] }] }] };
  assert.ok(problemasGrafo(ciclo).some((m) => m.startsWith('ciclo')));
});

test('ordenRuta: sin ruta, el orden de estudio; ids desconocidos fuera; clases que faltan, al final', () => {
  const sin = { ...CURSOS.py, ruta: null };
  assert.deepEqual([...new Set(ordenRuta(sin, PY).map((l) => l.ut))], PY.ordenEstudio);
  const parcial = { ...CURSOS.py, ruta: [{ ut: 2, lecciones: ['py-2-1', 'no-existe', 'py-2-1'] }] };
  const ids = ordenRuta(parcial, PY).map((l) => l.id);
  assert.equal(ids[0], 'py-2-1');
  assert.equal(ids.length, idsDe(CURSOS.py).length);
  assert.equal(ids[1], 'py-3-1'); // lo demás, por el orden de estudio
});

test('pasosRuta: las tandas de un tema van tras su última clase de la ruta', () => {
  const pasos = pasosRuta(PY, CURSOS.py);
  for (const b of PY.bloques) {
    const iT = pasos.findIndex((p) => p.tipo === 'tandas' && p.ut === b.ut);
    const ultima = pasos.findLastIndex((p) => p.tipo === 'clase' && p.ut === b.ut);
    assert.equal(iT, ultima + 1);
  }
});

const preguntas = { per: (await bancosNode().cargarBanco(EJE_POR_DEFECTO, 'per')).estudio, py: (await bancosNode().cargarBanco(EJE_POR_DEFECTO, 'py')).estudio };

test('Hoy sigue la ruta: alumno nuevo → la primera clase de la ruta; después, la siguiente aunque sea de otro tema', () => {
  const base = { estructura: PY, curso: CURSOS.py, preguntas: preguntas.py, regs: {}, respuestas: {}, ahora: AHORA };
  const ids = ordenRuta(CURSOS.py, PY).map((l) => l.id);
  assert.deepEqual(planHoy(base)[0].ruta, ['curso', ids[0]]);
  const regs = { [ids[0]]: visto, [ids[1]]: visto };
  const p = planHoy({ ...base, regs });
  assert.deepEqual(p[0].ruta, ['curso', ids[2]]);
  assert.equal(p[0].ut, 4); // tras dos clases de Teoría, una de Carta: se intercala
  assert.equal(hoyToca(CURSOS.py, regs, {}, { ahora: AHORA }).siguiente.id, ids[2]);
});

test('progreso de antes (tema a tema) se conserva: no se repite nada y sigue la primera clase sin hacer de la ruta', () => {
  // Alumno del PY que, con el orden antiguo, terminó Teoría de navegación entera y dejó a medias py-4-2.
  const regs = Object.fromEntries(idsDe(CURSOS.py).filter((id) => id.startsWith('py-3-')).map((id) => [id, visto]));
  regs['py-4-1'] = visto;
  regs['py-4-2'] = { paso: 5, tramo: 1, tramos: 3 };
  const base = { estructura: PY, curso: CURSOS.py, preguntas: preguntas.py, regs, respuestas: {}, ahora: AHORA };
  // Lo empezado, primero.
  assert.deepEqual(planHoy(base)[0], { ...planHoy(base)[0], verbo: 'Continuar', ruta: ['curso', 'py-4-2'] });
  // Terminada esa, lo primero sin hacer en la ruta (que ya no es Teoría: la tiene hecha).
  regs['py-4-2'] = visto;
  const siguiente = ordenRuta(CURSOS.py, PY).find((l) => !regs[l.id]);
  const p = planHoy(base);
  assert.deepEqual(p[0].ruta, ['curso', siguiente.id]);
  assert.ok(p.every((a) => a.tipo !== 'clase' || !regs[a.ruta[1]]), 'no propone una clase ya hecha');
  // Las clases hechas cuentan igual en el camino.
  const us = unidades({ ...base, tests: [] });
  for (const id of Object.keys(regs)) assert.equal(us.find((u) => u.id === `clase:${id}`).hecha, true);
});

test('calendario: las unidades del plan van en el orden de la ruta, con las tandas de cada tema tras su última clase', () => {
  const us = unidades({ estructura: PY, curso: CURSOS.py, preguntas: preguntas.py, ahora: AHORA });
  const clases = us.filter((u) => u.tipo === 'clase').map((u) => u.ruta[1]);
  assert.deepEqual(clases, ordenRuta(CURSOS.py, PY).map((l) => l.id));
  const i = us.findIndex((u) => u.id === 'tanda:4:1');
  assert.equal(us[i - 1].id, `clase:${ordenRuta(CURSOS.py, PY).filter((l) => l.ut === 4).at(-1).id}`);
  // Plan esencial (PER): el tema de poco peso se cambia por su chuleta donde la ruta pone su primera clase.
  const ue = unidades({ estructura: PER, curso: CURSOS.per, preguntas: preguntas.per, esencial: true, ahora: AHORA });
  const idx = (id) => ue.findIndex((u) => u.id === id);
  assert.ok(idx('chuleta:7') > idx('clase:per-3-8') && idx('chuleta:7') < idx('clase:per-9-1'));
  assert.ok(!ue.some((u) => u.id.startsWith('clase:per-7-')));
});

test('requisitosPendientes: las clases en que se apoya y aún no se han terminado', () => {
  const l = leccionesDe(CURSOS.py).find((x) => x.id === 'py-4-2');
  assert.deepEqual(requisitos(l, CURSOS.py).map((x) => x.id), ['py-3-3', 'py-4-1']);
  assert.deepEqual(requisitosPendientes(l, CURSOS.py, {}, {}, AHORA).map((x) => x.id), ['py-3-3', 'py-4-1']);
  assert.deepEqual(requisitosPendientes(l, CURSOS.py, { 'py-3-3': visto, 'py-4-1': { paso: 3 } }, {}, AHORA).map((x) => x.id), ['py-4-1']);
});

test('motor: la siguiente clase de la ruta y pendientesRuta coinciden con Hoy', () => {
  for (const tit of ['per', 'py']) {
    const st = estadoAlumno({ tit, estructura: EST[tit], curso: CURSOS[tit], preguntas: preguntas[tit], regs: {}, respuestas: {}, tests: [], settings: {}, ahora: AHORA });
    assert.equal(st.ruta.siguiente, siguienteEnRuta(EST[tit], CURSOS[tit], {}, {}, AHORA).id);
    assert.deepEqual(st.actividades.find((a) => a.tipo === 'clase').ruta, ['curso', st.ruta.siguiente]);
    assert.equal(pendientesRuta(EST[tit], CURSOS[tit], preguntas[tit], {}, {}, AHORA)[0].l.id, st.ruta.siguiente);
  }
  assert.ok(TITULACIONES.py);
});

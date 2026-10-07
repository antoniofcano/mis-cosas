// Bancos por eje (docs/BANCOS.md): cada fichero de cada eje cumple el contrato, la migración de Andalucía no ha
// cambiado ninguna pregunta, el motor (src/bancos) arma bien el banco y ningún código fuera de él nombra un banco.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { TITULACIONES } from '../src/theory/blocks.js';
import { crearBancos } from '../src/bancos/index.js';
import { EJE_POR_DEFECTO } from '../src/bancos/registro.js';
import { huella } from '../tools/bancos/migrar-andalucia.mjs';
import { RAIZ, leerJSON, bancosNode, preguntasDe } from '../tools/bancos/leer.mjs';

const CLAVES = ['id', 'eje', 'tit', 'conv', 'convocatoria', 'fecha', 'numero', 'orden', 'modulo', 'ut', 'ut_titulo', 'bloque', 'enunciado', 'opciones',
  'correcta', 'aceptadas', 'anulada', 'requiere', 'figuras', 'contexto', 'tabla_mareas', 'apareceEn', 'fuentes', 'norma', 'concepto', 'notas'];
const FICHA = ['id', 'nombre', 'organismo', 'ambito', 'estado', 'prefijo', 'fuente', 'licencia', 'carta', 'examen', 'reserva'];
const ESTADOS = ['borrador', 'interno', 'publicado'];
const NORMA = ['vigente', 'revisar', 'actualizada', 'retirada'];

const registro = leerJSON('data/ejes/index.json').ejes;
const cursos = Object.fromEntries(Object.keys(TITULACIONES).map((t) => [t, existsSync(join(RAIZ, `data/curso/${t}.json`)) ? leerJSON(`data/curso/${t}.json`) : null]));
const clasesDe = (tit) => new Set((cursos[tit]?.modulos ?? []).flatMap((m) => m.lecciones.map((l) => l.id)));

test('registro de ejes: ids y prefijos únicos, estado válido y el eje por defecto publicado', () => {
  assert.ok(registro.length >= 1);
  assert.equal(new Set(registro.map((e) => e.id)).size, registro.length);
  assert.equal(new Set(registro.map((e) => e.prefijo)).size, registro.length);
  for (const e of registro) {
    assert.ok(e.id && e.prefijo && e.nombre, JSON.stringify(e));
    assert.ok(ESTADOS.includes(e.estado), `${e.id}: estado ${e.estado}`);
    assert.ok(existsSync(join(RAIZ, `data/ejes/${e.id}/eje.json`)), `${e.id}: sin ficha`);
  }
  assert.equal(registro.find((e) => e.id === EJE_POR_DEFECTO)?.estado, 'publicado');
});

for (const r of registro) {
  const ficha = leerJSON(`data/ejes/${r.id}/eje.json`);
  const tits = Object.keys(ficha.examen ?? {});

  test(`eje ${r.id}: ficha completa y coherente con el registro`, () => {
    for (const k of FICHA) assert.ok(k in ficha, `falta ${k}`);
    assert.equal(ficha.id, r.id);
    assert.equal(ficha.prefijo, r.prefijo);
    assert.equal(ficha.nombre, r.nombre);
    assert.equal(ficha.estado, r.estado);
    assert.ok(tits.length && tits.every((t) => TITULACIONES[t]), `titulaciones: ${tits}`);
    assert.ok(['examen', 'pregunta'].includes(ficha.reserva.modo));
    assert.ok(ficha.licencia?.tipo && ficha.licencia?.usoApp, 'licencia');
    for (const [tit, ls] of Object.entries(ficha.listas ?? {})) {
      assert.ok(tits.includes(tit), `lista de ${tit}`);
      assert.equal(new Set(ls.map((l) => l.id)).size, ls.length, `${tit}: listas repetidas`);
      for (const l of ls) assert.ok(l.id && l.titulo && !/\.json$/.test(l.id), `${tit}: lista ${JSON.stringify(l)}`);
    }
    for (const [f, l] of Object.entries(ficha.legado ?? {})) assert.ok(ficha.listas?.[l.tit]?.some((x) => x.id === l.lista), `legado ${f}`);
  });

  for (const tit of tits) {
    const dir = `data/ejes/${r.id}/${tit}`;
    test(`eje ${r.id} · ${tit}: cada pregunta cumple el contrato`, () => {
      const datos = leerJSON(`${dir}/preguntas.json`);
      assert.equal(datos.meta?.eje, r.id);
      assert.equal(datos.meta?.tit, tit);
      const qs = datos.preguntas;
      assert.ok(qs.length > 0);
      assert.equal(new Set(qs.map((q) => q.id)).size, qs.length, 'ids repetidos');
      const uts = new Set(TITULACIONES[tit].estructura.bloques.map((b) => b.ut));
      const convs = new Set(qs.map((q) => q.conv));
      for (const q of qs) {
        for (const k of CLAVES) assert.ok(k in q, `${q.id}: falta ${k}`);
        assert.ok(q.id.startsWith(`${r.prefijo}-`), `${q.id}: no empieza por ${r.prefijo}-`);
        assert.equal(q.eje, r.id, q.id);
        assert.equal(q.tit, tit, q.id);
        assert.ok(typeof q.conv === 'string' && q.conv, `${q.id}: sin conv`);
        assert.ok(uts.has(q.ut), `${q.id}: ut ${q.ut} fuera de la estructura`);
        assert.ok(q.enunciado && Object.keys(q.opciones).length >= 2, q.id);
        if (q.anulada) {
          assert.equal(q.correcta, null, `${q.id}: anulada con correcta`);
          assert.deepEqual(q.aceptadas, [], `${q.id}: anulada con aceptadas`);
        } else {
          assert.ok(q.correcta in q.opciones, `${q.id}: correcta ${q.correcta} no es una opción`);
          assert.ok(q.aceptadas.includes(q.correcta) && q.aceptadas.every((a) => a in q.opciones), `${q.id}: aceptadas ${q.aceptadas}`);
        }
        assert.ok(Array.isArray(q.requiere) && q.requiere.every((x) => ['carta', 'anuario'].includes(x)), `${q.id}: requiere ${q.requiere}`);
        for (const f of q.figuras) assert.ok(existsSync(join(RAIZ, `data/ejes/${r.id}`, f)), `${q.id}: falta la figura ${f}`);
        assert.ok(Array.isArray(q.apareceEn) && q.apareceEn.length && q.apareceEn.every((a) => convs.has(a.conv)), `${q.id}: apareceEn`);
        assert.ok(q.fuentes && ['examen', 'plantilla', 'pagina', 'correccion'].every((k) => k in q.fuentes), `${q.id}: fuentes`);
        assert.ok(NORMA.includes(q.norma?.estado), `${q.id}: norma ${q.norma?.estado}`);
      }
      for (const c of ficha.reserva[tit] ?? []) assert.ok(convs.has(c), `reserva: ${c} no es una convocatoria`);
    });

    test(`eje ${r.id} · ${tit}: explicación del profe para cada pregunta que no es de carta`, () => {
      const qs = leerJSON(`${dir}/preguntas.json`).preguntas;
      const expl = leerJSON(`${dir}/explicaciones.json`);
      const ids = new Set(qs.map((q) => q.id));
      for (const q of qs) if (!q.requiere.includes('carta')) assert.ok(expl[q.id]?.explicacion && expl[q.id]?.clave, `sin explicación: ${q.id}`);
      for (const id of Object.keys(expl)) assert.ok(ids.has(id), `explicación de una pregunta que no está: ${id}`);
    });

    test(`eje ${r.id} · ${tit}: la práctica y los resueltos citan clases y preguntas que existen`, () => {
      const ids = new Set(leerJSON(`${dir}/preguntas.json`).preguntas.map((q) => q.id));
      const clases = clasesDe(tit);
      for (const f of ['practica', 'resueltos']) {
        if (!existsSync(join(RAIZ, `${dir}/${f}.json`))) continue;
        for (const [l, v] of Object.entries(leerJSON(`${dir}/${f}.json`))) {
          assert.ok(clases.has(l), `${f}: ${l} no es una clase del ${tit}`);
          for (const id of Array.isArray(v) ? v : [...(v.ids ?? []), ...(v.excepto ?? [])]) assert.ok(ids.has(id), `${f} ${l}: ${id}`);
        }
      }
    });
  }
}

test('migración de Andalucía: mismas preguntas, mismos ids y nada cambiado (enunciado, opciones, correcta, anulada, tema)', () => {
  const huellas = leerJSON('tools/bancos/andalucia-huella.json');
  const per = preguntasDe('per', 'andalucia');
  const py = preguntasDe('py', 'andalucia');
  assert.equal(per.length, 810); // 738 de teoría + 72 de carta
  assert.equal(per.filter((q) => q.requiere.includes('carta')).length, 72);
  assert.equal(py.length, 720);
  assert.equal(Object.keys(huellas).length, 810 + 720);
  const nuevas = new Map([...per, ...py].map((q) => [q.id, q]));
  for (const [id, h] of Object.entries(huellas)) {
    assert.ok(nuevas.has(id), `falta ${id}`);
    assert.equal(huella(nuevas.get(id)), h, `${id} ha cambiado`);
  }
  // Las claves de convocatoria del progreso guardado no cambian.
  assert.equal(nuevas.get('and-2023-c1-q42').conv, 'and-2023-c1');
  assert.equal(nuevas.get('and-py-2023-c1-g07').conv, 'and-py-2023-c1');
});

test('motor de bancos: banco, práctica de las clases y preguntas por id (de cualquier eje)', async () => {
  const b = bancosNode();
  const per = await b.cargarBanco(EJE_POR_DEFECTO, 'per');
  assert.equal(per.eje.id, EJE_POR_DEFECTO);
  assert.equal(per.estudio.length, per.todas.length);
  assert.deepEqual(per.final, []);
  assert.ok(per.convocatorias().every((c) => c.completa && c.n === 45));
  assert.equal(per.lista('carta').preguntas.length, 72);
  assert.equal(per.listaDe(per.porId.get('and-2020-c1-q42')).id, 'carta');
  const curso = await b.cargarCurso('per', EJE_POR_DEFECTO);
  const l = curso.modulos[0].lecciones[0];
  assert.deepEqual(l.practica, per.practicaDe(l.id));
  assert.ok(l.practica.length > 0);
  assert.equal((await b.pregunta('and-py-2021-c2-n15')).banco.tit, 'py');
  assert.equal(await b.pregunta('xyz-1'), null);
  assert.deepEqual(await b.resolverLegado('andalucia-per.json'), { eje: 'andalucia', tit: 'per', lista: 'carta' });
  // Un eje que no existe (p. ej. de unos ajustes viejos) cae en el de por defecto.
  assert.equal((await b.cargarBanco('no-existe', 'py')).eje.id, EJE_POR_DEFECTO);
});

test('motor de bancos: la reserva aparta convocatorias (modo examen) y además sus preguntas (modo pregunta)', async () => {
  const q = (id, conv, ut) => ({ id, eje: 'x', tit: 'py', conv, convocatoria: conv, fecha: conv, numero: 1, orden: 1, ut, opciones: { a: '1', b: '2' }, correcta: 'a', aceptadas: ['a'], anulada: false, requiere: [], apareceEn: [{ conv }] });
  const preguntas = [q('x-1', 'x-2025-01', 1), q('x-2', 'x-2025-01', 2), q('x-3', 'x-2025-06', 1), q('x-4', 'x-2025-06', 2)];
  const datos = (modo) => ({
    'data/ejes/index.json': { ejes: [{ id: 'x', prefijo: 'x', nombre: 'X', estado: 'publicado' }] },
    'data/ejes/x/eje.json': { id: 'x', nombre: 'X', prefijo: 'x', examen: { py: {} }, reserva: { modo, py: ['x-2025-06'] } },
    'data/ejes/x/py/preguntas.json': { meta: { eje: 'x', tit: 'py' }, preguntas },
    'data/ejes/x/py/practica.json': { 'py-1-1': ['x-1', 'x-3'] },
  });
  const leer = (d) => async (ruta) => { if (!(ruta in d)) throw new Error(ruta); return d[ruta]; };
  for (const modo of ['examen', 'pregunta']) {
    const banco = await crearBancos(leer(datos(modo))).cargarBanco('x', 'py');
    assert.deepEqual(banco.final.map((x) => x.id), ['x-3', 'x-4'], modo);
    assert.deepEqual(banco.convocatorias().map((c) => c.key), ['x-2025-01'], modo);
    assert.deepEqual(banco.estudio.map((x) => x.id), modo === 'examen' ? ['x-1', 'x-2', 'x-3', 'x-4'] : ['x-1', 'x-2'], modo);
    assert.deepEqual(banco.practicaDe('py-1-1'), modo === 'examen' ? ['x-1', 'x-3'] : ['x-1'], modo);
  }
});

test('ningún código de la app nombra un banco ni un eje concretos (todo pasa por src/bancos)', () => {
  // Fuera de src/bancos: las soluciones de carta (contenido del eje, por id), las láminas y el texto de la
  // declinación de los ejercicios de rumbos (contenido, no acoplamiento a un banco).
  const fuera = [/^src\/bancos\//, /^src\/exams\/solutions\/[^/]+\.js$/, /^src\/illustrations\//];
  const permitido = { 'src/exercises/compass-data.js': /notación de los exámenes de Andalucía/ };
  const prohibido = [/andalucia/i, /Andaluc/, /\band-(py-)?\d/];
  const ficheros = (d) => readdirSync(join(RAIZ, d)).flatMap((n) => (statSync(join(RAIZ, d, n)).isDirectory() ? ficheros(`${d}/${n}`) : [`${d}/${n}`]));
  const malos = [];
  for (const f of ficheros('src').filter((x) => x.endsWith('.js') && !fuera.some((re) => re.test(x)))) {
    const lineas = readFileSync(join(RAIZ, f), 'utf8').split('\n');
    lineas.forEach((l, i) => {
      if (permitido[f]?.test(l)) return;
      if (prohibido.some((re) => re.test(l))) malos.push(`${f}:${i + 1}: ${l.trim().slice(0, 100)}`);
    });
  }
  assert.deepEqual(malos, []);
});

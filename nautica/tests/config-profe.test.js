// Configuración del profesor: esquema estricto, texto limpio, aplicación sobre los datos por defecto (ruta, reglas y
// chuletas) en un solo sitio, `requiere` respetado y vuelta a lo de siempre al quitarla.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validarConfig, leerConfigTexto, aplicarConfigCurso, aplicarConfigReglas, aplicarConfigReglasDe, resumenConfig, crearConfig, sanearTexto, lineasChuleta,
  problemasRutaConfig, nombreConfig, LIMITES } from '../src/course/config-profe.js';
import { ordenRuta } from '../src/course/ruta.js';
import { planHoy } from '../src/course/plan.js';
import { leccionesDe } from '../src/course/engine.js';
import { PY } from '../src/theory/blocks.js';
import { cursoDe, bancosNode, EJE_POR_DEFECTO } from '../tools/bancos/leer.mjs';

const CURSOS = { per: cursoDe('per'), py: cursoDe('py') };
const REGLAS = JSON.parse(readFileSync(new URL('../data/comun/mnemotecnias.json', import.meta.url), 'utf8')).reglas;
const ctx = { cursos: CURSOS, reglas: REGLAS };
const base = { version: 1, autor: 'Marta Ruiz', nombre: 'Grupo de tarde', fecha: '2026-10-07' };
const rutaPy = () => ordenRuta(CURSOS.py, PY).map((l) => l.id);

test('una configuración mínima es válida y se limpia', () => {
  const r = validarConfig({ ...base, autor: '  Marta\u0000  Ruiz\n ' }, ctx);
  assert.equal(r.ok, true, r.errores.join(' '));
  assert.equal(r.config.autor, 'Marta Ruiz');
  assert.equal(nombreConfig(r.config), 'Ruta de: Marta Ruiz');
});

test('ficheros no válidos: se rechazan con un motivo, sin lanzar', () => {
  const malos = [
    '', 'no es json', '[]', '{"version":2,"autor":"a","nombre":"b","fecha":"2026-01-01"}',
    JSON.stringify({ ...base, extra: 1 }),
    JSON.stringify({ ...base, autor: '' }),
    JSON.stringify({ ...base, fecha: 'ayer' }),
    JSON.stringify({ ...base, tit: 'capitan' }),
    JSON.stringify({ ...base, ruta: 'py-3-1' }),
    JSON.stringify({ ...base, ruta: ['py-3-1', 'py-3-1'] }),
    JSON.stringify({ ...base, ruta: ['<script>'] }),
    JSON.stringify({ ...base, reglas: { borrar: [] } }),
    JSON.stringify({ ...base, reglas: { añadir: [{ regla: '' }] } }),
    JSON.stringify({ ...base, reglas: { cambiar: { r01: { regla: 'x', html: '<b>' } } } }),
    JSON.stringify({ ...base, chuletas: { 'py-3-1': ['a'] } }),
    '{"version":1,"autor":"a","nombre":"b","fecha":"2026-01-01","__proto__":{"x":1}}',
    'x'.repeat(LIMITES.bytes + 1),
  ];
  for (const t of malos) {
    const r = leerConfigTexto(t, ctx);
    assert.equal(r.ok, false, `debería rechazar: ${t.slice(0, 80)}`);
    assert.ok(r.errores.length && r.config === null);
  }
});

test('el texto queda como texto: sin control ni bidi, recortado; el HTML no se interpreta (se guarda tal cual, como texto)', () => {
  assert.equal(sanearTexto('a‮b​c'), 'abc');
  assert.equal(sanearTexto('x'.repeat(200), 10).length, 10);
  const r = validarConfig({ ...base, reglas: { añadir: [{ regla: '<img src=x onerror=alert(1)>', significado: 'ok' }] } }, ctx);
  assert.equal(r.ok, true);
  assert.equal(r.config.reglas.añadir[0].regla, '<img src=x onerror=alert(1)>');
  assert.deepEqual(lineasChuleta('- uno\n\n• dos\n   tres  '), ['uno', 'dos', 'tres']);
});

test('ids desconocidos: se avisa y no es fatal', () => {
  const r = validarConfig({ ...base, ruta: ['py-3-1', 'py-9-9'], chuletas: { 'no-existe': 'x' }, reglas: { quitar: ['r999'] } }, ctx);
  assert.equal(r.ok, true);
  assert.equal(r.avisos.length, 3);
  assert.match(r.avisos.join(' '), /py-9-9/);
  assert.match(r.avisos.join(' '), /no-existe/);
  assert.match(r.avisos.join(' '), /r999/);
});

test('ruta: se aplica a su curso (las clases que no nombra, al final) y el plan la sigue', () => {
  // El profesor pone primero el bloque de meteorología (no requiere nada fuera de su tema).
  const met = rutaPy().filter((id) => id.startsWith('py-2-'));
  const ruta = [...met, ...rutaPy().filter((id) => !met.includes(id))];
  const { config } = validarConfig({ ...base, tit: 'py', ruta }, ctx);
  const c = aplicarConfigCurso(CURSOS.py, config, 'py');
  assert.deepEqual(ordenRuta(c, PY).map((l) => l.id), ruta);
  assert.deepEqual(planHoy({ estructura: PY, curso: c, preguntas: [] })[0].ruta, ['curso', 'py-2-1']);
  // Al PER no le afecta.
  assert.equal(aplicarConfigCurso(CURSOS.per, config, 'per'), CURSOS.per);
  // Solo una parte de la ruta: las demás, después, en el orden de estudio.
  const parcial = validarConfig({ ...base, ruta: ['py-1-1', 'py-1-2'] }, ctx).config;
  assert.deepEqual(ordenRuta(aplicarConfigCurso(CURSOS.py, parcial, 'py'), PY).slice(0, 3).map((l) => l.id), ['py-1-1', 'py-1-2', 'py-3-1']);
});

test('ruta que no respeta «requiere»: se avisa y se sigue la ruta por defecto', () => {
  const mala = ['py-4-9', ...rutaPy().filter((id) => id !== 'py-4-9')]; // mareas en la carta antes de la marea básica
  const r = validarConfig({ ...base, tit: 'py', ruta: mala }, ctx);
  assert.equal(r.ok, true);
  assert.match(r.avisos.join(' '), /no respeta/);
  assert.ok(problemasRutaConfig(r.config, CURSOS.py, 'py').some((v) => v.id === 'py-4-9'));
  assert.deepEqual(ordenRuta(aplicarConfigCurso(CURSOS.py, r.config, 'py'), PY).map((l) => l.id), rutaPy());
  // Una ruta parcial que deja fuera un requisito también lo incumple (lo que falta va al final).
  const sinBase = validarConfig({ ...base, ruta: ['py-4-1'] }, ctx).config;
  assert.ok(problemasRutaConfig(sinBase, CURSOS.py, 'py').length);
});

test('reglas: añadir, cambiar y ocultar sobre las de siempre (y lo mismo en las que cita el profe)', () => {
  const { config } = validarConfig({ ...base, reglas: { añadir: [{ regla: 'Verde, estribor', significado: 'Las dos con «e»' }], cambiar: { r01: { regla: 'Otra forma' } }, quitar: ['r02'] } }, ctx);
  const rs = aplicarConfigReglas(REGLAS, config);
  assert.equal(rs.length, REGLAS.length);
  assert.equal(rs.find((r) => r.id === 'r01').regla, 'Otra forma');
  assert.equal(rs.find((r) => r.id === 'r01').significado, REGLAS[0].significado);
  assert.ok(!rs.some((r) => r.id === 'r02'));
  assert.equal(rs.at(-1).regla, 'Verde, estribor');
  assert.deepEqual(aplicarConfigReglasDe([REGLAS[1]], config), []);
  assert.equal(aplicarConfigReglas(REGLAS, null), REGLAS);
});

test('chuletas: cambian las de las clases nombradas, sin tocar los datos por defecto', () => {
  const antes = JSON.stringify(CURSOS.py);
  const { config } = validarConfig({ ...base, chuletas: { 'py-4-9': 'Primero: UT.\n- Luego: la tabla.' } }, ctx);
  const c = aplicarConfigCurso(CURSOS.py, config, 'py');
  assert.deepEqual(leccionesDe(c).find((l) => l.id === 'py-4-9').chuleta, ['Primero: UT.', 'Luego: la tabla.']);
  assert.deepEqual(leccionesDe(c).find((l) => l.id === 'py-4-8').chuleta, leccionesDe(CURSOS.py).find((l) => l.id === 'py-4-8').chuleta);
  assert.equal(JSON.stringify(CURSOS.py), antes);
});

test('resumen de lo que cambia y exportación con el mismo esquema', () => {
  const ruta = [...rutaPy()];
  [ruta[2], ruta[3]] = [ruta[3], ruta[2]]; // py-4-1 ↔ py-1-1: ninguna requiere a la otra
  const r = crearConfig({ ...base, tit: 'py', ruta, reglas: { añadir: [], cambiar: { r01: { regla: 'x' } }, quitar: ['r02', 'r03'] }, chuletas: { 'py-3-1': 'a' } });
  assert.equal(r.ok, true, r.errores.join(' '));
  const lineas = resumenConfig(r.config, CURSOS);
  assert.match(lineas.join(' '), /Ruta del PY: cambia de sitio 2 clases/);
  assert.match(lineas.join(' '), /cambia 1 regla, oculta 2 reglas/);
  assert.match(lineas.join(' '), /cambia la de 1 clase/);
  assert.deepEqual(leerConfigTexto(JSON.stringify(r.config), ctx).config, r.config);
  assert.deepEqual(resumenConfig(validarConfig(base).config, CURSOS), ['No cambia nada de lo que hay ahora.']);
});

test('en la app: la configuración se aplica al cargar curso y reglas, y al quitarla vuelve lo de siempre', async () => {
  const b = bancosNode();
  let guardada = null;
  b.fijarConfigProfe(() => guardada);
  const ruta = ['py-2-1', ...rutaPy().filter((id) => id !== 'py-2-1')];
  const porDefecto = (await b.cargarCurso('py', EJE_POR_DEFECTO)).ruta;
  guardada = { ...base, tit: 'py', ruta, chuletas: { 'py-2-1': 'Isobaras juntas: viento fuerte' }, reglas: { quitar: ['r01'] } };
  const c = await b.cargarCurso('py', EJE_POR_DEFECTO);
  assert.deepEqual(ordenRuta(c, PY).map((l) => l.id), ruta);
  assert.deepEqual(leccionesDe(c).find((l) => l.id === 'py-2-1').chuleta, ['Isobaras juntas: viento fuerte']);
  assert.ok(leccionesDe(c).find((l) => l.id === 'py-2-1').practica, 'conserva la práctica del banco');
  assert.ok(!(await b.cargarMnemotecnias()).reglas.some((r) => r.id === 'r01'));
  assert.deepEqual((await b.cargarBanco(EJE_POR_DEFECTO, 'py')).reglasDe('and-2020-c1-t04').filter((r) => r.id === 'r01'), []);
  // Una configuración que llega mal (p. ej. de una copia editada a mano) se ignora.
  guardada = { ...base, version: 99, ruta };
  assert.deepEqual((await b.cargarCurso('py', EJE_POR_DEFECTO)).ruta, porDefecto);
  // Quitarla: todo como siempre.
  guardada = null;
  assert.deepEqual((await b.cargarCurso('py', EJE_POR_DEFECTO)).ruta, porDefecto);
  assert.equal((await b.cargarMnemotecnias()).reglas.length, REGLAS.length);
  assert.deepEqual(ordenRuta(await b.cargarCursoBase('py'), PY).map((l) => l.id), rutaPy());
});

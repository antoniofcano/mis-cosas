// Bloc de notas (hoja de borrador de un ejercicio): guardar, recuperar, borrar, cambio de ejercicio, datos del
// enunciado e inserción en la nota (src/bloc/notas.js), y dónde se ofrece (las vistas, por su código).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  CLAVE, MAX_NOTAS, CADUCA_DIAS, ID_BLOC, estadoVacio, leerEstado, podar, ponNota, quitaNota, textoNota,
  crearAlmacenBloc, trocear, datosDe, insertar, preguntaDeCuentas,
} from '../src/bloc/notas.js';

const leer = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const DIA = 864e5;

/** Un localStorage de mentira (lo que dura «el aparato»). */
function almacenFalso(inicial = {}) {
  const m = new Map(Object.entries(inicial));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, mapa: m };
}

test('guardar y recuperar: la nota es la de su ejercicio y otro ejercicio empieza en blanco', () => {
  const b = crearAlmacenBloc({ almacen: almacenFalso(), ahora: () => 1000 });
  const a = ID_BLOC.ejercicio('marea-sonda', 5);
  assert.equal(b.leer(a), '');
  assert.equal(b.hay(a), false);
  b.guardar(a, 'Hb = 0,45 m\nA = 2,45');
  assert.equal(b.leer(a), 'Hb = 0,45 m\nA = 2,45');
  assert.equal(b.hay(a), true);
  // otro ejercicio (otra semilla, otro tipo, una pregunta): en blanco, y no pisa el primero
  for (const otro of [ID_BLOC.ejercicio('marea-sonda', 6), ID_BLOC.ejercicio('estima-analitica', 5), ID_BLOC.pregunta('and-py-2020-c1-n18')]) {
    assert.equal(b.leer(otro), '');
    b.guardar(otro, `nota de ${otro}`);
  }
  assert.equal(b.leer(a), 'Hb = 0,45 m\nA = 2,45');
  assert.equal(b.ids().length, 4);
});

test('las notas siguen ahí al recargar (otro almacén sobre el mismo aparato) y con la clave prevista', () => {
  const aparato = almacenFalso();
  crearAlmacenBloc({ almacen: aparato, ahora: () => 1000 }).guardar('ej:x:1', 'D = 6 h 10 min');
  assert.ok(aparato.mapa.has(CLAVE), 'se guarda en localStorage con su propia clave');
  const trasRecargar = crearAlmacenBloc({ almacen: aparato, ahora: () => 2000 });
  assert.equal(trasRecargar.leer('ej:x:1'), 'D = 6 h 10 min');
  assert.equal(trasRecargar.leer('ej:x:2'), '');
});

test('borrar: desaparece esa nota y solo esa; guardar una nota vacía también la borra', () => {
  const aparato = almacenFalso();
  const b = crearAlmacenBloc({ almacen: aparato, ahora: () => 1000 });
  b.guardar('a', 'uno');
  b.guardar('b', 'dos');
  b.borrar('a');
  assert.equal(b.leer('a'), '');
  assert.equal(b.hay('a'), false);
  assert.equal(b.leer('b'), 'dos');
  b.guardar('b', '   \n ');
  assert.deepEqual(b.ids(), []);
  assert.deepEqual(JSON.parse(aparato.mapa.get(CLAVE)), { v: 1, notas: {} });
  b.borrar('no-existe'); // no falla
});

test('estado puro: ponNota, quitaNota y textoNota no cambian el estado que reciben', () => {
  const e0 = estadoVacio();
  const e1 = ponNota(e0, 'a', 'hola', 10);
  assert.deepEqual(e0, { v: 1, notas: {} });
  assert.equal(textoNota(e1, 'a'), 'hola');
  const e2 = quitaNota(e1, 'a', 20);
  assert.equal(textoNota(e1, 'a'), 'hola');
  assert.equal(textoNota(e2, 'a'), '');
});

test('poda: solo las más recientes y las que no han caducado', () => {
  let e = estadoVacio();
  for (let i = 0; i < MAX_NOTAS + 5; i++) e = ponNota(e, `n${i}`, `nota ${i}`, 1000 + i);
  assert.equal(Object.keys(e.notas).length, MAX_NOTAS);
  assert.equal(textoNota(e, 'n0'), '', 'las más antiguas salen');
  assert.equal(textoNota(e, `n${MAX_NOTAS + 4}`), `nota ${MAX_NOTAS + 4}`);
  // volver a escribir una nota la rejuvenece
  const viejo = ponNota(ponNota(estadoVacio(), 'vieja', 'x', 0), 'nueva', 'y', (CADUCA_DIAS - 1) * DIA);
  assert.equal(textoNota(podar(viejo, CADUCA_DIAS * DIA + 1), 'vieja'), '', 'caduca');
  assert.equal(textoNota(podar(viejo, CADUCA_DIAS * DIA + 1), 'nueva'), 'y');
});

test('lo guardado roto o de otra versión no rompe nada: se empieza de cero', () => {
  for (const crudo of ['{', 'null', '[]', '{"v":2,"notas":{"a":{"t":"x","m":1}}}', '{"v":1,"notas":7}', 7, undefined]) assert.deepEqual(leerEstado(crudo), estadoVacio());
  assert.deepEqual(leerEstado('{"v":1,"notas":{"a":{"t":"x","m":1},"b":{"t":5},"c":null,"d":{"t":"  ","m":1}}}'), { v: 1, notas: { a: { t: 'x', m: 1 } } });
  const b = crearAlmacenBloc({ almacen: almacenFalso({ [CLAVE]: '{roto' }), ahora: () => 1 });
  assert.equal(b.leer('a'), '');
  b.guardar('a', 'vale');
  assert.equal(b.leer('a'), 'vale');
});

test('sin almacenamiento (modo privado, cuota llena) las notas viven mientras dure la página', () => {
  const lleno = { getItem: () => null, setItem: () => { throw new Error('cuota'); } };
  const roto = { getItem: () => { throw new Error('prohibido'); }, setItem: () => { throw new Error('prohibido'); } };
  for (const almacen of [lleno, roto, null]) {
    const b = crearAlmacenBloc({ almacen, ahora: () => 1 });
    b.guardar('a', 'en memoria');
    assert.equal(b.leer('a'), 'en memoria');
    b.borrar('a');
    assert.equal(b.leer('a'), '');
  }
});

test('identificadores: cada ejercicio, cuenta y pregunta tiene el suyo; en un examen, uno por examen', () => {
  const ids = [ID_BLOC.ejercicio('marea-sonda', 5), ID_BLOC.ejercicio('marea-sonda', 6), ID_BLOC.cuenta('mat-5', 2, 77), ID_BLOC.cuenta('mat-5', 2, 78), ID_BLOC.cuenta('mat-5', 3, 77),
    ID_BLOC.pregunta('q1'), ID_BLOC.examen('simulacro:3', 'q1'), ID_BLOC.examen('simulacro:4', 'q1'), ID_BLOC.examen('real:2024-1', 'q1')];
  assert.equal(new Set(ids).size, ids.length);
});

test('datos del enunciado: números con su unidad, horas, grados y minutos, signos', () => {
  const marea = 'Según el Anuario de Mareas, en Cádiz hay una bajamar a las 04:15 UT con 0,45 m y la pleamar siguiente a las 10:30 UT con 2,90 m. La hora legal es UT + 1 h. Calcula la sonda a HRB = 08:20 en un punto con sonda en la carta de 1,85 m.';
  assert.deepEqual(datosDe(marea), ['04:15 UT', '0,45 m', '10:30 UT', '2,90 m', '+ 1 h', '08:20', '1,85 m']);
  assert.deepEqual(datosDe('navegamos a 6 nudos al Rumbo de aguja 315º, abatimiento de 20º. La declinación es 3,5º E 2017 (6\' W) y el Desvío = –8º (menos).'),
    ['6 nudos', '315º', '20º', '3,5º E', '2017', "6' W", '–8º']);
  assert.deepEqual(datosDe('situación 35º 58,0′ N, 006º 04,0′ W; l = 36º-02,4’ N'), ['35º 58,0′ N', '006º 04,0′ W', '36º-02,4’ N']);
  assert.deepEqual(datosDe('A HRB = 12h 00m estamos a 4 millas al Sur. Marcación 110º Babor. La travesía dura 2 h 25 min. Ct de +7°. Pasa 62° 46′ 13″ a decimal.'),
    ['12h 00m', '4 millas', '110º', '2 h 25 min', '+7°', '62° 46′ 13″']);
  assert.deepEqual(datosDe('Navegas a 11,6 nudos. ¿Cuántas millas recorres en 94 minutos? Mide 1,98 cm.'), ['11,6 nudos', '94 minutos', '1,98 cm']);
  // no se parte una palabra ni se toma por dato una letra con número pegado
  assert.deepEqual(datosDe('Pregunta P12 del test T3: sin datos'), []);
  assert.deepEqual(datosDe('Tabla:\n29   05:02   2,98\n29   11:01   0,90'), ['29', '05:02', '2,98', '11:01', '0,90'], 'sin repetir');
  assert.deepEqual(datosDe(''), []);
  assert.deepEqual(datosDe(null), []);
});

test('trocear: los trozos unidos son el enunciado tal cual', () => {
  for (const t of ['A las 04:15 UT hay 0,45 m.', 'Sin números', '36º N', '', '8 nudos', 'x = –8º (menos), y = +7°']) {
    const trozos = trocear(t);
    assert.equal(trozos.map((x) => x.t).join(''), t);
    assert.ok(trozos.every((x) => x.t.length > 0));
    assert.deepEqual(trozos.filter((x) => x.dato).map((x) => x.t), trocear(t).filter((x) => x.dato).map((x) => x.t));
  }
  assert.deepEqual(trocear('Hay 8 nudos.'), [{ t: 'Hay ', dato: false }, { t: '8 nudos', dato: true }, { t: '.', dato: false }]);
});

test('insertar en la nota: donde está el cursor, con los espacios justos', () => {
  assert.deepEqual(insertar('', 0, 0, '0,45 m'), { texto: '0,45 m', cursor: 6 });
  assert.deepEqual(insertar('Hb', 2, 2, '='), { texto: 'Hb = ', cursor: 5 }, 'tras «=» queda listo para el valor');
  assert.deepEqual(insertar('Hb = ', 5, 5, '0,45 m'), { texto: 'Hb = 0,45 m', cursor: 11 });
  assert.deepEqual(insertar('Hb =', 4, 4, '0,45 m'), { texto: 'Hb = 0,45 m', cursor: 11 }, 'pone el espacio que falta');
  assert.deepEqual(insertar('Hb = 0,45 m', 11, 11, '\n'), { texto: 'Hb = 0,45 m\n', cursor: 12 });
  assert.deepEqual(insertar('Hb = 0,45 m\n', 12, 12, '2.45'), { texto: 'Hb = 0,45 m\n2.45', cursor: 16 });
  assert.deepEqual(insertar('12', 2, 2, '°', { pegado: true }), { texto: '12°', cursor: 3 }, 'grados y minutos van pegados al número');
  // en mitad de una línea no se pega a lo que sigue; y sustituye lo seleccionado
  assert.deepEqual(insertar('a\nb', 1, 1, '5'), { texto: 'a 5\nb', cursor: 3 });
  assert.deepEqual(insertar('A = xx m', 4, 6, '2,45'), { texto: 'A = 2,45 m', cursor: 8 });
  assert.deepEqual(insertar('A = (', 5, 5, '3'), { texto: 'A = (3', cursor: 6 });
  // cursor fuera de rango o sin cursor: al final
  assert.deepEqual(insertar('Hb =', 99, 99, '1'), { texto: 'Hb = 1', cursor: 6 });
  assert.deepEqual(insertar('Hb =', undefined, undefined, '1'), { texto: 'Hb = 1', cursor: 6 });
  assert.deepEqual(insertar(null, 0, 0, 'x'), { texto: 'x', cursor: 1 });
});

test('preguntas de cuentas fuera del tema de carta: con datos, que piden calcular y con opciones numéricas', () => {
  const si = [
    { enunciado: 'Hallar el desvío con una Ct = -1 y una dm = -4.', opciones: { a: '5-.', b: '3+.', c: '5+.', d: '3-.' } },
    { enunciado: 'Según la corredera hemos navegado 10,4 millas en una hora. ¿Qué distancia real hemos navegado si el coeficiente es 0,97?', opciones: { a: '9,4′', b: '10,1′', c: '10,7′', d: '11,4′' } },
    { enunciado: '¿Cuánto vale el calado medio de una embarcación que cala a proa 1,10 metros y a popa 1,20 metros?', opciones: { a: '1,10 metros.', b: '1,20 metros.', c: '1,15 metros.', d: '10 centímetros.' } },
  ];
  const no = [
    { enunciado: '¿Cuántos satélites componen el sistema GPS?', opciones: { a: 'Al menos 30', b: 'Al menos 24', c: 'Al menos 18', d: 'Al menos 12' } },
    { enunciado: '¿Cuánto tiempo seguirá ardiendo una bengala tras sumergirla a 100 mm?', opciones: { a: '1 minuto', b: '10 segundos', c: '30 segundos', d: '25 segundos' } },
    { enunciado: 'Calcular qué luz muestra un velero de menos de 7 metros.', opciones: { a: 'Una blanca', b: 'Ninguna', c: 'Una roja', d: 'Una verde' } },
    { enunciado: '¿Qué es el abatimiento?', opciones: { a: 'Un ángulo', b: 'Una fuerza' } },
    { enunciado: 'Calcula 2 + 2', opciones: {} },
    {},
  ];
  for (const q of si) assert.equal(preguntaDeCuentas(q), true, q.enunciado);
  for (const q of no) assert.equal(preguntaDeCuentas(q), false, q.enunciado ?? '(vacía)');
});

// ---------------------------------------------------------------------------
// Dónde se ofrece (por el código de las vistas) y qué no hace

test('el bloc está en todos los sitios donde se hacen cuentas', () => {
  const ejercicio = leer('src/ui/views/exercise.js');
  assert.match(ejercicio, /botonBloc\(bloc/, 'ejercicios generados (con y sin carta)');
  assert.match(ejercicio, /ID_BLOC\.ejercicio\(exercise\.id, seed\)/, 'la nota es de esa semilla');
  assert.match(ejercicio, /openWorkspace\(\{[^}]*\bbloc\b/s, 'y la lleva a la mesa de cartas');
  const curso = leer('src/ui/views/curso.js');
  assert.match(curso, /botonBloc\(\{ id: ID_BLOC\.cuenta\(L\.id, i, s\)/, '«Haz la cuenta» de las clases');
  assert.match(curso, /modelo-acciones[\s\S]{0,400}botonBloc\(/, 'problema modelo de las clases');
  const teoria = leer('src/ui/views/theory.js');
  assert.match(teoria, /esDeCuentas\(q\)\) \{ fila\.append\(botonBloc\(blocDePregunta\(q\)/, 'preguntas reales de cuentas en las tandas');
  assert.match(teoria, /esDeCuentas\(q\) \? botonBloc\(blocExamen\(q\)/, 'y en los exámenes');
  assert.match(leer('src/ui/views/exams.js'), /botonBloc\(bloc/, 'pregunta real suelta');
  assert.match(leer('src/ui/chart/workspace.js'), /crearBloc\(\{ \.\.\.o\.bloc/, 'pestaña «Bloc» de la mesa de cartas');
});

test('en un examen el bloc es de ese examen y respeta la calculadora del examen', () => {
  const teoria = leer('src/ui/views/theory.js');
  assert.match(teoria, /blocExamen = \(q\) => blocDePregunta\(q, \{ examen: `\$\{tipo\}:\$\{estado\.conv \?\? estado\.seed \?\? ''\}`, calculadora: permitida \}\)/);
  assert.match(teoria, /examen \? ID_BLOC\.examen\(examen, q\.id\) : ID_BLOC\.pregunta\(q\.id\)/);
  assert.match(teoria, /cartaDeExamen\(q, progress, permitida, blocExamen\(q\)\)/, 'la carta del examen lleva el mismo bloc');
  // El componente no trae ayudas de práctica: ni glosas, ni chuleta, ni pasos, ni soluciones.
  const bloc = leer('src/ui/bloc.js');
  assert.doesNotMatch(bloc.replace(/^\s*\/\/.*$/gm, ''), /glosar|crearAyudas|chuleta|solve|steps|correcta/);
  assert.match(bloc, /o\.calculadora !== false && calculadoraEnExamen\(\)/, 'sin calculadora si el examen no la permite');
});

test('las notas se quedan en el aparato: no pasan por el progreso ni por la sincronización', () => {
  const logica = leer('src/bloc/notas.js');
  assert.doesNotMatch(logica, /^import /m, 'la lógica no depende de nada (ni del progreso ni de sync)');
  assert.doesNotMatch(leer('src/ui/bloc.js'), /store\/(progress|sync)/);
  for (const f of readdirSync(new URL('../src/store/sync/', import.meta.url))) assert.doesNotMatch(leer(`src/store/sync/${f}`), /nautica\.bloc|bloc\/notas/, f);
  assert.doesNotMatch(leer('src/store/progress.js'), /nautica\.bloc|bloc\/notas/);
});

test('estilos del bloc: móvil y pantalla ancha, sin animación con «reducir movimiento», colores del sistema', () => {
  const css = leer('styles/app.css');
  const mio = css.slice(css.indexOf('/* ---- Bloc de notas'));
  assert.match(mio, /@media \(max-width: 700px\)[\s\S]*\.bloc-hoja \{[^}]*height: var\(--bloc-alto/);
  assert.match(mio, /@media \(min-width: 701px\)[\s\S]*body\.con-bloc \{ padding-left: var\(--bloc-ancho\)/);
  assert.match(mio, /@media \(prefers-reduced-motion: no-preference\) \{\s*\.bloc-hoja \{ animation:/);
  assert.equal(mio.split('@media (prefers-reduced-motion: no-preference)')[0].includes('animation:'), false, 'fuera de esa regla no se anima nada');
  assert.doesNotMatch(mio.replace(/rgba\(0, 0, 0, \.\d+\)/g, ''), /#[0-9a-f]{3,6}\b|\brgba?\(/i, 'solo variables de color (claro y oscuro)');
  for (const boton of ['button.bloc-boton', 'button.bloc-dato', 'button.bloc-signo']) assert.match(mio, new RegExp(`${boton.replace('.', '\\.')} \\{[^}]*min-(height|width): 4[48]px`), boton);
});

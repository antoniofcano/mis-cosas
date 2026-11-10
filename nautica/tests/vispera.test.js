// El repaso exprés de la víspera (R-45): qué trampas se eligen (las de los temas con límite de fallos, priorizadas por
// las ideas flojas del alumno y por lo que más se pregunta), cómo se recortan a unos 15 minutos de lectura, de dónde
// salen (los pasos «ojo» del curso, las mismas de las chuletas), los errores que más repiten los tribunales y los del
// propio alumno, y su sitio en «la semana antes» (el día k = 1). Con juguetes y con los datos reales de PER y PY.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PER, PY, TITULACIONES } from '../src/theory/blocks.js';
import {
  repasoExpres, clasesConTrampas, erroresDeLaVispera, contarPalabras, minutosLectura, temasConLimite, resumenVispera,
  PALABRAS_MAX, PALABRAS_POR_MINUTO, MINUTOS_VISPERA, MAX_ERRORES, MAX_PROPIOS,
} from '../src/course/vispera.js';
import { planSemana, sesionDeSemana, ideasPriorizadas, temasPriorizados } from '../src/course/semana.js';
import { contenidoChuleta } from '../src/ui/views/chuleta.js';
import { ERRORES } from '../src/exams/taxonomia.js';
import { crearConceptos } from '../src/conceptos/index.js';
import { bancosNode, cursoDe, EJE_POR_DEFECTO, ejes, titsDeEje } from '../tools/bancos/leer.mjs';
import { sumaDiasISO } from '../src/course/calendario.js';
import { calcularErroresFrecuentes, documento, serializar, POR_BANCO } from '../tools/errores-frecuentes.mjs';

const leer = (f) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));
const MNEMO = leer('data/comun/mnemotecnias.json');
const REGLAS = new Map(MNEMO.reglas.map((r) => [r.id, r]));
const FRECUENTES = leer('data/comun/errores-frecuentes.json');

/** Un curso de juguete: temas 5 (límite) y 6 (límite) y 1 (sin límite), con trampas de distinta longitud. */
const palabras = (n, p = 'p') => Array.from({ length: n }, (_, i) => `${p}${i}`).join(' ');
const leccion = (id, ojos, extra = []) => ({ id, titulo: `Clase ${id}`, pasos: [...extra, ...ojos.map((texto) => ({ tipo: 'ojo', texto }))] });
const CURSO = { modulos: [
  { ut: 1, lecciones: [leccion('a1', [palabras(30, 'sinlimite')])] },
  { ut: 5, lecciones: [leccion('b1', [palabras(40, 'b1x'), palabras(40, 'b1y')]), leccion('b2', [palabras(40, 'b2x')])] },
  { ut: 6, lecciones: [leccion('r1', [palabras(40, 'r1x')]), leccion('r2', [palabras(40, 'r2x')], [{ tipo: 'regla', id: 'r18' }])] },
] };
const ESTR = { bloques: [{ ut: 1, titulo: 'Uno', n: 4 }, { ut: 5, titulo: 'Balizamiento', n: 5, maxErrores: 2, ico: 'boya' }, { ut: 6, titulo: 'RIPA', n: 10, maxErrores: 5, ico: 'barco' }] };
const idea = (id, clases, prioridad, estado = 'sin-ver') => ({ id, ut: 5, clases, prioridad, estado });
const textos = (r) => r.temas.flatMap((t) => t.trampas.map((x) => x.texto.split(' ')[0]));

test('palabras y minutos: sin marcas de énfasis; 15 minutos son 1950 palabras a lectura de estudio', () => {
  assert.equal(contarPalabras('Una **trampa** de «sotavento»: no es babor.'), 7);
  assert.equal(contarPalabras(''), 0);
  assert.equal(contarPalabras(null), 0);
  assert.equal(PALABRAS_POR_MINUTO, 130);
  assert.equal(PALABRAS_MAX, 1950);
  assert.equal(minutosLectura(1950), 15);
  assert.equal(minutosLectura(1951), 16);
  assert.equal(minutosLectura(0), 1);
});

test('solo los temas con límite de fallos: PER, Balizamiento, RIPA y Carta; PY, Teoría de navegación y Carta', () => {
  assert.deepEqual(temasConLimite(PER).map((b) => b.titulo), ['Balizamiento', 'Reglamento (RIPA)', 'Carta de navegación']);
  assert.deepEqual(temasConLimite(PY).map((b) => b.titulo), ['Teoría de navegación', 'Carta de navegación']);
  const r = repasoExpres({ curso: CURSO, estructura: ESTR });
  assert.deepEqual(r.temas.map((t) => t.ut), [5, 6], 'el tema 1 (sin límite) no entra');
  assert.ok(!textos(r).some((t) => t.startsWith('sinlimite')));
});

test('prioridad: las trampas de las clases con ideas de más prioridad van antes; «te cuesta» marca las de ideas flojas', () => {
  const ideas = [idea('i1', ['b2'], 0.2, 'floja'), idea('i2', ['b1'], 0.05), idea('i3', ['r2'], 0.3), idea('i4', ['r1'], 0.01)];
  const r = repasoExpres({ curso: CURSO, estructura: ESTR, ideas });
  const bal = r.temas.find((t) => t.ut === 5);
  assert.deepEqual(bal.trampas.map((x) => x.leccion), ['b2', 'b1', 'b1'], 'b2 (0,2) antes que b1 (0,05)');
  assert.equal(bal.trampas[0].tuyo, true);
  assert.equal(bal.trampas[1].tuyo, false);
  assert.deepEqual(r.temas.find((t) => t.ut === 6).trampas.map((x) => x.leccion), ['r2', 'r1']);
  // Sin ideas (banco sin etiquetas): por el tema y, dentro, en el orden del curso.
  const sin = repasoExpres({ curso: CURSO, estructura: ESTR, temas: [{ ut: 5, prioridad: 0.01 }, { ut: 6, prioridad: 0.2 }] });
  assert.deepEqual(sin.temas.find((t) => t.ut === 6).trampas.map((x) => x.leccion), ['r1', 'r2']);
  assert.ok(sin.temas.every((t) => t.trampas.every((x) => !x.tuyo)));
});

test('recorte: nunca pasa del límite, ningún tema con trampas se queda sin ninguna y lo de menos prioridad es lo que sale', () => {
  const ideas = [idea('i1', ['b1'], 0.5), idea('i2', ['b2'], 0.4), idea('i3', ['r1'], 0.1), idea('i4', ['r2'], 0.05)];
  // Cabe una sola trampa de 40 palabras más el título de su clase (2): con 100 palabras caben dos.
  const r = repasoExpres({ curso: CURSO, estructura: ESTR, ideas, palabrasMax: 100 });
  assert.ok(r.palabras <= 100, `${r.palabras} palabras`);
  assert.deepEqual(r.temas.map((t) => t.ut), [5, 6], 'cada tema con límite conserva su mejor trampa');
  assert.equal(r.temas.find((t) => t.ut === 5).trampas[0].leccion, 'b1');
  assert.equal(r.temas.find((t) => t.ut === 6).trampas[0].leccion, 'r1');
  assert.equal(r.recortado, true);
  assert.equal(r.fuera, 3);
  // Con sitio de sobra, entra todo y no hay recorte.
  const todo = repasoExpres({ curso: CURSO, estructura: ESTR, ideas });
  assert.equal(todo.recortado, false);
  assert.equal(todo.fuera, 0);
  assert.equal(todo.temas.reduce((s, t) => s + t.trampas.length, 0), 5);
  // Un límite cortísimo: lo que no cabe no entra (mejor menos que pasarse).
  const nada = repasoExpres({ curso: CURSO, estructura: ESTR, ideas, palabrasMax: 10 });
  assert.equal(nada.vacio, true);
  assert.ok(nada.palabras <= 10);
});

test('una trampa larga que no cabe se salta y entra otra más corta de menos prioridad', () => {
  const curso = { modulos: [{ ut: 5, lecciones: [leccion('l1', [palabras(70, 'larga')]), leccion('l2', [palabras(20, 'corta')])] }] };
  const ideas = [idea('i1', ['l1'], 0.5), idea('i2', ['l2'], 0.1)];
  const r = repasoExpres({ curso, estructura: ESTR, ideas, palabrasMax: 50 });
  assert.deepEqual(textos(r), ['corta0']);
});

test('las reglas para recordar de las clases elegidas entran solo si queda sitio', () => {
  const reglas = new Map([['r18', { regla: 'Roja a babor', significado: 'entrando en puerto' }]]);
  const ideas = [idea('i3', ['r2'], 0.3)];
  const con = repasoExpres({ curso: CURSO, estructura: ESTR, reglas, ideas });
  assert.deepEqual(con.temas.find((t) => t.ut === 6).reglas.map((x) => x.regla), ['Roja a babor']);
  const justo = repasoExpres({ curso: CURSO, estructura: ESTR, reglas, ideas, palabrasMax: 40 + 2 + 3 }); // la trampa de r2 y su título, sin la regla
  assert.deepEqual(justo.temas.flatMap((t) => t.reglas), []);
  assert.ok(justo.palabras <= 45);
});

test('es determinista: los mismos datos dan el mismo repaso', () => {
  const ideas = [idea('i1', ['b2'], 0.2, 'floja'), idea('i3', ['r2'], 0.3)];
  assert.deepEqual(repasoExpres({ curso: CURSO, estructura: ESTR, ideas }), repasoExpres({ curso: CURSO, estructura: ESTR, ideas }));
});

// --- los errores típicos ----------------------------------------------------------------------------------------------

test('errores: los del alumno primero (tres como mucho y con al menos dos veces), después los que más repite el tribunal', () => {
  const tribunal = [{ id: 'signo-ct', n: 48 }, { id: 'signo-dm', n: 22 }, { id: 'signo-desvio', n: 15 }, { id: 'horas-decimales', n: 5 }, { id: 'sin-ct', n: 5 }, { id: 'banda-marcacion', n: 4 }];
  const propios = [{ id: 'horas-decimales', n: 4 }, { id: 'banda-marcacion', n: 1 }, { id: 'lineal', n: 3 }, { id: 'inventado', n: 9 }, { id: 'sin-ct', n: 2 }, { id: 'signo-dm', n: 2 }];
  const e = erroresDeLaVispera({ tribunal, propios });
  assert.equal(e.length, MAX_ERRORES);
  assert.deepEqual(e.slice(0, MAX_PROPIOS).map((x) => x.id), ['horas-decimales', 'lineal', 'sin-ct'], 'tus tres más repetidos, de más a menos veces');
  assert.deepEqual(e.slice(0, 3).map((x) => x.tuyo), [4, 3, 2]);
  assert.deepEqual(e.slice(3).map((x) => x.id), ['signo-ct', 'signo-dm'], 'luego los del tribunal, sin repetir');
  assert.equal(e[3].tuyo, 0);
  assert.equal(e[4].tuyo, 2, 'un error del tribunal que también es tuyo lo dice');
  assert.ok(e.every((x) => ERRORES[x.id] && x.si && x.nombre), 'con su nombre y su «es lo que sale si…»');
  assert.ok(!e.some((x) => x.id === 'inventado' || x.id === 'banda-marcacion'), 'ni lo desconocido ni lo de una sola vez');
  // Sin errores propios, los del tribunal.
  assert.deepEqual(erroresDeLaVispera({ tribunal }).map((x) => x.id), tribunal.slice(0, 5).map((x) => x.id));
  assert.deepEqual(erroresDeLaVispera({}), []);
});

test('los errores van en el repaso solo si la titulación tiene un tema de carta con límite, y cuentan en el recorte', () => {
  const tribunal = [{ id: 'signo-ct', n: 48 }, { id: 'signo-dm', n: 22 }];
  const sin = repasoExpres({ curso: CURSO, estructura: ESTR, erroresTribunal: tribunal });
  assert.deepEqual(sin.errores, [], 'sin cartaUt no hay sección de errores');
  const con = repasoExpres({ curso: CURSO, estructura: ESTR, erroresTribunal: tribunal, cartaUt: 6 });
  assert.equal(con.errores.length, 2);
  assert.ok(con.palabras > sin.palabras);
  const estrecho = repasoExpres({ curso: CURSO, estructura: ESTR, erroresTribunal: tribunal, cartaUt: 6, palabrasMax: 60 });
  assert.ok(estrecho.palabras <= 60);
});

test('data/comun/errores-frecuentes.json: un fichero por banco, con errores de la taxonomía, de más a menos y sin reservadas', async () => {
  const claves = ejes().flatMap((e) => titsDeEje(e.id).map((t) => `${e.id}/${t}`));
  assert.deepEqual(Object.keys(FRECUENTES.porBanco).sort(), claves.sort());
  for (const [banco, xs] of Object.entries(FRECUENTES.porBanco)) {
    assert.ok(xs.length > 0 && xs.length <= POR_BANCO, banco);
    for (const x of xs) assert.ok(ERRORES[x.id] && Number.isInteger(x.n) && x.n > 0, `${banco}/${x.id}`);
    assert.deepEqual(xs.map((x) => x.n), [...xs.map((x) => x.n)].sort((a, b) => b - a), `${banco}: de más a menos`);
    assert.equal(new Set(xs.map((x) => x.id)).size, xs.length);
  }
  // El PER se equivoca en el signo de la Ct y el PY, en las mareas y el abatimiento: lo que ya sabe el diagnóstico.
  assert.equal(FRECUENTES.porBanco['andalucia/per'][0].id, 'signo-ct');
  // El formato se genera con la herramienta (una línea por error) y el fichero se lee igual de vuelta.
  assert.deepEqual(JSON.parse(serializar(documento(FRECUENTES.porBanco))).porBanco, FRECUENTES.porBanco);
  assert.equal(typeof calcularErroresFrecuentes, 'function');
});

// --- con los datos reales -----------------------------------------------------------------------------------------------

test('PER y PY reales: de los pasos «ojo» de las clases de los temas con límite, dentro de los 15 minutos', async () => {
  for (const tit of ['per', 'py']) {
    const T = TITULACIONES[tit];
    const curso = cursoDe(tit);
    const r = repasoExpres({ curso, estructura: T.estructura, reglas: REGLAS, erroresTribunal: FRECUENTES.porBanco[`${EJE_POR_DEFECTO}/${tit}`], cartaUt: T.cartaUt });
    assert.ok(!r.vacio, tit);
    assert.ok(r.palabras <= PALABRAS_MAX, `${tit}: ${r.palabras} palabras`);
    assert.ok(r.minutos <= MINUTOS_VISPERA, `${tit}: ${r.minutos} min`);
    assert.deepEqual(r.temas.map((t) => t.ut), temasConLimite(T.estructura).map((b) => b.ut), `${tit}: un apartado por cada tema con límite`);
    // La misma fuente que las chuletas: cada trampa es una trampa de la chuleta de su tema.
    for (const t of r.temas) {
      const chuleta = new Set(contenidoChuleta(curso, t.ut, REGLAS).flatMap((c) => c.trampas));
      for (const x of t.trampas) assert.ok(chuleta.has(x.texto), `${tit}/${t.ut}: ${x.texto.slice(0, 40)}…`);
      assert.ok(t.trampas.length > 0);
    }
    assert.ok(r.errores.length > 0 && r.errores.length <= MAX_ERRORES);
    // Se recorta de verdad: con todas las trampas candidatas y sin recortar, no cabrían.
    const total = temasConLimite(T.estructura).flatMap((b) => clasesConTrampas(curso, b.ut)).flatMap((c) => c.trampas).reduce((s, x) => s + contarPalabras(x), 0);
    assert.ok(total > PALABRAS_MAX * 0.9, `${tit}: ${total} palabras de trampas en los temas con límite`);
    assert.equal(r.recortado, r.fuera > 0);
    assert.match(resumenVispera(r), /REPASO EXPRÉS DE LA VÍSPERA: \d+ palabras/);
  }
});

test('PER real con un alumno que falla en RIPA: las trampas de las clases de sus ideas flojas van antes', async () => {
  const B = bancosNode();
  const ic = await crearConceptos(B).cargarConceptos(EJE_POR_DEFECTO, 'per');
  const banco = await B.cargarBanco(EJE_POR_DEFECTO, 'per');
  assert.ok(ic, 'el banco de Andalucía PER tiene etiquetas');
  // Falla todas las preguntas de RIPA (tema 6) y acierta las demás.
  const respuestas = {};
  for (const q of banco.practica) respuestas[q.id] = { ok: q.ut !== 6, c: 'a', t: '2026-11-01T10:00:00.000Z', n: 1, ok1: q.ut !== 6 };
  const base = { estructura: PER, preguntas: banco.practica, respuestas, reservadas: banco.reservadas };
  const ideas = ideasPriorizadas({ ic, ...base }).map((i) => ({ ...i, clases: ic.concepto(i.id)?.clases ?? [] }));
  const flojas = ideas.filter((i) => i.estado === 'floja');
  assert.ok(flojas.length > 0);
  const curso = cursoDe('per');
  const r = repasoExpres({ curso, estructura: PER, reglas: REGLAS, ideas, temas: temasPriorizados(base), cartaUt: PER.cartaUt });
  const ripa = r.temas.find((t) => t.ut === 6);
  assert.ok(ripa.trampas.some((x) => x.tuyo), 'alguna trampa de RIPA «te cuesta»');
  // Dentro de RIPA, por prioridad (peso × flojedad × frecuencia): de más a menos.
  const pr = ripa.trampas.map((x) => x.prioridad);
  assert.deepEqual(pr, [...pr].sort((x, y) => y - x));
  assert.ok(ripa.trampas[0].tuyo, 'la primera de RIPA es de una idea floja');
  assert.ok(r.palabras <= PALABRAS_MAX);
});

// --- en «la semana antes» -----------------------------------------------------------------------------------------------

const EXAMEN = '2026-11-21';
const hoyK = (k) => sumaDiasISO(EXAMEN, -k);
const basePlan = (o = {}) => ({ estructura: PER, fecha: EXAMEN, minutosDia: 20, ideas: [], temas: temasPriorizados({ estructura: PER, preguntas: [], respuestas: {} }), fallosHoy: 0, tarjetasHoy: 4, mazo: { id: 'buques', titulo: 'Luces y marcas de buques' }, cartaUt: 11, tests: [], hechos: {}, ...o });

test('la víspera (k = 1) pasa a ser el repaso exprés de 15 minutos; el resto del plan queda igual', () => {
  const con = planSemana({ ...basePlan({ repasoExpres: { minutos: 15 } }), dias: 7, hoy: hoyK(7) });
  const sin = planSemana({ ...basePlan(), dias: 7, hoy: hoyK(7) });
  const v = con.dias.find((x) => x.k === 1);
  assert.equal(v.tipo, 'vispera');
  assert.match(v.titulo, /Nada nuevo: repaso corto y descanso/);
  assert.equal(v.pasos.length, 1);
  assert.deepEqual([v.pasos[0].tipo, v.pasos[0].ruta.join('/'), v.pasos[0].minutos], ['vispera', 'vispera', 15]);
  assert.match(v.texto, /nada nuevo/i);
  assert.match(v.texto, /descansar/);
  // Todos los demás días, idénticos.
  assert.deepEqual(con.dias.filter((x) => x.k !== 1), sin.dias.filter((x) => x.k !== 1));
  // Sin el repaso exprés (curso sin trampas) vuelve el repaso corto de siempre.
  assert.ok(['tarjetas', 'chuleta'].includes(sin.dias.find((x) => x.k === 1).pasos[0].tipo));
  // Hoy es la víspera: la sesión de hoy es el repaso exprés, apuntando a #/<tit>/vispera.
  const hoy = planSemana({ ...basePlan({ repasoExpres: { minutos: 15 } }), dias: 1, hoy: hoyK(1) });
  const s = sesionDeSemana(hoy);
  assert.deepEqual([s.semana, s.pasos.map((p) => p.ruta.join('/'))], ['vispera', ['vispera']]);
  assert.equal(s.minutos, 15);
  // Sigue sin haber nada nuevo: ningún paso de la víspera es una clase, un simulacro o un mezclado.
  assert.ok(!hoy.dias[0].pasos.some((p) => ['clase', 'simulacro', 'final', 'mezclado', 'ideas'].includes(p.tipo)));
  // El día del examen, sin tarea.
  assert.equal(sesionDeSemana(planSemana({ ...basePlan({ repasoExpres: { minutos: 15 } }), dias: 0, hoy: hoyK(0) })), null);
});

// La entrada única (Hoy, docs/ENTRADA.md): estados, siguiente parada, faro del marcador y textos cortos. Funciones puras
// de src/course/entrada.js; no cambian ninguna lógica de la sesión, la travesía ni «¿Estás listo?».
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  esNuevo, estadoEntrada, siguienteParada, faroDeParada, paradaDeSesion, resumenPasos, lineaContexto, listoCorto, textoCarta,
} from '../src/course/entrada.js';
import { lineaListo } from '../src/course/listo.js';

const faro = (id, estado, corto = id, ideas = []) => ({ id, nombre: `Faro ${corto}`, corto, estado, ideas });
const FAROS = [faro('nomenclatura', 'on', 'Nomenclatura'), faro('maniobra', 'on', 'Maniobra'), faro('seguridad', 'parcial', 'Seguridad'),
  faro('balizamiento', 'parcial', 'Balizamiento'), faro('meteorologia', 'off', 'Meteorología'), faro('navegacion', 'off', 'Carta')];
const paso = (tipo, titulo, sub, minutos, ut = null) => ({ id: `${tipo}:x`, tipo, titulo, sub, minutos, ruta: ['x'], ut });

test('esNuevo: solo sin respuestas y sin clases terminadas', () => {
  assert.equal(esNuevo({ respondidas: 0, terminadas: 0 }), true);
  assert.equal(esNuevo({ respondidas: 1, terminadas: 0 }), false);
  assert.equal(esNuevo({ respondidas: 0, terminadas: 1 }), false);
  assert.equal(esNuevo(), true);
});

test('estadoEntrada: hecho hoy, a medias, nuevo, en curso; sin carta = sin-etiquetas', () => {
  assert.deepEqual(estadoEntrada({ sesion: { estado: 'hecha' }, terminada: true, carta: true }), { estado: 'hecho-hoy', carta: true, modo: 'hecho-hoy' });
  assert.equal(estadoEntrada({ sesion: { estado: 'pausada' }, terminada: false, carta: true }).estado, 'a-medias');
  assert.equal(estadoEntrada({ sesion: null, nuevo: true, carta: true }).estado, 'nuevo');
  assert.equal(estadoEntrada({ sesion: null, nuevo: false, carta: true }).estado, 'en-curso');
  // Una sesión sin pasos pendientes pero sin cerrar no se «sigue»: toca la de hoy (como antes en Hoy).
  assert.equal(estadoEntrada({ sesion: { estado: 'pausada' }, terminada: true }).estado, 'en-curso');
  const sin = estadoEntrada({ sesion: { estado: 'hecha' }, carta: false });
  assert.equal(sin.estado, 'hecho-hoy');
  assert.equal(sin.carta, false);
  assert.equal(sin.modo, 'sin-etiquetas');
});

test('siguienteParada: el primer faro sin encender; con todos encendidos, el examen', () => {
  const s = siguienteParada(FAROS);
  assert.equal(s.indice, 2);
  assert.equal(s.faro.id, 'seguridad');
  assert.equal(s.encendidos, 2);
  assert.equal(s.total, 6);
  assert.equal(s.alExamen, false);
  const todos = siguienteParada(FAROS.map((f) => ({ ...f, estado: 'on' })));
  assert.equal(todos.indice, -1);
  assert.equal(todos.alExamen, true);
  assert.equal(siguienteParada([]).alExamen, false);
});

test('faroDeParada: el faro con más ideas del tema que toca; sin tema, la siguiente parada', () => {
  const faros = [faro('a', 'on', 'A', [{ id: 'i1' }, { id: 'i2' }]), faro('b', 'off', 'B', [{ id: 'i3' }, { id: 'i4' }, { id: 'i5' }]), faro('c', 'off', 'C', [{ id: 'i6' }])];
  const temas = { i1: 1, i2: 1, i3: 1, i4: 2, i5: 2, i6: 3 };
  const temaDe = (id) => temas[id];
  assert.equal(faroDeParada(faros, 1, temaDe), 0, 'tema 1: dos ideas en A, una en B');
  assert.equal(faroDeParada(faros, 2, temaDe), 1);
  assert.equal(faroDeParada(faros, 3, temaDe), 2);
  assert.equal(faroDeParada(faros, null, temaDe), 1, 'sin tema: el primer faro sin encender');
  assert.equal(faroDeParada(faros, 9, temaDe), 1, 'tema sin ideas: el primer faro sin encender');
  assert.equal(faroDeParada(faros.map((f) => ({ ...f, estado: 'on' })), null, temaDe), -1, 'todos encendidos: la bandera');
  // A igualdad, el primero de la derrota.
  assert.equal(faroDeParada([faro('x', 'off', 'X', [{ id: 'k1' }]), faro('y', 'off', 'Y', [{ id: 'k2' }])], 5, () => 5), 0);
});

test('paradaDeSesion: la clase de la sesión (sin el tramo en el nombre); si no hay, el primer paso', () => {
  const pasos = [paso('fallos', 'Tus fallos', 'atracar de punta, con otra pregunta', 8), paso('clase', 'Clase nueva', 'El casco y las referencias del barco · tramo 1 de 3', 5, 1), paso('mezclado', 'Repaso mezclado', 'Temas ya vistos, revueltos', 8)];
  const p = paradaDeSesion(pasos);
  assert.equal(p.nombre, 'El casco y las referencias del barco');
  assert.equal(p.tipo, 'Clase nueva · tramo 1 de 3');
  assert.equal(p.paso.ut, 1);
  assert.equal(paradaDeSesion([paso('preguntas', 'Tu tema más flojo', 'Balizamiento: aciertas el 50 %', 10, 4)]).nombre, 'Balizamiento: aciertas el 50 %');
  const sim = paradaDeSesion([paso('simulacro', 'Simulacro', 'Examen completo con las reglas reales', 45)]);
  assert.deepEqual([sim.nombre, sim.tipo], ['Simulacro', 'Examen completo con las reglas reales']);
  // Sesión a medias: nombra el paso por el que va, aunque después venga una clase.
  assert.equal(paradaDeSesion(pasos, { actual: true }).nombre, 'Tus fallos');
  assert.equal(paradaDeSesion([]), null);
});

test('resumenPasos y lineaContexto', () => {
  assert.equal(resumenPasos([paso('a', '', '', 8), paso('b', '', '', 5), paso('c', '', '', 8)]), '3 pasos · 21 min');
  assert.equal(resumenPasos([paso('a', '', '', 9)]), '1 paso · 9 min');
  assert.equal(lineaContexto('PER', 38), 'PER · 38 días al examen');
  assert.equal(lineaContexto('PER', null), 'PER · sin fecha');
  assert.equal(lineaContexto('PY', -3), 'PY · sin fecha');
  assert.equal(lineaContexto('PER', 0), 'PER · examen hoy');
  assert.equal(lineaContexto('PER', 1), 'PER · examen mañana');
});

test('listoCorto: el mismo veredicto y margen que lineaListo, en una línea', () => {
  const r = { estado: 'casi', prob: 0.6, margen: { bajo: 0.5, alto: 0.7 }, simulacros: null, limitante: null };
  assert.equal(listoCorto(r), 'Casi: aprobarías entre 5 y 7 de cada 10');
  assert.match(lineaListo(r), /^Casi: con lo que aciertas ahora aprobarías entre 5 y 7 de cada 10/);
  const estrecho = { estado: 'listo', prob: 0.9, margen: { bajo: 0.85, alto: 0.93 }, simulacros: null, limitante: null };
  assert.equal(listoCorto(estrecho), 'Listo: aprobarías unas 9 de cada 10');
  assert.match(lineaListo(estrecho), /aprobarías unas 9 de cada 10/);
  assert.equal(listoCorto({ estado: 'aun-no', prob: 0.2, margen: { bajo: 0.1, alto: 0.4 } }), 'Todavía no: aprobarías entre 1 y 4 de cada 10');
  assert.equal(listoCorto({ estado: 'faltan-datos', temasSinDatos: [{}, {}, {}] }), 'Faltan datos de 3 temas');
  assert.equal(listoCorto(null), 'Aún sin datos');
});

test('textoCarta: dónde estás y la siguiente parada, para el texto alternativo de la carta', () => {
  assert.equal(textoCarta({ faros: FAROS, parada: 'El casco' }),
    'Tu derrota: 2 de 6 faros encendidos. Estás en Seguridad, faro 3 de 6; siguiente parada: «El casco».');
  assert.equal(textoCarta({ faros: FAROS, parada: 'Luces', marca: 3 }),
    'Tu derrota: 2 de 6 faros encendidos. Estás en Balizamiento, faro 4 de 6; siguiente parada: «Luces».');
  const apagados = FAROS.map((f) => ({ ...f, estado: 'off' }));
  assert.equal(textoCarta({ faros: apagados, parada: 'El casco', nuevo: true }),
    'Tu derrota: 6 faros, todos apagados. Estás en el inicio, Nomenclatura, faro 1 de 6; siguiente parada: «El casco».');
  assert.equal(textoCarta({ faros: FAROS.map((f) => ({ ...f, estado: 'on' })) }), 'Tu derrota: los 6 faros encendidos, rumbo al examen.');
  assert.equal(textoCarta({ faros: [] }), 'Tu derrota');
  // PY: menos faros.
  assert.match(textoCarta({ faros: FAROS.slice(0, 3), parada: 'La esfera', marca: 2 }), /faro 3 de 3/);
});

test('Hoy usa la carta de la Travesía (no una copia) y el CSS de la entrada va en su bloque', () => {
  const hoy = readFileSync(new URL('../src/ui/views/hoy.js', import.meta.url), 'utf8');
  assert.match(hoy, /import \{ cartaDerrota \} from '\.\/travesia\.js'/);
  assert.doesNotMatch(hoy, /posicionesDerrota|carta-fondo/);
  const css = readFileSync(new URL('../styles/app.css', import.meta.url), 'utf8');
  const i = css.indexOf('/* ---- Entrada única ---- ');
  const j = css.indexOf('/* ---- fin Entrada única ---- */');
  assert.ok(i > 0 && j > i, 'bloque CSS propio de la entrada');
  const bloque = css.slice(i, j);
  assert.doesNotMatch(bloque, /@keyframes|animation:|transition:/, 'sin animaciones nuevas');
  assert.match(bloque, /\.boton-sesion\.entrada-seguir \{[^}]*min-height: 56px/);
});

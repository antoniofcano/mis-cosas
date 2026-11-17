// El tope de densidad (H-74), la parte que cabe en `npm test` (sin navegador): la longitud de los textos fijos de la interfaz
// de Estrategia, Pódcast, Hoy, bienvenida, Ajustes y Tema (src/ui/textos-hubs.js), lo que la Estrategia deja abierto y lo que
// Hoy enseña al alumno nuevo. Lo que se mide en pantalla (palabras, controles, alto y posición de la acción frente al
// presupuesto de la auditoría) lo hace `node tools/densidad.mjs`, que necesita Playwright.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ESTRATEGIA, PODCAST, HOY, BIENVENIDA, AJUSTES, TEMA, LIMITES, palabras, primeraFrase } from '../src/ui/textos-hubs.js';
import { cifrasExamen, bloquesAbiertos, BLOQUES_ESTRATEGIA, DIAS_DIA_ABIERTO } from '../src/course/estrategia.js';
import { hayDatos } from '../src/course/entrada.js';
import { TITULACIONES } from '../src/theory/blocks.js';

const leer = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const ficha = JSON.parse(leer('data/ejes/andalucia/eje.json'));
const TEXTOS = { estrategia: ESTRATEGIA, podcast: PODCAST, hoy: HOY, bienvenida: BIENVENIDA, ajustes: AJUSTES, tema: TEMA };
const dame = (ruta) => ruta.split('.').reduce((x, k) => x?.[k], TEXTOS);

test('cada texto fijo de estas pantallas cabe en su límite de palabras', () => {
  for (const [ruta, max] of Object.entries(LIMITES)) {
    const t = dame(ruta);
    assert.equal(typeof t, 'string', `falta el texto ${ruta}`);
    assert.ok(palabras(t) <= max, `${ruta}: ${palabras(t)} palabras (máximo ${max}): «${t}»`);
  }
});

test('los textos con datos (resúmenes de bloque) también se mantienen cortos', () => {
  for (const T of Object.values(TITULACIONES)) {
    const c = cifrasExamen(T, ficha);
    assert.ok(palabras(ESTRATEGIA.entrada(T.sigla, ficha.nombre)) <= 22, `entrada ${T.sigla}`);
    assert.ok(palabras(ESTRATEGIA.resumenLimites(c)) <= 22, `límites ${T.sigla}: ${ESTRATEGIA.resumenLimites(c)}`);
    assert.ok(palabras(ESTRATEGIA.resumenTiempo(c, 330)) <= 12, ESTRATEGIA.resumenTiempo(c, 330));
    if (c.modulos.length) assert.ok(palabras(ESTRATEGIA.resumenModulos(c)) <= 12, ESTRATEGIA.resumenModulos(c));
    // Lo que se ve de la Estrategia con todo plegado, sin lo que sale de los datos del alumno: entrada, botón, cifras y los
    // títulos y resúmenes de sus bloques. Cabe de sobra en los 250 palabras del presupuesto de las pantallas de referencia.
    const fijas = [ESTRATEGIA.entrada(T.sigla, ficha.nombre), ESTRATEGIA.sinDatos, ESTRATEGIA.boton, 'Tu examen en cifras', 'Tu estrategia',
      '45 preguntas 90 minutos 2 minutos por pregunta 32 aciertos para aprobar 13 fallos como máximo',
      ESTRATEGIA.limites, ESTRATEGIA.resumenLimites(c), ESTRATEGIA.tiempo, ESTRATEGIA.resumenTiempo(c, 330), ESTRATEGIA.contestar, ESTRATEGIA.resumenContestar,
      ESTRATEGIA.modulos(T.sigla), ESTRATEGIA.resumenModulos(c), ESTRATEGIA.dia, ESTRATEGIA.resumenDia, ESTRATEGIA.fuentes, ESTRATEGIA.resumenFuentes];
    assert.ok(fijas.reduce((s, t) => s + palabras(t), 0) <= 130, `${T.sigla}: ${fijas.reduce((s, t) => s + palabras(t), 0)} palabras fijas`);
  }
  assert.ok(palabras(PODCAST.enPreparacion([2, 3, 4, 7, 8, 9])) <= 10);
  assert.equal(PODCAST.enPreparacion([2, 3, 4, 7, 8, 9]), 'En preparación: temas 2, 3, 4, 7, 8 y 9.');
  assert.equal(PODCAST.enPreparacion([5]), 'En preparación: tema 5.');
  assert.equal(TEMA.escucha(4, 57), 'Escúchalo: 4 episodios · 57 min →');
  assert.equal(TEMA.escucha(1, 13), 'Escúchalo: 1 episodio · 13 min →');
  assert.ok(palabras(AJUSTES.resumenEstudio('20 de noviembre', 20)) <= 8);
  assert.ok(palabras(AJUSTES.resumenAspecto('Automático', 'Normal')) <= 5);
  assert.ok(palabras(AJUSTES.resumenDatos(false, '17 de noviembre')) <= 6);
});

test('Estrategia: solo sale abierto «El día antes y el del examen», y solo a 14 días o menos de un examen con fecha', () => {
  assert.deepEqual(bloquesAbiertos(), []);
  assert.deepEqual(bloquesAbiertos({ diasAlExamen: null }), []);
  assert.deepEqual(bloquesAbiertos({ diasAlExamen: 40 }), []);
  assert.deepEqual(bloquesAbiertos({ diasAlExamen: DIAS_DIA_ABIERTO + 1 }), []);
  assert.deepEqual(bloquesAbiertos({ diasAlExamen: DIAS_DIA_ABIERTO }), ['dia']);
  assert.deepEqual(bloquesAbiertos({ diasAlExamen: 0 }), ['dia']);
  assert.deepEqual(bloquesAbiertos({ diasAlExamen: 5, orientativa: true }), [], 'una fecha orientativa no abre nada');
  assert.deepEqual(bloquesAbiertos({ diasAlExamen: -3 }), [], 'pasado el examen, nada');
  for (const id of bloquesAbiertos({ diasAlExamen: 3 })) assert.ok(BLOQUES_ESTRATEGIA.includes(id));
});

test('Estrategia (vista): sus bloques son los previstos y ninguno se escribe abierto a mano; al imprimir se abre todo', () => {
  const src = leer('src/ui/views/estrategia.js');
  const ids = [...src.matchAll(/plegable\(\{ id: 'est-b-([a-z]+)'[^}]*abierto: ([^,}]+)/g)];
  assert.deepEqual(ids.map((m) => m[1]), BLOQUES_ESTRATEGIA, 'los bloques plegables, en su orden');
  for (const m of ids) assert.equal(m[2].trim(), `abiertos.includes('${m[1]}')`, `${m[1]}: solo lo abre bloquesAbiertos()`);
  assert.match(src, /abrirAlImprimir\(el\)/);
  assert.match(src, /imprimible\?\.abrir\(\)/);
  // A la vista: cifras, el botón y «Tu estrategia» (no se pliegan).
  assert.match(src, /setChildren\(cuerpo, cifras, boton, tuyaEl, limites, tiempo, contestar, modulos, dia, fuentes\)/);
  // «Tu tiempo por tipo de problema de carta» solo con tiempos guardados.
  assert.match(src, /if \(!carta\.length\) return null/);
});

test('el plegable se abre entero al imprimir y vuelve a como estaba', () => {
  const src = leer('src/ui/plegable.js');
  assert.match(src, /beforeprint/); assert.match(src, /afterprint/);
  assert.match(src, /d\.open = true; abiertos\.add\(d\)/);
});

test('Hoy: Rango, Semana y «¿Estás listo?» no salen hasta que hay datos (1 clase terminada o 20 respuestas)', () => {
  assert.equal(hayDatos({ respondidas: 0, terminadas: 0 }), false);
  assert.equal(hayDatos(), false);
  assert.equal(hayDatos({ respondidas: 19, terminadas: 0 }), false);
  assert.equal(hayDatos({ respondidas: 20, terminadas: 0 }), true);
  assert.equal(hayDatos({ respondidas: 0, terminadas: 1 }), true);
  const src = leer('src/ui/views/hoy.js');
  assert.match(src, /const estadoEl = !conDatos \? null/);
  // Sin datos no salen la elección de módulo, el podcast, el progreso ni el aviso «¿Primera vez?» (pasaron a la bienvenida).
  assert.match(src, /sx\.estado\.activo \|\| !conDatos \? null : tarjetaFoco/);
  assert.match(src, /conDatos \? podcastHueco : null/);
  assert.match(src, /conDatos \? progresoEl : null/);
  assert.doesNotMatch(src, /guia-oferta/);
  assert.doesNotMatch(src, /Faltan datos/, 'Hoy no escribe «Faltan datos» por su cuenta: sale de listoCorto y solo con datos');
});

test('la bienvenida pregunta «¿De qué te examinas?» (si hay módulos) y ofrece la guía; Ajustes y Temario lo cambian', () => {
  const b = leer('src/ui/views/bienvenida.js');
  assert.match(b, /selectorFoco\(progress, tit\)/); assert.match(b, /TX\.guia/); assert.match(b, /claveFoco\(tit\), AMBOS/);
  assert.match(leer('src/ui/views/mas.js'), /selectorFoco\(progress, tit/);
  assert.match(leer('src/ui/views/temario.js'), /selectorFoco\(progress, tit/);
});

test('Ajustes: cuatro grupos plegados y solo «Estudio» abierto; el aviso de los datos está en un solo sitio', () => {
  const src = leer('src/ui/views/mas.js');
  const grupos = [...src.matchAll(/^    plegable\(\{ id: '(ajustes-[a-z]+)', titulo: TX\.([a-z]+)[^}]*?(abierto: true)?\s*\}/gm)];
  assert.deepEqual(grupos.map((m) => m[2]), ['estudio', 'aspecto', 'datos', 'acerca']);
  assert.deepEqual(grupos.filter((m) => m[3]).map((m) => m[2]), ['estudio']);
  // El aviso «Tus datos todavía no están protegidos…» (lineaProteccion) solo en Ajustes, no en Más.
  assert.match(src, /lineaProteccion\(progress\)/);
  assert.doesNotMatch(leer('src/ui/views/mas-menu.js'), /lineaProteccion/);
});

test('Pódcast: sin «Ver el guion» en la lista ni el episodio 0 duplicado; la tarjeta «Escucha ahora» arriba', () => {
  const src = leer('src/ui/views/podcast.js');
  assert.doesNotMatch(src, /Ver el guion/);
  assert.match(src, /t\.tema === 0 \? t\.episodios\.filter\(\(e\) => e\.id !== ahora\?\.id\)/);
  assert.match(src, /PODCAST\.ahora/);
});

test('Tema: la introducción se corta en la primera frase y las clases son tarjetas de dos líneas', () => {
  assert.equal(primeraFrase('Primera frase corta. Segunda frase.'), 'Primera frase corta.');
  assert.ok(palabras(primeraFrase('uno '.repeat(80).trim() + '.')) <= 31);
  const src = leer('src/ui/views/temario.js');
  assert.match(src, /TEMA\.antes\(/); assert.match(src, /vista && practicables\.has/);
});

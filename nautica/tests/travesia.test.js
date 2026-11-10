// La Travesía (docs/TRAVESIA.md): faros, rango, semana, insignias y parte de la sesión. Todo puro, con fechas fijas inyectadas
// (nada lee la hora): «ahora» siempre se pasa. Las reglas que fijan estos tests: hay un faro por tema del temario, el mismo
// y con las mismas cuentas que el del Temario; el faro se enciende con el 80 % de las ideas dominadas; el rango sale de un PORCENTAJE de las ideas del banco y nunca baja; el descanso no rompe la semana; las
// respuestas a preguntas reservadas no cuentan para nada; y sin etiquetas no hay travesía.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { indexarCatalogo } from '../src/conceptos/catalogo.js';
import { crearIndiceConceptos } from '../src/conceptos/conceptos.js';
import { crearConceptos } from '../src/conceptos/index.js';
import { createProgressStore } from '../src/store/progress.js';
import { nuevaSesion, sesionDeHoy } from '../src/course/sesion.js';
import {
  FAROS_ANTIGUOS, RANGOS, FARO_ENCENDIDO, DIAS_SEMANA, estadoTravesia, rangoPara, ideasParaRango, progresoRango, requisitoRango, resumenExamenes, examenesDe,
  semanaDe, hayUnaSemana, insigniasGanadas, catalogoInsignias, faltaInsignia, fusionar, fotoTravesia, parteSesion, paraManana,
  posicionesDerrota, PUNTOS_DERROTA, BANDERA, trazadoDerrota, faroInicial, ideasDelBanco, luzDeFaro, farosPorTema, farosDeTemas, idFaroTema,
} from '../src/course/travesia.js';
import { conceptosPorTema, temaDeIdea } from '../src/course/listo.js';
import { TITULACIONES, bloquesEnOrden } from '../src/theory/blocks.js';
import { ladoNombre } from '../src/illustrations/derrota-c.js';
import { plegar } from '../src/store/sync/plegar.js';
import { validarOperacion } from '../src/store/sync/operaciones.js';
import { bancosNode, ejes, titsDeEje } from '../tools/bancos/leer.mjs';

const AHORA = new Date(2026, 9, 8, 10, 0).getTime(); // jueves 8 de octubre de 2026, hora local
const T = '2026-10-08T09:00:00.000Z';

// ---------------------------------------------------------------------------------------------------------------
// Banco de juguete: `spec` = { bloque: nIdeas }. Cada idea tiene 3 preguntas de estudio (más una reservada para el examen
// final con `reservadas`, etiquetada con la misma idea pero fuera del estudio). Las preguntas de cada bloque son de un
// tema (UT): el faro de sus ideas es el de ese tema (`t<ut>`), como en la PER.
const UT = { nomen: 1, amarre: 2, seguridad: 3, baliza: 5, meteo: 9, nav: 10 };

const k = (id, etiqueta, extra = {}) => ({ id, tipo: 'concepto', etiqueta, tit: ['per'], clases: [], temario: 'pendiente', ...extra });
function juguete(spec, { reservadas = false } = {}) {
  const conceptos = [];
  const todas = [];
  const etiquetas = {};
  const reservada = new Set();
  const ideas = {};
  for (const [b, n] of Object.entries(spec)) {
    if (b !== 'nav') conceptos.push(k(b, `Bloque ${b}`, { tipo: 'grupo' }));
    ideas[b] = [];
    for (let i = 1; i <= n; i++) {
      const id = b === 'nav' ? `nav.i${i}` : `${b}.i${i}`;
      ideas[b].push(id);
      conceptos.push(k(id, `Idea ${id}`, b === 'nav' ? {} : { padre: b }));
      for (let j = 1; j <= 3; j++) { const q = { id: `${id}#${j}`, ut: UT[b] ?? 1, enunciado: `E ${id} ${j}`, opciones: { a: '1', b: '2' }, correcta: 'a' }; todas.push(q); etiquetas[q.id] = [id]; }
      if (reservadas) { const q = { id: `R-${id}`, ut: UT[b] ?? 1, enunciado: `R ${id}`, opciones: { a: '1', b: '2' }, correcta: 'a' }; todas.push(q); etiquetas[q.id] = [id]; reservada.add(q.id); }
    }
  }
  const estudio = todas.filter((q) => !reservada.has(q.id));
  const banco = { todas, estudio, porId: new Map(todas.map((q) => [q.id, q])) };
  const ic = crearIndiceConceptos({ catalogo: indexarCatalogo([{ grupo: 'prueba', conceptos }]), etiquetas, banco });
  return { ic, ideas, banco };
}
/** Respuestas que dejan una idea dominada (3 bien), floja (la última mal), en progreso (1 bien) o rescatada (primer intento mal, luego bien). */
const dominada = (id, t = T) => ({ [`${id}#1`]: { ok: true, t, n: 1, ok1: true }, [`${id}#2`]: { ok: true, t, n: 1, ok1: true }, [`${id}#3`]: { ok: true, t, n: 1, ok1: true } });
const floja = (id, t = T) => ({ [`${id}#1`]: { ok: false, t, n: 1, ok1: false } });
const enProgreso = (id, t = T) => ({ [`${id}#1`]: { ok: true, t, n: 1, ok1: true } });
const juntar = (...xs) => Object.assign({}, ...xs);
const SPEC6 = { nomen: 5, amarre: 5, seguridad: 5, baliza: 5, meteo: 5, nav: 5 };

// ---------------------------------------------------------------------------------------------------------------

test('sin conceptos (banco sin etiquetas) no hay travesía', () => {
  assert.equal(estadoTravesia({ ic: null, respuestas: {}, ahora: AHORA }), null);
  assert.deepEqual(ideasDelBanco(null), []);
  const { ic } = juguete({});
  assert.equal(estadoTravesia({ ic, respuestas: {}, ahora: AHORA }), null);
});

test('un alumno nuevo: Grumete, ningún faro encendido ni empezado', () => {
  const { ic } = juguete(SPEC6);
  const est = estadoTravesia({ ic, respuestas: {}, ahora: AHORA });
  assert.equal(est.total, 30);
  assert.equal(est.dominadas, 0);
  assert.equal(est.rangoAhora, 'grumete');
  assert.ok(est.faros.every((f) => f.estado === 'off' && f.pct === 0));
  assert.deepEqual(est.ganadas, []);
  assert.equal(progresoRango(est).actual.nombre, 'Grumete');
});

test('el faro se enciende con el 80 % de las ideas del tema dominadas, no antes', () => {
  assert.equal(FARO_ENCENDIDO, 0.8);
  const { ic, ideas } = juguete(SPEC6);
  const dom = (ids) => juntar(...ids.map((i) => dominada(i)));
  let est = estadoTravesia({ ic, respuestas: dom(ideas.seguridad.slice(0, 3)), ahora: AHORA }); // 3 de 5 = 60 %
  assert.equal(est.faros.find((f) => f.id === 't3').estado, 'parcial');
  assert.equal(est.faros.find((f) => f.id === 't3').faltan, 1);
  est = estadoTravesia({ ic, respuestas: dom(ideas.seguridad.slice(0, 4)), ahora: AHORA }); // 4 de 5 = 80 %
  const f = est.faros.find((x) => x.id === 't3');
  assert.equal(f.estado, 'on');
  assert.equal(f.faltan, 0);
  assert.equal(f.completo, false);
  assert.equal(est.faros.filter((x) => x.estado === 'on').length, 1);
});

test('«dominada» es la del motor de conceptos: 3 respuestas bien; una idea con el último intento mal está floja', () => {
  const { ic, ideas } = juguete({ nomen: 4 });
  const [a, b, c, d] = ideas.nomen;
  const est = estadoTravesia({ ic, respuestas: juntar(dominada(a), floja(b), enProgreso(c)), ahora: AHORA });
  const por = Object.fromEntries(est.ideas.map((i) => [i.id, i.estado]));
  assert.deepEqual(por, { [a]: 'dominado', [b]: 'flojo', [c]: 'en-progreso', [d]: 'sin-datos' });
  assert.deepEqual(est.faros[0].flojas.map((i) => i.id), [b], 'las flojas, para «ideas por reforzar»');
  assert.equal(est.faros[0].estado, 'parcial');
});

test('una idea con menos preguntas que las del criterio de dominio (3) se domina con todas bien; si no, no', () => {
  // Sin esta regla, un faro con muchas ideas de 1 o 2 preguntas no podría encenderse nunca.
  const mk = (n) => {
    const conceptos = [k('g', 'Grupo', { tipo: 'grupo' }), k('g.corta', 'Idea corta', { padre: 'g' })];
    const todas = Array.from({ length: n }, (_, j) => ({ id: `c${j}`, ut: 1, enunciado: `E${j}`, opciones: { a: '1', b: '2' }, correcta: 'a' }));
    const banco = { todas, estudio: todas, porId: new Map(todas.map((q) => [q.id, q])) };
    return crearIndiceConceptos({ catalogo: indexarCatalogo([{ grupo: 'p', conceptos }]), etiquetas: Object.fromEntries(todas.map((q) => [q.id, ['g.corta']])), banco });
  };
  const ok = (id) => ({ ok: true, t: T, n: 1, ok1: true });
  const estado = (ic, resp) => estadoTravesia({ ic, respuestas: resp, ahora: AHORA }).ideas[0].estado;
  const uno = mk(1);
  assert.equal(estado(uno, {}), 'sin-datos');
  assert.equal(estado(uno, { c0: ok() }), 'dominado');
  assert.equal(estado(uno, { c0: { ok: false, t: T, n: 1, ok1: false } }), 'flojo');
  const dos = mk(2);
  assert.equal(estado(dos, { c0: ok() }), 'en-progreso', 'falta una por responder');
  assert.equal(estado(dos, { c0: ok(), c1: ok() }), 'dominado');
  assert.equal(estado(dos, { c0: ok(), c1: { ok: false, t: T, n: 1, ok1: false } }), 'flojo');
  const tres = mk(3);
  assert.equal(estado(tres, { c0: ok(), c1: ok() }), 'en-progreso', 'con 3 preguntas rige el criterio de siempre');
  assert.equal(estado(tres, { c0: ok(), c1: ok(), c2: ok() }), 'dominado');
});

test('cuarentena: las respuestas a preguntas reservadas no cuentan y nada las nombra', () => {
  const { ic, ideas } = juguete({ nomen: 5 }, { reservadas: true });
  const [a, b] = ideas.nomen;
  // Responder solo a las reservadas no dominaría nada ni encendería nada...
  const soloReservadas = Object.fromEntries(ideas.nomen.flatMap((i) => [1, 2, 3].map((n) => [`R-${i}`, { ok: true, t: T, n, ok1: true }])));
  let est = estadoTravesia({ ic, respuestas: soloReservadas, ahora: AHORA });
  assert.equal(est.dominadas, 0);
  assert.equal(est.faros[0].vistas, 0);
  // ...y una reservada fallada no vuelve floja una idea dominada con el estudio.
  est = estadoTravesia({ ic, respuestas: juntar(dominada(a), { [`R-${a}`]: { ok: false, t: T, n: 1, ok1: false } }, floja(b)), ahora: AHORA });
  assert.equal(est.ideas.find((i) => i.id === a).estado, 'dominado');
  assert.equal(est.total, 5, 'las ideas son las del estudio');
  assert.ok(!JSON.stringify(est).includes('R-'), 'el estado no lleva ids de preguntas reservadas');
  assert.ok(!JSON.stringify(est).includes('#'), 'ni ids de preguntas de estudio');
});

test('rango: porcentaje de las ideas del banco, con un simulacro aprobado para Contramaestre y uno inédito para Patrón', () => {
  assert.deepEqual(RANGOS.map((r) => [r.nombre, r.desde, r.exige]), [['Grumete', 0, null], ['Marinero', 0.2, null], ['Timonel', 0.45, null], ['Contramaestre', 0.7, 'simulacro'], ['Patrón', 0.9, 'inedito']]);
  const sin = {};
  const sim = { simulacro: true };
  const ined = { simulacro: true, inedito: true };
  assert.equal(rangoPara(0, sin), 'grumete');
  assert.equal(rangoPara(0.19, sin), 'grumete');
  assert.equal(rangoPara(0.2, sin), 'marinero');
  assert.equal(rangoPara(0.44, sin), 'marinero');
  assert.equal(rangoPara(0.45, sin), 'timonel');
  assert.equal(rangoPara(0.7, sin), 'timonel', 'sin simulacro aprobado no hay Contramaestre');
  assert.equal(rangoPara(0.7, sim), 'contramaestre');
  assert.equal(rangoPara(0.95, sim), 'contramaestre', 'sin examen inédito no hay Patrón');
  assert.equal(rangoPara(0.9, ined), 'patron');
  assert.equal(rangoPara(0.3, ined), 'marinero', 'los exámenes solos no dan rango: hacen falta las ideas');
});

test('el rango escala con el tamaño del banco (no son cifras fijas)', () => {
  const contramaestre = RANGOS[3];
  assert.equal(ideasParaRango(contramaestre, 100), 70);
  assert.equal(ideasParaRango(contramaestre, 40), 28);
  assert.equal(ideasParaRango(contramaestre, 283), 199);
  // 20 de 100 ideas: Marinero; 20 de 40: Timonel
  const a = juguete({ nomen: 100 });
  const b = juguete({ nomen: 40 });
  const dom = (j, n) => juntar(...j.ideas.nomen.slice(0, n).map((i) => dominada(i)));
  assert.equal(estadoTravesia({ ic: a.ic, respuestas: dom(a, 20), ahora: AHORA }).rangoAhora, 'marinero');
  assert.equal(estadoTravesia({ ic: b.ic, respuestas: dom(b, 20), ahora: AHORA }).rangoAhora, 'timonel');
});

test('progresoRango dice qué falta para el siguiente rango (ideas y/o examen) y el último llega a puerto', () => {
  const { ic, ideas } = juguete({ nomen: 20 });
  const dom = (n) => juntar(...ideas.nomen.slice(0, n).map((i) => dominada(i)));
  let est = estadoTravesia({ ic, respuestas: dom(9), ahora: AHORA }); // 45 %
  let p = progresoRango(est);
  assert.equal(p.actual.id, 'timonel');
  assert.equal(p.siguiente.id, 'contramaestre');
  assert.equal(p.falta, 5);
  assert.equal(p.exige, 'simulacro');
  assert.match(p.texto, /Te faltan 5 ideas dominadas y aprobar un simulacro para Contramaestre/);
  est = estadoTravesia({ ic, respuestas: dom(15), ahora: AHORA }); // 75 %, sin simulacro: sigue en Timonel
  p = progresoRango(est);
  assert.equal(p.actual.id, 'timonel');
  assert.equal(p.falta, 0);
  assert.match(p.texto, /Te falta aprobar un simulacro para Contramaestre/);
  est = estadoTravesia({ ic, respuestas: dom(19), tests: [{ tit: 'per', eje: 'x', apto: true, total: 30, nuevas: 30, tipo: 'simulacro' }], ahora: AHORA });
  p = progresoRango(est);
  assert.equal(p.actual.id, 'patron');
  assert.equal(p.siguiente, null);
  assert.equal(p.texto, 'Has llegado a puerto.');
  assert.equal(requisitoRango(RANGOS[0]), 'Desde la primera clase');
  assert.equal(requisitoRango(RANGOS[3]), '70 % de las ideas dominadas y un simulacro aprobado');
});

test('el rango nunca baja: se guarda el máximo alcanzado', () => {
  const { ic, ideas } = juguete({ nomen: 20 });
  const alto = estadoTravesia({ ic, respuestas: juntar(...ideas.nomen.slice(0, 10).map((i) => dominada(i))), ahora: AHORA }); // 50 %: Timonel
  const f1 = fusionar(null, alto, { ahora: AHORA });
  assert.equal(f1.reg.rango, 'timonel');
  // Pasan las semanas, olvida: ahora solo domina el 25 % (Marinero)...
  const bajo = estadoTravesia({ ic, respuestas: juntar(...ideas.nomen.slice(0, 5).map((i) => dominada(i))), ahora: AHORA });
  assert.equal(bajo.rangoAhora, 'marinero');
  const f2 = fusionar(f1.reg, bajo, { ahora: AHORA });
  assert.equal(f2.reg.rango, 'timonel', 'el rango guardado no baja');
  assert.equal(f2.subeRango, false);
  assert.equal(progresoRango(bajo, f2.reg.rango).actual.id, 'timonel');
  // ...y si sube, sube.
  const f3 = fusionar({ rango: 'marinero', insignias: {} }, alto, { ahora: AHORA });
  assert.equal(f3.reg.rango, 'timonel');
  assert.equal(f3.subeRango, true);
});

test('exámenes: simulacro aprobado e inédito aprobado (mismo criterio de «¿Estás listo?»)', () => {
  assert.deepEqual(resumenExamenes([]), { simulacro: false, inedito: false });
  assert.deepEqual(resumenExamenes([{ apto: false, total: 30, nuevas: 30 }]), { simulacro: false, inedito: false });
  assert.deepEqual(resumenExamenes([{ apto: true, total: 30, nuevas: 3, tipo: 'simulacro' }]), { simulacro: true, inedito: false });
  assert.deepEqual(resumenExamenes([{ apto: true, total: 30, nuevas: 20, tipo: 'simulacro' }]), { simulacro: true, inedito: true }, '20 de 30 nuevas: inédito');
  assert.deepEqual(resumenExamenes([{ apto: true, total: 30, tipo: 'final' }]), { simulacro: true, inedito: true }, 'el examen final es inédito');
  const tests = [{ tit: 'per', eje: 'a', apto: true }, { tit: 'py', eje: 'a', apto: true }, { tit: 'per', eje: 'b', apto: true }];
  assert.equal(examenesDe(tests, 'a', 'per').length, 1, 'cada banco, los suyos');
});

// --- la semana -----------------------------------------------------------------------------------------------------

const dia = (n = 1) => ({ min: 10, act: n });

test('semana: un día de descanso (el primer día sin estudiar tras empezar) no rompe nada', () => {
  // Jueves 8. Lunes 5 y miércoles 7 con estudio; el martes es descanso; hoy aún sin estudiar.
  const dias = { '2026-10-05': dia(), '2026-10-07': dia() };
  const s = semanaDe(dias, AHORA);
  assert.equal(s.desde, '2026-10-05');
  assert.deepEqual(s.dias.map((x) => x.estado), ['estudio', 'descanso', 'estudio', 'hoy', 'futuro', 'futuro', 'futuro']);
  assert.deepEqual(s.dias.map((x) => x.letra), ['L', 'M', 'X', 'J', 'V', 'S', 'D']);
  assert.equal(s.estudiados, 2);
  assert.equal(s.descanso, true);
  assert.equal(s.texto, '2 días · 1 de descanso');
});

test('semana: solo un descanso por semana; los demás días sin estudiar y los anteriores al primero son «libres»', () => {
  const dias = { '2026-10-06': dia(), '2026-10-08': dia() }; // martes y hoy; lunes antes de empezar
  const s = semanaDe(dias, AHORA);
  assert.deepEqual(s.dias.map((x) => x.estado), ['libre', 'estudio', 'descanso', 'estudio', 'futuro', 'futuro', 'futuro']);
  const dos = semanaDe({ '2026-10-05': dia() }, new Date(2026, 9, 9, 10).getTime()); // viernes: martes descanso, miércoles y jueves libres
  assert.deepEqual(dos.dias.map((x) => x.estado), ['estudio', 'descanso', 'libre', 'libre', 'hoy', 'futuro', 'futuro']);
  assert.equal(dos.dias.filter((x) => x.estado === 'descanso').length, 1);
  assert.equal(semanaDe({}, AHORA).texto, 'Aún sin estudiar esta semana');
  assert.equal(semanaDe({}, AHORA).descanso, false);
});

test('semana: el domingo cierra la semana y el lunes abre otra; hoy con estudio cuenta', () => {
  const domingo = new Date(2026, 9, 11, 22).getTime();
  assert.equal(semanaDe({}, domingo).desde, '2026-10-05');
  const lunes = new Date(2026, 9, 12, 8).getTime();
  const s = semanaDe({ '2026-10-11': dia() }, lunes);
  assert.equal(s.desde, '2026-10-12');
  assert.equal(s.estudiados, 0, 'el domingo es de la semana anterior');
  assert.equal(semanaDe({ '2026-10-08': dia(2) }, AHORA).dias[3].estado, 'estudio');
  assert.equal(semanaDe({ '2026-10-08': { min: 0, act: 0 } }, AHORA).dias[3].estado, 'hoy', 'sin actividad no cuenta');
});

test('«Una semana de travesía»: al menos 4 días de estudio de una misma semana (lunes a domingo), seguidos o no', () => {
  assert.equal(DIAS_SEMANA, 4);
  const d4 = { '2026-10-05': dia(), '2026-10-06': dia(), '2026-10-08': dia(), '2026-10-11': dia() };
  assert.equal(hayUnaSemana(d4), true, 'con descansos de por medio vale');
  assert.equal(hayUnaSemana({ '2026-10-05': dia(), '2026-10-06': dia(), '2026-10-07': dia() }), false, '3 días no bastan');
  // 2 días de una semana y 2 de la siguiente (domingo y lunes): no son 4 de una misma semana
  assert.equal(hayUnaSemana({ '2026-10-04': dia(), '2026-10-03': dia(), '2026-10-05': dia(), '2026-10-06': dia() }), false);
  assert.equal(hayUnaSemana({ '2026-10-05': dia(0), '2026-10-06': dia(0), '2026-10-07': dia(0), '2026-10-08': dia(0) }), false, 'sin actividad no cuenta');
  assert.equal(hayUnaSemana({}), false);
});

// --- insignias -----------------------------------------------------------------------------------------------------

test('insignias que dan los datos: tema completo (todas las ideas), rescate, semana y exámenes', () => {
  const { ic, ideas } = juguete({ nomen: 3, baliza: 2 });
  const dias = { '2026-10-05': dia(), '2026-10-06': dia(), '2026-10-07': dia(), '2026-10-08': dia() };
  // Un faro con todas sus ideas dominadas = Tema completo; el otro, no
  let est = estadoTravesia({ ic, respuestas: juntar(...ideas.nomen.map((i) => dominada(i)), enProgreso(ideas.baliza[0])), dias, ahora: AHORA });
  assert.deepEqual(est.ganadas, ['semana', 'tema:1']);
  // Dominada a la tercera: la primera vez la falló (ok1 false) = idea rescatada
  const rescatada = { ...dominada(ideas.baliza[0]), [`${ideas.baliza[0]}#1`]: { ok: true, t: T, n: 2, ok1: false } };
  est = estadoTravesia({ ic, respuestas: rescatada, ahora: AHORA });
  assert.deepEqual(est.ganadas, ['rescate']);
  est = estadoTravesia({ ic, respuestas: {}, tests: [{ apto: true, total: 30, nuevas: 25, tipo: 'simulacro' }], ahora: AHORA });
  assert.deepEqual(est.ganadas, ['simulacro', 'inedito']);
  est = estadoTravesia({ ic, respuestas: {}, tests: [{ apto: false, total: 30 }], ahora: AHORA });
  assert.deepEqual(est.ganadas, []);
});

test('las insignias, una vez ganadas, se quedan con su fecha; la «Guardia» no sale de ningún dato', () => {
  const est = { ganadas: ['semana'], rangoAhora: 'grumete' };
  const a = fusionar({ rango: null, insignias: { guardia: '2026-09-01T10:00:00.000Z' } }, est, { ahora: AHORA });
  assert.deepEqual(a.nuevas, ['semana']);
  assert.equal(a.reg.insignias.semana, new Date(AHORA).toISOString());
  assert.equal(a.reg.insignias.guardia, '2026-09-01T10:00:00.000Z');
  const b = fusionar(a.reg, { ganadas: [], rangoAhora: 'grumete' }, { ahora: AHORA + 1e9 });
  assert.deepEqual(b.nuevas, []);
  assert.equal(b.reg.insignias.semana, a.reg.insignias.semana, 'no se pierde ni se renueva');
  assert.equal(insigniasGanadas({ faros: [], dias: {}, examenes: {}, rescate: false }).length, 0);
});

test('catálogo de insignias: las fijas, «Tema completo» (una por faro) y las de examen, y lo que falta de cada una', () => {
  const { ic } = juguete(SPEC6);
  const est = estadoTravesia({ ic, respuestas: {}, ahora: AHORA });
  const cat = catalogoInsignias(est.faros);
  assert.deepEqual(cat.map((x) => x.id), ['guardia', 'semana', 'rescate', ...est.faros.map((f) => `tema:${f.ut}`), 'simulacro', 'inedito']);
  assert.deepEqual(cat.filter((x) => !x.id.startsWith('tema:')).map((x) => x.nombre), ['Guardia de 5 minutos', 'Una semana de travesía', 'Idea rescatada', 'Primer simulacro aprobado', 'Examen inédito aprobado']);
  assert.ok(cat.filter((x) => x.id.startsWith('tema:')).every((x) => x.nombre.startsWith('Tema completo')));
  est.semana = semanaDe({ '2026-10-05': dia() }, AHORA);
  assert.equal(faltaInsignia(cat.find((x) => x.id === 'semana'), est), 'Esta semana llevas 1 de 4 días.');
  assert.equal(faltaInsignia(cat.find((x) => x.id === 'tema:1'), est), 'Vas por 0 de 5 ideas.');
  assert.ok(cat.every((x) => x.nombre && x.texto && x.icono));
  // Con la estructura de la titulación, la insignia lleva el nombre corto del tema.
  const per = estadoTravesia({ ic, estructura: TITULACIONES.per.estructura, respuestas: {}, ahora: AHORA });
  assert.equal(catalogoInsignias(per.faros).find((x) => x.id === 'tema:5').nombre, 'Tema completo: Balizamiento');
});

test('migración de las insignias: las «Bloque completo» de los faros antiguos se conservan y conviven con las de tema', () => {
  const { ic, ideas } = juguete({ nomen: 3, baliza: 2 });
  // Alguien que ganó dos insignias con los faros por bloque (y la «Guardia») antes del cambio.
  const guardado = { rango: 'marinero', insignias: { guardia: '2026-09-01T10:00:00.000Z', 'bloque:nomenclatura': '2026-09-10T10:00:00.000Z', 'bloque:balizamiento': '2026-09-12T10:00:00.000Z' } };
  // Hoy tiene dominado el tema 1 entero: gana la nueva «Tema completo» de ese tema; el tema 5 aún no (una idea).
  const est = estadoTravesia({ ic, respuestas: juntar(...ideas.nomen.map((i) => dominada(i)), dominada(ideas.baliza[0])), ahora: AHORA });
  const { reg, nuevas } = fusionar(guardado, est, { ahora: AHORA });
  assert.deepEqual(nuevas, ['tema:1']);
  assert.equal(reg.insignias['bloque:nomenclatura'], '2026-09-10T10:00:00.000Z', 'la antigua no se borra ni cambia de fecha');
  assert.equal(reg.insignias['bloque:balizamiento'], '2026-09-12T10:00:00.000Z', 'aunque su tema nuevo no esté completo');
  assert.equal(reg.insignias.guardia, '2026-09-01T10:00:00.000Z');
  // El catálogo las enseña detrás de las de tema, en el orden de los faros antiguos, y son de las conseguidas.
  const cat = catalogoInsignias(est.faros, reg.insignias);
  assert.deepEqual(cat.map((x) => x.id), ['guardia', 'semana', 'rescate', 'tema:1', 'tema:5', 'bloque:nomenclatura', 'bloque:balizamiento', 'simulacro', 'inedito']);
  const vieja = cat.find((x) => x.id === 'bloque:balizamiento');
  assert.equal(vieja.nombre, 'Bloque completo: Balizamiento');
  assert.equal(vieja.antigua, true);
  assert.ok(vieja.texto && vieja.icono);
  assert.ok(cat.every((x) => !x.antigua || reg.insignias[x.id]), 'solo salen las antiguas que se tienen');
  // Quien no tenía ninguna no ve ninguna antigua (ya no se pueden ganar), ni una con un id que no sea de un faro antiguo.
  assert.ok(!catalogoInsignias(est.faros, { guardia: 'x', 'bloque:inventado': 'x' }).some((x) => x.id.startsWith('bloque:')));
  assert.ok(!catalogoInsignias(est.faros).some((x) => x.antigua));
  assert.deepEqual(FAROS_ANTIGUOS.map((f) => f.id), ['nomenclatura', 'maniobra', 'seguridad', 'balizamiento', 'meteorologia', 'navegacion', 'otras']);
  // Entre aparatos (docs/SYNC.md): las insignias son una unión; uno aún con las antiguas y otro ya con las de tema.
  const t0 = Date.UTC(2026, 9, 1);
  const ops = [
    { i: 'aparato1.1.aaaa', k: 'g', t: t0, b: 'andalucia/per', r: 'marinero', s: { 'bloque:nomenclatura': '2026-09-10T10:00:00.000Z' } },
    { i: 'aparato2.1.bbbb', k: 'g', t: t0 + 1000, b: 'andalucia/per', r: 'grumete', s: { 'tema:1': '2026-10-08T08:00:00.000Z', 'bloque:nomenclatura': '2026-09-11T10:00:00.000Z' } },
  ];
  for (const op of ops) assert.equal(validarOperacion(op, t0 + 5000), null, 'los ids `tema:<n>` y `bloque:<faro>` son claves válidas de una operación');
  for (const orden of [ops, [...ops].reverse()]) {
    assert.deepEqual(plegar(orden).travesia.bancos['andalucia/per'], { rango: 'marinero', insignias: { 'bloque:nomenclatura': '2026-09-10T10:00:00.000Z', 'tema:1': '2026-10-08T08:00:00.000Z' } });
  }
});

// --- el parte de la sesión -----------------------------------------------------------------------------------------

test('parte de la sesión: ideas nuevas, rescatadas, siguen flojas, faro que se enciende, insignia nueva y rango', () => {
  const { ic, ideas } = juguete({ seguridad: 5, nomen: 5 });
  const [s1, s2, s3, s4, s5] = ideas.seguridad;
  const [n1, n2] = ideas.nomen;
  // Antes de la sesión: seguridad 3 dominadas (60 %), una floja (s4) y una sin ver (s5); nomen sin ver.
  const antes = juntar(dominada(s1), dominada(s2), dominada(s3), floja(s4));
  const est0 = estadoTravesia({ ic, respuestas: antes, ahora: AHORA });
  const f0 = fusionar(null, est0, { ahora: AHORA });
  const foto = fotoTravesia(est0, f0.reg);
  assert.deepEqual(foto.ideas, { [s1]: 'd', [s2]: 'd', [s3]: 'd', [s4]: 'f' });
  assert.equal(foto.rango, 'marinero');
  const sesion = nuevaSesion('per', { fase: 'aprender', pasos: [{ id: 'p', tipo: 'fallos', titulo: 'Tus fallos', sub: 's', minutos: 5, ruta: ['teoria', 'repaso'] }] }, { ahora: AHORA, foto });
  assert.deepEqual(sesion.foto, foto, 'la foto viaja con la sesión');
  assert.ok(sesionDeHoy(sesion, AHORA).foto);
  assert.equal(nuevaSesion('per', { fase: 'aprender', pasos: [{ ruta: ['x'] }] }, { ahora: AHORA }).foto, undefined, 'sin foto, nada');

  // Durante la sesión: rescata s4 (dominada), domina s5 (sube seguridad al 100 %: faro encendido, pasó del 60 %), empieza n1 (en progreso) y falla n2.
  const despues = juntar(antes, dominada(s4, '2026-10-08T11:00:00.000Z'), dominada(s5, '2026-10-08T11:00:00.000Z'), enProgreso(n1, '2026-10-08T11:00:00.000Z'), floja(n2, '2026-10-08T11:00:00.000Z'));
  // ojo: s4 tenía una pregunta fallada; la sustituyen tres aciertos
  const est1 = estadoTravesia({ ic, respuestas: despues, tests: [], dias: {}, ahora: AHORA });
  const parte = parteSesion({ foto, est: est1, guardado: f0.reg, tocadas: new Set([s4, s5, n1, n2]), ahora: AHORA });
  assert.deepEqual(parte.nuevas.map((i) => i.id).sort(), [n1, n2, s5].sort());
  assert.deepEqual(parte.rescatadas.map((i) => i.id), [s4]);
  assert.deepEqual(parte.flojas.map((i) => i.id), [n2], 'trabajada hoy y sigue floja');
  assert.deepEqual(parte.faros.map((f) => f.id), ['t3']);
  assert.equal(Math.round(parte.faros[0].antes * 100), 60);
  assert.equal(Math.round(parte.faros[0].ahora * 100), 100);
  assert.deepEqual([...parte.insignias].sort(), ['rescate', 'tema:3'], 'rescatar una idea y completar el tema son las insignias nuevas');
  assert.equal(parte.reg.insignias.rescate != null, true);
  assert.equal(parte.vacio, false);
  assert.equal(parte.rango.antes, 'marinero', '3 de 10 ideas = 30 %');
  assert.equal(parte.rango.ahora, 'timonel', '5 de 10 ideas = 50 %');
  assert.equal(parte.rango.sube, true);
  // Reabrir el parte más tarde da lo mismo (la foto sigue siendo la del principio y el almacén ya tiene la insignia)
  const otra = parteSesion({ foto, est: est1, guardado: parte.reg, tocadas: new Set([s4, s5, n1, n2]), ahora: AHORA + 36e5 });
  assert.deepEqual([...otra.insignias].sort(), ['rescate', 'tema:3']);
  assert.deepEqual(otra.rescatadas.map((i) => i.id), [s4]);
});

test('parte: un faro que ya estaba encendido no se vuelve a encender; sin cambios, parte vacío; sin foto, ninguno', () => {
  const { ic, ideas } = juguete({ nomen: 5 });
  const antes = juntar(...ideas.nomen.map((i) => dominada(i)));
  const est = estadoTravesia({ ic, respuestas: antes, ahora: AHORA });
  const { reg } = fusionar(null, est, { ahora: AHORA });
  const foto = fotoTravesia(est, reg);
  const parte = parteSesion({ foto, est, guardado: reg, tocadas: new Set(), ahora: AHORA });
  assert.deepEqual(parte.faros, []);
  assert.equal(parte.vacio, true);
  assert.deepEqual(parte.insignias, []);
  assert.equal(parteSesion({ foto: null, est, ahora: AHORA }), null, 'una sesión de antes de la travesía no tiene parte');
});

test('«para mañana»: la idea floja de hoy que antes vuelve al repaso', () => {
  const a = { id: 'a', etiqueta: 'A' };
  const b = { id: 'b', etiqueta: 'B' };
  const c = { id: 'c', etiqueta: 'C' };
  assert.deepEqual(paraManana({ flojas: [a, b], trabajadas: [c], vuelve: new Map([['a', 3], ['b', 1], ['c', 1]]) }), { id: 'b', etiqueta: 'B', dias: 1 });
  assert.deepEqual(paraManana({ flojas: [], trabajadas: [a, c], vuelve: new Map([['a', 4], ['c', 2]]) }), { id: 'c', etiqueta: 'C', dias: 2 }, 'sin flojas, de las trabajadas');
  assert.equal(paraManana({ flojas: [a], trabajadas: [a], vuelve: new Map() }), null);
});

// --- la carta ------------------------------------------------------------------------------------------------------

test('posiciones de los faros: con seis, los puntos de la carta; con otro número, a lo largo de la derrota', () => {
  assert.deepEqual(posicionesDerrota(6), PUNTOS_DERROTA);
  const tres = posicionesDerrota(3);
  assert.equal(tres.length, 3);
  assert.deepEqual(tres[0], PUNTOS_DERROTA[0]);
  assert.deepEqual(tres[2], PUNTOS_DERROTA[5]);
  assert.equal(posicionesDerrota(1).length, 1);
  assert.deepEqual(posicionesDerrota(0), []);
  assert.equal(posicionesDerrota(8).length, 8);
});

// Las piezas HTML de la carta a 360 px de pantalla (la carta mide 324 px de ancho; medidas de styles/app.css): el disco de
// cada faro (y el de la bandera) con el hueco del marcador «estás aquí» encima, y el nombre debajo (o al lado, ladoNombre).
function cajasCarta(n, compacta) {
  const t = trazadoDerrota(n, { compacta });
  const px = 324 / t.ancho;
  const altoPx = 324 * (t.densa ? t.alto : compacta ? 232 : 320) / t.ancho;
  const disco = compacta ? 36 : 48;
  const marca = compacta ? 27 : 30;
  const nombre = { ancho: 90, alto: 15 };      // «Nomenclatura», «Balizamiento», «Meteorología»: una línea de 12,6 px
  const cajas = [...t.pos, t.bandera].flatMap(([x0, y0], i) => {
    const x = Math.min(Math.max(x0 * px, 52), 324 - 52);                 // el clamp de la posición
    const y = y0 / t.altoCapas * altoPx;
    const d = i === n ? (compacta ? 34 : 44) : disco;
    const ancho = i === n ? 56 : nombre.ancho;
    const lado = i === n ? '' : ladoNombre(t.pos, i, t.bandera, { densa: t.densa });
    const sep = compacta ? 22 : 28;
    const caja = lado === 'nombre-izq' ? { x0: x - sep - ancho, x1: x - sep, y0: y - 8, y1: y + 8 }
      : lado === 'nombre-der' ? { x0: x + sep, x1: x + sep + ancho, y0: y - 8, y1: y + 8 }
        : { x0: x - ancho / 2, x1: x + ancho / 2, y0: y + disco / 2 + 2, y1: y + disco / 2 + 2 + nombre.alto };
    return [{ i, que: 'disco', x0: x - d / 2, x1: x + d / 2, y0: y - disco / 2, y1: y - disco / 2 + d, marca: y - disco / 2 - marca }, { i, que: 'nombre', ...caja }];
  });
  return { t, cajas, altoPx };
}
const pisa = (a, b) => !(a.x1 <= b.x0 || b.x1 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0);

test('trazado de la carta: hasta seis faros, la de siempre; con más (la PER, once), la densa', () => {
  const py = trazadoDerrota(4);
  assert.equal(py.densa, false);
  assert.deepEqual(py.pos, posicionesDerrota(4));
  assert.deepEqual(py.bandera, BANDERA);
  assert.deepEqual([py.alto, py.altoCapas], [320, 320]);
  assert.deepEqual([trazadoDerrota(4, { compacta: true }).alto, trazadoDerrota(4, { compacta: true }).altoCapas], [232, 360]);
  assert.equal(trazadoDerrota(6).densa, false);
  assert.deepEqual(trazadoDerrota(6).pos, PUNTOS_DERROTA);
  for (const compacta of [false, true]) {
    for (let n = 7; n <= 12; n++) {
      const t = trazadoDerrota(n, { compacta });
      assert.equal(t.densa, true);
      assert.equal(t.pos.length, n);
      assert.equal(t.altoCapas, t.alto, 'las coordenadas de la carta densa son ya las del SVG');
      assert.equal(new Set([...t.pos, t.bandera].map((p) => p.join())).size, n + 1, 'cada faro y la bandera, en su hueco');
      // La derrota sube: empieza abajo a la izquierda y la bandera queda por encima.
      assert.ok(t.pos[0][0] < 100 && t.pos[0][1] > t.alto / 2);
      assert.ok(t.bandera[1] < t.pos[0][1]);
    }
  }
  assert.ok(trazadoDerrota(11, { compacta: true }).alto < trazadoDerrota(11).alto, 'la de Hoy, más baja');
});

test('carta a 360 px: con los faros del PY (4) y de la PER (11) nada se pisa ni se sale, ni en la Travesía ni en Hoy', () => {
  for (const n of [TITULACIONES.py.estructura.bloques.length, TITULACIONES.per.estructura.bloques.length, 7, 8, 9, 10, 12]) {
    for (const compacta of [false, true]) {
      const { cajas, altoPx } = cajasCarta(n, compacta);
      const donde = `${n} faros${compacta ? ' (Hoy)' : ''}`;
      for (const a of cajas) {
        assert.ok(a.x0 >= 0 && a.x1 <= 324 && a.y0 >= 4 && a.y1 <= altoPx - 4, `${donde}: ${a.que} ${a.i + 1} dentro de la carta`);
        if (a.que === 'disco' && a.i < n) assert.ok(a.marca >= 4, `${donde}: el marcador «estás aquí» cabe sobre el faro ${a.i + 1}`);
        for (const b of cajas) {
          if (a.i >= b.i) continue;
          assert.ok(!pisa(a, b), `${donde}: ${a.que} ${a.i + 1} pisa ${b.que} ${b.i + 1}`);
          // El marcador de un faro tampoco tapa el nombre ni el disco de otro.
          for (const [m, o] of [[a, b], [b, a]]) if (m.que === 'disco' && m.i < n) assert.ok(!pisa({ x0: (m.x0 + m.x1) / 2 - 15, x1: (m.x0 + m.x1) / 2 + 15, y0: m.marca, y1: m.y0 }, o), `${donde}: el marcador del faro ${m.i + 1} pisa ${o.que} ${o.i + 1}`);
        }
      }
    }
  }
});

test('faro inicial: el más cercano a encenderse; si no hay ninguno empezado, el primero', () => {
  const f = (id, estado, pct, vistas) => ({ id, estado, pct, vistas });
  assert.equal(faroInicial([f('a', 'off', 0, 0), f('b', 'off', 0, 0)]), 'a');
  assert.equal(faroInicial([f('a', 'on', 1, 5), f('b', 'parcial', 0.3, 2), f('c', 'parcial', 0.6, 4)]), 'c');
  assert.equal(faroInicial([f('a', 'on', 1, 5), f('b', 'off', 0, 0)]), 'b');
  assert.equal(faroInicial([f('a', 'on', 1, 5)]), 'a');
});

// --- el almacén ----------------------------------------------------------------------------------------------------

const KEY = 'nautica.progress.v1';
function memoria(inicial = {}) {
  const m = new Map(Object.entries(inicial));
  return { getItem: (k2) => m.get(k2) ?? null, setItem: (k2, v) => m.set(k2, String(v)), removeItem: (k2) => m.delete(k2), m };
}

test('almacén: sin travesía, un rango vacío; guardar es por eje y titulación y sobrevive a recargar y a exportar', () => {
  const mem = memoria();
  const p = createProgressStore(mem);
  assert.deepEqual(p.travesia('and', 'per'), { rango: null, insignias: {} });
  p.guardarTravesia('and', 'per', { rango: 'timonel', insignias: { semana: 'ISO' } });
  assert.equal(p.get().travesia.v, 1, 'campo versionado');
  assert.equal(p.travesia('and', 'per').rango, 'timonel');
  assert.deepEqual(p.travesia('and', 'py'), { rango: null, insignias: {} }, 'cada banco, el suyo');
  assert.deepEqual(p.travesia('dgmm', 'per'), { rango: null, insignias: {} });
  const q = createProgressStore(mem);
  assert.equal(q.travesia('and', 'per').insignias.semana, 'ISO');
  const r = createProgressStore(memoria());
  r.import(q.export());
  assert.equal(r.travesia('and', 'per').rango, 'timonel');
});

test('almacén: ganarInsignia es idempotente y no toca el rango', () => {
  const p = createProgressStore(memoria());
  assert.equal(p.ganarInsignia('and', 'per', 'guardia', '2026-10-08T10:00:00.000Z'), true);
  assert.equal(p.ganarInsignia('and', 'per', 'guardia', '2027-01-01T00:00:00.000Z'), false);
  assert.equal(p.travesia('and', 'per').insignias.guardia, '2026-10-08T10:00:00.000Z');
  p.guardarTravesia('and', 'per', { rango: 'marinero', insignias: { ...p.travesia('and', 'per').insignias } });
  p.ganarInsignia('and', 'per', 'semana');
  assert.equal(p.travesia('and', 'per').rango, 'marinero');
});

test('migración suave: un progreso de antes de la travesía carga igual (versión 1, sin campo) y uno mal formado se descarta', () => {
  const antiguo = { version: 1, exercises: {}, exams: { a: { choice: 'a', ok: true, t: '2025-01-01T00:00:00Z' } }, settings: { level: 'PER', toleranceFactor: 1 }, tests: [] };
  const p = createProgressStore(memoria({ [KEY]: JSON.stringify(antiguo) }));
  assert.equal(p.get().version, 1, 'la versión del progreso no cambia (la importación exige 1)');
  assert.equal(p.get().travesia, undefined);
  assert.equal(p.travesia('and', 'per').rango, null);
  assert.equal(p.get().exams.a.ok, true, 'lo demás, intacto');
  for (const malo of ['x', 7, [], { bancos: 'no' }, { v: 1 }]) {
    const q = createProgressStore(memoria({ [KEY]: JSON.stringify({ ...antiguo, travesia: malo }) }));
    assert.equal(q.get().travesia, undefined, `se descarta ${JSON.stringify(malo)}`);
    assert.deepEqual(q.travesia('and', 'per'), { rango: null, insignias: {} });
  }
  const sinVersion = createProgressStore(memoria({ [KEY]: JSON.stringify({ ...antiguo, travesia: { bancos: { 'and/per': { rango: 'timonel', insignias: {} } } } }) }));
  assert.equal(sinVersion.get().travesia.v, 1, 'se le pone la versión');
  assert.equal(sinVersion.travesia('and', 'per').rango, 'timonel');
});

// --- los bancos reales ---------------------------------------------------------------------------------------------

test('en todos los bancos etiquetados: un faro por tema con ideas, ninguna idea sin tema y las ideas suman', async () => {
  const cs = crearConceptos(bancosNode());
  let comprobados = 0;
  for (const e of ejes()) {
    for (const tit of titsDeEje(e.id)) {
      const ic = await cs.cargarConceptos(e.id, tit);
      const ideas = ideasDelBanco(ic);
      if (!ideas.length) continue;
      comprobados += 1;
      const E = TITULACIONES[tit].estructura;
      const est = estadoTravesia({ ic, estructura: E, respuestas: {}, ahora: AHORA });
      assert.ok(est.faros.length >= 1 && est.faros.length <= E.bloques.length, `${e.id}/${tit}: ${est.faros.length} faros`);
      assert.ok(!est.faros.some((f) => f.id === 'otras'), `${e.id}/${tit}: hay ideas sin tema del temario (${ideas.filter((i) => !E.bloques.some((b) => b.ut === i.ut)).map((i) => i.id).slice(0, 5)})`);
      // En el orden del Temario (el de estudio), con el título del tema y un nombre corto de una palabra para la carta.
      const conIdeas = bloquesEnOrden(E).filter((b) => ideas.some((i) => i.ut === b.ut));
      assert.deepEqual(est.faros.map((f) => [f.id, f.ut, f.nombre, f.corto]), conIdeas.map((b) => [idFaroTema(b.ut), b.ut, b.titulo, b.corto]));
      assert.ok(est.faros.every((f) => f.corto && f.corto.length <= 12 && !/\s/.test(f.corto)), `${e.id}/${tit}: nombres cortos`);
      assert.equal(est.faros.reduce((n, f) => n + f.total, 0), est.total);
      assert.equal(est.total, ideas.length);
      assert.ok(est.faros.every((f) => f.total > 0 && f.estado === 'off'));
      // Alguien que lo sabe todo: todos los faros encendidos y todas las insignias de tema (sin exámenes: Timonel)
      const todo = {};
      for (const i of ideas) for (const q of i.qs) todo[q] = { ok: true, t: T, n: 1, ok1: true };
      const lleno = estadoTravesia({ ic, estructura: E, respuestas: todo, ahora: AHORA });
      assert.ok(lleno.faros.every((f) => f.estado === 'on' && f.completo), `${e.id}/${tit}: todo dominado`);
      assert.equal(lleno.dominadas, lleno.total);
      assert.equal(lleno.rangoAhora, 'timonel', 'sin exámenes aprobados no pasa de Timonel');
      assert.deepEqual(lleno.ganadas, lleno.faros.map((f) => `tema:${f.ut}`));
    }
  }
  assert.ok(comprobados >= 4, 'hay bancos etiquetados que comprobar');
});

test('la travesía no menciona ids de preguntas ni nombres propios: sus textos son los del código', () => {
  const src = ['../src/course/travesia.js', '../src/ui/travesia.js', '../src/ui/views/travesia.js'].map((f) => readFileSync(new URL(f, import.meta.url), 'utf8')).join('\n');
  assert.doesNotMatch(src, /\b(?:and|dgmm|bal)-[a-z0-9]+-\d{4}/, 'ningún id de pregunta');
  assert.doesNotMatch(src, /[\u{1F300}-\u{1FAFF}]/u, 'sin emojis en la interfaz');
});

// ---------------------------------------------------------------------------------------------------------------
// Faros por tema: los de la carta de la derrota y los del Temario son los mismos (farosDeTemas), agrupando las ideas por
// el tema (ut) de sus preguntas.

test('PER y PY, en todos los bancos: los faros de la derrota coinciden uno a uno con los del Temario (dominadas, total, estado)', async () => {
  const cs = crearConceptos(bancosNode());
  // Un alumno a medias: respuestas repartidas de forma fija (sin azar) para que haya faros encendidos, en curso y apagados.
  const respuestasDe = (ideas, semilla) => {
    const resp = {};
    ideas.forEach((i, n) => {
      const r = (n * 7 + semilla * 13 + i.ut * 5) % 10;
      const cuantas = r < 5 ? i.qs.length : r < 7 ? 1 : 0;      // la mitad, todas; algunas, una; el resto, ninguna
      i.qs.slice(0, cuantas).forEach((q, j) => { resp[q] = { ok: !(r === 6 || (r === 4 && j === i.qs.length - 1)), t: T, n: 1, ok1: true }; });
    });
    return resp;
  };
  let comprobados = 0;
  const vistos = new Set();
  for (const e of ejes()) {
    for (const tit of ['per', 'py'].filter((t) => titsDeEje(e.id).includes(t))) {
      const ic = await cs.cargarConceptos(e.id, tit);
      const ideas = ideasDelBanco(ic);
      if (!ideas.length) continue;
      const E = TITULACIONES[tit].estructura;
      for (const semilla of [0, 1, 2]) {
        const respuestas = semilla === 2 ? Object.fromEntries(ideas.filter((i) => i.ut === E.bloques[0].ut).flatMap((i) => i.qs.map((q) => [q, { ok: true, t: T, n: 1, ok1: true }]))) : respuestasDe(ideas, semilla);
        // La carta (Hoy y la Travesía, src/ui/travesia.js) y el Temario (src/ui/views/temario.js) calculan así:
        const derrota = estadoTravesia({ ic, estructura: E, respuestas, tests: [], dias: {}, ahora: AHORA }).faros;
        const temario = farosPorTema(estadoTravesia({ ic, estructura: E, respuestas, ahora: AHORA }));
        // Y esto es lo que debe salir, calculado aquí aparte: cada idea, al tema de la mayoría de sus preguntas.
        const est = estadoTravesia({ ic, respuestas, ahora: AHORA });
        const aparte = new Map();
        for (const i of est.ideas) { const ut = temaDeIdea(ic, i.id); aparte.set(ut, [...(aparte.get(ut) ?? []), i]); }
        const temasConIdeas = bloquesEnOrden(E).filter((b) => aparte.has(b.ut));
        assert.equal(derrota.length, temasConIdeas.length, `${e.id}/${tit}: un faro por tema con ideas`);
        assert.equal(temario.size, derrota.length, `${e.id}/${tit}: los mismos faros en el Temario`);
        derrota.forEach((f, k) => {
          const b = temasConIdeas[k];
          const t = temario.get(b.ut);
          const ref = luzDeFaro(aparte.get(b.ut));
          const donde = `${e.id}/${tit} tema ${b.ut} (${b.titulo})`;
          assert.equal(f.ut, b.ut, `${donde}: en el orden del Temario`);
          assert.equal(f.nombre, b.titulo);
          assert.ok(t, `${donde}: está en el Temario`);
          for (const [x, de] of [[t, 'Temario'], [ref, 'cálculo aparte']]) {
            assert.equal(f.dominadas, x.dominadas, `${donde}: dominadas (${de})`);
            assert.equal(f.total, x.total, `${donde}: total (${de})`);
            assert.equal(f.estado, x.estado, `${donde}: estado (${de})`);
            assert.equal(f.pct, x.pct, `${donde}: porcentaje (${de})`);
          }
          vistos.add(f.estado);
        });
        // Todas las ideas del estudio tienen faro y ninguna cuenta dos veces.
        assert.equal(derrota.reduce((n, f) => n + f.total, 0), ideas.length);
        assert.equal(derrota.reduce((n, f) => n + f.dominadas, 0), est.dominadas, 'las dominadas de los faros son las del rango');
        comprobados += 1;
      }
      // PER: once temas, once faros; PY: cuatro.
      assert.equal(estadoTravesia({ ic, estructura: E, respuestas: {}, ahora: AHORA }).faros.length, E.bloques.length, `${e.id}/${tit}: todos los temas tienen ideas`);
    }
  }
  assert.ok(comprobados >= 12, 'PER y PY de varios bancos');
  assert.deepEqual([...vistos].sort(), ['off', 'on', 'parcial'], 'la comparación ha visto faros encendidos, en curso y apagados');
});

test('farosDeTemas: sin estructura, los temas por número; una idea sin tema (o de un tema que no existe) va a «Otras ideas»', () => {
  const x = (id, ut, estado = 'sin-datos') => ({ id, ut, estado, vistas: estado === 'sin-datos' ? 0 : 1, tasa: 1, etiqueta: id });
  const ideas = [x('a', 5, 'dominado'), x('b', 1), x('c', 5), x('d', null), x('e', 99)];
  const sin = farosDeTemas(ideas);
  assert.deepEqual(sin.map((f) => [f.id, f.ut, f.nombre, f.total]), [['t1', 1, 'Tema 1', 1], ['t5', 5, 'Tema 5', 2], ['t99', 99, 'Tema 99', 1], ['otras', null, 'Otras ideas', 1]]);
  const E = { bloques: [{ ut: 1, titulo: 'Uno', corto: 'U', n: 4 }, { ut: 5, titulo: 'Cinco', n: 5 }, { ut: 6, titulo: 'Seis', n: 2 }], ordenEstudio: [5, 1, 6] };
  const con = farosDeTemas(ideas, E);
  assert.deepEqual(con.map((f) => [f.id, f.nombre, f.corto, f.total]), [['t5', 'Cinco', 'Cinco', 2], ['t1', 'Uno', 'U', 1], ['otras', 'Otras ideas', 'Otras', 2]], 'en el orden de estudio; el tema sin ideas no tiene faro');
  assert.equal(con[0].estado, 'parcial');
  assert.equal(con.reduce((n, f) => n + f.total, 0), ideas.length, 'ninguna idea se queda sin faro');
  assert.deepEqual(farosDeTemas([]), []);
});

test('luzDeFaro: el criterio de la carta (80 % dominadas = encendido; alguna vista = en curso; si no, apagado)', () => {
  const x = (estado, vistas = 1) => ({ estado, vistas, tasa: 0, etiqueta: estado });
  assert.equal(luzDeFaro([x('sin-datos', 0), x('sin-datos', 0)]).estado, 'off');
  assert.equal(luzDeFaro([x('dominado'), x('sin-datos', 0)]).estado, 'parcial');
  const on = luzDeFaro([x('dominado'), x('dominado'), x('dominado'), x('dominado'), x('flojo')]);
  assert.equal(on.estado, 'on');
  assert.equal(on.pct, FARO_ENCENDIDO);
  assert.equal(on.flojas.length, 1);
  assert.equal(luzDeFaro([]).estado, 'off', 'sin ideas no hay luz (y no divide por cero)');
});

test('farosPorTema: un faro por tema con el tema de la mayoría de sus preguntas; sin etiquetas, vacío', () => {
  const { ic, ideas, banco } = juguete({ nomen: 5, baliza: 5 });
  // Las ideas de balizamiento, al tema 5; una de ellas con dos preguntas del 5 y una del 6 (va al 5).
  for (const q of banco.todas) if (q.id.startsWith('baliza')) q.ut = 5;
  banco.porId.get(`${ideas.baliza[0]}#3`).ut = 6;
  const resp = juntar(...ideas.nomen.slice(0, 4).map((i) => dominada(i)), dominada(ideas.baliza[0]));
  const est = estadoTravesia({ ic, respuestas: resp, ahora: AHORA });
  const fs = farosPorTema(est);
  assert.deepEqual(est.faros.map((f) => f.id), ['t1', 't5'], 'los mismos de la carta');
  assert.equal(fs.get(5), est.faros[1], 'el mismo objeto: no hay dos cálculos');
  assert.deepEqual([...fs.keys()].sort((a, b) => a - b), [1, 5]);
  assert.equal(fs.get(1).estado, 'on');
  assert.equal(fs.get(1).dominadas, 4);
  assert.equal(fs.get(5).estado, 'parcial');
  assert.equal(fs.get(5).total, 5);
  // Las mismas ideas por tema que «Mi progreso» (conceptosPorTema): mismo reparto.
  const E = { bloques: [{ ut: 1, titulo: 'Uno', n: 4 }, { ut: 5, titulo: 'Cinco', n: 5 }, { ut: 6, titulo: 'Seis', n: 2 }] };
  assert.deepEqual(conceptosPorTema(E, ic, resp).map((t) => [t.ut, t.total]), [[1, 5], [5, 5]]);
  assert.equal(farosPorTema(null).size, 0);
  assert.equal(farosPorTema(estadoTravesia({ ic: null })).size, 0);
});

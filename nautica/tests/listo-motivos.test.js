// «¿Estás listo?» con tu cuaderno de fallos y tu tiempo por tipo (H-70, src/course/listo-motivos.js): cada motivo con su
// frase y su acción, los umbrales (hipótesis, R-14), pocos datos, el foco por módulo, el motor, el examen final y que las
// vistas no calculan.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  tiposDelBanco, motivosCuaderno, motivosVelocidad, motivosListo, conMotivos, practicaConReloj, lineaRiesgos, resumenMotivos,
  PESO_ESTADO, RIESGO_CUADERNO, MIN_MUESTRAS_TIEMPO, CUBREN_FRECUENTES,
} from '../src/course/listo-motivos.js';
import { anotar, comprobacionHecha, dosisHecha, cuadernoDe, claveFallo, idFallo } from '../src/course/cuaderno.js';
import { estadoTiempo } from '../src/course/velocidad.js';
import { lineaListo } from '../src/course/listo.js';
import { listoCorto } from '../src/course/entrada.js';
import { estadoFinal } from '../src/course/final.js';
import { estadoAlumno } from '../src/course/motor.js';
import { TITULACIONES, estructuraModulo } from '../src/theory/blocks.js';
import { tiempoDisponible } from '../src/course/estrategia.js';
import { tipoDePregunta } from '../src/course/velocidad.js';
import { SOLUCIONES } from '../src/bancos/soluciones.js';
import { esDeCarta } from '../src/bancos/index.js';
import { bancosNode, EJE_POR_DEFECTO, cursoDe } from '../tools/bancos/leer.mjs';

const ahora = new Date(2026, 10, 16, 12).getTime();
const DIA = 864e5;
const PER = TITULACIONES.per;
const PY = TITULACIONES.py;
const BANCOS = { per: await bancosNode().cargarBanco(EJE_POR_DEFECTO, 'per'), py: await bancosNode().cargarBanco(EJE_POR_DEFECTO, 'py') };
const tipoDe = (T) => (q) => tipoDePregunta(q, SOLUCIONES[q.id], { cartaUt: T.cartaUt, deCarta: esDeCarta(q) });
const TIPOS = { per: tiposDelBanco(BANCOS.per.practica, tipoDe(PER)), py: tiposDelBanco(BANCOS.py.practica, tipoDe(PY)) };
const DISP = { per: tiempoDisponible(PER), py: tiempoDisponible(PY) };

/** Un fallo del cuaderno en el estado pedido. */
function fallo(error, tipo, estado = 'abierto', t = ahora - 5 * DIA) {
  let f = anotar(null, { error, tipo, origen: 'paso', q: `q-${error}` }, t).f;
  if (estado === 'esperando') f = dosisHecha(f, { aciertos: 5, total: 5 }, t + DIA);
  if (estado === 'vigilando' || estado === 'resuelto') f = comprobacionHecha(dosisHecha(f, { aciertos: 5, total: 5 }, t), { ok: true }, t + DIA);
  if (estado === 'resuelto') f = comprobacionHecha(f, { ok: true }, t + 2 * DIA);
  return [claveFallo(idFallo(error, tipo)), f];
}
const cuad = (...fs) => cuadernoDe(Object.fromEntries(fs), ahora);
/** Una fila de velocidadPorTipo. */
const fila = (tipo, mediaS, n, disp) => ({ tipo, n, mediaS, aciertos: n, tendencia: null, carta: true, estado: estadoTiempo(mediaS, disp) });

test('tipos del banco: a qué tema va cada uno y los que más caen (cubren el 80 % de la carta), solo del estudio', () => {
  assert.equal(CUBREN_FRECUENTES, 0.8);
  for (const tit of ['per', 'py']) {
    const T = TITULACIONES[tit];
    const t = TIPOS[tit];
    assert.ok(Object.values(t.utDe).every((ut) => ut === T.cartaUt), `${tit}: todos los tipos de carta van al tema de carta`);
    const cubren = t.frecuencia.filter((f) => t.frecuentes.includes(f.tipo)).reduce((s, f) => s + f.cuota, 0);
    assert.ok(cubren >= CUBREN_FRECUENTES, `${tit}: los frecuentes cubren el 80 % (${cubren})`);
    assert.ok(!t.frecuentes.includes('carta'), '«otras de carta» no es un tipo que se practique');
    const reservadas = BANCOS[tit].reservadas;
    for (const ids of Object.values(t.porTipo)) assert.ok(ids.every((id) => !reservadas.has(id)), `${tit}: nunca una pregunta reservada`);
  }
  assert.deepEqual(TIPOS.per.frecuentes.slice(0, 3), ['rumbo-distancia', 'ct-enfilacion', 'estima-directa']);
  assert.equal(TIPOS.py.frecuentes[0], 'marea-sonda');
  assert.deepEqual(tiposDelBanco([], null), { utDe: {}, frecuencia: [], frecuentes: [], porTipo: {} });
});

test('cuaderno vacío: ningún motivo y «¿Estás listo?» no cambia', () => {
  const c = cuadernoDe({}, ahora);
  assert.deepEqual(motivosCuaderno({ cuaderno: c, estructura: PER.estructura, utDe: TIPOS.per.utDe, cartaUt: 11, ahora }), []);
  const l = conMotivos({ estado: 'listo', prob: 0.9 }, []);
  assert.equal(l.estado, 'listo');
  assert.equal(l.frenado, false);
  assert.equal(lineaRiesgos(l), '');
});

test('fallos abiertos en carta: un riesgo concreto, con sus nombres, el límite del tema y la dosis', () => {
  const c = cuad(fallo('signo-ct', 'ct-enfilacion'), fallo('sin-ct', 'rumbo-distancia'));
  const [m, ...resto] = motivosCuaderno({ cuaderno: c, estructura: PER.estructura, utDe: TIPOS.per.utDe, cartaUt: 11, ahora });
  assert.equal(resto.length, 0, 'un motivo por tema');
  assert.equal(m.nivel, 'riesgo');
  assert.equal(m.peso, 2 * PESO_ESTADO.abierto);
  assert.match(m.frase, /^Tienes 2 fallos abiertos en carta: «Signo de la Ct» y «Sin corregir la Ct»|^Tienes 2 fallos abiertos en carta: «Sin corregir la Ct» y «Signo de la Ct»/);
  assert.match(m.frase, /solo se pueden fallar 2 de 4/);
  assert.equal(m.accion.texto, 'Haz sus dosis de 2 minutos');
  assert.deepEqual(m.accion.ruta.slice(0, 2), ['fallos', 'dosis']);
  // Frena el «Estás listo» sin tocar la probabilidad.
  const l = conMotivos({ estado: 'listo', prob: 0.92, margen: { bajo: 0.85, alto: 0.95 }, simulacros: { hechos: 0 } }, [m]);
  assert.equal(l.estado, 'casi');
  assert.equal(l.estadoModelo, 'listo');
  assert.equal(l.prob, 0.92);
  assert.ok(l.frenado);
  assert.match(lineaListo(l), /^Casi: .*Pero aún no te doy por listo: tienes 1 riesgo concreto/);
  assert.match(listoCorto(l), /· 1 riesgo$/);
  // Abierto con la dosis hecha y la comprobación pendiente: sigue siendo un riesgo; la acción, ver el cuaderno.
  const e = motivosCuaderno({ cuaderno: cuad(fallo('signo-ct', 'ct-enfilacion', 'esperando', ahora - DIA)), estructura: PER.estructura, utDe: TIPOS.per.utDe, cartaUt: 11, ahora })[0];
  assert.equal(e.nivel, 'riesgo');
  assert.deepEqual(e.accion.ruta, ['fallos']);
  // Dosis hecha hace días: le toca la comprobación, y esa es la acción.
  const cp = motivosCuaderno({ cuaderno: cuad(fallo('signo-ct', 'ct-enfilacion', 'esperando', ahora - 5 * DIA)), estructura: PER.estructura, utDe: TIPOS.per.utDe, cartaUt: 11, ahora })[0];
  assert.deepEqual(cp.accion.ruta, ['fallos', 'comprobar', 'signo-ct.ct-enfilacion']);
  assert.equal(cp.accion.texto, 'Comprobar «Signo de la Ct»');
  // Reabierto (vuelve a aparecer tras resolverlo): abierto otra vez.
  const [k, f] = fallo('signo-ct', 'ct-enfilacion', 'resuelto');
  const re = anotar(f, { error: 'signo-ct', tipo: 'ct-enfilacion', origen: 'simulacro', q: 'otra' }, ahora).f;
  assert.equal(motivosCuaderno({ cuaderno: cuad([k, re]), estructura: PER.estructura, utDe: TIPOS.per.utDe, cartaUt: 11, ahora })[0].nivel, 'riesgo');
});

test('en vigilancia pesa la mitad: uno solo es un aviso (no frena); dos en el mismo tema, un riesgo; resueltos, nada', () => {
  const uno = motivosCuaderno({ cuaderno: cuad(fallo('signo-ct', 'ct-enfilacion', 'vigilando')), estructura: PER.estructura, utDe: TIPOS.per.utDe, cartaUt: 11, ahora });
  assert.equal(uno.length, 1);
  assert.equal(uno[0].nivel, 'aviso');
  assert.equal(uno[0].peso, PESO_ESTADO.vigilando);
  assert.match(uno[0].frase, /Tienes 1 fallo en vigilancia en carta: «Signo de la Ct»\. Pesa la mitad/);
  assert.match(uno[0].frase, /Te lo compruebo el /);
  assert.equal(conMotivos({ estado: 'listo', prob: 0.9 }, uno).estado, 'listo', 'un aviso no frena');
  const dos = motivosCuaderno({ cuaderno: cuad(fallo('signo-ct', 'ct-enfilacion', 'vigilando'), fallo('sin-ct', 'rumbo-distancia', 'vigilando')), estructura: PER.estructura, utDe: TIPOS.per.utDe, cartaUt: 11, ahora });
  assert.equal(dos[0].nivel, 'riesgo');
  assert.equal(dos[0].peso, RIESGO_CUADERNO);
  const res = motivosCuaderno({ cuaderno: cuad(fallo('signo-ct', 'ct-enfilacion', 'resuelto')), estructura: PER.estructura, utDe: TIPOS.per.utDe, cartaUt: 11, ahora });
  assert.equal(res.length, 1);
  assert.equal(res[0].nivel, 'bien');
  assert.equal(res[0].accion, null);
  assert.equal(conMotivos({ estado: 'listo', prob: 0.9 }, res).estado, 'listo');
});

test('velocidad lenta en un tipo que cae mucho: riesgo aunque aciertes, con tus minutos, los del tribunal y práctica con reloj', () => {
  const d = DISP.py.cartaS; // 330 s en el módulo de navegación
  const ms = motivosVelocidad({ filas: [fila('marea-sonda', 460, 5, d)], frecuentes: TIPOS.py.frecuentes, utDe: TIPOS.py.utDe, estructura: PY.estructura, cartaUt: 4, disponibleS: d, porTipo: TIPOS.py.porTipo, ahora });
  const m = ms.find((x) => x.tipo === 'marea-sonda');
  assert.equal(m.nivel, 'riesgo');
  assert.equal(m.frase, 'En marea y sonda tardas 7:40 de media (5 problemas cronometrados) y el examen te da unos 5 min 30 s por problema de carta: aunque aciertes, no llegas.');
  assert.equal(m.accion.texto, 'Practica uno con reloj');
  assert.equal(m.accion.ruta[0], 'q');
  assert.deepEqual(m.accion.query, { guiado: '1' });
  assert.ok(TIPOS.py.porTipo['marea-sonda'].includes(m.accion.ruta[1]), 'una pregunta del estudio de ese tipo');
  assert.equal(conMotivos({ estado: 'listo', prob: 0.95 }, ms).estado, 'casi');
  // Justo (más del 75 % de lo disponible): un aviso, no frena.
  const j = motivosVelocidad({ filas: [fila('marea-sonda', 300, 4, d)], frecuentes: ['marea-sonda'], utDe: TIPOS.py.utDe, estructura: PY.estructura, cartaUt: 4, disponibleS: d, porTipo: TIPOS.py.porTipo, ahora });
  assert.equal(j[0].nivel, 'aviso');
  assert.match(j[0].frase, /vas justo: 5:00 de media/);
  assert.equal(conMotivos({ estado: 'listo', prob: 0.95 }, j).estado, 'listo');
});

test('velocidad rápida: «de tiempo vas bien»; un tipo raro o de teoría no cuenta', () => {
  const d = DISP.py.cartaS;
  const ms = motivosVelocidad({ filas: [fila('marea-sonda', 120, 6, d), fila('viento-aparente', 900, 6, d)], frecuentes: ['marea-sonda'], utDe: TIPOS.py.utDe, estructura: PY.estructura, cartaUt: 4, disponibleS: d, ahora });
  assert.deepEqual(ms.map((m) => m.nivel), ['bien']);
  assert.match(ms[0].frase, /^De tiempo vas bien: en marea y sonda te sobra margen/);
});

test(`pocos datos (menos de ${MIN_MUESTRAS_TIEMPO} cronometrados): se dice, no se juzga`, () => {
  const d = DISP.per.cartaS;
  const ms = motivosVelocidad({ filas: [fila('rumbo-distancia', 900, 2, d)], frecuentes: TIPOS.per.frecuentes, utDe: TIPOS.per.utDe, estructura: PER.estructura, cartaUt: 11, disponibleS: d, porTipo: TIPOS.per.porTipo, ahora });
  assert.equal(ms.length, 1);
  assert.equal(ms[0].nivel, 'sin-datos');
  assert.match(ms[0].frase, /^Aún no sé si llegas a tiempo en rumbo, distancia y hora \(2 de 3\), Ct por enfilación u oposición \(ninguno\)|^Aún no sé si llegas a tiempo en rumbo, distancia y hora \(2 de 3\), /);
  assert.match(ms[0].frase, /y 2 tipos más: necesito 3 problemas cronometrados de cada uno/);
  assert.equal(conMotivos({ estado: 'listo', prob: 0.9 }, ms).estado, 'listo', 'sin datos no frena');
  // Sin tiempo disponible o sin tipos, nada.
  assert.deepEqual(motivosVelocidad({ filas: [], frecuentes: TIPOS.per.frecuentes, estructura: PER.estructura, disponibleS: null }), []);
});

test('práctica con reloj: la pregunta de ese tipo que hace más que no respondes; sin preguntas, el ejercicio generado', () => {
  const ids = TIPOS.py.porTipo['marea-sonda'];
  const respuestas = Object.fromEntries(ids.map((id, i) => [id, { ok: true, t: new Date(ahora - i * DIA).toISOString() }]));
  assert.equal(practicaConReloj('marea-sonda', { porTipo: TIPOS.py.porTipo, respuestas, ahora }).ruta[1], ids.at(-1));
  const ej = practicaConReloj('viento-aparente', { porTipo: TIPOS.py.porTipo, ahora });
  assert.deepEqual(ej.ruta, ['ej', 'viento-aparente']);
  assert.ok(ej.fuera);
  assert.equal(practicaConReloj('carta', {}), null);
});

test('foco por módulo: con «navegación» cuentan la carta y su tiempo; con «genérico», ni el cuaderno de carta ni su tiempo', () => {
  const c = cuad(fallo('adelanto-signo', 'marea-sonda'));
  const d = DISP.py.cartaS;
  const filas = [fila('marea-sonda', 600, 5, d)];
  const nav = estructuraModulo(PY.estructura, 'navegacion');
  const gen = estructuraModulo(PY.estructura, 'generico');
  const tNav = tiposDelBanco(BANCOS.py.practica.filter((q) => [3, 4].includes(q.ut)), tipoDe(PY));
  const tGen = tiposDelBanco(BANCOS.py.practica.filter((q) => [1, 2].includes(q.ut)), tipoDe(PY));
  const mNav = motivosListo({ cuaderno: c, estructura: nav, tipos: tNav, cartaUt: 4, filas, disponibleS: d, ahora });
  assert.deepEqual(mNav.map((m) => `${m.clase}:${m.nivel}`), ['cuaderno:riesgo', 'tiempo:riesgo', 'tiempo:sin-datos']);
  assert.match(mNav[0].frase, /solo se pueden fallar 3 de 10/);
  const mGen = motivosListo({ cuaderno: c, estructura: gen, tipos: tGen, cartaUt: 4, filas, disponibleS: d, ahora });
  assert.deepEqual(mGen, []);
});

test('el motor: «¿Estás listo?» trae los motivos del cuaderno (y con modulos_py = genérico, no los de carta)', () => {
  const base = (tit, settings) => estadoAlumno({
    tit, estructura: TITULACIONES[tit].estructura, curso: cursoDe(tit), preguntas: BANCOS[tit].estudio, regs: {}, respuestas: {}, tests: [], settings,
    minutosHoy: 0, racha: 0, planGuardado: null, ahora, reserva: BANCOS[tit].reserva, pool: BANCOS[tit].final, reservadas: BANCOS[tit].reservadas,
    tipoDe: tipoDe(TITULACIONES[tit]), cartaUt: TITULACIONES[tit].cartaUt, tiempo: { practica: [], disponible: DISP[tit] },
  });
  const [k, f] = fallo('adelanto-signo', 'marea-sonda');
  const st = base('py', { [k]: f, modulos_py: 'navegacion' });
  assert.equal(st.listo.estado, 'faltan-datos', 'sin respuestas, faltan datos (y así sigue)');
  assert.ok(st.listo.motivos.some((m) => m.clase === 'cuaderno' && m.nivel === 'riesgo'));
  assert.ok(st.listo.motivos.some((m) => m.id === 'tiempo:sin-datos'), 'sin tiempos: lo dice');
  const gen = base('py', { [k]: f, modulos_py: 'generico' });
  assert.deepEqual(gen.listo.motivos, []);
  // Sin `tipoDe` (llamadas antiguas): el cuaderno va al tema de carta si se le dice cuál.
  const per = estadoAlumno({ tit: 'per', estructura: PER.estructura, curso: cursoDe('per'), preguntas: BANCOS.per.estudio, settings: Object.fromEntries([fallo('signo-ct', 'ct-enfilacion')]), ahora, cartaUt: 11 });
  assert.equal(per.listo.motivos[0].clase, 'cuaderno');
  assert.match(resumenMotivos(per.listo, 'per'), /\[riesgo\] Tienes 1 fallo abierto en carta.* → Haz su dosis de 2 minutos: #\/per\/fallos\/dosis\/signo-ct\.ct-enfilacion/);
});

test('examen final: aciertas lo bastante pero hay un riesgo concreto → cerrado, con el riesgo y sin «aprobarías X»', () => {
  const m = motivosCuaderno({ cuaderno: cuad(fallo('signo-ct', 'ct-enfilacion')), estructura: PER.estructura, utDe: TIPOS.per.utDe, cartaUt: 11, ahora });
  const listo = conMotivos({ estado: 'listo', prob: 0.88, margen: { bajo: 0.8, alto: 0.93 }, temasSinDatos: [], limitante: null }, m);
  const f = estadoFinal({ estructura: PER.estructura, reserva: BANCOS.per.reserva, pool: BANCOS.per.final, respuestas: {}, tests: [], listo, ahora });
  if (!f.hay) return; // el eje no reserva nada
  assert.equal(f.desbloqueado, false);
  assert.equal(f.bloqueo.motivo, 'riesgos');
  assert.equal(f.bloqueo.riesgos.length, 1);
  assert.match(f.lineas[0], /^Con lo que aciertas ya aprobarías unas 9 de cada 10 veces, pero se abre cuando no te quede este riesgo:/);
  assert.equal(f.lineas[1], m[0].frase);
});

test('las vistas no calculan los motivos: los pintan desde st.listo (src/ui/listo-motivos.js)', () => {
  const calculos = /\b(tiposDelBanco|motivosCuaderno|motivosVelocidad|motivosListo|conMotivos|velocidadPorTipo|practicaConReloj)\(/;
  const ficheros = [...readdirSync(new URL('../src/ui/views/', import.meta.url)).map((f) => `src/ui/views/${f}`), 'src/ui/listo-motivos.js'];
  for (const f of ficheros) {
    if (f.endsWith('estrategia.js')) continue; // «Tu estrategia» pinta su tabla de velocidad desde antes (R-42)
    const src = readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
    assert.ok(!calculos.test(src), `${f} calcula por su cuenta: ${src.match(calculos)?.[0]}`);
  }
});

// Apéndice «Las cuentas del patrón» (data/curso/apendice-matematicas.json, src/course/apendice.js y cuentas.js):
// clases válidas, enlaces «Repasa» que apuntan a clases y ejercicios que existen, ejercicios con números nuevos que
// se corrigen bien (y cuyas teclas dan el resultado en la calculadora), y que nunca entra en el plan ni en «¿Estás listo?».
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { leerJSON, cursoDe, preguntasDe } from '../tools/bancos/leer.mjs';
import { leccionesApendice, repasosPara, estadoApendice, leccionApendice, RUTA_APENDICE } from '../src/course/apendice.js';
import { GENERADORES_CUENTAS, generaCuenta, corrigeCuenta, leeRespuesta, num, gms, reloj, hm } from '../src/course/cuentas.js';
import { leccionesDe } from '../src/course/engine.js';
import { estadoAlumno } from '../src/course/motor.js';
import { validSpec } from '../src/illustrations/index.js';
import { getExercise } from '../src/exercises/registry.js';
import { createRng } from '../src/math/rng.js';
import { norm360 } from '../src/math/angles.js';
import { PER, PY } from '../src/theory/blocks.js';
import { estadoInicial, pulsar } from '../src/calculadora/motor.js';

const ap = leerJSON(RUTA_APENDICE);
const curso = { per: leerJSON('data/curso/per.json'), py: leerJSON('data/curso/py.json') };
const idsCurso = { per: new Set(leccionesDe(curso.per).map((l) => l.id)), py: new Set(leccionesDe(curso.py).map((l) => l.id)) };

test('apéndice: cinco clases; el PER tiene las tres primeras y el PY todas', () => {
  assert.deepEqual(ap.lecciones.map((l) => l.id), ['mat-1', 'mat-2', 'mat-3', 'mat-4', 'mat-5']);
  assert.deepEqual(leccionesApendice(ap, 'per').map((l) => l.id), ['mat-1', 'mat-2', 'mat-3']);
  assert.deepEqual(leccionesApendice(ap, 'py').map((l) => l.id), ['mat-1', 'mat-2', 'mat-3', 'mat-4', 'mat-5']);
  assert.equal(leccionApendice(ap, 'per', 'mat-4'), null);
  for (const l of leccionesApendice(ap, 'py')) {
    assert.equal(l.apendice, true);
    assert.equal(l.ut, null, `${l.id}: el apéndice no es de ningún tema`);
    assert.deepEqual(l.practica, []);
  }
});

test('apéndice: clases en el formato de las del curso (pasos, chuleta, «¿Lo pillas?», láminas y cuentas)', () => {
  const generadores = new Set(GENERADORES_CUENTAS);
  const usados = new Set();
  for (const l of ap.lecciones) {
    assert.ok(l.titulo && l.objetivos?.length && l.chuleta?.length && l.minutos > 0, l.id);
    assert.ok(!idsCurso.per.has(l.id) && !idsCurso.py.has(l.id), `${l.id}: choca con una clase del curso`);
    assert.ok(l.tits.length && l.tits.every((t) => ['per', 'py'].includes(t)), l.id);
    assert.ok(!('practica' in l) && !('ut' in l), `${l.id}: el apéndice no tiene práctica de examen ni tema`);
    const tipos = l.pasos.map((p) => p.tipo);
    assert.ok(tipos.filter((t) => t === 'check').length >= 2, `${l.id}: al menos dos «¿Lo pillas?»`);
    assert.ok(tipos.filter((t) => t === 'cuenta').length >= 3, `${l.id}: al menos tres cuentas con la calculadora`);
    for (const p of l.pasos) {
      assert.ok(['texto', 'clave', 'ojo', 'check', 'cuenta', 'ilustracion'].includes(p.tipo), `${l.id}: tipo ${p.tipo}`);
      if (p.tipo === 'check') {
        assert.ok(p.opciones?.[p.correcta] && p.explicacion, `${l.id}: check sin respuesta válida`);
        assert.equal(new Set(Object.values(p.opciones)).size, Object.keys(p.opciones).length, `${l.id}: opciones repetidas`);
      }
      if (p.tipo === 'cuenta') { assert.ok(generadores.has(p.generador), `${l.id}: generador ${p.generador}`); usados.add(p.generador); }
      if (p.tipo === 'ilustracion') assert.ok(validSpec(p.spec), `${l.id}: ${JSON.stringify(p.spec)}`);
      if (p.tipo === 'texto') assert.ok(p.titulo && p.texto, l.id);
    }
  }
  assert.deepEqual([...generadores].filter((g) => !usados.has(g)), [], 'generadores sin usar en ninguna clase');
  // Ni academias ni escuelas: es la app quien enseña.
  assert.doesNotMatch(readFileSync(new URL(`../${RUTA_APENDICE}`, import.meta.url), 'utf8'), /sirocodiez|siroco ?10|academia|escuela|apuntes|casio/i);
});

test('apéndice: los «Repasa» salen de los datos y apuntan a clases y ejercicios que existen en su titulación', () => {
  for (const l of ap.lecciones) {
    assert.ok(l.usadoEn?.lecciones?.length, `${l.id}: ¿dónde se usa?`);
    for (const id of l.usadoEn.lecciones) {
      const tit = id.split('-')[0];
      assert.ok(idsCurso[tit]?.has(id), `${l.id}: la clase ${id} no existe`);
      assert.ok(l.tits.includes(tit), `${l.id}: enlazada desde ${id}, pero no es del ${tit}`);
    }
    for (const id of l.usadoEn.ejercicios ?? []) {
      const e = getExercise(id);
      assert.ok(e, `${l.id}: el ejercicio ${id} no existe`);
      assert.ok(e.levels.some((n) => l.tits.includes(n.toLowerCase())), `${l.id}: ${id} no es de sus titulaciones`);
    }
  }
  assert.deepEqual(repasosPara(ap, 'per', { leccion: 'per-11-3' }).map((l) => l.id), ['mat-2']);
  assert.deepEqual(repasosPara(ap, 'py', { leccion: 'py-4-10' }).map((l) => l.id), ['mat-1', 'mat-4']);
  assert.deepEqual(repasosPara(ap, 'py', { ejercicio: 'marea-sonda' }).map((l) => l.id), ['mat-2', 'mat-5']);
  // Una clase del PY solo para el PY: en el PER no aparece
  assert.deepEqual(repasosPara(ap, 'per', { ejercicio: 'estima-analitica' }).map((l) => l.id), ['mat-1']);
  assert.deepEqual(repasosPara(ap, 'per', { leccion: 'per-1-1' }), []);
  // Cada clase del PER y del PY que se enlaza lo hace al menos a una clase de su titulación.
  for (const tit of ['per', 'py']) assert.ok(leccionesDe(curso[tit]).some((l) => repasosPara(ap, tit, { leccion: l.id }).length), tit);
});

/** Respuesta «del alumno» bien escrita a partir del resultado, en el formato de cada tipo. */
const respuestaBuena = (ej) => ({
  numero: num(ej.respuesta, 4), gms: gms(ej.respuesta), signo: num(ej.respuesta, 3), rumbo: num(norm360(ej.respuesta), 2), hora: reloj(ej.respuesta), duracion: hm(ej.respuesta),
}[ej.tipo]);
/** El valor que enseña la solución (la parte que se puede leer como respuesta). */
function valorSolucion(ej) {
  const s = ej.solucion;
  if (ej.tipo === 'signo') return leeRespuesta('signo', s.match(/\(([^)]+)\)\s*$/)?.[1] ?? s); // «4° E (+4°)» o «0°»
  if (ej.tipo === 'numero') return leeRespuesta('numero', s.match(/^[−-]?\d+(,\d+)?/)[0]);
  if (ej.tipo === 'hora') return leeRespuesta('hora', s.match(/\d\d:\d\d/)[0]);
  return leeRespuesta(ej.tipo, s);
}

test('cuentas: con números nuevos cada vez, sin huecos, y la respuesta bien escrita se da por buena', () => {
  for (const id of GENERADORES_CUENTAS) {
    const vistos = new Set();
    for (let semilla = 1; semilla <= 150; semilla++) {
      const ej = generaCuenta(id, createRng(semilla));
      vistos.add(ej.enunciado);
      for (const k of ['enunciado', 'solucion', 'teclas', ...ej.pasos.map((_, i) => i)]) {
        const txt = typeof k === 'number' ? ej.pasos[k] : ej[k];
        assert.ok(txt && !/NaN|undefined|Infinity|null|\[object/.test(txt), `${id} #${semilla} ${k}: ${txt}`);
      }
      assert.ok(Number.isFinite(ej.respuesta) && ej.tolerancia >= 0, `${id} #${semilla}`);
      assert.equal(corrigeCuenta(ej, respuestaBuena(ej)).estado, 'ok', `${id} #${semilla}: «${respuestaBuena(ej)}» ≠ ${ej.respuesta}`);
      // La solución que se enseña dice lo mismo que la respuesta que se corrige
      assert.equal(corrigeCuenta(ej, String(valorSolucion(ej))).estado === 'ok' || Math.abs(valorSolucion(ej) - ej.respuesta) <= ej.tolerancia + 1e-6
        || (ej.tipo === 'hora' && corrigeCuenta(ej, ej.solucion.match(/\d\d:\d\d/)[0]).estado === 'ok')
        || (ej.tipo === 'rumbo' && Math.abs(norm360(valorSolucion(ej)) - norm360(ej.respuesta)) <= ej.tolerancia + 1e-6), true, `${id} #${semilla}: solución «${ej.solucion}» ≠ ${ej.respuesta}`);
      assert.equal(corrigeCuenta(ej, '').estado, 'vacia');
      assert.equal(corrigeCuenta(ej, 'hola').estado, 'formato');
    }
    assert.ok(vistos.size > 100, `${id}: solo ${vistos.size} enunciados distintos`);
  }
});

test('cuentas: una respuesta equivocada no se da por buena', () => {
  const malas = { numero: (r) => num(r + 1, 4), gms: (r) => gms(r + 1 / 60), signo: (r) => num(-r - 1, 3), rumbo: (r) => num(norm360(r + 10), 2), hora: (r) => reloj(r + 7), duracion: (r) => hm(r + 0.1) };
  for (const id of GENERADORES_CUENTAS) {
    for (let semilla = 1; semilla <= 40; semilla++) {
      const ej = generaCuenta(id, createRng(semilla));
      assert.equal(corrigeCuenta(ej, malas[ej.tipo](ej.respuesta)).estado, 'mal', `${id} #${semilla}`);
    }
  }
});

test('cuentas: formatos de respuesta que se entienden', () => {
  assert.equal(leeRespuesta('numero', '12,5'), 12.5);
  assert.equal(leeRespuesta('numero', '−3.25'), -3.25);
  assert.equal(leeRespuesta('gms', '36° 27′ 36″'), 36.46);
  assert.equal(leeRespuesta('gms', '36 27 36'), 36.46);
  assert.equal(leeRespuesta('gms', '16° 15,0′'), 16.25);
  assert.equal(leeRespuesta('signo', '4 NE'), 4);
  assert.equal(leeRespuesta('signo', '3° NW'), -3);
  assert.equal(leeRespuesta('signo', '−0°37′'), -(37 / 60));
  assert.equal(leeRespuesta('signo', '12,3 S'), -12.3);
  assert.equal(leeRespuesta('rumbo', '045'), 45);
  assert.equal(leeRespuesta('hora', '13:10'), 790);
  assert.equal(leeRespuesta('duracion', '1 h 35 min'), 1 + 35 / 60);
  assert.equal(leeRespuesta('duracion', '1:35'), 1 + 35 / 60);
  // Horas: las 02:15 son las 26:15 del examen (pasada la medianoche); 23:20 son las −00:40
  assert.equal(corrigeCuenta({ tipo: 'hora', respuesta: 26 * 60 + 15, tolerancia: 0 }, '02:15').estado, 'ok');
  assert.equal(corrigeCuenta({ tipo: 'hora', respuesta: -40, tolerancia: 0 }, '23:20').estado, 'ok');
  // Rumbos: 359,9° y 000,1° están a 0,2°
  assert.equal(corrigeCuenta({ tipo: 'rumbo', respuesta: 359.9, tolerancia: 0.2 }, '0,1').estado, 'ok');
});

// Las teclas que se enseñan, pulsadas en la calculadora (src/calculadora/motor.js), dan el resultado.
const TECLA = { '°′″': 'gms', SHIFT: 'shift', sin: 'sin', cos: 'cos', tan: 'tan', '(−)': 'neg', '÷': '÷', '×': '×', '+': '+', '−': '-', '(': '(', ')': ')', '=': '=', 'x²': 'sq', '√': 'sqrt' };
function pulsaTeclas(texto) {
  let e = estadoInicial();
  for (const t of texto.split(/\s+/)) {
    if (/^\d+(\.\d+)?$/.test(t)) { for (const c of t) e = pulsar(e, c); continue; }
    if (!TECLA[t]) break; // «y después…»: lo que sigue es para leer
    e = pulsar(e, TECLA[t]);
  }
  return e;
}
const DIRECTAS = { // generador → cómo se compara lo que da la calculadora con la respuesta
  'gms-a-decimal': (v, r) => v - r, 'decimal-a-gms': (v, r) => v - r, 'sumar-gm': (v, r) => v - r, 'restar-gm': (v, r) => v - r,
  'hm-a-decimal': (v, r) => v - r, 'decimal-a-hm': (v, r) => v - r, velocidad: (v, r) => v - r,
  medianoche: (v, r) => (v * 60 - r), 'hora-ut': (v, r) => { const d = (((v * 60 - r) % 1440) + 1440) % 1440; return Math.min(d, 1440 - d); },
  'ct-suma': (v, r) => v - r, 'rv-ra': (v, r) => norm360(v) - norm360(r), 'ct-enfilacion': (v, r) => v - r, 'dm-del-ano': (v, r) => v - r,
  apartamiento: (v, r) => v - r, 'dif-latitud': (v, r) => v - r, 'distancia-inversa': (v, r) => v - r, 'dif-longitud': (v, r) => v - r, 'angulo-paso': (v, r) => v - r,
  'distancia-tiempo': (v, r) => v - r, 'escala-latitudes': (v, r) => v - r, duodecimos: (v, r) => v - r,
};

test('cuentas: las teclas que se enseñan dan el resultado en la calculadora', () => {
  for (const [id, dif] of Object.entries(DIRECTAS)) {
    for (let semilla = 1; semilla <= 60; semilla++) {
      const ej = generaCuenta(id, createRng(semilla));
      const e = pulsaTeclas(ej.teclas);
      assert.ok(e.hecho && !e.error, `${id} #${semilla}: «${ej.teclas}» → ${e.error ?? 'sin resultado'}`);
      assert.ok(Math.abs(dif(e.resultado, ej.respuesta)) <= 1e-6, `${id} #${semilla}: «${ej.teclas}» da ${e.resultado}, no ${ej.respuesta}`);
    }
  }
  // La tangente inversa da el ángulo cuadrantal x del rumbo
  for (let semilla = 1; semilla <= 40; semilla++) {
    const ej = generaCuenta('rumbo-inverso', createRng(semilla));
    const x = pulsaTeclas(ej.teclas).resultado;
    assert.ok([x, 180 - x, 180 + x, 360 - x].some((r) => Math.abs(norm360(r) - norm360(ej.respuesta)) < 1e-6), `rumbo-inverso #${semilla}`);
  }
});

test('el apéndice nunca entra en el temario, el plan ni «¿Estás listo?»', () => {
  for (const [tit, E] of [['per', PER], ['py', PY]]) {
    const c = cursoDe(tit);
    const ids = new Set(leccionesDe(c).map((l) => l.id));
    for (const l of ap.lecciones) assert.ok(!ids.has(l.id), `${l.id} está en el curso del ${tit}`);
    // Ninguna clase del apéndice es de un tema del examen
    assert.ok(E.bloques.every((b) => !ap.lecciones.some((l) => l.ut === b.ut)));
    // Terminar todas las clases del apéndice no mueve nada del motor de seguimiento
    const preguntas = preguntasDe(tit);
    const base = { tit, estructura: E, curso: c, preguntas, respuestas: {}, tests: [], racha: 0, planGuardado: null, ahora: Date.UTC(2026, 9, 6, 9), settings: { minutosDia: 30, [`examen_${tit}`]: '2027-01-20' }, minutosHoy: 0 };
    const sin = estadoAlumno({ ...base, regs: {} });
    const regsAp = Object.fromEntries(ap.lecciones.map((l) => [l.id, { visto: true, paso: 0, caja: 3, proximo: base.ahora - 1 }]));
    const con = estadoAlumno({ ...base, regs: regsAp });
    for (const k of ['temas', 'camino', 'actividades', 'listo', 'ritmo', 'repaso', 'flojos', 'mensaje']) {
      assert.deepEqual(JSON.parse(JSON.stringify(con[k])), JSON.parse(JSON.stringify(sin[k])), `${tit}: «${k}» cambia con el apéndice`);
    }
    assert.deepEqual(con.plan.seg, sin.plan.seg, `${tit}: el plan cambia con el apéndice`);
    // Ni el plan del día propone una clase del apéndice
    assert.ok(!con.actividades.some((a) => JSON.stringify(a).includes('mat-')), tit);
  }
  // Su propia lista sí lleva la cuenta de lo visto (para el alumno), aparte del plan
  const st = estadoApendice(ap, 'per', { 'mat-1': { visto: true, paso: 0 } });
  assert.equal(st.vistas, 1);
  assert.equal(st.total, 3);
});

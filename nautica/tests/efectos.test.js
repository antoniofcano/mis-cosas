// Efectos (docs/EFECTOS.md): parámetros de los sonidos dentro de límites, apagado por defecto, migración de ajustes,
// vibración sin soporte, «ya visto» para animar solo el cambio y nada animado con «reducir movimiento».
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  tic, fallo, campanilla, campanaGuardia, sonidoDe, programa, duracion, crearMotor,
  GANANCIA_MAX, LIMITES, FUNDIDO, SUELO, PARCIALES_CAMPANA, SONIDOS,
} from '../src/audio/efectos.js';
import {
  configurarEfectos, efecto, respuesta, sonar, vibrar, soportaVibracion, PATRONES, AJUSTES_EFECTOS,
  novedades, marcarVistos, fijarAlmacenVistos, claseAnimada, desbloquearSonido, escucharPrimerGesto,
} from '../src/ui/efectos.js';
import { createProgressStore } from '../src/store/progress.js';

const memoria = (ini = {}) => {
  const m = new Map(Object.entries(ini));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
};

/** AudioContext de mentira: apunta cada nodo y cada llamada. */
function contextoFalso({ estado = 'running' } = {}) {
  const log = [];
  const param = (nombre) => ({ value: 1, setValueAtTime: (v, t) => log.push([nombre, 'set', v, t]), linearRampToValueAtTime: (v, t) => log.push([nombre, 'lin', v, t]), exponentialRampToValueAtTime: (v, t) => log.push([nombre, 'exp', v, t]) });
  const nodo = (tipo) => ({ tipo, connect: () => {}, disconnect: () => {} });
  const ctx = {
    state: estado, currentTime: 10, destination: nodo('destino'), log, osciladores: [], ganancias: [],
    resume: () => { ctx.state = 'running'; return Promise.resolve(); },
    createGain() { const g = { ...nodo('gain'), gain: param('gain') }; ctx.ganancias.push(g); return g; },
    createOscillator() { const o = { ...nodo('osc'), type: '', frequency: param('freq'), start: (t) => log.push(['osc', 'start', t]), stop: (t) => log.push(['osc', 'stop', t]) }; ctx.osciladores.push(o); return o; },
  };
  return ctx;
}

const TODOS = [tic(), fallo(), campanilla(), campanaGuardia()];

test('sonidos: frecuencias, tiempos y ganancias dentro de los límites y sin NaN', () => {
  for (const s of TODOS) {
    assert.ok(s.notas.length > 0, s.nombre);
    assert.ok(s.volumen > 0 && s.volumen <= 1, `${s.nombre}: volumen relativo`);
    for (const n of s.notas) {
      for (const v of [n.f, n.t, n.ataque, n.caida, n.gan]) assert.ok(Number.isFinite(v), `${s.nombre}: ${JSON.stringify(n)}`);
      assert.ok(n.f >= LIMITES.fMin && n.f <= LIMITES.fMax, `${s.nombre}: f ${n.f}`);
      assert.ok(n.ataque >= LIMITES.ataqueMin && n.ataque <= LIMITES.ataqueMax, `${s.nombre}: ataque`);
      assert.ok(n.caida >= LIMITES.caidaMin && n.caida <= LIMITES.caidaMax, `${s.nombre}: caída`);
      assert.ok(n.t >= 0 && n.gan > 0);
    }
    // Las notas de un sonido suman como mucho 1: ni sonando todas a la vez se pasa del volumen maestro.
    assert.ok(s.notas.reduce((a, n) => a + n.gan, 0) <= 1 + 1e-9, `${s.nombre}: suma de ganancias`);
    assert.ok(duracion(s) > 0 && duracion(s) <= LIMITES.duracionMax, `${s.nombre}: duración ${duracion(s)}`);
  }
});

test('sonidos: el tic y el fallo son cortos y el fallo es el más bajo (nada punitivo)', () => {
  assert.ok(duracion(tic()) < 0.2);
  assert.ok(duracion(fallo()) < 0.2);
  assert.ok(fallo().volumen < tic().volumen && fallo().volumen <= 0.15);
  assert.ok(fallo().notas.every((n) => n.f < 400), 'grave y neutro');
  assert.ok(campanilla().notas.length >= 2);
});

test('campana de guardia: dos campanadas, parciales inarmónicos y los graves duran más', () => {
  const c = campanaGuardia();
  const golpes = [...new Set(c.notas.map((n) => n.t))];
  assert.equal(golpes.length, 2);
  assert.ok(golpes[1] - golpes[0] >= 0.5 && golpes[1] - golpes[0] <= 1.2);
  const razones = PARCIALES_CAMPANA.map(([r]) => r);
  assert.ok(razones.some((r) => Math.abs(r - Math.round(r)) > 0.1), 'hay parciales que no son armónicos');
  const caidas = PARCIALES_CAMPANA.map(([, , d]) => d);
  assert.ok(caidas.every((d, i) => i === 0 || d <= caidas[i - 1]), 'la caída se acorta con la altura');
});

test('programa: envolvente con fundido final y ganancia final por debajo del tope', () => {
  for (const s of TODOS) {
    for (const n of programa(s, 5, 1)) {
      assert.ok(n.inicio >= 5 && n.pico > n.inicio && n.fin > n.pico);
      assert.ok(Math.abs(n.parada - n.fin - FUNDIDO) < 1e-9, 'fundido a cero antes de parar');
      assert.ok(n.gan > SUELO && n.gan <= GANANCIA_MAX, `${s.nombre}: ganancia ${n.gan}`);
    }
  }
  assert.ok(GANANCIA_MAX <= 0.25, 'tope conservador');
});

test('cada efecto tiene su sonido; los que no existen no suenan', () => {
  for (const k of Object.keys(SONIDOS)) assert.ok(sonidoDe(k));
  assert.equal(sonidoDe('navegar'), null);
});

test('motor: sin desbloquear (sin gesto) no crea nada ni suena; después crea osciladores con envolvente', () => {
  let creados = 0;
  const ctx = contextoFalso();
  const m = crearMotor({ crearContexto: () => { creados += 1; return ctx; } });
  assert.equal(m.tocar(tic()), false);
  assert.equal(creados, 0, 'el AudioContext no se crea hasta el gesto');
  assert.equal(m.desbloquear(), true);
  assert.equal(creados, 1);
  assert.equal(m.tocar(campanaGuardia()), true);
  assert.equal(ctx.osciladores.length, campanaGuardia().notas.length);
  assert.ok(ctx.osciladores.every((o) => o.type === 'sine'));
  // Maestro con tope y, en cada nota, empieza en 0 y acaba en 0 (sin clics).
  assert.ok(ctx.ganancias[0].gain.value <= GANANCIA_MAX);
  const ceros = ctx.log.filter(([n, tipo, v]) => n === 'gain' && (tipo === 'set' || tipo === 'lin') && v === 0);
  assert.equal(ceros.length, 2 * ctx.osciladores.length);
  m.desbloquear();
  assert.equal(creados, 1, 'un solo AudioContext');
});

test('motor: sin WebAudio no falla', () => {
  const m = crearMotor({ crearContexto: () => null });
  assert.equal(m.desbloquear(), false);
  assert.equal(m.tocar(tic()), false);
});

test('motor: un contexto suspendido se reanuda y solo suena si lo consigue enseguida', async () => {
  const ctx = contextoFalso({ estado: 'suspended' });
  const m = crearMotor({ crearContexto: () => ctx });
  m.desbloquear();
  ctx.state = 'suspended';
  assert.equal(m.tocar(tic()), true);
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(ctx.osciladores.length, tic().notas.length);
});

test('ajustes: sonidos y vibración apagados por defecto; un progreso antiguo migra sin perder nada', () => {
  assert.deepEqual(AJUSTES_EFECTOS, { sonidos: false, vibracion: false });
  const nuevo = createProgressStore(memoria());
  assert.equal(nuevo.settings().sonidos, false);
  assert.equal(nuevo.settings().vibracion, false);
  const KEY = 'nautica.progress.v1';
  const antiguo = { version: 1, exercises: {}, exams: { a: { choice: 'a', ok: true, t: '2025-01-01T00:00:00Z' } }, settings: { level: 'PY', letra: 'grande', voz: false } };
  const p = createProgressStore(memoria({ [KEY]: JSON.stringify(antiguo) }));
  assert.equal(p.settings().sonidos, false);
  assert.equal(p.settings().vibracion, false);
  assert.equal(p.settings().letra, 'grande');
  assert.equal(p.settings().voz, false);
  assert.ok(p.get().exams.a.ok);
  // Valores raros: apagados. Los guardados se respetan.
  const raro = createProgressStore(memoria({ [KEY]: JSON.stringify({ ...antiguo, settings: { sonidos: 'si', vibracion: 1 } }) }));
  assert.equal(raro.settings().sonidos, false);
  assert.equal(raro.settings().vibracion, false);
  const st = memoria();
  const a = createProgressStore(st);
  a.setSetting('sonidos', true);
  assert.equal(createProgressStore(st).settings().sonidos, true);
});

test('efectos: con los ajustes por defecto no suena ni vibra nada (ni se crea el AudioContext)', () => {
  let creados = 0;
  const llamadas = [];
  configurarEfectos({ settings: () => ({ sonidos: false, vibracion: false }), estaOcupado: () => false,
    motor: crearMotor({ crearContexto: () => { creados += 1; return contextoFalso(); } }), navegador: { vibrate: (p) => { llamadas.push(p); return true; } } });
  assert.deepEqual(efecto('acierto'), { sonido: false, vibracion: false });
  assert.deepEqual(respuesta(false), { sonido: false, vibracion: false });
  assert.equal(desbloquearSonido(), false);
  assert.equal(creados, 0);
  assert.deepEqual(llamadas, []);
});

test('efectos: activados, suenan y vibran con sus patrones; si habla el profe, el tic calla', () => {
  const ctx = contextoFalso();
  const llamadas = [];
  let habla = false;
  configurarEfectos({ settings: () => ({ sonidos: true, vibracion: true }), estaOcupado: () => habla,
    motor: crearMotor({ crearContexto: () => ctx }), navegador: { vibrate: (p) => { llamadas.push(p); return true; } } });
  assert.equal(sonar('acierto'), false, 'sin gesto previo no suena');
  assert.equal(desbloquearSonido(), true);
  assert.deepEqual(respuesta(true), { sonido: true, vibracion: true });
  assert.deepEqual(llamadas, [PATRONES.acierto]);
  habla = true;
  assert.equal(sonar('acierto'), false, 'la voz del profe y los efectos no suenan a la vez');
  habla = false;
  assert.deepEqual(efecto('faro'), { sonido: true, vibracion: true });
  assert.deepEqual(efecto('guardia'), { sonido: true, vibracion: false }, 'la campana no vibra');
  assert.equal(efecto('navegar').sonido, false);
});

test('patrones de vibración: cortos y suaves', () => {
  for (const [k, p] of Object.entries(PATRONES)) {
    if (p == null) continue;
    const xs = [p].flat();
    assert.ok(xs.every((x) => Number.isInteger(x) && x > 0 && x <= 120), k);
    assert.ok(xs.reduce((a, b) => a + b, 0) <= 300, `${k}: total`);
  }
  assert.equal([PATRONES.fallo].flat().length, 3, 'fallo: dos pulsos');
});

test('vibración: sin soporte (Safari de iPhone) ni falla ni hace nada; con un vibrate que lanza, tampoco', () => {
  configurarEfectos({ settings: () => ({ vibracion: true }), navegador: {} });
  assert.equal(soportaVibracion(), false);
  assert.equal(vibrar('acierto'), false);
  configurarEfectos({ navegador: undefined });
  configurarEfectos({ navegador: null });
  assert.equal(vibrar('fallo'), false);
  configurarEfectos({ navegador: { vibrate: () => { throw new Error('no'); } } });
  assert.equal(vibrar('acierto'), false);
});

test('primer gesto: sin sonidos activados no se crea el AudioContext', () => {
  let creados = 0;
  const oyentes = {};
  const doc = { addEventListener: (ev, f) => { oyentes[ev] = f; }, removeEventListener: (ev) => { delete oyentes[ev]; } };
  let activos = false;
  configurarEfectos({ settings: () => ({ sonidos: activos }), motor: crearMotor({ crearContexto: () => { creados += 1; return contextoFalso(); } }) });
  escucharPrimerGesto(doc);
  oyentes.pointerdown();
  assert.equal(creados, 0);
  activos = true;
  oyentes.pointerdown();
  assert.equal(creados, 1);
  assert.equal(oyentes.pointerdown, undefined, 'con el contexto en marcha deja de escuchar');
});

test('novedades: la primera visita no anima nada; después, solo lo que ha cambiado', () => {
  fijarAlmacenVistos(memoria());
  assert.deepEqual(novedades('faros:x/per', ['a', 'b']), []);
  assert.deepEqual(novedades('faros:x/per', ['a', 'b']), [], 'volver a la pantalla no anima');
  assert.deepEqual(novedades('faros:x/per', ['a', 'b', 'c']), ['c']);
  assert.deepEqual(novedades('faros:x/per', ['a', 'c']), []);
  assert.deepEqual(novedades('faros:x/per', ['a', 'b', 'c']), ['b'], 'un faro que se apaga y vuelve a encenderse es un cambio');
  // El parte: todo lo que trae es nuevo la primera vez, y al volver a verlo ya no.
  assert.deepEqual(novedades('parte:x/per', ['1:f:a'], { primeraVezTodo: true }), ['1:f:a']);
  assert.deepEqual(novedades('parte:x/per', ['1:f:a'], { primeraVezTodo: true }), []);
  // marcarVistos solo añade a un ámbito que ya existe.
  marcarVistos('faros:x/per', ['d']);
  assert.deepEqual(novedades('faros:x/per', ['a', 'b', 'c', 'd']), []);
  marcarVistos('faros:y/per', ['d']);
  assert.deepEqual(novedades('faros:y/per', ['d', 'e']), [], 'ámbito nuevo: primera visita');
  // Sin almacén (modo privado) no falla.
  fijarAlmacenVistos({ getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); } });
  assert.deepEqual(novedades('faros:x/per', ['a']), []);
  fijarAlmacenVistos(memoria());
});

test('reducir movimiento: no se añade ninguna clase animada', () => {
  const antes = globalThis.matchMedia;
  try {
    globalThis.matchMedia = (q) => ({ matches: /reduce/.test(q) });
    assert.equal(claseAnimada('se-enciende'), '');
    globalThis.matchMedia = () => ({ matches: false });
    assert.equal(claseAnimada('se-enciende'), 'se-enciende');
  } finally { globalThis.matchMedia = antes; }
});

test('CSS: las animaciones nuevas solo con movimiento permitido, cortas y sin bucles nuevos', () => {
  // Sin comentarios (con el mismo largo, para no mover las posiciones).
  const css = readFileSync(new URL('../styles/app.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  // Variables de duración y curva, con las duraciones en su rango.
  const dur = Object.fromEntries([...css.matchAll(/--dur-([a-z-]+):\s*(\d+)ms/g)].map((m) => [m[1], Number(m[2])]));
  for (const [k, v] of Object.entries(dur)) assert.ok(v >= 80 && v <= (k === 'momento' ? 900 : 450), `--dur-${k}: ${v}`);
  assert.match(css, /--ease-sale:/);
  // Cada regla que usa las clases de cambio está dentro de un @media (prefers-reduced-motion: no-preference).
  const bloques = [...css.matchAll(/@media \(prefers-reduced-motion: no-preference\) \{/g)].map((m) => m.index);
  for (const clase of ['.se-enciende', '.trav-disco.sube', '.insignia.entra', '.qcard.recien']) {
    for (const m of css.matchAll(new RegExp(clase.replace(/\./g, '\\.'), 'g'))) {
      assert.ok(bloques.some((i) => i < m.index && !css.slice(i, m.index).includes('\n}\n')), `${clase} fuera de no-preference`);
    }
  }
  // Animaciones infinitas: solo el halo de los faros (el de siempre).
  const infinitas = [...css.matchAll(/animation:[^;]*infinite[^;]*;/g)].map((m) => m[0]);
  assert.ok(infinitas.every((a) => a.includes('faro-pulso')), infinitas.join('\n'));
});

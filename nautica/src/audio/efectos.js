// Sonidos de la app, sintetizados con WebAudio (sin ficheros de audio ni librerías): un tic suave al acertar, un toque
// neutro casi inaudible al fallar, una campanilla al encender un faro o subir de rango y la campana de guardia (dos
// campanadas) al terminar una sesión. Todos son opcionales y están apagados por defecto (docs/EFECTOS.md).
//
// Dos capas:
//   - Funciones puras que describen cada sonido (frecuencias, tiempos, ganancias) y cómo se programa en el tiempo. Se
//     prueban sin navegador (tests/efectos.test.js).
//   - crearMotor(): una capa fina que crea el AudioContext (inyectable para los tests) y convierte esa descripción en
//     osciladores y envolventes. Volumen bajo y con tope: el bus maestro nunca pasa de GANANCIA_MAX y las notas de un
//     sonido suman como mucho 1, así que ni sumando todas a la vez se satura. Cada nota acaba con un fundido a cero
//     antes de parar el oscilador (sin clics).

/** Tope de la ganancia maestra (0..1). Conservador: los efectos acompañan, no se imponen a la voz ni a la música del móvil. */
export const GANANCIA_MAX = 0.2;
/** Valor mínimo de la envolvente exponencial (no puede llegar a 0) y fundido final hasta 0, en segundos. */
export const SUELO = 0.0001;
export const FUNDIDO = 0.03;
/** Límites que cumple cualquier sonido (los comprueban los tests). */
export const LIMITES = { fMin: 60, fMax: 8000, ataqueMin: 0.002, ataqueMax: 0.05, caidaMin: 0.02, caidaMax: 3.5, duracionMax: 4.5 };

/** Una nota: seno de frecuencia `f` que empieza en `t` (s), sube en `ataque` y cae exponencialmente en `caida`. */
const nota = (f, t, ataque, caida, amp) => ({ f, t, ataque, caida, amp });

/** Normaliza las amplitudes relativas para que las notas de un sonido sumen 1 como mucho. */
function sonido(nombre, volumen, notas) {
  const suma = notas.reduce((s, n) => s + n.amp, 0) || 1;
  return { nombre, volumen, notas: notas.map(({ amp, ...n }) => ({ ...n, gan: amp / suma })) };
}

/** Tic de acierto: un seno agudo y muy corto con un armónico tenue (como una gota de madera). */
export function tic() {
  return sonido('tic', 0.5, [nota(1568, 0, 0.004, 0.09, 1), nota(3136, 0, 0.003, 0.04, 0.18)]);
}

/** Fallo: un toque grave, neutro y muy bajo. Nada que suene a castigo (ni zumbidos ni notas que bajan). */
export function fallo() {
  return sonido('fallo', 0.12, [nota(262, 0, 0.008, 0.07, 1)]);
}

/** Campanilla (faro encendido, rango nuevo): dos notas que suben, con un parcial inarmónico de metal (×2,76). */
export function campanilla() {
  return sonido('campanilla', 0.45, [
    nota(1319, 0, 0.004, 0.55, 1), nota(1319 * 2.76, 0, 0.003, 0.18, 0.12),
    nota(1976, 0.11, 0.004, 0.7, 0.9), nota(1976 * 2.76, 0.11, 0.003, 0.2, 0.1),
  ]);
}

/**
 * Parciales de una campana de barco (bronce): razón respecto a la fundamental, amplitud relativa y caída (s). Inarmónicos
 * (hum, prima, tercera menor, quinta, nominal y los altos) y los graves duran más que los agudos.
 */
export const PARCIALES_CAMPANA = [
  [0.5, 0.22, 3.0], [1, 0.5, 2.4], [1.183, 0.32, 1.7], [1.506, 0.18, 1.3], [2, 0.42, 1.1],
  [2.514, 0.14, 0.75], [2.662, 0.11, 0.6], [3.011, 0.08, 0.5], [4.166, 0.04, 0.35],
];

/**
 * Campana de guardia: `golpes` campanadas (dos: «dos campanadas», como al relevar una guardia) separadas `separacion` s.
 * Síntesis aditiva con los parciales inarmónicos y caída exponencial.
 */
export function campanaGuardia({ golpes = 2, separacion = 0.8, f0 = 587 } = {}) {
  const notas = [];
  for (let g = 0; g < golpes; g += 1) {
    const t = g * separacion;
    const fuerza = g === 0 ? 1 : 0.85; // la segunda, un poco más suave
    for (const [r, a, c] of PARCIALES_CAMPANA) notas.push(nota(f0 * r, t, 0.003, c, a * fuerza));
  }
  return sonido('campana', 0.8, notas);
}

/** Qué sonido corresponde a cada efecto (null = ninguno). */
export const SONIDOS = { acierto: tic, fallo, faro: campanilla, rango: campanilla, guardia: campanaGuardia };

/** El sonido de un efecto, o null si no suena. */
export const sonidoDe = (efecto) => SONIDOS[efecto]?.() ?? null;

/** Duración total de un sonido (s), con el fundido final. */
export const duracion = (s) => Math.max(0, ...s.notas.map((n) => n.t + n.ataque + n.caida + FUNDIDO));

/**
 * Programa un sonido a partir del instante `t0` (s del AudioContext): para cada nota, cuándo empieza, cuándo llega al
 * pico, cuándo acaba la caída y cuándo se para (tras el fundido a cero), con su ganancia final (volumen incluido).
 */
export function programa(s, t0 = 0, volumen = GANANCIA_MAX) {
  const v = Math.min(Math.max(volumen, 0), GANANCIA_MAX) * s.volumen;
  return s.notas.map((n) => {
    const inicio = t0 + n.t;
    const pico = inicio + n.ataque;
    const fin = pico + n.caida;
    return { f: n.f, inicio, pico, fin, parada: fin + FUNDIDO, gan: Math.max(SUELO * 2, n.gan * v) };
  });
}

/** AudioContext del navegador (o null si no hay). */
function contextoPorDefecto() {
  const C = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  if (typeof C !== 'function') return null;
  try { return new C({ latencyHint: 'interactive' }); } catch { return null; }
}

/** ¿Hay WebAudio en este navegador? */
export const hayAudio = () => typeof (globalThis.AudioContext ?? globalThis.webkitAudioContext) === 'function';

/**
 * Motor de sonido: crea el AudioContext solo en `desbloquear()` (hay que llamarlo dentro de un gesto del usuario: la
 * política de reproducción automática no deja sonar nada antes) y toca los sonidos que le pidan.
 * @param {{ crearContexto?: () => AudioContext | null, volumen?: number, ahora?: () => number }} [o]
 */
export function crearMotor({ crearContexto = contextoPorDefecto, volumen = GANANCIA_MAX, ahora = () => Date.now() } = {}) {
  let ctx = null;
  let maestro = null;

  function desbloquear() {
    if (!ctx) {
      ctx = crearContexto();
      if (!ctx) return false;
      // Safari: «ambient» respeta el interruptor de silencio del iPhone y no corta la música de otras apps.
      try { if (globalThis.navigator?.audioSession) globalThis.navigator.audioSession.type = 'ambient'; } catch { /* sin audioSession */ }
      maestro = ctx.createGain();
      maestro.gain.value = Math.min(volumen, GANANCIA_MAX);
      maestro.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume?.()?.catch?.(() => {});
    return true;
  }

  function suena(s, retraso) {
    const bus = ctx.createGain();
    bus.gain.value = 1;
    bus.connect(maestro);
    const notas = programa(s, ctx.currentTime + 0.01 + retraso, maestro.gain.value);
    let vivas = notas.length;
    for (const n of notas) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, n.inicio);
      g.gain.setValueAtTime(0, n.inicio);
      g.gain.linearRampToValueAtTime(n.gan, n.pico);
      g.gain.exponentialRampToValueAtTime(SUELO, n.fin);
      g.gain.linearRampToValueAtTime(0, n.parada);
      osc.connect(g);
      g.connect(bus);
      osc.onended = () => { osc.disconnect(); g.disconnect(); if (--vivas === 0) bus.disconnect(); };
      osc.start(n.inicio);
      osc.stop(n.parada + 0.01);
    }
  }

  /**
   * Toca `s` (un sonido de arriba) dentro de `retraso` s. Si el contexto aún no corre, lo reanuda y solo suena si lo
   * consigue enseguida: un sonido que llega tarde ya no acompaña a nada.
   * @returns {boolean} si se ha programado (o se programará al reanudar)
   */
  function tocar(s, retraso = 0) {
    if (!ctx || !maestro || !s || ctx.state === 'closed') return false;
    if (ctx.state === 'running') { suena(s, retraso); return true; }
    const pedido = ahora();
    const p = ctx.resume?.();
    if (!p?.then) return false;
    p.then(() => { if (ctx.state === 'running' && ahora() - pedido < 300) suena(s, retraso); }).catch(() => {});
    return true;
  }

  return {
    desbloquear,
    tocar,
    get listo() { return !!ctx && ctx.state === 'running'; },
    get contexto() { return ctx; },
  };
}

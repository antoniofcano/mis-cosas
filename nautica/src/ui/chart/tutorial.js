// Tutorial sobre la carta: reproduce la solución paso a paso como se haría en el examen.
// Para cada trazo del paso se coloca primero el instrumento que se usaría (transportador, compás o regla),
// se espera un momento y se dibuja el trazo. El encuadre sigue a lo que se está haciendo.

import { rhumbDestination } from '../../math/mercator.js';
import { fmtBearing, fmtMiles } from '../../math/format.js';

/** Instrumento con el que se haría un trazo, y una frase que lo explica. */
export function instrumentFor(it) {
  switch (it.t) {
    case 'ray':
      return { spec: { type: 'protractor', at: it.from, bearing: it.bearing }, say: `Transportador con el centro en el punto de partida y el hilo a ${fmtBearing(it.bearing)}: se traza la línea.` };
    case 'line':
      return { spec: { type: 'protractor', at: it.through, bearing: it.bearing }, say: `Transportador centrado en el punto, orientado a ${fmtBearing(it.bearing)}: se traza la recta.` };
    case 'vec':
      return {
        spec: { type: 'protractor', at: it.from, bearing: it.bearing },
        then: { type: 'compass', center: it.from, edge: rhumbDestination(it.from, it.bearing, it.length) },
        say: `Transportador a ${fmtBearing(it.bearing)} y compás abierto ${fmtMiles(it.length)} (escala de latitudes) para llevar la distancia.`,
      };
    case 'seg':
      return { spec: { type: 'ruler', a: it.from, b: it.to }, say: 'Regla uniendo los dos puntos.' };
    case 'arc':
      return { spec: { type: 'compass', center: it.center, edge: rhumbDestination(it.center, it.around, it.radius) }, say: `Compás con centro en el faro y abertura ${fmtMiles(it.radius)}.` };
    case 'circle':
      return { spec: { type: 'compass', center: it.center, edge: rhumbDestination(it.center, 90, it.radius) }, say: `Compás con abertura ${fmtMiles(it.radius)}.` };
    default:
      return null;
  }
}

/** Puntos geográficos de una primitiva (para encuadrar). */
export function pointsOf(it) {
  switch (it.t) {
    case 'pos': return [it.at];
    case 'ray': case 'vec': return [it.from, rhumbDestination(it.from, it.bearing, it.length)];
    case 'line': return [it.through];
    case 'seg': return [it.from, it.to];
    case 'arc': case 'circle': return [it.center];
    case 'text': return [it.at];
    default: return [];
  }
}

const wait = (ms, signal) => new Promise((res) => {
  const t = setTimeout(res, ms);
  signal?.addEventListener('abort', () => { clearTimeout(t); res(); });
});

/**
 * @param {object} chart  API de la carta interactiva
 * @param {{ title, text }[]} steps  pasos de la solución (1..n)
 * @param {object[]} items  primitivas con `step`
 * @param {{ onStep?: (n, info) => void, speed?: number, narration?: { intro, steps, outro }, voice?: object }} opts
 *   narration: explicación del profe (teacher/narrate.js); voice: voz (ui/voice.js). Si la voz está activa,
 *   cada paso espera a que el profe termine de hablar.
 */
export function createTutorial(chart, steps, items, { onStep, speed = 1, narration, voice } = {}) {
  let n = 0;
  let ctrl = null;
  let auto = false;

  const visibleUpTo = (k) => items.filter((it) => (it.step ?? 0) <= k);
  const narrFor = (k) => {
    if (!narration) return null;
    if (k === 0) return narration.intro;
    const st = narration.steps[k - 1];
    if (k !== steps.length || !narration.outro) return st;
    return { display: `${st.display}\n${narration.outro.display}`, speech: `${st.speech} ${narration.outro.speech}` };
  };

  async function goTo(k, { animate = true, speak = animate } = {}) {
    ctrl?.abort();
    voice?.stop();
    ctrl = new AbortController();
    const { signal } = ctrl;
    n = Math.max(0, Math.min(steps.length, k));
    const narr = narrFor(n);
    const talk = speak && voice?.enabled && narr ? voice.speak(narr.speech) : Promise.resolve();
    const before = visibleUpTo(n - 1);
    const mine = items.filter((it) => (it.step ?? 0) === n && n > 0);
    chart.showInstrument(null);
    chart.hideProtractor();
    chart.setItems(before);
    onStep?.(n, { step: steps[n - 1], drawing: '', narration: narr });
    // Encuadre: lo que se dibuja en este paso (y las situaciones ya obtenidas); si no se dibuja nada, toda la construcción.
    const focus = (mine.length ? [...mine, ...before.filter((it) => it.t === 'pos' || it.t === 'ray')] : visibleUpTo(n)).flatMap(pointsOf);
    if (!animate) { chart.setItems(visibleUpTo(n)); if (focus.length) chart.focusPoints(focus); await talk; return; }
    if (focus.length) await chart.flyTo(focus, 700 / speed);
    const shown = [...before];
    for (const it of mine) {
      if (signal.aborted) return;
      const ins = instrumentFor(it);
      if (ins) {
        onStep?.(n, { step: steps[n - 1], drawing: ins.say, narration: narr });
        chart.showInstrument(ins.spec);
        await wait(1100 / speed, signal);
        if (ins.then) { chart.showInstrument(ins.then); await wait(900 / speed, signal); }
      }
      if (signal.aborted) return;
      shown.push(it);
      chart.setItems([...shown]);
      await wait(350 / speed, signal);
    }
    chart.showInstrument(null);
    chart.hideProtractor();
    await talk;
  }

  async function play() {
    auto = true;
    if (n === 0 && narration && voice?.enabled) await goTo(0, { animate: false, speak: true }); // presentación del profe
    while (auto && n < steps.length) {
      await goTo(n + 1);
      if (!auto) break;
      await wait((voice?.enabled ? 700 : 2200) / speed);
    }
    auto = false;
  }

  return {
    get step() { return n; },
    get total() { return steps.length; },
    next: () => { auto = false; return goTo(n + 1); },
    prev: () => { auto = false; return goTo(n - 1, { animate: false }); },
    first: () => { auto = false; return goTo(0, { animate: false }); },
    last: () => { auto = false; return goTo(steps.length, { animate: false }); },
    goTo,
    play,
    stop: () => { auto = false; ctrl?.abort(); voice?.stop(); },
    get playing() { return auto; },
  };
}

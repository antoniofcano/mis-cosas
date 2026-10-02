// Voz del profe: síntesis de voz del propio navegador (Web Speech API). Gratis y sin conexión con las
// voces del sistema. Se elige una voz en español (preferentemente de España) y se lee frase a frase,
// porque algunos navegadores cortan las locuciones largas.

import { sentences } from '../teacher/speech.js';

const synth = globalThis.speechSynthesis;
let settings = { get: () => ({}), set: () => {} };
let voicesReady = null;

function loadVoices() {
  if (!synth) return Promise.resolve([]);
  if (!voicesReady) {
    voicesReady = new Promise((resolve) => {
      const v = synth.getVoices();
      if (v.length) return resolve(v);
      synth.addEventListener?.('voiceschanged', () => resolve(synth.getVoices()), { once: true });
      setTimeout(() => resolve(synth.getVoices()), 1500);
    });
  }
  return voicesReady;
}

export async function spanishVoices() {
  const all = await loadVoices();
  return all.filter((v) => /^es\b|^es[-_]/i.test(v.lang)).sort((a, b) => score(b) - score(a));
}
const score = (v) => (/es[-_]ES/i.test(v.lang) ? 4 : 0) + (/google|natural|neural|premium|enhanced/i.test(v.name) ? 2 : 0) + (v.localService ? 1 : 0);

async function chosenVoice() {
  const list = await spanishVoices();
  const want = settings.get().vozNombre;
  return list.find((v) => v.name === want) ?? list[0] ?? null;
}

let token = 0;

export const voice = {
  supported: !!synth,
  /** Conecta con el almacén de ajustes (voz activada, velocidad, nombre de la voz). */
  bind(progress) {
    settings = { get: () => progress.settings(), set: (k, v) => progress.setSetting(k, v) };
  },
  get enabled() { return !!synth && settings.get().voz !== false; },
  setEnabled(on) { settings.set('voz', !!on); if (!on) voice.stop(); },
  get rate() { return settings.get().vozVelocidad ?? 1; },
  setRate(r) { settings.set('vozVelocidad', r); },
  setVoiceName(n) { settings.set('vozNombre', n); },
  get speaking() { return !!synth?.speaking; },

  /** Lee un texto. La promesa se resuelve al terminar (o al cancelarse). */
  async speak(text) {
    if (!synth || !text) return;
    voice.stop();
    const my = ++token;
    const v = await chosenVoice();
    for (const part of sentences(text)) {
      if (my !== token) return;
      await new Promise((resolve) => {
        const u = new SpeechSynthesisUtterance(part);
        u.lang = v?.lang ?? 'es-ES';
        if (v) u.voice = v;
        u.rate = voice.rate;
        // Salvaguarda: si el sintetizador no responde (sin voces, pestaña en segundo plano…), no bloquear.
        const guard = setTimeout(resolve, (part.length / 11 / voice.rate) * 1000 + 2500);
        const done = () => { clearTimeout(guard); resolve(); };
        u.onend = done;
        u.onerror = done;
        synth.speak(u);
      });
    }
  },
  stop() { token++; synth?.cancel(); },
  pause() { synth?.pause(); },
  resume() { synth?.resume(); },
};

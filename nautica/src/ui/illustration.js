// Componente: muestra una o varias ilustraciones de teoría (con botón de sonido si la ilustración lo tiene).
// Si la lámina tiene versión interactiva (src/illustrations/interactivas.js), monta el componente compartido en el modo
// que corresponde a dónde aparece: 'clase' (curso), 'explicacion' (panel del profe) o 'galeria' (por defecto).

import { h } from './dom.js';
import { renderIllustration } from '../illustrations/index.js';
import { interactivaDe } from '../illustrations/interactivas.js';
import { playSignal } from '../illustrations/situations.js';
import { laminaEl } from './lamina.js';

export function illustrationEls(specs, { modo = 'galeria', onRespuesta = null } = {}) {
  const list = (Array.isArray(specs) ? specs : [specs]).filter(Boolean);
  return list.map((spec) => {
    const r = renderIllustration(spec);
    if (!r) return null;
    const def = interactivaDe(spec);
    // La lectura de la lámina ya explica el estado: el pie fijo sobraría.
    if (def) return laminaEl(def, spec, { modo, onRespuesta });
    const box = h('div.il-svg', { html: r.svg });
    return h('figure.il-figure', box,
      r.caption ? h('figcaption', r.caption) : null,
      r.sound ? h('button.small.secondary', { type: 'button', onclick: () => playSignal(r.sound) }, '▶ Escuchar la señal') : null);
  }).filter(Boolean);
}

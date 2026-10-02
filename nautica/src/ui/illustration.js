// Componente: muestra una o varias ilustraciones de teoría (con botón de sonido si la ilustración lo tiene).

import { h } from './dom.js';
import { renderIllustration } from '../illustrations/index.js';
import { playSignal } from '../illustrations/situations.js';

export function illustrationEls(specs) {
  const list = (Array.isArray(specs) ? specs : [specs]).filter(Boolean);
  return list.map((spec) => {
    const r = renderIllustration(spec);
    if (!r) return null;
    const box = h('div.il-svg', { html: r.svg });
    return h('figure.il-figure', box,
      r.caption ? h('figcaption', r.caption) : null,
      r.sound ? h('button.small.secondary', { type: 'button', onclick: () => playSignal(r.sound) }, '▶ Escuchar la señal') : null);
  }).filter(Boolean);
}

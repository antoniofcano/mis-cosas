// Punto único de creación de cartas en las vistas: delega en la carta interactiva con herramientas.

import { interactiveChart } from './chart/interactive-chart.js';
import { h } from './dom.js';

let sharedProgress = null;
export const setSharedProgress = (p) => { sharedProgress = p; };

export function chartWidget(chart, opts = {}) {
  return interactiveChart({ chart, progress: sharedProgress, ...opts });
}

/** ¿Pantalla pequeña (móvil)? La carta se trabaja mejor a partir de 700 px. */
export const pantallaPequena = () => typeof window !== 'undefined' && window.innerWidth < 700;

/** Aviso descartable encima de la carta en el móvil (se recuerda en settings.avisoCartaVisto). */
export function avisoCartaMovil(progress = sharedProgress) {
  if (!pantallaPequena() || progress?.settings().avisoCartaVisto) return null;
  const el = h('div.aviso-carta', { role: 'note' },
    h('p', 'La carta se trabaja mejor en una tableta o un ordenador. En el móvil puedes seguir la resolución paso a paso con el profe.'),
    h('button.small.secondary', { type: 'button', onclick: () => { progress?.setSetting('avisoCartaVisto', true); el.remove(); } }, 'Entendido'));
  return el;
}

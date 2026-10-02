// Punto único de creación de cartas en las vistas: delega en la carta interactiva con herramientas.

import { interactiveChart } from './chart/interactive-chart.js';

let sharedProgress = null;
export const setSharedProgress = (p) => { sharedProgress = p; };

export function chartWidget(chart, opts = {}) {
  return interactiveChart({ chart, progress: sharedProgress, ...opts });
}

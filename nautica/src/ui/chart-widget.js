// Punto único de creación de cartas en las vistas: delega en la carta interactiva con herramientas.

import { interactiveChart } from './chart/interactive-chart.js';
import { h } from './dom.js';
import { conIcono } from './iconos.js';

let sharedProgress = null;
export const setSharedProgress = (p) => { sharedProgress = p; };
/** El progreso de la app (para los ajustes del aparato de las ayudas, sin pasarlo por cada vista). */
export const progresoCompartido = () => sharedProgress;

export function chartWidget(chart, opts = {}) {
  return interactiveChart({ chart, progress: sharedProgress, ...opts });
}

/** ¿Pantalla pequeña (móvil)? La carta se trabaja mejor a partir de 700 px. */
export const pantallaPequena = () => typeof window !== 'undefined' && window.innerWidth < 700;

/** Aviso descartable encima de la carta en el móvil: cómo trabajarla a pantalla completa (se recuerda en settings.avisoCartaVisto). */
export function avisoCartaMovil(progress = sharedProgress) {
  if (!pantallaPequena() || progress?.settings().avisoCartaVisto) return null;
  const el = h('div.aviso-carta', { role: 'note' },
    h('p', 'En el móvil, pulsa ', h('strong', conIcono('pantalla-completa', 'Ampliar')), ' en la barra de la carta para trabajarla a pantalla completa: ocupa todo el móvil, con las herramientas en una barra y el enunciado a un toque. Con el móvil en horizontal cabe más carta. También puedes seguir la resolución paso a paso con el profe.'),
    h('button.small.secondary', { type: 'button', onclick: () => { progress?.setSetting('avisoCartaVisto', true); el.remove(); } }, 'Entendido'));
  return el;
}

/**
 * La burbuja corta junto al botón «Carta» de una pregunta (H-73): dice una sola vez, en el móvil, que la carta se abre a
 * pantalla completa. Se marca como vista (settings.avisoCartaVisto, el mismo ajuste del aviso largo) en cuanto sale: no
 * vuelve en la siguiente pregunta. Se cierra con su «×» o al abrir la carta. null si ya se vio o la pantalla es ancha.
 * @returns {{ el: HTMLElement, cerrar: () => void }|null}
 */
export function burbujaCarta(progress = sharedProgress) {
  if (!pantallaPequena() || progress?.settings().avisoCartaVisto) return null;
  try { progress?.setSetting('avisoCartaVisto', true); } catch { /* sin almacén: no pasa nada */ }
  const cerrar = () => el.remove();
  const el = h('div.burbuja-carta', { id: 'burbuja-carta', role: 'note' },
    h('span', 'Toca para ver la carta a pantalla completa.'),
    h('button.burbuja-cerrar', { type: 'button', 'aria-label': 'Cerrar el aviso', onclick: cerrar }, h('span', { 'aria-hidden': 'true' }, '×')));
  return { el, cerrar };
}

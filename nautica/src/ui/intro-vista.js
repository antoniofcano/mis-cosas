// Introducciones que solo salen enteras la primera vez (H-73): el paso a paso, «Lo hice en papel» y «Trázalo en la carta».
// La primera vez, el texto corto a la vista; después, un «?» plegado que lo vuelve a enseñar. Lo visto se recuerda en un
// ajuste del aparato (`introGuiadoVista`, `introPapelVista`, `introTrazaVista`). Sin ajustes a mano (un test), sale entero.

import { h } from './dom.js';
import { progresoCompartido } from './chart-widget.js';

/** Ajuste donde se recuerda que el alumno ya vio la introducción de cada modo. */
export const CLAVE_INTRO = { guiado: 'introGuiadoVista', papel: 'introPapelVista', traza: 'introTrazaVista' };

/** Los textos, cortos: la regla es una o dos frases (unas 15 palabras). Los formatos de cada dato van de ejemplo en su campo. */
export const TEXTOS_INTRO = {
  guiado: 'Te pido cada paso y te lo corrijo. ¿Atascado? Pide una pista: no cuenta como fallo.',
  papel: 'Resuélvelo en tu hoja y escribe los resultados que tengas. Te digo dónde te desviaste.',
  traza: 'Elige qué trazar y con qué valor; la app lo dibuja exacto.',
};

/**
 * @param {'guiado'|'papel'|'traza'} modo
 * @param {string} [texto]  la introducción (por defecto, la de TEXTOS_INTRO)
 * @returns {HTMLElement}
 */
export function introPlegable(modo, texto = TEXTOS_INTRO[modo]) {
  const progress = progresoCompartido();
  const clave = CLAVE_INTRO[modo];
  const vista = !!(progress && clave && progress.settings()[clave]);
  if (!vista) {
    try { if (progress && clave) progress.setSetting(clave, true); } catch { /* sin almacén: se verá entera otra vez */ }
    return h('p.intro-modo.small.muted', texto);
  }
  return h('details.intro-plegable',
    h('summary', { 'aria-label': '¿Cómo funciona?', title: '¿Cómo funciona?' }, h('span.intro-signo', { 'aria-hidden': 'true' }, '?')),
    h('p.small.muted', texto));
}

// Barra de actividad del modo concentración (clase, tanda de preguntas, examen): botón de salir,
// texto de avance en el centro, un hueco opcional a la derecha (reloj) y barra de progreso.

import { h } from './dom.js';

/**
 * @param {{ texto: string, fraccion?: number, onSalir?: () => void, derecha?: Node }} o
 * @returns {HTMLElement & { set: (texto?: string, fraccion?: number) => void }}
 */
export function barraActividad({ texto, fraccion = 0, onSalir, derecha = null }) {
  const label = h('span.ba-texto', { 'aria-live': 'polite' }, texto);
  const fill = h('span');
  const el = h('div.barra-actividad',
    h('div.ba-fila',
      h('button.ba-salir.secondary', { type: 'button', onclick: () => (onSalir ? onSalir() : (location.hash = '#/')) }, '✕ Salir'),
      label,
      h('span.ba-derecha', derecha)),
    h('div.ba-progreso', fill));
  el.set = (t, f) => {
    if (t != null) label.textContent = t;
    if (f != null) fill.style.width = `${Math.round(Math.max(0, Math.min(1, f)) * 100)}%`;
  };
  el.set(texto, fraccion);
  return el;
}

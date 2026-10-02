// La titulación (PER / PY) es el eje de la app: va en la URL (#/per/…, #/py/…) y se recuerda en los ajustes
// para las vistas compartidas (ejercicios, mesa de cartas, progreso).

import { TITULACIONES } from '../theory/blocks.js';
import { link } from './router.js';
import { h } from './dom.js';

export { TITULACIONES };

/** Titulación activa según los ajustes ('per' por defecto). */
export function currentTit(progress) {
  const l = String(progress.settings().level ?? 'PER').toLowerCase();
  return TITULACIONES[l] ? l : 'per';
}

export function setTit(progress, tit) {
  if (TITULACIONES[tit] && currentTit(progress) !== tit) progress.setSetting('level', TITULACIONES[tit].nivel);
}

/** Enlace dentro de una titulación: tlink('py', ['teoria', 'ut', '3']) → #/py/teoria/ut/3 */
export const tlink = (tit, parts = [], query) => link([tit, ...parts], query);

/**
 * Migas de pan: Inicio › PER › … . Cada elemento es [texto, enlace] o un texto (la página actual).
 * crumbs('py', ['Teoría', tlink('py', ['teoria'])], 'UT3')
 */
export function crumbs(tit, ...items) {
  const T = TITULACIONES[tit];
  const all = [['Inicio', '#/'], T ? [T.sigla, tlink(tit)] : null, ...items].filter(Boolean);
  const out = [];
  all.forEach((it, i) => {
    if (i) out.push(' › ');
    out.push(Array.isArray(it) ? h('a', { href: it[1] }, it[0]) : it);
  });
  return h('nav.crumbs', out);
}

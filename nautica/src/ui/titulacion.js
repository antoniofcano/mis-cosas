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

/** Enlace para volver a la pantalla anterior (un solo nivel): volver('Temario', tlink('per', ['temario'])). */
export function volver(texto, href) {
  return h('nav.crumbs', h('a', { href }, `← ${texto}`));
}

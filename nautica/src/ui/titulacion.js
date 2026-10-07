// La titulación (PER / PY) organiza la app: va en la URL (#/per/…, #/py/…) y se recuerda en los ajustes
// para las vistas compartidas (ejercicios, mesa de cartas, progreso). El eje (la administración examinadora cuyo
// banco de preguntas se estudia) también se recuerda en los ajustes.

import { TITULACIONES } from '../theory/blocks.js';
import { EJE_POR_DEFECTO } from '../bancos/registro.js';
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

/** Eje activo según los ajustes (el de por defecto si no hay; el motor de bancos cae en él si no existe). */
export function currentEje(progress) {
  return progress.settings().eje || EJE_POR_DEFECTO;
}

export function setEje(progress, eje) {
  if (eje && currentEje(progress) !== eje) progress.setSetting('eje', eje);
}

/** Reglas del examen de una titulación: las nacionales y las particulares del tribunal del eje (su ficha). */
export const reglasExamen = (T, ficha) => [...T.reglas, ...(ficha?.examen?.[T.id]?.reglas ?? [])];

/** Enlace dentro de una titulación: tlink('py', ['teoria', 'ut', '3']) → #/py/teoria/ut/3 */
export const tlink = (tit, parts = [], query) => link([tit, ...parts], query);

/** Enlace para volver a la pantalla anterior (un solo nivel): volver('Temario', tlink('per', ['temario'])). */
export function volver(texto, href) {
  return h('nav.crumbs', h('a', { href }, `← ${texto}`));
}

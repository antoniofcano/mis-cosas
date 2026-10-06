// Panel inferior con la corrección (como en las apps actuales): sube desde abajo al responder, dice «Correcto» o
// «No es esa», trae la explicación y un botón «Continuar» del color del resultado. Se queda dentro de la vista que lo
// abre, así que desaparece solo al cambiar de pantalla.

import { h } from './dom.js';
import { icono } from './iconos.js';

/**
 * @param {HTMLElement} donde  contenedor de la vista (el panel va fijo abajo, por encima de todo)
 * @param {{ ok: boolean|null, titulo?: string, contenido: Node|Node[], onContinuar: () => void, boton?: string }} o
 *   ok null = sin juzgar (p. ej. «No la sé»)
 */
export function hojaRespuesta(donde, { ok, titulo, contenido, onContinuar, boton = 'Continuar' }) {
  donde.querySelector(':scope > .hoja')?.remove();
  const tit = titulo ?? (ok ? 'Correcto' : ok === false ? 'No es esa' : 'La respuesta');
  const plegar = h('button.hoja-plegar', { type: 'button', 'aria-expanded': 'true', 'aria-label': 'Plegar la explicación para ver la pregunta',
    onclick: () => { const p = el.classList.toggle('plegada'); plegar.setAttribute('aria-expanded', String(!p)); } });
  const el = h('section.hoja', { class: ok ? 'ok' : ok === false ? 'bad' : '', role: 'region', 'aria-label': tit, tabindex: '-1' },
    plegar,
    h('h3.hoja-titulo', icono(ok ? 'ok' : ok === false ? 'no' : 'bombilla'), tit),
    h('div.hoja-cuerpo', contenido),
    h('button.grande.hoja-continuar', { type: 'button', onclick: () => { el.remove(); onContinuar(); } }, boton));
  donde.append(el);
  document.body.classList.add('con-hoja');
  // Entra desde abajo en el siguiente fotograma (la transición está en el CSS; nada con «reducir movimiento»).
  const sube = () => el.classList.add('arriba');
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => requestAnimationFrame(sube)); else sube();
  const quita = () => { if (!document.querySelector('.hoja')) document.body.classList.remove('con-hoja'); };
  new MutationObserver((_, obs) => { if (!el.isConnected) { quita(); obs.disconnect(); } }).observe(document.body, { childList: true, subtree: true });
  // El foco va al panel (el lector de pantalla lee el resultado y la explicación); con Tab se llega a «Continuar».
  el.focus({ preventScroll: true });
  // Intro con el foco en el panel = «Continuar» (como antes, sin tener que tabular).
  el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target === el) { ev.preventDefault(); el.querySelector('.hoja-continuar').click(); } });
  return el;
}

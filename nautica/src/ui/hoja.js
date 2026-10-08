// Panel inferior con la corrección (como en las apps actuales): sube desde abajo al responder, dice «Correcto» o
// «No es esa», trae la explicación y un botón «Continuar» del color del resultado. Se queda dentro de la vista que lo
// abre, así que desaparece solo al cambiar de pantalla.

import { h } from './dom.js';
import { icono } from './iconos.js';

let nPlegables = 0;

/**
 * Asa para plegar y desplegar un panel que tapa lo que hay debajo (la corrección, el panel de la mesa de cartas, la
 * chuleta): alterna la clase `plegada` del panel y dice su estado con `aria-expanded`. El mismo botón en toda la app.
 * @param {HTMLElement} panel
 * @param {{ plegar?: string, desplegar?: string, plegado?: boolean, onCambio?: (plegado: boolean) => void }} [o]
 *   plegar / desplegar: lo que hace el botón en cada estado (para el lector de pantalla y el texto visible);
 *   textoPlegar: texto visible también con el panel abierto (por defecto solo la raya)
 */
export function botonPlegar(panel, { plegar = 'Plegar la explicación para ver la pregunta', desplegar = 'Desplegar la explicación', textoPlegar = '', plegado = false, onCambio } = {}) {
  if (!panel.id) panel.id = `plegable-${++nPlegables}`;
  const texto = h('span.hoja-plegar-texto');
  const b = h('button.hoja-plegar', { type: 'button', 'aria-controls': panel.id }, texto);
  const pinta = (p) => {
    panel.classList.toggle('plegada', p);
    b.setAttribute('aria-expanded', String(!p));
    b.setAttribute('aria-label', p ? desplegar : plegar);
    b.title = p ? desplegar : plegar;
    texto.textContent = p ? desplegar : textoPlegar;
  };
  pinta(plegado);
  b.addEventListener('click', () => { const p = !panel.classList.contains('plegada'); pinta(p); onCambio?.(p); });
  b.pliega = (p) => pinta(p);
  return b;
}

/**
 * @param {HTMLElement} donde  contenedor de la vista (el panel va fijo abajo, por encima de todo)
 * @param {{ ok: boolean|null, titulo?: string, contenido: Node|Node[], onContinuar: () => void, boton?: string }} o
 *   ok null = sin juzgar (p. ej. «No la sé»)
 */
export function hojaRespuesta(donde, { ok, titulo, contenido, onContinuar, boton = 'Continuar' }) {
  donde.querySelector(':scope > .hoja')?.remove();
  const tit = titulo ?? (ok ? 'Correcto' : ok === false ? 'No es esa' : 'La respuesta');
  const el = h('section.hoja', { class: ok ? 'ok' : ok === false ? 'bad' : '', role: 'region', 'aria-label': tit, tabindex: '-1' },
    h('h3.hoja-titulo', icono(ok ? 'ok' : ok === false ? 'no' : 'bombilla'), tit),
    h('div.hoja-cuerpo', contenido),
    h('button.grande.hoja-continuar', { type: 'button', onclick: () => { el.remove(); onContinuar(); } }, boton));
  // El asa dice qué hace también con la corrección abierta («Ver la pregunta»): la raya sola no se descubre. Al plegar,
  // la pregunta sube a la vista con sus opciones marcadas, y con la hoja plegada el resto de la página no queda tapado.
  el.prepend(botonPlegar(el, {
    desplegar: 'Ver la explicación', textoPlegar: 'Ver la pregunta',
    onCambio: (p) => {
      document.body.classList.toggle('hoja-plegada', p);
      if (p) donde.querySelector('.qcard')?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
    },
  }));
  donde.append(el);
  document.body.classList.add('con-hoja');
  // Entra desde abajo en el siguiente fotograma (la transición está en el CSS; nada con «reducir movimiento»).
  const sube = () => el.classList.add('arriba');
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => requestAnimationFrame(sube)); else sube();
  const quita = () => { if (!document.querySelector('.hoja')) document.body.classList.remove('con-hoja', 'hoja-plegada'); };
  new MutationObserver((_, obs) => { if (!el.isConnected) { quita(); obs.disconnect(); } }).observe(document.body, { childList: true, subtree: true });
  // El foco va al panel (el lector de pantalla lee el resultado y la explicación); con Tab se llega a «Continuar».
  el.focus({ preventScroll: true });
  // Intro con el foco en el panel = «Continuar» (como antes, sin tener que tabular).
  el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target === el) { ev.preventDefault(); el.querySelector('.hoja-continuar').click(); } });
  return el;
}

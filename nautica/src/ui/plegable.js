// Bloque plegable de las pantallas de referencia (H-74): un <details> con su título y, al lado, una línea resumen que dice
// lo que hay dentro sin abrirlo («Carta: máx. 3 fallos · colchón 4»). Se pliega lo que no sirve todavía; no se quita nada.
// `abrirAlImprimir` lo despliega todo mientras se imprime (un <details> cerrado no sale en el papel).

import { h } from './dom.js';

/** `<details class="plegable">` con summary de título + resumen. `abierto`: abierto al pintar. */
export function plegable({ id = null, titulo, resumen = null, abierto = false, clase = '' }, ...hijos) {
  return h(`details.plegable${clase ? `.${clase}` : ''}`, { id, open: abierto },
    h('summary', h('span.plegable-tit', titulo), resumen ? h('span.plegable-res', resumen) : null),
    h('div.plegable-cuerpo', ...hijos));
}

/**
 * Abre todos los <details> de `raiz` al imprimir y los deja como estaban después. Devuelve `{ abrir, restaurar }` para el
 * botón de imprimir (Safari no siempre dispara beforeprint). Se desengancha solo cuando la pantalla ya no está.
 */
export function abrirAlImprimir(raiz) {
  const abiertos = new Set();
  const abrir = () => { for (const d of raiz.querySelectorAll('details')) if (!d.open) { d.open = true; abiertos.add(d); } };
  const restaurar = () => { for (const d of abiertos) d.open = false; abiertos.clear(); };
  const mq = typeof matchMedia === 'function' ? matchMedia('print') : null;
  function quitar() { window.removeEventListener('beforeprint', antes); window.removeEventListener('afterprint', despues); mq?.removeEventListener?.('change', cambio); }
  function antes() { if (!raiz.isConnected) quitar(); else abrir(); }
  function despues() { if (!raiz.isConnected) quitar(); else restaurar(); }
  function cambio(ev) { if (ev.matches) antes(); else despues(); }
  window.addEventListener('beforeprint', antes);
  window.addEventListener('afterprint', despues);
  mq?.addEventListener?.('change', cambio);
  return { abrir, restaurar };
}
